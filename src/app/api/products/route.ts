import { getAllProducts } from "@/server/product/repository/get-all-products";
import {
  productsIpKey,
  productsRateLimiter,
} from "@/server/product/products-rate-limit";
import { getClientIp } from "@/server/rate-limit/client-ip";

/**
 * GET /api/products
 *
 * Wraps the products repository with a per-client (IP) rate limiter that stops
 * single-client hammering. When the limit is exceeded the endpoint responds
 * with 403 as specified.
 *
 * Per-IP limiting is best-effort for an unauthenticated endpoint: it does not
 * stop VPN/proxy rotation. Production-grade abuse defense belongs at the
 * CDN/WAF edge backed by shared state; this in-memory limiter is a
 * single-process stand-in.
 */
export async function GET(request: Request): Promise<Response> {
  const rateLimited = Response.json(
    { success: false, error: "Rate limit exceeded" },
    { status: 403 },
  );

  const clientIp = getClientIp(request.headers);
  if (!productsRateLimiter.check(productsIpKey(clientIp)).allowed) {
    return rateLimited;
  }

  try {
    const products = await getAllProducts();
    return Response.json({ success: true, data: products });
  } catch (error) {
    console.error("GET /api/products failed", error);
    return Response.json(
      { success: false, error: "Failed to load products" },
      { status: 500 },
    );
  }
}
