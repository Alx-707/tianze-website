#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const LOCALES = require("../i18n-locales.config").locales;

function deepMerge(target, source) {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function main() {
  for (const locale of LOCALES) {
    const criticalPath = path.join(ROOT, "messages", locale, "critical.json");
    const deferredPath = path.join(ROOT, "messages", locale, "deferred.json");
    const flatPath = path.join(ROOT, "messages", `${locale}.json`);

    const critical = JSON.parse(fs.readFileSync(criticalPath, "utf8"));
    const deferred = JSON.parse(fs.readFileSync(deferredPath, "utf8"));
    const merged = deepMerge(critical, deferred);

    fs.writeFileSync(flatPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
    console.log(`Regenerated flat translation: messages/${locale}.json`);
  }
}

main();
