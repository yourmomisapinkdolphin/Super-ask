# Report Three code work: every change by Monunhh

- **By:** Phallamonunhh Chun (Monunhh), AI/ML Engineer
- **Period:** 9–25 Nov 2026, from the first commit after Demo 1 (9 Nov, evening) to the Report Three upload. Every commit that changed code or data is listed in section 7. Documentation changes are not included.
- **Checked on 25 Nov 2026:** 749 tests pass in 32 files (643 at Demo 1, so 106 new), 89.7% line coverage. Typecheck is clean, and `eval`, `verify-check`, `curated-check`, `scope-check` and `rationale-check` all pass.

---

## 1. Crawled data

| Change | Details | Commit |
|---|---|---|
| **Source registry updated** | Added the 5 sites from the team spreadsheet that were missing (businessregistration.moc, cgmc, ctc.edu, delp.moeys, qip.cdc) and Electricité du Cambodge (edc.com.kh). `data/sources.json` was rebuilt: 138 sources, 136 enabled. | `62e82c8` |
| **Reachability check re-run** | All 135 enabled sources probed again: 57 live, 40 blocked, 26 dead, 10 empty, 2 redirects. Results are in `data/crawl/verification.json` and the `verify_*` columns of `data/registry/websites_master.csv`. | `62e82c8` |
| **Full crawl of 58 live sites** | The 57 live sites plus EDC: 1,471 pages fetched. The Ministry of National Defence site was crawled last because its robots.txt asks for 200 s between requests. | `1c5d6e7`, `9dfcf97` |
| **Crawl database, one file per website** | `scripts/build-site-db.ts` (`npm run build-site-db`) turns the raw crawl copies into one JSON file per website under `data/crawl/db/`, filed by ministry or institution using the MFAIC list in `data/registry/institutions.json` (numbered 01–36, everything else under `other/`). Repeated menu and footer text is stripped. | `62e82c8`, `9dfcf97` |
| **SQLite copy of the crawl** | `scripts/build-sqlite.ts` (`npm run build-sqlite`) builds `data/crawl/superask-sites.db`: 54 institutions, all 138 sites with their reachability result, 1,625 pages, 54,350 links (1,756 of them to PDF or Office documents), and an institution summary view. `-- --search` adds a full-text index. | `a5dc59d` |
| **macOS weekly scheduler** | `scripts/schedule-weekly-macos.sh`: the launchd version of the Windows weekly crawl task, Sunday 02:00 by default. | `62e82c8` |

## 2. New features

