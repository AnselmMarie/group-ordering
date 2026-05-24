import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_USER_ID } from "@/server/cart/mock-data/ids";
import { db } from "@/server/db";
import { createChainStub } from "@/server/db/mock-db";
import { MOCK_INVITATION_ID } from "@/server/invitations/mock-data/ids";

import { updateInvitationStatus } from "./update-invitation-status";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

describe("updateInvitationStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates status to accepted with acceptedByUserId", async () => {
    const chain = createChainStub([]);
    mockedDb.update.mockReturnValue(chain as never);

    await updateInvitationStatus({
      id: MOCK_INVITATION_ID,
      status: "accepted",
      acceptedByUserId: MOCK_USER_ID,
    });

    expect(chain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "accepted",
        acceptedByUserId: MOCK_USER_ID,
      }),
    );
  });

  it("nulls acceptedByUserId when not provided (rejected case)", async () => {
    const chain = createChainStub([]);
    mockedDb.update.mockReturnValue(chain as never);

    await updateInvitationStatus({
      id: MOCK_INVITATION_ID,
      status: "rejected",
    });

    expect(chain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejected",
        acceptedByUserId: null,
      }),
    );
  });

  it("propagates database errors", async () => {
    mockedDb.update.mockReturnValue(
      createChainStub(null, new Error("update failed")) as never,
    );

    await expect(
      updateInvitationStatus({ id: MOCK_INVITATION_ID, status: "accepted" }),
    ).rejects.toThrow("update failed");
  });
});
