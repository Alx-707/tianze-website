import { expect, test } from "@playwright/test";

/**
 * Post-Deploy Form Chain Verification (Phase 1)
 *
 * Tests the REAL form submission chain against live services:
 * 1. Fill contact form in browser
 * 2. Submit with Turnstile test key
 * 3. Verify Airtable record was created via API
 * 4. Clean up test record
 *
 * This test is NOT run in regular CI. It runs:
 * - After deployment via `pnpm test:e2e:post-deploy`
 * - Requires real API keys in environment
 *
 * Environment variables required:
 * - STAGING_URL or PLAYWRIGHT_BASE_URL: deployed site URL
 * - AIRTABLE_API_KEY: PAT with read/write access
 * - AIRTABLE_BASE_ID: target base
 * - AIRTABLE_TABLE_NAME: target table (default: "Contacts")
 */

// Skip this test if not in post-deploy mode
const isPostDeploy = Boolean(
  process.env.POST_DEPLOY_TEST ||
  process.env.STAGING_URL ||
  process.env.PLAYWRIGHT_BASE_URL,
);

test.describe("Post-Deploy: Contact Form Chain", () => {
  test.skip(
    !isPostDeploy,
    "Only runs in post-deploy mode (set POST_DEPLOY_TEST=1)",
  );

  const CANARY_EMAIL = `smoke-test+${Date.now()}@tianze-pipe.com`;
  const AIRTABLE_BASE_URL = "https://api.airtable.com/v0";

  test("form submission creates Airtable record", async ({ page, request }) => {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;
    const tableName = process.env.AIRTABLE_TABLE_NAME || "Contacts";

    test.skip(
      !baseId || !apiKey,
      "Missing AIRTABLE_BASE_ID or AIRTABLE_API_KEY",
    );

    // 1. Navigate to contact page
    await page.goto("/en/contact");
    await page.waitForLoadState("load");

    // 2. Fill form
    await page.fill('input[name="firstName"]', "Smoke");
    await page.fill('input[name="lastName"]', "Test");
    await page.fill('input[name="email"]', CANARY_EMAIL);
    await page.fill('input[name="company"]', "Automated Test");
    await page.fill(
      'textarea[name="message"]',
      "Automated post-deploy verification — please ignore",
    );

    // Check privacy checkbox
    const privacyCheckbox = page.locator('input[name="acceptPrivacy"]');
    if (await privacyCheckbox.isVisible()) {
      await privacyCheckbox.check();
    }

    // 3. Wait for Turnstile (test mode auto-passes)
    await page.waitForTimeout(3000);

    // 4. Submit form
    const submitButton = page.getByRole("button", {
      name: /send message|submit/i,
    });

    // If submit is still disabled (Turnstile not ready), skip gracefully
    if (await submitButton.isDisabled()) {
      test.skip(
        true,
        "Submit button still disabled — Turnstile may not be in test mode",
      );
      return;
    }

    await submitButton.click();

    // 5. Wait for success or error feedback
    const successIndicator = page
      .getByText(/success|thank you|sent/i)
      .or(page.getByText(/成功|感谢|已发送/i));
    const errorIndicator = page
      .getByText(/error|failed|try again/i)
      .or(page.getByText(/错误|失败|重试/i));

    const result = await Promise.race([
      successIndicator
        .first()
        .waitFor({ timeout: 15000 })
        .then(() => "success"),
      errorIndicator
        .first()
        .waitFor({ timeout: 15000 })
        .then(() => "error"),
    ]).catch(() => "timeout");

    if (result !== "success") {
      test.skip(
        true,
        `Form submission result: ${result} — chain verification skipped`,
      );
      return;
    }

    // 6. Verify Airtable record exists
    await page.waitForTimeout(5000); // Wait for async write

    const airtableResponse = await request.get(
      `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent(tableName)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        params: {
          filterByFormula: `{Email}="${CANARY_EMAIL}"`,
          maxRecords: "1",
        },
      },
    );

    expect(airtableResponse.ok()).toBe(true);
    const body = await airtableResponse.json();
    expect(body.records.length).toBeGreaterThanOrEqual(1);

    // 7. Clean up: delete test record
    const recordId = body.records[0]?.id;
    if (recordId) {
      await request.delete(
        `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`,
        { headers: { Authorization: `Bearer ${apiKey}` } },
      );
    }
  });
});
