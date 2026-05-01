import { expect, test } from "@playwright/test";

const keyPages: Array<{
  path: string;
  cta: RegExp;
  expectedCtaPath?: string;
}> = [
  { path: "/en", cta: /contact|inquiry|get quote/i },
  { path: "/zh", cta: /联系|询盘|获取报价/i },
  { path: "/en/contact", cta: /send|submit|contact/i },
  { path: "/zh/contact", cta: /发送|提交|联系/i },
  {
    path: "/en/products",
    cta: /request a quote|get quote/i,
    expectedCtaPath: "/en/contact",
  },
  {
    path: "/zh/products",
    cta: /获取报价|询盘|联系/i,
    expectedCtaPath: "/zh/contact",
  },
  { path: "/en/products/north-america", cta: /contact|inquiry|get quote/i },
  { path: "/en/about", cta: /contact|inquiry|get quote/i },
] as const;

const runtimeTextToReject = [
  "+86-518-0000-0000",
  "Sample Product",
  "Replace this image",
  "TODO",
  "MISSING_MESSAGE",
] as const;

function count(html: string, pattern: RegExp): number {
  return (html.match(pattern) ?? []).length;
}

function expectNoRuntimePlaceholder(pathname: string, html: string) {
  const found = runtimeTextToReject.filter((text) => html.includes(text));

  expect(
    found,
    `${pathname} exposes runtime placeholder/error text: ${found.join(", ")}`,
  ).toEqual([]);
}

for (const pageCase of keyPages) {
  test.describe(`Page contract ${pageCase.path}`, () => {
    test("keeps stable SEO, content, and CTA contract", async ({ page }) => {
      await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });

      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(
        page.locator('link[rel="alternate"][hreflang="en"]'),
      ).toHaveCount(1);
      await expect(
        page.locator('link[rel="alternate"][hreflang="zh"]'),
      ).toHaveCount(1);
      await expect(
        page.locator('link[rel="alternate"][hreflang="x-default"]'),
      ).toHaveCount(1);
      await expect(
        page.locator('script[type="application/ld+json"]'),
      ).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);

      const main = page.locator("main");
      const namedCta = main
        .getByRole("link", { name: pageCase.cta })
        .or(main.getByRole("button", { name: pageCase.cta }));
      const mainCta = pageCase.expectedCtaPath
        ? namedCta.first()
        : namedCta
            .or(
              main.locator(
                'a[href*="/contact"]:visible, a[href^="mailto:"]:visible',
              ),
            )
            .first();
      await expect(mainCta).toBeVisible();
      if (pageCase.expectedCtaPath) {
        const href = await mainCta.getAttribute("href");
        expect(href).not.toBeNull();
        expect(
          new URL(href ?? "", "https://www.tianze-pipe.com").pathname,
        ).toBe(pageCase.expectedCtaPath);
      }

      const html = await page.content();
      expect(count(html, /<main\b/gi)).toBe(1);
      expectNoRuntimePlaceholder(pageCase.path, html);
    });
  });
}
