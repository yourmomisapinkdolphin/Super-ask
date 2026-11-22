/**
 * Request guard for the public JSON endpoints (/api/ask, /api/feedback).
 *
 * Two checks run before a handler does any work:
 *
 *   CORS     The citizen interface calls these endpoints from its own origin.
 *            A browser request from any other origin is refused unless that
 *            origin is listed in ALLOWED_ORIGINS (comma-separated), so another
 *            site cannot spend SuperAsk's model budget from its visitors'
 *            browsers. Requests with no Origin header (curl, server-to-server,
 *            same-origin GET) are not browser cross-origin calls and pass.
 *
 *   Rate     A fixed-window limit per client IP (RATE_LIMIT_PER_MINUTE,
 *            default 120). Held in memory on globalThis, so on a serverless host
 *            it is per instance: a brake on a runaway client, not a quota. The
 *            default is generous on purpose: Cambodian mobile carriers put
 *            many subscribers behind one carrier-grade NAT address, as does a
 *            school or office network, and they must not throttle each other. A
 *            shared store (Redis, the host's KV) replaces it in production.
 *
 * The Telegram webhook does not use this guard: it is authenticated by its
 * shared secret, and Telegram's servers are a single caller.
 */

import { NextResponse } from "next/server";

const WINDOW_MS = 60_000;
const MAX_TRACKED_CLIENTS = 10_000;

function limitPerMinute(): number {
  const n = Number(process.env.RATE_LIMIT_PER_MINUTE ?? "120");
  return Number.isFinite(n) && n > 0 ? n : 120;
}

function allowedOrigins(): Set<string> {
  return new Set(
    (process.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((o) => o.trim().replace(/\/$/, ""))
      .filter(Boolean),
  );
}

/** Is this request's Origin acceptable? Same-origin and listed origins are. */
export function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const normalised = origin.replace(/\/$/, "");
  try {
    if (new URL(normalised).host === new URL(request.url).host) return true;
  } catch {
    return false;
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    try {
      if (new URL(normalised).host === host) return true;
    } catch {
      return false;
    }
  }
  return allowedOrigins().has(normalised);
}

/** CORS response headers for an allowed cross-origin caller, else none. */
export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin || !originAllowed(request)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

/** Preflight response for an OPTIONS request. */
export function preflight(request: Request): Response {
  if (!originAllowed(request)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

type Window = { start: number; count: number };
const STORE_KEY = Symbol.for("superask.rate-limit");
const slot = globalThis as unknown as { [STORE_KEY]?: Map<string, Window> };

function store(): Map<string, Window> {
  if (!slot[STORE_KEY]) slot[STORE_KEY] = new Map();
  return slot[STORE_KEY];
}

/**
 * Count this request against its client's window.
 * Returns the seconds to wait when the client is over the limit, else 0.
 */
export function rateLimit(request: Request, bucket: string, now = Date.now()): number {
  const windows = store();
  const key = `${bucket}:${clientKey(request)}`;
  const current = windows.get(key);

  if (!current || now - current.start >= WINDOW_MS) {
    if (windows.size >= MAX_TRACKED_CLIENTS) {
      // Drop expired windows; if all are live, drop the oldest entry.
      for (const [k, w] of windows) {
        if (now - w.start >= WINDOW_MS) windows.delete(k);
      }
      if (windows.size >= MAX_TRACKED_CLIENTS) {
        const oldest = windows.keys().next().value;
        if (oldest !== undefined) windows.delete(oldest);
      }
    }
    windows.set(key, { start: now, count: 1 });
    return 0;
  }

  current.count += 1;
  if (current.count <= limitPerMinute()) return 0;
  return Math.max(1, Math.ceil((current.start + WINDOW_MS - now) / 1000));
}

/** Clear all rate-limit windows. Tests only. */
export function resetRateLimits(): void {
  store().clear();
}

/**
 * Run both checks. Returns a ready error response when the request must be
 * refused, or null when the handler should continue.
 */
export function guard(request: Request, bucket: string): Response | null {
  if (!originAllowed(request)) {
    return NextResponse.json(
      { error: "Origin not allowed" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  const wait = rateLimit(request, bucket);
  if (wait > 0) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(wait),
          "Cache-Control": "no-store",
          ...corsHeaders(request),
        },
      },
    );
  }
  return null;
}
