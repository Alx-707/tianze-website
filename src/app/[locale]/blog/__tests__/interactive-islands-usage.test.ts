import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("shipped blog routes", () => {
  it("do not import the newsletter client island directly", () => {
    const combinedSource = [
      readFileSync("src/app/[locale]/blog/page.tsx", "utf8"),
      readFileSync("src/app/[locale]/blog/[slug]/page.tsx", "utf8"),
    ].join("\n");

    expect(combinedSource).not.toContain("BlogNewsletter");
  });
});
