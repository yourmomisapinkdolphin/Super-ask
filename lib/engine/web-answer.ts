/**
 * Answering from a live web search — the last sourced step before a refusal.
 *
 * Order of trust, and the order the engine tries them in:
 *
 *   1. data/kb/            approved, hand-checked content
 *   2. the crawl database  text collected from 58 official websites, unreviewed
 *   3. this module         pages found by searching the open web, unreviewed
 *
 * It runs only when 1 and 2 could not answer, and only when
 * WEB_SEARCH_ENABLED=true. It never displaces an approved answer.
 *
 * What keeps it honest is the same machinery the crawl path uses: the model is
 * given the fetched passages as its only SOURCES, every answer must cite at
 * least one of them, the verification gate checks figures against the cited
 * text, output moderation runs, and the response carries `unreviewed` and
 * `web` so every interface labels it as a web result and links the pages.
 *
 * The scope screens are unchanged. Off-domain questions were refused before
 * retrieval and never reach here; SuperAsk still does not act as a general
 * search engine.
 */

import type { AskResponse, Chunk, Diagnostics, Lang } from "@/lib/types";
import { WEB_NOTICE } from "@/lib/ui/copy";
import { generate } from "@/lib/llm";
import { trace } from "@/lib/log/trace";
import { searchWeb, webSearchEnabled, type WebResult } from "@/lib/web/search";
import { looksLikeEntityLookup } from "./topicality";
import { verify } from "./verify";
import { moderateOutput } from "./guardrails";
import { toCitation } from "./citations";

const MAX_SOURCES = 4;

const LEAD: Record<Lang, (host: string) => string> = {
  en: (host) => `Closest result found by web search, on ${host}:`,
  km: (host) => `លទ្ធផលជិតបំផុតពីការស្វែងរកលើអ៊ីនធឺណិត នៅលើ ${host}៖`,
};

function toChunk(r: WebResult, n: number, today: string): Chunk {
  return {
    id: `WEB-${n}`,
    ministry: r.host,
    ministryKm: r.host,
    doc: r.title,
    instrument: "Web page (not reviewed)",
    article: r.host,
    url: r.url,
    effective: today,
    verified: today,
    reviewDue: today,
    geoScope: "KH",
    sensitivity: "public",
    stewardApproved: false,
    origin: "web",
    ingestedAt: today,
    ingestedFrom: r.url,
    text: r.text,
    keywords: [],
    questions: [],
  };
}

export interface WebAnswerInput {
  question: string;
  /** The resolved query — follow-ups already rewritten against history. */
  normalisedQuery: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  lang: Lang;
  id: string;
  retrievalDiag: Partial<Diagnostics>;
  finish: (res: AskResponse, diag: Diagnostics) => AskResponse;
  baseDiagnostics: (over: Partial<Diagnostics>) => Diagnostics;
}

export async function tryWebAnswer(input: WebAnswerInput): Promise<AskResponse | null> {
  if (!webSearchEnabled()) return null;
  const { question, lang } = input;

  // A named-entity record lookup has its own answer (the public registers).
  if (looksLikeEntityLookup(question)) return null;

  // A follow-up ("and the fee?") only makes sense as the resolved query.
  const searchText =
    input.normalisedQuery.trim().length > question.trim().length
      ? input.normalisedQuery
      : question;

  const results = await searchWeb(searchText, MAX_SOURCES);
  trace("web", {
    results: results.map((r) => ({ url: r.url, chars: r.text.length })),
  });
  if (results.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  const chunks = results.map((r, i) => toChunk(r, i + 1, today));

  const outcome = await generate({
    question,
    lang,
    history: input.history,
    sources: chunks.map((c) => ({
      id: c.id,
      header: `${c.ministry} — web page "${c.doc}" (${c.url}), found by live web search on ${today}, NOT reviewed`,
      text: c.text,
    })),
  });

  if (outcome.shouldDecline || !outcome.answer) return null;

  const cited = chunks.filter((c) => outcome.citations.includes(c.id));
  if (cited.length === 0) return null;

  // The extractive provider's lead says "From the approved source", which is
  // exactly what this is not. Compose the quote here instead.
  const body =
    outcome.provider.id === "extractive"
      ? `${LEAD[lang](cited[0].ministry)}\n\n${cited[0].text}`
      : outcome.answer;

  const verification = verify(
    body,
    outcome.citations,
    cited.map((c) => ({ id: c.id, text: `${c.text}\n${c.doc}\n${c.ministry}` })),
    chunks.map((c) => c.id),
  );
  trace("web.verify", {
    passed: verification.passed,
    unsupported: [...verification.unsupported, ...verification.invalidCitations],
  });
  if (!verification.passed) return null;

  if (moderateOutput(body)) return null;

  return input.finish(
    {
      id: input.id,
      tier: 2,
      lang,
      answer: `${body}\n\n${WEB_NOTICE[lang]}`,
      citations: cited.map((c) => toCitation(c, lang)),
      // Still a gap in the APPROVED corpus, which is what this flag reports.
      coverageGap: true,
      unreviewed: true,
      web: true,
    },
    input.baseDiagnostics({
      tier: 2,
      ...input.retrievalDiag,
      provider: outcome.provider.id,
      model: outcome.provider.model,
      hosting: outcome.provider.hosting,
      residency: outcome.provider.residency,
      providerFallback: outcome.fallbackReason,
      candidates: chunks.map((c) => ({
        id: c.id,
        lexical: 0,
        dense: 0,
        fused: 0,
        rerank: 0,
        cited: outcome.citations.includes(c.id),
      })),
      verification: { passed: true, unsupported: [] },
      // Never better than low: nobody has reviewed the source.
      confidence: "low",
      refusalReason: "fallback:web_search",
    }),
  );
}
