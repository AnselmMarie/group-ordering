import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/server/db";
import { MOCK_CART_ID } from "@/server/cart/mock-data/ids";
import { createChainStub } from "@/server/db/mock-db";

import { countActiveInvitations } from "./count-active-invitations";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

describe("countActiveInvitations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the count from the first row", async () => {
    mockedDb.select.mockReturnValue(createChainStub([{ count: 3 }]));

    const result = await countActiveInvitations(MOCK_CART_ID);

    expect(result).toBe(3);
    expect(mockedDb.select).toHaveBeenCalledTimes(1);
  });

  it("returns 0 when no rows are returned", async () => {
    mockedDb.select.mockReturnValue(createChainStub([]));

    const result = await countActiveInvitations(MOCK_CART_ID);

    expect(result).toBe(0);
  });

  it("returns 0 when count is null/undefined", async () => {
    mockedDb.select.mockReturnValue(createChainStub([{ count: null }]));

    const result = await countActiveInvitations(MOCK_CART_ID);

    expect(result).toBe(0);
  });

  it("uses the provided transaction handle when supplied", async () => {
    const txSelect = vi.fn().mockReturnValue(createChainStub([{ count: 2 }]));
    const tx = { select: txSelect } as unknown as Parameters<
      typeof countActiveInvitations
    >[1];

    const result = await countActiveInvitations(MOCK_CART_ID, tx);

    expect(result).toBe(2);
    expect(txSelect).toHaveBeenCalledTimes(1);
    expect(mockedDb.select).not.toHaveBeenCalled();
  });

  it("propagates database errors", async () => {
    mockedDb.select.mockReturnValue(
      createChainStub(null, new Error("count failed")),
    );

    await expect(countActiveInvitations(MOCK_CART_ID)).rejects.toThrow(
      "count failed",
    );
  });
});
