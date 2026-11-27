/**
 * GET/POST /api/messenger/webhook
 *
 * Meta Messenger → SuperAsk. Citizens message the Facebook Page; we answer
 * with the same /ask engine as web and Telegram.
 *
 * Setup (Meta Developer Console → your app → Messenger → Webhooks):
 *   Callback URL:  https://<host>/api/messenger/webhook
 *   Verify Token:  value of MESSENGER_VERIFY_TOKEN
 *   Subscribe:     messages, messaging_postbacks
 *
 * Auth on POST: X-Hub-Signature-256 must match HMAC-SHA256 of the raw body
 * with MESSENGER_APP_SECRET. In production the secret is REQUIRED.
 */

function isProduction(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ask } from "@/lib/engine";
import { recordAnswer } from "@/lib/log/audit";
import { sendText, sendTypingOn } from "@/lib/messenger/client";
import { formatMessengerAnswer, welcomeMessage } from "@/lib/messenger/format";
import { appendTurn, getHistory } from "@/lib/messenger/history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_QUESTION = 1000;

interface MessagingEvent {
  sender?: { id?: string };
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
    quick_reply?: { payload?: string };
  };
  postback?: { payload?: string; title?: string };
}

interface WebhookBody {
  object?: string;
  entry?: Array<{ messaging?: MessagingEvent[] }>;
}

function signatureMatches(rawBody: string, header: string | null, secret: string): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const provided = header.slice("sha256=".length);
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(provided, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Meta's webhook verification handshake. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.MESSENGER_VERIFY_TOKEN?.trim();

  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json(
    {
      service: "superask-messenger-webhook",
      configured: Boolean(process.env.MESSENGER_PAGE_ACCESS_TOKEN?.trim()),
    },
    { status: mode || token ? 403 : 200 },
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.MESSENGER_APP_SECRET?.trim();

  if (secret) {
    const header = request.headers.get("x-hub-signature-256");
    if (!signatureMatches(rawBody, header, secret)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (isProduction() && process.env.MESSENGER_ALLOW_UNSIGNED !== "true") {
    console.error(
      "[messenger] MESSENGER_APP_SECRET is not set; refusing unsigned webhook calls in production",
    );
    return NextResponse.json(
      { error: "MESSENGER_APP_SECRET is not configured" },
      { status: 503 },
    );
  }

  if (!process.env.MESSENGER_PAGE_ACCESS_TOKEN?.trim()) {
    return NextResponse.json(
      { error: "MESSENGER_PAGE_ACCESS_TOKEN is not configured" },
      { status: 503 },
    );
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(rawBody) as WebhookBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Always 200 quickly for non-page events so Meta does not disable the webhook.
  if (body.object !== "page") {
    return NextResponse.json({ ok: true });
  }

  const events = (body.entry ?? []).flatMap((e) => e.messaging ?? []);

  // Process sequentially so one chat's typing/answer stay in order. Meta allows
  // up to ~20s before it retries; ask() is usually under that.
  for (const event of events) {
    await handleEvent(event);
  }

  return NextResponse.json({ ok: true });
}

async function handleEvent(event: MessagingEvent): Promise<void> {
  const psid = event.sender?.id?.trim();
  if (!psid) return;

  // Echoes are our own outbound messages mirrored back — ignore them.
  if (event.message?.is_echo) return;

  const postback = event.postback?.payload?.trim() || event.postback?.title?.trim();
  const text = (event.message?.text ?? postback ?? "").trim();
  if (!text) return;

  try {
    if (
      /^get[_\s-]?started$/i.test(text) ||
      /^\/start$/i.test(text) ||
      /^\/help$/i.test(text) ||
      /^hi$/i.test(text) ||
      /^hello$/i.test(text)
    ) {
      await sendText(psid, welcomeMessage());
      return;
    }

    if (text.length > MAX_QUESTION) {
      await sendText(
        psid,
        `Please keep your question under ${MAX_QUESTION} characters.`,
      );
      return;
    }

    await sendTypingOn(psid);

    const history = getHistory(psid);
    const response = await ask({
      question: text,
      history,
      sessionId: `msg:${psid}`,
    });

    await recordAnswer(text, response, `msg:${psid}`);
    await sendText(psid, formatMessengerAnswer(response));

    appendTurn(psid, "user", text);
    appendTurn(psid, "assistant", response.answer, {
      tier: response.tier,
      sources: response.citations.map((c) => c.id),
    });
  } catch (err) {
    console.error("[/api/messenger/webhook]", err);
    try {
      await sendText(
        psid,
        "SuperAsk could not process that just now. Please try again in a moment.",
      );
    } catch {
      /* ignore secondary send failure */
    }
  }
}
