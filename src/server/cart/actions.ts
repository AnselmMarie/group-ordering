"use server";

import { revalidatePath } from "next/cache";

import { getCartId, getOrCreateCartId } from "./cart-id";
import { addLine, countItems } from "./repository";

export async function addToCart(productId: string): Promise<number> {
  const cartId = await getOrCreateCartId();
  addLine(cartId, productId);
  revalidatePath("/");
  return countItems(cartId);
}

export async function getCartCount(): Promise<number> {
  const cartId = await getCartId();
  if (!cartId) {
    return 0;
  }
  return countItems(cartId);
}
