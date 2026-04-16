import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockWarn = vi.hoisted(() => vi.fn());

vi.mock("@/lib/logger", () => ({
  logger: { warn: mockWarn, info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

async function loadTurnstileConfig({
  allowedHosts,
  expectedAction,
  allowedActions,
  vercelUrl,
  baseUrl = "https://tianze-pipe.com",
}: {
  allowedHosts?: string;
  expectedAction?: string;
  allowedActions?: string;
  vercelUrl?: string;
  baseUrl?: string;
} = {}) {
  vi.resetModules();
  vi.doMock("@/lib/env", () => ({
    env: {
      TURNSTILE_ALLOWED_HOSTS: allowedHosts,
      TURNSTILE_EXPECTED_ACTION: expectedAction,
      VERCEL_URL: vercelUrl,
    },
    getRuntimeEnvString: (key: string) => {
      if (key === "TURNSTILE_ALLOWED_ACTIONS") {
        return allowedActions;
      }
      return undefined;
    },
  }));
  vi.doMock("@/config/paths/site-config", () => ({
    SITE_CONFIG: { baseUrl },
  }));
  return import("@/lib/security/turnstile-config");
}

describe("turnstile-config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.doUnmock("@/lib/env");
    vi.doUnmock("@/config/paths/site-config");
  });

  it("parses configured hosts by trimming, lowercasing, and dropping empties", async () => {
    const mod = await loadTurnstileConfig({
      allowedHosts: " EXAMPLE.com, ,Preview.Tianze-Pipe.com ",
    });

    expect(mod.getAllowedTurnstileHosts()).toEqual([
      "example.com",
      "preview.tianze-pipe.com",
    ]);
    expect(mod.isAllowedTurnstileHostname("EXAMPLE.COM")).toBe(true);
    expect(mod.isAllowedTurnstileHostname("unknown.example")).toBe(false);
  });

  it("falls back to normalized site and vercel hosts plus localhost", async () => {
    const mod = await loadTurnstileConfig({
      vercelUrl: "Feature-Branch.Vercel.App",
      baseUrl: "https://Preview.Tianze-Pipe.com",
    });

    expect(mod.getAllowedTurnstileHosts()).toEqual(
      expect.arrayContaining([
        "preview.tianze-pipe.com",
        "feature-branch.vercel.app",
        "localhost",
      ]),
    );
  });

  it("logs and skips invalid fallback base urls", async () => {
    const mod = await loadTurnstileConfig({ baseUrl: "://bad-url" });

    expect(mod.getAllowedTurnstileHosts()).toEqual(["localhost"]);
    expect(mockWarn).toHaveBeenCalled();
  });

  it("uses configured allowed actions and expected action with trimming", async () => {
    const mod = await loadTurnstileConfig({
      allowedActions: "contact_form, product_inquiry , custom_action ",
      expectedAction: " product_inquiry ",
    });

    expect(mod.getAllowedTurnstileActions()).toEqual([
      "contact_form",
      "product_inquiry",
      "custom_action",
    ]);
    expect(mod.getExpectedTurnstileAction()).toBe("product_inquiry");
    expect(mod.isAllowedTurnstileAction("product_inquiry")).toBe(true);
    expect(mod.isAllowedTurnstileAction("newsletter_subscribe")).toBe(false);
    expect(mod.isAllowedTurnstileAction(null)).toBe(false);
  });
});
