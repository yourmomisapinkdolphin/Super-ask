"use client";

/**
 * Structural rendering of an answer body.
 *
 * Government procedure text is almost never prose. It is numbered steps with
 * sub-conditions under them, and rendering it as one undifferentiated block —
 * which is what a plain <div> with pre-wrap does — throws away the structure the
 * ministry wrote and the citizen needs.
 *
 * It matters more in Khmer than in English. Khmer has no inter-word spaces and
 * no capital letters, so a reader gets none of the shape cues that make a wall
 * of English scannable. Indentation, bullets and vertical rhythm do that work.
 *
 * This is presentation only. It re-forms lines the source already contained and
 * never alters, reorders, or summarises them — the verified text is exactly what
 * reaches the screen (FR-14, FR-15).
 */

import { T, fontStack } from "@/lib/ui/theme";

type Block =
  | { kind: "numbered"; marker: string; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "notice"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "para"; text: string };

/** Khmer digits ១-៩ and Latin 1-9, followed by a separator. */
const NUMBERED = /^([០-៩0-9]+)\s*[.)។]\s*(.*)$/;
const BULLET = /^[-*•·▪]\s+(.*)$/;
const MD_HEADING = /^#{1,3}\s+(.+)$/;
/** Short label line ending in a colon — "What you need:", "ឯកសារ៖". */
const SOFT_HEADING = /^(.{2,48})[:：]\s*$/;

/**
 * The extractive provider's lead-in, and the R-07 aboutness warning.
 *
 * The lead-in ("From the approved source:") is matched so it can be DROPPED,
 * not rendered. The full source receipt sits directly beneath every answer
 * (FR-62) carrying ministry, instrument, article and dates, so printing a
 * second, vaguer provenance label immediately above it said the same thing
 * twice and less precisely.
 */
const LABEL = /^(From the approved source|ពីឯកសារយោងដែលបានអនុម័ត)\s*[:：]?\s*$/i;
const NOTICE = /^[⚠️!]\s*/;
const STALE =
  /passed its review date|ហួសកាលបរិច្ឆេទត្រួតពិនិត្យ/i;

/**
 * Markdown emphasis.
 *
 * Only bold is handled, deliberately. It is the one thing the answer contract
 * actually produces, and a general Markdown renderer here would be a licence to
 * interpret link and image syntax inside text that reaches a citizen.
 */
const BOLD = /\*\*(.+?)\*\*/g;
/** A line that is entirely bold is a group heading, not a bold sentence. */
const HEADING = /^\*\*(.+?)\*\*\s*[:：]?\s*$/;

/** Split on **bold** runs, returning React nodes with the markers removed. */
function inline(text: string, keyPrefix: string) {
  const parts: Array<string | { bold: string }> = [];
  let last = 0;

  for (const m of text.matchAll(BOLD)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    parts.push({ bold: m[1] });
    last = at + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));

  if (parts.length === 1 && typeof parts[0] === "string") return text;

  return parts.map((p, i) =>
    typeof p === "string" ? (
      p
    ) : (
      <strong key={`${keyPrefix}-b${i}`} style={{ fontWeight: 700 }}>
        {p.bold}
      </strong>
    ),
  );
}

function parse(text: string): Block[] {
  const blocks: Block[] = [];

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (LABEL.test(line)) continue;

    if (NOTICE.test(line) || STALE.test(line)) {
      blocks.push({
        kind: "notice",
        text: line.replace(NOTICE, "").trim(),
      });
      continue;
    }

    const mdHeading = MD_HEADING.exec(line);
    if (mdHeading?.[1]) {
      blocks.push({ kind: "heading", text: mdHeading[1].replace(BOLD, "$1").trim() });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading?.[1]) {
      blocks.push({ kind: "heading", text: heading[1].trim() });
      continue;
    }

    const soft = SOFT_HEADING.exec(line);
    if (soft?.[1] && !NUMBERED.test(line)) {
      blocks.push({ kind: "heading", text: soft[1].replace(BOLD, "$1").trim() });
      continue;
    }

    const numbered = NUMBERED.exec(line);
    if (numbered?.[2]) {
      blocks.push({ kind: "numbered", marker: numbered[1], text: numbered[2] });
      continue;
    }

    const bullet = BULLET.exec(line);
    if (bullet?.[1]) {
      blocks.push({ kind: "bullet", text: bullet[1] });
      continue;
    }

    blocks.push({ kind: "para", text: line });
  }

  return blocks;
}

function prevKind(blocks: Block[], i: number): Block["kind"] | null {
  return i > 0 ? blocks[i - 1].kind : null;
}

export function AnswerText({ text }: { text: string }) {
  const blocks = parse(text);

  return (
    <div
      className="ag-answer km"
      style={{
        fontFamily: fontStack,
        fontSize: 15,
        color: T.ink,
        letterSpacing: "0.01em",
      }}
    >
      {blocks.map((b, i) => {
        const key = `${b.kind}-${i}`;
        const prev = prevKind(blocks, i);

        if (b.kind === "notice") {
          return (
            <div
              key={key}
              style={{
                marginTop: 16,
                padding: "12px 14px",
                borderLeft: `3px solid ${T.notice}`,
                background: T.noticeWash,
                borderRadius: 8,
                fontSize: 13.5,
                lineHeight: 1.75,
                color: T.noticeText,
                fontFamily: fontStack,
              }}
            >
              {inline(b.text, key)}
            </div>
          );
        }

        if (b.kind === "heading") {
          return (
            <div
              key={key}
              className="km"
              style={{
                marginTop: i === 0 ? 0 : 22,
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: `1px solid ${T.lineSoft}`,
                fontWeight: 700,
                fontSize: 13,
                color: T.deep,
                letterSpacing: "0.02em",
                lineHeight: 1.55,
                fontFamily: fontStack,
              }}
            >
              {b.text}
            </div>
          );
        }

        if (b.kind === "numbered") {
          return (
            <div
              key={key}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                marginTop: i === 0 ? 0 : prev === "numbered" ? 10 : 16,
              }}
            >
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  width: 26,
                  height: 26,
                  marginTop: 2,
                  borderRadius: 999,
                  background: T.skyWash,
                  color: T.deep,
                  fontWeight: 700,
                  fontSize: 12.5,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fontStack,
                  lineHeight: 1,
                }}
              >
                {b.marker}
              </span>
              <span
                style={{
                  flex: 1,
                  fontWeight: 500,
                  lineHeight: 1.85,
                  paddingTop: 2,
                  fontFamily: fontStack,
                }}
              >
                {inline(b.text, key)}
              </span>
            </div>
          );
        }

        if (b.kind === "bullet") {
          return (
            <div
              key={key}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                marginTop: i === 0 ? 0 : prev === "bullet" ? 6 : 12,
                padding: "7px 10px",
                borderRadius: 10,
                background: T.page,
              }}
            >
              <span
                style={{
                  color: T.sky,
                  flexShrink: 0,
                  lineHeight: 1.85,
                  fontSize: 16,
                  fontFamily: fontStack,
                }}
                aria-hidden
              >
                •
              </span>
              <span style={{ flex: 1, lineHeight: 1.85, fontFamily: fontStack }}>
                {inline(b.text, key)}
              </span>
            </div>
          );
        }

        return (
          <p
            key={key}
            style={{
              marginTop: i === 0 ? 0 : 14,
              marginBottom: 0,
              lineHeight: 1.85,
              fontFamily: fontStack,
              color: T.ink,
            }}
          >
            {inline(b.text, key)}
          </p>
        );
      })}
    </div>
  );
}
