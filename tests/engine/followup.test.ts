import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AskRequest } from "@/lib/types";
import { EXPLAINED_NOTICE } from "@/lib/ui/copy";
import { dropUnsourcedPurpose, stripNotices } from "@/lib/engine/followup";

/**
 * Answering a question about the previous answer.
 *
 * The live failure this pins: after an answer that listed "special
 * depreciation", asking what it means was refused as not a government-service
 * question, and "explain that in simpler words" as having no source.
 *
 * The model is a mocked OpenAI-compatible gateway, so what is tested is the
 * engine around it: which turns reach this path, what the model is shown, and
 * that the gates still hold on what it writes. No network call is made.
 */

const LICENCE_ANSWER =
  "To renew your driving licence, bring your old licence, your national identity card, a certificate of physical fitness and three photographs. The fee is 30,000 riel.";

const HISTORY: NonNullable<AskRequest["history"]> = [
  { role: "user", text: "How do I renew my driving licence?" },
  { role: "assistant", text: LICENCE_ANSWER, tier: 2, sources: ["MPWT-DL-001"] },
];

type Reply = Record<string, unknown>;

let fetchMock: ReturnType<typeof vi.fn>;
/** What the mocked model returns, per prompt contract. */
let replies: { followup: Reply; grounded: Reply };

function sent(call: number): { system: string; user: string; turns: string[] } {
  const body = JSON.parse(fetchMock.mock.calls[call][1].body as string);
  const messages = body.messages as Array<{ role: string; content: string }>;
  return {
    system: messages[0].content,
    user: messages[messages.length - 1].content,
    turns: messages.slice(1, -1).map((m) => m.content),
  };
}

const isFollowUpCall = (system: string) => system.includes("PREVIOUS ANSWER");

async function loadAsk(env: Record<string, string> = {}) {
  vi.resetModules();
  const defaults: Record<string, string> = {
    LLM_PROVIDER: "gateway",
    LLM_GATEWAY_API_KEY: "test-key",
    DIAGNOSTICS_ENABLED: "true",
    GENERAL_FALLBACK_ENABLED: "false",
    WEB_SEARCH_ENABLED: "false",
    RETRIEVAL_MIN_SCORE: "0.20",
    CURATED_MATCH_THRESHOLD: "0.72",
    // No crawl index: these tests are about the approved corpus and the
    // conversation, and must not depend on a build product.
    CRAWL_INDEX_PATH: join(tmpdir(), "no-such-crawl-index.json"),
  };
  for (const [k, v] of Object.entries({ ...defaults, ...env })) vi.stubEnv(k, v);
  return (await import("@/lib/engine")).ask;
}

