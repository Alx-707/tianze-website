import { describe, expect, it } from "vitest";
import {
  assertPageContract,
  buildPreviewProofReport,
  parsePreviewProofArgs,
} from "../../../scripts/deploy/preview-proof.mjs";

describe("preview-proof", () => {
  it("parses base url and optional protection header", () => {
    expect(
      parsePreviewProofArgs([
        "node",
        "preview-proof.mjs",
        "--base-url",
        "https://example-preview.vercel.app",
        "--header-name",
        "x-vercel-protection-bypass",
        "--header-value",
        "secret",
      ]),
    ).toEqual({
      baseUrl: "https://example-preview.vercel.app",
      headerName: "x-vercel-protection-bypass",
      headerValue: "secret",
      output: "reports/deploy/preview-proof.json",
      strict: false,
    });
  });

  it("rejects missing base url", () => {
    expect(() => parsePreviewProofArgs(["node", "preview-proof.mjs"])).toThrow(
      "Missing required --base-url",
    );
  });

  it("detects duplicate canonical and duplicate hreflang", () => {
    const html = [
      "<html><head>",
      '<link rel="canonical" href="https://example.com/en/contact">',
      '<link rel="canonical" href="http://localhost:3000/en/contact">',
      '<link rel="alternate" hreflang="en" href="https://example.com/en/contact">',
      '<link rel="alternate" hreflang="en" href="http://localhost:3000/en/contact">',
      '<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization"}]}</script>',
      '</head><body><main><h1>Contact Us</h1><a href="/en/contact">Contact</a></main></body></html>',
    ].join("");

    const result = assertPageContract({
      pathname: "/en/contact",
      html,
      status: 200,
      finalUrl: "https://example-preview.vercel.app/en/contact",
    });

    expect(result.ok).toBe(false);
    expect(result.failures).toContain(
      "Expected exactly one canonical link, found 2",
    );
    expect(result.failures).toContain(
      'Expected hreflang "en" exactly once, found 2',
    );
  });

  it("builds a stable JSON report", () => {
    const report = buildPreviewProofReport({
      baseUrl: "https://example-preview.vercel.app",
      checkedAt: "2026-05-01T00:00:00.000Z",
      pages: [
        {
          pathname: "/en",
          status: 200,
          finalUrl: "https://example-preview.vercel.app/en",
          ok: true,
          failures: [],
          warnings: [],
        },
      ],
    });

    expect(report).toEqual({
      tool: "preview-proof",
      baseUrl: "https://example-preview.vercel.app",
      checkedAt: "2026-05-01T00:00:00.000Z",
      ok: true,
      totals: { pages: 1, failures: 0, warnings: 0 },
      pages: [
        {
          pathname: "/en",
          status: 200,
          finalUrl: "https://example-preview.vercel.app/en",
          ok: true,
          failures: [],
          warnings: [],
        },
      ],
    });
  });
});
