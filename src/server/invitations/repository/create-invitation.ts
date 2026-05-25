import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/server/db";
import { MAX_ACTIVE_INVITES } from "@/server/invitations/constants";
import type { Invitation, InvitationStatus } from "@/server/invitations/types";

interface CreateInvitationParams {
  cartId: string;
  email: string;
}

interface CreateInvitationRow {
  id: string;
  cart_id: string;
  invited_email: string;
  status: string;
  accepted_by_user_id: string | null;
  created_at: Date;
  updated_at: Date;
}

const extractRows = (
  result: unknown,
): readonly CreateInvitationRow[] => {
  if (Array.isArray(result)) {
    return result as CreateInvitationRow[];
  }
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows: CreateInvitationRow[] }).rows;
  }
  return [];
};

export const createInvitation = async ({
  cartId,
  email,
}: CreateInvitationParams): Promise<Invitation> => {
  const result = await db.execute(sql`
    INSERT INTO cart_invitation (cart_id, invited_email)
    SELECT ${cartId}::uuid, ${email}
    WHERE (
      SELECT count(*) FROM cart_invitation
      WHERE cart_id = ${cartId}::uuid
        AND status IN ('pending', 'accepted')
    ) < ${MAX_ACTIVE_INVITES}
    RETURNING id, cart_id, invited_email, status, accepted_by_user_id, created_at, updated_at
  `);

  const row = extractRows(result)[0];
  if (!row) {
    throw new Error(
      `Invite limit reached. You can have at most ${MAX_ACTIVE_INVITES} active invites.`,
    );
  }

  // @todo: enhancement to just revalidate the invite server calls
  revalidatePath("/");

  return {
    id: row.id,
    cartId: row.cart_id,
    invitedEmail: row.invited_email,
    status: row.status as InvitationStatus,
    acceptedByUserId: row.accepted_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};
