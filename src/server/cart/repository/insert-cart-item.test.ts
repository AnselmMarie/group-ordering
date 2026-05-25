import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/server/db";
import {
  MOCK_CART_ID,
  MOCK_PRODUCT_ID,
  MOCK_USER_ID,
} from "@/server/cart/mock-data/ids";
import { createChainStub } from "@/server/db/mock-db";

import { insertCartItem } from "./insert-cart-item";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

const baseParams = {
  cartId: MOCK_CART_ID,
  productId: MOCK_PRODUCT_ID,
  userId: MOCK_USER_ID,
  price: 999,
};

describe("insertCartItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts with default quantity of 1", async () => {
    const chain = createChainStub([]);
    mockedDb.insert.mockReturnValue(chain as never);

    await insertCartItem(baseParams);

    expect(mockedDb.insert).toHaveBeenCalledTimes(1);
    expect(chain.values).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      productId: MOCK_PRODUCT_ID,
      userId: MOCK_USER_ID,
      price: 999,
      quantity: 1,
    });
  });

  it("respects an explicit quantity override", async () => {
    const chain = createChainStub([]);
    mockedDb.insert.mockReturnValue(chain as never);

    await insertCartItem({ ...baseParams, quantity: 3 });

    expect(chain.values).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 3 }),
    );
  });

  it("propagates database errors", async () => {
    const dbError = new Error("insert failed");
    mockedDb.insert.mockReturnValue(createChainStub(null, dbError) as never);

    await expect(insertCartItem(baseParams)).rejects.toThrow("insert failed");
  });
});
