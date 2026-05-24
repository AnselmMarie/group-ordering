"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { Button } from "@/ui/shadcn/button";
import { SheetDialog } from "@/ui/components/sheet-dialog";
import { useAppForm } from "@/ui/components/form/use-app-form";
import { createInvitationSchema } from "@/features/invitations/schema";
import { createInvitation } from "@/server/invitations/actions/create-invitation";

export const GroupOrder = ({
  inviteStatus,
}: {
  inviteStatus: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const form = useAppForm({
    defaultValues: { name: "", email: "" },
    validators: {
      onChange: createInvitationSchema,
    },
    onSubmit: async ({ value }) => {
      await createInvitation(value);
    },
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Users />
        Group Order
      </Button>

      <SheetDialog
        title="Invite other people to join your order!"
        description="Enter their email address below and we'll send them an invite to join your order."
        isOpen={open}
        onOpenChange={setOpen}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.AppField name="name">
            {(f) => <f.TextField label="Your Name" />}
          </form.AppField>
          <form.AppField name="email">
            {(f) => <f.TextField label="Email" />}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton>Create Invite</form.SubmitButton>
          </form.AppForm>
        </form>

        {inviteStatus}
      </SheetDialog>
    </>
  );
};
