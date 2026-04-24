import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.doUnmock("@/lib/env");
  vi.doUnmock("react");
  vi.doUnmock("@/lib/content-parser");
  vi.doUnmock("@/lib/content-utils");
  vi.doUnmock("@/lib/content-query/filters");
  vi.doUnmock("@/lib/content-query/sorting");
});

function mockQueryDependencies() {
  vi.doMock("@/lib/content-parser", () => ({
    getContentFiles: vi.fn(async () => ["/mock/content/pages/en/about.mdx"]),
    parseContentFile: vi.fn(async () => ({
      slug: "about",
      content: "About content",
      filePath: "/mock/content/pages/en/about.mdx",
      metadata: {
        title: "About",
        slug: "about",
        publishedAt: "2024-01-01",
      },
    })),
  }));
  vi.doMock("@/lib/content-utils", () => ({
    getContentConfig: vi.fn(() => ({ enableDrafts: false })),
    POSTS_DIR: "/mock/content/posts",
    PAGES_DIR: "/mock/content/pages",
  }));
  vi.doMock("@/lib/content-query/filters", () => ({
    filterPosts: vi.fn((posts: unknown[]) => posts),
  }));
  vi.doMock("@/lib/content-query/sorting", () => ({
    sortPosts: vi.fn((posts: unknown[]) => posts),
    paginatePosts: vi.fn((posts: unknown[]) => posts),
  }));
}

describe("content query runtime cache gating", () => {
  it("uses the React request cache outside Cloudflare runtime", async () => {
    const cache = vi.fn((loader: unknown) => loader);

    mockQueryDependencies();
    vi.doMock("@/lib/env", () => ({
      isRuntimeCloudflare: () => false,
    }));
    vi.doMock("react", () => ({
      cache,
    }));

    await import("@/lib/content-query/queries");

    expect(cache).toHaveBeenCalledTimes(2);
  });

  it("bypasses the React request cache on Cloudflare runtime", async () => {
    const cachedLoader = vi.fn();
    const cache = vi.fn(() => cachedLoader);

    mockQueryDependencies();
    vi.doMock("@/lib/env", () => ({
      isRuntimeCloudflare: () => true,
    }));
    vi.doMock("react", () => ({
      cache,
    }));

    const { getPageBySlug } = await import("@/lib/content-query/queries");
    const page = await getPageBySlug("about", "en");

    expect(page.slug).toBe("about");
    expect(cachedLoader).not.toHaveBeenCalled();
  });
});
