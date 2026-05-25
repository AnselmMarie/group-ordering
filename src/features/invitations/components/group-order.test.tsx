import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GroupOrder } from "./group-order";

const toastError = vi.fn();
const createInvitationMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock("@/server/invitations/actions/create-invitation", () => ({
  createInvitation: (...args: unknown[]) => createInvitationMock(...args),
}));

const openSheet = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: /group order/i }));
};

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/your name/i), "Alice");
  await user.type(screen.getByLabelText(/email/i), "friend@example.com");
};

describe("GroupOrder", () => {
  beforeEach(() => {
    toastError.mockClear();
    createInvitationMock.mockReset();
  });

  it("clears the email field on successful submit", async () => {
    createInvitationMock.mockResolvedValue({
      ok: true,
      data: { id: "inv-1" },
    });
    const user = userEvent.setup();

    render(<GroupOrder inviteStatus={null} />);
    await openSheet(user);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create invite/i }));

    await waitFor(() => {
      expect(createInvitationMock).toHaveBeenCalledWith({
        name: "Alice",
        email: "friend@example.com",
      });
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toHaveValue("");
    });
    expect(toastError).not.toHaveBeenCalled();
  });

  it("toasts the friendly error and keeps the email field on rejection", async () => {
    createInvitationMock.mockResolvedValue({
      ok: false,
      error: "We couldn't find your cart. Please refresh and try again.",
    });
    const user = userEvent.setup();

    render(<GroupOrder inviteStatus={null} />);
    await openSheet(user);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create invite/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "We couldn't find your cart. Please refresh and try again.",
      );
    });
    // Email retained so the user can correct/retry without retyping.
    expect(screen.getByLabelText(/email/i)).toHaveValue("friend@example.com");
  });
});
