import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CrawlIndexFile } from "@/lib/retrieval/crawl-index";
import { crawlTokens } from "@/lib/retrieval/crawl-tokens";
import { UNREVIEWED_NOTICE } from "@/lib/ui/copy";
import { formatTelegramAnswer } from "@/lib/telegram/format";

/**
 * The crawled-website path: consulted only when the approved corpus has no
 * answer, and never served without saying what it is.
 *
 * Runs against a three-passage fixture index rather than the real one, so the
 * suite does not depend on a build product and the assertions do not move when
 * a ministry edits its website.
 */

const PASSAGES: Array<{ site: number; url: string; title: string; text: string }> = [
  {
    site: 0,
    url: "https://tax.example.gov.kh/faq",
    title: "Tax registration FAQ",
    text: "A small taxpayer registers for tax online through the e-registration portal. Tax registration requires the business owner's identity card, the lease agreement for the business premises, and a recent photograph. The registration fee for a small taxpayer is 20,000 riel and the tax registration certificate is issued within 7 working days.",
  },
  {
    site: 0,
    url: "https://tax.example.gov.kh/news",
    title: "News",
    text: "The General Department held its annual meeting on Monday with delegates from every provincial branch attending the opening session and the closing ceremony in Phnom Penh, followed by a tour of the new headquarters building and its training centre.",
  },
  {
    site: 1,
    url: "https://fish.example.gov.kh/permits",
    title: "Fishing permit application",
    text: "To apply for a fishing permit the applicant submits the fishing permit application form to the Fisheries Administration cantonment together with the boat registration card. Fishing permits for family-scale fishing are issued free of charge.",
  },
  {
    site: 2,
    url: "https://hospital.example.gov.kh/appointments",
    title: "Appointments | Calmette Hospital",
    text: "You cannot make an appointment online yet. To make an appointment at Calmette Hospital, call the appointment team on 023 426 948 and they will schedule a time with a doctor.",
  },
];

function fixture(): CrawlIndexFile {
  const sites = [
    { id: "SRC-901", org: "General Department of Taxation", orgKm: "អគ្គនាយកដ្ឋានពន្ធដារ", institution: "General Department of Taxation", host: "tax.example.gov.kh" },
    { id: "SRC-902", org: "Fisheries Administration", orgKm: "រដ្ឋបាលជលផល", institution: "Ministry of Agriculture, Forestry and Fisheries", host: "fish.example.gov.kh" },
    { id: "SRC-903", org: "Calmette Hospital", orgKm: "មន្ទីរពេទ្យកាល់ម៉ែត", institution: "Ministry of Health", host: "hospital.example.gov.kh" },
  ];
  const chunks: CrawlIndexFile["chunks"] = [];
  const docLen: number[] = [];
  const postings: Record<string, number[]> = {};

  PASSAGES.forEach((p, doc) => {
    chunks.push([p.site, `SRC-90${p.site + 1}-000${doc + 1}`, p.url, p.title, "2026-11-12", p.text]);
    const tokens = crawlTokens(`${p.text} ${p.title} ${sites[p.site].org}`);
    docLen.push(tokens.length);
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const [t, f] of tf) (postings[t] ??= []).push(doc, f);
  });

  return { version: 1, builtAt: "2026-11-12T00:00:00.000Z", pages: 4, sites, chunks, docLen, postings };
}

let indexPath = "";

beforeAll(() => {
  indexPath = join(mkdtempSync(join(tmpdir(), "superask-crawl-")), "crawl-index.json");
  writeFileSync(indexPath, JSON.stringify(fixture()));
});

