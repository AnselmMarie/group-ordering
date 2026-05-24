import { db } from "@/server/db";
import { cart } from "@/server/db/schema";

export const createCart = async (
  hostUserId: string,
): Promise<string | undefined> => {
  const inserted = await db
    .insert(cart)
    .values({ hostUserId })
    .returning();

  return inserted[0]?.id;
};
