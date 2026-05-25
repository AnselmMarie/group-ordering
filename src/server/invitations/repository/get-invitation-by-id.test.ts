import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/server/db";
import { createChainStub } from "@/server/db/mock-db";
import { MOCK_INVITATION_ID } from "@/server/invitations/mock-data/ids";
import { buildMockInvitation } from "@/server/invitations/mock-data/mock-invitation";

import { getInvitationById } from "./get-invitation-by-id";

vi.mock("@/server/db", () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

const mockedDb = vi.mocked(db);

describe("getInvitationById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the mapped invitation when a row exists", async () => {
    const row = buildMockInvitation();
    mockedDb.select.mockReturnValue(createChainStub([row]) as never);

    const result = await getInvitationById(MOCK_INVITATION_ID);

    expect(result).toEqual(row);
  });

  it("returns null when no row exists", async () => {
    mockedDb.select.mockReturnValue(createChainStub([]) as never);

    const result = await getInvitationById(MOCK_INVITATION_ID);

    expect(result).toBeNull();
  });

  it("propagates database errors", async () => {
    mockedDb.select.mockReturnValue(
      createChainStub(null, new Error("select failed")) as never,
    );

    await expect(getInvitationById(MOCK_INVITATION_ID)).rejects.toThrow(
      "select failed",
    );
  });
});
