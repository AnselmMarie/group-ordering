import { eq } from "drizzle-orm/sql/expressions/conditions";

import { getActiveCartIdByUser } from "@/server/cart/repository/get-active-cart-id-by-user";
import { db } from "@/server/db";
import { cartItem, product } from "@/server/db/schema";
import { getCurrentUserId } from "@/server/auth/get-current-user-id";

export interface CartSummaryItem {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    price: number;
    image: string | null;
  };
}

export const getCartSummary = async (): Promise<CartSummaryItem[] | null> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const existingCartId = await getActiveCartIdByUser(userId);

  if (!existingCartId) {
    return null;
  }

  const rows = await db
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
    .where(eq(cartItem.cartId, existingCartId));

  return rows;
};
