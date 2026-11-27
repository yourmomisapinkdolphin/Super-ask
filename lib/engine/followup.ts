/**
 * Answering a question about the previous answer.
 *
 * ── WHAT WAS BROKEN ────────────────────────────────────────────────────────
 * SuperAsk could answer a question and could not discuss its own answer. A
 * real conversation, in order:
 *
 *   "What incentives does a Qualified Investment Project get?"   answered
 *   "What does special depreciation mean?"       refused: not a service question
 *   "Can you explain that in simpler words?"     refused: no source found
 *   "What does value-added tax mean?"            refused: no source found
 *
 * Three different gates, one cause. Every turn was treated as a fresh question
 * to be looked up, and a request to EXPLAIN is not a lookup. The source lists
 * "special depreciation" as an incentive and never defines it, so no amount of
 * retrieval finds an explanation, and the grounded prompt forbids the model
 * from supplying one.
 *
 * ── WHAT THIS DOES ─────────────────────────────────────────────────────────
 * When lib/engine/followup-intent.ts recognises the turn as a question about
 * the last answer, this module answers it from three things:
 *
 *   1. the sources that answer cited, fetched again by id (not re-searched:
 *      "explain that" shares no words with them);
 *   2. the answer itself, which the citizen is looking at;
 *   3. for the plain meaning of a word or a concept, the model's general
 *      knowledge, under FOLLOWUP_PROMPT.
 *
 * ── WHAT IT DOES NOT LOOSEN ────────────────────────────────────────────────
 * The section 12 guardrails and the scope screen have already run. A "why"
 * question never comes here: the rationale gate owns it (lib/engine/
 * rationale.ts), and an invented reason for a government rule is precisely
 * what a general-knowledge explanation would produce. Every figure in the
 * reply must appear in a cited source or in the previous answer, checked by
 * the same verification gate as any other answer, so the model cannot use an
 * "explanation" to introduce a fee, a rate or a deadline. Output moderation
 * runs. An unreviewed source stays labelled unreviewed, and an answer that
 * draws on general knowledge says so (AskResponse.explained).
 *
 * Returns null whenever it has nothing good enough, and the caller carries on
 * through the ordinary pipeline exactly as before.
 */

import type { AskResponse, Chunk, Diagnostics, Lang } from "@/lib/types";
import { EXPLAINED_NOTICE, UNREVIEWED_NOTICE } from "@/lib/ui/copy";
import { generate, FOLLOWUP_PROMPT_VERSION } from "@/lib/llm";
import { trace } from "@/lib/log/trace";
import { getKb, isUnreviewed, sourceStatus } from "@/lib/kb/loader";
import { crawlChunkById, searchCrawl } from "@/lib/retrieval/crawl-index";
import { retrieve } from "@/lib/retrieval";
import {
  clarificationSubject,
  namesOnlyAnAttribute,
  referencedExchange,
  type HistoryTurn,
} from "./followup-intent";
import { explainsRationale, seeksRationale } from "./rationale";
import { looksLikeEntityLookup } from "./topicality";
import { verify } from "./verify";
import { moderateOutput } from "./guardrails";
import { toCitation } from "./citations";
import { MIN_COVERAGE } from "./crawl-topic";

/** Operator switch. On by default; `false` restores lookup-only behaviour. */
export const FOLLOWUP_ENABLED =
  (process.env.FOLLOWUP_ENABLED ?? "true").toLowerCase() !== "false";

/** How many passages the model is given. */
const MAX_SOURCES = 6;
/** How many of those may be newly found for the follow-up itself. */
const MAX_FRESH = 2;

export interface FollowUpInput {
  question: string;
  history: HistoryTurn[];
  lang: Lang;
  id: string;
  finish: (res: AskResponse, diag: Diagnostics) => AskResponse;
  baseDiagnostics: (over: Partial<Diagnostics>) => Diagnostics;
}

/** A source by id, from the approved corpus first and the crawl second. */
function lookup(id: string): Chunk | null {
  const approved = getKb().byId.get(id);
  if (approved) return approved.superseded ? null : approved;
  return crawlChunkById(id);
}

/** Crawled passages that are about `query`, best first. */
function crawlPassages(query: string, limit: number): Chunk[] {
  return searchCrawl(query, limit)
    .filter((h) => h.covered >= 2 && h.coverage >= MIN_COVERAGE)
    .map((h) => h.chunk);
}

/**
 * The decline floor of the approved corpus (FR-16), as lib/engine/tiers.ts
 * reads it. A passage below it is not offered to the model here either.
 */
const RETRIEVAL_MIN_SCORE = Number(process.env.RETRIEVAL_MIN_SCORE ?? "0.20");

