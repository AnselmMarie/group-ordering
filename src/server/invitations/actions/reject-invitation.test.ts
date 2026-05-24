import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_INVITATION_ID } from "@/server/invitations/mock-data/ids";
import { buildMockInvitation } from "@/server/invitations/mock-data/mock-invitation";
import { getInvitationById } from "@/server/invitations/repository/get-invitation-by-id";
import { updateInvitationStatus } from "@/server/invitations/repository/update-invitation-status";

import { rejectInvitation } from "./reject-invitation";

vi.mock("@/server/invitations/repository/get-invitation-by-id", () => ({
  getInvitationById: vi.fn(),
}));
vi.mock("@/server/invitations/repository/update-invitation-status", () => ({
  updateInvitationStatus: vi.fn(),
}));

const mockedFindById = vi.mocked(getInvitationById);
const mockedUpdateStatus = vi.mocked(updateInvitationStatus);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("rejectInvitation", () => {
  it("updates status to rejected", async () => {
    mockedFindById.mockResolvedValue(buildMockInvitation());

    const result = await rejectInvitation(MOCK_INVITATION_ID);

    expect(result.status).toBe("rejected");
    expect(mockedUpdateStatus).toHaveBeenCalledWith({
      id: MOCK_INVITATION_ID,
      status: "rejected",
    });
  });

  it("throws when invitation is not found", async () => {
    mockedFindById.mockResolvedValue(null);

    await expect(rejectInvitation(MOCK_INVITATION_ID)).rejects.toThrow(
      "Invitation not found",
    );
  });

  it("throws when invitation is already rejected", async () => {
    mockedFindById.mockResolvedValue(
      buildMockInvitation({ status: "rejected" }),
    );

    await expect(rejectInvitation(MOCK_INVITATION_ID)).rejects.toThrow(
      "Invitation already rejected",
    );
  });
});
