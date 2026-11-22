# Review: AO3 Report Three, Part One vs. the current codebase

- **Reviewed:** `AO3 report 3 part 1.pdf` (98 pages), the export of the "AO3 Proposal" Google Doc, which was last edited 22 Nov 2026
- **Code fixes:** Phallamonunhh Chun (Monunhh), AI/ML Engineer
- **Compared against:** first pass: a local checkout on 23 Nov 2026 that turned out to be 9 commits behind GitHub (see corrections in A3 and A4). The fixes were then merged onto GitHub `main` (`ceb7494`). Original basis: the `Super-ask` working tree on 23 Nov 2026 (`main` at `a5dc59d`, plus uncommitted changes: `lib/llm/gateway.ts`, `.env.example`, `scripts/ingest-crawl.ts` and 35 `data/kb/web-*.json` files)

**Overall:** the core answer flow is described accurately: the three tiers, curated threshold 0.72, retrieval floor 0.20, refusal rules, answer checking, citations, the Report button, Telegram and the weekly crawl. The main problems are that the report is out of date on this week's work, cites two files that don't exist, describes features that aren't built, and has numbering and cross-reference errors. It also lacks the OCL contracts it says Report Three requires.

---

## A. Out of date with the code

| # | Report says | Code now | Report location |
|---|---|---|---|
| A1 | The model is Claude via the Anthropic SDK. Machine 3 is "Anthropic GPU Cloud". Only `anthropic.ts` and `extractive.ts` are listed. | `.env.example` sets `LLM_PROVIDER=gateway`: the Nous Research OpenAI-compatible gateway with `google/gemini-3.1-flash-lite`. `lib/llm/index.ts` supports five providers: `gateway`, `sealion`, `anthropic`, `vllm`, `extractive`. | §8a-6, §8b-4, §8c (Machine 3), §8d |
| A2 | 45 approved passages from 4 organisations, a 664 KB knowledge base, 132 registered sources. | `data/kb/` has 40 files and about 3,923 passages (19 MB). `data/sources.json` has 138 sources (136 enabled). The last commit crawled all 58 live sites. | §8f, DC-7 |
| A3 | "Nothing from a crawl enters data/kb without approval". | **Correction:** this holds on GitHub `main`. Crawled pages are served only as a fallback from the crawl index (`lib/retrieval/crawl-index.ts`, `lib/engine/crawl-answer.ts`), labelled "not reviewed", and never displace a curated answer. An untracked local script (`ingest-crawl.ts`) that wrote crawled pages into `data/kb/` was dropped when this work was merged into `main`. | DC-6, DC-19, §6c, UC-11 (§7), §9a-5, §9c |
| A4 | Files `lib/retrieval/crawl-index.ts` and `lib/engine/crawl-answer.ts`. | **Correction:** both exist on GitHub `main` (added 13 Nov 2026). The first review was run on a local checkout that was nine commits behind GitHub. The report is right to cite them. | DC-6, §6g |
| A5 | The scheduler is a Windows scheduled task only. | `scripts/schedule-weekly-macos.sh` also exists: macOS launchd, Sunday 02:00 by default. | §8c (Machine 5), §8e |
| A6 | The API layer "handles … CORS, rate limits". | No CORS or rate-limit code exists in `app/api/` or `next.config.ts`. | §8a-2 |
| A7 | "Meaning-based search" with embeddings, and "cross-encoder reranking". | `lib/retrieval/embed.ts` says it is *not* a neural embedding model: it uses hashed character n-grams with cosine similarity. `rerank.ts` is a lexical weighted formula. §9a-2 admits the reranker part; §8a-4 and UC-2 don't. | §8a-4, UC-2 step 2, §9a-2 |
| A8 | Telegram conversation history is "currently being worked on". | `lib/telegram/history.ts` is implemented: 8 turns per chat, at most 500 chats, kept in memory and lost on cold start. Describe it as "done, not persistent". | §10a, §10c |
| A9 | "As of November 18, 2026". | The report is due 23 Nov, and the crawl and ingest work landed after 18 Nov. | §10a, §10c, §10d |
| A10 | "600+ automated unit/integration tests". | Commit `4b6ca53` records 610 unit tests plus 33 API integration tests in `tests/`, and 9 more in `docs/demo-1/3_integration_testing`. Rerun the suite before quoting a number. | §8b-2 |
| A11 | REQ-23 evidence: "91.2% in-scope answered, 100% out-of-scope refused on the starter set" (from a comment in `tiers.ts`). | Those figures came from the 45-passage knowledge base. It is now about 85 times larger, so rerun `npm run eval` and `npm run scope-check` before quoting them. | §6e (non-functional requirements table) |

