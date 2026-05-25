"use server";

import { getInvitationById } from "@/server/invitations/repository/get-invitation-by-id";
import { updateInvitationStatus } from "@/server/invitations/repository/update-invitation-status";
import type { Invitation } from "@/server/invitations/types";

export async function rejectInvitation(id: string): Promise<Invitation> {
  const invitation = await getInvitationById(id);
  if (!invitation) {
    throw new Error("This invitation no longer exists.");
  }

  if (invitation.status !== "pending") {
    throw new Error(`This invitation has already been ${invitation.status}.`);
  }

  await updateInvitationStatus({ id, status: "rejected" });

  return {
    ...invitation,
    status: "rejected",
  };
}
