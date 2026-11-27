/**
 * Is the citizen asking about the answer they were just given?
 *
 * "What does special depreciation mean?", "explain that in simpler words",
 * "tell me more about the export tax exemption". None of these is a new
 * question. Each one points at the previous answer, and the pipeline had no
 * way to say so: the first was refused as not a government-service question
 * (it carries no service vocabulary of its own), the second was rewritten into
 * a query no source matches, and the third was answered again from scratch as
 * though nothing had been said before it.
 *
 * This module only DECIDES. It is deliberately free of retrieval and of the
 * model, because two callers need the same answer and must not drift apart:
 *
 *   lib/engine/guardrails  scope. A clarification of an in-scope answer is in
 *                          scope, whatever words it happens to use.
 *   lib/engine/followup    answering. See there for what is done with it.
 *
 * The test has two halves and needs both. A CUE says the citizen wants
 * something explained rather than looked up. The SUBJECT, whatever is left of
 * the question once the cue words are removed, has to be something the
 * previous exchange actually mentioned. "What does special depreciation mean"
 * passes after an answer that used the phrase; "what does tom holland mean"
 * does not, after any answer, and stays out of scope exactly as before.
 */

import type { Tier } from "@/lib/types";
import { contentTerms } from "@/lib/lang/content";
import { normaliseWord } from "@/lib/lang/stem";
import { isRefusalText } from "./copy";

/** A prior turn as the engine receives it. Only `text` is guaranteed. */
export interface HistoryTurn {
  role?: string;
  text: string;
  /** Tier of an assistant turn, when the client sends it. 3 is a refusal. */
  tier?: Tier;
  /** Ids of the sources an assistant turn cited, when the client sends them. */
  sources?: string[];
}

export interface AnsweredExchange {
  /** What the citizen asked. */
  question: string;
  /** What SuperAsk answered, notices included. */
  answer: string;
  /** Ids of the sources that answer cited. Empty when the client sent none. */
  sources: string[];
}

/**
 * How many answers back a follow-up may reach. A citizen who has asked about
 * two terms from a list goes back to the list for a third; much further than
 * that and the conversation has moved on.
 */
const MAX_LOOKBACK = 3;

/**
 * The recent exchanges in which SuperAsk actually answered, latest first.
 *
 * A refusal is not something to elaborate on: "explain that" after "SuperAsk
 * could not find a source" has nothing to explain. Clients that send `tier`
 * make this exact; for those that do not (and for conversations stored before
 * they did) the refusal copy is recognised by its opening line.
 */
export function answeredExchanges(
  history: HistoryTurn[],
  limit = MAX_LOOKBACK,
): AnsweredExchange[] {
  const out: AnsweredExchange[] = [];
  for (let i = history.length - 1; i >= 1 && out.length < limit; i--) {
    const turn = history[i];
    if (turn.role !== "assistant") continue;
    const asked = history[i - 1];
    if (!asked || asked.role === "assistant") continue;
    if (turn.tier === 3 || isRefusalText(turn.text)) continue;
    if (!turn.text.trim()) continue;
    out.push({
      question: asked.text,
      answer: turn.text,
      sources: Array.isArray(turn.sources) ? turn.sources : [],
    });
  }
  return out;
}

