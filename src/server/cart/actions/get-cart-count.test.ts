import { beforeEach, describe, expect, it, vi } from "vitest";

import { countCartItems } from "@/server/cart/repository/count-cart-items";
import { findActiveCartRole } from "@/server/cart/repository/find-active-cart-role";
import { MOCK_CART_ID, MOCK_USER_ID } from "@/server/cart/mock-data/ids";

import { getCartCount } from "./get-cart-count";

vi.mock("@/server/cart/repository/find-active-cart-role", () => ({
  findActiveCartRole: vi.fn(),
}));
vi.mock("@/server/cart/repository/count-cart-items", () => ({
  countCartItems: vi.fn(),
}));

const mockedFindActiveCartRole = vi.mocked(findActiveCartRole);
const mockedCountCartItems = vi.mocked(countCartItems);

describe("getCartCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 0 when there is no active cart role", async () => {
    mockedFindActiveCartRole.mockResolvedValue(null);

    const result = await getCartCount();

    expect(result).toBe(0);
    expect(mockedCountCartItems).not.toHaveBeenCalled();
  });

  it("counts the whole cart when the user is the owner", async () => {
    mockedFindActiveCartRole.mockResolvedValue({
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "owner",
    });
    mockedCountCartItems.mockResolvedValue(8);

    const result = await getCartCount();

    expect(result).toBe(8);
    expect(mockedCountCartItems).toHaveBeenCalledWith(MOCK_CART_ID);
  });

  it("counts only the user's items when the user is an editor", async () => {
    mockedFindActiveCartRole.mockResolvedValue({
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "editor",
    });
    mockedCountCartItems.mockResolvedValue(2);

    const result = await getCartCount();

    expect(result).toBe(2);
    expect(mockedCountCartItems).toHaveBeenCalledWith(
      MOCK_CART_ID,
      MOCK_USER_ID,
    );
  });

  it("propagates repository errors", async () => {
    mockedFindActiveCartRole.mockResolvedValue({
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "owner",
    });
    mockedCountCartItems.mockRejectedValue(new Error("aggregation failed"));

    await expect(getCartCount()).rejects.toThrow("aggregation failed");
  });
});
