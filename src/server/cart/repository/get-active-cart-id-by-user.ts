import { and, eq } from "drizzle-orm";

import { db } from "@/server/db";
import { cartParticipant } from "@/server/db/schema";

export const getActiveCartIdByUser = async (
  userId: string,
): Promise<string | null> => {
  const rows = await db
    .select({ cartId: cartParticipant.cartId })
    .from(cartParticipant)
    .where(
      and(
        eq(cartParticipant.userId, userId),
        eq(cartParticipant.status, "active"),
      ),
    )
    .limit(1);

  return rows[0]?.cartId ?? null;
};
