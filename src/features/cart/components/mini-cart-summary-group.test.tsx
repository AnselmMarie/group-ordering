import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MiniCartSummaryGroup } from "./mini-cart-summary-group";

import type { CartSummaryItem } from "@/server/cart/repository/get-cart-summary-view";

const buildItem = (
  overrides: Partial<{
    id: string;
    price: number;
    quantity: number;
    title: string;
  }> = {},
): CartSummaryItem => ({
  id: overrides.id ?? "item-1",
  productId: "prod-1",
  userId: "user-1",
  price: overrides.price ?? 500,
  quantity: overrides.quantity ?? 2,
  product: {
    id: "prod-1",
    title: overrides.title ?? "Burger",
    price: overrides.price ?? 500,
    image: null,
  },
});

describe("MiniCartSummaryGroup", () => {
  it("renders the Owner badge and hides the invited email for the owner role", () => {
    render(
      <MiniCartSummaryGroup
        userId="u1"
        invitedEmail="owner@example.com"
        role="owner"
        items={[buildItem()]}
        subtotal={1000}
      />,
    );

    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.queryByText("owner@example.com")).not.toBeInTheDocument();
  });

  it("renders the invited email for the editor role and the items + subtotal", () => {
    render(
      <MiniCartSummaryGroup
        userId="u2"
        invitedEmail="guest@example.com"
        role="editor"
        items={[
          buildItem({ id: "a", title: "Burger", price: 500, quantity: 2 }),
          buildItem({ id: "b", title: "Fries", price: 250, quantity: 1 }),
        ]}
        subtotal={1250}
      />,
    );

    expect(screen.getByText("guest@example.com")).toBeInTheDocument();
    expect(screen.getByText("Burger")).toBeInTheDocument();
    expect(screen.getByText("Fries")).toBeInTheDocument();
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
    expect(screen.getByText("$12.50")).toBeInTheDocument();
  });

  it("renders the empty-state message and no subtotal row when items is empty", () => {
    render(
      <MiniCartSummaryGroup
        userId="u3"
        invitedEmail="empty@example.com"
        role="editor"
        items={[]}
        subtotal={0}
      />,
    );

    expect(screen.getByText(/hasn't added any items yet/i)).toBeInTheDocument();
    expect(screen.queryByText("Subtotal")).not.toBeInTheDocument();
  });
});
