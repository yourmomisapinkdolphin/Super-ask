/**
 * Citizen chat — moved off `/` so the FormKH-style marketing landing can live
 * at the root. Coverage is still derived from the loaded corpus at request time.
 *
 * Also hosts the Telegram Mini App surface (same UI inside Telegram).
 */

import { Chat } from "@/components/chat";
import { TelegramMiniAppBoot } from "@/components/telegram/TelegramMiniAppBoot";
import { getKb } from "@/lib/kb/loader";
import { crawlInstitutions } from "@/lib/retrieval/crawl-index";

export default function ChatPage() {
  const kb = getKb();
  const approved = [
    ...new Set(kb.chunks.filter((c) => !c.superseded).map((c) => c.ministry)),
  ].map((ministry) => {
    const chunk = kb.chunks.find((c) => c.ministry === ministry)!;
    return {
      ministry,
      ministryKm: chunk.ministryKm,
      short: ministry.replace(/^Ministry of\s+/, ""),
    };
  });

  // Institutions SuperAsk has collected website content from. Listed after the
  // ones with approved documents, without repeating any already shown.
  const seen = new Set(approved.map((c) => c.ministry));
  const crawled = crawlInstitutions()
    .filter((s) => !seen.has(s.org) && !seen.has(s.org) && seen.add(s.org))
    .map((s) => ({
      ministry: s.org,
      ministryKm: s.orgKm || s.org,
      short: s.org.replace(/^Ministry of\s+/, ""),
    }))
    .sort((a, b) => a.short.localeCompare(b.short));
  const coverage = [...approved, ...crawled];

  return (
    <>
      <TelegramMiniAppBoot />
      <Chat coverage={coverage} />
    </>
  );
}
