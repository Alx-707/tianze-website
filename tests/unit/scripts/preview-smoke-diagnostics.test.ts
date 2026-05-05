import { describe, expect, it } from "vitest";
import {
  buildPreviewDiagnosticReport,
  classifyPreviewDiagnosticReport,
  createBodySnippet,
} from "../../../scripts/cloudflare/preview-smoke-diagnostics.mjs";

describe("preview-smoke-diagnostics", () => {
  it("truncates route body snippets", () => {
    expect(createBodySnippet("x".repeat(620))).toHaveLength(500);
  });

  it("classifies a clean report as passing", () => {
    const report = buildPreviewDiagnosticReport({
      baseUrl: "http://127.0.0.1:8787",
      checkedAt: "2026-05-04T00:00:00.000Z",
      routes: [
        {
          pathname: "/en",
          status: 200,
          ok: true,
          durationMs: 10,
          bodySnippet: "<html>",
        },
      ],
    });

    expect(classifyPreviewDiagnosticReport(report)).toEqual({
      ok: true,
      failedRoutes: [],
    });
  });

  it("classifies 500 and worker-hung body as failed route evidence", () => {
    const report = buildPreviewDiagnosticReport({
      baseUrl: "http://127.0.0.1:8787",
      checkedAt: "2026-05-04T00:00:00.000Z",
      routes: [
        {
          pathname: "/en",
          status: 500,
          ok: false,
          durationMs: 10,
          bodySnippet:
            "The Workers runtime canceled this request because it detected that your Worker's code had hung",
        },
      ],
    });

    expect(classifyPreviewDiagnosticReport(report)).toEqual({
      ok: false,
      failedRoutes: ["/en"],
    });
  });
});
