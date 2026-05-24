"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onAccept = () => {
    setError(null);
    startTransition(async () => {
      try {
        await acceptInvitation({ id: invitationId, email });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button disabled={isPending || !email} onClick={onAccept}>
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
