# Report Three code work: bug fixes and new features

- **By:** Phallamonunhh Chun (Monunhh), AI/ML Engineer
- **Period:** 13–23 Nov 2026, all merged on `main`
- **Checked on 25 Nov 2026:** 705 tests pass in 29 files (`npx vitest run`). Typecheck is clean, and `eval`, `verify-check`, `curated-check`, `scope-check` and `rationale-check` all pass.

This page lists what Monunhh built and fixed in the code while Report Three was being written. For how the report compares with the code, see [`report3-review.md`](report3-review.md).

---

## 1. New features

| Feature | What it does | Where | Commit |
|---|---|---|---|
| **Crawl database of 58 official websites** | Every live site in the source registry was crawled and stored as one JSON file per website, grouped by institution, with an index of all institutions. A SQLite copy can be built for ad-hoc queries. | `data/crawl/db/`, `scripts/build-site-db.ts`, `scripts/build-sqlite.ts` | `62e82c8`, `9dfcf97`, `a5dc59d` |
| **Answers from crawled websites** | When the approved documents have no answer, SuperAsk searches the crawled pages and answers from the closest passage. The answer is labelled as an unreviewed website page and links to that page. It never replaces an approved answer that covers the question. `CRAWL_KB_ENABLED=false` turns it off. | `lib/retrieval/crawl-index.ts`, `lib/engine/crawl-answer.ts`, `scripts/build-crawl-index.ts` (runs before every build) | `89667a8`, `11c3e52` |
| **Crawled institutions shown in the chat** | 15 popular-procedure suggestions are answered from the crawl database, each checked against the live engine. The "currently covers" and no-answer messages list the crawled institutions, and answer cards show the institution's logo. | `components/chat/`, `lib/engine/copy.ts`, `lib/ui/ministry-logos.ts`, `public/ministries/` | `b3c01de` |
| **Fewer dead ends** | A question the vocabulary screen doesn't recognise is still accepted when a crawled official website has a page about it. A failed model call no longer quotes a half-matching approved source. | `lib/engine/guardrails.ts`, `lib/engine/tiers.ts` | `b3c01de` |
| **Web search step** | An optional last step before a refusal: a live web search whose results are labelled and linked. Off unless `WEB_SEARCH_ENABLED=true` and a Tavily key is set. | `lib/web/search.ts`, `lib/engine/web-answer.ts` | `b3c01de` |
| **Follow-up questions about crawled institutions** | A question accepted because of a crawled website (for example "How do I make an appointment at Calmette Hospital?") used to be dropped from the conversation history, so the next follow-up was refused. Scope is now one decision used for both the new question and the history. | `lib/engine/guardrails.ts`, `lib/engine/crawl-topic.ts` | `ceb7494` |
| **"Not reviewed" and "sample" labels** | Every citation from a crawled page, a web result or sample data is flagged. Instead of "Verified source", the source card says "Website page · not reviewed", "Web search result · not reviewed" or "Sample data · not an official source". Telegram replies add "(not yet reviewed)". | `lib/engine/citations.ts`, `components/chat/SourceCard.tsx`, `lib/telegram/format.ts` | `d0f4e58`, `040c94e` |
| **Office map link** | Each citation carries a Google Maps search for the responsible office, built from the institution's official name (never an invented address). It shows as "Show office on map" on the card and "Office on map" in Telegram. | `lib/engine/citations.ts`, `components/chat/SourceCard.tsx`, `lib/telegram/format.ts` | `d0f4e58` |
| **API guard: CORS and rate limit** | `/api/ask` and `/api/feedback` accept browser calls from the site's own origin (plus `ALLOWED_ORIGINS`) and limit each IP to 120 requests a minute (`RATE_LIMIT_PER_MINUTE`), returning 429 with `Retry-After`. The limit is generous because many mobile users share one carrier address. | `lib/api/guard.ts`, `tests/api/guard.test.ts` | `d0f4e58` |
| **Faster cold start** | The Khmer segmenter was quadratic and the n-gram embedder allocated a string per gram. Both were rewritten with byte-identical output (checked on about 6,000 strings). Indexing dropped from about 6 s to 2.9 s and now runs at server start, so the first request doesn't pay for it (46 ms measured with the extractive provider). The test suite went from more than 5 minutes with 54 timeouts to about 9 s. | `lib/khmer/segment.ts`, `lib/retrieval/embed.ts`, `instrumentation.ts`, `lib/kb/loader.ts` | `d0f4e58` |
| **Definition questions from the glossary** | A question that only asks what a term means ("what does prakas mean") is answered from the glossary before retrieval, so a page that merely mentions the word can't take its place. A procedure question that mentions a term still goes to retrieval. | `lib/engine/glossary.ts` (`matchPureDefinition`) | `d0f4e58` |
| **Gateway model provider as the default** | `.env.example` now selects the Nous Research gateway with Gemini 3.1 Flash Lite, with its model, base URL, timeout and JSON-mode settings documented. | `lib/llm/gateway.ts`, `.env.example` | `d475cdf` |
| **Repo tidy** | Removed dead code (`lib/telegram/keyboards.ts`), stopped tracking crawl build outputs (a 24 MB SQLite file and a partial-results log), and brought the README layout up to date. | `.gitignore`, `README.md` | `a50246a` |

