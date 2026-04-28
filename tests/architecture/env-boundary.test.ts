import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const ENV_FACADE = "src/lib/env.ts";
const ENV_SCHEMAS = "src/lib/env-schemas.ts";
const ENV_RUNTIME = "src/lib/env-runtime.ts";

function read(repoPath: string) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- architecture test reads repo-local files from a fixed allowlist
  return readFileSync(repoPath, "utf8");
}

function walkSourceFiles(dir: string, results: string[] = []) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- architecture test recursively scans the repo-local src tree
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".next"].includes(entry.name)) {
      continue;
    }

    const absolutePath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSourceFiles(absolutePath, results);
      continue;
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) {
      results.push(relative(process.cwd(), absolutePath).split(sep).join("/"));
    }
  }

  return results;
}

describe("env module boundaries", () => {
  it("keeps src/lib/env.ts as the public facade", () => {
    const source = read(ENV_FACADE);

    expect(source).toContain('import { createEnv } from "@t3-oss/env-nextjs"');
    expect(source).toContain('from "./env-schemas"');
    expect(source).toContain('from "./env-runtime"');
    expect(source).toContain("export const env = createEnv");
    expect(source).toContain("export function getRuntimeEnvString");
    expect(source).toContain("export function requireEnvVar");
  });

  it("keeps schemas and raw runtime reads out of the facade", () => {
    const facade = read(ENV_FACADE);
    const schemas = read(ENV_SCHEMAS);
    const runtime = read(ENV_RUNTIME);

    expect(facade).not.toContain("process.env.");
    expect(facade).not.toContain("process.env[");
    expect(facade).not.toContain('from "zod"');
    expect(schemas).toContain("export const serverEnvSchema");
    expect(schemas).toContain("export const clientEnvSchema");
    expect(runtime).toContain("export const runtimeEnv");
    expect(runtime).toContain("export function readRawEnvValue");
    expect(runtime).toContain("export function shouldSkipEnvValidation");
    expect(runtime).toContain("process.env.");
  });

  it("keeps app code on the public env import instead of internal modules", () => {
    const offenders = walkSourceFiles("src").filter((repoPath) => {
      if ([ENV_FACADE, ENV_SCHEMAS, ENV_RUNTIME].includes(repoPath)) {
        return false;
      }

      const source = read(repoPath);
      return (
        source.includes("@/lib/env-runtime") ||
        source.includes("@/lib/env-schemas") ||
        source.includes("./env-runtime") ||
        source.includes("./env-schemas")
      );
    });

    expect(offenders).toEqual([]);
  });
});
