import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Header } from "./header";

describe("Header", () => {
  it("renders the brand text", () => {
    render(<Header groupOrder={<div />} miniCart={<div />} />);
    expect(screen.getByText("Seafood Shack")).toBeInTheDocument();
  });

  it("renders the groupOrder slot", () => {
    render(
      <Header
        groupOrder={<div data-testid="group-order-slot" />}
        miniCart={<div />}
      />,
    );
    expect(screen.getByTestId("group-order-slot")).toBeInTheDocument();
  });

  it("renders the miniCart slot", () => {
    render(
      <Header
        groupOrder={<div />}
        miniCart={<div data-testid="mini-cart-slot" />}
      />,
    );
    expect(screen.getByTestId("mini-cart-slot")).toBeInTheDocument();
  });

  it("renders a <header> landmark", () => {
    render(<Header groupOrder={<div />} miniCart={<div />} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
