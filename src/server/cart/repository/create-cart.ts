import { db } from "@/server/db";
import { cart } from "@/server/db/schema";

import { upsertActiveParticipant } from "./upsert-active-participant";

export const createCart = async (
  hostUserId: string,
): Promise<string | undefined> => {
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(cart)
      .values({ hostUserId })
      .returning();

    const cartId = inserted[0]?.id;
    if (!cartId) return undefined;

    await upsertActiveParticipant(tx, {
      cartId,
      userId: hostUserId,
      role: "owner",
    });

    return cartId;
  });
};
