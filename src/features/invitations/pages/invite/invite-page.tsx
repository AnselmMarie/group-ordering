import Link from "next/link";
import { notFound } from "next/navigation";

import { InviteActions } from "@/features/invitations/components/invite-actions";
import { getInvitationById } from "@/server/invitations/repository/get-invitation-by-id";
import { Body } from "@/ui/components/layout/body";
import { Button } from "@/ui/shadcn/button";

interface InvitePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string }>;
}

const resolveInitialView = (
  action: string | undefined,
): "default" | "accept" | "reject" => {
  switch (action) {
    case "accept":
      return "accept";
    case "reject":
      return "reject";
    default:
      return "default";
  }
};

const InvitePage = async ({ params, searchParams }: InvitePageProps) => {
  const { id } = await params;
  const { action } = await searchParams;

  const invitation = await getInvitationById(id);
  if (!invitation) {
    notFound();
  }

  if (invitation.status === "accepted") {
    return (
      <Body>
        <h1 className="text-2xl font-bold">Invitation {invitation.status}</h1>
        <p className="text-sm text-muted-foreground">
          This invitation has been {invitation.status}.
        </p>

        <Button
          className="mt-4"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Build Your Order
        </Button>
      </Body>
    );
  }

  if (invitation.status === "rejected") {
    return (
      <Body>
        <h1 className="text-2xl font-bold">Invitation {invitation.status}</h1>
        <p className="text-sm text-muted-foreground">
          This invitation has been {invitation.status}.
        </p>
      </Body>
    );
  }

  return (
    <Body>
      <InviteActions
        invitationId={invitation.id}
        initialView={resolveInitialView(action)}
      />
    </Body>
  );
};

export default InvitePage;
