import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCartSummaryView } from "@/server/cart/repository/get-cart-summary-view";

import { MiniCartSummary } from "./mini-cart-summary";

vi.mock("@/server/cart/repository/get-cart-summary-view", () => ({
  getCartSummaryView: vi.fn(),
}));
vi.mock("./checkout-button", () => ({
  CheckoutButton: () => <button type="button">Checkout</button>,
}));

const mockedGetCartSummaryView = vi.mocked(getCartSummaryView);

const buildItem = (overrides: Partial<{
  id: string;
  price: number;
  quantity: number;
  title: string;
}> = {}) => ({
  id: overrides.id ?? "item-1",
  price: overrides.price ?? 500,
  quantity: overrides.quantity ?? 2,
  product: {
    id: "prod-1",
    title: overrides.title ?? "Burger",
    image: null,
  },
});

describe("MiniCartSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when the view is null", async () => {
    mockedGetCartSummaryView.mockResolvedValueOnce(null);

    render(await MiniCartSummary());

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("renders empty state when solo view has no items", async () => {
    mockedGetCartSummaryView.mockResolvedValueOnce({
      kind: "solo",
      items: [],
    } as never);

    render(await MiniCartSummary());

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("renders solo subtotal as the sum of price * quantity", async () => {
    mockedGetCartSummaryView.mockResolvedValueOnce({
      kind: "solo",
      items: [
        buildItem({ id: "a", price: 500, quantity: 2 }),
        buildItem({ id: "b", price: 250, quantity: 4 }),
      ],
    } as never);

    render(await MiniCartSummary());

    expect(screen.getByText("Subtotal")).toBeInTheDocument();
    expect(screen.getByText("$20.00")).toBeInTheDocument();
  });

  it("renders group grand total as the sum of group subtotals", async () => {
    mockedGetCartSummaryView.mockResolvedValueOnce({
      kind: "group",
      groups: [
        {
          userId: "u1",
          invitedEmail: null,
          role: "owner",
          items: [],
          subtotal: 1000,
        },
        {
          userId: "u2",
          invitedEmail: "guest@example.com",
          role: "editor",
          items: [],
          subtotal: 500,
        },
      ],
    } as never);

    render(await MiniCartSummary());

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("$15.00")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /checkout/i }),
    ).toBeInTheDocument();
  });
});
