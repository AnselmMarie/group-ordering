export type InvitationStatus = "pending" | "accepted" | "rejected";

export interface Invitation {
  id: string;
  cartId: string;
  invitedEmail: string;
  status: InvitationStatus;
  acceptedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvitationPayload {
  cartId: string;
  email: string;
  inviterName: string;
}
