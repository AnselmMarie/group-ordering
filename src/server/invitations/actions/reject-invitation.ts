"use server";

import { getInvitationById } from "@/server/invitations/repository/get-invitation-by-id";
import { updateInvitationStatus } from "@/server/invitations/repository/update-invitation-status";
import type { Invitation } from "@/server/invitations/types";

export async function rejectInvitation(id: string): Promise<Invitation> {
  const invitation = await getInvitationById(id);
  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "pending") {
    throw new Error(`Invitation already ${invitation.status}`);
  }

  await updateInvitationStatus({ id, status: "rejected" });

  return {
    ...invitation,
    status: "rejected",
  };
}
