import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/server/db";
import {
  MOCK_CART_ID,
  MOCK_PRODUCT_ID,
  MOCK_USER_ID,
} from "@/server/cart/mock-data/ids";
import { createChainStub } from "@/server/db/mock-db";

import { updateCartItem } from "./update-cart-item";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

const params = {
  cartId: MOCK_CART_ID,
  productId: MOCK_PRODUCT_ID,
  userId: MOCK_USER_ID,
};

describe("updateCartItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("issues an update on cart_item", async () => {
    const chain = createChainStub([]);
    mockedDb.update.mockReturnValue(chain as never);

    await updateCartItem(params);

    expect(mockedDb.update).toHaveBeenCalledTimes(1);
    expect(chain.set).toHaveBeenCalledTimes(1);
    expect(chain.where).toHaveBeenCalledTimes(1);
  });

  it("resolves to undefined on success", async () => {
    mockedDb.update.mockReturnValue(createChainStub([]) as never);

    await expect(updateCartItem(params)).resolves.toBeUndefined();
  });

  it("propagates database errors", async () => {
    const dbError = new Error("update failed");
    mockedDb.update.mockReturnValue(createChainStub(null, dbError) as never);

    await expect(updateCartItem(params)).rejects.toThrow("update failed");
  });
});
