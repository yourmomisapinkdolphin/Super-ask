import { describe, it, expect } from "vitest";
import {
  answeredExchanges,
  asksAboutEarlierAnswer,
  clarificationSubject,
  hasClarificationCue,
  namesOnlyAnAttribute,
  referencedExchange,
  type HistoryTurn,
} from "@/lib/engine/followup-intent";
import { cannotAnswer, notAServiceQuestion } from "@/lib/engine/copy";

/**
 * Deciding that a turn is a question about an earlier answer.
 *
 * Both halves of the test matter and each is pinned here: a cue with a subject
 * the conversation never mentioned is not a follow-up (that is how an
 * off-topic question would ride in), and a subject without a cue is an
 * ordinary lookup that retrieval already handles.
 */

const INCENTIVES: HistoryTurn[] = [
  { role: "user", text: "What incentives does a Qualified Investment Project get?" },
  {
    role: "assistant",
    tier: 2,
    sources: ["SRC-055-0187"],
    text: "Qualified Investment Projects (QIPs) are entitled to income tax exemption for up to 9 years or special depreciation, export tax exemption, and value-added tax exemption for local production inputs.",
  },
];

describe("hasClarificationCue", () => {
  it.each([
    "what does special depreciation mean?",
    "can you explain that in simpler words?",
    "tell me more about the export tax exemption",
    "can you give me an example?",
    "i don't understand",
    "what is a QIP?",
    "what's the difference between the two options",
    "តើពន្ធលើតម្លៃបន្ថែមមានន័យដូចម្តេច?",
    "សូមពន្យល់ជាភាសាសាមញ្ញ",
  ])("recognises %s", (q) => {
    expect(hasClarificationCue(q)).toBe(true);
  });

  it.each([
    "how do I renew my driving licence?",
    "where in phnom penh?",
    "who is elon musk?",
    "and for foreigners?",
  ])("does not fire on %s", (q) => {
    expect(hasClarificationCue(q)).toBe(false);
  });

  it('keeps "what is the <attribute>" as a lookup, not a request to explain', () => {
    expect(hasClarificationCue("what is the fee?")).toBe(false);
    expect(hasClarificationCue("what are the required documents?")).toBe(false);
    expect(hasClarificationCue("what is the address of the office")).toBe(false);
  });
});

describe("clarificationSubject", () => {
  it("is what remains once the request-to-explain words are removed", () => {
    expect(clarificationSubject("what does special depreciation mean?")).toHaveLength(2);
    expect(clarificationSubject("can you explain that in simpler words?")).toEqual([]);
    expect(clarificationSubject("can you give me an example?")).toEqual([]);
  });
});

describe("asksAboutEarlierAnswer", () => {
  it("accepts a term the previous answer used", () => {
    expect(asksAboutEarlierAnswer("what does special depreciation mean?", INCENTIVES)).toBe(true);
    expect(asksAboutEarlierAnswer("what is a QIP?", INCENTIVES)).toBe(true);
    expect(asksAboutEarlierAnswer("tell me more about the export tax exemption", INCENTIVES)).toBe(true);
  });

  it("accepts a request with no subject of its own as being about the last answer", () => {
    expect(asksAboutEarlierAnswer("can you explain that in simpler words?", INCENTIVES)).toBe(true);
    expect(asksAboutEarlierAnswer("i don't understand", INCENTIVES)).toBe(true);
  });

  it("rejects a subject the conversation never mentioned", () => {
    expect(asksAboutEarlierAnswer("what does tom holland mean?", INCENTIVES)).toBe(false);
    expect(asksAboutEarlierAnswer("what is bitcoin?", INCENTIVES)).toBe(false);
    expect(asksAboutEarlierAnswer("explain the offside rule", INCENTIVES)).toBe(false);
  });

  it("is not satisfied by one shared word out of several", () => {
    // "tax" is in the answer. Bitcoin mining is not.
    expect(asksAboutEarlierAnswer("explain bitcoin mining tax", INCENTIVES)).toBe(false);
  });

  it("needs a cue: a lookup about the same subject is not a request to explain", () => {
    expect(asksAboutEarlierAnswer("how long is the income tax exemption", INCENTIVES)).toBe(false);
  });

  it("needs an answer to be about: nothing to explain in an empty conversation", () => {
    expect(asksAboutEarlierAnswer("can you explain that in simpler words?", [])).toBe(false);
  });

  it("does not treat a refusal as an answer, by tier", () => {
    const refused: HistoryTurn[] = [
      { role: "user", text: "how do I get a passport" },
      { role: "assistant", tier: 3, text: "Passports are not something SuperAsk has a source for." },
    ];
    expect(asksAboutEarlierAnswer("can you explain that?", refused)).toBe(false);
  });

  it("does not treat a refusal as an answer, by its wording, when no tier was sent", () => {
    for (const text of [cannotAnswer("en"), notAServiceQuestion("en"), cannotAnswer("km")]) {
      const refused: HistoryTurn[] = [
        { role: "user", text: "how do I get a passport" },
        { role: "assistant", text },
      ];
      expect(asksAboutEarlierAnswer("can you explain that?", refused)).toBe(false);
    }
  });
});

describe("referencedExchange — which answer is being asked about", () => {
  const twoAnswers: HistoryTurn[] = [
    ...INCENTIVES,
    { role: "user", text: "tell me more about the export tax exemption" },
    {
      role: "assistant",
      tier: 2,
      sources: ["SRC-055-0045"],
      text: "A QIP may receive an export tax exemption, unless other laws and regulations state otherwise.",
    },
  ];

  it("takes the latest answer for a request with no subject", () => {
    expect(referencedExchange("explain that in simpler words", twoAnswers)?.sources).toEqual([
      "SRC-055-0045",
    ]);
  });

  it("reaches back to the answer that mentioned the term", () => {
    // The export-tax answer never mentions depreciation. The list before it does.
    const found = referencedExchange("what does special depreciation mean?", twoAnswers);
    expect(found?.sources).toEqual(["SRC-055-0187"]);
  });

  it("skips refusals when looking back", () => {
    const withRefusal: HistoryTurn[] = [
      ...INCENTIVES,
      { role: "user", text: "how much is the VAT rate?" },
      { role: "assistant", tier: 3, text: cannotAnswer("en") },
    ];
    expect(answeredExchanges(withRefusal)).toHaveLength(1);
    expect(referencedExchange("can you give me an example?", withRefusal)?.sources).toEqual([
      "SRC-055-0187",
    ]);
  });

  it("does not reach back indefinitely", () => {
    const filler: HistoryTurn[] = Array.from({ length: 4 }, (_, i) => [
      { role: "user" as const, text: `how do I renew my driving licence ${i}` },
      { role: "assistant" as const, tier: 2 as const, text: "Bring your old licence and identity card." },
    ]).flat();
    expect(referencedExchange("what does special depreciation mean?", [...INCENTIVES, ...filler])).toBeNull();
  });
});

describe("namesOnlyAnAttribute", () => {
  it.each(["what is the fee?", "what documents are required?", "explain the penalty", "how much does it cost"])(
    "is true for %s",
    (q) => {
      expect(namesOnlyAnAttribute(q)).toBe(true);
    },
  );

  it.each([
    "what is the fee for a birth certificate?",
    "how do I get married?",
    "how do I renew my driving licence?",
    "where in phnom penh?",
  ])("is false for %s", (q) => {
    expect(namesOnlyAnAttribute(q)).toBe(false);
  });
});
