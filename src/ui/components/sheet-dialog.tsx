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
        <SheetHeader />
        <div className="flex flex-col gap-1 px-4 mb-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </div>
        <div className="flex-1 min-h-0 text-sm text-muted-foreground">
          <ScrollArea className="h-full">
            <div className=" px-4">{children}</div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
