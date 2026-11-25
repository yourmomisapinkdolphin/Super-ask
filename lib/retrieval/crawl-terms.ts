/**
 * Cross-language and word-form expansion for searching the crawled websites.
 *
 * Most crawled sites publish in Khmer only. An English question such as "how
 * do I register to vote" shares no word with the National Election Committee's
 * Khmer voter-registration page, so the crawl search could not find it, and
 * the stemmer does not join "vote" to "voter" or "register" to "registration"
 * either. data/crawl-terms.json lists, for common service words, the English
 * forms and the Khmer term; a question that uses one form also searches for the
 * others.
 *
 * This only decides which crawled pages are FOUND. It does not change an
 * answer's text, and the approved-corpus retrieval in lib/retrieval/index.ts
 * does not use it.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { normalizeFold } from "@/lib/khmer/normalize";
import { crawlTokens } from "./crawl-tokens";

interface TermFile {
  groups: Array<{ en: string[]; km: string[] }>;
}

export interface TermGroup {
  /** Index tokens of every form, English and Khmer, for the BM25 query. */
  tokens: string[];
  /** Every form folded, for the "does this passage mention it" check. */
  forms: string[];
}

interface Loaded {
  /** Single-word English form → its group. */
  byToken: Map<string, TermGroup>;
  /** Multi-word English forms ("work permit"), folded, with their group. */
  phrases: Array<{ phrase: string; words: string[]; group: TermGroup }>;
}

let loaded: Loaded | undefined;

function load(): Loaded {
  if (loaded) return loaded;
  loaded = { byToken: new Map(), phrases: [] };
  const path = join(process.cwd(), "data", "crawl-terms.json");
  if (!existsSync(path)) return loaded;
  const file = JSON.parse(readFileSync(path, "utf8")) as TermFile;
  for (const g of file.groups) {
    const all = [...g.en, ...g.km];
    const group: TermGroup = {
      tokens: [...new Set(all.flatMap((w) => crawlTokens(w)))],
      forms: [...new Set(all.map((w) => normalizeFold(w)))],
    };
    for (const w of g.en) {
      const t = crawlTokens(w);
      if (t.length === 1) {
        if (!loaded.byToken.has(t[0])) loaded.byToken.set(t[0], group);
      } else if (t.length > 1) {
        loaded.phrases.push({ phrase: normalizeFold(w), words: t, group });
      }
    }
  }
  return loaded;
}

/**
 * The groups each query token belongs to. A token is reached by its own
 * single-word form ("voter"), and also by any multi-word form the question
 * contains ("work permit" reaches the work-permit group for both "work" and
 * "permit", instead of "permit" alone reaching business licences).
 */
export function termGroups(query: string, tokens: string[]): TermGroup[][] {
  const { byToken, phrases } = load();
  const folded = normalizeFold(query);
  const inPhrase = phrases.filter((p) => folded.includes(p.phrase));
  return tokens.map((token) => {
    const fromPhrase = inPhrase.filter((p) => p.words.includes(token)).map((p) => p.group);
    if (fromPhrase.length > 0) return fromPhrase;
    const own = byToken.get(token);
    return own ? [own] : [];
  });
}

/**
 * The English words in a page URL: "/khmer/voter-registration" → "voter
 * registration". Many Khmer-only sites still name their pages in English, which
 * is the one place such a page states its subject in a language an English
 * question can match. Numbers and site-structure words are left out.
 */
const URL_NOISE = new Set([
  "http", "https", "www", "gov", "kh", "edu", "com", "org", "html", "htm", "php",
  "aspx", "index", "khmer", "english", "en", "km", "category", "content",
  "page", "pages", "post", "posts", "archives", "view", "views", "views2", "detail",
  "details", "node", "id", "home", "default",
]);

export function urlWords(url: string): string {
  let path = url;
  try {
    const u = new URL(url);
    path = decodeURIComponent(u.pathname);
  } catch {
    // Not a URL; use as is.
  }
  return path
    .split(/[^A-Za-z]+/)
    .filter((w) => w.length > 2 && !URL_NOISE.has(w.toLowerCase()))
    .join(" ");
}
