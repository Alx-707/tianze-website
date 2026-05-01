import { expect, test } from "@playwright/test";

const previewOnlyPages = ["/en", "/en/contact", "/en/products"] as const;
const previewTextToReject = [
  "localhost:3000",
  "MISSING_MESSAGE",
  "BAILOUT_TO_CLIENT_SIDE_RENDERING",
] as const;

function expectNoPreviewLeak(pathname: string, html: string) {
  const found = previewTextToReject.filter((text) => html.includes(text));

  expect(
    found,
    `${pathname} exposes preview-only leak/error text: ${found.join(", ")}`,
  ).toEqual([]);
}

for (const pathname of previewOnlyPages) {
  test(`preview contract for ${pathname}`, async ({ page, baseURL }) => {
    test.skip(!baseURL, "Playwright baseURL is required for preview contract");

    await page.goto(pathname, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(
      page.locator('script[type="application/ld+json"]'),
    ).toHaveCount(1);

    const html = await page.content();
    expectNoPreviewLeak(pathname, html);
  });
}
