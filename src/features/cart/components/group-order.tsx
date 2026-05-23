"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { Button } from "@/ui/shadcn/button";
import { SheetDialog } from "@/ui/components/sheet-dialog";

export const GroupOrder = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Users />
        Group Order
      </Button>

      <SheetDialog
        title="Invite your friends"
        description="Group order will appear here."
        isOpen={open}
        onOpenChange={setOpen}
      />
    </>
  );
};
