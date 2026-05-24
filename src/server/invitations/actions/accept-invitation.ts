"use server";

import { getCurrentUserId } from "@/server/auth/get-current-user-id";
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
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "pending") {
    throw new Error(`Invitation already ${invitation.status}`);
  }

  if (invitation.invitedEmail.toLowerCase() !== email.trim().toLowerCase()) {
    throw new Error("Email does not match the invitation");
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Session is not found");
  }

  await updateInvitationStatus({
    id,
    status: "accepted",
    acceptedByUserId: userId,
  });

  return {
    ...invitation,
    status: "accepted",
    acceptedByUserId: userId,
  };
}
