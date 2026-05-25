import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_CART_ID } from "@/server/cart/mock-data/ids";
import { db } from "@/server/db";
import { buildMockInvitation } from "@/server/invitations/mock-data/mock-invitation";

import { createInvitation } from "./create-invitation";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/server/db", () => ({
  db: { execute: vi.fn() },
}));

const mockedDb = vi.mocked(db) as unknown as {
  execute: ReturnType<typeof vi.fn>;
};

const buildRawRow = () => {
  const row = buildMockInvitation();
  return {
    id: row.id,
    cart_id: row.cartId,
    invited_email: row.invitedEmail,
    status: row.status,
    accepted_by_user_id: row.acceptedByUserId,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
};

describe("createInvitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the mapped invitation when the atomic insert returns a row (driver returns array)", async () => {
    const raw = buildRawRow();
    mockedDb.execute.mockResolvedValueOnce([raw]);

    const result = await createInvitation({
      cartId: MOCK_CART_ID,
      email: raw.invited_email,
    });

    expect(mockedDb.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: raw.id,
      cartId: raw.cart_id,
      invitedEmail: raw.invited_email,
      status: raw.status,
      acceptedByUserId: raw.accepted_by_user_id,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  });

  it("returns the mapped invitation when the driver returns { rows: [...] }", async () => {
    const raw = buildRawRow();
    mockedDb.execute.mockResolvedValueOnce({ rows: [raw] });

    const result = await createInvitation({
      cartId: MOCK_CART_ID,
      email: raw.invited_email,
    });

    expect(result.id).toBe(raw.id);
  });

  it("throws 'Invite limit reached' when the atomic insert returns no rows (array shape)", async () => {
    mockedDb.execute.mockResolvedValueOnce([]);

    await expect(
      createInvitation({ cartId: MOCK_CART_ID, email: "x@example.com" }),
    ).rejects.toThrow(/Invite limit reached/);
  });

  it("throws 'Invite limit reached' when the atomic insert returns no rows ({ rows: [] } shape)", async () => {
    mockedDb.execute.mockResolvedValueOnce({ rows: [] });

    await expect(
      createInvitation({ cartId: MOCK_CART_ID, email: "x@example.com" }),
    ).rejects.toThrow(/Invite limit reached/);
  });

  it("propagates database errors", async () => {
    mockedDb.execute.mockRejectedValueOnce(new Error("insert failed"));

    await expect(
      createInvitation({ cartId: MOCK_CART_ID, email: "x@example.com" }),
    ).rejects.toThrow("insert failed");
  });
});