| Feature | What it does | Where | Commit |
|---|---|---|---|
| **Answers from crawled websites** | When the approved documents have no answer, SuperAsk searches the crawled pages and answers from the closest passage. It is used when nothing clears the retrieval floor, or when the best approved source covers less than 75% of the question. The answer is labelled as an unreviewed website page and links to the page. It never replaces an approved answer that covers the question. `CRAWL_KB_ENABLED=false` turns it off. | `lib/retrieval/crawl-index.ts`, `lib/retrieval/crawl-tokens.ts`, `lib/engine/crawl-answer.ts` | `89667a8` |
| **Crawl search index built with every deploy** | `scripts/build-crawl-index.ts` runs before every build, cuts the crawled pages into passages and writes a search index. `next.config.ts` ships the index with the functions that answer questions and leaves the crawl database out of the bundle. | `scripts/build-crawl-index.ts`, `next.config.ts`, `.vercelignore` | `89667a8` |
| **Crawl status in `/api/health`** | Reports the loaded crawl index under `crawledWebsites` and whether web search is on. | `app/api/health/route.ts` | `89667a8`, `b3c01de` |
| **Crawled institutions shown in the chat** | 15 popular-procedure suggestions are answered from the crawl database, each checked against the live engine. The "currently covers" and no-answer messages list the crawled institutions, not only the four ministries with approved documents. | `lib/ui/landing.ts`, `lib/engine/copy.ts`, `app/chat/page.tsx` | `b3c01de` |
| **Institution logos and assistant avatar** | Answer cards show the institution's logo (54 logo files in `public/ministries/`), and the SuperAsk icon is the assistant's avatar. | `lib/ui/ministry-logos.ts`, `components/chat/AnswerBlock.tsx` | `b3c01de` |
| **Scope check that knows the crawled sites** | A question the vocabulary screen doesn't recognise is still accepted when a crawled official website has a page about it. Translation, weather and general-knowledge questions are still refused. | `lib/engine/guardrails.ts` | `b3c01de` |
| **Web search step** | An optional last step before a refusal: a live web search whose results are labelled "Web search result · not reviewed" and linked. Off unless `WEB_SEARCH_ENABLED=true` and a Tavily key is set. | `lib/web/search.ts`, `lib/engine/web-answer.ts` | `b3c01de` |
| **`GENERAL_FALLBACK_FOR_SERVICES` switch** | Off by default. When on, an uncovered government-service question is answered from the model's own knowledge, labelled unverified, instead of being refused. | `lib/engine/fallback.ts` | `b3c01de` |
| **"Not reviewed" and "sample" labels** | Every citation from a crawled page, a web result or sample data is flagged. Instead of "Verified source", the source card says "Website page · not reviewed", "Web search result · not reviewed" or "Sample data · not an official source". Telegram replies add "(not yet reviewed)". | `lib/engine/citations.ts`, `components/chat/SourceCard.tsx`, `lib/telegram/format.ts` | `89667a8`, `d0f4e58`, `040c94e` |
| **Office map link** | Each citation carries a Google Maps search for the responsible office, built from the institution's official name (never an invented address). There is no link for groupings that aren't one office. It shows as "Show office on map" on the card and "Office on map" in Telegram. | `lib/engine/citations.ts`, `components/chat/SourceCard.tsx`, `lib/telegram/format.ts` | `d0f4e58` |
| **API guard: CORS and rate limit** | `/api/ask` and `/api/feedback` accept browser calls from the site's own origin (plus `ALLOWED_ORIGINS`), answer `OPTIONS` preflight requests, and limit each IP to 120 requests a minute (`RATE_LIMIT_PER_MINUTE`), returning 429 with `Retry-After`. The limit is generous because many mobile users share one carrier address. | `lib/api/guard.ts`, `app/api/ask/route.ts`, `app/api/feedback/route.ts` | `d0f4e58` |
| **Plain message when the API refuses** | When the guard returns 403 or 429, the chat shows a plain message instead of trying to render a missing answer. | `components/chat/useConversation.ts` | `d0f4e58` |
| **Faster cold start** | The Khmer segmenter was quadratic and the n-gram embedder allocated a string per gram. Both were rewritten with byte-identical output (checked on about 6,000 strings). Indexing dropped from about 6 s to 2.9 s and now runs at server start (`instrumentation.ts`), so the first request doesn't pay for it (46 ms with the extractive provider). The knowledge-base cache survives module reloads. | `lib/khmer/segment.ts`, `lib/retrieval/embed.ts`, `instrumentation.ts`, `lib/kb/loader.ts` | `d0f4e58` |
| **Definition questions from the glossary** | A question that only asks what a term means ("what does prakas mean") is answered from the glossary before retrieval, so a page that merely mentions the word can't take its place. A procedure question that mentions a term still goes to retrieval. | `lib/engine/glossary.ts`, `lib/engine/tiers.ts` | `d0f4e58` |
| **English questions find Khmer pages** | Most crawled sites publish in Khmer only. `data/crawl-terms.json` lists, for common service words, the English forms the stemmer keeps apart ("vote", "voter", "election") and the Khmer term (បោះឆ្នោត), so a question in one language finds pages in the other. Page URLs are searched too ("/khmer/voter-registration"). It decides only which crawled pages are found; the approved corpus does not use it. | `data/crawl-terms.json`, `lib/retrieval/crawl-terms.ts`, `lib/retrieval/crawl-index.ts`, `scripts/build-crawl-index.ts` | `4ff8fb7` |
| **Voter registration is a service question** | "Register to vote", "voter list", "voter card" and "polling station" are accepted as service questions. "Who should I vote for" is still refused as political. | `lib/engine/guardrails.ts` | `4ff8fb7` |
| **Office contacts from the institutions' own websites** | `data/contacts.json` holds the phone, address and hours from 9 institutions' contact pages, each with its source page and date. Source cards and Telegram replies show them beside pages from that website, and the map link searches for the published address instead of the name. Sites that publish nothing usable get no entry. | `data/contacts.json`, `lib/kb/contacts.ts`, `lib/engine/citations.ts`, `components/chat/SourceCard.tsx`, `lib/telegram/format.ts` | `4ff8fb7` |
| **Gateway model provider as the default** | `.env.example` selects the Nous Research gateway with Gemini 3.1 Flash Lite, with its model, base URL, timeout and JSON-mode settings documented. | `lib/llm/gateway.ts`, `.env.example` | `d475cdf` |

