import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createMockProduct } from "@/server/product/mock-data/mock-product";

import { ProductCard } from "./product-card";

vi.mock("@/features/cart/components/add-to-cart-button", () => ({
  AddToCartButton: ({ productId }: { productId: string }) => (
    <button type="button" data-testid="add-to-cart">
      add:{productId}
    </button>
  ),
}));

describe("ProductCard", () => {
  it("renders the product title and formatted price", () => {
    const product = createMockProduct({
      id: "p-1",
      title: "Latte",
      price: 1234,
    });

    render(<ProductCard product={product} />);

    expect(screen.getByText("Latte")).toBeInTheDocument();
    expect(screen.getByText("$12.34")).toBeInTheDocument();
  });

  it("renders the product image with its title as alt text when an image is provided", () => {
    const product = createMockProduct({
      title: "Mocha",
      image: "https://cdn.example.com/mocha.jpg",
    });

    render(<ProductCard product={product} />);

    const image = screen.getByAltText("Mocha") as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.tagName).toBe("IMG");
    expect(image.src).toContain("mocha.jpg");
  });

  it("does not render an image when product.image is null", () => {
    const product = createMockProduct({
      title: "Drip Coffee",
      image: null,
    });

    render(<ProductCard product={product} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Drip Coffee")).not.toBeInTheDocument();
  });

  it("renders an AddToCartButton wired to the product id", () => {
    const product = createMockProduct({ id: "p-42" });

    render(<ProductCard product={product} />);

    expect(screen.getByTestId("add-to-cart")).toHaveTextContent("add:p-42");
  });
});
