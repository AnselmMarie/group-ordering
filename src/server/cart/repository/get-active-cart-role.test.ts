import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { MOCK_CART_ID, MOCK_USER_ID } from "@/server/cart/mock-data/ids";
import { getActiveCartIdByUser } from "@/server/cart/repository/get-active-cart-id-by-user";
import { db } from "@/server/db";
import { createChainStub } from "@/server/db/mock-db";

import { getActiveCartRole } from "./get-active-cart-role";

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

describe("getActiveCartRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no current user", async () => {
    mockedGetCurrentUserId.mockResolvedValue(undefined);

    const result = await getActiveCartRole();

    expect(result).toBeNull();
    expect(mockedgetActiveCartIdByUser).not.toHaveBeenCalled();
    expect(mockedDb.select).not.toHaveBeenCalled();
  });

  it("returns null when the user has no active cart", async () => {
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(null);

    const result = await getActiveCartRole();

    expect(result).toBeNull();
    expect(mockedDb.select).not.toHaveBeenCalled();
  });

  it("returns cartId and 'owner' when the participant row has role 'owner'", async () => {
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedDb.select.mockReturnValue(createChainStub([{ role: "owner" }]));

    const result = await getActiveCartRole();

    expect(result).toEqual({
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "owner",
    });
    expect(mockedDb.select).toHaveBeenCalledTimes(1);
  });

  it("returns cartId and 'editor' when the participant row has role 'editor'", async () => {
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedDb.select.mockReturnValue(createChainStub([{ role: "editor" }]));

    const result = await getActiveCartRole();

    expect(result).toEqual({
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "editor",
    });
  });

  it("returns null when no participant row exists", async () => {
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedDb.select.mockReturnValue(createChainStub([]));

    const result = await getActiveCartRole();

    expect(result).toBeNull();
  });

  it("returns null when the role value is unrecognized", async () => {
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedDb.select.mockReturnValue(createChainStub([{ role: "viewer" }]));

    const result = await getActiveCartRole();

    expect(result).toBeNull();
  });

  it("propagates database errors", async () => {
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    const dbError = new Error("connection refused");
    mockedDb.select.mockReturnValue(createChainStub(null, dbError));

    await expect(getActiveCartRole()).rejects.toThrow("connection refused");
  });
});
