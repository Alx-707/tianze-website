import { describe, expect, it } from "vitest";
import {
  buildHeaders,
  buildObservabilityReport,
  buildProbeUrl,
  parsePreviewObservabilityArgs,
  summarizeHeaders,
} from "../../../scripts/deploy/preview-observability-summary.mjs";

describe("preview-observability-summary", () => {
  it("summarizes request observability headers from lowercase plain objects", () => {
    expect(
      summarizeHeaders({
        "x-request-id": "req_123",
        "x-observability-surface": "cache-health",
      }),
    ).toEqual({
      requestId: "req_123",
      surface: "cache-health",
      ok: true,
      missing: [],
    });
  });

  it("summarizes request observability headers from fetch Headers", () => {
    const headers = new Headers({
      "x-request-id": "req_headers",
      "x-observability-surface": "cache-health",
    });

    expect(summarizeHeaders(headers)).toEqual({
      requestId: "req_headers",
      surface: "cache-health",
      ok: true,
      missing: [],
    });
  });

  it("reports missing headers", () => {
    expect(summarizeHeaders({})).toEqual({
      requestId: "",
      surface: "",
      ok: false,
      missing: ["x-request-id", "x-observability-surface"],
    });
  });

  it("builds a passing report when every probe has required headers and 2xx or 3xx status", () => {
    expect(
      buildObservabilityReport({
        baseUrl: "https://example-preview.vercel.app",
        checkedAt: "2026-05-01T00:00:00.000Z",
        probes: [
          {
            pathname: "/api/health",
            status: 200,
            requestId: "req_123",
            surface: "cache-health",
            ok: true,
            missing: [],
          },
          {
            pathname: "/api/health",
            status: 302,
            requestId: "req_456",
            surface: "cache-health",
            ok: true,
            missing: [],
          },
        ],
      }),
    ).toEqual({
      tool: "preview-observability-summary",
      baseUrl: "https://example-preview.vercel.app",
      checkedAt: "2026-05-01T00:00:00.000Z",
      ok: true,
      probes: [
        {
          pathname: "/api/health",
          status: 200,
          requestId: "req_123",
          surface: "cache-health",
          ok: true,
          missing: [],
        },
        {
          pathname: "/api/health",
          status: 302,
          requestId: "req_456",
          surface: "cache-health",
          ok: true,
          missing: [],
        },
      ],
    });
  });

  it("fails the report on failed status or missing required headers", () => {
    expect(
      buildObservabilityReport({
        baseUrl: "https://example-preview.vercel.app",
        checkedAt: "2026-05-01T00:00:00.000Z",
        probes: [
          {
            pathname: "/api/health",
            status: 404,
            requestId: "req_123",
            surface: "cache-health",
            ok: true,
            missing: [],
          },
        ],
      }).ok,
    ).toBe(false);

    expect(
      buildObservabilityReport({
        baseUrl: "https://example-preview.vercel.app",
        checkedAt: "2026-05-01T00:00:00.000Z",
        probes: [
          {
            pathname: "/api/health",
            status: 200,
            requestId: "",
            surface: "cache-health",
            ok: false,
            missing: ["x-request-id"],
          },
        ],
      }).ok,
    ).toBe(false);
  });

  it("parses base url, output, and paired protection header", () => {
    expect(
      parsePreviewObservabilityArgs([
        "node",
        "preview-observability-summary.mjs",
        "--base-url",
        "https://example-preview.vercel.app",
        "--header-name",
        "x-vercel-protection-bypass",
        "--header-value",
        "secret",
        "--output",
        "reports/deploy/custom-observability.json",
      ]),
    ).toEqual({
      baseUrl: "https://example-preview.vercel.app",
      output: "reports/deploy/custom-observability.json",
      headerName: "x-vercel-protection-bypass",
      headerValue: "secret",
    });
  });

  it("rejects missing base url", () => {
    expect(() =>
      parsePreviewObservabilityArgs([
        "node",
        "preview-observability-summary.mjs",
      ]),
    ).toThrow("Missing required --base-url");
  });

  it("rejects incomplete protection header args", () => {
    expect(() =>
      parsePreviewObservabilityArgs([
        "node",
        "preview-observability-summary.mjs",
        "--base-url",
        "https://example-preview.vercel.app",
        "--header-name",
        "x-vercel-protection-bypass",
      ]),
    ).toThrow(
      "Both --header-name and --header-value must be provided together",
    );

    expect(() =>
      parsePreviewObservabilityArgs([
        "node",
        "preview-observability-summary.mjs",
        "--base-url",
        "https://example-preview.vercel.app",
        "--header-value",
        "secret",
      ]),
    ).toThrow(
      "Both --header-name and --header-value must be provided together",
    );
  });

  it("rejects unknown args", () => {
    expect(() =>
      parsePreviewObservabilityArgs([
        "node",
        "preview-observability-summary.mjs",
        "--base-url",
        "https://example-preview.vercel.app",
        "--unknown",
      ]),
    ).toThrow("Unknown argument: --unknown");
  });

  it("builds headers with the Vercel protection bypass header", () => {
    expect(
      buildHeaders({
        headerName: "x-vercel-protection-bypass",
        headerValue: "secret",
      }),
    ).toEqual({
      "user-agent": "preview-observability-summary",
      "x-vercel-protection-bypass": "secret",
    });
  });

  it("builds probe URL from preview base URL and default health probe path", () => {
    expect(
      buildProbeUrl({
        baseUrl: "https://example-preview.vercel.app",
        pathname: "/api/health",
      }).toString(),
    ).toBe("https://example-preview.vercel.app/api/health");
  });
});
