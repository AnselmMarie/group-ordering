"use client";

import { useState } from "react";

import { Button } from "@/ui/shadcn/button";

import { InviteAccept } from "./invite-actions-accept";
import { InviteReject } from "./invite-actions-reject";

export type View = "default" | "accept" | "reject";

interface InviteActionsProps {
  invitationId: string;
  initialView?: View;
}

export const InviteActions = ({
  invitationId,
  initialView = "default",
}: InviteActionsProps) => {
  const [view, setView] = useState<View>(initialView);

  if (view === "accept") {
    return <InviteAccept invitationId={invitationId} onSetView={setView} />;
  }

  if (view === "reject") {
    return <InviteReject invitationId={invitationId} onSetView={setView} />;
  }

  return (
    <>
      <h1 className="text-2xl font-bold">You&apos;ve been invited</h1>
      <p className="text-sm text-muted-foreground">
        You were invited to join a group order. Accept to start adding items, or
        reject if you&apos;re not interested.
      </p>
      <div className="flex gap-2">
        <Button onClick={() => setView("accept")}>Accept</Button>
        <Button variant="outline" onClick={() => setView("reject")}>
          Reject
        </Button>
      </div>
    </>
  );
};
