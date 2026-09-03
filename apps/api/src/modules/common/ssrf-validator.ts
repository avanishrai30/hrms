import dns from "node:dns/promises";
import net from "node:net";

export class SsrfValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SsrfValidationError";
  }
}

/**
 * Checks if an IPv4 address is in a private, loopback, link-local, or reserved range.
 */
export function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return true; // Invalid format treated as unsafe
  }

  const [a, b] = parts;
  if (a === undefined || b === undefined) return true;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (Private network RFC 1918)
  if (a === 10) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-local RFC 3927 & Cloud metadata e.g. 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (Private network RFC 1918: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private network RFC 1918)
  if (a === 192 && b === 168) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved / Future use)
  if (a >= 240) return true;

  // 255.255.255.255 (Broadcast)
  if (ip === "255.255.255.255") return true;

  return false;
}

/**
 * Checks if an IPv6 address is in a private, loopback, link-local, or IPv4-mapped range.
 */
export function isPrivateOrReservedIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();

  // Loopback ::1
  if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;

  // Unspecified ::
  if (lower === "::" || lower === "0:0:0:0:0:0:0:0") return true;

  // Unique local fc00::/7 (fc00:: to fdff::)
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;

  // Link-local fe80::/10
  if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) {
    return true;
  }

  // IPv4-mapped IPv6 ::ffff:x.x.x.x
  if (lower.startsWith("::ffff:")) {
    const ipv4Part = lower.slice(7);
    if (net.isIPv4(ipv4Part)) {
      return isPrivateOrReservedIpv4(ipv4Part);
    }
    return true;
  }

  return false;
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "instance-data",
  "postgres",
  "redis",
  "api",
  "web",
  "hrms-postgres",
  "hrms-redis",
  "hrms-api",
  "hrms-web"
]);

/**
 * Validates a destination URL against SSRF vulnerabilities:
 * - Protocol must be HTTPS (or HTTP if allowInsecureHttp is explicitly enabled for tests/dev)
 * - Prohibits localhost, cloud metadata, internal Docker service names
 * - Resolves DNS and checks all returned IPs against private/reserved CIDRs
 */
export async function validateSsrfUrl(
  urlString: string,
  options: { allowInsecureHttp?: boolean } = {}
): Promise<{ valid: boolean; resolvedIp: string; url: URL }> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlString);
  } catch {
    throw new SsrfValidationError("Invalid URL format.");
  }

  const protocol = parsedUrl.protocol.toLowerCase();
  const allowHttp = options.allowInsecureHttp ?? (process.env.ALLOW_INSECURE_WEBHOOK_HTTP === "true");

  if (protocol !== "https:" && (!allowHttp || protocol !== "http:")) {
    throw new SsrfValidationError("Only HTTPS webhook destination URLs are permitted.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".internal") || hostname.endsWith(".local")) {
    throw new SsrfValidationError(`Destination host '${hostname}' is not permitted.`);
  }

  // Check if hostname is directly an IP literal
  if (net.isIPv4(hostname)) {
    if (isPrivateOrReservedIpv4(hostname)) {
      throw new SsrfValidationError(`Destination IP '${hostname}' belongs to a private or reserved network.`);
    }
    return { valid: true, resolvedIp: hostname, url: parsedUrl };
  }

  if (net.isIPv6(hostname)) {
    if (isPrivateOrReservedIpv6(hostname)) {
      throw new SsrfValidationError(`Destination IPv6 '${hostname}' belongs to a private or reserved network.`);
    }
    return { valid: true, resolvedIp: hostname, url: parsedUrl };
  }

  // Check for decimal / octal / hex IP obfuscation
  if (/^0x[0-9a-f]+$/i.test(hostname) || /^\d+$/.test(hostname)) {
    throw new SsrfValidationError("Alternate numeric IP representations are prohibited.");
  }

  // Resolve DNS to verify the resolved address
  let lookupResults: Array<{ address: string; family: number }>;
  try {
    lookupResults = await dns.lookup(hostname, { all: true });
  } catch (err: unknown) {
    throw new SsrfValidationError(`Could not resolve hostname '${hostname}': ${(err as Error).message}`);
  }

  if (!lookupResults || lookupResults.length === 0) {
    throw new SsrfValidationError(`No DNS records found for '${hostname}'.`);
  }

  for (const { address, family } of lookupResults) {
    if (family === 4 && isPrivateOrReservedIpv4(address)) {
      throw new SsrfValidationError(
        `Destination hostname '${hostname}' resolves to private/reserved IPv4 address '${address}'.`
      );
    }
    if (family === 6 && isPrivateOrReservedIpv6(address)) {
      throw new SsrfValidationError(
        `Destination hostname '${hostname}' resolves to private/reserved IPv6 address '${address}'.`
      );
    }
  }

  const firstIp = lookupResults[0]?.address ?? "";
  return { valid: true, resolvedIp: firstIp, url: parsedUrl };
}
