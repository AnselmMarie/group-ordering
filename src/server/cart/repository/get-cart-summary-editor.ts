import { and, eq } from "drizzle-orm";

import type { CartSummaryItem } from "@/server/cart/repository/get-cart-summary";
import { db } from "@/server/db";
import { cartItem, product } from "@/server/db/schema";

export interface CartSummaryEditor {
  kind: "solo";
  items: CartSummaryItem[];
}

export const getCartSummaryEditor = async (
  cartId: string,
  userId: string,
): Promise<CartSummaryEditor> => {
  const items = await db
    .select({
      id: cartItem.id,
      productId: cartItem.productId,
      userId: cartItem.userId,
      quantity: cartItem.quantity,
      price: cartItem.price,
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      },
    })
    .from(cartItem)
    .innerJoin(product, eq(cartItem.productId, product.id))
    .where(and(eq(cartItem.cartId, cartId), eq(cartItem.userId, userId)));

  return { kind: "solo", items };
};
