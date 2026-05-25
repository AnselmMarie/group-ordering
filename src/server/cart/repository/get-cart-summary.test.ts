import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { getActiveCartIdByUser } from "@/server/cart/repository/get-active-cart-id-by-user";
import {
  MOCK_CART_ID,
  MOCK_CART_ITEM_ID,
  MOCK_PRODUCT_ID,
  MOCK_USER_ID,
} from "@/server/cart/mock-data/ids";
import { createChainStub } from "@/server/db/mock-db";
import { db } from "@/server/db";

import { type CartSummaryItem, getCartSummary } from "./get-cart-summary";

vi.mock("@/server/auth/get-current-user-id", () => ({
  getCurrentUserId: vi.fn(),
}));
vi.mock("@/server/cart/repository/find-active-cart-id-by-user", () => ({
  getActiveCartIdByUser: vi.fn(),
}));
vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockedgetActiveCartIdByUser = vi.mocked(getActiveCartIdByUser);
const mockedDb = vi.mocked(db);

const buildRow = (
  overrides: Partial<CartSummaryItem> = {},
): CartSummaryItem => ({
  id: MOCK_CART_ITEM_ID,
  productId: MOCK_PRODUCT_ID,
  userId: MOCK_USER_ID,
  quantity: 2,
  price: 1022,
  product: {
    id: MOCK_PRODUCT_ID,
    title: "Espresso",
    price: 1022,
    image: null,
  },
  ...overrides,
});

describe("getCartSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no current user", async () => {
    mockedGetCurrentUserId.mockResolvedValue(undefined);

    const result = await getCartSummary();

    expect(result).toBeNull();
    expect(mockedgetActiveCartIdByUser).not.toHaveBeenCalled();
    expect(mockedDb.select).not.toHaveBeenCalled();
  });

  it("returns null when the user has no cart", async () => {
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(null);

    const result = await getCartSummary();

    expect(result).toBeNull();
    expect(mockedgetActiveCartIdByUser).toHaveBeenCalledWith(MOCK_USER_ID);
    expect(mockedDb.select).not.toHaveBeenCalled();
  });

  it("returns joined cart items when a cart exists", async () => {
    const rows = [
      buildRow(),
      buildRow({
        id: "00000000-0000-0000-0000-000000000031",
        quantity: 1,
        price: 550,
        product: {
          id: "00000000-0000-0000-0000-000000000021",
          title: "Latte",
          price: 550,
          image: "https://example.com/latte.jpg",
        },
      }),
    ];

    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedDb.select.mockReturnValue(createChainStub(rows));

    const result = await getCartSummary();

    expect(result).toEqual(rows);
    expect(mockedDb.select).toHaveBeenCalledTimes(1);
  });

  it("returns an empty array when the cart has no items", async () => {
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedDb.select.mockReturnValue(createChainStub([]));

    const result = await getCartSummary();

    expect(result).toEqual([]);
  });

  it("propagates database errors", async () => {
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedDb.select.mockReturnValue(
      createChainStub(null, new Error("join failed")),
    );

    await expect(getCartSummary()).rejects.toThrow("join failed");
  });
});
