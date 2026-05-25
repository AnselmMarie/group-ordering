"use server";

import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { upsertActiveParticipant } from "@/server/cart/repository/upsert-active-participant";
import { db } from "@/server/db";
import { getInvitationById } from "@/server/invitations/repository/get-invitation-by-id";
import { updateInvitationStatus } from "@/server/invitations/repository/update-invitation-status";
import type { Invitation } from "@/server/invitations/types";

interface AcceptInvitationInput {
  id: string;
  email: string;
}

export async function acceptInvitation({
  id,
  email,
}: AcceptInvitationInput): Promise<Invitation> {
  const invitation = await getInvitationById(id);
  if (!invitation) {
    throw new Error("This invitation no longer exists.");
  }

  if (invitation.status !== "pending") {
    throw new Error(`This invitation has already been ${invitation.status}.`);
  }

  if (invitation.invitedEmail.toLowerCase() !== email.trim().toLowerCase()) {
    throw new Error("That email doesn't match this invitation.");
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("We couldn't load your session. Please refresh and try again.");
  }

  await db.transaction(async (tx) => {
    await updateInvitationStatus(
      { id, status: "accepted", acceptedByUserId: userId },
      tx,
    );

    await upsertActiveParticipant(tx, {
      cartId: invitation.cartId,
      userId,
      role: "editor",
    });
  });

  return {
    ...invitation,
    status: "accepted",
    acceptedByUserId: userId,
  };
}
