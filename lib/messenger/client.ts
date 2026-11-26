/**
 * Meta Messenger Send API client.
 *
 * Token lives in MESSENGER_PAGE_ACCESS_TOKEN only — never in source, never in
 * the client. Messages go to the Facebook Page that owns the token.
 */

const GRAPH = "https://graph.facebook.com/v21.0";

function token(): string {
  const t = process.env.MESSENGER_PAGE_ACCESS_TOKEN?.trim();
  if (!t) throw new Error("MESSENGER_PAGE_ACCESS_TOKEN is not set");
  return t;
}

export async function sendText(recipientId: string, text: string): Promise<void> {
  // Messenger hard-caps a single text message at 2000 characters.
  for (const chunk of splitMessage(text, 1900)) {
    const res = await fetch(`${GRAPH}/me/messages?access_token=${encodeURIComponent(token())}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: "RESPONSE",
        message: { text: chunk },
      }),
    });
    const data = (await res.json()) as { error?: { message?: string } };
    if (!res.ok || data.error) {
      throw new Error(data.error?.message || `Messenger send failed (${res.status})`);
    }
  }
}

export async function sendTypingOn(recipientId: string): Promise<void> {
  await fetch(`${GRAPH}/me/messages?access_token=${encodeURIComponent(token())}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      sender_action: "typing_on",
    }),
  });
}

function splitMessage(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > max) {
    let cut = rest.lastIndexOf("\n", max);
    if (cut < max * 0.5) cut = max;
    parts.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  if (rest) parts.push(rest);
  return parts;
}
