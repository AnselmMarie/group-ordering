# Rate Limit Enhancements

Plan for two changes to the products rate limiter:

1. **Remove the global limiter** — it is a self-DoS amplifier and adds a security
   weakness without delivering meaningful protection.
2. **Harden the per-IP limiter with IPv6 `/64` normalization** (via `ipaddr.js`)
   — closes the "infinite free buckets" hole that full-IPv6 keying leaves open.

> **Scope note:** The assignment deliverable is the rate limiter. These changes
> improve the limiter itself; they do **not** introduce caching or move logic to
> the edge. Caching and edge/WAF rate limiting are noted under
> [Out of scope](#out-of-scope) as the production follow-ups.

---

## Current state

| File | Relevant code |
| --- | --- |
| [`src/server/product/products-rate-limit.ts`](../src/server/product/products-rate-limit.ts) | `DEFAULT_GLOBAL_LIMIT`, `productsGlobalRateLimiter`, `PRODUCTS_GLOBAL_KEY`, `productsIpKey` |
| [`src/app/api/products/route.ts`](../src/app/api/products/route.ts) | global-ceiling check, then per-IP check |
| [`src/server/rate-limit/client-ip.ts`](../src/server/rate-limit/client-ip.ts) | `getClientIp` (resolves the trusted client IP) |
| [`src/server/rate-limit/rate-limiter.ts`](../src/server/rate-limit/rate-limiter.ts) | `createRateLimiter` (generic limiter, in-memory store) |

The endpoint currently applies two limiters in sequence: a single global counter
shared across **all** callers, then a per-IP counter.

---

## Change 1 — Remove the global limiter

### Why

A single global counter keyed on one shared bucket (`products:global`) means
**every caller draws from the same quota**. That converts a distributed problem
into a trivial, centralized one:

- **DoS amplification / shared fate.** An attacker who can spend the global
  budget in a window (cheap, and trivial with IP rotation) locks out **100% of
  legitimate users**. The control fails closed for *everyone*, not just the
  abuser — it manufactures the exact outage it was meant to prevent.
- **No attribution.** Once the global counter trips, abusive and legitimate
  traffic are indistinguishable — they share one bucket, so there is no graceful
  shedding.
- **In-memory makes the number meaningless.** `createRateLimiter` defaults to an
  in-memory store, so each instance/lambda has its own "global" counter. With N
  instances the real ceiling is `N × limit`, non-deterministically. A *global*
  limit is precisely the kind that breaks under per-instance memory (a per-IP
  limit degrades gracefully; a global ceiling does not).
- **Arbitrary value.** `600` is not derived from measured downstream capacity, so
  tripping it does not correspond to any real "system is at risk" condition.

A global ceiling is a legitimate tool **only** when the resource being protected
is itself global and overrun is worse than shedding load (e.g. a paid third-party
API or a cost/budget cap, typically over a long window). The products/menu
endpoint has no such resource, so the global limiter is pure downside here.

### What to change

- **`src/server/product/products-rate-limit.ts`**
  - Remove `DEFAULT_GLOBAL_LIMIT`, `PRODUCTS_GLOBAL_KEY`, and
    `productsGlobalRateLimiter`.
  - Remove the `PRODUCTS_RATE_LIMIT_GLOBAL` env parsing.
  - Keep `productsRateLimiter`, `productsIpKey`, `windowMs`, and
    `parsePositiveInt`.
- **`src/app/api/products/route.ts`**
  - Remove the global-ceiling check block and its imports
    (`PRODUCTS_GLOBAL_KEY`, `productsGlobalRateLimiter`).
  - Keep the per-IP check as the single gate.
- **`src/server/rate-limit/client-ip.ts`**
  - Update the doc comment that currently points to "a global ceiling limiter"
    as the IP-rotation defense — that is no longer accurate (and was never a good
    defense). Point instead to per-IP limiting + the production follow-ups.

### Tests to update

- **`src/server/product/products-rate-limit.test.ts`**
  - Remove the `PRODUCTS_GLOBAL_KEY` assertion and the
    `PRODUCTS_RATE_LIMIT_GLOBAL` env-override test.
- **`src/app/api/products/route.test.ts`**
  - Remove the global mock (`productsGlobalRateLimiter`, `mockedGlobalCheck`) and
    the "returns 403 when the global ceiling is exceeded" case.
  - Confirm the per-IP block path still returns 403.

---

## Change 2 — IPv6 `/64` normalization for the per-IP limiter

### Why

ISPs assign each subscriber an entire IPv6 block (commonly a `/64` =
2^64 ≈ 18 quintillion addresses). If we key the limiter on the **full** IPv6
address, a single subscriber gets a fresh bucket per host address for free:

```
2001:db8:1234:5678::1  → fresh bucket
2001:db8:1234:5678::2  → fresh bucket   ← same subscriber, increments for free
2001:db8:1234:5678::3  → fresh bucket
```

Collapsing every IPv6 address to its `/64` network prefix puts the whole
allocation in **one** bucket, so evading the limit requires a genuinely
different allocation rather than incrementing host bits:

```
2001:db8:1234:5678::1  ┐
2001:db8:1234:5678::2  ├─→ 2001:db8:1234:5678::/64   (one bucket)
2001:db8:1234:5678::3  ┘
```

IPv4 is left unchanged (one IPv4 address is already a meaningful unit).

> **Honesty / framing:** This is **hygiene, not security.** It closes the free,
> single-allocation IPv6 bypass. It does **not** stop a determined attacker —
> VPNs, proxy pools, and multiple allocations still defeat per-IP limiting. Those
> require edge/WAF controls and caching (see [Out of scope](#out-of-scope)).

### Why `ipaddr.js` (not hand-rolled)

IPv6 parsing has enough edge cases that a buggy normalizer silently mis-buckets
traffic (worse than no normalization). `ipaddr.js` handles them correctly:

- Compressed addresses (`::`)
- IPv4-mapped IPv6 (`::ffff:1.2.3.4`)
- Validation of malformed input

```bash
npm install ipaddr.js
```

### New module: `src/server/rate-limit/normalize-ip.ts`

Pure function, no I/O — keeps it small and unit-testable (one job per file).

```ts
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
```

### Wire into the bucket key

`src/server/product/products-rate-limit.ts`:

```ts
import { normalizeIpForBucket } from "@/server/rate-limit/normalize-ip";

export const productsIpKey = (clientIp: string): string =>
  `products:ip:${normalizeIpForBucket(clientIp)}`;
```

`getClientIp` is unchanged — it resolves *which* IP to trust; normalization is a
separate concern applied to the resolved value before it becomes a key.

### Tests: `src/server/rate-limit/normalize-ip.test.ts`

| Input | Expected output | Reason |
| --- | --- | --- |
| `203.0.113.5` | `203.0.113.5` | IPv4 unchanged |
| `2001:db8:1234:5678::1` | `2001:db8:1234:5678::/64` | full IPv6 → /64 |
| `2001:db8:1234:5678:abcd:ef01:2345:6789` | `2001:db8:1234:5678::/64` | host bits dropped |
| `2001:db8:1234:5678::2` and `...::3` | identical key | same allocation collapses |
| `2001:db8:1111:2222::1` vs `2001:db8:3333:4444::1` | different keys | different /64s stay distinct |
| `::ffff:203.0.113.5` | `203.0.113.5` | IPv4-mapped → IPv4 |
| `not-an-ip` / `"global"` | returned unchanged | fail safe, still usable as a key |

Also add an integration assertion in `products-rate-limit.test.ts`: two different
hosts in the same `/64` produce the same `productsIpKey`.

---

## Implementation order (TDD)

1. **Global limiter removal**
   1. Update/remove the global tests (RED — references now missing).
   2. Remove the global code from `products-rate-limit.ts` and `route.ts`.
   3. Fix the `client-ip.ts` comment.
   4. Run tests (GREEN).
2. **`/64` normalization**
   1. `npm install ipaddr.js`.
   2. Write `normalize-ip.test.ts` from the table above (RED).
   3. Add `normalize-ip.ts` (GREEN).
   4. Wire `normalizeIpForBucket` into `productsIpKey`; add the same-`/64`
      integration test.
   5. Run tests (GREEN), verify coverage.

---

## Out of scope (production follow-ups)

Per-IP limiting — even with `/64` normalization — is best-effort for an
**unauthenticated** endpoint. It does not stop VPN/proxy rotation and can
false-positive on CGNAT (many real users behind one IP). In production this
limiter should be paired with:

- **Response caching** of the global menu (cache the data layer, e.g.
  `getAllProducts`) so abusive traffic is cheap to absorb and the DB is hit at
  most once per revalidate window.
- **Edge / WAF rate limiting** backed by shared state (e.g. Redis/Upstash) so the
  limit is consistent across instances and abuse is shed before it reaches the
  origin.
- **Authentication** where feasible — rate-limiting per user/API key is far
  harder to evade than per IP, because identity is expensive to rotate.

These are deliberately excluded from this change to keep the scope on the
assignment deliverable (the rate limiter itself).
