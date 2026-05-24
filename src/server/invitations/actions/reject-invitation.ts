"use server";

import { findInvitationById } from "@/server/invitations/repository/find-invitation-by-id";
import { updateInvitationStatus } from "@/server/invitations/repository/update-invitation-status";
import type { Invitation } from "@/server/invitations/types";

export async function rejectInvitation(id: string): Promise<Invitation> {
  const invitation = await findInvitationById(id);
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
