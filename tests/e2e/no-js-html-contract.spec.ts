import { expect, test } from "@playwright/test";

const localeCases = [
  {
    locale: "en",
    skipLabel: "Skip to main content",
    contactHeading: /Contact Us/i,
  },
  {
    locale: "zh",
    skipLabel: "跳转到主要内容",
    contactHeading: /联系我们/i,
  },
] as const;

for (const localeCase of localeCases) {
  test.describe(`No-JS HTML contract (${localeCase.locale})`, () => {
    test.use({ javaScriptEnabled: false });

    test("homepage keeps meaningful structure without client boot", async ({
      page,
    }) => {
      await page.goto(`http://localhost:3000/${localeCase.locale}`, {
        waitUntil: "domcontentloaded",
      });

      await expect(
        page.getByRole("link", { name: localeCase.skipLabel }),
      ).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: /main navigation/i }),
      ).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const html = await page.content();
      expect(html).not.toContain("BAILOUT_TO_CLIENT_SIDE_RENDERING");
      expect(html).toContain('id="main-content"');
    });

    test("contact page renders layout shell without JavaScript", async ({
      page,
    }) => {
      // Contact page uses async data fetching (getPageBySlug) which requires
      // Suspense boundary for Next.js PPR. In no-JS mode, the Suspense fallback
      // (skeleton) is shown instead of streamed content. We verify the page
      // shell (nav, skip link, main structure) renders, not the async content.
      await page.goto(`http://localhost:3000/${localeCase.locale}/contact`, {
        waitUntil: "domcontentloaded",
      });

      await expect(
        page.getByRole("link", { name: localeCase.skipLabel }),
      ).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: /main navigation/i }),
      ).toBeVisible();

      const html = await page.content();
      expect(html).toContain('id="main-content"');
    });
  });
}
