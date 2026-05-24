"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onReject = () => {
    setError(null);
    startTransition(async () => {
      try {
        await rejectInvitation(invitationId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to reject this invitation?
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button variant="destructive" disabled={isPending} onClick={onReject}>
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
