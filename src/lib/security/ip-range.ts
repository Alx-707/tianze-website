const BIGINT_ZERO = 0n;
const BIGINT_ONE = 1n;
const INVALID_IP_VERSION = 0;
const IPV4_VERSION = 4;
const IPV4_BITS_PER_OCTET = 8;
const IPV4_OCTET_COUNT = 4;
const IPV4_MAX_OCTET = 255;
const IPV4_FULL_MASK = 2 ** (IPV4_OCTET_COUNT * IPV4_BITS_PER_OCTET) - 1;
const IPV4_SEGMENT_MASK = 0xffff;
const IPV6_BITS_PER_SEGMENT = 16;
const IPV6_SEGMENT_COUNT = 8;
const IPV6_MAX_BITS = 128;
const MALFORMED_IPV6_TRIPLE_COLON = /:::/u;

export function ipv4ToInteger(ip: string): number | null {
  const segments = ip.split(".");
  if (segments.length !== IPV4_OCTET_COUNT) return null;

  let value = 0;
  for (const segment of segments) {
    if (!/^\d+$/u.test(segment)) return null;

    const octet = Number.parseInt(segment, 10);
    if (!Number.isInteger(octet) || octet < 0 || octet > IPV4_MAX_OCTET) {
      return null;
    }

    value = (value << IPV4_BITS_PER_OCTET) + octet;
  }

  return value >>> 0;
}

export function ipv4ToBigInt(ip: string): bigint | null {
  const value = ipv4ToInteger(ip);
  return value === null ? null : BigInt(value);
}

export function normalizeIPv6Segments(segments: string[]): string[] | null {
  if (segments.length === 0) return [];

  const lastSegment = segments.at(-1);
  if (lastSegment?.includes(".")) {
    const ipv4Value = ipv4ToInteger(lastSegment);
    if (ipv4Value === null) return null;

    const normalized = segments.slice(0, -1);
    normalized.push(
      ((ipv4Value >>> IPV6_BITS_PER_SEGMENT) & IPV4_SEGMENT_MASK).toString(16),
    );
    normalized.push((ipv4Value & IPV4_SEGMENT_MASK).toString(16));
    return normalized;
  }

  return segments;
}

function hasValidIPv6Structure(ip: string): boolean {
  if (MALFORMED_IPV6_TRIPLE_COLON.test(ip)) return false;
  if (ip.startsWith(":") && !ip.startsWith("::")) return false;
  if (ip.endsWith(":") && !ip.endsWith("::")) return false;
  return true;
}

export function ipv6ToBigInt(ip: string): bigint | null {
  if (!ip.includes(":")) return null;
  if (!hasValidIPv6Structure(ip)) return null;

  const compressedParts = ip.split("::");
  if (compressedParts.length > 2) return null;

  const [leftRaw = "", rightRaw = ""] = compressedParts;
  const leftSegments = normalizeIPv6Segments(
    leftRaw ? leftRaw.split(":").filter(Boolean) : [],
  );
  const rightSegments = normalizeIPv6Segments(
    rightRaw ? rightRaw.split(":").filter(Boolean) : [],
  );

  if (!leftSegments || !rightSegments) return null;

  const hasCompression = compressedParts.length === 2;
  const totalProvided = leftSegments.length + rightSegments.length;
  const missingSegments = IPV6_SEGMENT_COUNT - totalProvided;
  const validCount = hasCompression
    ? missingSegments > 0
    : missingSegments === 0;
  if (!validCount) return null;

  const segments = hasCompression
    ? [
        ...leftSegments,
        ...Array.from({ length: missingSegments }, () => "0"),
        ...rightSegments,
      ]
    : leftSegments;

  if (segments.length !== IPV6_SEGMENT_COUNT) return null;

  return segments.reduce<bigint | null>((accumulator, segment) => {
    if (accumulator === null) return null;
    const value = Number.parseInt(segment, 16);
    if (!Number.isFinite(value) || value < 0 || value > IPV4_SEGMENT_MASK) {
      return null;
    }
    return (accumulator << BigInt(IPV6_BITS_PER_SEGMENT)) + BigInt(value);
  }, BIGINT_ZERO);
}

function getIPVersion(ip: string): number {
  if (ipv4ToInteger(ip) !== null) return IPV4_VERSION;
  if (ipv6ToBigInt(ip) !== null) return 6;
  return INVALID_IP_VERSION;
}

export function ipToBigInt(ip: string): bigint | null {
  const version = getIPVersion(ip);
  if (version === IPV4_VERSION) return ipv4ToBigInt(ip);
  if (version === 6) return ipv6ToBigInt(ip);
  return null;
}

function isValidCIDRContext(
  ipVersion: number,
  networkVersion: number,
  prefixLength: number,
): boolean {
  if (
    ipVersion === INVALID_IP_VERSION ||
    networkVersion === INVALID_IP_VERSION ||
    ipVersion !== networkVersion ||
    !Number.isFinite(prefixLength)
  ) {
    return false;
  }

  const maxBits = ipVersion === IPV4_VERSION ? 32 : IPV6_MAX_BITS;
  return prefixLength >= 0 && prefixLength <= maxBits;
}

export function createIPv4Mask(prefixLength: number): bigint {
  const hostBits = 32 - prefixLength;
  if (hostBits === IPV4_OCTET_COUNT * IPV4_BITS_PER_OCTET) {
    return BIGINT_ZERO;
  }

  return BigInt((IPV4_FULL_MASK << hostBits) >>> 0);
}

export function createIPv6Mask(prefixLength: number): bigint | null {
  if (prefixLength === 0) {
    return null;
  }

  const fullMask = (BIGINT_ONE << BigInt(IPV6_MAX_BITS)) - BIGINT_ONE;
  return (fullMask << BigInt(IPV6_MAX_BITS - prefixLength)) & fullMask;
}

export function isIPInCIDRRange(ip: string, cidr: string): boolean {
  const [network, prefixLengthValue] = cidr.split("/");
  if (!network || !prefixLengthValue) return false;

  const ipVersion = getIPVersion(ip);
  const networkVersion = getIPVersion(network);
  const prefixLength = Number.parseInt(prefixLengthValue, 10);

  if (!isValidCIDRContext(ipVersion, networkVersion, prefixLength)) {
    return false;
  }

  const ipValue = ipToBigInt(ip);
  const networkValue = ipToBigInt(network);
  if (ipValue === null || networkValue === null) {
    return false;
  }

  if (ipVersion === IPV4_VERSION) {
    const mask = createIPv4Mask(prefixLength);
    return (ipValue & mask) === (networkValue & mask);
  }

  const mask = createIPv6Mask(prefixLength);
  if (mask === null) {
    return true;
  }

  return (ipValue & mask) === (networkValue & mask);
}

export function isTrustedCdnSource(
  sourceIP: string | null,
  cdnIpRanges?: string[],
): boolean {
  if (!cdnIpRanges || cdnIpRanges.length === 0) {
    return true;
  }

  if (!sourceIP) {
    return false;
  }

  return cdnIpRanges.some((cidr) => isIPInCIDRRange(sourceIP, cidr));
}
