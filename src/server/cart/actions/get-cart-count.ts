"use server";

import { countCartItems } from "@/server/cart/repository/count-cart-items";
import { findCartIdByUserId } from "@/server/cart/repository/find-cart-id-by-user";
import { getCurrentUserId } from "@/server/auth/get-current-user-id";

export const getCartCount = async (): Promise<number> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return 0;
  }

  const cartId = await findCartIdByUserId(userId);
  if (!cartId) {
    return 0;
  }

  return countCartItems(cartId);
};
