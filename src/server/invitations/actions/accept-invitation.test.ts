import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_CART_ID, MOCK_USER_ID } from "@/server/cart/mock-data/ids";
import { createActiveParticipant } from "@/server/cart/repository/create-active-participant";
import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { db } from "@/server/db";
import { createMockDb, type MockDb } from "@/server/db/mock-db";
import {
  MOCK_INVITATION_ID,
  MOCK_INVITED_EMAIL,
} from "@/server/invitations/mock-data/ids";
import { buildMockInvitation } from "@/server/invitations/mock-data/mock-invitation";
import { getInvitationById } from "@/server/invitations/repository/get-invitation-by-id";
import { updateInvitationStatus } from "@/server/invitations/repository/update-invitation-status";

import { acceptInvitation } from "./accept-invitation";

vi.mock("@/server/auth/get-current-user-id", () => ({
  getCurrentUserId: vi.fn(),
}));
vi.mock("@/server/invitations/repository/get-invitation-by-id", () => ({
  getInvitationById: vi.fn(),
}));
vi.mock("@/server/invitations/repository/update-invitation-status", () => ({
  updateInvitationStatus: vi.fn(),
}));
vi.mock("@/server/cart/repository/create-active-participant", () => ({
  createActiveParticipant: vi.fn(),
}));
vi.mock("@/server/db", () => ({
  db: { transaction: vi.fn() },
}));

const mockedGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockedFindById = vi.mocked(getInvitationById);
const mockedUpdateStatus = vi.mocked(updateInvitationStatus);
const mockedUpsert = vi.mocked(createActiveParticipant);
const mockedDb = vi.mocked(db) as unknown as {
  transaction: ReturnType<typeof vi.fn>;
};

const setupTransaction = (): MockDb => {
  const tx = createMockDb();
  mockedDb.transaction.mockImplementation(
    async (cb: (tx: MockDb) => Promise<unknown>) => cb(tx),
  );
  return tx;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("acceptInvitation", () => {
  it("updates status, registers accepter as active editor participant, and returns the updated invitation", async () => {
    mockedFindById.mockResolvedValue(buildMockInvitation());
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    const tx = setupTransaction();

    const result = await acceptInvitation({
      id: MOCK_INVITATION_ID,
      email: MOCK_INVITED_EMAIL,
    });

    if (!result.ok) throw new Error(`expected ok, got ${result.error}`);
    expect(result.data.status).toBe("accepted");
    expect(result.data.acceptedByUserId).toBe(MOCK_USER_ID);

    expect(mockedUpdateStatus).toHaveBeenCalledWith(
      {
        id: MOCK_INVITATION_ID,
        status: "accepted",
        acceptedByUserId: MOCK_USER_ID,
      },
      tx,
    );
    expect(mockedUpsert).toHaveBeenCalledWith(tx, {
      cartId: MOCK_CART_ID,
      userId: MOCK_USER_ID,
      role: "editor",
    });
  });

  it("matches email case-insensitively and trims whitespace", async () => {
    mockedFindById.mockResolvedValue(buildMockInvitation());
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    setupTransaction();

    await acceptInvitation({
      id: MOCK_INVITATION_ID,
      email: `  ${MOCK_INVITED_EMAIL.toUpperCase()}  `,
    });

    expect(mockedUpdateStatus).toHaveBeenCalledTimes(1);
    expect(mockedUpsert).toHaveBeenCalledTimes(1);
  });

  it("returns failure on email mismatch and never starts a transaction", async () => {
    mockedFindById.mockResolvedValue(buildMockInvitation());
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);

    const result = await acceptInvitation({
      id: MOCK_INVITATION_ID,
      email: "different@example.com",
    });

    expect(result).toEqual({
      ok: false,
      error: "That email doesn't match this invitation.",
    });
    expect(mockedDb.transaction).not.toHaveBeenCalled();
    expect(mockedUpdateStatus).not.toHaveBeenCalled();
    expect(mockedUpsert).not.toHaveBeenCalled();
  });

  it("returns failure when invitation is not found", async () => {
    mockedFindById.mockResolvedValue(null);

    const result = await acceptInvitation({
      id: MOCK_INVITATION_ID,
      email: MOCK_INVITED_EMAIL,
    });

    expect(result).toEqual({
      ok: false,
      error: "This invitation no longer exists.",
    });
    expect(mockedDb.transaction).not.toHaveBeenCalled();
  });

  it("returns failure when invitation is already accepted", async () => {
    mockedFindById.mockResolvedValue(
      buildMockInvitation({ status: "accepted" }),
    );

    const result = await acceptInvitation({
      id: MOCK_INVITATION_ID,
      email: MOCK_INVITED_EMAIL,
    });

    expect(result).toEqual({
      ok: false,
      error: "This invitation has already been accepted.",
    });
    expect(mockedDb.transaction).not.toHaveBeenCalled();
  });

  it("returns failure when there is no session", async () => {
    mockedFindById.mockResolvedValue(buildMockInvitation());
    mockedGetCurrentUserId.mockResolvedValue(undefined);

    const result = await acceptInvitation({
      id: MOCK_INVITATION_ID,
      email: MOCK_INVITED_EMAIL,
    });

    expect(result).toEqual({
      ok: false,
      error:
        "We couldn't load your session. Please refresh the page. If the issue continues, clear your Better Auth cookies and try again.",
    });
    expect(mockedDb.transaction).not.toHaveBeenCalled();
  });

  it("returns failure when the participant upsert throws", async () => {
    mockedFindById.mockResolvedValue(buildMockInvitation());
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    setupTransaction();
    mockedUpsert.mockRejectedValueOnce(new Error("upsert failed"));

    const result = await acceptInvitation({
      id: MOCK_INVITATION_ID,
      email: MOCK_INVITED_EMAIL,
    });

    expect(result).toEqual({ ok: false, error: "Something went wrong" });
  });
});
