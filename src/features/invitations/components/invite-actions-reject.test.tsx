import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InviteReject } from "./invite-actions-reject";

const toastError = vi.fn();
const rejectInvitationMock = vi.fn();
const routerRefresh = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh }),
}));

vi.mock("@/server/invitations/actions/reject-invitation", () => ({
  rejectInvitation: (...args: unknown[]) => rejectInvitationMock(...args),
}));

describe("InviteReject", () => {
  beforeEach(() => {
    toastError.mockClear();
    rejectInvitationMock.mockReset();
    routerRefresh.mockClear();
  });

  it("toasts the friendly error and does not render inline error UI on rejection", async () => {
    rejectInvitationMock.mockRejectedValue(
      new Error("This invitation no longer exists."),
    );
    const user = userEvent.setup();

    render(<InviteReject invitationId="inv-1" onSetView={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /reject invitation/i }));

    expect(toastError).toHaveBeenCalledWith(
      "This invitation no longer exists.",
    );
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it("refreshes the router on success", async () => {
    rejectInvitationMock.mockResolvedValue({});
    const user = userEvent.setup();

    render(<InviteReject invitationId="inv-1" onSetView={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /reject invitation/i }));

    expect(rejectInvitationMock).toHaveBeenCalledWith("inv-1");
    expect(routerRefresh).toHaveBeenCalledTimes(1);
    expect(toastError).not.toHaveBeenCalled();
  });
});
