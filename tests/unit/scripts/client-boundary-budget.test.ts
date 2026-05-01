import { describe, expect, it } from "vitest";

import {
  compareClientBoundaryBudget,
  findClientBoundaryFiles,
} from "../../../scripts/client-boundary-budget.mjs";

describe("client boundary budget", () => {
  it("detects top-level double-quoted use client directives", () => {
    const result = findClientBoundaryFiles([
      {
        path: "src/components/example.tsx",
        source:
          '"use client";\n\nexport function Example() {\n  return null;\n}\n',
      },
    ]);

    expect(result).toEqual(["src/components/example.tsx"]);
  });

  it("detects top-level single-quoted use client directives", () => {
    const result = findClientBoundaryFiles([
      {
        path: "src/components/example.tsx",
        source:
          "'use client';\n\nexport function Example() {\n  return null;\n}\n",
      },
    ]);

    expect(result).toEqual(["src/components/example.tsx"]);
  });

  it("detects use client after another top-level directive", () => {
    const result = findClientBoundaryFiles([
      {
        path: "src/components/example.tsx",
        source:
          '"use strict";\n"use client";\n\nexport function Example() {\n  return null;\n}\n',
      },
    ]);

    expect(result).toEqual(["src/components/example.tsx"]);
  });

  it("detects use client after a leading block comment", () => {
    const result = findClientBoundaryFiles([
      {
        path: "src/components/example.tsx",
        source:
          '/* generated note */\n"use client";\n\nexport function Example() {\n  return null;\n}\n',
      },
    ]);

    expect(result).toEqual(["src/components/example.tsx"]);
  });

  it("does not count use client after imports as a top-level directive", () => {
    const result = findClientBoundaryFiles([
      {
        path: "src/components/example.tsx",
        source:
          'import { useState } from "react";\n\n"use client";\n\nexport function Example() {\n  return null;\n}\n',
      },
    ]);

    expect(result).toEqual([]);
  });

  it("fails when current client boundaries exceed the allowed budget", () => {
    const result = compareClientBoundaryBudget({
      budget: {
        maxClientBoundaryFiles: 1,
        allowedFiles: ["src/components/allowed.tsx"],
      },
      currentFiles: [
        "src/components/allowed.tsx",
        "src/components/new-client.tsx",
      ],
    });

    expect(result).toEqual({
      ok: false,
      excessFiles: ["src/components/new-client.tsx"],
      count: 2,
      maxClientBoundaryFiles: 1,
    });
  });

  it("passes when current client boundaries stay within the allowed budget", () => {
    const result = compareClientBoundaryBudget({
      budget: {
        maxClientBoundaryFiles: 1,
        allowedFiles: ["src/components/allowed.tsx"],
      },
      currentFiles: ["src/components/allowed.tsx"],
    });

    expect(result).toEqual({
      ok: true,
      excessFiles: [],
      count: 1,
      maxClientBoundaryFiles: 1,
    });
  });
});
