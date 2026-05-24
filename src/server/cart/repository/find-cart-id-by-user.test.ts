import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/server/db";
import { MOCK_CART_ID, MOCK_USER_ID } from "@/server/cart/mock-data/ids";
import { createChainStub } from "@/server/cart/mock-data/mock-db";

import { findCartIdByUserId } from "./find-cart-id-by-user";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

describe("findCartIdByUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the cart id when a row exists", async () => {
    mockedDb.select.mockReturnValue(createChainStub([{ id: MOCK_CART_ID }]));

    const result = await findCartIdByUserId(MOCK_USER_ID);

    expect(result).toBe(MOCK_CART_ID);
    expect(mockedDb.select).toHaveBeenCalledTimes(1);
  });

  it("returns null when no rows are returned", async () => {
    mockedDb.select.mockReturnValue(createChainStub([]));

    const result = await findCartIdByUserId(MOCK_USER_ID);

    expect(result).toBeNull();
  });

  it("propagates database errors", async () => {
    const dbError = new Error("connection refused");
    mockedDb.select.mockReturnValue(createChainStub(null, dbError));

    await expect(findCartIdByUserId(MOCK_USER_ID)).rejects.toThrow(
      "connection refused",
    );
  });
});
