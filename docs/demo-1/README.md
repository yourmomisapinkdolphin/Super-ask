# Demo 1 e-archive: SuperAsk.AI (CSCI 441, Team AO3)

**Team:** Chun Phallamonunhh, Fong Yean, Sarin Sereyprophea, Heng Bunkheang, Choi Heejae, Neang Doungkhe
**Demo date:** 9 November 2026
**Try it:** <https://superask.vercel.app> · Telegram [@superask168_bot](https://t.me/superask168_bot)

<<<<<<< Updated upstream
```
docs/demo-1/
  1_code/                  README1.txt: where the code is and how to run it
  2_unit_testing/          README2.txt: where the unit tests are and how to run them
  3_integration_testing/   integration test code + README3.txt
  4_data_collection/       README4.txt: data collection scripts and how to run them
  5_documentation/         the five required PDFs
    technical_documentation.pdf
    user_documentation.pdf
    brochure.pdf
    presentation_slides.pdf
    individual_contributions.pdf
  slides/                  source of presentation_slides.pdf (HTML deck, build.py)
=======
SuperAsk.AI answers questions about Cambodian government services in Khmer and
English, attaches the official source to every answer, and declines when no
source supports one.

## Where to start

| To see | Open |
|---|---|
| The product in one page | [`5_documentation/brochure.pdf`](5_documentation/brochure.pdf) |
| The demo slides | [`5_documentation/presentation_slides.pdf`](5_documentation/presentation_slides.pdf) |
| How to install, run and test the system | [`5_documentation/technical_documentation.pdf`](5_documentation/technical_documentation.pdf) |
| How to use it | [`5_documentation/user_documentation.pdf`](5_documentation/user_documentation.pdf) |
| Who did what, and project management | [`5_documentation/individual_contributions.pdf`](5_documentation/individual_contributions.pdf) |

## Folders

| Folder | Contents |
|---|---|
| [`1_code/`](1_code/) | [`README1.txt`](1_code/README1.txt): where the code is and how to run it |
| [`2_unit_testing/`](2_unit_testing/) | [`README2.txt`](2_unit_testing/README2.txt): where the unit tests are and how to run them |
| [`3_integration_testing/`](3_integration_testing/) | Integration test code and [`README3.txt`](3_integration_testing/README3.txt) |
| [`4_data_collection/`](4_data_collection/) | [`README4.txt`](4_data_collection/README4.txt): the data collection scripts and how to run them |
| [`5_documentation/`](5_documentation/) | The five PDF documents listed above |

The code, unit tests and data collection scripts are at the
[repository root](https://github.com/Monunhh/Super-ask) rather than copied
into `1_code`, `2_unit_testing` and `4_data_collection`. SuperAsk is a Next.js
application, and Next.js needs its source folders at the root; a copy here
would go out of date. Each README gives the exact location and the commands.
This is also explained in `individual_contributions.pdf`, section 5.

`slides/` and `documents/` hold the HTML sources that the slides and three of
the PDFs are built from. You do not need to open them.

## Run it in four commands

Requires Node.js 22 or newer. No API key is needed.

```bash
git clone https://github.com/Monunhh/Super-ask.git && cd Super-ask
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
>>>>>>> Stashed changes
```

Tests: `npm test` (610 unit + 33 API integration tests) and
`npm run test:integration` (9 cross-channel integration tests).

<<<<<<< Updated upstream
---
=======
## Rebuilding the PDFs (for the team)

- Slides: `python3 docs/demo-1/slides/build.py --pdf` (see [`slides/README.md`](slides/README.md)).
- Technical, user and contributions documents: `python3 docs/demo-1/documents/build.py`
  (needs Chrome; with `pip install pypdf` the contents pages get page numbers).
>>>>>>> Stashed changes
