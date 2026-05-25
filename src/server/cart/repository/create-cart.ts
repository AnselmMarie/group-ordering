import { db } from "@/server/db";
import { cart } from "@/server/db/schema";

import { createActiveParticipant } from "./create-active-participant";

export const createCart = async (
  userId: string,
): Promise<string | undefined> => {
  return db.transaction(async (tx) => {
    const inserted = await tx.insert(cart).values({ userId }).returning();

    const cartId = inserted[0]?.id;
    if (!cartId) return undefined;

    await createActiveParticipant(tx, {
      cartId,
      userId,
      role: "owner",
    });

    return cartId;
  });
};
