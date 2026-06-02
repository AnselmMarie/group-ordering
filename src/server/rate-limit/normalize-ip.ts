import ipaddr from "ipaddr.js";

/** Bits to keep for IPv6 — the subscriber-allocation prefix. */
const IPV6_PREFIX_BITS = 64;

/**
 * Normalizes a client IP into a stable rate-limit bucket key.
 *
 * - IPv4 (and IPv4-mapped IPv6) are returned as the plain IPv4 string.
 * - IPv6 is collapsed to its /64 network prefix, so a single subscriber
 *   allocation shares one bucket instead of getting a fresh bucket per host
 *   address.
 * - Anything unparseable (including the non-IP fallback key) is returned
 *   unchanged, so the caller still rate-limits — it just cannot normalize.
 */
export const normalizeIpForBucket = (ip: string): string => {
  let addr: ReturnType<typeof ipaddr.parse>;
  try {
    addr = ipaddr.parse(ip);
  } catch {
    return ip; // not an IP (e.g. fallback key) — fail safe, do not normalize
  }

  if (addr.kind() === "ipv4") {
    return addr.toString();
  }

  // IPv4 tunneled inside IPv6 — treat as the underlying IPv4 address.
  if ("isIPv4MappedAddress" in addr && addr.isIPv4MappedAddress()) {
    return addr.toIPv4Address().toString();
  }

  // Zero the host bits (last 128 - 64 = 64 bits) to get the /64 prefix.
  const bytes = addr.toByteArray(); // 16 bytes
  for (let i = IPV6_PREFIX_BITS / 8; i < bytes.length; i += 1) {
    bytes[i] = 0;
  }
  return `${ipaddr.fromByteArray(bytes).toString()}/64`;
};
