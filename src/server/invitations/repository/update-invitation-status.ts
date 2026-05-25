import { eq } from "drizzle-orm";

import { db, type TxOrDb } from "@/server/db";
import { cartInvitation } from "@/server/db/schema";
import type { InvitationStatus } from "@/server/invitations/types";

interface UpdateInvitationStatusParams {
  id: string;
  status: InvitationStatus;
  acceptedByUserId?: string | null;
}

export const updateInvitationStatus = async (
  { id, status, acceptedByUserId }: UpdateInvitationStatusParams,
  tx: TxOrDb = db,
): Promise<void> => {
  await tx
    .update(cartInvitation)
    .set({
      status,
      acceptedByUserId: acceptedByUserId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(cartInvitation.id, id));
};
