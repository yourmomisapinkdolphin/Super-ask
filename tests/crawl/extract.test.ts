import { describe, it, expect } from "vitest";
import { extract } from "@/lib/crawl/extract";

describe("extract", () => {
  /**
   * news.gdi.gov.kh opens every page with an Alpine attribute holding an arrow
   * function. The tag used to end at the arrow's ">", so each page's text began
   * with "localStorage.setItem('darkMode', val))">" and a citizen would have
   * been shown it as the start of the passage.
   */
  it("does not end a tag at a > inside a quoted attribute", () => {
    const html =
      `<html><body x-data="{ darkMode: false }" ` +
      `x-init="$watch('darkMode', val => localStorage.setItem('darkMode', val))">` +
      `<div x-show='a > b'>នាយកដ្ឋានសញ្ជាតិ</div><p>Nationality Department</p></body></html>`;
    const { text } = extract(html, "https://example.gov.kh/");
    expect(text).toBe("នាយកដ្ឋានសញ្ជាតិ Nationality Department");
  });

  it("drops a script whose opening tag has a > in an attribute", () => {
    const html = `<p>before</p><script data-x="a>b">var hidden = 1;</script><p>after</p>`;
    expect(extract(html, "https://example.gov.kh/").text).toBe("before after");
  });

  it("still strips a tag with an unbalanced quote", () => {
    const html = `<p>one</p><span title="it's>two</span>`;
    expect(extract(html, "https://example.gov.kh/").text).toBe("one two");
  });
});
