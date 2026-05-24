import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/server/db";
import { MOCK_CART_ID, MOCK_USER_ID } from "@/server/cart/mock-data/ids";
import { createChainStub } from "@/server/db/mock-db";

import { createCart } from "./create-cart";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

describe("createCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the inserted cart id", async () => {
    mockedDb.insert.mockReturnValue(createChainStub([{ id: MOCK_CART_ID }]));

    const result = await createCart(MOCK_USER_ID);

    expect(result).toBe(MOCK_CART_ID);
    expect(mockedDb.insert).toHaveBeenCalledTimes(1);
  });

  it("returns undefined when nothing is inserted", async () => {
    mockedDb.insert.mockReturnValue(createChainStub([]));

    const result = await createCart(MOCK_USER_ID);

    expect(result).toBeUndefined();
  });

  it("propagates database errors", async () => {
    const dbError = new Error("unique constraint violation");
    mockedDb.insert.mockReturnValue(createChainStub(null, dbError));

    await expect(createCart(MOCK_USER_ID)).rejects.toThrow(
      "unique constraint violation",
    );
  });
});
