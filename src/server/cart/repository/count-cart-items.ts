import { and, eq, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { cartItem } from "@/server/db/schema";

export const countCartItems = async (
  cartId: string,
  userId?: string,
): Promise<number> => {
  const whereClause = userId
    ? and(eq(cartItem.cartId, cartId), eq(cartItem.userId, userId))
    : eq(cartItem.cartId, cartId);

  const rows = await db
    .select({
      total: sql<number>`COALESCE(SUM(${cartItem.quantity}), 0)::int`,
    })
    .from(cartItem)
    .where(whereClause);

  return rows[0]?.total ?? 0;
};
