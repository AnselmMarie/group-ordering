import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_CART_ID } from "@/server/cart/mock-data/ids";
import { db } from "@/server/db";
import { createChainStub } from "@/server/db/mock-db";
import { buildMockInvitation } from "@/server/invitations/mock-data/mock-invitation";

import { createInvitation } from "./create-invitation";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

describe("createInvitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts a row and returns the mapped invitation", async () => {
    const row = buildMockInvitation();
    const chain = createChainStub([row]);
    mockedDb.insert.mockReturnValue(chain as never);

    const result = await createInvitation({
      cartId: MOCK_CART_ID,
      email: row.invitedEmail,
    });

    expect(mockedDb.insert).toHaveBeenCalledTimes(1);
    expect(chain.values).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      invitedEmail: row.invitedEmail,
    });
    expect(result).toEqual(row);
  });

  it("propagates database errors", async () => {
    mockedDb.insert.mockReturnValue(
      createChainStub(null, new Error("insert failed")) as never,
    );

    await expect(
      createInvitation({ cartId: MOCK_CART_ID, email: "x@example.com" }),
    ).rejects.toThrow("insert failed");
  });
});
