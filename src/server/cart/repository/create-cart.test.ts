import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/server/db";
import { MOCK_CART_ID, MOCK_USER_ID } from "@/server/cart/mock-data/ids";
import {
  createChainStub,
  createMockDb,
  type MockDb,
} from "@/server/db/mock-db";

import { createCart } from "./create-cart";
import { createActiveParticipant } from "./create-active-participant";

vi.mock("@/server/db", () => ({
  db: { transaction: vi.fn() },
}));

vi.mock("./upsert-active-participant", () => ({
  createActiveParticipant: vi.fn(),
}));

const mockedDb = vi.mocked(db) as unknown as {
  transaction: ReturnType<typeof vi.fn>;
};
const mockedUpsert = vi.mocked(createActiveParticipant);

interface TxRun {
  tx: MockDb;
  insertChain: ReturnType<typeof createChainStub>;
}

const setupTransaction = (
  insertResult: unknown,
  insertError?: Error,
): TxRun => {
  const tx = createMockDb();
  const insertChain = createChainStub(insertResult, insertError);
  tx.insert.mockReturnValue(insertChain);

  mockedDb.transaction.mockImplementation(
    async (cb: (tx: MockDb) => Promise<unknown>) => cb(tx),
  );

  return { tx, insertChain };
};

describe("createCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts cart, registers host as active owner participant, and returns the cart id", async () => {
    const { tx } = setupTransaction([{ id: MOCK_CART_ID }]);

    const result = await createCart(MOCK_USER_ID);

    expect(result).toBe(MOCK_CART_ID);
    expect(tx.insert).toHaveBeenCalledTimes(1);
    expect(mockedUpsert).toHaveBeenCalledTimes(1);
    expect(mockedUpsert).toHaveBeenCalledWith(tx, {
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "owner",
    });
  });

  it("returns undefined and skips participant insert when cart insert returns nothing", async () => {
    setupTransaction([]);

    const result = await createCart(MOCK_USER_ID);

    expect(result).toBeUndefined();
    expect(mockedUpsert).not.toHaveBeenCalled();
  });

  it("propagates database errors from the cart insert", async () => {
    const dbError = new Error("unique constraint violation");
    setupTransaction(null, dbError);

    await expect(createCart(MOCK_USER_ID)).rejects.toThrow(
      "unique constraint violation",
    );
    expect(mockedUpsert).not.toHaveBeenCalled();
  });

  it("propagates errors from the participant upsert", async () => {
    setupTransaction([{ id: MOCK_CART_ID }]);
    mockedUpsert.mockRejectedValueOnce(new Error("upsert failed"));

    await expect(createCart(MOCK_USER_ID)).rejects.toThrow("upsert failed");
  });
});
