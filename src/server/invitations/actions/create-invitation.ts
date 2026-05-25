"use server";

import { createElement } from "react";

import {
  createInvitationSchema,
  type CreateInvitationInput,
} from "@/features/invitations/schema";
import { getAppUrl } from "@/lib/env";
import { getActiveCartIdByUser } from "@/server/cart/repository/get-active-cart-id-by-user";
import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { getLogoUrl } from "@/server/email/email-assets";
import { sendEmail } from "@/server/email/send-email";
import InvitationEmail from "@/server/email/templates/invitation-email";
import { createInvitation as createInvitationRow } from "@/server/invitations/repository/create-invitation";
import type { Invitation } from "@/server/invitations/types";

const INVITATION_SUBJECT = "You're invited to a group order";
const INVITATION_DESCRIPTION =
  "invited you to join their group order. Accept to start adding items, or reject if you're not interested.";

export async function createInvitation(
  input: CreateInvitationInput,
): Promise<Invitation> {
  const parsed = createInvitationSchema.parse(input);

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error(
      "We couldn't load your session. Please refresh and try again.",
    );
  }

  const cartId = await getActiveCartIdByUser(userId);
  if (!cartId) {
    throw new Error(
      "We couldn't find your cart. Please refresh and try again.",
    );
  }

  const invitation = await createInvitationRow({
    cartId,
    email: parsed.email,
  });

  const appUrl = getAppUrl();
  if (!appUrl) {
    console.error("createInvitation - APP_URL is not set, skipping email");
    return invitation;
  }

  const acceptLink = `${appUrl}/invite/${invitation.id}?action=accept`;
  const rejectLink = `${appUrl}/invite/${invitation.id}?action=reject`;

  await sendEmail({
    to: parsed.email,
    subject: INVITATION_SUBJECT,
    react: createElement(InvitationEmail, {
      inviterName: parsed.name,
      subject: INVITATION_SUBJECT,
      description: INVITATION_DESCRIPTION,
      acceptLink,
      rejectLink,
      logoUrl: getLogoUrl(),
    }),
  });

  return invitation;
}
