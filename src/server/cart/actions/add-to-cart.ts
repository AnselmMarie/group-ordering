"use server";

import { revalidatePath } from "next/cache";

import {
  UserFacingError,
  withActionResult,
} from "@/lib/server/action-result";
import { createCart } from "@/server/cart/repository/create-cart";
import { getActiveCartIdByUser } from "@/server/cart/repository/get-active-cart-id-by-user";
import { getCartItem } from "@/server/cart/repository/get-cart-item";
import { updateCartItem } from "@/server/cart/repository/update-cart-item";
import { createCartItem } from "@/server/cart/repository/create-cart-item";
import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { getProductById } from "@/server/product/repository/get-product-by-id";

const addToCartImpl = async (productId: string): Promise<void> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new UserFacingError(
      "We couldn't load your session. Please refresh the page. If the issue continues, clear your Better Auth cookies and try again.",
    );
  }

  const existingCartId = await getActiveCartIdByUser(userId);
  const cartId = existingCartId ?? (await createCart(userId));

  if (!cartId) {
    throw new UserFacingError("We couldn't open your cart. Please try again.");
  }

  const existingItem = await getCartItem({ cartId, productId, userId });

  if (existingItem) {
    await updateCartItem({ cartId, productId, userId });
  } else {
    const product = await getProductById(productId);

    if (!product) {
      throw new UserFacingError("This product is no longer available.");
    }

    await createCartItem({
      cartId,
      productId,
      userId,
      price: product.price,
    });
  }

  revalidatePath("/");
};

export const addToCart = withActionResult("addToCart", addToCartImpl);
