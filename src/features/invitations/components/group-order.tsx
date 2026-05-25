"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { Button } from "@/ui/shadcn/button";
import { SheetDialog } from "@/ui/components/sheet-dialog";
import { useAppForm } from "@/ui/components/form/use-app-form";
import { createInvitationSchema } from "@/features/invitations/schema";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { createInvitation } from "@/server/invitations/actions/create-invitation";

export const GroupOrder = ({
  inviteStatus,
}: {
  inviteStatus: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [runCreate] = useServerAction(createInvitation);
  const form = useAppForm({
    defaultValues: { name: "", email: "" },
    validators: {
      onChange: createInvitationSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const result = await runCreate(value);
      if (result) {
        formApi.setFieldValue("email", "");
      }
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
          className="flex flex-col gap-4 mb-7"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.AppField name="name">
            {(f) => (
              <f.TextField
                label="Your Name"
                helperText="This is to let the invited user know who sent the invite."
              />
            )}
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
