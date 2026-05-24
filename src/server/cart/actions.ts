"use server";

import { revalidatePath } from "next/cache";

import { getCartId, getOrCreateCartId } from "./cart-id";
import { addLine, countItems } from "./repository";

export const addToCart = async (productId: string): Promise<number> => {
  const cartId = await getOrCreateCartId();
  addLine(cartId, productId);
  revalidatePath("/");
  return countItems(cartId);
};

export const getCartCount = async (): Promise<number> => {
  const cartId = await getCartId();
  if (!cartId) {
    return 0;
  }
  return countItems(cartId);
};
