/**
 * In-memory counter store that mirrors Redis `INCR` + `EXPIRE` semantics.
 *
 * Each key maps to a count and an expiry timestamp. Once the window passes the
 * counter is lazily reset on the next access, exactly as an expired Redis key
 * would behave. This is a single-process stand-in for Redis: state is NOT
 * shared across serverless instances.
 */
export interface CounterSnapshot {
  /** Current count within the active window. */
  count: number;
  /** Epoch ms at which the active window expires. */
  expiresAt: number;
}

export interface RateLimitStore {
  increment(key: string, windowMs: number): CounterSnapshot;
  reset(key: string): void;
  clear(): void;
}

interface CounterEntry {
  count: number;
  expiresAt: number;
}

export const createInMemoryStore = (): RateLimitStore => {
  const counters = new Map<string, CounterEntry>();

  const increment = (key: string, windowMs: number): CounterSnapshot => {
    const now = Date.now();
    const existing = counters.get(key);

    // Start a fresh window when there is no entry or the previous one expired.
    if (!existing || existing.expiresAt <= now) {
      const entry: CounterEntry = { count: 1, expiresAt: now + windowMs };
      counters.set(key, entry);
      return { ...entry };
    }

    // Increment within the active window without mutating the stored object.
    const entry: CounterEntry = {
      count: existing.count + 1,
      expiresAt: existing.expiresAt,
    };
    counters.set(key, entry);
    return { ...entry };
  };

  const reset = (key: string): void => {
    counters.delete(key);
  };

  const clear = (): void => {
    counters.clear();
  };

  return { increment, reset, clear };
};
