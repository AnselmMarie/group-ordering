import { and, eq, inArray, sql } from "drizzle-orm";

import { db, type TxOrDb } from "@/server/db";
import { cartInvitation } from "@/server/db/schema";

export const countActiveInvitations = async (
  cartId: string,
  tx: TxOrDb = db,
): Promise<number> => {
  const rows = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(cartInvitation)
    .where(
      and(
        eq(cartInvitation.cartId, cartId),
        inArray(cartInvitation.status, ["pending", "accepted"]),
      ),
    );

  return rows[0]?.count ?? 0;
};
