/**
 * Citation assembly and the FR-29 office block.
 */

import type { Chunk, Citation, Lang } from "@/lib/types";
import { getKb } from "@/lib/kb/loader";
import { freshnessOf } from "./freshness";
import { isSampleContent, isUnreviewed } from "@/lib/kb/loader";
import { contactFor, type OfficeContact } from "@/lib/kb/contacts";

/**
 * Groupings that are not one office: a map search for the name would land on
 * an arbitrary building, which is worse than no link. Their passages still
 * carry the source URL.
 */
const NO_SINGLE_OFFICE = new Set(["provincial and capital administrations"]);

/**
 * Google Maps search URL for an office (REQ-12): the street address the
 * institution publishes when there is one, otherwise its official name.
 */
export function officeMapUrl(ministry: string, contact?: OfficeContact): string | undefined {
  const name = ministry.trim();
  if (!name || NO_SINGLE_OFFICE.has(name.toLowerCase())) return undefined;
  const address = contact?.address ?? contact?.addressKm;
  const place = address ? `${contact!.org}, ${address}` : name;
  const query = /cambodia|kingdom|កម្ពុជា/i.test(place) ? place : `${place}, Cambodia`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function toCitation(chunk: Chunk, lang: Lang): Citation {
  const contact = contactFor(chunk.url);
  return {
    id: chunk.id,
    ministry: chunk.ministry,
    ministryKm: chunk.ministryKm,
    doc: chunk.doc,
    instrument: chunk.instrument,
    article: chunk.article,
    url: chunk.url,
    effective: chunk.effective,
    verified: chunk.verified,
    reviewDue: chunk.reviewDue,
    freshness: freshnessOf(chunk),
    quote: lang === "km" && chunk.textKm ? chunk.textKm : chunk.text,
    ...(isUnreviewed(chunk) || isSampleContent(chunk) ? { unreviewed: true } : {}),
    ...(chunk.origin === "web" ? { web: true } : {}),
    ...(isSampleContent(chunk) ? { sample: true } : {}),
    // Crawl-index and web-search passages carry the fetch date in `effective`.
    ...(chunk.effectiveUnknown || chunk.origin ? { effectiveUnknown: true } : {}),
    ...(officeMapUrl(chunk.ministry, contact) ? { mapUrl: officeMapUrl(chunk.ministry, contact) } : {}),
    ...(contact ? { contact: contactBlock(contact, lang) } : {}),
  };
}


/** The contact details to show, with the address in the reader's script when the page gives both. */
function contactBlock(c: OfficeContact, lang: Lang): NonNullable<Citation["contact"]> {
  const address = lang === "km" ? (c.addressKm ?? c.address) : (c.address ?? c.addressKm);
  return {
    ...(address ? { address } : {}),
    ...(c.phone ? { phone: c.phone } : {}),
    ...(c.hours ? { hours: c.hours } : {}),
    ...(c.email ? { email: c.email } : {}),
    ...(c.note ? { note: c.note } : {}),
    source: c.source,
    collected: c.collected,
  };
}
