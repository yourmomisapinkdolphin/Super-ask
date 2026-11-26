import type { AskResponse } from "@/lib/types";
import { formatTelegramAnswer } from "@/lib/telegram/format";

/** Same plain-text answer layout as Telegram — citations + disclaimer. */
export function formatMessengerAnswer(res: AskResponse): string {
  return formatTelegramAnswer(res);
}

export function welcomeMessage(): string {
  return [
    "SuperAsk — Cambodian government service information.",
    "",
    "Just type your question here in Messenger.",
    "",
    "សួរសំណួររបស់អ្នកនៅទីនេះបានហើយ។",
    "",
    "Example / ឧទាហរណ៍:",
    "How do I renew my driving licence?",
  ].join("\n");
}
