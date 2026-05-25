"use server";

import {
  UserFacingError,
  withActionResult,
} from "@/lib/server/action-result";
import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { createActiveParticipant } from "@/server/cart/repository/create-active-participant";
import { db } from "@/server/db";
import { getInvitationById } from "@/server/invitations/repository/get-invitation-by-id";
import { updateInvitationStatus } from "@/server/invitations/repository/update-invitation-status";
import type { Invitation } from "@/server/invitations/types";

interface AcceptInvitationInput {
  id: string;
  email: string;
}

async function acceptInvitationImpl({
  id,
  email,
}: AcceptInvitationInput): Promise<Invitation> {
  const invitation = await getInvitationById(id);
  if (!invitation) {
    throw new UserFacingError("This invitation no longer exists.");
  }

  if (invitation.status !== "pending") {
    throw new UserFacingError(
      `This invitation has already been ${invitation.status}.`,
    );
  }

  if (invitation.invitedEmail.toLowerCase() !== email.trim().toLowerCase()) {
    throw new UserFacingError("That email doesn't match this invitation.");
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new UserFacingError(
      "We couldn't load your session. Please refresh the page. If the issue continues, clear your Better Auth cookies and try again.",
    );
  }

  await db.transaction(async (tx) => {
    await updateInvitationStatus(
      { id, status: "accepted", acceptedByUserId: userId },
      tx,
    );

    await createActiveParticipant(tx, {
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

export const acceptInvitation = withActionResult(
  "acceptInvitation",
  acceptInvitationImpl,
);
