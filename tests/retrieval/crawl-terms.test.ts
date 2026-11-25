import { describe, it, expect } from "vitest";
import { termGroups, urlWords } from "@/lib/retrieval/crawl-terms";
import { crawlTokens } from "@/lib/retrieval/crawl-tokens";
import { normalizeFold } from "@/lib/khmer/normalize";

/**
 * data/crawl-terms.json lets an English question find Khmer-only crawled pages.
 * These pin how a question word reaches its group, because a group that is too
 * wide turns a refusal into a wrong answer ("permit" once matched a pesticide
 * fee table for a fishing-permit question).
 */

const groupsFor = (q: string) => termGroups(q, crawlTokens(q));
const formsOf = (q: string, word: string) => {
  const tokens = crawlTokens(q);
  const i = tokens.indexOf(crawlTokens(word)[0]);
  return termGroups(q, tokens)[i].flatMap((g) => g.forms);
};

describe("termGroups", () => {
  it("joins English word forms the stemmer keeps apart", () => {
    // "vote" stems to "vot" and "voter" to "voter": the group joins them.
    expect(formsOf("how do I register to vote", "vote")).toEqual(
      expect.arrayContaining(["voter", "election"]),
    );
    expect(formsOf("how do I register to vote", "register")).toEqual(
      expect.arrayContaining(["registration"]),
    );
  });

  it("adds the Khmer term, so an English question can match a Khmer page", () => {
    expect(formsOf("how do I register to vote", "vote")).toContain(normalizeFold("បោះឆ្នោត"));
    expect(formsOf("how do I register to vote", "register")).toContain(normalizeFold("ចុះឈ្មោះ"));
  });

  it("a two-word form decides the group for both of its words", () => {
    const forms = formsOf("how do i get a work permit", "permit");
    expect(forms).toContain(normalizeFold("ប័ណ្ណការងារ"));
    // Not the business-licence group.
    expect(forms).not.toContain(normalizeFold("អាជ្ញាប័ណ្ណ"));
  });

  it("licence and permit are separate groups, and permit has no Khmer form", () => {
    const permit = formsOf("how do i apply for a fishing permit", "permit");
    expect(permit).not.toContain(normalizeFold("អាជ្ញាប័ណ្ណ"));
    expect(permit.some((f) => /[ក-៿]/.test(f))).toBe(false);
  });

  it("a word with no group gets none", () => {
    expect(groupsFor("purple elephant")).toEqual([[], []]);
  });
});

describe("urlWords", () => {
  it("keeps the English subject of a Khmer page's URL", () => {
    expect(urlWords("https://www.nec.gov.kh/khmer/voter-registration")).toBe("voter registration");
  });

  it("drops site structure, numbers and short words", () => {
    expect(urlWords("https://www.nec.gov.kh/khmer/category/253")).toBe("");
    expect(urlWords("https://example.gov.kh/en/content/2396")).toBe("");
  });

  it("decodes percent-encoded Khmer paths without inventing words", () => {
    expect(urlWords("https://ccfdg.gov.kh/%E1%9E%8A%E1%9E%B8")).toBe("");
  });

  it("tolerates a string that is not a URL", () => {
    expect(urlWords("not a url/voter-list")).toBe("not url voter list");
  });
});
