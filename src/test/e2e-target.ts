const urlProtocolPattern = /^[a-z][a-z\d+\-.]*:\/\//i;
const pathLikeTargetPattern = /^(?:\/|\.\/|\.\.\/|\?|#)/;
const localE2EHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeHostname(hostname: string): string {
  return hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

export function normalizeE2ETarget(input?: string): URL | undefined {
  const trimmed = input?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (pathLikeTargetPattern.test(trimmed)) {
    return undefined;
  }

  const hasProtocol = urlProtocolPattern.test(trimmed);
  const candidate = hasProtocol ? trimmed : `http://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (!hasProtocol && url.pathname !== "/") {
      return undefined;
    }
    return url.hostname ? url : undefined;
  } catch {
    return undefined;
  }
}

export function isLocalE2ETarget(input?: string): boolean {
  const url = normalizeE2ETarget(input);

  if (!url) {
    return true;
  }

  return localE2EHostnames.has(normalizeHostname(url.hostname));
}

export function hasRemoteE2ETarget(input?: string): boolean {
  const trimmed = input?.trim();

  if (!trimmed) {
    return false;
  }

  const url = normalizeE2ETarget(trimmed);
  return url ? !isLocalE2ETarget(trimmed) : false;
}

export function selectExplicitE2ETarget(
  ...candidates: Array<string | undefined>
): URL | undefined {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();

    if (!trimmed) {
      continue;
    }

    const url = normalizeE2ETarget(candidate);

    if (url) {
      return url;
    }

    return undefined;
  }

  return undefined;
}
