import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Header } from "./header";

describe("Header", () => {
  it("renders the brand text", () => {
    render(<Header groupOrder={<div />} cart={<div />} />);
    expect(screen.getByText("GroupOrder")).toBeInTheDocument();
  });

  it("renders the groupOrder slot", () => {
    render(
      <Header
        groupOrder={<div data-testid="group-order-slot" />}
        cart={<div />}
      />,
    );
    expect(screen.getByTestId("group-order-slot")).toBeInTheDocument();
  });

  it("renders the cart slot", () => {
    render(
      <Header
        groupOrder={<div />}
        cart={<div data-testid="cart-slot" />}
      />,
    );
    expect(screen.getByTestId("cart-slot")).toBeInTheDocument();
  });

  it("renders a <header> landmark", () => {
    render(<Header groupOrder={<div />} cart={<div />} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
