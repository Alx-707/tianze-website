import { existsSync } from "node:fs";
import path from "node:path";
import { config as loadDotenv } from "dotenv";

const LOCAL_ENV_FILES = [".env.local", ".env"];

export function loadLocalEnv(rootDir = process.cwd()) {
  for (const fileName of LOCAL_ENV_FILES) {
    const filePath = path.join(rootDir, fileName);
    if (!existsSync(filePath)) {
      continue;
    }

    loadDotenv({
      path: filePath,
      override: false,
      quiet: true,
    });
  }
}
