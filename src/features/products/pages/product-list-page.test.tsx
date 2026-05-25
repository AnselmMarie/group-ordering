import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCartCount } from "@/server/cart/actions/get-cart-count";
import { findActiveCartRole } from "@/server/cart/repository/find-active-cart-role";
import { createMockProduct } from "@/server/product/mock-data/mock-product";
import { productFindAll } from "@/server/product/repository/product-find-all";

import ProductListPage from "./product-list-page";

vi.mock("@/server/cart/actions/get-cart-count", () => ({
  getCartCount: vi.fn(),
}));
vi.mock("@/server/cart/repository/find-active-cart-role", () => ({
  findActiveCartRole: vi.fn(),
}));
vi.mock("@/server/product/repository/product-find-all", () => ({
  productFindAll: vi.fn(),
}));

vi.mock("@/features/cart/components/mini-cart", () => ({
  MiniCart: ({ initialCount }: { initialCount: number }) => (
    <div data-testid="mini-cart">cart-count:{initialCount}</div>
  ),
}));
vi.mock("@/features/cart/components/mini-cart-summary", () => ({
  MiniCartSummary: () => <div data-testid="mini-cart-summary" />,
}));
vi.mock("@/features/invitations/components/invitation-status", () => ({
  InvitationStatus: () => <div data-testid="invitation-status" />,
}));
vi.mock("@/features/invitations/components/group-order", () => ({
  GroupOrder: () => <div data-testid="group-order" />,
}));
vi.mock("@/features/products/components/product-card", () => ({
  ProductCard: ({ product }: { product: { id: string; title: string } }) => (
    <div data-testid="product-card">{product.title}</div>
  ),
}));
vi.mock("@/ui/components/header", () => ({
  Header: ({
    groupOrder,
    miniCart,
  }: {
    groupOrder: React.ReactNode;
    miniCart: React.ReactNode;
  }) => (
    <header>
      <div data-testid="header-group-order">{groupOrder}</div>
      <div data-testid="header-mini-cart">{miniCart}</div>
    </header>
  ),
}));
vi.mock("@/ui/components/layout/page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/ui/components/layout/body", () => ({
  Body: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const mockedGetCartCount = vi.mocked(getCartCount);
const mockedFindActiveCartRole = vi.mocked(findActiveCartRole);
const mockedProductFindAll = vi.mocked(productFindAll);

const renderPage = async () => render(await ProductListPage());

describe("ProductListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders one ProductCard per product", async () => {
    mockedGetCartCount.mockResolvedValueOnce(0);
    mockedProductFindAll.mockResolvedValueOnce([
      createMockProduct({ id: "p-1", title: "Latte" }),
      createMockProduct({ id: "p-2", title: "Mocha" }),
      createMockProduct({ id: "p-3", title: "Drip" }),
    ]);
    mockedFindActiveCartRole.mockResolvedValueOnce(null);

    await renderPage();

    expect(screen.getAllByTestId("product-card")).toHaveLength(3);
    expect(screen.getByText("Latte")).toBeInTheDocument();
    expect(screen.getByText("Mocha")).toBeInTheDocument();
    expect(screen.getByText("Drip")).toBeInTheDocument();
  });

  it("forwards the cart count to MiniCart", async () => {
    mockedGetCartCount.mockResolvedValueOnce(7);
    mockedProductFindAll.mockResolvedValueOnce([]);
    mockedFindActiveCartRole.mockResolvedValueOnce(null);

    await renderPage();

    expect(screen.getByTestId("mini-cart")).toHaveTextContent("cart-count:7");
  });

  it("renders the GroupOrder slot when the user is the cart owner", async () => {
    mockedGetCartCount.mockResolvedValueOnce(0);
    mockedProductFindAll.mockResolvedValueOnce([]);
    mockedFindActiveCartRole.mockResolvedValueOnce({
      role: "owner",
      cartId: "cart-1",
      userId: "user-1",
    } as never);

    await renderPage();

    expect(screen.getByTestId("group-order")).toBeInTheDocument();
  });

  it("does not render the GroupOrder slot when the user is an editor", async () => {
    mockedGetCartCount.mockResolvedValueOnce(0);
    mockedProductFindAll.mockResolvedValueOnce([]);
    mockedFindActiveCartRole.mockResolvedValueOnce({
      role: "editor",
      cartId: "cart-1",
      userId: "user-2",
    } as never);

    await renderPage();

    expect(screen.queryByTestId("group-order")).not.toBeInTheDocument();
  });

  it("does not render the GroupOrder slot when there is no active cart role", async () => {
    mockedGetCartCount.mockResolvedValueOnce(0);
    mockedProductFindAll.mockResolvedValueOnce([]);
    mockedFindActiveCartRole.mockResolvedValueOnce(null);

    await renderPage();

    expect(screen.queryByTestId("group-order")).not.toBeInTheDocument();
  });
});
