import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { cart } from "@/server/db/schema";

export const findCartIdByUserId = async (
  userId: string,
): Promise<string | null> => {
  const rows = await db
    .select({ id: cart.id })
    .from(cart)
    .where(eq(cart.hostUserId, userId))
    .limit(1);

  return rows[0]?.id ?? null;
};
