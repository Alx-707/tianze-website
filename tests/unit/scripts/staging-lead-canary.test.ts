import { describe, expect, it } from "vitest";
import {
  buildCanaryPayload,
  buildLeadCanaryReport,
  classifyInquiryResponse,
  classifyCanaryMode,
  parseLeadCanaryArgs,
} from "../../../scripts/deploy/staging-lead-canary.mjs";

describe("staging-lead-canary", () => {
  const dryRunReason =
    "dry-run generates and records the intended product inquiry payload shape without submitting data";

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
      reason: dryRunReason,
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

  it("refuses submit to production URLs before fetch", () => {
    expect(
      classifyCanaryMode({
        baseUrl: "https://tianze-pipe.com",
        mode: "submit",
        turnstileToken: "valid-staging-token",
        idempotencyKey: "staging-canary-pr-123",
      }),
    ).toEqual({
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason:
        "Refusing to submit staging canary to a non-staging URL; use localhost, 127.0.0.1, *.vercel.app, or a preview/staging host",
    });
  });

  it("refuses strict mode to production URLs before fetch", () => {
    expect(
      classifyCanaryMode({
        baseUrl: "https://www.tianze-pipe.com",
        mode: "strict",
        turnstileToken: "valid-staging-token",
        idempotencyKey: "staging-canary-pr-123",
      }),
    ).toEqual({
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason:
        "Refusing to submit staging canary to a non-staging URL; use localhost, 127.0.0.1, *.vercel.app, or a preview/staging host",
    });
  });

  it("allows submit only for explicit non-production hosts", () => {
    expect(
      classifyCanaryMode({
        baseUrl: "https://tianze-preview.vercel.app",
        mode: "submit",
        turnstileToken: "valid-staging-token",
        idempotencyKey: "staging-canary-pr-123",
      }),
    ).toEqual({
      shouldSubmit: true,
      ok: true,
      status: "pending",
      reason: "ready to submit staging canary",
    });

    expect(
      classifyCanaryMode({
        baseUrl: "http://localhost:3000",
        mode: "submit",
        turnstileToken: "valid-staging-token",
        idempotencyKey: "staging-canary-pr-123",
      }),
    ).toMatchObject({
      shouldSubmit: true,
      ok: true,
    });

    expect(
      classifyCanaryMode({
        baseUrl: "https://staging.tianze-pipe.com",
        mode: "strict",
        turnstileToken: "valid-staging-token",
        idempotencyKey: "staging-canary-pr-123",
      }),
    ).toMatchObject({
      shouldSubmit: true,
      ok: true,
    });
  });

  it("classifies inquiry responses by JSON success field, not only HTTP 2xx", () => {
    expect(
      classifyInquiryResponse(
        200,
        JSON.stringify({
          success: true,
          data: { referenceId: "ref-123" },
        }),
      ),
    ).toMatchObject({
      ok: true,
      reason: "staging canary accepted by inquiry API",
      responseStatus: 200,
    });

    expect(
      classifyInquiryResponse(
        200,
        JSON.stringify({
          success: false,
          errorCode: "INQUIRY_PARTIAL_SUCCESS",
        }),
      ),
    ).toMatchObject({
      ok: false,
      reason: "inquiry API did not report success for staging canary",
      responseStatus: 200,
    });
  });

  it("builds traceable intended product inquiry dry-run payload", () => {
    const payload = buildCanaryPayload({
      reference: "pr-123",
      turnstileToken: "valid-staging-token",
    });

    expect(payload).toMatchObject({
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
    expect(payload).not.toHaveProperty("checkedAt");
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
      proofBoundary:
        "staging-non-production; not production deployed lead proof",
    });
  });
});