---

## 2. Bugs fixed

Found by putting realistic questions through the engine (commit `040c94e`, 23 Nov 2026, unless noted).

| # | Bug | Fix |
|---|---|---|
| 1 | Questions with fewer than 3 content words skipped the topic check, so "how do I register to vote" and "register a company" got birth registration with no warning. | A short question is on topic only if every content word appears in the passage. The passage's own indexed questions and keywords now count, so curator synonyms such as "motorbike" and "stolen" are covered. |
| 2 | `moi-civil-registration.json` is sample content ("Sub-Decree No. XXX") but was cited as an approved source. | Its passages are marked `stewardApproved: false`. Citations carry `sample: true`, and the card and Telegram say "Sample data · not an official source". |
| 3 | Extractive answers always began "From the approved source:". | The opening line now matches the source's status: approved, official website (not yet reviewed), or sample data. |
| 4 | "How much does a passport cost" returned the driving-licence fee table, and the warning listed "much" as a missing word. | A fee question whose top source states amounts for a different service is declined (`retrieval:off_topic`) instead of quoting the wrong fees. Words like "much", "many", "long" and "take" are ignored as question filler. |
| 5 | Crawled pages showed their fetch date as the "Effective" date. | Citations carry `effectiveUnknown: true`. The card shows "Collected <date>" instead, and the model is told no effective date is stated. |
| 6 | Cards printed "Not cited on source page · Not cited on source page". | The placeholder is hidden on the card and in Telegram. |
| 7 | The freshness badge said "VERIFIED" on sources nobody had reviewed. | It shows "Not reviewed" unless a person has reviewed the passage. |
| 8 | The Telegram webhook accepted unsigned calls when the secret was not set. | The secret is required in production (503 otherwise; `TELEGRAM_ALLOW_UNSIGNED=true` overrides), and the comparison is constant-time. |
| 9 | Audit and feedback logs were lost on Vercel, whose filesystem does not keep files. | On Vercel, redacted records go to stdout and are kept in the host's logs. A failed file write also falls back to stdout. `AUDIT_LOG_SINK` overrides. |
| 10 | A follow-up after a question accepted through a crawled website was treated as the start of a new conversation and refused (commit `ceb7494`, 20 Nov 2026). | See "Follow-up questions about crawled institutions" above. |

### How the fixes were checked

All 65 golden-set and spot-check questions were run before and after the fixes, on the same data:

- 8 correct answers lost a false "may not answer what you asked" warning.
- The passport-fee question is now declined instead of quoting driving-licence fees.
- The voter, company and "apply for a trademark" questions now carry a warning.
- No answer that was right before became wrong.
- Retrieval output (`npm run eval`) is unchanged.

---

## 3. Still open

- **Retrieval misses some crawled content.** Most crawled sites are Khmer-only, and their passages are indexed with questions taken from page titles, so "how do I register to vote" still doesn't reach the National Election Committee's pages. The next step is generating candidate questions for each crawled passage.
- **The web search step has not been run end to end** with a live key. It stays off by default.
- **The office map link is a name search.** Verified addresses and phone numbers need real office data in `data/facilities.json`.
