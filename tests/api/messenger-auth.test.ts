import { createHmac } from "node:crypto";
import { describe, it, expect, vi, afterEach } from "vitest";

/**
 * The Messenger webhook must not accept unsigned calls in production: without
 * the app secret anyone who finds the URL can forge messages as the Page.
 */

async function loadPost(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return (await import("@/app/api/messenger/webhook/route")).POST;
}

async function loadGet(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return (await import("@/app/api/messenger/webhook/route")).GET;
}

function signedRequest(body: string, secret: string, headers: Record<string, string> = {}) {
  const sig = createHmac("sha256", secret).update(body, "utf8").digest("hex");
  return new Request("https://superask.example/api/messenger/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hub-signature-256": `sha256=${sig}`,
      ...headers,
    },
    body,
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("messenger webhook auth", () => {
  it("rejects a wrong signature", async () => {
    const POST = await loadPost({
      MESSENGER_APP_SECRET: "app-secret",
      MESSENGER_PAGE_ACCESS_TOKEN: "page-token",
    });
    const body = JSON.stringify({ object: "page", entry: [] });
    const res = await POST(
      new Request("https://superask.example/api/messenger/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": "sha256=deadbeef",
        },
        body,
      }),
    );
    expect(res.status).toBe(401);
  });

  it("rejects a missing signature header", async () => {
    const POST = await loadPost({
      MESSENGER_APP_SECRET: "app-secret",
      MESSENGER_PAGE_ACCESS_TOKEN: "page-token",
    });
    const res = await POST(
      new Request("https://superask.example/api/messenger/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ object: "page", entry: [] }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("refuses unsigned calls in production when no secret is configured", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const POST = await loadPost({
      MESSENGER_APP_SECRET: "",
      MESSENGER_PAGE_ACCESS_TOKEN: "page-token",
      VERCEL_ENV: "production",
    });
    const res = await POST(
      new Request("https://superask.example/api/messenger/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ object: "page", entry: [] }),
      }),
    );
    expect(res.status).toBe(503);
  });

  it("accepts a valid signature", async () => {
    const secret = "app-secret";
    const POST = await loadPost({
      MESSENGER_APP_SECRET: secret,
      MESSENGER_PAGE_ACCESS_TOKEN: "page-token",
    });
    const body = JSON.stringify({ object: "page", entry: [] });
    const res = await POST(signedRequest(body, secret));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(503);
  });

  it("returns the hub.challenge when the verify token matches", async () => {
    const GET = await loadGet({ MESSENGER_VERIFY_TOKEN: "verify-me" });
    const res = await GET(
      new Request(
        "https://superask.example/api/messenger/webhook?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=12345",
      ),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("12345");
  });

  it("rejects a wrong verify token", async () => {
    const GET = await loadGet({ MESSENGER_VERIFY_TOKEN: "verify-me" });
    const res = await GET(
      new Request(
        "https://superask.example/api/messenger/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345",
      ),
    );
    expect(res.status).toBe(403);
  });
});
