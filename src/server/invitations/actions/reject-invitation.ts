"use server";

import {
  UserFacingError,
  withActionResult,
} from "@/lib/server/action-result";
import { getInvitationById } from "@/server/invitations/repository/get-invitation-by-id";
import { updateInvitationStatus } from "@/server/invitations/repository/update-invitation-status";
import type { Invitation } from "@/server/invitations/types";

async function rejectInvitationImpl(id: string): Promise<Invitation> {
  const invitation = await getInvitationById(id);
  if (!invitation) {
    throw new UserFacingError("This invitation no longer exists.");
  }

  if (invitation.status !== "pending") {
    throw new UserFacingError(
      `This invitation has already been ${invitation.status}.`,
    );
  }

  await updateInvitationStatus({ id, status: "rejected" });

  return {
    ...invitation,
    status: "rejected",
  };
}

export const rejectInvitation = withActionResult(
  "rejectInvitation",
  rejectInvitationImpl,
);
