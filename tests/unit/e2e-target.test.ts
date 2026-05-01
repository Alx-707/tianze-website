import { describe, expect, it } from "vitest";

import {
  hasRemoteE2ETarget,
  isLocalE2ETarget,
  normalizeE2ETarget,
  selectExplicitE2ETarget,
} from "@/test/e2e-target";

interface NormalizeCase {
  input: string;
  expectedHref?: string;
}

const normalizeCases: NormalizeCase[] = [
  { input: "" },
  { input: "   " },
  { input: "https://example.com", expectedHref: "https://example.com/" },
  {
    input: "http://example.com/foo?x=1#h",
    expectedHref: "http://example.com/foo?x=1#h",
  },
  { input: "example.com", expectedHref: "http://example.com/" },
  { input: "localhost:3000", expectedHref: "http://localhost:3000/" },
  { input: "[::1]:3000", expectedHref: "http://[::1]:3000/" },
  { input: "foo/bar" },
  { input: "preview.example.vercel.app/path" },
  {
    input: "https://preview.example.vercel.app/path",
    expectedHref: "https://preview.example.vercel.app/path",
  },
  { input: "/relative" },
  { input: "./relative" },
  { input: "../relative" },
  { input: "?x=1" },
  { input: "#hash" },
  { input: "foo bar" },
];

describe("e2e target normalization", () => {
  it.each(normalizeCases)(
    "normalizes or rejects %j",
    ({ input, expectedHref }) => {
      const target = normalizeE2ETarget(input);

      expect(target?.href).toBe(expectedHref);
    },
  );

  it("classifies local and remote targets after normalization", () => {
    expect(isLocalE2ETarget("localhost:3000")).toBe(true);
    expect(isLocalE2ETarget("[::1]:3000")).toBe(true);
    expect(hasRemoteE2ETarget("preview.example.vercel.app")).toBe(true);
    expect(hasRemoteE2ETarget("foo/bar")).toBe(false);
    expect(hasRemoteE2ETarget("/relative")).toBe(false);
    expect(hasRemoteE2ETarget("   ")).toBe(false);
  });

  it("selects explicit targets by priority", () => {
    expect(
      selectExplicitE2ETarget("localhost:3000", "preview.example.vercel.app")
        ?.origin,
    ).toBe("http://localhost:3000");

    expect(
      selectExplicitE2ETarget("   ", "preview.example.vercel.app")?.origin,
    ).toBe("http://preview.example.vercel.app");
  });

  it("does not fall back from invalid high-priority targets to lower-priority remotes", () => {
    expect(
      selectExplicitE2ETarget("/relative", "preview.example.vercel.app"),
    ).toBeUndefined();
    expect(
      selectExplicitE2ETarget("?x=1", "preview.example.vercel.app"),
    ).toBeUndefined();
    expect(
      selectExplicitE2ETarget("foo bar", "preview.example.vercel.app"),
    ).toBeUndefined();
    expect(
      selectExplicitE2ETarget("foo/bar", "preview.example.vercel.app"),
    ).toBeUndefined();
  });
});
