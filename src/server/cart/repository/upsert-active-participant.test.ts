import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_CART_ID, MOCK_USER_ID } from "@/server/cart/mock-data/ids";
import { createChainStub, createMockDb, type MockDb } from "@/server/db/mock-db";

import { upsertActiveParticipant } from "./upsert-active-participant";

describe("upsertActiveParticipant", () => {
  let tx: MockDb;

  beforeEach(() => {
    tx = createMockDb();
  });

  it("deactivates prior active row then upserts the new row as active", async () => {
    const updateChain = createChainStub(undefined);
    const insertChain = createChainStub(undefined);
    tx.update.mockReturnValue(updateChain);
    tx.insert.mockReturnValue(insertChain);

    await upsertActiveParticipant(tx as never, {
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "owner",
    });

    expect(tx.update).toHaveBeenCalledTimes(1);
    expect(updateChain.set).toHaveBeenCalledWith({ status: "inactive" });
    expect(updateChain.where).toHaveBeenCalledTimes(1);

    expect(tx.insert).toHaveBeenCalledTimes(1);
    expect(insertChain.values).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "owner",
      status: "active",
    });
    expect(insertChain.onConflictDoUpdate).toHaveBeenCalledTimes(1);
    const conflictArg = insertChain.onConflictDoUpdate.mock.calls[0]?.[0];
    expect(conflictArg).toMatchObject({
      set: { status: "active", role: "owner" },
    });
  });

  it("supports the editor role", async () => {
    tx.update.mockReturnValue(createChainStub(undefined));
    const insertChain = createChainStub(undefined);
    tx.insert.mockReturnValue(insertChain);

    await upsertActiveParticipant(tx as never, {
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "editor",
    });

    expect(insertChain.values).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "editor",
      status: "active",
    });
    const conflictArg = insertChain.onConflictDoUpdate.mock.calls[0]?.[0];
    expect(conflictArg).toMatchObject({
      set: { status: "active", role: "editor" },
    });
  });

  it("propagates errors from the deactivation update", async () => {
    const dbError = new Error("deactivation failed");
    tx.update.mockReturnValue(createChainStub(null, dbError));

    await expect(
      upsertActiveParticipant(tx as never, {
        cartId: MOCK_CART_ID,
        userId: MOCK_USER_ID,
        role: "owner",
      }),
    ).rejects.toThrow("deactivation failed");

    expect(tx.insert).not.toHaveBeenCalled();
  });

  it("propagates errors from the upsert", async () => {
    tx.update.mockReturnValue(createChainStub(undefined));
    const dbError = new Error("upsert failed");
    tx.insert.mockReturnValue(createChainStub(null, dbError));

    await expect(
      upsertActiveParticipant(tx as never, {
        cartId: MOCK_CART_ID,
        userId: MOCK_USER_ID,
        role: "editor",
      }),
    ).rejects.toThrow("upsert failed");
  });
});
