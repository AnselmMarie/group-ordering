import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InviteActions } from "./invite-actions";

vi.mock("./invite-actions-accept", () => ({
  InviteAccept: ({ invitationId }: { invitationId: string }) => (
    <div data-testid="invite-accept">accept:{invitationId}</div>
  ),
}));
vi.mock("./invite-actions-reject", () => ({
  InviteReject: ({ invitationId }: { invitationId: string }) => (
    <div data-testid="invite-reject">reject:{invitationId}</div>
  ),
}));

describe("InviteActions", () => {
  it("renders the default invitation prompt and both action buttons", () => {
    render(<InviteActions invitationId="inv-1" />);

    expect(screen.getByText(/you've been invited/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /accept/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reject/i }),
    ).toBeInTheDocument();
  });

  it("switches to the accept sub-view when Accept is clicked", async () => {
    const user = userEvent.setup();

    render(<InviteActions invitationId="inv-1" />);

    await user.click(screen.getByRole("button", { name: /accept/i }));

    expect(screen.getByTestId("invite-accept")).toHaveTextContent(
      "accept:inv-1",
    );
  });

  it("switches to the reject sub-view when Reject is clicked", async () => {
    const user = userEvent.setup();

    render(<InviteActions invitationId="inv-1" />);

    await user.click(screen.getByRole("button", { name: /reject/i }));

    expect(screen.getByTestId("invite-reject")).toHaveTextContent(
      "reject:inv-1",
    );
  });

  it("respects initialView=accept", () => {
    render(<InviteActions invitationId="inv-1" initialView="accept" />);

    expect(screen.getByTestId("invite-accept")).toBeInTheDocument();
  });

  it("respects initialView=reject", () => {
    render(<InviteActions invitationId="inv-1" initialView="reject" />);

    expect(screen.getByTestId("invite-reject")).toBeInTheDocument();
  });
});
