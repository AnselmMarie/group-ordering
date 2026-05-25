import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InviteAccept } from "./invite-actions-accept";

const toastError = vi.fn();
const acceptInvitationMock = vi.fn();
const routerRefresh = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh }),
}));

vi.mock("@/server/invitations/actions/accept-invitation", () => ({
  acceptInvitation: (...args: unknown[]) => acceptInvitationMock(...args),
}));

describe("InviteAccept", () => {
  beforeEach(() => {
    toastError.mockClear();
    acceptInvitationMock.mockReset();
    routerRefresh.mockClear();
  });

  it("toasts the friendly error and does not render inline error UI on rejection", async () => {
    acceptInvitationMock.mockRejectedValue(
      new Error("That email doesn't match this invitation."),
    );
    const user = userEvent.setup();

    const { container } = render(
      <InviteAccept invitationId="inv-1" onSetView={vi.fn()} />,
    );

    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "user@example.com",
    );
    await user.click(screen.getByRole("button", { name: /accept invitation/i }));

    expect(toastError).toHaveBeenCalledWith(
      "That email doesn't match this invitation.",
    );
    expect(routerRefresh).not.toHaveBeenCalled();
    // No inline red error <p> should remain after migration.
    expect(container.querySelector("p.text-red-600")).toBeNull();
  });

  it("refreshes the router on success", async () => {
    acceptInvitationMock.mockResolvedValue({});
    const user = userEvent.setup();

    render(<InviteAccept invitationId="inv-1" onSetView={vi.fn()} />);

    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "user@example.com",
    );
    await user.click(screen.getByRole("button", { name: /accept invitation/i }));

    expect(acceptInvitationMock).toHaveBeenCalledWith({
      id: "inv-1",
      email: "user@example.com",
    });
    expect(routerRefresh).toHaveBeenCalledTimes(1);
    expect(toastError).not.toHaveBeenCalled();
  });
});
