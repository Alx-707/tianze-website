import { describe, expect, it } from "vitest";
import {
  assertPageContract,
  buildPreviewProofReport,
  parsePreviewProofArgs,
} from "../../../scripts/deploy/preview-proof.mjs";

describe("preview-proof", () => {
  function buildValidHtml(body = '<a href="/en/contact">Contact</a>') {
    return [
      "<html><head>",
      '<link rel="canonical" href="https://example.com/en/contact">',
      '<link rel="alternate" hreflang="en" href="https://example.com/en/contact">',
      '<link rel="alternate" hreflang="zh" href="https://example.com/zh/contact">',
      '<link rel="alternate" hreflang="x-default" href="https://example.com/en/contact">',
      '<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization"}]}</script>',
      `</head><body><main><h1>Contact Us</h1>${body}</main></body></html>`,
    ].join("");
  }

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

  it("rejects incomplete protection header args", () => {
    expect(() =>
      parsePreviewProofArgs([
        "node",
        "preview-proof.mjs",
        "--base-url",
        "https://example-preview.vercel.app",
        "--header-name",
        "x-vercel-protection-bypass",
      ]),
    ).toThrow(
      "Both --header-name and --header-value must be provided together",
    );

    expect(() =>
      parsePreviewProofArgs([
        "node",
        "preview-proof.mjs",
        "--base-url",
        "https://example-preview.vercel.app",
        "--header-value",
        "secret",
      ]),
    ).toThrow(
      "Both --header-name and --header-value must be provided together",
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

  it("rejects extra JSON-LD scripts even when one contains a graph", () => {
    const html = [
      "<html><head>",
      '<link rel="canonical" href="https://example.com/en/contact">',
      '<link rel="alternate" hreflang="en" href="https://example.com/en/contact">',
      '<link rel="alternate" hreflang="zh" href="https://example.com/zh/contact">',
      '<link rel="alternate" hreflang="x-default" href="https://example.com/en/contact">',
      '<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization"}]}</script>',
      '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"}</script>',
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
      "Expected exactly one JSON-LD script, found 2",
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

  it("reports buyer-facing placeholders as warnings by default", () => {
    const result = assertPageContract({
      pathname: "/en/contact",
      html: buildValidHtml(
        '<p>Call +86-518-0000-0000</p><p>Sample Product</p><a href="/en/contact">Contact</a>',
      ),
      status: 200,
      finalUrl: "https://example-preview.vercel.app/en/contact",
    });

    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.warnings).toEqual([
      "Public trust placeholder detected: Fake phone number (+86-518-0000-0000)",
      "Public trust placeholder detected: Sample product copy (Sample Product)",
    ]);
  });

  it("reports buyer-facing placeholders as failures in strict mode", () => {
    const result = assertPageContract({
      pathname: "/en/products",
      html: buildValidHtml(
        '<img src="/images/logo.svg" alt="Replace this image"><a href="/en/contact">Contact</a>',
      ),
      status: 200,
      finalUrl: "https://example-preview.vercel.app/en/products",
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.warnings).toEqual([]);
    expect(result.failures).toContain(
      "Public trust placeholder detected: Replacement image instruction (Replace this image)",
    );
    expect(result.failures).toContain(
      "Public trust placeholder detected: Default logo asset (/images/logo.svg)",
    );
  });
});
