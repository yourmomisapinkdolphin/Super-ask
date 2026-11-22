import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  corsHeaders,
  guard,
  originAllowed,
  preflight,
  rateLimit,
  resetRateLimits,
} from "@/lib/api/guard";

/**
 * The request guard in front of /api/ask and /api/feedback: an origin check
 * (CORS) and a per-client fixed-window rate limit.
 */

function req(headers: Record<string, string> = {}, url = "https://superask.example/api/ask") {
  return new Request(url, { method: "POST", headers });
}

beforeEach(() => {
  resetRateLimits();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("origin check", () => {
  it("accepts a request with no Origin header (not a browser cross-origin call)", () => {
    expect(originAllowed(req())).toBe(true);
  });

  it("accepts the site's own origin", () => {
    expect(originAllowed(req({ origin: "https://superask.example" }))).toBe(true);
  });

  it("accepts the forwarded host behind a proxy", () => {
    const r = req(
      { origin: "https://public.example", "x-forwarded-host": "public.example" },
      "http://internal:3000/api/ask",
    );
    expect(originAllowed(r)).toBe(true);
  });

  it("refuses an unlisted foreign origin", () => {
    expect(originAllowed(req({ origin: "https://evil.example" }))).toBe(false);
  });

  it("accepts a foreign origin listed in ALLOWED_ORIGINS", () => {
    vi.stubEnv("ALLOWED_ORIGINS", "https://partner.example, https://other.example/");
    expect(originAllowed(req({ origin: "https://partner.example" }))).toBe(true);
    expect(originAllowed(req({ origin: "https://other.example" }))).toBe(true);
  });

  it("sends CORS headers only to an allowed caller", () => {
    vi.stubEnv("ALLOWED_ORIGINS", "https://partner.example");
    expect(corsHeaders(req({ origin: "https://partner.example" }))["Access-Control-Allow-Origin"]).toBe(
      "https://partner.example",
    );
    expect(corsHeaders(req({ origin: "https://evil.example" }))).toEqual({});
  });

  it("answers a preflight with 204 when allowed and 403 when not", () => {
    vi.stubEnv("ALLOWED_ORIGINS", "https://partner.example");
    expect(preflight(req({ origin: "https://partner.example" })).status).toBe(204);
    expect(preflight(req({ origin: "https://evil.example" })).status).toBe(403);
  });

  it("refuses a foreign origin with 403 before counting it", async () => {
    const res = guard(req({ origin: "https://evil.example" }), "ask");
    expect(res?.status).toBe(403);
  });
});

describe("rate limit", () => {
  it("allows up to the limit, then asks the client to wait", () => {
    vi.stubEnv("RATE_LIMIT_PER_MINUTE", "3");
    const r = req({ "x-forwarded-for": "203.0.113.7" });
    const t = 1_000_000;
    expect(rateLimit(r, "ask", t)).toBe(0);
    expect(rateLimit(r, "ask", t + 1)).toBe(0);
    expect(rateLimit(r, "ask", t + 2)).toBe(0);
    expect(rateLimit(r, "ask", t + 3)).toBeGreaterThan(0);
  });

  it("opens a new window after a minute", () => {
    vi.stubEnv("RATE_LIMIT_PER_MINUTE", "1");
    const r = req({ "x-forwarded-for": "203.0.113.8" });
    const t = 2_000_000;
    expect(rateLimit(r, "ask", t)).toBe(0);
    expect(rateLimit(r, "ask", t + 10)).toBeGreaterThan(0);
    expect(rateLimit(r, "ask", t + 60_000)).toBe(0);
  });

  it("counts clients and endpoints separately", () => {
    vi.stubEnv("RATE_LIMIT_PER_MINUTE", "1");
    const a = req({ "x-forwarded-for": "198.51.100.1" });
    const b = req({ "x-forwarded-for": "198.51.100.2" });
    expect(rateLimit(a, "ask")).toBe(0);
    expect(rateLimit(b, "ask")).toBe(0);
    expect(rateLimit(a, "feedback")).toBe(0);
    expect(rateLimit(a, "ask")).toBeGreaterThan(0);
  });

  it("returns 429 with Retry-After over the limit", async () => {
    vi.stubEnv("RATE_LIMIT_PER_MINUTE", "1");
    const r = () => req({ "x-forwarded-for": "192.0.2.50" });
    expect(guard(r(), "ask")).toBeNull();
    const res = guard(r(), "ask");
    expect(res?.status).toBe(429);
    expect(Number(res?.headers.get("Retry-After"))).toBeGreaterThan(0);
  });
});
