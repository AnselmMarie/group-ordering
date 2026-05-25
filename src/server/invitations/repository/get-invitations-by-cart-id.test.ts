import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_CART_ID } from "@/server/cart/mock-data/ids";
import { getActiveCartIdByUser } from "@/server/cart/repository/get-active-cart-id-by-user";
import { db } from "@/server/db";
import { createChainStub } from "@/server/db/mock-db";
import { getCurrentUserId } from "@/server/auth/get-current-user-id";

import { getInvitationsByCartId } from "./get-invitations-by-cart-id";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));
vi.mock("@/server/auth/get-current-user-id", () => ({
  getCurrentUserId: vi.fn(),
}));
vi.mock("@/server/cart/repository/get-active-cart-id-by-user", () => ({
  getActiveCartIdByUser: vi.fn(),
}));

const mockedDb = vi.mocked(db);
const mockedGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockedgetActiveCartIdByUser = vi.mocked(getActiveCartIdByUser);

const USER_ID = "user-1";

describe("getInvitationsByCartId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no authenticated user", async () => {
    mockedGetCurrentUserId.mockResolvedValueOnce(undefined);

    const result = await getInvitationsByCartId();

    expect(result).toBeNull();
    expect(mockedgetActiveCartIdByUser).not.toHaveBeenCalled();
    expect(mockedDb.select).not.toHaveBeenCalled();
  });

  it("returns null when the user has no active cart", async () => {
    mockedGetCurrentUserId.mockResolvedValueOnce(USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValueOnce(null);

    const result = await getInvitationsByCartId();

    expect(result).toBeNull();
    expect(mockedDb.select).not.toHaveBeenCalled();
  });

  it("returns null when no invitation rows are found", async () => {
    mockedGetCurrentUserId.mockResolvedValueOnce(USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValueOnce(MOCK_CART_ID);
    mockedDb.select.mockReturnValue(createChainStub([]) as never);

    const result = await getInvitationsByCartId();

    expect(result).toBeNull();
  });

  it("returns mapped rows with status cast to InvitationStatus", async () => {
    mockedGetCurrentUserId.mockResolvedValueOnce(USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValueOnce(MOCK_CART_ID);
    const rows = [
      {
        id: "inv-1",
        cartId: MOCK_CART_ID,
        invitedEmail: "a@example.com",
        status: "pending",
      },
      {
        id: "inv-2",
        cartId: MOCK_CART_ID,
        invitedEmail: "b@example.com",
        status: "accepted",
      },
    ];
    mockedDb.select.mockReturnValue(createChainStub(rows) as never);

    const result = await getInvitationsByCartId();

    expect(result).toEqual(rows);
    expect(result).toHaveLength(2);
  });

  it("propagates database errors", async () => {
    mockedGetCurrentUserId.mockResolvedValueOnce(USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValueOnce(MOCK_CART_ID);
    mockedDb.select.mockReturnValue(
      createChainStub(null, new Error("select failed")) as never,
    );

    await expect(getInvitationsByCartId()).rejects.toThrow("select failed");
  });
});
