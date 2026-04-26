import { spawn } from "child_process";

type InlineScript = {
  attrs: string;
  body: string;
};

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

function extractNonceAttr(attrs: string): string | null {
  const match = attrs.match(/(?:^|\s)nonce=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
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

function parseCspDirectives(csp: string): Map<string, Set<string>> {
  const directives = new Map<string, Set<string>>();
  for (const part of csp.split(";")) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    const [name, ...values] = tokens;
    if (name) {
      directives.set(name, new Set(values));
    }
  }
  return directives;
}

function assertScriptPolicyMatchesRuntime(csp: string, url: string): void {
  const directives = parseCspDirectives(csp);
  const scriptSrc = directives.get("script-src");
  const scriptSrcElem = directives.get("script-src-elem");

  if (!scriptSrc) {
    throw new Error(`Missing script-src directive for ${url}`);
  }

  if (scriptSrc.has("'unsafe-inline'")) {
    throw new Error(`script-src must not contain 'unsafe-inline' for ${url}`);
  }

  if (!scriptSrcElem) {
    throw new Error(`Missing script-src-elem directive for ${url}`);
  }

  if (!scriptSrcElem.has("'unsafe-inline'")) {
    throw new Error(
      [
        `script-src-elem must explicitly allow 'unsafe-inline' for ${url}.`,
        "Next.js App Router prerendered/RSC script elements cannot reliably receive request nonces.",
      ].join("\n"),
    );
  }
}

function getScriptSrcNonces(csp: string): Set<string> {
  const directives = parseCspDirectives(csp);
  const scriptSrc = directives.get("script-src");
  const nonces = new Set<string>();

  for (const value of scriptSrc ?? []) {
    const match = value.match(/^'nonce-([^']+)'$/);
    if (match?.[1]) {
      nonces.add(match[1]);
    }
  }

  return nonces;
}

function allowsUnnoncedInlineScriptElements(csp: string): boolean {
  const directives = parseCspDirectives(csp);
  return directives.get("script-src-elem")?.has("'unsafe-inline'") ?? false;
}

function assertScriptNonceConsistency(
  csp: string,
  scripts: InlineScript[],
): void {
  const cspNonces = getScriptSrcNonces(csp);
  if (cspNonces.size === 0) {
    throw new Error("script-src must contain at least one nonce source");
  }

  const noncedInlineScripts = scripts.filter((script) =>
    hasNonceAttr(script.attrs),
  );
  const unnoncedInlineScripts = scripts.filter(
    (script) => !hasNonceAttr(script.attrs) && script.body.trim().length > 0,
  );

  for (const script of noncedInlineScripts) {
    const nonce = extractNonceAttr(script.attrs);
    if (!nonce || !cspNonces.has(nonce)) {
      throw new Error(
        `Inline script nonce "${nonce ?? "<missing>"}" does not match CSP`,
      );
    }
  }

  if (
    unnoncedInlineScripts.length > 0 &&
    !allowsUnnoncedInlineScriptElements(csp)
  ) {
    throw new Error(
      "Unnonced inline scripts require script-src-elem 'unsafe-inline'",
    );
  }
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
      assertScriptPolicyMatchesRuntime(csp, url);

      const scripts = extractInlineScripts(html);
      assertScriptNonceConsistency(csp, scripts);
      const noncedInlineScripts = scripts.filter((s) => hasNonceAttr(s.attrs));
      const unnoncedInlineScripts = scripts.filter(
        (s) => !hasNonceAttr(s.attrs) && s.body.length > 0,
      );

      if (scripts.length === 0) {
        throw new Error(`No inline scripts found for ${url}`);
      }

      if (
        noncedInlineScripts.length === 0 &&
        unnoncedInlineScripts.length === 0
      ) {
        throw new Error(
          `Inline script extraction returned no executable bodies for ${url}`,
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
