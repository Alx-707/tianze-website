import { expect, test } from "@playwright/test";

const previewOnlyPages = ["/en", "/en/contact", "/en/products"] as const;
const previewTextToReject = [
  "localhost:3000",
  "MISSING_MESSAGE",
  "BAILOUT_TO_CLIENT_SIDE_RENDERING",
] as const;
const previewContractSkipReason =
  "preview contract requires non-local STAGING_URL or PLAYWRIGHT_BASE_URL";
const localPreviewHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

function getExplicitPreviewTarget(): string {
  return process.env.STAGING_URL || process.env.PLAYWRIGHT_BASE_URL || "";
}

function isLocalPreviewTarget(rawTarget: string): boolean {
  try {
    const hostname = new URL(rawTarget).hostname.replace(/^\[|\]$/g, "");
    return localPreviewHostnames.has(hostname.toLowerCase());
  } catch {
    return true;
  }
}

function hasNonLocalExplicitPreviewTarget(): boolean {
  const explicitTarget = getExplicitPreviewTarget();
  return Boolean(explicitTarget) && !isLocalPreviewTarget(explicitTarget);
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
