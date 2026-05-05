import { describe, expect, it } from "vitest";
import {
  buildPreviewDiagnosticReport,
  classifyPreviewDiagnosticReport,
  createBodySnippet,
  parsePreviewDiagnosticArgs,
  probePreviewRoute,
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

  it("rejects remote base URLs", () => {
    expect(() =>
      parsePreviewDiagnosticArgs([
        "node",
        "preview-smoke-diagnostics.mjs",
        "--base-url",
        "https://example.com",
      ]),
    ).toThrow("Cloudflare preview diagnostics only supports local base URLs");
  });

  it("reports missing argument values clearly", () => {
    expect(() =>
      parsePreviewDiagnosticArgs([
        "node",
        "preview-smoke-diagnostics.mjs",
        "--base-url",
      ]),
    ).toThrow("Missing value for --base-url");
  });

  it("classifies 404 routes as failed preview evidence", async () => {
    const route = await probePreviewRoute({
      baseUrl: "http://127.0.0.1:8787",
      pathname: "/en",
      fetchImpl: async () =>
        new Response("not found", {
          status: 404,
        }),
    });

    expect(route).toMatchObject({
      pathname: "/en",
      status: 404,
      ok: false,
      failureKind: "http-status",
      bodySnippet: "not found",
    });
  });

  it("records fetch failures as route evidence", async () => {
    const route = await probePreviewRoute({
      baseUrl: "http://127.0.0.1:8787",
      pathname: "/en",
      fetchImpl: async () => {
        throw new Error("connect ECONNREFUSED");
      },
    });

    expect(route).toMatchObject({
      pathname: "/en",
      status: null,
      ok: false,
      failureKind: "fetch-error",
      bodySnippet: "connect ECONNREFUSED",
    });
  });
});
