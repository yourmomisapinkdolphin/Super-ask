/**
 * POST /api/telegram/webhook
 *
 * Telegram → SuperAsk. Citizens can:
 *   · text the bot directly, or
 *   · open the SuperAsk Mini App (same /chat UI inside Telegram).
 *
 * Auth: header `X-Telegram-Bot-Api-Secret-Token` must match
 * TELEGRAM_WEBHOOK_SECRET. In production the secret is REQUIRED: without it
 * anyone who finds this URL can post fake updates and make the bot message
 * any chat that has started it. Local development may run unsigned; a
 * deployment that genuinely needs to can set TELEGRAM_ALLOW_UNSIGNED=true.
 */

function isProduction(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

/** Constant-time comparison, so the secret cannot be guessed byte by byte. */
function secretMatches(header: string | null, secret: string): boolean {
  if (!header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ask } from "@/lib/engine";
import { recordAnswer } from "@/lib/log/audit";
import {
  channelKeyboard,
  sendChatAction,
  sendMessage,
} from "@/lib/telegram/client";
import {
  ASK_BY_TEXT_LABEL,
  formatTelegramAnswer,
  textModeHint,
  welcomeMessage,
} from "@/lib/telegram/format";
import { appendTurn, getHistory } from "@/lib/telegram/history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_QUESTION = 1000;

interface TgMessage {
  message_id: number;
  text?: string;
  chat: { id: number; type: string };
  from?: { id: number; language_code?: string };
}

interface TgUpdate {
  update_id: number;
  message?: TgMessage;
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (!secretMatches(header, secret)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (isProduction() && process.env.TELEGRAM_ALLOW_UNSIGNED !== "true") {
    console.error(
      "[telegram] TELEGRAM_WEBHOOK_SECRET is not set; refusing unsigned webhook calls in production",
    );
    return NextResponse.json(
      { error: "TELEGRAM_WEBHOOK_SECRET is not configured" },
      { status: 503 },
    );
  }

  if (!process.env.TELEGRAM_BOT_TOKEN?.trim()) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN is not configured" },
      { status: 503 },
    );
  }

  let update: TgUpdate;
  try {
    update = (await request.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const message = update.message;
  if (!message?.text?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = message.text.trim();
  const keyboard = channelKeyboard();

  try {
    if (
      /^\/start(?:@\w+)?(?:\s|$)/i.test(text) ||
      /^\/help(?:@\w+)?$/i.test(text) ||
      /^\/app(?:@\w+)?$/i.test(text)
    ) {
      await sendMessage(chatId, welcomeMessage(), {
        replyToMessageId: message.message_id,
        replyMarkup: keyboard,
      });
      return NextResponse.json({ ok: true });
    }

    if (text === ASK_BY_TEXT_LABEL) {
      await sendMessage(chatId, textModeHint(), {
        replyToMessageId: message.message_id,
        replyMarkup: keyboard,
      });
      return NextResponse.json({ ok: true });
    }

    // Ignore other slash commands quietly.
    if (text.startsWith("/")) {
      return NextResponse.json({ ok: true });
    }

    if (text.length > MAX_QUESTION) {
      await sendMessage(
        chatId,
        `Please keep your question under ${MAX_QUESTION} characters.`,
        { replyToMessageId: message.message_id, replyMarkup: keyboard },
      );
      return NextResponse.json({ ok: true });
    }

    await sendChatAction(chatId, "typing");

    const history = getHistory(chatId);
    const response = await ask({
      question: text,
      history,
      sessionId: `tg:${chatId}`,
    });

    await recordAnswer(text, response, `tg:${chatId}`);

    const reply = formatTelegramAnswer(response);
    await sendMessage(chatId, reply, {
      replyToMessageId: message.message_id,
      replyMarkup: keyboard,
    });

    appendTurn(chatId, "user", text);
    appendTurn(chatId, "assistant", response.answer, {
      tier: response.tier,
      sources: response.citations.map((c) => c.id),
    });
  } catch (err) {
    console.error("[/api/telegram/webhook]", err);
    try {
      await sendMessage(
        chatId,
        "SuperAsk could not process that just now. Please try again in a moment.",
        { replyToMessageId: message.message_id, replyMarkup: keyboard },
      );
    } catch {
      /* ignore secondary send failure */
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    service: "superask-telegram-webhook",
    configured: Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim()),
  });
}
