"use client";

import { useState } from "react";
import { ShoppingCart, Users } from "lucide-react";

import { Button } from "@/ui/shadcn/button";
import { SheetDialog } from "@/ui/components/sheet-dialog";

interface CartProps {
  initialCount: number;
}

export const Cart = ({ initialCount }: CartProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
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

      <SheetDialog
        title="Your order"
        description="Cart details will appear here."
        isOpen={open}
        onOpenChange={setOpen}
      />
    </>
  );
};
