import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/server/db";
import {
  MOCK_CART_ID,
  MOCK_CART_ITEM_ID,
  MOCK_PRODUCT_ID,
  MOCK_USER_ID,
} from "@/server/cart/mock-data/ids";
import { createChainStub } from "@/server/cart/mock-data/mock-db";

import { findCartItem } from "./find-cart-item";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

const params = {
  cartId: MOCK_CART_ID,
  productId: MOCK_PRODUCT_ID,
  userId: MOCK_USER_ID,
};

describe("findCartItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the matching cart item when present", async () => {
    mockedDb.select.mockReturnValue(
      createChainStub([{ id: MOCK_CART_ITEM_ID }]),
    );

    const result = await findCartItem(params);

    expect(result).toEqual({ id: MOCK_CART_ITEM_ID });
    expect(mockedDb.select).toHaveBeenCalledTimes(1);
  });

  it("returns null when no row is found", async () => {
    mockedDb.select.mockReturnValue(createChainStub([]));

    const result = await findCartItem(params);

    expect(result).toBeNull();
  });

  it("propagates database errors", async () => {
    const dbError = new Error("query failed");
    mockedDb.select.mockReturnValue(createChainStub(null, dbError));

    await expect(findCartItem(params)).rejects.toThrow("query failed");
  });
});
