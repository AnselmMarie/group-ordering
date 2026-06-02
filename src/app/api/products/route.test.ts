import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAllProducts } from "@/server/product/repository/get-all-products";
import { productsRateLimiter } from "@/server/product/products-rate-limit";
import { createMockProduct } from "@/server/product/mock-data/mock-product";

import { GET } from "./route";

vi.mock("@/server/product/repository/get-all-products", () => ({
  getAllProducts: vi.fn(),
}));
vi.mock("@/server/product/products-rate-limit", () => ({
  productsRateLimiter: { check: vi.fn() },
  productsIpKey: (ip: string) => `products:ip:${ip}`,
}));

const mockedGetAllProducts = vi.mocked(getAllProducts);
const mockedIpCheck = vi.mocked(productsRateLimiter.check);

const allowed = { allowed: true, remaining: 1, resetAt: 1000 };
const blocked = { allowed: false, remaining: 0, resetAt: 1000 };

const buildRequest = (headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/products", { headers });

describe("GET /api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedIpCheck.mockReturnValue(allowed);
  });

  it("returns products in a success envelope when within limits", async () => {
    const products = [createMockProduct({ id: "p-1", title: "Latte" })];
    mockedGetAllProducts.mockResolvedValueOnce(products);

    const response = await GET(buildRequest({ "x-forwarded-for": "203.0.113.7" }));

    expect(response.status).toBe(200);
    // Response.json serializes Dates to strings over the wire.
    await expect(response.json()).resolves.toEqual(
      JSON.parse(JSON.stringify({ success: true, data: products })),
    );
  });

  it("keys the per-IP limiter off the trusted client IP", async () => {
    mockedGetAllProducts.mockResolvedValueOnce([]);

    await GET(buildRequest({ "x-forwarded-for": "1.1.1.1, 203.0.113.7" }));

    expect(mockedIpCheck).toHaveBeenCalledWith("products:ip:203.0.113.7");
  });

  it("returns 403 when the per-IP limit is exceeded", async () => {
    mockedIpCheck.mockReturnValue(blocked);

    const response = await GET(buildRequest({ "x-forwarded-for": "203.0.113.7" }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Rate limit exceeded",
    });
    expect(mockedGetAllProducts).not.toHaveBeenCalled();
  });

  it("returns 500 when the repository throws", async () => {
    mockedGetAllProducts.mockRejectedValueOnce(new Error("db down"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await GET(buildRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Failed to load products",
    });

    errorSpy.mockRestore();
  });
});
