import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Chunk, AskResponse } from "@/lib/types";
import { allContacts, contactFor } from "@/lib/kb/contacts";
import { toCitation } from "@/lib/engine/citations";
import { formatTelegramAnswer } from "@/lib/telegram/format";

/**
 * data/contacts.json puts phone numbers and addresses in front of citizens, so
 * a wrong one sends someone to the wrong place. These check that every entry
 * says where it came from, and that it is shown only beside pages from the
 * same website.
 */

const registryHosts = new Set(
  (JSON.parse(readFileSync(join(process.cwd(), "data", "sources.json"), "utf8")).sources as Array<{ host: string }>).map(
    (s) => s.host.replace(/^www\./, ""),
  ),
);

describe("data/contacts.json", () => {
  const contacts = allContacts();

  it("has entries", () => {
    expect(contacts.length).toBeGreaterThan(0);
  });

  it.each(contacts.map((c) => [c.host, c] as const))("%s: sourced from its own site, on a dated page", (host, c) => {
    expect(registryHosts.has(host)).toBe(true);
    expect(new URL(c.source).hostname.replace(/^www\./, "")).toBe(host);
    expect(c.collected).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(c.phone || c.address || c.addressKm).toBeTruthy();
  });

  it.each(contacts.filter((c) => c.phone).map((c) => [c.host, c.phone!] as const))(
    "%s: phone has real digits, not a placeholder",
    (_host, phone) => {
      for (const part of phone.split("/")) {
        const digits = part.replace(/\D/g, "");
        // A four-digit hotline (1275, 1266…) is a real number in Cambodia; anything else needs a full number.
        if (/^1\d{3}$/.test(digits)) continue;
        expect(digits.length).toBeGreaterThanOrEqual(8);
        expect(digits).not.toMatch(/^0+$/);
        expect(digits).not.toMatch(/000000/);
      }
    },
  );
});

function chunk(url: string, ministry: string): Chunk {
  return {
    id: "SRC-T-0001", ministry, ministryKm: ministry, doc: "Page", instrument: "Website page (not reviewed)",
    article: "", url, effective: "2026-11-12", verified: "2026-11-12", reviewDue: "2099-01-01", geoScope: "KH",
    sensitivity: "public", text: "Some text.", keywords: [], questions: [], origin: "crawl", effectiveUnknown: true,
  };
}

describe("contacts on citations", () => {
  it("a page on the institution's site carries its published contact", () => {
    const c = toCitation(chunk("https://www.mrd.gov.kh/some/page", "Ministry of Rural Development"), "en");
    expect(c.contact?.phone).toBe("+855 12 669 535");
    expect(c.contact?.source).toBe("https://www.mrd.gov.kh/contact-us-kh/");
    expect(c.contact?.collected).toBe("2026-11-12");
  });

  it("uses the published address for the map link, not just the name", () => {
    const c = toCitation(chunk("https://cdc.gov.kh/invest", "Council for the Development of Cambodia"), "en");
    expect(c.contact?.address).toBe("Government Palace, Sisowath Quay, Wat Phnom, Phnom Penh");
    expect(decodeURIComponent(c.mapUrl!)).toContain("Sisowath Quay");
  });

  it("a page on a subdomain of an approved-corpus ministry carries the ministry's contact", () => {
    const c = toCitation(chunk("https://driverlicense.mpwt.gov.kh/", "Ministry of Public Works and Transport"), "en");
    expect(c.contact?.phone).toBe("1275");
    expect(c.contact?.source).toBe("https://mpwt.gov.kh/kh/home");
  });

  it("shows the Khmer address to a Khmer reader when that is all the page gives", () => {
    const c = toCitation(chunk("https://maff.gov.kh/x", "Ministry of Agriculture, Forestry and Fisheries"), "km");
    expect(c.contact?.address).toContain("មហាវិថីព្រះនរោត្តម");
  });

  it("no contact for a site without one; the map link falls back to the name", () => {
    const c = toCitation(chunk("https://moh.gov.kh/", "Ministry of Health"), "en");
    expect(c.contact).toBeUndefined();
    expect(decodeURIComponent(c.mapUrl!)).toContain("Ministry of Health, Cambodia");
  });

  it("matches subdomains of the institution but not other sites sharing gov.kh", () => {
    expect(contactFor("https://portal.cdc.gov.kh/a")?.host).toBe("cdc.gov.kh");
    expect(contactFor("https://example.gov.kh/")).toBeUndefined();
    expect(contactFor(undefined)).toBeUndefined();
    expect(contactFor("not a url")).toBeUndefined();
  });

  it("Telegram replies include the phone and address", () => {
    const citation = toCitation(chunk("https://cdc.gov.kh/invest", "Council for the Development of Cambodia"), "en");
    const res: AskResponse = {
      id: "x", tier: 2, lang: "en", answer: "Answer.", citations: [citation], coverageGap: true, unreviewed: true,
    };
    const text = formatTelegramAnswer(res);
    expect(text).toContain("Phone: +855 99 799 579");
    expect(text).toContain("Address: Government Palace");
  });
});
