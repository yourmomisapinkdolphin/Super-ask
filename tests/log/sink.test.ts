import { describe, it, expect, vi, afterEach } from "vitest";
import type { AskResponse } from "@/lib/types";

/**
 * Where audit records go. On Vercel the filesystem under var/ is read-only or
 * wiped, so records must reach stdout (the host's retained logs) instead of
 * vanishing. They are redacted before either destination (FR-56).
 */

const res: AskResponse = {
  id: "a-1",
  tier: 2,
  lang: "en",
  answer: "Call 012 345 678 for help.",
  citations: [],
  coverageGap: false,
};

async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import("@/lib/log/audit");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("audit sink", () => {
  it("writes redacted records to stdout on Vercel instead of a file that is lost", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { recordAnswer } = await load({ VERCEL: "1", AUDIT_LOG_SINK: "" });
    await recordAnswer("my email is sok@example.com", res);

    const line = log.mock.calls.map((c) => String(c[0])).find((l) => l.startsWith("[audit] "));
    expect(line).toBeDefined();
    const record = JSON.parse(line!.slice("[audit] ".length));
    expect(record.id).toBe("a-1");
    expect(record.question).toContain("[EMAIL]");
    expect(record.question).not.toContain("sok@example.com");
    expect(record.answer).not.toContain("345 678");
  });

  it("honours AUDIT_LOG_SINK=stdout off Vercel", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { recordFeedback } = await load({ AUDIT_LOG_SINK: "stdout" });
    await recordFeedback({ answerId: "a-1", kind: "helpful", citedIds: [], ministries: [] });
    expect(log.mock.calls.some((c) => String(c[0]).startsWith("[feedback] "))).toBe(true);
  });
});
