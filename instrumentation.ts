/**
 * Next.js server start hook.
 *
 * Builds the knowledge-base indexes when a server instance starts, not on the
 * first citizen request. Indexing the full corpus takes seconds; without this
 * the first question to every fresh instance pays that cost on top of the model
 * call, which is what pushes a cold response past the 5-second target (REQ-24).
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.KB_WARMUP === "false") return;
  try {
    const { getKb } = await import("@/lib/kb/loader");
    const started = Date.now();
    const kb = getKb();
    console.log(
      `[kb] indexed ${kb.chunks.length} passages in ${Date.now() - started} ms`,
    );
  } catch (err) {
    // A failed warm-up is not fatal: the first request builds the index.
    console.error("[kb] warm-up failed; indexing on first request", err);
  }
}
