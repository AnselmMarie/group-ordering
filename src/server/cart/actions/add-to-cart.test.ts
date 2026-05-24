import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/server/auth";
import { createCart } from "@/server/cart/repository/create-cart";
import { findCartIdByUserId } from "@/server/cart/repository/find-cart-id-by-user";
import { findCartItem } from "@/server/cart/repository/find-cart-item";
import { incrementCartItem } from "@/server/cart/repository/increment-cart-item";
import { insertCartItem } from "@/server/cart/repository/insert-cart-item";
import {
  MOCK_CART_ID,
  MOCK_CART_ITEM_ID,
  MOCK_PRODUCT_ID,
  MOCK_USER_ID,
} from "@/server/cart/mock-data/ids";
import { createMockSession } from "@/server/cart/mock-data/session";
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
vi.mock("@/server/cart/repository/find-cart-id-by-user", () => ({
  findCartIdByUserId: vi.fn(),
}));
vi.mock("@/server/cart/repository/find-cart-item", () => ({
  findCartItem: vi.fn(),
}));
vi.mock("@/server/cart/repository/increment-cart-item", () => ({
  incrementCartItem: vi.fn(),
}));
vi.mock("@/server/cart/repository/insert-cart-item", () => ({
  insertCartItem: vi.fn(),
}));

const mockedGetSession = vi.mocked(auth.api.getSession);
const mockedCreateCart = vi.mocked(createCart);
const mockedFindCartIdByUserId = vi.mocked(findCartIdByUserId);
const mockedFindCartItem = vi.mocked(findCartItem);
const mockedIncrementCartItem = vi.mocked(incrementCartItem);
const mockedInsertCartItem = vi.mocked(insertCartItem);
const mockedRevalidatePath = vi.mocked(revalidatePath);

describe("addToCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when there is no session", async () => {
    mockedGetSession.mockResolvedValue(null);

    await expect(addToCart(MOCK_PRODUCT_ID)).rejects.toThrow(
      "User is not found",
    );
    expect(mockedFindCartIdByUserId).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });

  it("creates a new cart when none exists, then inserts the item", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedFindCartIdByUserId.mockResolvedValue(null);
    mockedCreateCart.mockResolvedValue(MOCK_CART_ID);
    mockedFindCartItem.mockResolvedValue(null);

    await addToCart(MOCK_PRODUCT_ID);

    expect(mockedCreateCart).toHaveBeenCalledWith(MOCK_USER_ID);
    expect(mockedInsertCartItem).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      productId: MOCK_PRODUCT_ID,
      userId: MOCK_USER_ID,
      price: "10.22",
    });
    expect(mockedIncrementCartItem).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("throws when cart creation fails", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedFindCartIdByUserId.mockResolvedValue(null);
    mockedCreateCart.mockResolvedValue(undefined);

    await expect(addToCart(MOCK_PRODUCT_ID)).rejects.toThrow(
      "Failed to get or create cart",
    );
    expect(mockedFindCartItem).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });

  it("increments quantity when the item already exists", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedFindCartIdByUserId.mockResolvedValue(MOCK_CART_ID);
    mockedFindCartItem.mockResolvedValue({ id: MOCK_CART_ITEM_ID });

    await addToCart(MOCK_PRODUCT_ID);

    expect(mockedCreateCart).not.toHaveBeenCalled();
    expect(mockedIncrementCartItem).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      productId: MOCK_PRODUCT_ID,
      userId: MOCK_USER_ID,
    });
    expect(mockedInsertCartItem).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("inserts a new item when the cart exists but the item does not", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedFindCartIdByUserId.mockResolvedValue(MOCK_CART_ID);
    mockedFindCartItem.mockResolvedValue(null);

    await addToCart(MOCK_PRODUCT_ID);

    expect(mockedInsertCartItem).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      productId: MOCK_PRODUCT_ID,
      userId: MOCK_USER_ID,
      price: "10.22",
    });
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("propagates repository errors and skips revalidation", async () => {
    mockedGetSession.mockResolvedValue(createMockSession());
    mockedFindCartIdByUserId.mockResolvedValue(MOCK_CART_ID);
    mockedFindCartItem.mockResolvedValue(null);
    mockedInsertCartItem.mockRejectedValue(new Error("insert failed"));

    await expect(addToCart(MOCK_PRODUCT_ID)).rejects.toThrow("insert failed");
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });
});
