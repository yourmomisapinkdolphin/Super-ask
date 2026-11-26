/**
 * Node-only KB warm-up. Kept in its own file so the Edge compile of
 * instrumentation.ts never sees `node:fs` (UnhandledSchemeError in next dev).
 */

export async function warmKb(): Promise<void> {
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
