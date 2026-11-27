import { describe, it, expect } from "vitest";
import {
  systemPromptFor,
  promptVersionFor,
  jsonContractFor,
  buildUserContent,
  parseGeneration,
  PROMPT_VERSION,
  GENERAL_PROMPT_VERSION,
  GROUNDING_PROMPT,
  GENERAL_KNOWLEDGE_PROMPT,
  FOLLOWUP_PROMPT,
  FOLLOWUP_PROMPT_VERSION,
  answerSchemaFor,
} from "@/lib/llm/provider";
import type { GenerationRequest } from "@/lib/llm/provider";

/**
 * The prompt contract. `grounded` and `general` are different contracts, not a
 * strictness dial — FR-55 logs the prompt version against every answer, and an
 * auditor has to be able to tell from that field alone whether an answer was
 * source-grounded.
 */

const SOURCE = {
  id: "MPWT-DL-001",
  header: "Ministry of Public Works and Transport — Driver's Licence",
  text: "The renewal fee is 30,000 riel.",
  textKm: "ថ្លៃបន្តគឺ ៣០០០០ រៀល។",
};

function request(over: Partial<GenerationRequest> = {}): GenerationRequest {
  return {
    question: "how do i renew my driving licence",
    lang: "en",
    sources: [SOURCE],
    ...over,
  } as GenerationRequest;
}

describe("prompt selection", () => {
  it("uses the grounding prompt by default", () => {
    expect(systemPromptFor(request())).toBe(GROUNDING_PROMPT);
    expect(systemPromptFor(request({ mode: "grounded" }))).toBe(GROUNDING_PROMPT);
  });

  it("uses the general-knowledge prompt in general mode", () => {
    expect(systemPromptFor(request({ mode: "general" }))).toBe(
      GENERAL_KNOWLEDGE_PROMPT,
    );
  });

  it("versions the two contracts separately (FR-55)", () => {
    expect(promptVersionFor(undefined)).toBe(PROMPT_VERSION);
    expect(promptVersionFor("grounded")).toBe(PROMPT_VERSION);
    expect(promptVersionFor("general")).toBe(GENERAL_PROMPT_VERSION);
    expect(PROMPT_VERSION).not.toBe(GENERAL_PROMPT_VERSION);
  });

  it("gives each mode its own JSON contract instruction", () => {
    expect(jsonContractFor(request({ mode: "general" }))).not.toBe(
      jsonContractFor(request({ mode: "grounded" })),
    );
  });

  it("identifies SuperAsk as a government service in both prompts", () => {
    for (const prompt of [GROUNDING_PROMPT, GENERAL_KNOWLEDGE_PROMPT]) {
      expect(prompt).toMatch(/You are SuperAsk/);
      expect(prompt).toMatch(/independent information assistant/i);
    }
  });
});

describe("buildUserContent — grounded mode", () => {
  it("states the reply language first (FR-08)", () => {
    expect(buildUserContent(request({ lang: "km" })).startsWith("REPLY_LANGUAGE: km")).toBe(
      true,
    );
  });

  it("labels each source with its id, so a citation can be checked against it", () => {
    expect(buildUserContent(request())).toContain("[MPWT-DL-001]");
  });

  it("includes the source header and body", () => {
    const content = buildUserContent(request());
    expect(content).toContain(SOURCE.header);
    expect(content).toContain(SOURCE.text);
  });

  it("labels the Khmer text as the same provision, so official terminology can be lifted", () => {
    // Unlabelled, the model translates the English itself, which is where
    // plausible but unofficial-sounding wording comes from.
    const content = buildUserContent(request());
    expect(content).toContain("Khmer text of the same provision");
    expect(content).toContain(SOURCE.textKm);
  });

  it("omits the Khmer block when the source has none", () => {
    const content = buildUserContent(
      request({ sources: [{ ...SOURCE, textKm: undefined }] }),
    );
    expect(content).not.toContain("Khmer text of the same provision");
  });

  it("carries every source when several are retrieved", () => {
    const second = { ...SOURCE, id: "MPWT-DL-002", text: "A late penalty applies." };
    const content = buildUserContent(request({ sources: [SOURCE, second] }));
    expect(content).toContain("[MPWT-DL-001]");
    expect(content).toContain("[MPWT-DL-002]");
  });

  it("says so explicitly when nothing was retrieved", () => {
    expect(buildUserContent(request({ sources: [] }))).toContain("(no sources retrieved)");
  });

  it("puts the citizen question last, after the sources", () => {
    const content = buildUserContent(request());
    expect(content.indexOf("SOURCES:")).toBeLessThan(content.indexOf("CITIZEN QUESTION:"));
    expect(content.trim().endsWith("how do i renew my driving licence")).toBe(true);
  });
});

