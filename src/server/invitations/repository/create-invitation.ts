import { revalidatePath } from "next/cache";

import { UserFacingError } from "@/lib/server/action-result";
import { db } from "@/server/db";
import { cartInvitation } from "@/server/db/schema";
import { MAX_ACTIVE_INVITES } from "@/server/invitations/constants";
import { getCountActiveInvitations } from "@/server/invitations/repository/get-count-active-invitations";
import type { Invitation, InvitationStatus } from "@/server/invitations/types";

interface CreateInvitationParams {
  cartId: string;
  email: string;
}

export const createInvitation = async ({
  cartId,
  email,
}: CreateInvitationParams): Promise<Invitation> => {
  const row = await db.transaction(async (tx) => {
    const activeCount = await getCountActiveInvitations(cartId, tx);
    if (activeCount >= MAX_ACTIVE_INVITES) {
      throw new UserFacingError(
        `Invite limit reached. You can have at most ${MAX_ACTIVE_INVITES} active invites.`,
      );
    }

    const [inserted] = await tx
      .insert(cartInvitation)
      .values({ cartId, invitedEmail: email })
      .returning();

    return inserted;
  });

  if (!row) {
    throw new Error("Failed to create invitation.");
  }

  // @todo: enhancement to just revalidate the invite server calls
  revalidatePath("/");

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