## 3. Bugs fixed

| # | Bug | Fix | Commit |
|---|---|---|---|
| 1 | Short filler messages such as "hmm", "ok" or "?" after a service question were treated as follow-ups, so SuperAsk repeated its previous answer. "Can I get married" was refused as not a service question. | Filler messages are recognised and no longer re-serve the last answer. "marry", "married", "wedding" and "divorced" were added to the service vocabulary, so marriage questions reach retrieval. | `6d2f6fd` |
| 2 | One RUPP page held 5 MB of inline image data, which the index builder cut into 7,208 passages of random characters, more than half the crawl index. | Runs of 100+ base64 characters are removed before passages are cut. The index went from 13,746 to 6,538 passages and from 34.8 to 21.2 MB, with no readable text lost. | `11c3e52` |
| 3 | When the model call failed, the stand-in answer quoted an approved source that only half matched the question. | A failed model call no longer quotes a half-matching approved source (`provider:degraded_off_subject`). | `b3c01de` |
| 4 | A question accepted because of a crawled website ("How do I make an appointment at Calmette Hospital?") was dropped from the conversation history, so the next follow-up was treated as a new conversation and refused. | Scope is one decision (`isInScope`) used for both the new question and the history. A follow-up stays in scope when it names the institution being discussed or corrects the previous answer. | `ceb7494` |
| 5 | Questions with fewer than 3 content words skipped the topic check, so "how do I register to vote" and "register a company" got birth registration with no warning. | A short question is on topic only if every content word appears in the passage. The passage's own indexed questions and keywords count, so curator synonyms such as "motorbike" and "stolen" are covered. | `040c94e` |
| 6 | "How much does a passport cost" returned the driving-licence fee table, and the warning listed "much" as a missing word. | A fee question whose top source states amounts for a different service is declined (`retrieval:off_topic`). Words like "much", "many", "long" and "take" are ignored as question filler. | `040c94e` |
| 7 | `moi-civil-registration.json` is sample content ("Sub-Decree No. XXX") but was cited as an approved source. | Its passages are marked `stewardApproved: false`, and citations carry `sample: true`, shown as "Sample data · not an official source". | `040c94e` |
| 8 | Extractive answers always began "From the approved source:". | The opening line matches the source's status: approved, official website (not yet reviewed), or sample data. | `040c94e` |
| 9 | Crawled pages showed their fetch date as the "Effective" date. | Citations carry `effectiveUnknown: true`. The card shows "Collected <date>" instead, and the model is told no effective date is stated. | `040c94e` |
| 10 | Cards printed "Not cited on source page · Not cited on source page". | The placeholder is hidden on the card and in Telegram. | `040c94e` |
| 11 | The freshness badge said "VERIFIED" on sources nobody had reviewed. | It shows "Not reviewed" unless a person has reviewed the passage. | `040c94e` |
| 12 | The Telegram webhook accepted unsigned calls when the secret was not set. | The secret is required in production (503 otherwise; `TELEGRAM_ALLOW_UNSIGNED=true` overrides), and the comparison is constant-time. | `040c94e` |
| 13 | Audit and feedback logs were lost on Vercel, whose filesystem does not keep files. | On Vercel, redacted records go to stdout and are kept in the host's logs. A failed file write also falls back to stdout. `AUDIT_LOG_SINK` overrides. | `040c94e` |
| 14 | The test suite took more than 5 minutes, with 54 timeouts, because every test rebuilt the knowledge-base index. | The index cache is kept across module reloads, keyed on the data files' sizes and times. The suite runs in about 9 s. | `d0f4e58` |
| 15 | "How do I register to vote" answered from sample birth-registration data, and "how do I check my name on the voter list" was refused: English questions could not reach the National Election Committee's Khmer pages. | Both now answer from the NEC's own pages (see "English questions find Khmer pages"). | `4ff8fb7` |