describe("buildUserContent — general mode", () => {
  it("omits the SOURCES block entirely rather than sending an empty one", () => {
    // An empty block invites the model to treat the absence as an oversight and
    // cite something anyway.
    const content = buildUserContent(request({ mode: "general", sources: [] }));
    expect(content).not.toContain("SOURCES:");
    expect(content).not.toContain("(no sources retrieved)");
  });

  it("states the situation plainly, which is what the general prompt is written against", () => {
    const content = buildUserContent(request({ mode: "general", sources: [] }));
    expect(content).toContain("NO APPROVED SOURCE COVERS THIS QUESTION");
  });

  it("still states the reply language", () => {
    const content = buildUserContent(request({ mode: "general", sources: [], lang: "km" }));
    expect(content.startsWith("REPLY_LANGUAGE: km")).toBe(true);
  });
});

describe("parseGeneration", () => {
  const ok = JSON.stringify({
    answer: "The renewal fee is 30,000 riel.",
    citations: ["MPWT-DL-001"],
    confidence: "high",
    should_decline: false,
  });

  it("parses clean JSON", () => {
    expect(parseGeneration(ok)).toEqual({
      answer: "The renewal fee is 30,000 riel.",
      citations: ["MPWT-DL-001"],
      confidence: "high",
      shouldDecline: false,
    });
  });

  it("tolerates code fences", () => {
    expect(parseGeneration("```json\n" + ok + "\n```").answer).toContain("30,000 riel");
  });

  it("tolerates a leading preamble", () => {
    expect(parseGeneration("Here is the answer:\n" + ok).answer).toContain("30,000 riel");
  });

  it("takes the outermost object, so nested braces survive", () => {
    const nested = JSON.stringify({
      answer: "See {the annex} for details.",
      citations: ["MPWT-DL-001"],
    });
    expect(parseGeneration(nested).answer).toBe("See {the annex} for details.");
  });

  it("throws rather than fabricating when the output is not JSON", () => {
    expect(() => parseGeneration("I could not answer that.")).toThrow(/not valid JSON/i);
  });

  it("throws when there is no answer field", () => {
    expect(() => parseGeneration(JSON.stringify({ citations: [] }))).toThrow(
      /no answer field/i,
    );
  });

  it("throws on an empty or whitespace-only answer", () => {
    expect(() => parseGeneration(JSON.stringify({ answer: "   " }))).toThrow(
      /no answer field/i,
    );
  });

  it("drops non-string entries from citations", () => {
    const res = parseGeneration(
      JSON.stringify({ answer: "a", citations: ["MPWT-DL-001", 42, null] }),
    );
    expect(res.citations).toEqual(["MPWT-DL-001"]);
  });

  it("defaults an unrecognised confidence to low", () => {
    expect(parseGeneration(JSON.stringify({ answer: "a", citations: ["x"], confidence: "certain" })).confidence).toBe("low");
  });

  describe("grounded mode — rule 4", () => {
    it("declines an answer that rests on nothing, whatever the model claimed", () => {
      const res = parseGeneration(
        JSON.stringify({ answer: "a", citations: [], should_decline: false }),
      );
      expect(res.shouldDecline).toBe(true);
    });

    it("declines when the model asks to, even with citations", () => {
      const res = parseGeneration(
        JSON.stringify({ answer: "a", citations: ["x"], should_decline: true }),
      );
      expect(res.shouldDecline).toBe(true);
    });
  });

  describe("general mode", () => {
    it("discards any citation the model produced — there were no sources to cite", () => {
      const res = parseGeneration(
        JSON.stringify({ answer: "a", citations: ["MPWT-DL-001"] }),
        "general",
      );
      expect(res.citations).toEqual([]);
    });

    it("caps confidence at medium without a source behind it", () => {
      const res = parseGeneration(
        JSON.stringify({ answer: "a", confidence: "high" }),
        "general",
      );
      expect(res.confidence).toBe("medium");
    });

    it("does not decline on empty citations — that is the expected state here", () => {
      const res = parseGeneration(
        JSON.stringify({ answer: "a", citations: [], should_decline: false }),
        "general",
      );
      expect(res.shouldDecline).toBe(false);
    });

    it("still honours the model's own decline", () => {
      const res = parseGeneration(
        JSON.stringify({ answer: "a", should_decline: true }),
        "general",
      );
      expect(res.shouldDecline).toBe(true);
    });
  });
});

/**
 * Follow-up mode: a third contract, for a question about an answer already
 * given. Its version is logged like the others, so an auditor can tell which
 * answers were allowed a plain-language explanation from general knowledge.
 */
