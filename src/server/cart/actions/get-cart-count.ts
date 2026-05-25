"use server";

import { countCartItems } from "@/server/cart/repository/count-cart-items";
import { findActiveCartRole } from "@/server/cart/repository/find-active-cart-role";

export const getCartCount = async (): Promise<number> => {
  const ctx = await findActiveCartRole();
  if (!ctx) {
    return 0;
  }

  if (ctx.role === "editor") {
    return countCartItems(ctx.cartId, ctx.userId);
  }

  return countCartItems(ctx.cartId);
};
