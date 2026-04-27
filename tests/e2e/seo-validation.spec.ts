import { expect, test } from "@playwright/test";

/**
 * SEO Validation E2E Tests (Phase 1)
 *
 * Verifies critical SEO elements on key pages:
 * - <title> tag present and meaningful
 * - <link rel="canonical"> points to correct URL
 * - JSON-LD structured data present and valid
 * - Open Graph tags present
 * - hreflang alternates present for both locales
 */

const KEY_PAGES = [
  { path: "/en", name: "Homepage" },
  { path: "/en/products", name: "Products" },
  { path: "/en/products/north-america", name: "North America Products" },
  {
    path: "/en/capabilities/bending-machines",
    name: "Bending Machines",
  },
  { path: "/en/contact", name: "Contact" },
  { path: "/en/about", name: "About" },
];

for (const { path, name } of KEY_PAGES) {
  test.describe(`SEO: ${name} (${path})`, () => {
    test("has meaningful title", async ({ page }) => {
      await page.goto(path);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      expect(title).not.toBe("undefined");
      expect(title).not.toContain("{{");
    });

    test("has canonical link", async ({ page }) => {
      await page.goto(path);
      const canonical = page.locator('link[rel="canonical"]');
      const href = await canonical.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toMatch(/^https?:\/\//);
    });

    test("has JSON-LD structured data", async ({ page }) => {
      await page.goto(path);
      const jsonLdScripts = page.locator('script[type="application/ld+json"]');
      const count = await jsonLdScripts.count();
      expect(count).toBe(1);

      // Verify JSON-LD is a page-level graph, not scattered scripts.
      const content = await jsonLdScripts.first().textContent();
      expect(content).toBeTruthy();
      const parsed = JSON.parse(content!);
      expect(parsed["@context"]).toBe("https://schema.org");
      expect(Array.isArray(parsed["@graph"])).toBe(true);
      expect(parsed["@graph"].length).toBeGreaterThanOrEqual(2);
    });

    test("has Open Graph tags", async ({ page }) => {
      await page.goto(path);
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute("content", /.+/);

      const ogType = page.locator('meta[property="og:type"]');
      await expect(ogType).toHaveAttribute("content", /.+/);
    });

    test("has hreflang alternates for en and zh", async ({ page }) => {
      await page.goto(path);
      const enAlt = page.locator('link[rel="alternate"][hreflang="en"]');
      const zhAlt = page.locator('link[rel="alternate"][hreflang="zh"]');

      await expect(enAlt).toHaveAttribute("href", /\/en/);
      await expect(zhAlt).toHaveAttribute("href", /\/zh/);
    });
  });
}
