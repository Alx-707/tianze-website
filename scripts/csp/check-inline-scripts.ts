import crypto from "crypto";
import { spawn } from "child_process";

import { CSP_INLINE_SCRIPT_SHA256_BASE64_ALLOWLIST_FOR_TESTS } from "../../src/config/security";

type InlineScript = {
  attrs: string;
  body: string;
};

function sha256Base64(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("base64");
}

function extractInlineScripts(html: string): InlineScript[] {
  const scripts: InlineScript[] = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const attrs = (match[1] ?? "").trim();
    if (/(^|\s)src=/.test(attrs)) continue;
    scripts.push({ attrs, body: match[2] ?? "" });
  }
  return scripts;
}

function hasNonceAttr(attrs: string): boolean {
  return /(^|\s)nonce=/.test(attrs);
}

async function waitForReady(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status >= 200 && res.status < 500) return;
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server not ready after ${timeoutMs}ms: ${url}`);
}

function parseCspNonce(csp: string): string | null {
  const m = csp.match(/'nonce-([^']+)'/);
  return m ? m[1] : null;
}

async function fetchHtml(url: string): Promise<{ html: string; csp: string }> {
  const res = await fetch(url, { redirect: "follow" });
  const html = await res.text();
  const csp =
    res.headers.get("content-security-policy") ??
    res.headers.get("Content-Security-Policy") ??
    "";
  if (!csp) {
    throw new Error(`Missing Content-Security-Policy header for ${url}`);
  }
  return { html, csp };
}

async function run(): Promise<void> {
  const port = process.env.CSP_CHECK_PORT ?? "3210";
  const baseUrl = `http://localhost:${port}`;
  const allowedHashes = new Set(
    CSP_INLINE_SCRIPT_SHA256_BASE64_ALLOWLIST_FOR_TESTS,
  );

  const child = spawn("pnpm", ["start"], {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: port,
      SECURITY_HEADERS_ENABLED: "true",
      NEXT_PUBLIC_SECURITY_MODE: "strict",
    },
  });

  const shutdown = async () => {
    if (child.exitCode !== null) return;
    child.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 500));
    if (child.exitCode === null) child.kill("SIGKILL");
  };

  try {
    await waitForReady(`${baseUrl}/en`, 30_000);

    const urls = [`${baseUrl}/en`, `${baseUrl}/zh`];
    for (const url of urls) {
      const { html, csp } = await fetchHtml(url);
      const nonce = parseCspNonce(csp);
      if (!nonce) {
        throw new Error(`CSP nonce not found for ${url}`);
      }

      const scripts = extractInlineScripts(html);
      const missing: Array<{ hash: string; preview: string }> = [];

      for (const s of scripts) {
        if (hasNonceAttr(s.attrs)) continue;
        const body = s.body;
        if (!body) continue;
        const hash = sha256Base64(body);
        if (!allowedHashes.has(hash)) {
          missing.push({
            hash,
            preview: body.slice(0, 120).replace(/\n/g, "\\n"),
          });
        }
      }

      if (missing.length > 0) {
        const details = missing
          .slice(0, 8)
          .map((m) => `- sha256=${m.hash} preview=${m.preview}`)
          .join("\n");
        throw new Error(
          [
            `Found inline <script> without nonce not in hash allowlist for ${url}.`,
            `If this is expected, update CSP hashes in src/config/security.ts and re-run this check.`,
            details,
          ].join("\n"),
        );
      }
    }
  } finally {
    await shutdown();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
