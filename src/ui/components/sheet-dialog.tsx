import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/shadcn/sheet";

interface SheetDialogProps {
  title: string;
  description: string;
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SheetDialog = ({
  title,
  description,
  children,
  isOpen,
  onOpenChange,
}: React.PropsWithChildren<SheetDialogProps & { isOpen: boolean }>) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="px-4 text-sm text-muted-foreground">{children}</div>
      </SheetContent>
    </Sheet>
  );
};
