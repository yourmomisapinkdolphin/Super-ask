/**
 * Crawl database → knowledge base (§8.6, generic web adapter).
 *
 *   npx tsx scripts/ingest-crawl.ts            (or: npm run ingest-crawl)
 *   npx tsx scripts/ingest-crawl.ts --dry-run  report only, write nothing
 *
 * Reads data/crawl/superask-sites.db (scripts/build-sqlite.ts) and writes one
 * knowledge-base file per ministry/institution:
 *
 *   data/kb/web-<institution folder>.json     e.g. web-13-ministry-of-commerce.json
 *
 * Every run replaces all web-*.json files, so a page that disappears from the
 * crawl disappears from the corpus. Hand-written and per-site ingested files
 * (mpwt-*.json, nbc-*.json, moc-trademark.json, …) are never touched, and a
 * page whose URL one of them already cites is skipped, so curated content is
 * not shadowed by a raw copy of the same page.
 *
 * ── WHAT A WEB CHUNK IS, AND IS NOT ────────────────────────────────────────
 * The verbatim text of an official page, split into passages, with the page
 * URL as its citation. It is NOT steward-approved (stewardApproved: false,
 * §10.5, FR-49), cites no legal instrument (none is read from the page, and an
 * invented one is the FR-45 failure), and its `effective` date is the date the
 * page was fetched, not a date the content took legal effect — the page does
 * not say. Khmer pages put the same verbatim Khmer in `text` and `textKm`, as
 * moc-trademark.json does; English pages fill `text` only. Nothing is
 * translated (corpus.test.ts: no back-translation).
 *
 * FR-44 candidate questions are derived from the page title only. They are a
 * weak stand-in for generated questions and the first thing to improve.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Filters, so the corpus gains content and not noise:
 *   - pages under MIN_PAGE_CHARS of text after menu/footer removal are dropped
 *     (listing pages, login shells, "article being edited" placeholders);
 *   - pages with identical text are kept once (the same notice under /kh and /en
 *     paths, pagination duplicates);
 *   - at most MAX_CHUNKS_PER_PAGE passages per page, so one long news archive
 *     cannot dominate retrieval for a whole institution.
 */

import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DB = join(ROOT, "data", "crawl", "superask-sites.db");
const KB_DIR = join(ROOT, "data", "kb");
const DRY = process.argv.includes("--dry-run");

const MIN_PAGE_CHARS = 300;
const CHUNK_CHARS = 1000;
const MAX_CHUNKS_PER_PAGE = 8;
const REVIEW_DAYS = 90;

/** ISO 3166-2:KH for the provincial sites, so geoScope is not a blanket KH. */
const PROVINCE_ISO: Record<string, string> = {
  "banteaymeanchey.gov.kh": "KH-1", "battambang.gov.kh": "KH-2", "kampongcham.gov.kh": "KH-3",
  "kampongchhnang.gov.kh": "KH-4", "kampongspeu.gov.kh": "KH-5", "kampongthom.gov.kh": "KH-6",
  "kampot.gov.kh": "KH-7", "kandal.gov.kh": "KH-8", "kohkong.gov.kh": "KH-9",
  "kratie.gov.kh": "KH-10", "mondulkiri.gov.kh": "KH-11", "phnompenh.gov.kh": "KH-12",
  "preahvihear.gov.kh": "KH-13", "preyveng.gov.kh": "KH-14", "pursat.gov.kh": "KH-15",
  "ratanakiri.gov.kh": "KH-16", "siemreap.gov.kh": "KH-17", "sihanoukville.gov.kh": "KH-18",
  "stungtreng.gov.kh": "KH-19", "svayrieng.gov.kh": "KH-20", "takeo.gov.kh": "KH-21",
  "oddarmeanchey.gov.kh": "KH-22", "kep.gov.kh": "KH-23", "pailin.gov.kh": "KH-24",
  "tboungkhmum.gov.kh": "KH-25",
};

