import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/server/db";
import { MOCK_CART_ID } from "@/server/cart/mock-data/ids";
import { createChainStub } from "@/server/db/mock-db";

import { getCountActiveParticipants } from "./get-count-active-participants";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

describe("getCountActiveParticipants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the count from the first row", async () => {
    mockedDb.select.mockReturnValue(createChainStub([{ count: 3 }]));

    const result = await getCountActiveParticipants(MOCK_CART_ID);

    expect(result).toBe(3);
    expect(mockedDb.select).toHaveBeenCalledTimes(1);
  });

  it("returns 0 when no rows are returned", async () => {
    mockedDb.select.mockReturnValue(createChainStub([]));

    const result = await getCountActiveParticipants(MOCK_CART_ID);

    expect(result).toBe(0);
  });

  it("returns 0 when count is null/undefined", async () => {
    mockedDb.select.mockReturnValue(createChainStub([{ count: null }]));

    const result = await getCountActiveParticipants(MOCK_CART_ID);

    expect(result).toBe(0);
  });

  it("propagates database errors", async () => {
    const dbError = new Error("count failed");
    mockedDb.select.mockReturnValue(createChainStub(null, dbError));

    await expect(getCountActiveParticipants(MOCK_CART_ID)).rejects.toThrow(
      "count failed",
    );
  });
});
