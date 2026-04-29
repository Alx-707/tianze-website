import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.doUnmock("@/lib/env");
  vi.doUnmock("next-intl/server");
  vi.doUnmock("react");
});

describe("getTranslationsCached", () => {
  it("uses the React request cache outside Cloudflare runtime", async () => {
    const getTranslations = vi.fn();
    const cache = vi.fn((loader: unknown) => loader);

    vi.doMock("@/lib/env", () => ({
      isRuntimeCloudflare: () => false,
    }));
    vi.doMock("next-intl/server", () => ({
      getTranslations,
    }));
    vi.doMock("react", () => ({
      cache,
    }));

    await import("@/lib/i18n/server/getTranslationsCached");

    expect(cache).toHaveBeenCalledWith(getTranslations);
  });

  it("bypasses the React request cache on Cloudflare runtime", async () => {
    const translator = vi.fn((key: string) => key);
    const getTranslations = vi.fn(() => translator);
    const cachedGetTranslations = vi.fn();
    const cache = vi.fn(() => cachedGetTranslations);

    vi.doMock("@/lib/env", () => ({
      isRuntimeCloudflare: () => true,
    }));
    vi.doMock("next-intl/server", () => ({
      getTranslations,
    }));
    vi.doMock("react", () => ({
      cache,
    }));

    const { getTranslationsCached } =
      await import("@/lib/i18n/server/getTranslationsCached");

    const result = await getTranslationsCached({
      locale: "en",
      namespace: "underConstruction.pages.contact",
    });

    expect(result).toBe(translator);
    expect(getTranslations).toHaveBeenCalledTimes(1);
    expect(cachedGetTranslations).not.toHaveBeenCalled();
  });
});
