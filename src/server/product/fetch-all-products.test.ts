import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAppUrl } from "@/lib/env";
import { UserFacingError } from "@/lib/server/action-result";
import { createMockProduct } from "@/server/product/mock-data/mock-product";

import { fetchAllProducts } from "./fetch-all-products";

const headersMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: () => headersMock(),
}));
vi.mock("@/lib/env", () => ({
  getAppUrl: vi.fn(),
}));

const mockedGetAppUrl = vi.mocked(getAppUrl);

const jsonResponse = (
  body: unknown,
  init: { status?: number } = {},
): Response =>
  ({
    ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300,
    status: init.status ?? 200,
    json: async () => body,
  }) as Response;

describe("fetchAllProducts", () => {
  beforeEach(() => {
    headersMock.mockResolvedValue(new Headers());
    mockedGetAppUrl.mockReturnValue("https://app.example.com");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("returns products from a success envelope", async () => {
    const product = createMockProduct({ id: "p-1", title: "Latte" });
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: [product] }),
    );

    const result = await fetchAllProducts();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "p-1", title: "Latte" });
  });

  it("revives date fields into Date instances", async () => {
    const product = createMockProduct({ id: "p-1" });
    const serialized = JSON.parse(JSON.stringify(product));
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: [serialized] }),
    );

    const [result] = await fetchAllProducts();

    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("calls the endpoint using the configured app url", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: [] }),
    );

    await fetchAllProducts();

    expect(fetch).toHaveBeenCalledWith(
      "https://app.example.com/api/products",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("forwards the client ip headers to the endpoint", async () => {
    headersMock.mockResolvedValue(
      new Headers({ "x-forwarded-for": "203.0.113.7", cookie: "sid=abc" }),
    );
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: [] }),
    );

    await fetchAllProducts();

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect((options?.headers as Record<string, string>)["x-forwarded-for"]).toBe(
      "203.0.113.7",
    );
    expect((options?.headers as Record<string, string>).cookie).toBe("sid=abc");
  });

  it("falls back to the request host when app url is unset", async () => {
    mockedGetAppUrl.mockReturnValue(undefined);
    headersMock.mockResolvedValue(new Headers({ host: "localhost:3000" }));
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: [] }),
    );

    await fetchAllProducts();

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/products",
      expect.anything(),
    );
  });

  it("uses https for non-local hosts in the fallback", async () => {
    mockedGetAppUrl.mockReturnValue(undefined);
    headersMock.mockResolvedValue(new Headers({ host: "app.example.com" }));
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: [] }),
    );

    await fetchAllProducts();

    expect(fetch).toHaveBeenCalledWith(
      "https://app.example.com/api/products",
      expect.anything(),
    );
  });

  it("throws a user-facing error when no base url can be resolved", async () => {
    mockedGetAppUrl.mockReturnValue(undefined);
    headersMock.mockResolvedValue(new Headers());

    await expect(fetchAllProducts()).rejects.toBeInstanceOf(UserFacingError);
    await expect(fetchAllProducts()).rejects.toThrow(
      "We couldn't load the menu right now",
    );
  });

  it("throws a user-facing rate-limit error on a 403 response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ success: false, error: "Rate limit exceeded" }, {
        status: 403,
      }),
    );

    await expect(fetchAllProducts()).rejects.toBeInstanceOf(UserFacingError);
    await expect(fetchAllProducts()).rejects.toThrow("going a little fast");
  });

  it("throws a user-facing error on a non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ success: false }, { status: 500 }),
    );

    await expect(fetchAllProducts()).rejects.toBeInstanceOf(UserFacingError);
    await expect(fetchAllProducts()).rejects.toThrow(
      "We couldn't load the menu right now",
    );
  });

  it("surfaces the envelope error message as a user-facing error", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ success: false, error: "Out of stock" }),
    );

    await expect(fetchAllProducts()).rejects.toBeInstanceOf(UserFacingError);
    await expect(fetchAllProducts()).rejects.toThrow("Out of stock");
  });
});