/** The citizen wants something explained, defined, simplified or expanded. */
const CUES: RegExp[] = [
  /\bmean(s|ing|t)?\b/i,
  /\bdefin(e|ition)\b/i,
  /\bstands? for\b/i,
  /\b(explain|clarify|elaborate|rephrase|summari[sz]e)\b/i,
  /\b(tell|say) (me |us )?more\b/i,
  /\bmore (detail|details|info|information|about|on)\b/i,
  /\b(in|with|using) (simple|simpler|plain|easy|easier|other|fewer|short|shorter) (words?|terms|language|english|khmer)\b/i,
  /\b(simpler|simplify|shorter|eli5)\b/i,
  /\b(an |one |some )?examples?\b/i,
  /\bfor instance\b/i,
  /\b(do not|don'?t|did not|didn'?t|cannot|can'?t) (really |quite )?(understand|get (it|that|this)|follow)\b/i,
  /\b(not|un)\s?clear\b/i,
  /\bconfus(ed|ing)\b/i,
  /\bwhat do you mean\b/i,
  /\bdifference between\b/i,
  // Khmer: means, explain, interpret, example, do not understand, easy to
  // understand, summarise, in detail, tell more, what is, differ.
  /(មានន័យ|ន័យ|ពន្យល់|បកស្រាយ|ឧទាហរណ៍|មិនយល់|អត់យល់|ងាយយល់|សាមញ្ញ|សង្ខេប|លម្អិត|បន្ថែមទៀត|ប្រាប់បន្ថែម|ជាអ្វី|ខុសគ្នា)/,
];

/** "What is a QIP?" asks for a meaning. "What is the fee?" does not. */
const WHAT_IS = /^\s*(?:so|and|ok|okay|but|then|wait)?[\s,]*what(?:'s|s| is| are| was| were)\b/i;

/**
 * Attributes of a procedure. A "what is the …" question about one of these is
 * an ordinary lookup, which retrieval already resolves against the earlier
 * turn, verified and cited. It must not be diverted here.
 */
const PROCEDURAL =
  /\b(fees?|costs?|prices?|charges?|amounts?|payments?|documents?|papers?|paperwork|forms?|requirements?|conditions?|deadlines?|address|addresses|locations?|offices?|counters?|hours?|opening|times?|timeline|process|procedures?|steps?|penalt(?:y|ies)|fines?|phone|numbers?|website|link|email)\b/i;

/** Khmer cue words, removed before the subject is read off the question. */
const CUE_WORDS_KM =
  /(តើ|មានន័យ|ន័យ|យ៉ាងដូចម្តេច|យ៉ាងដូចម្ដេច|ដូចម្តេច|ដូចម្ដេច|យ៉ាងណា|ពន្យល់|បកស្រាយ|ឧទាហរណ៍|មិនយល់|អត់យល់|ងាយយល់|សាមញ្ញ|សង្ខេប|លម្អិត|បន្ថែមទៀត|ប្រាប់បន្ថែម|បន្ថែម|គឺជាអ្វី|ជាអ្វី|អ្វី|ខុសគ្នា|ពាក្យ|សូម|ខ្ញុំ|ផង|ទេ|នេះ|នោះ)/g;

/**
 * Words that belong to the request to explain, not to what is being explained.
 * Stemmed the way contentTerms() stems, for the reason given in
 * lib/lang/content.ts: an authored list does not match stemmed tokens.
 */
const CUE_STEMS = new Set(
  [
    "mean", "means", "meaning", "meant", "define", "definition", "stand",
    "stands", "explain", "explanation", "clarify", "elaborate", "rephrase",
    "summarise", "summarize", "summary", "simple", "simpler", "simplify",
    "plain", "easy", "easier", "short", "shorter", "fewer", "other", "word",
    "words", "term", "terms", "language", "english", "khmer", "example",
    "examples", "instance", "understand", "follow", "clear", "unclear",
    "confused", "confusing", "difference", "between", "eli5", "say", "said",
    "mention", "mentioned", "above", "previous", "last", "answer", "part",
    "point", "bit", "really", "quite", "so", "ok", "okay", "wait", "then",
    "like", "first", "second", "third", "fourth", "fifth",
    // What is left of "don't", "didn't", "can't" once the apostrophe splits them.
    "don", "dont", "didn", "didnt", "doesn", "doesnt", "cant", "cannot", "not",
  ].map((w) => normaliseWord(w)),
);

/** True when the question carries a request to explain rather than to look up. */
export function hasClarificationCue(question: string): boolean {
  if (CUES.some((p) => p.test(question))) return true;
  return WHAT_IS.test(question) && !PROCEDURAL.test(question);
}

/** What the question is about, once the request-to-explain words are removed. */
export function clarificationSubject(question: string): string[] {
  const stripped = question.replace(CUE_WORDS_KM, " ");
  return [...new Set(contentTerms(stripped))].filter((t) => !CUE_STEMS.has(t));
}

/**
 * Share of the subject the previous exchange has to have mentioned. Not 1.0,
 * because citizens paraphrase ("the export tax break" for "export tax
 * exemption"); not lower, because one shared word is how "explain bitcoin tax"
 * would ride in on an answer that mentioned tax.
 */
const MIN_SHARED = 0.6;

/**
 * The earlier answer this question asks to have explained, or null.
 *
 * A cue with no subject at all ("explain that in simpler words", "can you give
 * an example?") refers to the answer just given. A cue with a subject refers
 * to the most recent answer that mentions it, which is not always the last:
 * after asking about one item of a list, the citizen asks about the next, and
 * the answer about the first item never mentioned the second.
 */
export function referencedExchange(
  question: string,
  history: HistoryTurn[],
): AnsweredExchange | null {
  if (!hasClarificationCue(question)) return null;
  const recent = answeredExchanges(history);
  if (recent.length === 0) return null;

  const subject = clarificationSubject(question);
  if (subject.length === 0) return recent[0];

  for (const exchange of recent) {
    const mentioned = new Set(
      contentTerms(`${exchange.question}\n${exchange.answer}`),
    );
    const shared = subject.filter((t) => mentioned.has(t)).length;
    if (shared / subject.length >= MIN_SHARED) return exchange;
  }
  return null;
}

/** Is this a request to explain, define, simplify or expand on an earlier answer? */
export function asksAboutEarlierAnswer(
  question: string,
  history: HistoryTurn[],
): boolean {
  return referencedExchange(question, history) !== null;
}

/**
 * Attribute words as contentTerms() produces them. Wider than PROCEDURAL
 * above: that one keeps lookups out of the explanation path, this one decides
 * whether a question names anything besides an attribute.
 */
const ATTRIBUTE_STEMS = new Set(
  [
    "fee", "fees", "cost", "costs", "price", "prices", "charge", "charges",
    "amount", "payment", "pay", "paid", "document", "documents", "paper",
    "papers", "paperwork", "form", "forms", "requirement", "requirements",
    "required", "require", "condition", "conditions", "deadline", "deadlines",
    "address", "office", "offices", "counter", "hour", "hours", "opening",
    "open", "time", "timeline", "process", "procedure", "step", "steps",
    "penalty", "penalties", "fine", "fines", "phone", "number", "website",
    "link", "email", "bring", "apply", "application", "late", "total",
    "official", "current",
  ].map((w) => normaliseWord(w)),
);

/**
 * Does the question name an attribute of a service and nothing else?
 *
 * "What is the fee?", "what documents are required?", "explain the penalty".
 * Each carries service vocabulary, so the scope screen passes it on its own,
 * and retrieval used to take that as a sign it was a new topic: asked straight
 * after a driving-licence answer, "what is the fee?" was searched bare and
 * came back with the birth-registration fee. A fee is always the fee OF
 * something, and when the question does not say of what, the conversation
 * does.
 */
export function namesOnlyAnAttribute(question: string): boolean {
  const terms = [...new Set(contentTerms(question))].filter(
    (t) => !CUE_STEMS.has(t),
  );
  return terms.length > 0 && terms.every((t) => ATTRIBUTE_STEMS.has(t));
}
