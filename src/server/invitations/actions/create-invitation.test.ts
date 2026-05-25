import { beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_CART_ID, MOCK_USER_ID } from "@/server/cart/mock-data/ids";
import { getActiveCartIdByUser } from "@/server/cart/repository/get-active-cart-id-by-user";
import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { sendEmail } from "@/server/email/send-email";
import {
  MOCK_INVITED_EMAIL,
  MOCK_INVITER_NAME,
} from "@/server/invitations/mock-data/ids";
import { buildMockInvitation } from "@/server/invitations/mock-data/mock-invitation";
import { createInvitation as createInvitationRow } from "@/server/invitations/repository/create-invitation";

import { createInvitation } from "./create-invitation";

vi.mock("@/server/auth/get-current-user-id", () => ({
  getCurrentUserId: vi.fn(),
}));
vi.mock("@/server/cart/repository/get-active-cart-id-by-user", () => ({
  getActiveCartIdByUser: vi.fn(),
}));
vi.mock("@/server/email/send-email", () => ({
  sendEmail: vi.fn(),
}));
vi.mock("@/server/invitations/repository/create-invitation", () => ({
  createInvitation: vi.fn(),
}));

const mockedGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockedgetActiveCartIdByUser = vi.mocked(getActiveCartIdByUser);
const mockedSendEmail = vi.mocked(sendEmail);
const mockedCreateRow = vi.mocked(createInvitationRow);

const validInput = {
  name: MOCK_INVITER_NAME,
  email: MOCK_INVITED_EMAIL,
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.APP_URL = "http://localhost:3000";
});

describe("createInvitation", () => {
  it("inserts a row and sends an email with accept/reject links", async () => {
    const invitation = buildMockInvitation();
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedCreateRow.mockResolvedValue(invitation);
    mockedSendEmail.mockResolvedValue({ ok: true });

    const result = await createInvitation(validInput);

    expect(result).toEqual({ ok: true, data: invitation });
    expect(mockedCreateRow).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      email: MOCK_INVITED_EMAIL,
    });
    expect(mockedSendEmail).toHaveBeenCalledTimes(1);
    const sendPayload = mockedSendEmail.mock.calls[0][0];
    expect(sendPayload.to).toBe(MOCK_INVITED_EMAIL);
    expect(sendPayload.subject).toBe("You're invited to a group order");
    expect(sendPayload.react).toBeDefined();
  });

  it("does not roll back the insert when email fails", async () => {
    const invitation = buildMockInvitation();
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedCreateRow.mockResolvedValue(invitation);
    mockedSendEmail.mockResolvedValue({ ok: false });

    const result = await createInvitation(validInput);

    expect(result).toEqual({ ok: true, data: invitation });
  });

  it("returns failure when there is no current user", async () => {
    mockedGetCurrentUserId.mockResolvedValue(undefined);

    const result = await createInvitation(validInput);

    expect(result).toEqual({
      ok: false,
      error:
        "We couldn't load your session. Please refresh the page. If the issue continues, clear your Better Auth cookies and try again.",
    });
    expect(mockedCreateRow).not.toHaveBeenCalled();
  });

  it("returns failure when the user has no cart", async () => {
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(null);

    const result = await createInvitation(validInput);

    expect(result).toEqual({
      ok: false,
      error: "We couldn't find your cart. Please refresh and try again.",
    });
    expect(mockedCreateRow).not.toHaveBeenCalled();
  });

  it("skips email send when APP_URL is unset", async () => {
    delete process.env.APP_URL;
    const invitation = buildMockInvitation();
    mockedGetCurrentUserId.mockResolvedValue(MOCK_USER_ID);
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedCreateRow.mockResolvedValue(invitation);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await createInvitation(validInput);

    expect(result).toEqual({ ok: true, data: invitation });
    expect(mockedSendEmail).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