async function loadAsk(env: Record<string, string> = {}) {
  vi.resetModules();
  const defaults: Record<string, string> = {
    LLM_PROVIDER: "extractive",
    DIAGNOSTICS_ENABLED: "true",
    GENERAL_FALLBACK_ENABLED: "false",
    RETRIEVAL_MIN_SCORE: "0.20",
    CURATED_MATCH_THRESHOLD: "0.72",
    CRAWL_KB_ENABLED: "true",
    CRAWL_INDEX_PATH: indexPath,
  };
  for (const [k, v] of Object.entries({ ...defaults, ...env })) vi.stubEnv(k, v);
  return (await import("@/lib/engine")).ask;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("crawled website content — the second corpus", () => {
  it("answers a coverage gap from a crawled page, labelled unreviewed and linked", async () => {
    const ask = await loadAsk();
    const res = await ask({ question: "how do i apply for a fishing permit", history: [] });

    expect(res.tier).toBe(2);
    expect(res.unreviewed).toBe(true);
    expect(res.unverified).toBeFalsy();
    // Still a gap in the approved corpus, which is what the flag reports.
    expect(res.coverageGap).toBe(true);
    expect(res.answer).toContain("Fisheries Administration");
    expect(res.answer).toContain("fishing permit application form");
    expect(res.answer.endsWith(UNREVIEWED_NOTICE.en)).toBe(true);
    // Never the extractive provider's "approved source" lead.
    expect(res.answer).not.toContain("From the approved source");

    expect(res.citations).toHaveLength(1);
    expect(res.citations[0].url).toBe("https://fish.example.gov.kh/permits");
    expect(res.citations[0].unreviewed).toBe(true);
    expect(res.diagnostics?.refusalReason).toBe("fallback:crawled_website");
    expect(res.diagnostics?.confidence).toBe("low");
  });

  it("picks the passage that covers the question, not one that shares a word", async () => {
    const ask = await loadAsk();
    const res = await ask({ question: "what is the tax registration fee for a small taxpayer", history: [] });
    expect(res.unreviewed).toBe(true);
    expect(res.citations[0].url).toBe("https://tax.example.gov.kh/faq");
    expect(res.answer).toContain("20,000 riel");
  });

  it("never displaces an answer the approved corpus has", async () => {
    const ask = await loadAsk();
    const res = await ask({ question: "How do I renew my driving licence?", history: [] });
    expect(res.unreviewed).toBeFalsy();
    expect(res.citations[0].id).toMatch(/^MPWT-DL-/);
    expect(res.citations[0].unreviewed).toBeUndefined();
  });

  it("does not loosen scope: an off-domain question is still refused", async () => {
    const ask = await loadAsk();
    const res = await ask({ question: "what is the capital of france", history: [] });
    expect(res.tier).toBe(3);
    expect(res.unreviewed).toBeFalsy();
    expect(res.diagnostics?.refusalReason).toBe("scope:not_a_service_question");
  });

  it("refuses when no crawled passage covers the question either", async () => {
    const ask = await loadAsk();
    const res = await ask({ question: "how do i apply for a beekeeping subsidy", history: [] });
    expect(res.tier).toBe(3);
    expect(res.unreviewed).toBeFalsy();
    expect(res.citations).toEqual([]);
  });

  it("is switched off by CRAWL_KB_ENABLED=false", async () => {
    const ask = await loadAsk({ CRAWL_KB_ENABLED: "false" });
    const res = await ask({ question: "how do i apply for a fishing permit", history: [] });
    expect(res.tier).toBe(3);
    expect(res.unreviewed).toBeFalsy();
  });

  it("runs without the index file — a checkout that never built it", async () => {
    const ask = await loadAsk({ CRAWL_INDEX_PATH: join(tmpdir(), "no-such-crawl-index.json") });
    const res = await ask({ question: "how do i apply for a fishing permit", history: [] });
    expect(res.tier).toBe(3);
  });

  it("tells a Telegram reader the pages are unreviewed", async () => {
    const ask = await loadAsk();
    const res = await ask({ question: "how do i apply for a fishing permit", history: [] });
    const text = formatTelegramAnswer(res);
    expect(text).toContain("Website pages (not reviewed):");
    expect(text).toContain("https://fish.example.gov.kh/permits");
    expect(text).not.toContain("Official sources:");
  });
});

/**
 * A question admitted to scope by the crawl has to stay in the conversation.
 *
 * It did not. "How do I make an appointment at Calmette Hospital?" has no
 * service vocabulary; the scope screen let it through because the hospital's
 * site has a page about it, and the history filter — a second, vocabulary-only
 * copy of the same decision — then dropped it. Every later turn was processed
 * as the first message of a new conversation, so "how much is a typical
 * consultant fee?" was answered about business consultants and "no, i am
 * asking from calmette" was refused as not a service question.
 */
describe("a conversation about a crawled institution keeps its history", () => {
  const appointment = "How do I make an appointment at Calmette Hospital?";
  const answered = { role: "assistant" as const, text: "Call the appointment team on 023 426 948." };

  it("answers the opening question from the hospital's page", async () => {
    const ask = await loadAsk();
    const res = await ask({ question: appointment, history: [] });
    expect(res.unreviewed).toBe(true);
    expect(res.citations[0].url).toBe("https://hospital.example.gov.kh/appointments");
  });

  it("keeps that turn as history", async () => {
    await loadAsk();
    const { inScopeHistory } = await import("@/lib/engine/guardrails");
    const history = [{ role: "user" as const, text: appointment }, answered];
    expect(inScopeHistory(history)).toEqual(history);
  });

  it("resolves a correction against the conversation instead of refusing it", async () => {
    const ask = await loadAsk();
    const res = await ask({
      question: "no, i am asking from calmette",
      history: [
        { role: "user", text: appointment },
        answered,
        { role: "user", text: "how much is a typical consultant fee?" },
        { role: "assistant", text: "Consultant fees vary." },
      ],
    });
    expect(res.diagnostics?.refusalReason).not.toBe("scope:not_a_service_question");
    expect(res.diagnostics?.rewrittenQuery).toBe(
      "how much is a typical consultant fee? no, i am asking from calmette",
    );
  });

  it("keeps a follow-up that names the institution but uses no service vocabulary", async () => {
    const ask = await loadAsk();
    const res = await ask({
      question: "what time does calmette open?",
      history: [{ role: "user", text: appointment }, answered],
    });
    expect(res.diagnostics?.refusalReason).not.toBe("scope:not_a_service_question");
    expect(res.diagnostics?.rewrittenQuery).toContain("Calmette Hospital");
  });

  it.each(["tom holland from spider man", "no, tell me about tom holland", "how much does tom holland make"])(
    "does not carry the topic onto an unrelated question: %s",
    async (question) => {
      const ask = await loadAsk();
      const res = await ask({ question, history: [{ role: "user", text: appointment }, answered] });
      expect(res.diagnostics?.refusalReason).toBe("scope:not_a_service_question");
    },
  );

  it("does not let an explicitly off-domain turn become the topic", async () => {
    await loadAsk();
    const { inScopeHistory } = await import("@/lib/engine/guardrails");
    expect(
      inScopeHistory([
        { role: "user", text: "translate calmette hospital appointments to english" },
        { role: "assistant", text: "SuperAsk only answers questions about Cambodian government service procedures" },
      ]),
    ).toEqual([]);
  });
});

describe("crawlStats", () => {
  it("reports what is loaded", async () => {
    vi.resetModules();
    vi.stubEnv("CRAWL_INDEX_PATH", indexPath);
    const { crawlStats } = await import("@/lib/retrieval/crawl-index");
    expect(crawlStats()).toMatchObject({ enabled: true, loaded: true, sites: 3, passages: 4 });
  });
});
