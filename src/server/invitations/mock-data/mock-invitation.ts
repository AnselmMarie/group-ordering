import { MOCK_CART_ID } from "@/server/cart/mock-data/ids";
import {
  MOCK_INVITATION_ID,
  MOCK_INVITED_EMAIL,
} from "@/server/invitations/mock-data/ids";
import type { Invitation } from "@/server/invitations/types";

export const buildMockInvitation = (
  overrides: Partial<Invitation> = {},
): Invitation => ({
  id: MOCK_INVITATION_ID,
  cartId: MOCK_CART_ID,
  invitedEmail: MOCK_INVITED_EMAIL,
  status: "pending",
  acceptedByUserId: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});
