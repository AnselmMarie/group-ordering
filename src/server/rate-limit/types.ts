export interface RateLimitConfig {
  /** Maximum number of calls allowed within a single window. */
  limit: number;
  /** How long (in ms) a counter lives before it resets. */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether the current call is within the configured limit. */
  allowed: boolean;
  /** Calls still available in the current window (never negative). */
  remaining: number;
  /** Epoch ms at which the current window resets. */
  resetAt: number;
}
