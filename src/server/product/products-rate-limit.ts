import { createRateLimiter } from "@/server/rate-limit/rate-limiter";
import { normalizeIpForBucket } from "@/server/rate-limit/normalize-ip";

/** Default per-IP allowance: 10 calls per window. */
const DEFAULT_LIMIT = 10;
/** Default window before a counter resets: 30 seconds. */
const DEFAULT_WINDOW_MS = 30_000;

const parsePositiveInt = (
  value: string | undefined,
  fallback: number,
): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const windowMs = parsePositiveInt(
  process.env.PRODUCTS_RATE_LIMIT_WINDOW_MS,
  DEFAULT_WINDOW_MS,
);

/** Per-client (IP) limiter. */
export const productsRateLimiter = createRateLimiter({
  limit: parsePositiveInt(process.env.PRODUCTS_RATE_LIMIT, DEFAULT_LIMIT),
  windowMs,
});

/** Builds the per-IP bucket key for a given client IP. */
export const productsIpKey = (clientIp: string): string =>
  `products:ip:${normalizeIpForBucket(clientIp)}`;
