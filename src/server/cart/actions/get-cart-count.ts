"use server";

import { getCountCartItems } from "@/server/cart/repository/get-count-cart-items";
import { getActiveCartRole } from "@/server/cart/repository/get-active-cart-role";

export const getCartCount = async (): Promise<number> => {
  const ctx = await getActiveCartRole();
  if (!ctx) {
    return 0;
  }

  if (ctx.role === "editor") {
    return getCountCartItems(ctx.cartId, ctx.userId);
  }

  return getCountCartItems(ctx.cartId);
};
