"use client";

import { toast } from "sonner";

import { Button } from "@/ui/shadcn/button";

export const CheckoutButton = () => {
  return (
    <Button
      className="w-[200px]"
      onClick={() => toast("Normally the user goes to the checkout page")}
    >
      Checkout
    </Button>
  );
};
