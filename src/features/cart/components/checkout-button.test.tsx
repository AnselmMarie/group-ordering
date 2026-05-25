import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutButton } from "./checkout-button";

const toastMock = vi.fn();

vi.mock("sonner", () => ({
  toast: (...args: unknown[]) => toastMock(...args),
}));

describe("CheckoutButton", () => {
  beforeEach(() => {
    toastMock.mockClear();
  });

  it("invokes toast with a message when clicked", async () => {
    const user = userEvent.setup();

    render(<CheckoutButton />);

    await user.click(screen.getByRole("button", { name: /checkout/i }));

    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith(expect.any(String));
    expect(toastMock.mock.calls[0][0]).toBeTruthy();
  });
});
