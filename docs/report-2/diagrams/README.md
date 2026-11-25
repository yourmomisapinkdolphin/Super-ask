# Report Two diagram sources

Mermaid sources, rendered PNGs, and the scripts that assemble the hand-off
pages in `../` (docs/report-2/).

| Files | What |
|---|---|
| `uc1-*.mmd` … `uc11-*.mmd` + `.png` | Sequence diagrams for UC-1, UC-2, UC-3, UC-7, UC-11 (Figures 8–12) |
| `class-overview.mmd` + `.png` | Full class diagram |
| `class-a-*.mmd` … `class-d-*.mmd` + `.png` | Partial class diagrams per use-case group |
| `mermaid-config.json` | Shared Mermaid theme (Arial, sequence spacing) |
| `build_handoff.py` | Writes `../SuperAsk-report2-interaction-diagrams.html` |
| `build_class_handoff.py` | Writes `../SuperAsk-report2-class-diagram.html` |

Updated 2026-11-25 to match the code: UC-1 has the crawled-website fallback,
UC-7 and UC-11 mark what is not built, and the class diagrams add the gateway,
SEA-LION and vLLM providers, the crawl index and web search, and mark the
Facebook and Telegram crawlers as planned. The Report Two PDF keeps the
original figures.

## Rebuild

1. Render each `.mmd` to a `.png` with Mermaid 11, passing
   `mermaid-config.json` as the config. With the Mermaid CLI and a local Chrome:
   `npx @mermaid-js/mermaid-cli@11.4.2 -c mermaid-config.json -s 3 -b white -i uc1-askquestion.mmd -o uc1-askquestion.png`
   (add `-p` with a Puppeteer config whose `executablePath` points at Chrome
   if Puppeteer has no browser of its own).
2. Run `python build_handoff.py` and `python build_class_handoff.py` from this
   folder. Each embeds the PNGs as data URIs and overwrites its page in
   `../` (`docs/report-2/`).
