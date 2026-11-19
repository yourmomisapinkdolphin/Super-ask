/**
 * Live web search — the step after "neither the approved corpus nor the crawl
 * database has this" and before "SuperAsk cannot answer".
 *
 * Runs only when WEB_SEARCH_ENABLED=true AND TAVILY_API_KEY is set, so tests
 * and offline runs never touch the network.
 *
 * A search API is required. Scraping a search engine's results page without a
 * key was tried and dropped: DuckDuckGo answered with a bot challenge after a
 * few requests, and Bing returned unrelated results to a scripted client.
 *
 * Everything returned here is unreviewed text from the open web. The caller
 * labels it that way and links every claim to the page it came from.
 */

export interface WebResult {
  url: string;
  host: string;
  title: string;
  /** The passage handed to the model. */
  text: string;
}

const SEARCH_TIMEOUT_MS = Number(process.env.WEB_SEARCH_TIMEOUT_MS ?? "10000");
const PASSAGE_CHARS = 1600;

export function webSearchEnabled(): boolean {
  return (
    (process.env.WEB_SEARCH_ENABLED ?? "false").toLowerCase() === "true" &&
    Boolean(process.env.TAVILY_API_KEY?.trim())
  );
}

/** Only public http(s) pages are ever cited from a search result. */
function safeUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  return url;
}

/** The citizen's question as a search query. Procedures here are Cambodian. */
export function toSearchQuery(question: string): string {
  const q = question.replace(/\s+/g, " ").trim().slice(0, 300);
  if (/[ក-៿]/.test(q)) return /កម្ពុជា/.test(q) ? q : `${q} កម្ពុជា`;
  return /cambodia|khmer/i.test(q) ? q : `${q} Cambodia`;
}

/**
 * Search the web for the question. Never throws: a search that fails or times
 * out is the same as one that found nothing, and the caller carries on.
 */
export async function searchWeb(question: string, max = 4): Promise<WebResult[]> {
  if (!webSearchEnabled()) return [];
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAVILY_API_KEY!.trim()}`,
      },
      body: JSON.stringify({
        query: toSearchQuery(question),
        max_results: max,
        search_depth: "basic",
      }),
      signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      results?: Array<{ url?: string; title?: string; content?: string }>;
    };
    const out: WebResult[] = [];
    for (const r of data.results ?? []) {
      const url = r.url ? safeUrl(r.url) : null;
      if (!url || !r.content || r.content.length < 80) continue;
      out.push({
        url: url.toString(),
        host: url.hostname.replace(/^www\./, ""),
        title: (r.title ?? url.hostname).slice(0, 200),
        text: r.content.slice(0, PASSAGE_CHARS),
      });
    }
    return out;
  } catch {
    return [];
  }
}
