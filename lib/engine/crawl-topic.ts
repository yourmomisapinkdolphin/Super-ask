/**
 * What the crawl says about SCOPE, as opposed to what it can answer.
 *
 * Kept apart from crawl-answer.ts because the scope screen in guardrails.ts
 * needs these and crawl-answer.ts already imports guardrails.ts.
 *
 * The scope screen recognises a service question by its vocabulary. That is
 * blind to anything named rather than described — "Calmette Hospital",
 * "CamDX" — so the crawl supplies the two facts vocabulary cannot: whether an
 * official website has a page about the question, and which words are the
 * names of the institutions it covers.
 */

import { contentTerms } from "@/lib/lang/content";
import { crawlInstitutions, crawlStats, searchCrawl } from "@/lib/retrieval/crawl-index";
import { crawlTokens } from "@/lib/retrieval/crawl-tokens";

/**
 * Share of the question — content words weighted by rarity, see
 * searchCrawl() — that a passage must contain.
 *
 * Stricter than the 0.34 the approved corpus uses (lib/engine/topicality.ts):
 * that gate downgrades hand-written content, this one decides whether to show
 * unreviewed text at all.
 *
 * Two floors, because the two scripts tokenise differently. A Latin question
 * is a handful of whole words and a good passage contains nearly all of them.
 * A Khmer question is dozens of overlapping cluster bigrams, some spanning
 * word boundaries that no passage will reproduce, so even the right passage
 * rarely passes 0.75. Both numbers come from reading matches against the
 * 58-site crawl: below them the top passage was about something else
 * (electricity questions landing on telecom pages); above them it was on topic.
 */
export const MIN_COVERAGE = Number(process.env.CRAWL_MIN_COVERAGE ?? "0.75");
export const MIN_COVERAGE_KM = Number(process.env.CRAWL_MIN_COVERAGE_KM ?? "0.6");

/**
 * Does a crawled official website have a page ABOUT this?
 *
 * Used to let a question past the off-domain screen. That screen recognises a
 * service question by its vocabulary ("register", "permit", "fee"), so "What is
 * CamDX?" or "What is a Qualified Investment Project?" was refused as general
 * knowledge while the institution's own page about it sat in the crawl. A
 * passing mention is not enough: the words must be in a page title or the
 * institution's name, and the passage must cover the question.
 */
export function crawlCoversTopic(question: string): boolean {
  const tokens = [...new Set(crawlTokens(question))];
  if (tokens.length === 0) return false;
  return searchCrawl(question, 3).some((h) =>
    tokens.length === 1
      ? h.inTitle === 1
      : h.inTitle >= 1 && h.covered >= 2 && h.coverage >= MIN_COVERAGE,
  );
}

/**
 * A name word shared by more institutions than this identifies none of them:
 * "ministry", "national", "cambodia".
 */
const MAX_INSTITUTIONS_SHARING = 2;

let nameTerms: { key: string; terms: Set<string> } | undefined;

/**
 * The words that name a crawled institution — "calmette", "hospital",
 * "taxation" — as contentTerms() produces them.
 *
 * Used to recognise a follow-up that stays with the institution the
 * conversation is already about. On its own a word here proves nothing
 * ("public", "water" and "law" are in it); the caller must also find the word
 * in an earlier in-scope turn.
 */
export function institutionNameTerms(): Set<string> {
  const stats = crawlStats();
  const key = `${stats.builtAt}:${stats.sites}`;
  if (nameTerms?.key === key) return nameTerms.terms;

  const sharedBy = new Map<string, number>();
  for (const site of crawlInstitutions()) {
    for (const term of new Set(contentTerms(`${site.org} ${site.orgKm}`))) {
      sharedBy.set(term, (sharedBy.get(term) ?? 0) + 1);
    }
  }
  const terms = new Set(
    [...sharedBy].filter(([, n]) => n <= MAX_INSTITUTIONS_SHARING).map(([t]) => t),
  );
  nameTerms = { key, terms };
  return terms;
}
