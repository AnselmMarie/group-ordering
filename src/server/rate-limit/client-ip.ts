const FORWARDED_FOR_HEADER = "x-forwarded-for";
const REAL_IP_HEADER = "x-real-ip";

/** Bucket used when no client IP can be determined from the request. */
export const FALLBACK_CLIENT_KEY = "unknown";

export interface ClientIpOptions {
  /**
   * Number of trusted proxies in front of the app. The client IP is read this
   * many hops from the RIGHT of `x-forwarded-for`, because trusted
   * infrastructure appends the real connection IP on the right. Entries to the
   * left are caller-supplied and therefore spoofable, so they are ignored.
   * Defaults to 1.
   */
  trustedProxyCount?: number;
}

/**
 * Resolves the client IP from request headers in a spoofing-resistant way.
 *
 * Note: this only defends against forged `x-forwarded-for` values. An attacker
 * rotating across many *real* IPs cannot be stopped here — per-IP limiting is
 * best-effort, and stopping rotation ultimately belongs at a CDN/WAF edge
 * backed by shared state (see docs/rate-limit-enhancements.md, "Out of scope").
 */
export const getClientIp = (
  headers: Headers,
  options: ClientIpOptions = {},
): string => {
  const trustedProxyCount = Math.max(1, options.trustedProxyCount ?? 1);

  const forwardedFor = headers.get(FORWARDED_FOR_HEADER);
  if (forwardedFor) {
    const ips = forwardedFor
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (ips.length > 0) {
      // Count from the right so caller-prepended (spoofed) entries are ignored.
      const index = Math.max(0, ips.length - trustedProxyCount);
      return ips[index];
    }
  }

  const realIp = headers.get(REAL_IP_HEADER)?.trim();
  if (realIp) {
    return realIp;
  }

  return FALLBACK_CLIENT_KEY;
};
