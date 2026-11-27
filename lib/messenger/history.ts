/**
 * Short per-PSID history for Messenger multi-turn.
 *
 * Same shape as Telegram history: warm instances keep context; cold starts
 * lose it. Fine for Phase 0.
 */

import type { HistoryTurn } from "@/lib/types";

type Turn = HistoryTurn;

const MAX_TURNS = 8;
const MAX_CHATS = 500;

type Store = Map<string, Turn[]>;

function store(): Store {
  const g = globalThis as typeof globalThis & { __superaskMsgHistory?: Store };
  if (!g.__superaskMsgHistory) g.__superaskMsgHistory = new Map();
  return g.__superaskMsgHistory;
}

export function getHistory(psid: string): Turn[] {
  return store().get(psid) ?? [];
}

export function appendTurn(
  psid: string,
  role: "user" | "assistant",
  text: string,
  /** For an assistant turn: its tier and the ids of the sources it cited. */
  meta: Pick<HistoryTurn, "tier" | "sources"> = {},
): void {
  const s = store();
  const prev = s.get(psid) ?? [];
  const next = [...prev, { role, text, ...meta }].slice(-MAX_TURNS);
  s.set(psid, next);

  if (s.size > MAX_CHATS) {
    const first = s.keys().next().value;
    if (first !== undefined) s.delete(first);
  }
}
