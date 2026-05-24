"use client";

import { useTransition } from "react";

import { addToCart } from "@/server/cart/actions/add-to-cart";
import { Button } from "@/ui/shadcn/button";

interface AddToCartButtonProps {
  productId: string;
}

export const AddToCartButton = ({ productId }: AddToCartButtonProps) => {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="w-full"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await addToCart(productId);
        })
      }
    >
      {isPending ? "Adding…" : "Add to cart"}
    </Button>
  );
};
