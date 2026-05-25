import { and, eq, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { cartItem } from "@/server/db/schema";

interface UpdateCartItemParams {
  cartId: string;
  productId: string;
  userId: string;
}

export const updateCartItem = async ({
  cartId,
  productId,
  userId,
}: UpdateCartItemParams): Promise<void> => {
  await db
    .update(cartItem)
    .set({ quantity: sql`${cartItem.quantity} + 1` })
    .where(
      and(
        eq(cartItem.cartId, cartId),
        eq(cartItem.productId, productId),
        eq(cartItem.userId, userId),
      ),
    );
};
