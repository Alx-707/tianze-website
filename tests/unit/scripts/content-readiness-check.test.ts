import { describe, expect, it } from "vitest";

import {
  checkContentReadiness,
  shouldScanLivePath,
} from "../../../scripts/content-readiness-check.mjs";

describe("content-readiness-check", () => {
  it("scans only launch-facing content and explicit runtime config inputs", () => {
    expect(shouldScanLivePath("content/pages/en/about.mdx")).toBe(true);
    expect(shouldScanLivePath("messages/en/common.json")).toBe(true);
    expect(shouldScanLivePath("src/config/single-site.ts")).toBe(true);
    expect(shouldScanLivePath("src/config/public-trust.ts")).toBe(false);
    expect(
      shouldScanLivePath("public/images/products/sample-product.svg"),
    ).toBe(true);
    expect(
      shouldScanLivePath("public/images/products/sample-product.png"),
    ).toBe(false);
    expect(
      shouldScanLivePath("src/lib/__tests__/structured-data.test.ts"),
    ).toBe(false);
    expect(shouldScanLivePath("src/components/foo.test.tsx")).toBe(false);
    expect(shouldScanLivePath("content/_archive/old.md")).toBe(false);
    expect(shouldScanLivePath("docs/superpowers/plans/example.md")).toBe(false);
    expect(shouldScanLivePath("reports/content/latest.json")).toBe(false);
    expect(shouldScanLivePath(".next/server/app/en/page.html")).toBe(false);
    expect(
      shouldScanLivePath(".open-next/server-functions/default/index.mjs"),
    ).toBe(false);
  });

  it("detects obvious launch-facing placeholders", () => {
    expect(
      checkContentReadiness([
        {
          path: "src/config/single-site.ts",
          text: 'phone: "+86-518-0000-0000"',
        },
        {
          path: "public/images/products/sample-product.svg",
          text: "Replace this image with your real product photo",
        },
        {
          path: "messages/en/common.json",
          text: '{"error":"MISSING_MESSAGE"}',
        },
      ]),
    ).toEqual({
      ok: false,
      findings: [
        {
          path: "src/config/single-site.ts",
          label: "fake phone",
          match: "+86-518-0000-0000",
        },
        {
          path: "public/images/products/sample-product.svg",
          label: "sample product replacement instruction",
          match: "Replace this image",
        },
        {
          path: "messages/en/common.json",
          label: "missing translation marker",
          match: "MISSING_MESSAGE",
        },
      ],
    });
  });

  it("does not treat normal form placeholder fields as launch blockers", () => {
    expect(
      checkContentReadiness([
        {
          path: "messages/en/forms.json",
          text: '{"placeholder":"Enter your email address"}',
        },
      ]),
    ).toEqual({
      ok: true,
      findings: [],
    });
  });
});
