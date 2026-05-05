import { chromium, type FullConfig } from "@playwright/test";
import {
  installInterferenceGuard,
  removeInterferingElements,
  setupTestEnvironment,
  waitForStablePage,
} from "./test-environment-setup";
import {
  isLocalE2ETarget,
  selectExplicitE2ETarget,
} from "../../src/test/e2e-target";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global setup for Playwright tests...");

  // 设置测试环境变量
  setupTestEnvironment();

  const supportedLocales = (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || "en")
    .split(",")
    .map((locale) => locale.trim())
    .filter(Boolean);
  const defaultLocale =
    process.env.NEXT_PUBLIC_DEFAULT_LOCALE?.trim() ||
    supportedLocales[0] ||
    "en";

  const ensureLocaleInUrl = (input: string): string => {
    try {
      const url = new URL(input);
      const segments = url.pathname.split("/").filter(Boolean);
      const firstSegment = segments[0];
      const lastSegment =
        segments.length > 0 ? segments[segments.length - 1] : undefined;
      const hasLocale =
        (firstSegment ? supportedLocales.includes(firstSegment) : false) ||
        (lastSegment ? supportedLocales.includes(lastSegment) : false);

      if (!hasLocale) {
        url.pathname = `${url.pathname.replace(/\/$/, "")}/${defaultLocale}`;
      }

      const normalizedPath = url.pathname.replace(/\/$/, "");
      return `${url.origin}${normalizedPath}${url.search}${url.hash}`;
    } catch {
      const trimmed = input.replace(/\/$/, "");
      const hasLocale = supportedLocales.some((locale) =>
        trimmed.endsWith(`/${locale}`),
      );
      return hasLocale ? trimmed : `${trimmed}/${defaultLocale}`;
    }
  };

  // Launch browser for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await installInterferenceGuard(page);

  try {
    const selectedE2ETarget = selectExplicitE2ETarget(
      process.env.STAGING_URL,
      process.env.PLAYWRIGHT_BASE_URL,
    );
    const configuredBaseURL = config.projects?.[0]?.use?.baseURL;
    const fallbackBaseURL =
      typeof configuredBaseURL === "string"
        ? configuredBaseURL
        : "http://localhost:3000";
    const baseURL = ensureLocaleInUrl(
      selectedE2ETarget?.href ?? fallbackBaseURL,
    );
    const shouldSkipLocalReadiness = selectedE2ETarget
      ? !isLocalE2ETarget(selectedE2ETarget.href)
      : false;

    console.log(`⏳ Waiting for server at ${baseURL}...`);

    if (shouldSkipLocalReadiness) {
      console.log("✅ Using remote E2E target, skipping local server check");
    } else {
      await page.goto(baseURL, { waitUntil: "networkidle" });

      // 移除可能的干扰元素
      await removeInterferingElements(page);

      // 等待页面稳定
      await waitForStablePage(page);

      console.log("✅ Server is ready and page is stable");
    }

    // Perform any global setup tasks here
    // For example: login, seed data, etc.
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log("✅ Global setup completed");
}

export default globalSetup;