## B. Report describes features the code doesn't have

| # | Report says | Code now | Report location |
|---|---|---|---|
| B1 | UC-7 "Open in Google Maps"; mock-up Figure 10 "Show office on map"; §5 click count "Show on Map". | No map link anywhere in `components/`, `lib/` or `app/`. The report contradicts itself, because §6e says "No map link". | §4 UC-7, §4 UI spec, §5 user effort |
| B2 | UC-7 extension 3a (ask which province) and 4a/4b (contact card, location fallback). | Not implemented. `data/facilities.json` has 2 entries marked `[SAMPLE]` and is used only for emergency numbers. §4 should mark UC-7 as **partial**, as §5 and §6 already do. | §4 UC-7 |
| B3 | UC-11 steps 7–8 update the stored information and its last-verified date. | The crawler (`lib/crawl/`) only raises change signals to `review-queue.jsonl`. Nothing writes crawled pages into `data/kb/`: the local `ingest-crawl.ts` was dropped (see A3), and `scripts/ingest.ts` is a manually run WordPress adapter. | §4 UC-11 |
| B4 | Messenger is an actor and a channel (REQ-15, UC-9), with no "planned" label in §4. | Messenger is only a link (`lib/ui/channels.ts` → `m.me/superaskkh`). | §4 actors, UC-9 |
| B5 | Login and register pages. | `lib/ui/auth-session.ts` is a localStorage flag that only gates the UI; there is no real authentication. §10 already says this; make sure §4 and the UI sections don't imply more. | §4 UI spec |

## C. Problems inside the report

1. **Section numbers don't match.** The contents page has §8 = System Architecture, §9 = Algorithms, §10 = Project Management. The contributions page says "Project Management (Section 9)" and "Algorithms and Data Structures (Section 8)".
2. **Old cross-references from Reports One and Two remain.** Examples: "Section 3c-iii", "Sections 3c-iv and 3d", "Section 2" (meaning the class design), "Section 3a" / "Section 3f" (meaning architecture), "Section 3b". Renumber them to Report Three's sections (§4, §8, §9).
3. **§4 has stray internal numbering.** "1. Functional Requirement Specification and Use Cases", "2. User Interface Specification", "a. Actors and Goals", "b. System Sequence Diagrams" mix old sub-numbering into the new section.
4. **User effort estimation has no heading.** The click and keystroke counts ("1. Ask a Government Service Question" …) follow directly after the Use Case Points result in §5. Give them their own subsection, or move them into the UI specification.
5. **The OCL contracts are missing.** §10a lists them as a Report Three requirement and §10d assigns them to Doungkhe Neang, but no section contains them and the contents page doesn't list them.
6. **"Design patterns" only covers GRASP.** §7 names Controller, Information Expert, Creator, Pure Fabrication and so on. If the brief means Gang of Four patterns, name the ones already in the code:
   - **Strategy / Adapter:** `LlmProvider` and its five implementations (`lib/llm/`)
   - **Facade:** `generate()` in `lib/llm/index.ts`, which hides provider selection and fallback
   - **Chain of Responsibility / Pipeline:** the tier routing in `lib/engine/tiers.ts`
   - **Adapter:** the Telegram webhook → `AskRequest` (`lib/telegram/`)
7. **The contributions page leaves work out.** Nobody is credited with the OCL contracts or the System Architecture section (§8).
8. **The Gantt chart and milestone labels don't match.** They show "Report Three Part One – Nov 16", while this document is titled Part One and its text treats 23 Nov as the deadline.
9. **Some content is duplicated.** §6e repeats the matrix from §4 in reverse, which is fine, but both say UC-7 needs a "contact card + map link" while §6 says neither exists. Make the two descriptions agree.
10. **The references are thin.** Add sources for BM25 (Robertson & Zaragoza), Reciprocal Rank Fusion (Cormack et al., 2009), the Use Case Points method (Karner, 1993), GRASP (Larman), OCL (Warmer & Kleppe) and the LLM provider actually used.

## D. Suggested improvements (priority order)

