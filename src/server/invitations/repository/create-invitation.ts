import { db } from "@/server/db";
import { cartInvitation } from "@/server/db/schema";
import type { Invitation, InvitationStatus } from "@/server/invitations/types";

interface CreateInvitationParams {
  cartId: string;
  email: string;
}

export const createInvitation = async ({
  cartId,
  email,
}: CreateInvitationParams): Promise<Invitation> => {
  const [row] = await db
    .insert(cartInvitation)
    .values({ cartId, invitedEmail: email })
    .returning();

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
