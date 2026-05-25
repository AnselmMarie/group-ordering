import { and, eq } from "drizzle-orm";

import type { TxOrDb } from "@/server/db";
import { cartParticipant } from "@/server/db/schema";
import type { CartParticipantRole } from "@/server/cart/types";

interface UpsertActiveParticipantInput {
  cartId: string;
  userId: string;
  role: CartParticipantRole;
}

export const upsertActiveParticipant = async (
  tx: TxOrDb,
  { cartId, userId, role }: UpsertActiveParticipantInput,
): Promise<void> => {
  await tx
    .update(cartParticipant)
    .set({ status: "inactive" })
    .where(
      and(
        eq(cartParticipant.userId, userId),
        eq(cartParticipant.status, "active"),
      ),
    );

  await tx
    .insert(cartParticipant)
    .values({ cartId, userId, role, status: "active" })
    .onConflictDoUpdate({
      target: [cartParticipant.cartId, cartParticipant.userId],
      set: { status: "active", role },
    });
};
