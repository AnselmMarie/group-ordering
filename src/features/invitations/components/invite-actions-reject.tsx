"use client";

import { useRouter } from "next/navigation";

import { useServerAction } from "@/lib/hooks/use-server-action";
import { Button } from "@/ui/shadcn/button";
import { rejectInvitation } from "@/server/invitations/actions/reject-invitation";

import { View } from "./invite-actions";

interface InviteActionsProps {
  invitationId: string;
  onSetView: (view: View) => void;
}

export const InviteReject = ({
  invitationId,
  onSetView,
}: InviteActionsProps) => {
  const router = useRouter();
  const [run, isPending] = useServerAction(rejectInvitation, {
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to reject this invitation?
      </p>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          disabled={isPending}
          onClick={() => run(invitationId)}
        >
          {isPending ? "Rejecting..." : "Reject invitation"}
        </Button>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => onSetView("default")}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
