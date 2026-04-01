import { describe, expect, it } from "vitest";
import {
  collectMissingMarkersFromSource,
  collectRiskFindingsFromSource,
  RISK_SCAN_FILES,
} from "../../../scripts/check-translate-compat.js";

describe("check-translate-compat risk scanning", () => {
  it("flags direct JSX aliases backed by ternary text branches", () => {
    const findings = collectRiskFindingsFromSource(
      `
        export function Example({
          statusMessage,
          fallbackMessage,
          isReady,
        }: {
          statusMessage: string;
          fallbackMessage: string;
          isReady: boolean;
        }) {
          const resolvedMessage = isReady ? statusMessage : fallbackMessage;
          return <div>{resolvedMessage}</div>;
        }
      `,
      "src/components/forms/example.tsx",
    );

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "alias-direct-string",
          file: "src/components/forms/example.tsx",
        }),
      ]),
    );
  });

  it("flags direct JSX aliases backed by logical text branches", () => {
    const findings = collectRiskFindingsFromSource(
      `
        export function Example({
          shouldShow,
          statusMessage,
        }: {
          shouldShow: boolean;
          statusMessage: string;
        }) {
          const resolvedMessage = shouldShow && statusMessage;
          return <>{resolvedMessage}</>;
        }
      `,
      "src/components/forms/example.tsx",
    );

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "alias-direct-string",
        }),
      ]),
    );
  });

  it("follows simple alias chains before JSX render", () => {
    const findings = collectRiskFindingsFromSource(
      `
        export function Example({
          successLabel,
          errorLabel,
          isSuccess,
        }: {
          successLabel: string;
          errorLabel: string;
          isSuccess: boolean;
        }) {
          const resolvedLabel = isSuccess ? successLabel : errorLabel;
          const forwardedLabel = resolvedLabel;
          return <span>{forwardedLabel}</span>;
        }
      `,
      "src/components/forms/example.tsx",
    );

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "alias-direct-string",
        }),
      ]),
    );
  });

  it("does not flag aliases inside protected wrappers", () => {
    const findings = collectRiskFindingsFromSource(
      `
        export function Example({
          statusMessage,
          fallbackMessage,
          isReady,
        }: {
          statusMessage: string;
          fallbackMessage: string;
          isReady: boolean;
        }) {
          const resolvedMessage = isReady ? statusMessage : fallbackMessage;
          return <span translate="no">{resolvedMessage}</span>;
        }
      `,
      "src/components/forms/example.tsx",
    );

    expect(findings).toEqual([]);
  });

  it("does not flag aliases that resolve to JSX elements", () => {
    const findings = collectRiskFindingsFromSource(
      `
        export function Example({ isReady }: { isReady: boolean }) {
          const resolvedContent = isReady ? <strong>Ready</strong> : null;
          return <div>{resolvedContent}</div>;
        }
      `,
      "src/components/forms/example.tsx",
    );

    expect(findings).toEqual([]);
  });
});

describe("check-translate-compat marker scanning", () => {
  it("matches real JSX markers without relying on raw substring search", () => {
    const missing = collectMissingMarkersFromSource(
      `
        export function Example({ item }: { item: { key: string } }) {
          return (
            <nav className="header-nav-center notranslate" translate="no">
              <span data-testid={\`header-nav-label-\${item.key}\`} translate="no">
                Label
              </span>
            </nav>
          );
        }
      `,
      "src/components/layout/header.tsx",
      ["header-nav-label-", "notranslate", 'translate="no"'],
    );

    expect(missing).toEqual([]);
  });

  it("does not let comments satisfy required markers", () => {
    const missing = collectMissingMarkersFromSource(
      `
        // header-nav-label-
        // notranslate
        // translate="no"
        export function Example() {
          return <nav><span>Label</span></nav>;
        }
      `,
      "src/components/layout/header.tsx",
      ["header-nav-label-", "notranslate", 'translate="no"'],
    );

    expect(missing).toEqual([
      expect.objectContaining({ marker: "header-nav-label-" }),
      expect.objectContaining({ marker: "notranslate" }),
      expect.objectContaining({ marker: 'translate="no"' }),
    ]);
  });
});

describe("check-translate-compat protected surface coverage", () => {
  it("risk-scans protected page surfaces in src/app", () => {
    expect(RISK_SCAN_FILES).toEqual(
      expect.arrayContaining([
        "src/app/[locale]/contact/page.tsx",
        "src/app/[locale]/products/[market]/page.tsx",
      ]),
    );
  });
});
