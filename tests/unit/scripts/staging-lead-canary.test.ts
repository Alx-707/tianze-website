import { describe, expect, it } from "vitest";
import {
  buildCanaryPayload,
  buildLeadCanaryReport,
  classifyCanaryMode,
  parseLeadCanaryArgs,
} from "../../../scripts/deploy/staging-lead-canary.mjs";

describe("staging-lead-canary", () => {
  it("defaults to dry-run mode", () => {
    expect(parseLeadCanaryArgs(["node", "staging-lead-canary.mjs"])).toEqual({
      baseUrl: "",
      mode: "dry-run",
      output: "reports/deploy/staging-lead-canary.json",
      reference: "",
      turnstileToken: "",
      idempotencyKey: "",
    });
  });

  it("classifies missing base url as skipped for PR mode", () => {
    expect(
      classifyCanaryMode({
        baseUrl: "",
        mode: "dry-run",
        turnstileToken: "",
        idempotencyKey: "",
      }),
    ).toEqual({
      shouldSubmit: false,
      ok: true,
      status: "skipped",
      reason: "Missing --base-url; dry-run mode does not submit data",
    });
  });

  it("fails missing base url in strict staging mode", () => {
    expect(
      classifyCanaryMode({
        baseUrl: "",
        mode: "strict",
        turnstileToken: "valid-staging-token",
        idempotencyKey: "staging-canary-pr-123",
      }),
    ).toEqual({
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason: "Missing --base-url for strict staging canary",
    });
  });

  it("refuses submit without explicit staging security inputs", () => {
    expect(
      classifyCanaryMode({
        baseUrl: "https://example-preview.vercel.app",
        mode: "submit",
        turnstileToken: "",
        idempotencyKey: "",
      }),
    ).toEqual({
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason:
        "submit mode requires --turnstile-token and --idempotency-key for the current /api/inquiry contract",
    });
  });

  it("refuses submit security inputs before treating missing base url as skipped", () => {
    expect(
      classifyCanaryMode({
        baseUrl: "",
        mode: "submit",
        turnstileToken: "",
        idempotencyKey: "",
      }),
    ).toEqual({
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason:
        "submit mode requires --turnstile-token and --idempotency-key for the current /api/inquiry contract",
    });
  });

  it("refuses strict without explicit staging security inputs", () => {
    expect(
      classifyCanaryMode({
        baseUrl: "https://example-preview.vercel.app",
        mode: "strict",
        turnstileToken: "",
        idempotencyKey: "",
      }),
    ).toEqual({
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason:
        "submit mode requires --turnstile-token and --idempotency-key for the current /api/inquiry contract",
    });
  });

  it("builds traceable product inquiry dry-run payload", () => {
    expect(
      buildCanaryPayload({
        reference: "pr-123",
        checkedAt: "2026-05-01T00:00:00.000Z",
        turnstileToken: "valid-staging-token",
      }),
    ).toMatchObject({
      fullName: "Staging Canary",
      email: "staging-canary@example.invalid",
      productSlug: "pvc-conduit-fittings",
      productName: "PVC Conduit Fittings",
      quantity: "1 carton",
      company: "Tianze Preview Proof",
      requirements:
        "[staging-canary pr-123] This is an automated non-production lead proof.",
      turnstileToken: "valid-staging-token",
    });
  });

  it("builds stable report", () => {
    expect(
      buildLeadCanaryReport({
        checkedAt: "2026-05-01T00:00:00.000Z",
        baseUrl: "https://example-preview.vercel.app",
        mode: "dry-run",
        reference: "pr-123",
        status: "skipped",
        ok: true,
        reason: "dry run",
        responseStatus: null,
        responseBodySnippet: "",
      }),
    ).toEqual({
      tool: "staging-lead-canary",
      checkedAt: "2026-05-01T00:00:00.000Z",
      baseUrl: "https://example-preview.vercel.app",
      mode: "dry-run",
      reference: "pr-123",
      status: "skipped",
      ok: true,
      reason: "dry run",
      responseStatus: null,
      responseBodySnippet: "",
    });
  });
});
