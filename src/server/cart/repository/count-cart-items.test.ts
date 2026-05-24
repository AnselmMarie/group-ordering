import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/server/db";
import { MOCK_CART_ID } from "@/server/cart/mock-data/ids";
import { createChainStub } from "@/server/db/mock-db";

import { countCartItems } from "./count-cart-items";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

describe("countCartItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the summed quantity from the first row", async () => {
    mockedDb.select.mockReturnValue(createChainStub([{ total: 7 }]));

    const result = await countCartItems(MOCK_CART_ID);

    expect(result).toBe(7);
    expect(mockedDb.select).toHaveBeenCalledTimes(1);
  });

  it("returns 0 when no rows are returned", async () => {
    mockedDb.select.mockReturnValue(createChainStub([]));

    const result = await countCartItems(MOCK_CART_ID);

    expect(result).toBe(0);
  });

  it("returns 0 when total is null/undefined", async () => {
    mockedDb.select.mockReturnValue(createChainStub([{ total: null }]));

    const result = await countCartItems(MOCK_CART_ID);

    expect(result).toBe(0);
  });

  it("propagates database errors", async () => {
    const dbError = new Error("aggregation failed");
    mockedDb.select.mockReturnValue(createChainStub(null, dbError));

    await expect(countCartItems(MOCK_CART_ID)).rejects.toThrow(
      "aggregation failed",
    );
  });
});