1. **Decide how crawled content is handled (A3), then make the code and report agree.** This is a design decision, not just wording. Either:
   - filter `stewardApproved: false` passages out in the loader or retrieval, so only approved content is cited; or
   - serve them with a visible "unreviewed source" label on the citation, and say so in DC-6, DC-19, UC-11 and §9.

   As things stand, REQ-22 (no unsupported claim in a sourced answer) is at risk.
2. **Rewrite the model-provider parts of §8** for the gateway and Gemini setup, or pick one provider for Demo Two and describe only that.
3. **Refresh all counts** (passages, files, sources, institutions, tests, evaluation percentages) from the repo on submission day.
4. **Add an OCL section.** Possible contents:
   - invariants on `Chunk` (e.g. `stewardApproved = false implies citation is labelled unreviewed`) and on `Citation`
   - pre/postconditions for `ask()`, `retrieve()` (e.g. `result->forAll(c | not c.chunk.superseded)`) and `verify()`
5. **Fix all section numbers and cross-references** in one pass (C1–C3).
6. **Remove or relabel** the map link, the UC-7 province/contact-card extensions and "CORS, rate limits", or implement them before Demo Two.
7. **Add a short GoF design-patterns paragraph** to §7 (C6).
8. **Change every "as of November 18"** to the submission date, and add this week's crawl and ingest work to History of Work.
9. **Add a heading for the user effort estimation** and complete the references.

---

### What the report gets right

- Three-tier routing (`lib/engine/tiers.ts`), curated threshold 0.72, retrieval floor 0.20
- Refusal rules screened before retrieval (`guardrails.ts`) and the answer-checking gate (`verify.ts`)
- Superseded passages excluded in both indexes (`bm25.ts`, `embed.ts`)
- Freshness states fresh/due/stale (`freshness.ts`, `FreshnessBadge.tsx`)
- Report button and feedback log with PII redacted before storage (`ReportDialog.tsx`, `lib/log/audit.ts`)
- Follow-up questions resolved using conversation history passed to `retrieve()`
- Crawler that follows robots.txt, detects soft blocks and raises change signals (`lib/crawl/`)
- Telegram webhook with `maxDuration = 60`; Node runtime on all API routes
- 5 curated answers, 14 glossary terms, golden set of 34 positive and 10 negative questions

---

## E. Code changes made on 23 Nov 2026 to match the report

Fixed by **Phallamonunhh Chun (Monunhh)**.

These changes are uncommitted. Tests: **677/677 pass** (`npx vitest run`, about 9 s, down from more than 5 minutes with 54 timeouts). Typecheck and `npm run build` are clean, and `eval`, `verify-check`, `curated-check`, `scope-check` and `rationale-check` all pass.

| Report claim | Before | Change |
|---|---|---|
| DC-6, DC-8, DC-11: citations carry an **unreviewed flag**, and unreviewed crawled pages are labelled | Crawled pages could show as "Verified source". | `Citation.unreviewed` and `sample` are set by `lib/engine/citations.ts`. `SourceCard` shows "Official page · not yet reviewed" with a note, never "Verified". Telegram adds "(not yet reviewed)". After merging with `main`, the label applies to crawl-index pages, web-search results and sample data; curated `data/kb/` passages show as curated. `CRAWL_KB_ENABLED=false` (from `main`) turns crawled content off. |
| UC-7, Figure 10, §5: **"Show office on map"** | No map link anywhere | `Citation.mapUrl` is a Google Maps search built from the ministry's official name (no invented address). It appears on the source card as "Show office on map" and in Telegram as "Office on map". |
| §8a-2: the API **handles CORS and rate limits** | Neither existed | New `lib/api/guard.ts`: same-origin by default plus `ALLOWED_ORIGINS`, an `OPTIONS` preflight, and a per-IP limit per minute (`RATE_LIMIT_PER_MINUTE`, default 120 so many citizens sharing one carrier-NAT address are not throttled; returns 429 with `Retry-After`). Wired into `/api/ask` and `/api/feedback`. Tests: `tests/api/guard.test.ts`. |
| REQ-24: response begins **within 5 s** | Cold start indexed the 3,923-passage corpus in about 6 s inside the first request | Segmenter made linear (it was quadratic), and n-gram embedding no longer allocates a string per gram. Output is byte-identical (checked on about 6,000 corpus strings). Indexing now takes about 2.9 s and runs at server start (`instrumentation.ts`). First request measured at 46 ms with the extractive provider. The knowledge-base cache survives module reloads (`globalThis`, keyed on file sizes and modification times). |
| §6.1 / UC-1: "what does prakas mean" is answered from the glossary | With crawled pages loaded, the bare term cleared the retrieval floor and a random page was cited | `matchPureDefinition()` answers a question that is *only* a definition request at Tier 1 before retrieval. A procedure question that mentions a term still goes to retrieval. |
| REQ-23 figures in `tiers.ts` | Quoted 91.2% / 100% from the 45-passage corpus | Comment updated with re-measured figures. On 3,923 passages at floor 0.20: **73.5% answered, 100% refused**; at 0.15: 88.2% / 100%. Recall@8 is 85.3% (target 85%, PASS) and refusal is 100% (target 98%, PASS). |

