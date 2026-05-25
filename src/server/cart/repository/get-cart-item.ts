import { and, eq } from "drizzle-orm";

import { db } from "@/server/db";
import { cartItem } from "@/server/db/schema";

interface GetCartItemParams {
  cartId: string;
  productId: string;
  userId: string;
}

export const getCartItem = async ({
  cartId,
  productId,
  userId,
}: GetCartItemParams): Promise<{ id: string } | null> => {
  const rows = await db
    .select({ id: cartItem.id })
    .from(cartItem)
    .where(
      and(
        eq(cartItem.cartId, cartId),
        eq(cartItem.productId, productId),
        eq(cartItem.userId, userId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
};
