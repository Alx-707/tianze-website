import { describe, expect, it } from "vitest";
import {
  buildPreviewDiagnosticReport,
  classifyPreviewDiagnosticReport,
  createBodySnippet,
  DEFAULT_PREVIEW_DIAGNOSTIC_ROUTES,
  parsePreviewDiagnosticArgs,
  probePreviewRoute,
} from "../../../scripts/cloudflare/preview-smoke-diagnostics.mjs";

describe("preview-smoke-diagnostics", () => {
  it("truncates route body snippets", () => {
    expect(createBodySnippet("x".repeat(620))).toHaveLength(500);
  });

  it("covers TD-004 page, API, and invalid-locale dynamic route evidence", () => {
    expect(DEFAULT_PREVIEW_DIAGNOSTIC_ROUTES).toEqual([
      "/",
      "/en",
      "/zh",
      "/en/contact",
      "/zh/contact",
      "/fr/products/eu/fittings",
      "/api/health",
    ]);
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

    expect(() =>
      parsePreviewDiagnosticArgs([
        "node",
        "preview-smoke-diagnostics.mjs",
        "--base-url",
        "--output",
        "report.json",
      ]),
    ).toThrow("Missing value for --base-url");

    expect(() =>
      parsePreviewDiagnosticArgs([
        "node",
        "preview-smoke-diagnostics.mjs",
        "--output",
        "--base-url",
        "http://127.0.0.1:8787",
      ]),
    ).toThrow("Missing value for --output");
  });

  it("treats only 2xx responses as passing route evidence", async () => {
    const route = await probePreviewRoute({
      baseUrl: "http://127.0.0.1:8787",
      pathname: "/en",
      fetchImpl: async () => {
        const response = new Response("switching protocols");
        Object.defineProperty(response, "status", { value: 101 });
        return response;
      },
    });

    expect(route).toMatchObject({
      pathname: "/en",
      status: 101,
      ok: false,
      failureKind: "http-status",
      bodySnippet: "switching protocols",
    });
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
