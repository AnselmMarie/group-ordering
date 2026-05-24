import { eq, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { cartItem } from "@/server/db/schema";

export const countCartItems = async (cartId: string): Promise<number> => {
  const rows = await db
    .select({
      total: sql<number>`COALESCE(SUM(${cartItem.quantity}), 0)::int`,
    })
    .from(cartItem)
    .where(eq(cartItem.cartId, cartId));

  return rows[0]?.total ?? 0;
};
