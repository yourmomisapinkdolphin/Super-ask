/**
 * Office contact details from the institutions' own websites (data/contacts.json).
 *
 * Each entry was copied by hand from the institution's contact page in the
 * crawl, with that page's URL and the date it was collected. A source card
 * shows the entry when the cited page is on the same website, so a citizen
 * reading an answer from the Ministry of Rural Development's site also sees the
 * phone number and address that site publishes. Nothing here is invented: an
 * institution whose contact page states nothing usable has no entry, and its
 * card shows no contact block.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface OfficeContact {
  host: string;
  org: string;
  /** Street address as the page writes it in English, if it does. */
  address?: string;
  /** Street address as the page writes it in Khmer, if it does. */
  addressKm?: string;
  phone?: string;
  hours?: string;
  email?: string;
  /** Which line or office the details belong to, when the page says. */
  note?: string;
  /** The contact page the details were copied from. */
  source: string;
  /** The date that page was collected by the crawler. */
  collected: string;
}

let byHost: Map<string, OfficeContact> | undefined;

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function load(): Map<string, OfficeContact> {
  if (byHost) return byHost;
  byHost = new Map();
  const path = join(process.cwd(), "data", "contacts.json");
  if (!existsSync(path)) return byHost;
  const file = JSON.parse(readFileSync(path, "utf8")) as { contacts: OfficeContact[] };
  for (const c of file.contacts) byHost.set(c.host.replace(/^www\./, ""), c);
  return byHost;
}

/** The published contact details for the website a page is on, if any. */
export function contactFor(url: string | undefined): OfficeContact | undefined {
  if (!url) return undefined;
  const host = hostOf(url);
  if (!host) return undefined;
  const map = load();
  // A page on a subdomain ("www.x.gov.kh", "portal.x.gov.kh") is the same institution.
  for (let h = host; h.includes("."); h = h.slice(h.indexOf(".") + 1)) {
    const hit = map.get(h);
    if (hit) return hit;
    if (h.split(".").length <= 3) break;
  }
  return undefined;
}

/** Every entry, for the integrity test. */
export function allContacts(): OfficeContact[] {
  return [...load().values()];
}