interface Row {
  page_id: number;
  url: string;
  title: string | null;
  fetched_at: string;
  text: string;
  site_id: string;
  host: string;
  organization: string;
  organization_km: string | null;
  abbreviation: string | null;
  institution: string;
  folder: string;
}

const KHMER = /[ក-៿]/g;
const isKhmer = (s: string) => (s.match(KHMER)?.length ?? 0) > s.length * 0.3;

/** A passage shorter than this after cleaning carries no answer on its own. */
const MIN_PASSAGE_CHARS = 120;

/** Error and not-found pages the crawler stored as if they were content. */
const ERROR_PAGE = /\b(404|page not found|not found!?)\b|ពុំអាចរកឃើញ|រកមិនឃើញទំព័រ/i;

/**
 * Site furniture, not content. Whole short lines are dropped; inside longer
 * lines (many pages are stored as one flattened line) only the phrase is cut,
 * so a paragraph is never thrown away for mentioning a cookie.
 */
const NOISE_LINE =
  /^(skip to (main )?content|toggle navigation|menu|search|home|back to top|share( this)?|print|login|sign in|copyright\b.*|©.*|all rights reserved.*|.*\bcookies?\b.*)$/i;
const NOISE_PHRASE =
  /skip to (main )?content|toggle navigation|back to top|(this (web)?site uses|we use) cookies[^.]*\.?|javascript (is )?(disabled|required)[^.]*\.?|please enable javascript[^.]*\.?|(copyright\s*)?©\s*\d{4}[^.\n]*|all rights reserved\.?/gi;
const MAX_FURNITURE_LINE = 80;

/** Mis-decoded text: U+FFFD, or UTF-8 read as Latin-1 ("Ã©", "â€™"). */
const MOJIBAKE = /\uFFFD|Ã[\u0080-\u00BF]|â€|Â[\u00A0-\u00BF]/;

