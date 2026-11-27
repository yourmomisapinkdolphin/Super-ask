/**
 * Public channel links shown on the marketing site and in the chat header.
 *
 * MOCK fallbacks: set NEXT_PUBLIC_TELEGRAM_BOT (username, no @) and
 * NEXT_PUBLIC_MESSENGER_URL in the environment once the real handles exist.
 *
 * Messenger stays "coming soon" until Meta credentials are wired and this
 * flag is flipped — the webhook code can ship ahead of the public link.
 */

/** Public origin of the website, used for the QR code on the Web channel card. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://superask.vercel.app"
).replace(/\/$/, "");

export const WEB_CHAT_URL = `${SITE_URL}/chat`;

export const TELEGRAM_BOT =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT?.trim().replace(/^@/, "") ||
  "superask168_bot";

export const TELEGRAM_HANDLE = `@${TELEGRAM_BOT}`;

export const TELEGRAM_URL = `https://t.me/${TELEGRAM_BOT}`;

/** Public Messenger entry is not live yet. */
export const MESSENGER_COMING_SOON = true;

export const MESSENGER_URL =
  process.env.NEXT_PUBLIC_MESSENGER_URL?.trim() || "https://m.me/superaskkh";
