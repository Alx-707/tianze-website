import { rmSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const targets = [".next", ".open-next", ".wrangler/tmp"];

for (const target of targets) {
  rmSync(resolve(root, target), { force: true, recursive: true });
}

console.log(
  `[clean-next-build-artifacts] removed ${targets.join(", ")} from ${root}`,
);
