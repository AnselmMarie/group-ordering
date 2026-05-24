import { and, eq, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { cartItem } from "@/server/db/schema";

interface IncrementCartItemParams {
  cartId: string;
  productId: string;
  userId: string;
}

export const incrementCartItem = async ({
  cartId,
  productId,
  userId,
}: IncrementCartItemParams): Promise<void> => {
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
