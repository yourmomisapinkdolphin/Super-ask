# Course deliverables: CSCI441, Team AO3 (SuperAsk)

Everything submitted for the course is here, grouped by deliverable. The
prototype's code is the rest of the repository; see the
[top-level README](../README.md) for how to run it.

```
docs/
  proposal/        project proposal
  report-1/        Report One (both parts, full export, use cases)
  report-2/        Report Two (full report, diagram hand-off pages)
    diagrams/      Mermaid sources, PNGs, and the page build scripts
  report-3/        Report Three (Full and Part One) and reviews against the code
  demo-1/          Demo 1 e-archive (1_code … 5_documentation)
    slides/        presentation source and built deck
```

## Proposal: [`proposal/`](proposal/)

| Deliverable | File |
|---|---|
| Project proposal | `CSCI441-TeamAO3-ProjectProposal.pdf` |

## Report One: [`report-1/`](report-1/)

| Deliverable | File |
|---|---|
| Part One | `CSCI441-TeamAO3-ReportOne-PartOne.pdf` |
| Part Two | `CSCI441-TeamAO3-ReportOne-PartTwo.pdf` |
| Full Report One (team Doc export, 2026-10-22; has the user-effort estimates and Figure 11 that Report Two cites) | `CSCI441-TeamAO3-ReportOne-Full.pdf` |
| Section 3c use cases (hand-off page) | `SuperAsk-3c-use-cases.html` |
| Use case diagram | `superask-use-case-diagram.png` |

## Report Two: [`report-2/`](report-2/)

| Deliverable | File |
|---|---|
| Full Report Two (revised 2026-10-22: no officer escalation, private-project framing, corrected Sections 5 and 6) | `CSCI441-TeamAO3-ReportTwo.pdf` |
| Part One: interaction (sequence) diagrams, Figures 8–12 | `SuperAsk-report2-interaction-diagrams.html` |
| Part Two, Section 2: class diagram and interface specification | `SuperAsk-report2-class-diagram.html` |
| Diagram sources and build scripts | [`diagrams/`](report-2/diagrams/README.md) |

The `.html` pages are self-contained (images embedded), so they open directly
in a browser.

**The diagrams and hand-off pages were updated on 2026-11-25 to match the
code** (crawled-website fallback in UC-1, the five model providers, the crawl
index and web search, and "planned" / "not built" marks on UC-7 and UC-11).
The submitted PDF keeps the original figures; git history has the originals
of the sources.

## Report Three: [`report-3/`](report-3/)

| Deliverable | File |
|---|---|
| Full Report Three, final draft (153 pages) | `CSCI441-TeamAO3-ReportThree-Full.pdf` |
| Report Three Part One (98 pages) | `CSCI441-TeamAO3-ReportThree-PartOne.pdf` |
| The same two reports as searchable text, exported from the team Google Doc tabs "Report 3 FULL" and "Report 3 Part 1" on 2026-11-25 (figures not included) | `CSCI441-TeamAO3-ReportThree-Full.md`, `CSCI441-TeamAO3-ReportThree-PartOne.md` |
| Full Report Three reviewed against the code on 2026-11-25 (what is out of date, what is not built, what Part One findings were fixed) | `report3-full-review.md` |
| Code work for Report Three by Phallamonunhh Chun (Monunhh): new features and bug fixes, 13–23 Nov 2026 | `report3-part1-review.md` |

## Demo 1: [`demo-1/`](demo-1/README.md)

Laid out as the course's e-archive: `1_code/`, `2_unit_testing/`,
`3_integration_testing/`, `4_data_collection/` and `5_documentation/`. The
five required PDFs are in `5_documentation/`; `slides/` and `documents/` hold
their HTML sources. [`demo-1/README.md`](demo-1/README.md) says what to open
first.

## Keeping this folder safe

`scripts/sync-from-bunkheang.ps1` resets `main` to the upstream code repo and
restores only `docs/` and the sync script itself. Put any
new course material under `docs/` or a sync will delete it.
