import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { cartInvitation } from "@/server/db/schema";
import type { Invitation, InvitationStatus } from "@/server/invitations/types";

export const getInvitationById = async (
  id: string,
): Promise<Invitation | null> => {
  const rows = await db
    .select()
    .from(cartInvitation)
    .where(eq(cartInvitation.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    cartId: row.cartId,
    invitedEmail: row.invitedEmail,
    status: row.status as InvitationStatus,
    acceptedByUserId: row.acceptedByUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};
