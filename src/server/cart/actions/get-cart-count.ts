"use server";

import { headers } from "next/headers";

import { auth } from "@/server/auth";
import { countCartItems } from "@/server/cart/repository/count-cart-items";
import { findCartIdByUserId } from "@/server/cart/repository/find-cart-id-by-user";

export const getCartCount = async (): Promise<number> => {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id;

  if (!userId) {
    return 0;
  }

  const cartId = await findCartIdByUserId(userId);
  if (!cartId) {
    return 0;
  }

  return countCartItems(cartId);
};
