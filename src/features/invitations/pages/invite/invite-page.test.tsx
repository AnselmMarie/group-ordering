import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getInvitationById } from "@/server/invitations/repository/get-invitation-by-id";
import { buildMockInvitation } from "@/server/invitations/mock-data/mock-invitation";

import InvitePage from "./invite-page";

const notFoundMock = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));
vi.mock("@/server/invitations/repository/get-invitation-by-id", () => ({
  getInvitationById: vi.fn(),
}));
vi.mock("@/features/invitations/components/invite-actions", () => ({
  InviteActions: ({ initialView }: { initialView: string }) => (
    <div data-testid="invite-actions">view:{initialView}</div>
  ),
}));

const mockedGetInvitationById = vi.mocked(getInvitationById);

const renderPage = async (
  id: string,
  action?: string,
) => {
  const element = await InvitePage({
    params: Promise.resolve({ id }),
    searchParams: Promise.resolve({ action }),
  });
  return render(element);
};

describe("InvitePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls notFound when the invitation does not exist", async () => {
    mockedGetInvitationById.mockResolvedValueOnce(null);

    await expect(renderPage("missing")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it("renders the accepted view with a Build Your Order link", async () => {
    mockedGetInvitationById.mockResolvedValueOnce(
      buildMockInvitation({ status: "accepted" }),
    );

    await renderPage("inv-1");

    expect(screen.getByText(/invitation accepted/i)).toBeInTheDocument();
    expect(screen.getByText(/build your order/i)).toBeInTheDocument();
  });

  it("renders the rejected view without an action button", async () => {
    mockedGetInvitationById.mockResolvedValueOnce(
      buildMockInvitation({ status: "rejected" }),
    );

    await renderPage("inv-1");

    expect(screen.getByText(/invitation rejected/i)).toBeInTheDocument();
    expect(screen.queryByText(/build your order/i)).not.toBeInTheDocument();
  });

  it("renders InviteActions with default view when status is pending and no action", async () => {
    mockedGetInvitationById.mockResolvedValueOnce(
      buildMockInvitation({ status: "pending" }),
    );

    await renderPage("inv-1");

    expect(screen.getByTestId("invite-actions")).toHaveTextContent(
      "view:default",
    );
  });

  it("forwards the action search param to InviteActions (accept)", async () => {
    mockedGetInvitationById.mockResolvedValueOnce(
      buildMockInvitation({ status: "pending" }),
    );

    await renderPage("inv-1", "accept");

    expect(screen.getByTestId("invite-actions")).toHaveTextContent(
      "view:accept",
    );
  });

  it("forwards the action search param to InviteActions (reject)", async () => {
    mockedGetInvitationById.mockResolvedValueOnce(
      buildMockInvitation({ status: "pending" }),
    );

    await renderPage("inv-1", "reject");

    expect(screen.getByTestId("invite-actions")).toHaveTextContent(
      "view:reject",
    );
  });

  it("falls back to default view when action is unrecognized", async () => {
    mockedGetInvitationById.mockResolvedValueOnce(
      buildMockInvitation({ status: "pending" }),
    );

    await renderPage("inv-1", "garbage");

    expect(screen.getByTestId("invite-actions")).toHaveTextContent(
      "view:default",
    );
  });
});
