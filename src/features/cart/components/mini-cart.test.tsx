import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MiniCart } from "./mini-cart";

describe("MiniCart", () => {
  it("renders the trigger without a count badge when initialCount is 0", () => {
    render(<MiniCart initialCount={0} summary={<div>summary</div>} />);

    expect(
      screen.getByRole("button", { name: /open cart/i }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/items in cart/i)).not.toBeInTheDocument();
  });

  it("renders the item count badge when initialCount is greater than 0", () => {
    render(<MiniCart initialCount={3} summary={<div>summary</div>} />);

    expect(screen.getByLabelText("3 items in cart")).toBeInTheDocument();
  });

  it("opens the dialog and reveals the summary when the trigger is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MiniCart
        initialCount={1}
        summary={<div data-testid="summary-content">summary</div>}
      />,
    );

    expect(screen.queryByTestId("summary-content")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open cart/i }));

    expect(screen.getByTestId("summary-content")).toBeInTheDocument();
  });
});
