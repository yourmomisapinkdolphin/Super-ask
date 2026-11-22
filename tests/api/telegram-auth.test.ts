import { describe, it, expect, vi, afterEach } from "vitest";

/**
 * The Telegram webhook must not accept unsigned calls in production: without
 * the shared secret anyone who finds the URL can make the bot message any
 * chat that has started it.
 */

async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return (await import("@/app/api/telegram/webhook/route")).POST;
}

function update(headers: Record<string, string> = {}) {
  return new Request("https://superask.example/api/telegram/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ update_id: 1 }),
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("telegram webhook auth", () => {
  it("rejects a wrong secret", async () => {
    const POST = await load({ TELEGRAM_WEBHOOK_SECRET: "s3cret-value", TELEGRAM_BOT_TOKEN: "t" });
    const res = await POST(update({ "x-telegram-bot-api-secret-token": "wrong-value!" }));
    expect(res.status).toBe(401);
  });

  it("rejects a missing secret header", async () => {
    const POST = await load({ TELEGRAM_WEBHOOK_SECRET: "s3cret-value", TELEGRAM_BOT_TOKEN: "t" });
    expect((await POST(update())).status).toBe(401);
  });

  it("refuses unsigned calls in production when no secret is configured", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const POST = await load({ TELEGRAM_WEBHOOK_SECRET: "", VERCEL_ENV: "production", TELEGRAM_BOT_TOKEN: "t" });
    expect((await POST(update())).status).toBe(503);
  });

  it("accepts the right secret", async () => {
    const POST = await load({ TELEGRAM_WEBHOOK_SECRET: "s3cret-value", TELEGRAM_BOT_TOKEN: "t" });
    const res = await POST(update({ "x-telegram-bot-api-secret-token": "s3cret-value" }));
    // No message in the update, so nothing to answer — but it got past auth.
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(503);
  });
});