describe("follow-up mode", () => {
  const followUp = (over: Partial<GenerationRequest> = {}) =>
    request({
      mode: "followup",
      question: "what does that mean?",
      previousAnswer: "The renewal fee is 30,000 riel.",
      ...over,
    });

  it("runs under its own prompt and its own version", () => {
    expect(systemPromptFor(followUp())).toBe(FOLLOWUP_PROMPT);
    expect(promptVersionFor("followup")).toBe(FOLLOWUP_PROMPT_VERSION);
    expect(FOLLOWUP_PROMPT_VERSION).not.toBe(PROMPT_VERSION);
    expect(FOLLOWUP_PROMPT_VERSION).not.toBe(GENERAL_PROMPT_VERSION);
  });

  it("keeps facts about procedure source-only and forbids new figures", () => {
    expect(FOLLOWUP_PROMPT).toMatch(/ONLY from the SOURCES block or the PREVIOUS ANSWER/);
    expect(FOLLOWUP_PROMPT).toMatch(/Never state a number, rate, amount, date or duration/);
  });

  it("shows the model the sources, the previous answer and the follow-up, each labelled", () => {
    const content = buildUserContent(followUp());
    expect(content).toContain("[MPWT-DL-001]");
    expect(content).toContain("PREVIOUS ANSWER (already given to the citizen):\nThe renewal fee is 30,000 riel.");
    expect(content).toContain("CITIZEN FOLLOW-UP:\nwhat does that mean?");
  });

  it("says so when there are no sources, rather than leaving the block empty", () => {
    expect(buildUserContent(followUp({ sources: [] }))).toContain("(none: use the PREVIOUS ANSWER)");
  });

  it("adds general_knowledge to the output contract, in prose and in the schema", () => {
    expect(jsonContractFor(followUp())).toContain('"general_knowledge": boolean');
    expect(answerSchemaFor(followUp()).required).toContain("general_knowledge");
    expect(answerSchemaFor(request()).required).not.toContain("general_knowledge");
  });

  it("does not decline an answer for citing nothing: a pure explanation has no source", () => {
    const parsed = parseGeneration(
      JSON.stringify({ answer: "In general terms, a doctor's note.", citations: [], confidence: "high", general_knowledge: false, should_decline: false }),
      "followup",
    );
    expect(parsed.shouldDecline).toBe(false);
    // ...but it is general background whatever the model reported.
    expect(parsed.usedGeneralKnowledge).toBe(true);
    // And never high confidence.
    expect(parsed.confidence).toBe("medium");
  });

  it("reports a sourced follow-up as sourced", () => {
    const parsed = parseGeneration(
      JSON.stringify({ answer: "It means you pay 30,000 riel.", citations: ["MPWT-DL-001"], confidence: "medium", general_knowledge: false, should_decline: false }),
      "followup",
    );
    expect(parsed.usedGeneralKnowledge).toBe(false);
    expect(parsed.citations).toEqual(["MPWT-DL-001"]);
  });

  it("honours the model's own decline", () => {
    const parsed = parseGeneration(
      JSON.stringify({ answer: "I cannot explain that.", citations: [], confidence: "low", general_knowledge: false, should_decline: true }),
      "followup",
    );
    expect(parsed.shouldDecline).toBe(true);
  });
});

describe("citation ids", () => {
  it("accepts an id the model wrote with the brackets the SOURCES block shows it in", () => {
    // openai/gpt-5.6-terra-pro in production: every follow-up answer cited
    // "[MPWT-DL-001]" and was withheld as citing a source never retrieved.
    for (const mode of ["grounded", "followup"] as const) {
      const parsed = parseGeneration(
        JSON.stringify({
          answer: "The renewal fee is 30,000 riel.",
          citations: ["[MPWT-DL-001]", " [ MPWT-DL-002 ] ", "MPWT-DL-008"],
          confidence: "medium",
          general_knowledge: false,
          should_decline: false,
        }),
        mode,
      );
      expect(parsed.citations).toEqual(["MPWT-DL-001", "MPWT-DL-002", "MPWT-DL-008"]);
      expect(parsed.shouldDecline).toBe(false);
    }
  });

  it("does not count an empty or bracket-only entry as a citation", () => {
    const parsed = parseGeneration(
      JSON.stringify({ answer: "The fee is 30,000 riel.", citations: ["", "[]"], confidence: "high", should_decline: false }),
    );
    expect(parsed.citations).toEqual([]);
    // Grounded mode, rule 4: an answer resting on nothing is declined.
    expect(parsed.shouldDecline).toBe(true);
  });
});
