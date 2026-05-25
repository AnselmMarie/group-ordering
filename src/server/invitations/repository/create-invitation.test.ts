import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_CART_ID } from "@/server/cart/mock-data/ids";
import { db } from "@/server/db";
import { MAX_ACTIVE_INVITES } from "@/server/invitations/constants";
import { buildMockInvitation } from "@/server/invitations/mock-data/mock-invitation";
import { getCountActiveInvitations } from "@/server/invitations/repository/get-count-active-invitations";

import { createInvitation } from "./create-invitation";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/server/db", () => ({
  db: { transaction: vi.fn() },
}));
vi.mock("@/server/invitations/repository/get-count-active-invitations", () => ({
  getCountActiveInvitations: vi.fn(),
}));

const mockedDb = vi.mocked(db) as unknown as {
  transaction: ReturnType<typeof vi.fn>;
};
const mockedgetCountActiveInvitations = vi.mocked(getCountActiveInvitations);

const buildInsertedRow = () => {
  const row = buildMockInvitation();
  return {
    id: row.id,
    cartId: row.cartId,
    invitedEmail: row.invitedEmail,
    status: row.status,
    acceptedByUserId: row.acceptedByUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const buildTx = (returningResult: unknown) => ({
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(returningResult),
    }),
  }),
});

describe("createInvitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the mapped invitation when the transaction returns an inserted row", async () => {
    const inserted = buildInsertedRow();
    mockedgetCountActiveInvitations.mockResolvedValueOnce(0);
    const tx = buildTx([inserted]);
    mockedDb.transaction.mockImplementationOnce(
      async (cb: (tx: unknown) => unknown) => cb(tx),
    );

    const result = await createInvitation({
      cartId: MOCK_CART_ID,
      email: inserted.invitedEmail,
    });

    expect(mockedDb.transaction).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: inserted.id,
      cartId: inserted.cartId,
      invitedEmail: inserted.invitedEmail,
      status: inserted.status,
      acceptedByUserId: inserted.acceptedByUserId,
      createdAt: inserted.createdAt,
      updatedAt: inserted.updatedAt,
    });
  });

  it("throws 'Invite limit reached' when the active invitation count is at the max", async () => {
    mockedgetCountActiveInvitations.mockResolvedValueOnce(MAX_ACTIVE_INVITES);
    const tx = buildTx([]);
    mockedDb.transaction.mockImplementationOnce(
      async (cb: (tx: unknown) => unknown) => cb(tx),
    );

    await expect(
      createInvitation({ cartId: MOCK_CART_ID, email: "x@example.com" }),
    ).rejects.toThrow(/Invite limit reached/);
  });

  it("throws 'Failed to create invitation' when the insert returns no rows", async () => {
    mockedgetCountActiveInvitations.mockResolvedValueOnce(0);
    const tx = buildTx([]);
    mockedDb.transaction.mockImplementationOnce(
      async (cb: (tx: unknown) => unknown) => cb(tx),
    );

    await expect(
      createInvitation({ cartId: MOCK_CART_ID, email: "x@example.com" }),
    ).rejects.toThrow(/Failed to create invitation/);
  });

  it("propagates database errors", async () => {
    mockedDb.transaction.mockRejectedValueOnce(new Error("insert failed"));

    await expect(
      createInvitation({ cartId: MOCK_CART_ID, email: "x@example.com" }),
    ).rejects.toThrow("insert failed");
  });
});
