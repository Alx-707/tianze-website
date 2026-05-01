import { describe, expect, it } from "vitest";

import {
  compareClientBoundaryBudget,
  findClientBoundaryFiles,
  validateClientBoundaryBudget,
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

  it("detects use client directives with trailing comments", () => {
    const result = findClientBoundaryFiles([
      {
        path: "src/components/example.tsx",
        source:
          '"use strict"; // keep directive prologue\n"use client"; // keep as client boundary\n\nexport function Example() {\n  return null;\n}\n',
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

  it("does not count non-directive use client expressions", () => {
    const result = findClientBoundaryFiles([
      {
        path: "src/components/example.tsx",
        source:
          'const directive = "use client";\n\nexport function Example() {\n  return directive;\n}\n',
      },
      {
        path: "src/components/wrapped.tsx",
        source:
          '("use client");\n\nexport function Wrapped() {\n  return null;\n}\n',
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

  it("rejects budgets that are not objects", () => {
    expect(validateClientBoundaryBudget(null)).toEqual([
      "budget must be an object",
    ]);
  });

  it("rejects budgets with missing allowedFiles", () => {
    expect(
      validateClientBoundaryBudget({
        maxClientBoundaryFiles: 1,
      }),
    ).toContain("allowedFiles must be a string[]");
  });

  it("rejects budgets where allowedFiles is a string", () => {
    expect(
      validateClientBoundaryBudget({
        maxClientBoundaryFiles: 1,
        allowedFiles: "src/components/example.tsx",
      }),
    ).toContain("allowedFiles must be a string[]");
  });

  it("rejects budgets with non-numeric maxClientBoundaryFiles", () => {
    expect(
      validateClientBoundaryBudget({
        maxClientBoundaryFiles: "1",
        allowedFiles: [],
      }),
    ).toContain("maxClientBoundaryFiles must be a non-negative integer");
  });

  it("rejects budgets with non-integer maxClientBoundaryFiles", () => {
    expect(
      validateClientBoundaryBudget({
        maxClientBoundaryFiles: 1.5,
        allowedFiles: [],
      }),
    ).toContain("maxClientBoundaryFiles must be a non-negative integer");
  });

  it("rejects budgets with duplicate allowedFiles entries", () => {
    expect(
      validateClientBoundaryBudget({
        maxClientBoundaryFiles: 2,
        allowedFiles: [
          "src/components/example.tsx",
          "src/components/example.tsx",
        ],
      }),
    ).toEqual([
      "allowedFiles contains duplicate entries: src/components/example.tsx",
    ]);
  });

  it("returns budget errors instead of crashing during comparison", () => {
    const result = compareClientBoundaryBudget({
      budget: {
        maxClientBoundaryFiles: "1",
        allowedFiles: "src/components/example.tsx",
      },
      currentFiles: ["src/components/example.tsx"],
    });

    expect(result).toEqual({
      ok: false,
      budgetErrors: [
        "maxClientBoundaryFiles must be a non-negative integer",
        "allowedFiles must be a string[]",
      ],
      excessFiles: [],
      count: 1,
      maxClientBoundaryFiles: null,
    });
  });
});
