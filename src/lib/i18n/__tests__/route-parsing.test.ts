import { describe, expect, it } from "vitest";
import {
  DYNAMIC_ROUTE_PATTERNS,
  LOCALE_PREFIX_RE,
  normalizePathnameForLink,
  parsePathnameForLink,
} from "../route-parsing";

describe("route-parsing", () => {
  describe("LOCALE_PREFIX_RE", () => {
    it("matches /en prefix", () => {
      expect("/en/about".replace(LOCALE_PREFIX_RE, "")).toBe("/about");
    });

    it("matches /zh prefix", () => {
      expect("/zh/blog/post".replace(LOCALE_PREFIX_RE, "")).toBe("/blog/post");
    });

    it("does not match paths without locale prefix", () => {
      expect("/about".replace(LOCALE_PREFIX_RE, "")).toBe("/about");
    });

    it("matches locale-only path", () => {
      expect("/en".replace(LOCALE_PREFIX_RE, "")).toBe("");
    });

    it("does not match partial locale matches", () => {
      expect("/english/page".replace(LOCALE_PREFIX_RE, "")).toBe(
        "/english/page",
      );
    });
  });

  describe("DYNAMIC_ROUTE_PATTERNS", () => {
    it("includes blog pattern", () => {
      const blogPattern = DYNAMIC_ROUTE_PATTERNS.find((p) =>
        p.pattern.test("/blog/my-post"),
      );
      expect(blogPattern).toBeDefined();
      expect(blogPattern?.buildHref("my-post")).toEqual({
        pathname: "/blog/[slug]",
        params: { slug: "my-post" },
      });
    });

    it("includes products pattern", () => {
      const productsPattern = DYNAMIC_ROUTE_PATTERNS.find((p) =>
        p.pattern.test("/products/pipe-fitting"),
      );
      expect(productsPattern).toBeDefined();
      expect(productsPattern?.buildHref("pipe-fitting")).toEqual({
        pathname: "/products/[slug]",
        params: { slug: "pipe-fitting" },
      });
    });

    it("does not match nested paths", () => {
      const match = DYNAMIC_ROUTE_PATTERNS.find((p) =>
        p.pattern.test("/blog/category/post"),
      );
      expect(match).toBeUndefined();
    });
  });

  describe("normalizePathnameForLink", () => {
    it("strips /en locale prefix", () => {
      expect(normalizePathnameForLink("/en/about")).toBe("/about");
    });

    it("strips /zh locale prefix", () => {
      expect(normalizePathnameForLink("/zh/blog/post")).toBe("/blog/post");
    });

    it("handles empty string", () => {
      expect(normalizePathnameForLink("")).toBe("/");
    });

    it("handles root path with locale", () => {
      expect(normalizePathnameForLink("/en")).toBe("/");
      expect(normalizePathnameForLink("/zh")).toBe("/");
    });

    it("preserves paths without locale prefix", () => {
      expect(normalizePathnameForLink("/about")).toBe("/about");
    });

    it("handles root path", () => {
      expect(normalizePathnameForLink("/")).toBe("/");
    });

    it("handles deep nested paths", () => {
      expect(normalizePathnameForLink("/en/blog/2024/01/post")).toBe(
        "/blog/2024/01/post",
      );
    });
  });

  describe("parsePathnameForLink", () => {
    describe("static routes", () => {
      it("returns static path as string for /about", () => {
        expect(parsePathnameForLink("/en/about")).toBe("/about");
      });

      it("returns static path as string for /contact", () => {
        expect(parsePathnameForLink("/zh/contact")).toBe("/contact");
      });

      it("returns root path for locale-only URL", () => {
        expect(parsePathnameForLink("/en")).toBe("/");
      });

      it("handles path without locale prefix", () => {
        expect(parsePathnameForLink("/about")).toBe("/about");
      });
    });

    describe("dynamic routes", () => {
      it("returns blog dynamic route object", () => {
        expect(parsePathnameForLink("/en/blog/my-post")).toEqual({
          pathname: "/blog/[slug]",
          params: { slug: "my-post" },
        });
      });

      it("returns blog dynamic route object for zh locale", () => {
        expect(parsePathnameForLink("/zh/blog/welcome")).toEqual({
          pathname: "/blog/[slug]",
          params: { slug: "welcome" },
        });
      });

      it("returns products dynamic route object", () => {
        expect(parsePathnameForLink("/en/products/pipe-fitting")).toEqual({
          pathname: "/products/[slug]",
          params: { slug: "pipe-fitting" },
        });
      });

      it("handles slugs with hyphens", () => {
        expect(
          parsePathnameForLink("/en/products/full-auto-bending-machine"),
        ).toEqual({
          pathname: "/products/[slug]",
          params: { slug: "full-auto-bending-machine" },
        });
      });

      it("handles slugs without locale prefix", () => {
        expect(parsePathnameForLink("/blog/my-post")).toEqual({
          pathname: "/blog/[slug]",
          params: { slug: "my-post" },
        });
      });
    });

    describe("edge cases", () => {
      it("handles empty string", () => {
        expect(parsePathnameForLink("")).toBe("/");
      });

      it("does not match /blog without slug", () => {
        expect(parsePathnameForLink("/en/blog")).toBe("/blog");
      });

      it("does not match /products without slug", () => {
        expect(parsePathnameForLink("/zh/products")).toBe("/products");
      });
    });
  });
});
