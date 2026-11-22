import { describe, it, expect } from "vitest";
import { assess, looksLikeEntityLookup } from "@/lib/engine/topicality";

/**
 * R-07. Retrieval scores similarity; similarity is not aboutness. Each case
 * below named in the module docstring is a bad answer this build actually
 * shipped — they are regression tests, not hypotheticals.
 */

describe("assess — does the source address the question?", () => {
  it("is on topic when the source contains the question's content words", () => {
    const t = assess(
      "how do i renew my driving licence",
      "To renew a driving licence, bring the old licence to an MPWT service centre.",
    );
    expect(t.onTopic).toBe(true);
    expect(t.coverage).toBeGreaterThan(0.34);
  });

  it("catches company registration answered from birth registration", () => {
    const t = assess(
      "how do i register a new company",
      "Birth registration is carried out at the commune administration within 30 days of the birth.",
    );
    expect(t.onTopic).toBe(false);
    expect(t.missing).toContain("company");
  });

  it("catches a passport question answered from the family book", () => {
    const t = assess(
      "how do i apply for a passport for my child",
      "The family book records the members of a household and is issued by the commune.",
    );
    expect(t.onTopic).toBe(false);
    expect(t.missing).toContain("passport");
  });

  it("checks a short question too — every term must appear when there are fewer than MIN_TERMS", () => {
    // This used to report "passport for my child" against the family book as
    // on topic, because two content terms were below the floor and the gate
    // stepped aside. That is the module header's own "passport → family book"
    // failure, and "how do i register to vote" → birth registration shipped
    // the same way. Short questions now need every term in the source.
    const off = assess(
      "passport for my child",
      "The family book records the members of a household.",
    );
    expect(off.onTopic).toBe(false);
    expect(off.missing).toContain("passport");

    const vote = assess(
      "how do i register to vote",
      "Registration of a birth is made at the commune or sangkat administration.",
    );
    expect(vote.onTopic).toBe(false);
    expect(vote.missing).toContain("vote");

    const on = assess(
      "passport for my child",
      "A passport for a child under 18 requires the consent of a parent.",
    );
    expect(on.onTopic).toBe(true);
  });

  it("reports which terms were covered and which were missing", () => {
    const t = assess(
      "what is the driving licence renewal fee",
      "The renewal fee for a driving licence is 30,000 riel.",
    );
    // Matching happens on stems, but the report is in the citizen's own words.
    expect(t.covered).toEqual(expect.arrayContaining(["driving", "licence", "renewal", "fee"]));
    expect(t.missing).toEqual([]);
    expect(t.coverage).toBe(1);
  });

  it("counts a passage's indexed questions and keywords as what it is about", () => {
    // tiers.ts passes them with the text, so a curator-recorded synonym covers
    // the citizen's word: the passage says "vehicle", its questions "motorbike".
    const t = assess(
      "how do i register a motorbike",
      "A vehicle must be registered at the provincial department.\nHow do I register a motorbike in Cambodia?",
    );
    expect(t.onTopic).toBe(true);
  });

  it("stays out of the way only when the question has no content words at all", () => {
    // Nothing to check. Follow-ups reach this gate already resolved against the
    // conversation (tiers.ts assesses the rewritten query), so a bare "and the
    // fee?" with no subject is assessed on its one word: a source without a fee
    // in it does not answer it.
    const none = assess("and that?", "Birth registration at the commune.");
    expect(none.onTopic).toBe(true);
    expect(none.coverage).toBe(1);

    expect(assess("and the fee?", "Birth registration at the commune.").onTopic).toBe(false);
    expect(assess("and the fee?", "The fee is 4,000 riel.").onTopic).toBe(true);
  });

  it("uses substring containment, the lenient direction", () => {
    // The question's term need only appear inside a source word: "renew" is
    // covered by "renewed", "licence" by "licences".
    const t = assess(
      "how do i renew a licence for my vehicle",
      "Vehicle licences are renewed at the department of public works.",
    );
    expect(t.covered).toEqual(expect.arrayContaining(["renew", "licence", "vehicle"]));
    expect(t.onTopic).toBe(true);
  });

  it("does not match in the other direction — a longer query term is not covered by a shorter source word", () => {
    // "registration" is NOT a substring of "register", so a question about
    // registration against a source that only says "register" reads as missing.
    // Worth pinning: the leniency is one-directional and the vocabulary in
    // data/aliases.json is what closes the gap, not this gate.
    const t = assess(
      "what is the company registration deadline",
      "You may register a company at the counter.",
    );
    // "registration" stems to "registrat", which is still not a substring of
    // "register" — the one-directional leniency is unchanged by stemming.
    expect(t.missing).toContain("registration");
  });

  it("works across scripts", () => {
    const t = assess(
      "ខ្ញុំចង់បន្តប័ណ្ណបើកបរ",
      "ការបន្តអាយុកាលប័ណ្ណបើកបរធ្វើនៅក្រសួងសាធារណការ",
    );
    expect(t.onTopic).toBe(true);
  });

  it("returns zero coverage when the source shares nothing", () => {
    const t = assess(
      "how do i register a company in phnom penh",
      "Consumer finance interest rate caps are set by the National Bank.",
    );
    expect(t.coverage).toBe(0);
    expect(t.onTopic).toBe(false);
  });
});

describe("looksLikeEntityLookup — a named thing, not the rule", () => {
  it.each([
    "tell me about Baby Outlet's trademark",
    "is the trademark 'Baby Outlet' registered",
    "who owns this company",
    "look up ACME Trading company registration",
    "information about Baby Outlet trademark",
  ])("detects a register lookup: %s", (q) => {
    expect(looksLikeEntityLookup(q)).toBe(true);
  });

  it.each([
    "how do i register a trademark",
    "what documents do i need to register a company",
    "what is the fee for trademark registration",
    "what is a trademark",
  ])("does not fire on the general procedure question: %s", (q) => {
    expect(looksLikeEntityLookup(q)).toBe(false);
  });

  it("needs a record noun as well as the phrasing", () => {
    // "tell me about" alone is not a register lookup.
    expect(looksLikeEntityLookup("tell me about birth registration deadlines")).toBe(true);
    expect(looksLikeEntityLookup("tell me about the weather")).toBe(false);
  });

  it("works in lower case, because citizens do not capitalise", () => {
    expect(looksLikeEntityLookup("tell me about baby outlet's trademark")).toBe(true);
  });
});
