import { and, eq } from "drizzle-orm";

import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { getActiveCartIdByUser } from "@/server/cart/repository/get-active-cart-id-by-user";
import type { CartParticipantRole } from "@/server/cart/types";
import { db } from "@/server/db";
import { cartParticipant } from "@/server/db/schema";

export interface ActiveCartRole {
  cartId: string;
  userId: string;
  role: CartParticipantRole;
}

export const getActiveCartRole = async (): Promise<ActiveCartRole | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const cartId = await getActiveCartIdByUser(userId);
  if (!cartId) {
    return null;
  }

  const rows = await db
    .select({ role: cartParticipant.role })
    .from(cartParticipant)
    .where(
      and(
        eq(cartParticipant.cartId, cartId),
        eq(cartParticipant.userId, userId),
        eq(cartParticipant.status, "active"),
      ),
    )
    .limit(1);

  const role = rows[0]?.role;
  if (role === "owner" || role === "editor") {
    return { cartId, userId, role };
  }
  return null;
};