### Still for the report to change, not the code

- The LLM provider (A1): the code supports Anthropic, but the configured default is `gateway` (Gemini). Pick one for Demo Two and describe that one.
- Counts (A2): 3,923 passages, 40 knowledge-base files, 138 registered sources, and 677 unit tests.
- Office directory (B2): the map link is a name search. Verified addresses, phone numbers and the province question still need real facility data.
- Messenger (B4), real authentication (B5), and Facebook/Telegram crawlers are still planned.
- The decline floor: keep 0.20 (more refusals) or lower it to 0.15 (more answers, still 100% refusal on the golden set). Then update §9a-3.

---

## F. Bugs found and fixed on 23 Nov 2026 (second pass)

Found and fixed by **Phallamonunhh Chun (Monunhh)**.

I put realistic questions through the engine and compared all 65 golden-set and spot-check questions before and after the fix, on the same data.

| # | Bug | Fix |
|---|---|---|
| 1 | Questions with fewer than 3 content words skipped the topic check, so "how do I register to vote" and "register a company" got birth registration with no warning | A short question is on topic only if every content word appears in the passage. The passage's own indexed questions and keywords now count (so "motorbike", "stolen" and other curator-recorded synonyms are covered). |
| 2 | `moi-civil-registration.json` is SAMPLE content ("Sub-Decree No. XXX") but was cited as an approved source | Its passages are marked `stewardApproved: false`. Citations carry `sample: true`, and the card and Telegram say "Sample data · not an official source". |
| 3 | Extractive answers always began "From the approved source:" | The opening line now matches the source's status: approved, official website (not yet reviewed), or SAMPLE data. |
| 4 | "How much does a passport cost" returned the driving-licence fee table; the warning listed "much" | A fee question whose top source states amounts but shares nothing with the question except money words is declined (`retrieval:off_topic`). "much", "many", "long", "take" and similar are ignored as question filler. |
| 5 | Crawled pages showed their fetch date as the "Effective" date | Chunks carry `effectiveUnknown: true`. The card shows "Page fetched <date>", and the model is told no effective date is stated. |
| 6 | Cards printed "Not cited on source page · Not cited on source page" | The placeholder is hidden on the card and in Telegram. |
| 6b | The freshness badge said "VERIFIED" on unreviewed sources | It shows "Not reviewed" unless a person has reviewed the passage. |
| 7 | 404 pages, menu and cookie lines, garbled text, near-empty passages in the locally ingested `web-*.json` files | Moot after the merge: those files and `ingest-crawl.ts` were dropped in favour of `main`'s crawl-index fallback. Worth checking `scripts/build-crawl-index.ts` for the same junk. |
| 8 | Crawled passages had only title-based questions | Still open for the crawl index on `main`: candidate questions generated per passage are the next retrieval fix. |
| 9 | The Telegram webhook accepted unsigned calls if the secret was unset | The secret is required in production (503 otherwise; `TELEGRAM_ALLOW_UNSIGNED=true` overrides). The comparison is constant-time. |
| 10 | Audit and feedback logs were lost on Vercel | On Vercel, records go to stdout (retained in host logs) as redacted JSON lines, and file-write failures fall back to stdout. `AUDIT_LOG_SINK` overrides. |

**Before/after on 65 questions (same data):**
- 8 correct answers lost a false "may not answer" warning.
- The passport-fee question is now declined.
- The voter, company and "apply for a trademark" questions now carry a warning. The last one cites a passage about transferring trademark ownership, not applying.
- No previously good answer was lost.

Retrieval output (`scripts/eval.ts`) is unchanged.

**Not fixed by code:** retrieval still misses relevant crawled content. Most crawled sites are Khmer-only and their candidate questions come from page titles, so the voter question still reaches the sample birth passage (now labelled) instead of NEC pages. This needs generated candidate questions per passage.
