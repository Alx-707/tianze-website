import { describe, expect, it } from "vitest";
import { collectRiskFindingsFromSource } from "../../../scripts/check-translate-compat.js";

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
