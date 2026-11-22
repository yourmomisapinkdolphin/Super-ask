/**
 * Citation assembly and the FR-29 office block.
 */

import type { Chunk, Citation, Lang } from "@/lib/types";
import { getKb } from "@/lib/kb/loader";
import { freshnessOf } from "./freshness";
import { isSampleContent, isUnreviewed } from "@/lib/kb/loader";

/**
 * Groupings that are not one office: a map search for the name would land on
 * an arbitrary building, which is worse than no link. Their passages still
 * carry the source URL.
 */
const NO_SINGLE_OFFICE = new Set(["provincial and capital administrations"]);

/** Google Maps search URL for an office, by its official name (REQ-12). */
export function officeMapUrl(ministry: string): string | undefined {
  const name = ministry.trim();
  if (!name || NO_SINGLE_OFFICE.has(name.toLowerCase())) return undefined;
  const query = /cambodia|kingdom/i.test(name) ? name : `${name}, Cambodia`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function toCitation(chunk: Chunk, lang: Lang): Citation {
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
    ...(isUnreviewed(chunk) ? { unreviewed: true } : {}),
    ...(isSampleContent(chunk) ? { sample: true } : {}),
    ...(chunk.effectiveUnknown ? { effectiveUnknown: true } : {}),
    ...(officeMapUrl(chunk.ministry) ? { mapUrl: officeMapUrl(chunk.ministry) } : {}),
  };
}

