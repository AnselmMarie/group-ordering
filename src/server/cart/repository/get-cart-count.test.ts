import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCountCartItems } from "@/server/cart/repository/get-count-cart-items";
import { getActiveCartRole } from "@/server/cart/repository/get-active-cart-role";
import { MOCK_CART_ID, MOCK_USER_ID } from "@/server/cart/mock-data/ids";

import { getCartCount } from "./get-cart-count";

vi.mock("@/server/cart/repository/get-active-cart-role", () => ({
  getActiveCartRole: vi.fn(),
}));
vi.mock("@/server/cart/repository/get-count-cart-items", () => ({
  getCountCartItems: vi.fn(),
}));

const mockedgetActiveCartRole = vi.mocked(getActiveCartRole);
const mockedgetCountCartItems = vi.mocked(getCountCartItems);

describe("getCartCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 0 when there is no active cart role", async () => {
    mockedgetActiveCartRole.mockResolvedValue(null);

    const result = await getCartCount();

    expect(result).toBe(0);
    expect(mockedgetCountCartItems).not.toHaveBeenCalled();
  });

  it("counts the whole cart when the user is the owner", async () => {
    mockedgetActiveCartRole.mockResolvedValue({
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "owner",
    });
    mockedgetCountCartItems.mockResolvedValue(8);

    const result = await getCartCount();

    expect(result).toBe(8);
    expect(mockedgetCountCartItems).toHaveBeenCalledWith(MOCK_CART_ID);
  });

  it("counts only the user's items when the user is an editor", async () => {
    mockedgetActiveCartRole.mockResolvedValue({
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "editor",
    });
    mockedgetCountCartItems.mockResolvedValue(2);

    const result = await getCartCount();

    expect(result).toBe(2);
    expect(mockedgetCountCartItems).toHaveBeenCalledWith(
      MOCK_CART_ID,
      MOCK_USER_ID,
    );
  });

  it("propagates repository errors", async () => {
    mockedgetActiveCartRole.mockResolvedValue({
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "owner",
    });
    mockedgetCountCartItems.mockRejectedValue(new Error("aggregation failed"));

    await expect(getCartCount()).rejects.toThrow("aggregation failed");
  });
});