/** Approved passages about `query` that clear the floor, best first. */
function approvedPassages(query: string, limit: number): Chunk[] {
  return retrieve(query, [], limit)
    .candidates.filter((c) => c.rerank >= RETRIEVAL_MIN_SCORE)
    .map((c) => c.chunk);
}

/**
 * A sentence that says what a rule is FOR.
 *
 * The rationale gate keeps "why" questions away from this path, but a model
 * explaining a late penalty will volunteer that it "is designed to encourage
 * people to renew on time" without being asked. That is the invented rationale
 * lib/engine/rationale.ts exists to prevent, arriving by another door, and
 * rule 5 of the prompt forbidding it is not the same as it not happening.
 */
const PURPOSE_CLAIM =
  /\b(?:designed|intended|meant) to\b|\baims? to\b|\bthe (?:purpose|rationale|goal|aim|reason) (?:of|for|behind|is)\b|\bin order to\b|\bso as to\b/i;

/**
 * Drop sentences that assert a purpose the sources do not give.
 *
 * Only when nothing the answer rests on states a reason: where a source does,
 * the model may be reporting it, and the sentence stays.
 */
export function dropUnsourcedPurpose(answer: string, grounds: string[]): string {
  if (grounds.some(explainsRationale)) return answer;
  return answer
    .split("\n")
    .map((line) =>
      line
        .split(/(?<=[.!?])\s+/)
        .filter((sentence) => !PURPOSE_CLAIM.test(sentence))
        .join(" "),
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function headerFor(c: Chunk): string {
  if (isUnreviewed(c)) {
    return `${c.ministry} — website page "${c.doc}" (${c.url}), fetched ${c.verified}, NOT reviewed`;
  }
  return c.effectiveUnknown
    ? `${c.ministry} — ${c.doc} (official web page fetched ${c.verified}; no legal instrument or effective date stated)`
    : `${c.ministry} — ${c.doc}, ${c.instrument}, ${c.article} (effective ${c.effective}, verified ${c.verified})`;
}

/**
 * The previous answer as the citizen read it, without the notices the engine
 * appended. Every notice opens a paragraph with a warning or information sign,
 * so the answer proper ends where the first of them begins.
 */
export function stripNotices(answer: string): string {
  const cut = answer.search(/\n\s*\n\s*(?:⚠️|ℹ️)/);
  return (cut === -1 ? answer : answer.slice(0, cut)).trim();
}

/**
 * The sources a follow-up is answered from.
 *
 * Carried sources come first and are never displaced: they are what the
 * answer under discussion was built on. When the client sent no ids, the
 * question that produced the answer is searched again, which finds the same
 * pages because nothing about that search has changed.
 *
 * A follow-up that names something of its own ("tell me more about the export
 * tax exemption") is also searched for directly, because the page that goes
 * into detail on it is often not the page that listed it.
 */
function gatherSources(
  question: string,
  previous: { question: string; sources: string[] },
): Chunk[] {
  const out = new Map<string, Chunk>();
  const add = (c: Chunk | null) => {
    if (c && !out.has(c.id) && out.size < MAX_SOURCES) out.set(c.id, c);
  };

  for (const id of previous.sources) add(lookup(id));
  if (out.size === 0) {
    for (const c of approvedPassages(previous.question, 3)) add(c);
    for (const c of crawlPassages(previous.question, 4)) add(c);
  }

  if (clarificationSubject(question).length >= 2) {
    // The approved corpus is searched with the earlier question attached: its
    // passages are short and a bare term scores below the floor without the
    // service it belongs to.
    const fresh = [
      ...approvedPassages(`${previous.question} ${question}`, MAX_FRESH),
      ...crawlPassages(question, MAX_FRESH),
    ].filter((c) => !out.has(c.id));
    for (const c of fresh.slice(0, MAX_FRESH)) add(c);
  }

  return [...out.values()];
}

export async function tryFollowUp(
  input: FollowUpInput,
): Promise<AskResponse | null> {
  if (!FOLLOWUP_ENABLED) return null;
  const { question, history, lang } = input;

  // "Why" belongs to the rationale gate, and a record lookup to the registers.
  if (seeksRationale(question) || looksLikeEntityLookup(question)) return null;
  // "Explain the penalty" names an attribute of the service and nothing else.
  // That is a lookup: retrieval resolves it against the conversation and finds
  // the provision that states the penalty, which the sources of the previous
  // answer may not include.
  if (namesOnlyAnAttribute(question)) return null;

  const previous = referencedExchange(question, history);
  if (!previous) return null;

  const previousAnswer = stripNotices(previous.answer);
  if (!previousAnswer) return null;

  const chunks = gatherSources(question, previous);
  trace("followup", {
    about: previous.question,
    carried: previous.sources,
    sources: chunks.map((c) => c.id),
  });

  // Notices come off the earlier turns too. Left in, the model reads them as
  // part of how an answer ends and writes one of its own.
  const turns = history.map((t) =>
    t.role === "assistant"
      ? { role: "assistant" as const, text: stripNotices(t.text) }
      : { role: "user" as const, text: t.text },
  );
  const sources = chunks.map((c) => ({
    id: c.id,
    header: headerFor(c),
    text: c.text,
    textKm: c.textKm,
    status: sourceStatus(c),
  }));

  /** One attempt: generate, clean, and check every figure. */
  const attempt = async (revisionNote?: string) => {
    const outcome = await generate({
      question,
      lang,
      history: turns,
      mode: "followup",
      previousAnswer,
      sources,
      revisionNote,
    });

    // A model outage degrades to the extractive provider, which declines a
    // follow-up outright (lib/llm/extractive.ts): it can quote, not explain.
    if (outcome.shouldDecline || !outcome.answer) return null;

    const cited = chunks.filter((c) => outcome.citations.includes(c.id));

    // The notices are the engine's to add, once, below.
    const body = dropUnsourcedPurpose(stripNotices(outcome.answer), [
      previousAnswer,
      ...cited.map((c) => c.text),
    ]);
    if (!body) return null;

    // Every figure must come from a cited source or from the answer already
    // given. The previous answer counts because the citizen is asking about
    // it; it was verified against its own sources when it was written.
    const verification = verify(
      body,
      outcome.citations,
      [
        ...cited.map((c) => ({
          id: c.id,
          text: `${c.text}\n${c.textKm ?? ""}\n${c.ministry}\n${c.ministryKm}`,
        })),
        { id: "previous-answer", text: `${previousAnswer}\n${previous.question}\n${question}` },
      ],
      chunks.map((c) => c.id),
    );
    trace("followup.verify", {
      revised: Boolean(revisionNote),
      passed: verification.passed,
      unsupported: [...verification.unsupported, ...verification.invalidCitations],
    });
    return { outcome, cited, body, verification };
  };

  let draft = await attempt();
  if (!draft) return null;

  // Asked for an example, a model reaches for round numbers: "a chair sold for
  // $10 with $1 of tax". The gate is right to withhold that, since an invented
  // rate in front of a citizen is still an invented rate, but the citizen then
  // got a refusal for asking a reasonable thing. So the draft goes back once,
  // with the figures named, to be written in words. A second failure, or an
  // invented source id, is not retried.
  if (
    !draft.verification.passed &&
    draft.verification.invalidCitations.length === 0 &&
    draft.verification.unsupported.length > 0
  ) {
    draft = await attempt(
      `Your first draft was withheld because it contained figures that are in neither the SOURCES nor the PREVIOUS ANSWER: ${draft.verification.unsupported.join(", ")}. Write the answer again with no number, amount, rate, percentage, date or duration unless it appears in the SOURCES or the PREVIOUS ANSWER. Give examples in words only.`,
    );
    if (!draft) return null;
  }
  if (!draft.verification.passed) return null;

  const { outcome, cited, body } = draft;

  if (moderateOutput(body)) return null;

  const explained = outcome.usedGeneralKnowledge === true;
  const unreviewed = cited.some((c) => isUnreviewed(c));

  // Notices travel in the answer string as well as in the flags, because
  // Telegram and Messenger render only the string. The explained notice goes
  // first so that the interface can peel the source notice off the end.
  const answer = [
    body,
    explained ? EXPLAINED_NOTICE[lang] : "",
    unreviewed ? UNREVIEWED_NOTICE[lang] : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return input.finish(
    {
      id: input.id,
      tier: 2,
      lang,
      answer,
      citations: cited.map((c) => toCitation(c, lang)),
      // Reports a gap in the APPROVED corpus, as the crawl path does.
      coverageGap: unreviewed,
      ...(unreviewed ? { unreviewed: true } : {}),
      ...(explained ? { explained: true } : {}),
    },
    input.baseDiagnostics({
      tier: 2,
      provider: outcome.provider.id,
      model: outcome.provider.model,
      hosting: outcome.provider.hosting,
      residency: outcome.provider.residency,
      providerFallback: outcome.fallbackReason,
      promptVersion: FOLLOWUP_PROMPT_VERSION,
      normalisedQuery: `${previous.question} ${question}`,
      candidates: chunks.map((c) => ({
        id: c.id,
        lexical: 0,
        dense: 0,
        fused: 0,
        rerank: 0,
        cited: outcome.citations.includes(c.id),
      })),
      verification: { passed: true, unsupported: [] },
      // Never better than medium, and low where nobody has reviewed the source.
      confidence: unreviewed || cited.length === 0 ? "low" : outcome.confidence,
      refusalReason: explained ? "followup:explained" : "followup:grounded",
    }),
  );
}
