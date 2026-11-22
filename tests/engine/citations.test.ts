import { describe, it, expect, afterEach, vi } from "vitest";
import type { Chunk } from "@/lib/types";
import { officeMapUrl, toCitation } from "@/lib/engine/citations";
import { formatTelegramAnswer } from "@/lib/telegram/format";

/**
 * Citations must say whether a person has reviewed the passage (Citation.unreviewed)
 * and point to the responsible office on a map (UC-7, REQ-12).
 */

function chunk(over: Partial<Chunk> = {}): Chunk {
  return {
    id: "T-1",
    ministry: "Ministry of Public Works and Transport",
    ministryKm: "ក្រសួងសាធារណការ និងដឹកជញ្ជូន",
    doc: "Driving licence",
    instrument: "Web page",
    article: "",
    url: "https://www.mpwt.gov.kh/",
    effective: "2026-11-13",
    verified: "2026-11-13",
    reviewDue: "2099-01-01",
    geoScope: "KH",
    sensitivity: "public",
    text: "Renewal requires the old licence.",
    keywords: [],
    questions: [],
    ...over,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("unreviewed marker", () => {
  it("marks a crawled page or web-search result", () => {
    expect(toCitation(chunk({ origin: "crawl" }), "en").unreviewed).toBe(true);
    const web = toCitation(chunk({ origin: "web" }), "en");
    expect(web.unreviewed).toBe(true);
    expect(web.web).toBe(true);
  });

  it("does not mark a curated data/kb passage, whatever its stewardApproved flag", () => {
    expect(toCitation(chunk({ stewardApproved: false }), "en").unreviewed).toBeUndefined();
    expect(toCitation(chunk(), "en").unreviewed).toBeUndefined();
  });

  it("says so in a Telegram reply", () => {
    const text = formatTelegramAnswer({
      id: "a",
      tier: 2,
      lang: "en",
      answer: "Bring the old licence.",
      citations: [toCitation(chunk({ origin: "crawl" }), "en")],
      coverageGap: false,
    });
    expect(text).toContain("not yet reviewed");
    expect(text).toContain("Office on map: https://www.google.com/maps/search/");
  });
});

describe("sample content and unstated effective dates", () => {
  it("marks quarantined sample content as sample", () => {
    const c = toCitation(
      chunk({ doc: "[SAMPLE] Civil Registration Procedure", instrument: "Sub-Decree No. XXX ANK-BK" }),
      "en",
    );
    expect(c.sample).toBe(true);
  });

  it("does not mark real content as sample", () => {
    expect(toCitation(chunk(), "en").sample).toBeUndefined();
  });

  it("carries effectiveUnknown so the card shows a fetch date, not an effective date", () => {
    expect(toCitation(chunk({ effectiveUnknown: true }), "en").effectiveUnknown).toBe(true);
    expect(toCitation(chunk(), "en").effectiveUnknown).toBeUndefined();
  });

  it("labels sample data and hides the 'Not cited' placeholder in Telegram", () => {
    const text = formatTelegramAnswer({
      id: "a",
      tier: 2,
      lang: "en",
      answer: "x",
      citations: [
        toCitation(chunk({ doc: "[SAMPLE] Birth", instrument: "Sub-Decree No. XXX", stewardApproved: false }), "en"),
        toCitation(
          chunk({ doc: "Notice page", instrument: "Not cited on source page", article: "Not cited on source page" }),
          "en",
        ),
      ],
      coverageGap: false,
    });
    expect(text).toContain("SAMPLE data, not official");
    expect(text).not.toContain("Not cited on source page");
    expect(text).toContain("Notice page");
  });
});

describe("office map link", () => {
  it("searches the ministry's official name in Cambodia", () => {
    const url = officeMapUrl("Ministry of Commerce");
    expect(url).toBe(
      "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("Ministry of Commerce, Cambodia"),
    );
  });

  it("does not append the country twice", () => {
    expect(officeMapUrl("Supreme Court of Cambodia")).toContain(
      encodeURIComponent("Supreme Court of Cambodia"),
    );
    expect(officeMapUrl("Supreme Court of Cambodia")).not.toContain("Cambodia%2C");
  });

  it("gives no link for a grouping that is not one office", () => {
    expect(officeMapUrl("Provincial and Capital Administrations")).toBeUndefined();
  });

  it("gives no link without a name, rather than a search for nothing", () => {
    expect(officeMapUrl("  ")).toBeUndefined();
  });

  it("is attached to every citation with a ministry", () => {
    expect(toCitation(chunk(), "en").mapUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search\//);
  });
});
