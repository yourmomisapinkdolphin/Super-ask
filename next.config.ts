import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  // The knowledge base is read from disk at request time in the Node runtime.
  // Keep it out of the client bundle.
  serverExternalPackages: ["@anthropic-ai/sdk"],
  // Do not announce the framework. It tells a scanner picking targets by stack
  // exactly what this is, and buys nothing. The reverse proxy also strips it,
  // but a deployment should not depend on the proxy to avoid disclosing this.
  poweredByHeader: false,
  // instrumentation.ts dynamically imports the Node-only warm-up. Webpack still
  // resolves that import when compiling the Edge copy of instrumentation, which
  // then chokes on `node:fs` (UnhandledSchemeError) and 500s every page in
  // `next dev`. Point the warm-up at an empty module for Edge only.
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === "edge") {
      config.resolve.alias = {
        ...config.resolve.alias,
        "./instrumentation.node": false,
        "./instrumentation.node.ts": false,
      };
    }
    return config;
  },
  // The engine reads data/ from disk at request time. Ship the crawl search
  // index with every function that answers questions, and keep the crawl
  // database it was built from (55 MB of JSON and SQLite the engine never
  // opens) out of the function bundle.
  outputFileTracingIncludes: {
    "/api/ask": ["./data/crawl/index/*"],
    "/api/health": ["./data/crawl/index/*"],
    "/api/telegram/webhook": ["./data/crawl/index/*"],
    "/api/messenger/webhook": ["./data/crawl/index/*"],
  },
  outputFileTracingExcludes: {
    "/**": [
      "data/crawl/db/**/*",
      "data/crawl/raw/**/*",
      "data/crawl/*.db", "data/crawl/verification*",
      "docs/**/*",
    ],
  },
  async headers() {
    return [
      // Telegram Mini App — must be embeddable (no X-Frame-Options: DENY).
      {
        source: "/chat",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://web.telegram.org https://telegram.org https://*.telegram.org;",
          },
        ],
      },
      // Everything else stays unframed.
      {
        source: "/",
        headers: [
          ...securityHeaders,
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/login",
        headers: [
          ...securityHeaders,
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/register",
        headers: [
          ...securityHeaders,
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
