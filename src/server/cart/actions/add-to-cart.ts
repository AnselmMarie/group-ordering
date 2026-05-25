"use server";

import { revalidatePath } from "next/cache";

import { createCart } from "@/server/cart/repository/create-cart";
import { findActiveCartIdByUser } from "@/server/cart/repository/find-active-cart-id-by-user";
import { findCartItem } from "@/server/cart/repository/find-cart-item";
import { incrementCartItem } from "@/server/cart/repository/increment-cart-item";
import { insertCartItem } from "@/server/cart/repository/insert-cart-item";
import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { productFindById } from "@/server/product/repository/product-find-by-id";

export const addToCart = async (productId: string): Promise<void> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("We couldn't load your session. Please refresh and try again.");
  }

  const existingCartId = await findActiveCartIdByUser(userId);
  const cartId = existingCartId ?? (await createCart(userId));

  if (!cartId) {
    throw new Error("We couldn't open your cart. Please try again.");
  }

  const existingItem = await findCartItem({ cartId, productId, userId });

  if (existingItem) {
    await incrementCartItem({ cartId, productId, userId });
  } else {
    const product = await productFindById(productId);

    if (!product) {
      throw new Error("This product is no longer available.");
    }

    await insertCartItem({
      cartId,
      productId,
      userId,
      price: product.price,
    });
  }

  revalidatePath("/");
};