### How the fixes were checked

All 65 golden-set and spot-check questions were run before and after the fixes, on the same data:

- 8 correct answers lost a false "may not answer what you asked" warning.
- The passport-fee question is now declined instead of quoting driving-licence fees.
- The voter, company and "apply for a trademark" questions now carry a warning.
- No answer that was right before became wrong.
- Retrieval output (`npm run eval`) is unchanged.

For bug 15, the golden set plus 20 spot checks were run before and after: only the two voter questions changed, plus three answers that moved to another relevant page. Nothing that was right became wrong, and `scope-check` stayed at 22 of 24. A first attempt failed this comparison: "permit" matched a broad Khmer word and turned the fishing-permit refusal into an agricultural-chemicals fee table, so "permit" was given no Khmer form before the change was committed.

## 4. Tests added

643 tests at Demo 1, 749 now.

| Test file | Covers | Commit |
|---|---|---|
| `tests/engine/crawl-answer.test.ts` (new) | Crawled answers only after the approved corpus fails, always labelled and linked; follow-ups about crawled institutions stay in scope | `89667a8`, `ceb7494` |
| `tests/api/guard.test.ts` (new) | Origin check, preflight and rate limit | `d0f4e58` |
| `tests/engine/citations.test.ts` (new) | Unreviewed, sample and "effective date unknown" flags, and the map link | `d0f4e58`, `040c94e` |
| `tests/api/telegram-auth.test.ts` (new) | The webhook refuses unsigned calls in production | `040c94e` |
| `tests/log/sink.test.ts` (new) | Audit records go to stdout on Vercel and to a file elsewhere | `040c94e` |
| `tests/engine/topicality.test.ts` (extended) | Short questions and question-filler words | `040c94e` |
| `tests/engine/web-answer.test.ts` (new) | The web search step end to end against a stubbed Tavily API: off unless switched on, the key sent only as a bearer token, results labelled and linked, failures treated as no result. Coverage of the two web files went from 13–25% to 96–98%. | `4ff8fb7` |
| `tests/retrieval/crawl-terms.test.ts` (new) | English↔Khmer term groups, URL words, and that "permit" cannot reach a broad Khmer word | `4ff8fb7` |
| `tests/kb/contacts.test.ts` (new) | Every office contact names a source page on the same website, has a collection date and real digits, and appears only beside pages from that site | `4ff8fb7` |
| `tests/engine/guardrails.test.ts`, `tests/engine/tiers.test.ts` (extended) | Filler messages and marriage questions; scope for crawled institutions and voter registration; the crawl step in the answer order | `6d2f6fd`, `89667a8`, `ceb7494`, `4ff8fb7` |

`vitest.config.ts` was also updated for the new files (`d0f4e58`).

## 5. Tried and reverted

