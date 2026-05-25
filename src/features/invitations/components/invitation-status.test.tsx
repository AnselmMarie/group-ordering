import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getInvitationsByCartId } from "@/server/invitations/repository/get-invitations-by-cart-id";

import { InvitationStatus } from "./invitation-status";

vi.mock("@/server/invitations/repository/get-invitations-by-cart-id", () => ({
  getInvitationsByCartId: vi.fn(),
}));

const mockedGetInvitationsByCartId = vi.mocked(getInvitationsByCartId);

describe("InvitationStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the empty-state message when there are no invitations", async () => {
    mockedGetInvitationsByCartId.mockResolvedValueOnce(null);

    render(await InvitationStatus());

    expect(screen.getByText(/didn't invite anyone yet/i)).toBeInTheDocument();
  });

  it("renders the empty-state message when invitation list is empty", async () => {
    mockedGetInvitationsByCartId.mockResolvedValueOnce([]);

    render(await InvitationStatus());

    expect(screen.getByText(/didn't invite anyone yet/i)).toBeInTheDocument();
  });

  it("renders one entry per invitation by email", async () => {
    mockedGetInvitationsByCartId.mockResolvedValueOnce([
      {
        id: "inv-1",
        cartId: "cart-1",
        invitedEmail: "a@example.com",
        status: "pending",
      },
      {
        id: "inv-2",
        cartId: "cart-1",
        invitedEmail: "b@example.com",
        status: "accepted",
      },
    ]);

    render(await InvitationStatus());

    expect(screen.getByText("a@example.com")).toBeInTheDocument();
    expect(screen.getByText("b@example.com")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Accepted")).toBeInTheDocument();
  });
});
