import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_USER_ID } from "@/server/cart/mock-data/ids";
import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import {
  MOCK_INVITATION_ID,
  MOCK_INVITED_EMAIL,
} from "@/server/invitations/mock-data/ids";
import { buildMockInvitation } from "@/server/invitations/mock-data/mock-invitation";
import { findInvitationById } from "@/server/invitations/repository/find-invitation-by-id";
import { updateInvitationStatus } from "@/server/invitations/repository/update-invitation-status";

import { acceptInvitation } from "./accept-invitation";

vi.mock("@/server/auth/get-current-user-id", () => ({
  getCurrentUserId: vi.fn(),
}));
vi.mock("@/server/invitations/repository/find-invitation-by-id", () => ({
  findInvitationById: vi.fn(),
}));
vi.mock("@/server/invitations/repository/update-invitation-status", () => ({
  updateInvitationStatus: vi.fn(),
}));

const mockedGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockedFindById = vi.mocked(findInvitationById);
const mockedUpdateStatus = vi.mocked(updateInvitationStatus);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("acceptInvitation", () => {
  it("updates status to accepted and sets acceptedByUserId on email match", async () => {
    mockedFindById.mockResolvedValue(buildMockInvitation());
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedUpdateStatus.mockResolvedValue(undefined);

    const result = await acceptInvitation({
      id: MOCK_INVITATION_ID,
      email: MOCK_INVITED_EMAIL,
    });

    expect(result.status).toBe("accepted");
    expect(result.acceptedByUserId).toBe(MOCK_USER_ID);
    expect(mockedUpdateStatus).toHaveBeenCalledWith({
      id: MOCK_INVITATION_ID,
      status: "accepted",
      acceptedByUserId: MOCK_USER_ID,
    });
  });

  it("matches email case-insensitively and trims whitespace", async () => {
    mockedFindById.mockResolvedValue(buildMockInvitation());
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);

    await acceptInvitation({
      id: MOCK_INVITATION_ID,
      email: `  ${MOCK_INVITED_EMAIL.toUpperCase()}  `,
    });

    expect(mockedUpdateStatus).toHaveBeenCalledTimes(1);
  });

  it("rejects on email mismatch", async () => {
    mockedFindById.mockResolvedValue(buildMockInvitation());
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);

    await expect(
      acceptInvitation({
        id: MOCK_INVITATION_ID,
        email: "different@example.com",
      }),
    ).rejects.toThrow("Email does not match the invitation");
    expect(mockedUpdateStatus).not.toHaveBeenCalled();
  });

  it("throws when invitation is not found", async () => {
    mockedFindById.mockResolvedValue(null);

    await expect(
      acceptInvitation({
        id: MOCK_INVITATION_ID,
        email: MOCK_INVITED_EMAIL,
      }),
    ).rejects.toThrow("Invitation not found");
  });

  it("throws when invitation is already accepted", async () => {
    mockedFindById.mockResolvedValue(
      buildMockInvitation({ status: "accepted" }),
    );

    await expect(
      acceptInvitation({
        id: MOCK_INVITATION_ID,
        email: MOCK_INVITED_EMAIL,
      }),
    ).rejects.toThrow("Invitation already accepted");
  });

  it("throws when there is no session", async () => {
    mockedFindById.mockResolvedValue(buildMockInvitation());
    mockedGetCurrentUserId.mockResolvedValue(undefined);

    await expect(
      acceptInvitation({
        id: MOCK_INVITATION_ID,
        email: MOCK_INVITED_EMAIL,
      }),
    ).rejects.toThrow("Session is not found");
  });
});
