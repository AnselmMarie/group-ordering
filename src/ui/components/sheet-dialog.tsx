import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/shadcn/sheet";
import { ScrollArea } from "@/ui/shadcn/scroll-area";

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
        <div className="flex-1 min-h-0 text-sm text-muted-foreground">
          <ScrollArea className="h-full px-4">{children}</ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
