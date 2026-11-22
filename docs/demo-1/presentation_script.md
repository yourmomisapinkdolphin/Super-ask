# SuperAsk.AI: Demo 1 presentation script

About 17 minutes, then questions. Five slides, then the live demo, then the plan.

## Before you start

- Open the slides, superask.vercel.app/chat (history cleared), the Telegram bot @superask168_bot, and a terminal in the project folder.
- Send one test question to the Telegram bot so it is awake.
- Don't log in or create accounts. The chat needs neither.

## Slide 1: Cover (30 s)

- Team AO3, SuperAsk.AI.
- One line: it answers questions about Cambodian government services, in Khmer and English, with the official source attached.
- Each use case is shown live by the member who owns it.

## Slide 2: Who it is for and what it is (1.5 min)

- **Who:** Cambodian citizens who need to know what a procedure requires: documents, fee, office.
- **Problem:** the information is scattered across ministry sites, Facebook and Telegram, often as undated images, so people lose a day or pay a broker.
- **How it works:** ask in Khmer or English → it searches only approved ministry content → it checks the content really supports an answer → it answers with the source, or declines.
- **What's new (say this clearly):** a general chatbot invents fees; SuperAsk never does. Every answer shows its official source and review date, and it says no when there is no source. Unlike a ministry website, you ask in your own words, in Khmer.
- **Chart:** 45 approved passages, five services, four ministries.

## Slide 3: Roadmap (30 s)

- The highlighted rows are the live demo: the use cases planned for Demo 1 in Report One.
- Then the plan for the rest of the semester.

## Live demo (slide 4 stays on screen while switching)

For each use case, cover: **what it does**, **which business goal it serves**, **the user scenario**, and **one key screen or back-end point**.

### UC-1 Ask a question + UC-2 Retrieve official sources (4 min)

- **Goal:** bilingual access, comprehensive information.
- **Scenario:** a citizen's driving licence is expiring.
- Type: `How do I renew my driving licence?`
  - Point out the documents, the 30,000 riel fee and the service centres, all from the ministry page.
- Type in Khmer: `តើការបន្តប័ណ្ណបើកបរត្រូវការឯកសារអ្វីខ្លះ?`
  - The same answer comes back, in Khmer.
- Follow up: `How much does it cost?`
  - It remembers the topic and answers 30,000 riel.
- **Back end:** one engine for web and Telegram. It screens the question, searches approved passages (Khmer-aware), checks the match is strong enough, and answers only from the source. A verification step blocks any figure that isn't in the source.

### UC-3 View the source citation (2 min)

- **Goal:** trustworthy answers.
- Open the source card on the same answer.
  - Show the ministry name, Prakas No. 047, the effective date, the last-verified date and the link.
- Explain the **"Past review date"** badge: sources are reviewed every 90 days, and SuperAsk warns the citizen instead of hiding it.
- **Screen design:** the source is shown separately from the answer, so it is always visible.

### UC-4 Decline an unsupported question (2 min)

- **Goal:** trustworthy answers.
- New chat. Type: `What is the weather in Phnom Penh tomorrow?`
  - It declines and says what it does cover. It doesn't guess.
- **Back end:** a policy screen runs before any search or AI model. On the test set, 100% of off-topic questions were refused.

### UC-7 Office contact and location, in Telegram (3 min)

- **Goal:** ministry contact and location.
- In @superask168_bot, send: `Where do I apply for a driving licence?`
  - Show the service centres, the free hotline 1275, the email, office hours and the source.
- Press the **Mini App** button: the same chat opens inside Telegram.
- **Back end:** the website, the bot and the Mini App use the same engine and give the same answer. The server checks a secret so that only Telegram can call it.

### UC-11 Refresh official content (2 min)

- **Goal:** comprehensive, current information.
- In the terminal: `npx tsx scripts/crawl.ts --mode=monitor --only=SRC-021 --dry-run`
  - It takes about 30 s, so talk while it runs.
  - It checks 15 pages of the Ministry of Commerce site for changes. Dry run means nothing is saved.
- **Key point:** we monitor 132 government sites, and a change goes to a human reviewer. It never becomes an answer on its own.

## Slide 5: Plan for the rest of the semester (2 min)

- **Results on the 44-question test set:**
  - Right source in the top 8: 94.1% (target 85%).
  - Off-topic questions refused: 100% (target 98%).
  - Right source ranked first: only 67.6%, so this is what we improve.
- **Nov 10–16:** apply Demo 1 feedback; sharper relevance check, so uncovered topics are declined.
- **Nov 17–23:** add passports and business registration; better ranking.
- **By Demo 2 (Dec 4):** office directory with map links, Telegram follow-up memory, real accounts, a reviewer portal.
- Thank you, then questions.

## Don't do on stage

- Don't ask about passports, business registration or land titles, and don't use those landing-page buttons. They aren't covered yet, and the answer will be wrong.
- Don't run the crawler on the transport ministry site (SRC-034); it's too slow.

## Likely questions

| Question | Answer |
|---|---|
| How is this different from ChatGPT? | It answers only from approved ministry sources, always shows the source, and declines instead of guessing. |
| What if a ministry changes a fee? | The crawler flags the change, a person reviews it, then the content is updated. |
| How do you know it works? | 652 automated tests, 89.6% code coverage, and a 44-question evaluation run on every code change. |
| Does it need an AI model? | No. Without one it quotes the source directly. A model only rewords the answer, and the verification step still checks it. |
| Why is ranking only 67.6%? | The right source is usually in the top 8 (94.1%) but not always first. Better ranking is planned for Report 3. |
