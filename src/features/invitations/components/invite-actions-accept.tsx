"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useServerAction } from "@/hooks/use-server-action";
import { Button } from "@/ui/shadcn/button";
import { Input } from "@/ui/shadcn/input";
import { acceptInvitation } from "@/server/invitations/actions/accept-invitation";

import { View } from "./invite-actions";

interface InviteActionsProps {
  invitationId: string;
  onSetView: (view: View) => void;
}

export const InviteAccept = ({
  invitationId,
  onSetView,
}: InviteActionsProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [run, isPending] = useServerAction(acceptInvitation, {
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Confirm your email to accept this invitation.
      </p>
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isPending}
      />
      <div className="flex justify-center gap-2">
        <Button
          disabled={isPending || !email}
          onClick={() => run({ id: invitationId, email })}
        >
          {isPending ? "Accepting..." : "Accept invitation"}
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
