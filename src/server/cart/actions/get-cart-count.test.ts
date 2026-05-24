import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/server/auth";
import { countCartItems } from "@/server/cart/repository/count-cart-items";
import { findCartIdByUserId } from "@/server/cart/repository/find-cart-id-by-user";
import { MOCK_CART_ID } from "@/server/cart/mock-data/ids";
import { createMockSession } from "@/server/cart/mock-data/session";

import { getCartCount } from "./get-cart-count";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));
vi.mock("@/server/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));
vi.mock("@/server/cart/repository/find-cart-id-by-user", () => ({
  findCartIdByUserId: vi.fn(),
}));
vi.mock("@/server/cart/repository/count-cart-items", () => ({
  countCartItems: vi.fn(),
}));

const mockedGetSession = vi.mocked(auth.api.getSession);
const mockedFindCartIdByUserId = vi.mocked(findCartIdByUserId);
const mockedCountCartItems = vi.mocked(countCartItems);

describe("getCartCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 0 when there is no session", async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await getCartCount();

    expect(result).toBe(0);
    expect(mockedFindCartIdByUserId).not.toHaveBeenCalled();
    expect(mockedCountCartItems).not.toHaveBeenCalled();
  });

  it("returns 0 when the user has no cart", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedFindCartIdByUserId.mockResolvedValue(null);

    const result = await getCartCount();

    expect(result).toBe(0);
    expect(mockedCountCartItems).not.toHaveBeenCalled();
  });

  it("returns the count from the repository when a cart exists", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedFindCartIdByUserId.mockResolvedValue(MOCK_CART_ID);
    mockedCountCartItems.mockResolvedValue(5);

    const result = await getCartCount();

    expect(result).toBe(5);
    expect(mockedCountCartItems).toHaveBeenCalledWith(MOCK_CART_ID);
  });

  it("propagates repository errors", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedFindCartIdByUserId.mockResolvedValue(MOCK_CART_ID);
    mockedCountCartItems.mockRejectedValue(new Error("aggregation failed"));

    await expect(getCartCount()).rejects.toThrow("aggregation failed");
  });
});
