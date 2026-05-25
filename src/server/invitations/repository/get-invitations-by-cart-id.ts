import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { cartInvitation } from "@/server/db/schema";
import type { InvitationStatus } from "@/server/invitations/types";
import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { findActiveCartIdByUser } from "@/server/cart/repository/find-active-cart-id-by-user";

export interface InvitationItem {
  id: string;
  cartId: string;
  invitedEmail: string;
  status: InvitationStatus;
}

export const getInvitationsByCartId = async (): Promise<
  InvitationItem[] | null
> => {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const existingCartId = await findActiveCartIdByUser(userId);

  if (!existingCartId) {
    return null;
  }

  const rows = await db
    .select({
      id: cartInvitation.id,
      cartId: cartInvitation.cartId,
      invitedEmail: cartInvitation.invitedEmail,
      status: cartInvitation.status,
    })
    .from(cartInvitation)
    .where(eq(cartInvitation.cartId, existingCartId));

  const row = rows[0];
  if (!row) {
    return null;
  }

  return rows.map((r) => ({
    ...r,
    status: r.status as InvitationStatus,
  }));
};
