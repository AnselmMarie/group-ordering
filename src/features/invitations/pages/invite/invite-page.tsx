import { notFound } from "next/navigation";

import { InviteActions } from "@/features/invitations/components/invite-actions";
import { findInvitationById } from "@/server/invitations/repository/find-invitation-by-id";
import { Body } from "@/ui/components/layout/body";

interface InvitePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string }>;
}

const resolveInitialView = (
  action: string | undefined,
): "default" | "accept" | "reject" => {
  if (action === "accept") return "accept";
  if (action === "reject") return "reject";
  return "default";
};

const InvitePage = async ({ params, searchParams }: InvitePageProps) => {
  const { id } = await params;
  const { action } = await searchParams;

  const invitation = await findInvitationById(id);
  if (!invitation) {
    notFound();
  }

  if (invitation.status !== "pending") {
    return (
      <Body>
        <h1 className="text-2xl font-bold">Invitation {invitation.status}</h1>
        <p className="text-sm text-muted-foreground">
          This invitation has already been {invitation.status}.
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
