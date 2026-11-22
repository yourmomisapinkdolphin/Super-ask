/**
 * Knowledge base loader and index cache.
 *
 * The KB is read from data/ at first use and the derived indexes are held in
 * module scope for the process lifetime. Reindexing is a matter of building a
 * fresh instance and swapping the reference, which is what makes NFR-10
 * (reindex without service interruption) achievable: readers keep the old
 * index until the new one is complete.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Chunk } from "@/lib/types";
import { Bm25Index } from "@/lib/retrieval/bm25";
import { VectorIndex } from "@/lib/retrieval/embed";

const DATA_DIR = join(process.cwd(), "data");

interface CuratedAnswer {
  id: string;
  match: string[];
  /** See MatchMode in lib/engine/curated.ts. Defaults to "phrase". */
  matchMode?: "phrase" | "whole";
  answer: { en: string; km: string };
  citations: string[];
}

/** An official term explained in plain language. See lib/engine/glossary.ts. */
export interface GlossaryTerm {
  id: string;
  term: { en: string; km: string };
  /** Surface forms, either script. Matched whole-word for Latin. */
  match: string[];
  definition: { en: string; km: string };
}

export interface Facility {
  id: string;
  ministry: string;
  name: string;
  nameKm: string;
  service: string[];
  province: string;
  address: string;
  hours: string;
  phone: string;
  keywords: string[];
}

export interface Kb {
  chunks: Chunk[];
  byId: Map<string, Chunk>;
  bm25: Bm25Index;
  vectors: VectorIndex;
  curated: CuratedAnswer[];
  glossary: GlossaryTerm[];
  aliases: Record<string, string[]>;
  facilities: Facility[];
  emergency: Array<{ label: string; labelKm: string; number: string }>;
  builtAt: string;
}

function readJson<T>(...segments: string[]): T {
  return JSON.parse(readFileSync(join(DATA_DIR, ...segments), "utf8")) as T;
}

/**
 * Serve passages that no steward has approved (`stewardApproved: false`, i.e.
 * everything §8.6 ingestion produced from a crawl)?
 *
 * On by default, because the crawl is most of the corpus — but every citation
 * of such a passage carries `unreviewed: true` and the interface labels it
 * (lib/engine/citations.ts, SourceCard). Set UNREVIEWED_CONTENT_ENABLED=false
 * to answer from steward-approved and hand-written content only: unreviewed
 * passages stay loaded (so ids still resolve) but are left out of both
 * retrieval indexes.
 */
export function unreviewedContentEnabled(): boolean {
  return (process.env.UNREVIEWED_CONTENT_ENABLED ?? "true").toLowerCase() !== "false";
}

/** True for a passage a steward has not approved. Absent means hand-written. */
export function isUnreviewed(chunk: Pick<Chunk, "stewardApproved">): boolean {
  return chunk.stewardApproved === false;
}

function kbFiles(): string[] {
  return readdirSync(join(DATA_DIR, "kb")).filter((f) => f.endsWith(".json")).sort();
}

/**
 * Identity of the data a build was made from: every file the loader reads,
 * with its size and modification time, plus the switch that changes what is
 * indexed. A different signature means the cached build is stale.
 */
function signature(): string {
  const parts = kbFiles().map((f) => join("kb", f));
  parts.push("curated.json", "glossary.json", "aliases.json", "facilities.json");
  const stats = parts.map((rel) => {
    try {
      const st = statSync(join(DATA_DIR, rel));
      return `${rel}:${st.size}:${st.mtimeMs}`;
    } catch {
      return `${rel}:missing`;
    }
  });
  return `${DATA_DIR}|unreviewed=${unreviewedContentEnabled()}|${stats.join("|")}`;
}

function build(): Kb {
  const files = kbFiles();

  const chunks: Chunk[] = [];
  for (const file of files) {
    const doc = readJson<{
      ministry: string;
      ministryKm: string;
      chunks: Array<Omit<Chunk, "ministry" | "ministryKm">>;
    }>("kb", file);

    for (const c of doc.chunks) {
      chunks.push({ ...c, ministry: doc.ministry, ministryKm: doc.ministryKm });
    }
  }

  const curatedFile = readJson<{ answers: CuratedAnswer[] }>("curated.json");
  const glossaryFile = readJson<{ terms: GlossaryTerm[] }>("glossary.json");
  const aliasFile = readJson<{ aliases: Record<string, string[]> }>(
    "aliases.json",
  );
  const facilityFile = readJson<{
    facilities: Facility[];
    emergency: { numbers: Array<{ label: string; labelKm: string; number: string }> };
    }>("facilities.json");

  const indexed = unreviewedContentEnabled()
    ? chunks
    : chunks.filter((c) => !isUnreviewed(c));

  return {
    chunks,
    byId: new Map(chunks.map((c) => [c.id, c])),
    bm25: new Bm25Index(indexed),
    vectors: new VectorIndex(indexed),
    curated: curatedFile.answers,
    glossary: glossaryFile.terms,
    aliases: aliasFile.aliases,
    facilities: facilityFile.facilities,
    emergency: facilityFile.emergency.numbers,
    builtAt: new Date().toISOString(),
  };
}

/**
 * The cache lives on globalThis, not in module scope. Building the indexes
 * over the full corpus takes seconds, and a module-scope cache is lost every
 * time the module graph is re-evaluated: on Next.js dev reloads, and on every
 * vi.resetModules() in the test suite, which re-imports the engine per
 * configuration. Keyed by signature(), so changed data is never served stale.
 */
const CACHE_KEY = Symbol.for("superask.kb.cache");
type CacheSlot = { kb: Kb; signature: string; checkedAt: number };
/** Re-stat the data files at most this often; getKb() runs many times per request. */
const RECHECK_MS = 2000;
const slot = globalThis as unknown as { [CACHE_KEY]?: CacheSlot };

export function getKb(): Kb {
  const cached = slot[CACHE_KEY];
  const now = Date.now();
  if (cached && now - cached.checkedAt < RECHECK_MS) return cached.kb;
  const sig = signature();
  if (cached && cached.signature === sig) {
    cached.checkedAt = now;
    return cached.kb;
  }
  const kb = build();
  slot[CACHE_KEY] = { kb, signature: sig, checkedAt: Date.now() };
  return kb;
}

/** Rebuild the indexes and swap atomically (NFR-10). */
export function reindex(): Kb {
  const next = build();
  slot[CACHE_KEY] = { kb: next, signature: signature(), checkedAt: Date.now() };
  return next;
}
