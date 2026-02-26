/**
 * Unit tests for content-query queries module
 *
 * Tests cover all query functions:
 * - getAllPosts
 * - getAllPages
 * - getContentBySlug
 * - getPostBySlug
 * - getPageBySlug
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  BlogPostMetadata,
  ContentConfig,
  ContentQueryOptions,
  PageMetadata,
  ParsedContent,
} from "@/types/content.types";
// Import after mocking
import {
  getAllPages,
  getAllPosts,
  getContentBySlug,
  getPageBySlug,
  getPostBySlug,
} from "@/lib/content-query/queries";

// Mocks setup via vi.hoisted for ESM compatibility
const mockGetContentFiles = vi.hoisted(() =>
  vi.fn<(dir: string, locale?: string) => Promise<string[]>>(),
);
const mockParseContentFile = vi.hoisted(() => vi.fn());
const mockGetContentConfig = vi.hoisted(() => vi.fn<() => ContentConfig>());
const mockFilterPosts = vi.hoisted(() => vi.fn());
const mockSortPosts = vi.hoisted(() => vi.fn());
const mockPaginatePosts = vi.hoisted(() => vi.fn());

vi.mock("@/lib/content-parser", () => ({
  getContentFiles: mockGetContentFiles,
  parseContentFile: mockParseContentFile,
}));

vi.mock("@/lib/content-utils", () => ({
  getContentConfig: mockGetContentConfig,
  POSTS_DIR: "/mock/content/posts",
  PAGES_DIR: "/mock/content/pages",
}));

vi.mock("@/lib/content-query/filters", () => ({
  filterPosts: mockFilterPosts,
}));

vi.mock("@/lib/content-query/sorting", () => ({
  sortPosts: mockSortPosts,
  paginatePosts: mockPaginatePosts,
}));

// Factory functions for mock data
function createMockBlogPostMetadata(
  overrides?: Partial<BlogPostMetadata>,
): BlogPostMetadata {
  return {
    title: "Test Post",
    slug: "test-post",
    publishedAt: "2024-01-15",
    description: "Test description",
    draft: false,
    featured: false,
    tags: [],
    categories: [],
    ...overrides,
  };
}

function createMockPageMetadata(
  overrides?: Partial<PageMetadata>,
): PageMetadata {
  return {
    title: "Test Page",
    slug: "test-page",
    publishedAt: "2024-01-15",
    description: "Test page description",
    draft: false,
    layout: "default",
    ...overrides,
  };
}

function createMockParsedBlogPost(
  overrides?: Partial<ParsedContent<BlogPostMetadata>>,
): ParsedContent<BlogPostMetadata> {
  const { metadata: metadataOverrides, ...restOverrides } = overrides ?? {};
  return {
    slug: restOverrides?.slug ?? "test-post",
    content: restOverrides?.content ?? "Test content body",
    filePath: restOverrides?.filePath ?? "/mock/content/posts/en/test-post.mdx",
    ...restOverrides,
    metadata: createMockBlogPostMetadata(metadataOverrides),
  };
}

function createMockParsedPage(
  overrides?: Partial<ParsedContent<PageMetadata>>,
): ParsedContent<PageMetadata> {
  const { metadata: metadataOverrides, ...restOverrides } = overrides ?? {};
  return {
    slug: restOverrides?.slug ?? "test-page",
    content: restOverrides?.content ?? "Test page content",
    filePath: restOverrides?.filePath ?? "/mock/content/pages/en/test-page.mdx",
    ...restOverrides,
    metadata: createMockPageMetadata(metadataOverrides),
  };
}

function createMockContentConfig(
  overrides?: Partial<ContentConfig>,
): ContentConfig {
  return {
    defaultLocale: "en",
    supportedLocales: ["en", "zh"],
    postsPerPage: 10,
    enableDrafts: false,
    enableSearch: true,
    enableComments: false,
    autoGenerateExcerpt: true,
    excerptLength: 160,
    dateFormat: "YYYY-MM-DD",
    timeZone: "UTC",
    ...overrides,
  };
}

describe("content-query/queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetContentConfig.mockReturnValue(createMockContentConfig());
  });

  describe("getAllPosts", () => {
    it("should get all posts without locale", async () => {
      const mockFiles = [
        "/mock/content/posts/post1.mdx",
        "/mock/content/posts/post2.mdx",
      ];
      const mockParsedPosts = [
        createMockParsedBlogPost({ slug: "post1" }),
        createMockParsedBlogPost({ slug: "post2" }),
      ];

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile
        .mockResolvedValueOnce(mockParsedPosts[0])
        .mockResolvedValueOnce(mockParsedPosts[1]);
      mockFilterPosts.mockReturnValue(mockParsedPosts);
      mockSortPosts.mockImplementation((posts) => posts);
      mockPaginatePosts.mockImplementation((posts) => posts);

      const result = await getAllPosts();

      expect(mockGetContentFiles).toHaveBeenCalledWith(
        "/mock/content/posts",
        undefined,
      );
      expect(mockParseContentFile).toHaveBeenCalledTimes(2);
      expect(mockFilterPosts).toHaveBeenCalled();
      expect(mockSortPosts).toHaveBeenCalled();
      expect(mockPaginatePosts).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it("should get posts for specific locale", async () => {
      const mockFiles = ["/mock/content/posts/en/post1.mdx"];
      const mockParsedPost = createMockParsedBlogPost({ slug: "post1" });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPost);
      mockFilterPosts.mockReturnValue([mockParsedPost]);
      mockSortPosts.mockImplementation((posts) => posts);
      mockPaginatePosts.mockImplementation((posts) => posts);

      const result = await getAllPosts("en");

      expect(mockGetContentFiles).toHaveBeenCalledWith(
        "/mock/content/posts",
        "en",
      );
      expect(result).toHaveLength(1);
    });

    it("should apply query options to filter, sort, and paginate", async () => {
      const mockFiles = ["/mock/content/posts/post1.mdx"];
      const mockParsedPost = createMockParsedBlogPost({ slug: "post1" });
      const options: ContentQueryOptions = {
        featured: true,
        sortBy: "title",
        sortOrder: "asc",
        limit: 5,
        offset: 2,
      };

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPost);
      mockFilterPosts.mockReturnValue([mockParsedPost]);
      mockSortPosts.mockImplementation((posts) => posts);
      mockPaginatePosts.mockImplementation((posts) => posts);

      await getAllPosts("en", options);

      expect(mockFilterPosts).toHaveBeenCalledWith([mockParsedPost], options);
      expect(mockSortPosts).toHaveBeenCalledWith([mockParsedPost], options);
      expect(mockPaginatePosts).toHaveBeenCalledWith([mockParsedPost], options);
    });

    it("should return empty array when no files found", async () => {
      mockGetContentFiles.mockResolvedValue([]);
      mockFilterPosts.mockReturnValue([]);
      mockSortPosts.mockReturnValue([]);
      mockPaginatePosts.mockReturnValue([]);

      const result = await getAllPosts("en");

      expect(result).toEqual([]);
    });

    it("should parse each file as posts type", async () => {
      const mockFiles = ["/mock/content/posts/post1.mdx"];
      const mockParsedPost = createMockParsedBlogPost();

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPost);
      mockFilterPosts.mockReturnValue([mockParsedPost]);
      mockSortPosts.mockImplementation((posts) => posts);
      mockPaginatePosts.mockImplementation((posts) => posts);

      await getAllPosts();

      expect(mockParseContentFile).toHaveBeenCalledWith(
        "/mock/content/posts/post1.mdx",
        "posts",
      );
    });

    it("should use default empty options when not provided", async () => {
      mockGetContentFiles.mockResolvedValue([]);
      mockFilterPosts.mockReturnValue([]);
      mockSortPosts.mockReturnValue([]);
      mockPaginatePosts.mockReturnValue([]);

      await getAllPosts();

      expect(mockFilterPosts).toHaveBeenCalledWith([], {});
    });
  });

  describe("getAllPages", () => {
    it("should get all pages without locale", async () => {
      const mockFiles = [
        "/mock/content/pages/about.mdx",
        "/mock/content/pages/contact.mdx",
      ];
      const mockParsedPages = [
        createMockParsedPage({ slug: "about" }),
        createMockParsedPage({ slug: "contact" }),
      ];

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile
        .mockResolvedValueOnce(mockParsedPages[0])
        .mockResolvedValueOnce(mockParsedPages[1]);

      const result = await getAllPages();

      expect(mockGetContentFiles).toHaveBeenCalledWith(
        "/mock/content/pages",
        undefined,
      );
      expect(result).toHaveLength(2);
    });

    it("should get pages for specific locale", async () => {
      const mockFiles = ["/mock/content/pages/zh/about.mdx"];
      const mockParsedPage = createMockParsedPage({ slug: "about" });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPage);

      const result = await getAllPages("zh");

      expect(mockGetContentFiles).toHaveBeenCalledWith(
        "/mock/content/pages",
        "zh",
      );
      expect(result).toHaveLength(1);
    });

    it("should filter draft pages when enableDrafts is false", async () => {
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ enableDrafts: false }),
      );

      const mockFiles = [
        "/mock/content/pages/published.mdx",
        "/mock/content/pages/draft.mdx",
      ];
      const publishedPage = createMockParsedPage({
        slug: "published",
        metadata: createMockPageMetadata({ draft: false }),
      });
      const draftPage = createMockParsedPage({
        slug: "draft",
        metadata: createMockPageMetadata({ draft: true }),
      });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile
        .mockResolvedValueOnce(publishedPage)
        .mockResolvedValueOnce(draftPage);

      const result = await getAllPages();

      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe("published");
    });

    it("should include draft pages when enableDrafts is true", async () => {
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ enableDrafts: true }),
      );

      const mockFiles = [
        "/mock/content/pages/published.mdx",
        "/mock/content/pages/draft.mdx",
      ];
      const publishedPage = createMockParsedPage({
        slug: "published",
        metadata: createMockPageMetadata({ draft: false }),
      });
      const draftPage = createMockParsedPage({
        slug: "draft",
        metadata: createMockPageMetadata({ draft: true }),
      });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile
        .mockResolvedValueOnce(publishedPage)
        .mockResolvedValueOnce(draftPage);

      const result = await getAllPages();

      expect(result).toHaveLength(2);
    });

    it("should return empty array when no files found", async () => {
      mockGetContentFiles.mockResolvedValue([]);

      const result = await getAllPages();

      expect(result).toEqual([]);
    });

    it("should parse each file as pages type", async () => {
      const mockFiles = ["/mock/content/pages/about.mdx"];
      const mockParsedPage = createMockParsedPage();

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPage);

      await getAllPages();

      expect(mockParseContentFile).toHaveBeenCalledWith(
        "/mock/content/pages/about.mdx",
        "pages",
      );
    });
  });

  describe("getContentBySlug", () => {
    it("should find content by exact slug match", async () => {
      const mockFiles = [
        "/mock/content/posts/en/my-post.mdx",
        "/mock/content/posts/en/other-post.mdx",
      ];
      const mockParsedPost = createMockParsedBlogPost({ slug: "my-post" });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPost);

      const result = await getContentBySlug("my-post", "posts", "en");

      expect(result.slug).toBe("my-post");
      expect(mockParseContentFile).toHaveBeenCalledWith(
        "/mock/content/posts/en/my-post.mdx",
        "posts",
      );
    });

    it("should find content by slug with locale suffix", async () => {
      const mockFiles = ["/mock/content/posts/en/my-post.en.mdx"];
      const mockParsedPost = createMockParsedBlogPost({ slug: "my-post.en" });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPost);

      const result = await getContentBySlug("my-post", "posts", "en");

      expect(mockParseContentFile).toHaveBeenCalledWith(
        "/mock/content/posts/en/my-post.en.mdx",
        "posts",
      );
      expect(result).toBeDefined();
    });

    it("should use posts directory for posts type", async () => {
      const mockFiles = ["/mock/content/posts/en/test.mdx"];
      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(createMockParsedBlogPost());

      await getContentBySlug("test", "posts", "en");

      expect(mockGetContentFiles).toHaveBeenCalledWith(
        "/mock/content/posts",
        "en",
      );
    });

    it("should use pages directory for pages type", async () => {
      const mockFiles = ["/mock/content/pages/en/about.mdx"];
      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(createMockParsedPage());

      await getContentBySlug("about", "pages", "en");

      expect(mockGetContentFiles).toHaveBeenCalledWith(
        "/mock/content/pages",
        "en",
      );
    });

    it("should throw error when content not found", async () => {
      mockGetContentFiles.mockResolvedValue([
        "/mock/content/posts/en/other.mdx",
      ]);

      await expect(
        getContentBySlug("nonexistent", "posts", "en"),
      ).rejects.toThrow("Content not found: nonexistent");
    });

    it("should work without locale parameter", async () => {
      const mockFiles = ["/mock/content/posts/my-post.mdx"];
      const mockParsedPost = createMockParsedBlogPost();

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPost);

      const result = await getContentBySlug("my-post", "posts");

      expect(mockGetContentFiles).toHaveBeenCalledWith(
        "/mock/content/posts",
        undefined,
      );
      expect(result).toBeDefined();
    });

    it("should handle files with different extensions", async () => {
      const mockFiles = [
        "/mock/content/posts/en/my-post.md",
        "/mock/content/posts/en/other.mdx",
      ];
      const mockParsedPost = createMockParsedBlogPost({ slug: "my-post" });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPost);

      const result = await getContentBySlug("my-post", "posts", "en");

      expect(result).toBeDefined();
      expect(mockParseContentFile).toHaveBeenCalledWith(
        "/mock/content/posts/en/my-post.md",
        "posts",
      );
    });

    it("should match slug prefix correctly", async () => {
      const mockFiles = [
        "/mock/content/posts/en/my-post.en.mdx",
        "/mock/content/posts/en/my-post-extra.mdx",
      ];
      const mockParsedPost = createMockParsedBlogPost({ slug: "my-post.en" });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPost);

      const result = await getContentBySlug("my-post", "posts", "en");

      // Should match 'my-post.en.mdx' because slug starts with 'my-post.'
      expect(mockParseContentFile).toHaveBeenCalledWith(
        "/mock/content/posts/en/my-post.en.mdx",
        "posts",
      );
      expect(result).toBeDefined();
    });
  });

  describe("getPostBySlug", () => {
    it("should return blog post by slug", async () => {
      const mockFiles = ["/mock/content/posts/en/test-post.mdx"];
      const mockParsedPost = createMockParsedBlogPost({
        slug: "test-post",
        metadata: createMockBlogPostMetadata({ title: "Test Post Title" }),
      });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPost);

      const result = await getPostBySlug("test-post", "en");

      expect(result.slug).toBe("test-post");
      expect(result.metadata.title).toBe("Test Post Title");
    });

    it("should call getContentBySlug with posts type", async () => {
      const mockFiles = ["/mock/content/posts/en/my-post.mdx"];
      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(createMockParsedBlogPost());

      await getPostBySlug("my-post", "en");

      expect(mockParseContentFile).toHaveBeenCalledWith(
        "/mock/content/posts/en/my-post.mdx",
        "posts",
      );
    });

    it("should work without locale", async () => {
      const mockFiles = ["/mock/content/posts/my-post.mdx"];
      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(createMockParsedBlogPost());

      const result = await getPostBySlug("my-post");

      expect(result).toBeDefined();
      expect(mockGetContentFiles).toHaveBeenCalledWith(
        "/mock/content/posts",
        undefined,
      );
    });

    it("should throw error when post not found", async () => {
      mockGetContentFiles.mockResolvedValue([]);

      await expect(getPostBySlug("nonexistent", "en")).rejects.toThrow(
        "Content not found: nonexistent",
      );
    });
  });

  describe("getPageBySlug", () => {
    it("should return page by slug", async () => {
      const mockFiles = ["/mock/content/pages/en/about.mdx"];
      const mockParsedPage = createMockParsedPage({
        slug: "about",
        metadata: createMockPageMetadata({
          title: "About Us",
          layout: "default",
        }),
      });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPage);

      const result = await getPageBySlug("about", "en");

      expect(result.slug).toBe("about");
      expect(result.metadata.title).toBe("About Us");
      expect(result.metadata.layout).toBe("default");
    });

    it("should call getContentBySlug with pages type", async () => {
      const mockFiles = ["/mock/content/pages/en/contact.mdx"];
      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(createMockParsedPage());

      await getPageBySlug("contact", "en");

      expect(mockParseContentFile).toHaveBeenCalledWith(
        "/mock/content/pages/en/contact.mdx",
        "pages",
      );
    });

    it("should work without locale", async () => {
      const mockFiles = ["/mock/content/pages/about.mdx"];
      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(createMockParsedPage());

      const result = await getPageBySlug("about");

      expect(result).toBeDefined();
      expect(mockGetContentFiles).toHaveBeenCalledWith(
        "/mock/content/pages",
        undefined,
      );
    });

    it("should throw error when page not found", async () => {
      mockGetContentFiles.mockResolvedValue([]);

      await expect(getPageBySlug("nonexistent", "en")).rejects.toThrow(
        "Content not found: nonexistent",
      );
    });

    it("should handle page with different layout types", async () => {
      const mockFiles = ["/mock/content/pages/en/landing.mdx"];
      const mockParsedPage = createMockParsedPage({
        slug: "landing",
        metadata: createMockPageMetadata({ layout: "landing" }),
      });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPage);

      const result = await getPageBySlug("landing", "en");

      expect(result.metadata.layout).toBe("landing");
    });
  });

  describe("edge cases", () => {
    it("should handle special characters in slug", async () => {
      const mockFiles = ["/mock/content/posts/en/hello-world-2024.mdx"];
      const mockParsedPost = createMockParsedBlogPost({
        slug: "hello-world-2024",
      });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPost);

      const result = await getContentBySlug("hello-world-2024", "posts", "en");

      expect(result.slug).toBe("hello-world-2024");
    });

    it("should handle slug that matches multiple files (returns first match)", async () => {
      const mockFiles = [
        "/mock/content/posts/en/test.mdx",
        "/mock/content/posts/en/test.en.mdx",
      ];
      const mockParsedPost = createMockParsedBlogPost({ slug: "test" });

      mockGetContentFiles.mockResolvedValue(mockFiles);
      mockParseContentFile.mockResolvedValue(mockParsedPost);

      const result = await getContentBySlug("test", "posts", "en");

      expect(result).toBeDefined();
      // Should match first file (exact slug match)
      expect(mockParseContentFile).toHaveBeenCalledWith(
        "/mock/content/posts/en/test.mdx",
        "posts",
      );
    });

    it("should handle empty file list gracefully", async () => {
      mockGetContentFiles.mockResolvedValue([]);

      await expect(getContentBySlug("any-slug", "posts", "en")).rejects.toThrow(
        "Content not found: any-slug",
      );
    });
  });
});
