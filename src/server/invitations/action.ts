"use server";

import {
  createInvitationSchema,
  type CreateInvitationInput,
} from "@/features/invitations/schema";

import { getCurrentUserId } from "../auth/get-current-user-id";
import { findCartIdByUserId } from "../cart/repository/find-cart-id-by-user";

export async function createInvitation(input: CreateInvitationInput) {
  const parsed = createInvitationSchema.parse(input);

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("User is not found");
  }

  const existingCartId = await findCartIdByUserId(userId);
}