/** Drop furniture lines before chunking. */
function cleanText(text: string): string {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !(l.length <= MAX_FURNITURE_LINE && NOISE_LINE.test(l)))
    .map((l) => l.replace(NOISE_PHRASE, " ").replace(/\s{2,}/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

/** Words of the URL path, e.g. /services/voter-registration → "voter registration". */
function slugTerms(url: string): string[] {
  try {
    return new URL(url).pathname
      .split("/")
      .map((seg) => decodeURIComponent(seg).replace(/\.(html?|php|aspx?)$/i, ""))
      .map((seg) => seg.replace(/[-_]+/g, " ").trim())
      .filter((seg) => /[a-z]{3,}/i.test(seg) && !/^(kh|km|en|khmer|english|page|index|category|node|\d+)$/i.test(seg));
  } catch {
    return [];
  }
}

/** Already-curated URLs, normalised, from every non-web KB file. */
function curatedUrls(): Set<string> {
  const norm = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const out = new Set<string>();
  for (const f of readdirSync(KB_DIR)) {
    if (!f.endsWith(".json") || f.startsWith("web-")) continue;
    const doc = JSON.parse(readFileSync(join(KB_DIR, f), "utf8")) as {
      chunks: Array<{ url?: string; ingestedFrom?: string }>;
    };
    for (const c of doc.chunks) {
      if (c.url) out.add(norm(c.url));
      if (c.ingestedFrom) out.add(norm(c.ingestedFrom));
    }
  }
  return out;
}

/** Split on line breaks, then on sentence ends, packing up to CHUNK_CHARS. */
function chunkText(text: string): string[] {
  const pieces = text
    .split("\n")
    .flatMap((line) =>
      line.length <= CHUNK_CHARS ? [line] : line.split(/(?<=[។៕.!?])\s+/),
    )
    .flatMap((p) => {
      // A single unbroken run longer than a chunk (common in Khmer, which
      // has no spaces between words): hard-split on the nearest space.
      const out: string[] = [];
      let rest = p;
      while (rest.length > CHUNK_CHARS) {
        const cut = rest.lastIndexOf(" ", CHUNK_CHARS);
        const at = cut > CHUNK_CHARS / 2 ? cut : CHUNK_CHARS;
        out.push(rest.slice(0, at));
        rest = rest.slice(at).trimStart();
      }
      if (rest) out.push(rest);
      return out;
    })
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let cur = "";
  for (const p of pieces) {
    if (cur && cur.length + p.length + 1 > CHUNK_CHARS) {
      chunks.push(cur);
      cur = p;
    } else cur = cur ? `${cur}\n${p}` : p;
  }
  if (cur) chunks.push(cur);
  // A trailing scrap carries no answer on its own; fold it into the previous.
  if (chunks.length > 1 && chunks[chunks.length - 1].length < 200) {
    const tail = chunks.pop()!;
    chunks[chunks.length - 1] += `\n${tail}`;
  }
  return chunks;
}

function questionsFor(title: string, org: string, km: boolean): string[] {
  const t = title.replace(/\s*[|–—-]\s*[^|–—-]*$/, "").trim() || title.trim();
  const qs = [t];
  if (km) qs.push(`${t} ជាអ្វី?`, `ព័ត៌មានអំពី ${t}`);
  else qs.push(`What is ${t}?`, `What does ${org} say about ${t}?`);
  return [...new Set(qs.filter(Boolean))];
}

const addDays = (iso: string, days: number) =>
  new Date(new Date(iso).getTime() + days * 86_400_000).toISOString().slice(0, 10);

function main() {
  if (!existsSync(DB)) {
    console.error("data/crawl/superask-sites.db missing. Run: npm run build-site-db && npm run build-sqlite");
    process.exit(1);
  }
  const db = new DatabaseSync(DB, { readOnly: true });
  const rows = db
    .prepare(`
      SELECT p.id AS page_id, p.url, p.title, p.fetched_at, p.text,
             s.id AS site_id, s.host, s.organization, s.organization_km, s.abbreviation,
             i.name AS institution, i.folder
      FROM pages p
      JOIN sites s ON s.id = p.site_id
      JOIN institutions i ON i.id = s.institution_id
      ORDER BY i.list_order IS NULL, i.list_order, i.name, s.id, p.url`)
    .all() as unknown as Row[];

  // Khmer name per institution: the site that IS the institution, else any.
  const kmByInstitution = new Map<string, string>();
  for (const r of rows) {
    if (!r.organization_km) continue;
    if (r.organization === r.institution || !kmByInstitution.has(r.institution)) {
      kmByInstitution.set(r.institution, r.organization_km);
    }
  }
  db.close();

  const skipUrls = curatedUrls();
  const normUrl = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const seenText = new Set<string>();
  const stats = { pages: rows.length, error: 0, thin: 0, duplicate: 0, curated: 0, kept: 0, chunks: 0, noisy: 0 };

  type Out = { institution: string; folder: string; chunks: Record<string, unknown>[] };
  const byInstitution = new Map<string, Out>();

  for (const r of rows) {
    if (ERROR_PAGE.test(r.text.slice(0, 300))) { stats.error += 1; continue; }
    const text = cleanText(r.text);
    if (text.length < MIN_PAGE_CHARS) { stats.thin += 1; continue; }
    if (skipUrls.has(normUrl(r.url))) { stats.curated += 1; continue; }
    const textKey = createHash("sha256").update(text.replace(/\s+/g, " ")).digest("hex");
    if (seenText.has(textKey)) { stats.duplicate += 1; continue; }
    seenText.add(textKey);
    stats.kept += 1;

    const title = (r.title ?? "").replace(/\s+/g, " ").trim() || r.url;
    const verified = r.fetched_at.slice(0, 10);
    const urlKey = createHash("sha256").update(r.url).digest("hex").slice(0, 8);
    const site = r.site_id.replace("SRC-", "");
    const keywords = [...new Set([r.organization, r.abbreviation, r.organization_km, r.host, r.institution, ...slugTerms(r.url)].filter(Boolean) as string[])];

    const out = byInstitution.get(r.institution) ?? { institution: r.institution, folder: r.folder, chunks: [] };
    byInstitution.set(r.institution, out);

    const passages = chunkText(text)
      .filter((p) => {
        const bad = p.length < MIN_PASSAGE_CHARS || MOJIBAKE.test(p);
        if (bad) stats.noisy += 1;
        return !bad;
      })
      .slice(0, MAX_CHUNKS_PER_PAGE);
    passages.forEach((passage, n) => {
      // Per passage, not per page: a Khmer page often carries English passages
      // (and the reverse), and textKm must hold Khmer only.
      const km = isKhmer(passage);
      out.chunks.push({
        id: `WEB-${site}-${urlKey}-${String(n + 1).padStart(2, "0")}`,
        doc: `${title} — ${r.organization} website`,
        instrument: "Not cited on source page",
        article: "Not cited on source page",
        url: r.url,
        effective: verified,
        effectiveUnknown: true,
        verified,
        reviewDue: addDays(verified, REVIEW_DAYS),
        geoScope: PROVINCE_ISO[r.host] ?? "KH",
        sensitivity: "public",
        stewardApproved: false,
        ingestedAt: new Date().toISOString(),
        ingestedFrom: r.url,
        text: passage,
        ...(km ? { textKm: passage } : {}),
        keywords,
        questions: questionsFor(title, r.organization, isKhmer(title) || km),
      });
      stats.chunks += 1;
    });
  }

  console.log(`pages in database   ${stats.pages}`);
  console.log(`  error / 404 pages ${stats.error}`);
  console.log(`  too thin (<${MIN_PAGE_CHARS})   ${stats.thin}`);
  console.log(`  already curated   ${stats.curated}`);
  console.log(`  duplicate text    ${stats.duplicate}`);
  console.log(`  ingested          ${stats.kept} pages → ${stats.chunks} chunks`);
  console.log(`  passages dropped  ${stats.noisy} (under ${MIN_PASSAGE_CHARS} chars or mis-decoded)`);

  if (DRY) {
    for (const o of byInstitution.values()) console.log(`  ${String(o.chunks.length).padStart(5)}  web-${o.folder.replace("/", "-")}.json`);
    return;
  }

  for (const f of readdirSync(KB_DIR)) if (f.startsWith("web-") && f.endsWith(".json")) rmSync(join(KB_DIR, f));

  for (const o of byInstitution.values()) {
    const file = `web-${o.folder.replace("/", "-")}.json`;
    writeFileSync(
      join(KB_DIR, file),
      JSON.stringify(
        {
          _comment:
            "MACHINE-INGESTED FROM THE CRAWL, NOT STEWARD-APPROVED. Verbatim page text from the institution's own website, split into passages. Generated by scripts/ingest-crawl.ts from data/crawl/superask-sites.db; do not edit by hand — fix the source or the script and re-run.",
          _effectiveNote:
            "`effective` and `verified` are the date the page was fetched, and `effectiveUnknown: true` says so: the pages state no legal effective date, none is invented, and the interface shows the date as \"Page fetched\", never as \"Effective\".",
          _instrumentNote: "No legal instrument is read from these pages; `instrument` and `article` say so rather than guess.",
          _questionsNote: "`questions` are derived from the page title only (weak FR-44 stand-in).",
          ministry: o.institution,
          ministryKm: kmByInstitution.get(o.institution) ?? o.institution,
          chunks: o.chunks,
        },
        null,
        2,
      ) + "\n",
      "utf8",
    );
    console.log(`  ${String(o.chunks.length).padStart(5)}  data/kb/${file}`);
  }
}

main();