beforeEach(() => {
  replies = {
    followup: {
      answer:
        "The source lists a certificate of physical fitness among the documents but does not describe it.\n\nIn general terms, it is a note from a doctor confirming that a person is healthy enough to drive.",
      citations: ["MPWT-DL-001"],
      confidence: "high",
      general_knowledge: true,
      should_decline: false,
    },
    grounded: {
      answer: "SuperAsk cannot answer this from an approved source.",
      citations: [],
      confidence: "low",
      should_decline: true,
    },
  };
  fetchMock = vi.fn(async (_url: string, init: { body: string }) => {
    const system = (JSON.parse(init.body).messages[0].content as string) ?? "";
    const payload = isFollowUpCall(system) ? replies.followup : replies.grounded;
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ choices: [{ message: { content: JSON.stringify(payload) } }] }),
      text: async () => "",
    } as unknown as Response;
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("a question about the previous answer", () => {
  it("explains a term the answer used, instead of refusing it as off-domain", async () => {
    const ask = await loadAsk();
    const res = await ask({
      question: "what does certificate of physical fitness mean?",
      history: HISTORY,
    });

    expect(res.tier).toBe(2);
    expect(res.explained).toBe(true);
    expect(res.answer).toContain("In general terms");
    expect(res.diagnostics?.refusalReason).toBe("followup:explained");
    expect(res.diagnostics?.promptVersion).toMatch(/^followup-/);
    // Never better than medium: part of it is not from a source.
    expect(res.diagnostics?.confidence).not.toBe("high");
  });

  it("says which part is general background, in the answer text itself", async () => {
    // Telegram and Messenger render only the string.
    const ask = await loadAsk();
    const res = await ask({ question: "what does physical fitness mean?", history: HISTORY });
    expect(res.answer.endsWith(EXPLAINED_NOTICE.en)).toBe(true);
  });

  it("answers from the sources the previous answer cited, fetched by id", async () => {
    const ask = await loadAsk();
    const res = await ask({ question: "can you explain that in simpler words?", history: HISTORY });

    expect(res.citations.map((c) => c.id)).toEqual(["MPWT-DL-001"]);
    // An approved source stays an approved source.
    expect(res.unreviewed).toBeFalsy();
    expect(res.coverageGap).toBe(false);

    const { system, user } = sent(0);
    expect(isFollowUpCall(system)).toBe(true);
    expect(user).toContain("[MPWT-DL-001]");
    expect(user).toContain("PREVIOUS ANSWER");
    expect(user).toContain("30,000 riel");
    expect(user).toContain("CITIZEN FOLLOW-UP:\ncan you explain that in simpler words?");
  });

  it("is not labelled as general background when it used only the sources", async () => {
    replies.followup = {
      answer: "Put simply: bring your old licence, your identity card, a fitness certificate and photographs, and pay 30,000 riel.",
      citations: ["MPWT-DL-001"],
      confidence: "high",
      general_knowledge: false,
      should_decline: false,
    };
    const ask = await loadAsk();
    const res = await ask({ question: "can you explain that in simpler words?", history: HISTORY });

    expect(res.explained).toBeFalsy();
    expect(res.answer).not.toContain(EXPLAINED_NOTICE.en);
    expect(res.diagnostics?.refusalReason).toBe("followup:grounded");
  });

  it("treats an answer that cites nothing as general background, whatever the model claims", async () => {
    replies.followup = {
      answer: "In general terms, a fitness certificate is a doctor's note saying you are well enough to drive.",
      citations: [],
      confidence: "high",
      general_knowledge: false,
      should_decline: false,
    };
    const ask = await loadAsk();
    const res = await ask({ question: "what does physical fitness mean?", history: HISTORY });

    expect(res.explained).toBe(true);
    expect(res.citations).toEqual([]);
    expect(res.diagnostics?.confidence).toBe("low");
  });

  it("does not let the model see or repeat the engine's notices", async () => {
    replies.followup = {
      ...replies.followup,
      answer: `${replies.followup.answer}\n\n${EXPLAINED_NOTICE.en}`,
    };
    const ask = await loadAsk();
    const res = await ask({
      question: "what does physical fitness mean?",
      history: [
        HISTORY[0],
        { ...HISTORY[1], text: `${LICENCE_ANSWER}\n\n⚠️ One or more sources has passed its review date.` },
      ],
    });

    expect(res.answer.split(EXPLAINED_NOTICE.en)).toHaveLength(2);
    const { user, turns } = sent(0);
    expect(user).not.toContain("⚠️");
    expect(turns.join("\n")).not.toContain("⚠️");
  });
});

describe("what the follow-up path does not loosen", () => {
  it("withholds an explanation that introduces a figure no source contains", async () => {
    replies.followup = {
      answer: "In general terms, a fitness certificate costs about 15,000 riel at a clinic.",
      citations: ["MPWT-DL-001"],
      confidence: "medium",
      general_knowledge: true,
      should_decline: false,
    };
    const ask = await loadAsk();
    const res = await ask({ question: "what does physical fitness mean?", history: HISTORY });

    expect(res.explained).toBeFalsy();
    expect(res.answer).not.toContain("15,000");
  });

  it("sends a draft with invented figures back once, naming them, before giving up", async () => {
    // "Can you give me an example?" is where a model reaches for round numbers.
    const withFigures = {
      answer: "In general terms, imagine a clinic charging 15,000 riel for the check-up.",
      citations: [],
      confidence: "medium",
      general_knowledge: true,
      should_decline: false,
    };
    const inWords = { ...withFigures, answer: "In general terms, imagine a clinic doctor checking your eyesight and signing a short note." };
    let followUpCalls = 0;
    fetchMock.mockImplementation(async (_url: string, init: { body: string }) => {
      const system = JSON.parse(init.body).messages[0].content as string;
      const payload = isFollowUpCall(system)
        ? followUpCalls++ === 0
          ? withFigures
          : inWords
        : replies.grounded;
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ choices: [{ message: { content: JSON.stringify(payload) } }] }),
        text: async () => "",
      } as unknown as Response;
    });

    const ask = await loadAsk();
    const res = await ask({ question: "can you give me an example?", history: HISTORY });

    expect(followUpCalls).toBe(2);
    expect(res.explained).toBe(true);
    expect(res.answer).toContain("checking your eyesight");
    expect(res.answer).not.toContain("15,000");
    const second = sent(1).user;
    expect(second).toContain("REVISION REQUIRED:");
    expect(second).toContain("15000");
  });

  it("asks for one revision only", async () => {
    replies.followup = {
      answer: "In general terms, a fitness certificate costs about 15,000 riel at a clinic.",
      citations: [],
      confidence: "medium",
      general_knowledge: true,
      should_decline: false,
    };
    const ask = await loadAsk();
    await ask({ question: "what does physical fitness mean?", history: HISTORY });
    const followUpCalls = fetchMock.mock.calls.filter((_, i) => isFollowUpCall(sent(i).system));
    expect(followUpCalls).toHaveLength(2);
  });

  it("accepts a figure the previous answer already gave the citizen", async () => {
    replies.followup = {
      answer: "It means you pay 30,000 riel when you hand in the documents.",
      citations: [],
      confidence: "medium",
      general_knowledge: false,
      should_decline: false,
    };
    const ask = await loadAsk();
    const res = await ask({ question: "can you explain that in simpler words?", history: HISTORY });
    expect(res.answer).toContain("30,000 riel");
  });

  it("still refuses a subject the conversation never mentioned, without calling the model", async () => {
    const ask = await loadAsk();
    const res = await ask({ question: "what does tom holland mean?", history: HISTORY });

    expect(res.tier).toBe(3);
    expect(res.diagnostics?.refusalReason).toBe("scope:not_a_service_question");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats a question that names only an attribute as a lookup, resolved against the conversation", async () => {
    // "Explain the penalty" is about the penalty provision, which the sources
    // of the previous answer may not include. Retrieval finds it.
    const ask = await loadAsk();
    const res = await ask({ question: "explain the penalty", history: HISTORY });

    expect(fetchMock.mock.calls.every((_, i) => !isFollowUpCall(sent(i).system))).toBe(true);
    expect(res.diagnostics?.rewrittenQuery).toMatch(/driving licence/i);
  });

  it("removes a purpose the model volunteers for a rule when no source gives one", async () => {
    replies.followup = {
      answer:
        "A certificate of physical fitness is one of the documents you bring. It is designed to ensure that only healthy people drive.\n\nIn general terms, it is a note from a doctor.",
      citations: ["MPWT-DL-001"],
      confidence: "medium",
      general_knowledge: true,
      should_decline: false,
    };
    const ask = await loadAsk();
    const res = await ask({ question: "what does physical fitness mean?", history: HISTORY });

    expect(res.explained).toBe(true);
    expect(res.answer).toContain("one of the documents you bring");
    expect(res.answer).toContain("a note from a doctor");
    expect(res.answer).not.toContain("designed to");
  });

  it("leaves a why-question to the rationale gate", async () => {
    const ask = await loadAsk();
    const res = await ask({ question: "why do I need a fitness certificate?", history: HISTORY });

    expect(res.explained).toBeFalsy();
    expect(fetchMock.mock.calls.every((_, i) => !isFollowUpCall(sent(i).system))).toBe(true);
  });

  it("has nothing to explain when the previous turn was a refusal", async () => {
    const ask = await loadAsk();
    const res = await ask({
      question: "can you explain that in simpler words?",
      history: [
        { role: "user", text: "how do I get a passport?" },
        { role: "assistant", tier: 3, text: "SuperAsk could not find a source that answers this." },
      ],
    });
    expect(res.explained).toBeFalsy();
    expect(fetchMock.mock.calls.every((_, i) => !isFollowUpCall(sent(i).system))).toBe(true);
  });

  it("gives way when the model declines", async () => {
    replies.followup = { answer: "I cannot explain that.", citations: [], confidence: "low", general_knowledge: false, should_decline: true };
    const ask = await loadAsk();
    const res = await ask({ question: "what does physical fitness mean?", history: HISTORY });
    expect(res.explained).toBeFalsy();
    expect(res.answer).not.toContain("I cannot explain that.");
  });

  it("does not explain without a model: the extractive provider can only quote", async () => {
    const ask = await loadAsk({ LLM_PROVIDER: "extractive" });
    const res = await ask({ question: "what does physical fitness mean?", history: HISTORY });
    expect(res.explained).toBeFalsy();
    expect(res.diagnostics?.refusalReason ?? "").not.toMatch(/^followup:/);
  });

  it("is switched off by FOLLOWUP_ENABLED=false", async () => {
    const ask = await loadAsk({ FOLLOWUP_ENABLED: "false" });
    const res = await ask({ question: "can you explain that in simpler words?", history: HISTORY });
    expect(res.explained).toBeFalsy();
    expect(res.diagnostics?.refusalReason ?? "").not.toMatch(/^followup:/);
  });

  it("gives an approved glossary definition before any model explanation", async () => {
    const ask = await loadAsk();
    const res = await ask({ question: "what does prakas mean?", history: HISTORY });
    expect(res.tier).toBe(1);
    expect(res.diagnostics?.provider).toBe("glossary");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("stripNotices", () => {
  it("cuts the answer where the first appended notice begins", () => {
    expect(stripNotices("The fee is 30,000 riel.\n\n⚠️ From an official website, not reviewed.")).toBe(
      "The fee is 30,000 riel.",
    );
    expect(stripNotices(`A doctor's note.\n\n${EXPLAINED_NOTICE.en}\n\n⚠️ Not reviewed.`)).toBe(
      "A doctor's note.",
    );
  });

  it("leaves an answer with no notice alone", () => {
    expect(stripNotices("  The fee is 30,000 riel.  ")).toBe("The fee is 30,000 riel.");
  });
});

describe("dropUnsourcedPurpose", () => {
  const RULE = "A late penalty applies. It is designed to encourage people to renew on time. Ask the office for the amount.";

  it("drops the sentence that asserts a purpose, and keeps the rest", () => {
    expect(dropUnsourcedPurpose(RULE, ["A late penalty applies."])).toBe(
      "A late penalty applies. Ask the office for the amount.",
    );
  });

  it("keeps it when a source the answer rests on does give a reason", () => {
    const source = "A late penalty applies in order to discourage driving on an expired licence.";
    expect(dropUnsourcedPurpose(RULE, [source])).toBe(RULE);
  });

  it("leaves an answer that claims no purpose alone, lists included", () => {
    const answer = "You need:\n- your old licence\n- your identity card";
    expect(dropUnsourcedPurpose(answer, [])).toBe(answer);
  });
});
