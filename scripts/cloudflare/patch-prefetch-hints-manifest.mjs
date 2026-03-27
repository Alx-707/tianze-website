import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const HANDLER_PATH = path.join(
  ROOT_DIR,
  ".open-next",
  "server-functions",
  "default",
  "handler.mjs",
);

const NEEDLE =
  ";throw new Error(`Unexpected loadManifest(${path2}) call!`)}function evalManifest";
const PATCH =
  ";if(/(?:^|\\/)(?:[^/]*manifest(?:\\.json)?|prefetch-hints\\.json)$/.test(path2))return{};throw new Error(`Unexpected loadManifest(${path2}) call!`)}function evalManifest";

async function main() {
  const source = await readFile(HANDLER_PATH, "utf8");

  if (source.includes(PATCH)) {
    console.log("[cf-prefetch-patch] handler already patched");
    return;
  }

  if (
    source.includes("prefetch-hints") &&
    source.includes("dynamic-css-manifest") &&
    source.includes("subresource-integrity-manifest")
  ) {
    console.log(
      "[cf-prefetch-patch] upstream manifest handling already present; no local patch needed",
    );
    return;
  }

  if (!source.includes(NEEDLE)) {
    throw new Error(
      "[cf-prefetch-patch] expected manifest guard not found in generated handler",
    );
  }

  const patched = source.replace(NEEDLE, PATCH);
  await writeFile(HANDLER_PATH, patched, "utf8");
  console.log("[cf-prefetch-patch] patched default handler manifest guard");
}

main().catch((error) => {
  console.error("[cf-prefetch-patch] failed:", error);
  process.exit(1);
});
