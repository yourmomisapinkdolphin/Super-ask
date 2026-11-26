/**
 * Next.js server start hook.
 *
 * Builds the knowledge-base indexes when a server instance starts, not on the
 * first citizen request. Indexing the full corpus takes seconds; without this
 * the first question to every fresh instance pays that cost on top of the model
 * call, which is what pushes a cold response past the 5-second target (REQ-24).
 *
 * The warm-up lives in instrumentation.node.ts and is imported only for the
 * Node runtime. Webpack still follows a dynamic import into the Edge bundle of
 * this file; aliasing that module away for Edge (see next.config.ts) stops
 * `node:fs` from being compiled there.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { warmKb } = await import("./instrumentation.node");
  await warmKb();
}
