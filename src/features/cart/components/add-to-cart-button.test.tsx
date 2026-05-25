import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AddToCartButton } from "./add-to-cart-button";

const toastError = vi.fn();
const addToCartMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock("@/server/cart/actions/add-to-cart", () => ({
  addToCart: (...args: unknown[]) => addToCartMock(...args),
}));

describe("AddToCartButton", () => {
  beforeEach(() => {
    toastError.mockClear();
    addToCartMock.mockReset();
  });

  it("calls addToCart with the productId on click", async () => {
    addToCartMock.mockResolvedValue({ ok: true, data: undefined });
    const user = userEvent.setup();

    render(<AddToCartButton productId="prod-1" />);

    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(addToCartMock).toHaveBeenCalledWith("prod-1");
    expect(toastError).not.toHaveBeenCalled();
  });

  it("toasts the friendly error message when addToCart returns a failure", async () => {
    addToCartMock.mockResolvedValue({
      ok: false,
      error: "This product is no longer available.",
    });
    const user = userEvent.setup();

    render(<AddToCartButton productId="prod-1" />);

    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(toastError).toHaveBeenCalledWith(
      "This product is no longer available.",
    );
  });
});
