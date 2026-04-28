import { expect, test, type Page } from "@playwright/test";
import { waitForLoadWithFallback } from "./test-environment-setup";

const PRODUCT_FAMILY_INTENT = "product-family";
const MARKET_SLUG = "north-america";
const FAMILY_SLUG = "conduit-sweeps-elbows";
const LOAD_TIMEOUT_MS = 10_000;
const FALLBACK_DELAY_MS = 500;

test.describe.configure({ mode: "serial" });

const localeCases = [
  {
    locale: "en",
    productPath: "/en/products/north-america",
    contactPath: "/en/contact",
    inquiryLabel: "Request quote for Conduit Sweeps & Elbows",
    contextLabel: "You are asking about:",
    marketLabel: "UL / ASTM Series",
    familyLabel: "Conduit Sweeps & Elbows",
  },
  {
    locale: "zh",
    productPath: "/zh/products/north-america",
    contactPath: "/zh/contact",
    inquiryLabel: "咨询 电工弯管与弯头",
    contextLabel: "你正在咨询：",
    marketLabel: "UL / ASTM系列",
    familyLabel: "电工弯管与弯头",
  },
] as const;

function parseRenderedHref(page: Page, href: string): URL {
  return new URL(href, page.url());
}

function expectProductFamilyContactUrl(url: URL, pathname: string): void {
  expect(url.pathname).toBe(pathname);
  expect(url.searchParams.get("intent")).toBe(PRODUCT_FAMILY_INTENT);
  expect(url.searchParams.get("market")).toBe(MARKET_SLUG);
  expect(url.searchParams.get("family")).toBe(FAMILY_SLUG);
}

for (const localeCase of localeCases) {
  test.describe(`product family Contact handoff (${localeCase.locale})`, () => {
    test("renders a localized Contact href and opens Contact with context", async ({
      page,
    }) => {
      await page.goto(localeCase.productPath, {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const inquiryLink = page.getByRole("link", {
        name: localeCase.inquiryLabel,
        exact: true,
      });
      await expect(inquiryLink).toBeVisible();

      const renderedHref = await inquiryLink.getAttribute("href");
      if (renderedHref === null) {
        throw new Error(
          `Missing product family inquiry href for ${localeCase.productPath}`,
        );
      }

      expectProductFamilyContactUrl(
        parseRenderedHref(page, renderedHref),
        localeCase.contactPath,
      );

      await Promise.all([
        page.waitForURL(
          (url) => {
            return (
              url.pathname === localeCase.contactPath &&
              url.searchParams.get("intent") === PRODUCT_FAMILY_INTENT &&
              url.searchParams.get("market") === MARKET_SLUG &&
              url.searchParams.get("family") === FAMILY_SLUG
            );
          },
          { waitUntil: "domcontentloaded" },
        ),
        inquiryLink.click(),
      ]);

      await waitForLoadWithFallback(page, {
        context: `${localeCase.locale} product family Contact handoff`,
        loadTimeout: LOAD_TIMEOUT_MS,
        fallbackDelay: FALLBACK_DELAY_MS,
      });

      const notice = page.getByTestId("product-family-context-notice");
      await expect(notice).toBeVisible();
      await expect(notice).toContainText(localeCase.contextLabel);
      await expect(notice).toContainText(localeCase.marketLabel);
      await expect(notice).toContainText(localeCase.familyLabel);
    });
  });
}
