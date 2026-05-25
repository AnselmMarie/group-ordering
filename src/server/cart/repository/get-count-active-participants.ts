import { and, eq, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { cartParticipant } from "@/server/db/schema";

export const getCountActiveParticipants = async (
  cartId: string,
): Promise<number> => {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cartParticipant)
    .where(
      and(
        eq(cartParticipant.cartId, cartId),
        eq(cartParticipant.status, "active"),
      ),
    );

  return rows[0]?.count ?? 0;
};
