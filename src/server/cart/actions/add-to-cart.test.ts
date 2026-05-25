import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/server/auth";
import { createCart } from "@/server/cart/repository/create-cart";
import { getActiveCartIdByUser } from "@/server/cart/repository/get-active-cart-id-by-user";
import { getCartItem } from "@/server/cart/repository/get-cart-item";
import { updateCartItem } from "@/server/cart/repository/update-cart-item";
import { createCartItem } from "@/server/cart/repository/create-cart-item";
import {
  MOCK_CART_ID,
  MOCK_CART_ITEM_ID,
  MOCK_PRODUCT_ID,
  MOCK_USER_ID,
} from "@/server/cart/mock-data/ids";
import { createMockSession } from "@/server/cart/mock-data/session";
import { createMockProduct } from "@/server/product/mock-data/mock-product";
import { getProductById } from "@/server/product/repository/get-product-by-id";
import { revalidatePath } from "next/cache";

import { addToCart } from "./add-to-cart";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/server/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));
vi.mock("@/server/cart/repository/create-cart", () => ({
  createCart: vi.fn(),
}));
vi.mock("@/server/cart/repository/get-active-cart-id-by-user", () => ({
  getActiveCartIdByUser: vi.fn(),
}));
vi.mock("@/server/cart/repository/get-cart-item", () => ({
  getCartItem: vi.fn(),
}));
vi.mock("@/server/cart/repository/update-cart-item", () => ({
  updateCartItem: vi.fn(),
}));
vi.mock("@/server/cart/repository/create-cart-item", () => ({
  createCartItem: vi.fn(),
}));
vi.mock("@/server/product/repository/get-product-by-id", () => ({
  getProductById: vi.fn(),
}));

const mockedGetSession = vi.mocked(auth.api.getSession);
const mockedCreateCart = vi.mocked(createCart);
const mockedgetActiveCartIdByUser = vi.mocked(getActiveCartIdByUser);
const mockedgetCartItem = vi.mocked(getCartItem);
const mockedupdateCartItem = vi.mocked(updateCartItem);
const mockedcreateCartItem = vi.mocked(createCartItem);
const mockedgetProductById = vi.mocked(getProductById);
const mockedRevalidatePath = vi.mocked(revalidatePath);

describe("addToCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns failure when there is no session", async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await addToCart(MOCK_PRODUCT_ID);

    expect(result).toEqual({
      ok: false,
      error:
        "We couldn't load your session. Please refresh the page. If the issue continues, clear your Better Auth cookies and try again.",
    });
    expect(mockedgetActiveCartIdByUser).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });

  it("creates a new cart when none exists, then inserts the item", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedgetActiveCartIdByUser.mockResolvedValue(null);
    mockedCreateCart.mockResolvedValue(MOCK_CART_ID);
    mockedgetCartItem.mockResolvedValue(null);
    mockedgetProductById.mockResolvedValue(createMockProduct());

    await addToCart(MOCK_PRODUCT_ID);

    expect(mockedCreateCart).toHaveBeenCalledWith(MOCK_USER_ID);
    expect(mockedcreateCartItem).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      productId: MOCK_PRODUCT_ID,
      userId: MOCK_USER_ID,
      price: 1022,
    });
    expect(mockedupdateCartItem).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("returns failure when cart creation fails", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedgetActiveCartIdByUser.mockResolvedValue(null);
    mockedCreateCart.mockResolvedValue(undefined);

    const result = await addToCart(MOCK_PRODUCT_ID);

    expect(result).toEqual({
      ok: false,
      error: "We couldn't open your cart. Please try again.",
    });
    expect(mockedgetCartItem).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });

  it("increments quantity when the item already exists", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedgetCartItem.mockResolvedValue({ id: MOCK_CART_ITEM_ID });

    await addToCart(MOCK_PRODUCT_ID);

    expect(mockedCreateCart).not.toHaveBeenCalled();
    expect(mockedupdateCartItem).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      productId: MOCK_PRODUCT_ID,
      userId: MOCK_USER_ID,
    });
    expect(mockedcreateCartItem).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("inserts a new item when the cart exists but the item does not", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedgetCartItem.mockResolvedValue(null);
    mockedgetProductById.mockResolvedValue(createMockProduct({ price: 1022 }));

    await addToCart(MOCK_PRODUCT_ID);

    expect(mockedgetProductById).toHaveBeenCalledWith(MOCK_PRODUCT_ID);
    expect(mockedcreateCartItem).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      productId: MOCK_PRODUCT_ID,
      userId: MOCK_USER_ID,
      price: 1022,
    });
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("returns failure when the product is not found", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedgetCartItem.mockResolvedValue(null);
    mockedgetProductById.mockResolvedValue(null);

    const result = await addToCart(MOCK_PRODUCT_ID);

    expect(result).toEqual({
      ok: false,
      error: "This product is no longer available.",
    });
    expect(mockedcreateCartItem).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns failure when a repository call throws and skips revalidation", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedgetActiveCartIdByUser.mockResolvedValue(MOCK_CART_ID);
    mockedgetCartItem.mockResolvedValue(null);
    mockedgetProductById.mockResolvedValue(createMockProduct());
    mockedcreateCartItem.mockRejectedValue(new Error("insert failed"));

    const result = await addToCart(MOCK_PRODUCT_ID);

    expect(result).toEqual({ ok: false, error: "Something went wrong" });
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });
});