| Change | What happened | Commits |
|---|---|---|
| **Crawled pages copied into the knowledge base** | `scripts/ingest-crawl.ts` wrote 3,867 crawled passages into `data/kb/web-*.json`, cleaned of 404 pages, cookie banners and garbled text. It was dropped when the branch was merged into `main`, because `main` already serves crawled pages through the crawl index, and having both would have served them twice. The cleanup ideas and the fixes made on that branch were kept. | `9bc743d`, reverted in `fe6bc7e` |
| **`UNREVIEWED_CONTENT_ENABLED` switch** | Added to answer from approved content only. Removed in the same merge because `CRAWL_KB_ENABLED` does the job. | `d0f4e58`, removed in `fe6bc7e` |

## 6. Clean-up

| Change | Commit |
|---|---|
| Removed `lib/telegram/keyboards.ts`, which nothing imported. | `a50246a` |
| Stopped tracking two crawl build outputs: the 24 MB SQLite file (rebuilt with `npm run build-sqlite`) and `verification.partial.jsonl` (rewritten on every reachability check). Both are now in `.gitignore`. | `a50246a` |
| Updated two code comments with current figures (decline floor in `tiers.ts`, corpus size in `fallback.ts`). No behaviour change. | `d0f4e58`, `5616f15` |
| `.env.example`: added the settings the code reads but the template left out (web search, fallback switches, topicality and crawl thresholds, crawler settings). | `5616f15` |

## 7. Every code commit, 9–25 Nov 2026

| Date | Commit | Summary |
|---|---|---|
| 9 Nov | `6d2f6fd` | Filler messages no longer repeat the previous answer; marriage questions in scope |
| 13 Nov | `62e82c8` | Crawl database per institution; source registry (138); reachability re-run; macOS scheduler |
| 13 Nov | `1c5d6e7` | Crawl database: sites crawled so far |
| 13 Nov | `9dfcf97` | Crawl database: full crawl of all 58 live sites |
| 13 Nov | `a5dc59d` | SQLite database of the crawl |
| 13 Nov | `89667a8` | Answers from crawled websites, labelled unreviewed |
| 13 Nov | `11c3e52` | Crawl index: remove embedded image data |
| 19 Nov | `b3c01de` | Crawled institutions in the chat, logos, web search step, fewer dead ends |
| 20 Nov | `ceb7494` | Follow-ups about crawled institutions stay in the conversation |
| 23 Nov | `d0f4e58` | Unreviewed labels, map link, API guard, faster cold start, glossary definitions |
| 23 Nov | `040c94e` | Bug fixes: wrong-subject answers, sample labels, webhook secret, audit logs |
| 23 Nov | `9bc743d` | Crawled pages in the knowledge base (reverted in `fe6bc7e`) |
| 23 Nov | `d475cdf` | Gateway provider as the default |
| 23 Nov | `fe6bc7e` | Merge into `main` |
| 23 Nov | `a50246a` | Repo tidy |
| 25 Nov | `5616f15` | `.env.example` settings and two code comments |
| 25 Nov | `4ff8fb7` | Khmer pages from English questions, web search tested end to end, office contacts |

The one other code commit in this period, `4736ed2` (CI deploy to Vercel, 20 Nov), was made by Bunkheang Heng.

---

## 8. Still to do

- **A live web-search run.** The step is tested end to end but has not searched the real web. It needs a Tavily key in the Vercel project's environment (`WEB_SEARCH_ENABLED=true`, `TAVILY_API_KEY`); the key is not stored in the repository.
- **Contacts for the remaining institutions.** On 25 Nov, 39 more entries were copied from the institutions' live websites, so 48 are now in `data/contacts.json`, including three of the four approved-corpus organisations (NBC, MPWT and MOC). Still missing: the Ministry of Interior (site unreachable); Health, Post and Telecommunications, Social Affairs and Banteay Meanchey (their sites block automated requests, so someone needs to copy the details in a browser); and seven sites with nothing usable. See `docs/report-3/contact-call-sheet.md`.
- **Confirming the numbers by phone.** None of the 40 recorded phone numbers has been called. The call sheet lists them, with a script in Khmer and English.
- **Review by a Khmer speaker** of the Khmer terms in `data/crawl-terms.json`.
