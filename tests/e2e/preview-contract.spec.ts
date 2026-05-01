import { expect, test } from "@playwright/test";
import { hasRemoteE2ETarget, selectExplicitE2ETarget } from "@/test/e2e-target";

const previewOnlyPages = ["/en", "/en/contact", "/en/products"] as const;
const previewTextToReject = [
  "localhost:3000",
  "MISSING_MESSAGE",
  "BAILOUT_TO_CLIENT_SIDE_RENDERING",
] as const;
const previewContractSkipReason =
  "preview contract requires non-local STAGING_URL or PLAYWRIGHT_BASE_URL";

function getExplicitPreviewTarget(): URL | undefined {
  return selectExplicitE2ETarget(
    process.env.STAGING_URL,
    process.env.PLAYWRIGHT_BASE_URL,
  );
}

function hasNonLocalExplicitPreviewTarget(): boolean {
  const explicitTarget = getExplicitPreviewTarget();
  return hasRemoteE2ETarget(explicitTarget?.href);
}

function expectNoPreviewLeak(pathname: string, html: string) {
  const found = previewTextToReject.filter((text) => html.includes(text));

  expect(
    found,
    `${pathname} exposes preview-only leak/error text: ${found.join(", ")}`,
  ).toEqual([]);
}

for (const pathname of previewOnlyPages) {
  test(`preview contract for ${pathname}`, async ({ page }) => {
    test.skip(!hasNonLocalExplicitPreviewTarget(), previewContractSkipReason);

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
