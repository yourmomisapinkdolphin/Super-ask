import { describe, it, expect, afterEach, vi } from "vitest";
import { WEB_NOTICE } from "@/lib/ui/copy";

/**
 * The live web-search step, end to end through the engine, with Tavily's HTTP
 * API stubbed. It is the last sourced step before a refusal, so these check
 * that it runs only when switched on, sends what Tavily expects, and never
 * serves a web page without labelling and linking it.
 */

const QUESTION = "how do i apply for a fishing permit";

const TAVILY_RESULTS = {
  results: [
    {
      url: "https://fisheries.example.gov.kh/permits",
      title: "Fishing permits",
      content:
        "To apply for a fishing permit, submit the application form to the Fisheries Administration cantonment with a copy of your identity card and the boat registration card.",
    },
    // Dropped: not an http(s) page.
    { url: "javascript:alert(1)", title: "x", content: "x".repeat(200) },
    // Dropped: too short to answer anything.
    { url: "https://short.example.com/", title: "Short", content: "Fishing." },
  ],
};

function stubTavily(response: Response | Error) {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function loadAsk(env: Record<string, string> = {}) {
  vi.resetModules();
  const defaults: Record<string, string> = {
    LLM_PROVIDER: "extractive",
    DIAGNOSTICS_ENABLED: "true",
    GENERAL_FALLBACK_ENABLED: "false",
    // Off, so the web step is reached on its own rather than after the crawl.
    CRAWL_KB_ENABLED: "false",
    WEB_SEARCH_ENABLED: "true",
    TAVILY_API_KEY: "tvly-test-key",
  };
  for (const [k, v] of Object.entries({ ...defaults, ...env })) vi.stubEnv(k, v);
  return (await import("@/lib/engine")).ask;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("web search — the last sourced step", () => {
  it("answers a coverage gap from a web result, labelled and linked", async () => {
    const fetchMock = stubTavily(Response.json(TAVILY_RESULTS));
    const ask = await loadAsk();
    const res = await ask({ question: QUESTION, history: [] });

    expect(res.tier).toBe(2);
    expect(res.web).toBe(true);
    expect(res.unreviewed).toBe(true);
    expect(res.coverageGap).toBe(true);
    expect(res.answer).toContain("Fisheries Administration cantonment");
    expect(res.answer.endsWith(WEB_NOTICE.en)).toBe(true);
    expect(res.answer).not.toContain("From the approved source");

    expect(res.citations).toHaveLength(1);
    expect(res.citations[0].url).toBe("https://fisheries.example.gov.kh/permits");
    expect(res.citations[0].web).toBe(true);
    expect(res.citations[0].unreviewed).toBe(true);
    expect(res.diagnostics?.refusalReason).toBe("fallback:web_search");
    expect(res.diagnostics?.confidence).toBe("low");

    // What Tavily was sent: the key as a bearer token, never in the body, and
    // the question scoped to Cambodia.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.tavily.com/search");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tvly-test-key");
    const body = JSON.parse(String(init.body));
    expect(body.query).toBe(`${QUESTION} Cambodia`);
    expect(JSON.stringify(body)).not.toContain("tvly-test-key");
  });

  it("is never called when switched off, or when no key is set", async () => {
    const offs: Array<Record<string, string>> = [{ WEB_SEARCH_ENABLED: "false" }, { TAVILY_API_KEY: "" }];
    for (const env of offs) {
      const fetchMock = stubTavily(Response.json(TAVILY_RESULTS));
      const ask = await loadAsk(env);
      const res = await ask({ question: QUESTION, history: [] });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(res.web).toBeFalsy();
      expect(res.diagnostics?.refusalReason).toBe("retrieval:below_floor");
    }
  });

  it("a failed, refused or empty search is the same as no result", async () => {
    for (const response of [
      new Error("network down"),
      new Response("unauthorised", { status: 401 }),
      Response.json({ results: [] }),
    ]) {
      stubTavily(response);
      const ask = await loadAsk();
      const res = await ask({ question: QUESTION, history: [] });
      expect(res.tier).toBe(3);
      expect(res.web).toBeFalsy();
      expect(res.diagnostics?.refusalReason).toBe("retrieval:below_floor");
    }
  });

  it("does not search for a question about one named business", async () => {
    const fetchMock = stubTavily(Response.json(TAVILY_RESULTS));
    const ask = await loadAsk();
    await ask({ question: "Is the trademark 'Baby Outlet' registered in Cambodia?", history: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("toSearchQuery", () => {
  it("adds Cambodia unless the question already names it, in the question's script", async () => {
    const { toSearchQuery } = await import("@/lib/web/search");
    expect(toSearchQuery("how do i get a passport")).toBe("how do i get a passport Cambodia");
    expect(toSearchQuery("passport fee in Cambodia")).toBe("passport fee in Cambodia");
    expect(toSearchQuery("លិខិតឆ្លងដែន")).toBe("លិខិតឆ្លងដែន កម្ពុជា");
    expect(toSearchQuery("  a   b  ")).toBe("a b Cambodia");
  });
});
