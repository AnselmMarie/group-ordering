import { getInvitationsByCartId } from "@/server/invitations/repository/get-invitations-by-cart-id";

import { InvitationStatusItem } from "./invitation-status-item";

export const InvitationStatus = async () => {
  const inviteStatus = await getInvitationsByCartId();

  if (!inviteStatus || inviteStatus.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        You didn't invite anyone yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        {inviteStatus.map((invite, idx) => (
          <InvitationStatusItem
            key={invite.id}
            idx={idx}
            arrLength={inviteStatus.length}
            {...invite}
          />
        ))}
      </div>
    </div>
  );
};
