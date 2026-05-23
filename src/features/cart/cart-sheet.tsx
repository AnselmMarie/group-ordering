"use client";

import { useState } from "react";
import { ShoppingCart, Users } from "lucide-react";

import { Button } from "@/ui/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/shadcn/sheet";

interface CartSheetProps {
  initialCount: number;
}

export function CartSheet({ initialCount }: CartSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button onClick={() => setOpen(true)}>
          <Users />
          Group Order
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open cart"
          className="relative"
          onClick={() => setOpen(true)}
        >
          <ShoppingCart />
          {initialCount > 0 && (
            <span
              aria-label={`${initialCount} items in cart`}
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
            >
              {initialCount}
            </span>
          )}
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Your order</SheetTitle>
            <SheetDescription>
              Group order and cart details will appear here.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 text-sm text-muted-foreground">
            Nothing here yet — this is a shared placeholder for both the group
            order and cart views.
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
