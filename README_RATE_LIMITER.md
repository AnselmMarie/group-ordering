# Group Ordering Rate Limiter

Based on the valid concerns about having a global rate limit, I decided to make some changes. Below are the solutions I considered:

1. Remove the global rate limit: for the simple reason that it can lock everyone out once the limit is hit. I originally thought of a global limit because one of my past jobs a while ago used it for cost reasons, but as you pointed out, once the limit is reached, everyone is locked out. This actually did happen at that job.

2. Limit by IPv4 address: keyed on the exact address, but it can be worked around with a VPN or by changing IPs.

3. Limit by IPv6 prefix: grouping IPv6 addresses by their /64 prefix helps, but can still be defeated by a VPN.

4. Cache the endpoint: this helps because the database is hit less often. The trade-off is that the rate limiter won't be triggered as often, but I do think this is a good alternative.

5. Using CAPTCHA: this creates an outside dependency on a third-party service.

## Solution added

I decided to remove the global limiter and focus on a per-IP rate limiter that buckets IPv4 by exact address and IPv6 by its /64 prefix. To help prevent spoofing, an "x-forwarded-for" header was added. A bad actor can still get around these checks with a VPN, or by using a lot of real IP addresses. I think that's where caching the endpoint could help a lot, but I didn't include it in this solution.

I also added an in-memory store that mirrors how Redis would be used. That said, I deployed the code through Vercel, and because it's serverless, the counter may not be exact. So the best way to test this is locally.

## Get the DATABASE_URL to connect locally

After logging in to the Neon app, go to the dashboard screen. Click the "Connect" button and copy the connection string, then paste it into the DATABASE_URL variable.

## Rate limit

The current rate limit for the product endpoint is 10 calls every 30 seconds, counted per IPv4 address or per IPv6 /64 prefix. Both values can be overridden with the `PRODUCTS_RATE_LIMIT` and `PRODUCTS_RATE_LIMIT_WINDOW_MS` environment variables.
