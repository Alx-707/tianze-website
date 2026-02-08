#!/usr/bin/env node
/**
 * Rebuild messages/{locale}.json from split critical+deferred files.
 * Run: node scripts/rebuild-full-messages.js
 */
const fs = require("fs");
const path = require("path");

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      target[key] = target[key] || {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const locales = ["en", "zh"];
const messagesDir = path.join(__dirname, "..", "messages");

for (const locale of locales) {
  const crit = JSON.parse(
    fs.readFileSync(path.join(messagesDir, locale, "critical.json"), "utf8"),
  );
  const def = JSON.parse(
    fs.readFileSync(path.join(messagesDir, locale, "deferred.json"), "utf8"),
  );
  const full = deepMerge({}, crit);
  deepMerge(full, def);
  fs.writeFileSync(
    path.join(messagesDir, `${locale}.json`),
    JSON.stringify(full, null, 2) + "\n",
  );
  console.log(`${locale}.json rebuilt from critical+deferred`);
}
