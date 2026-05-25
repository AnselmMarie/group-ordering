"use client";

import { useServerAction } from "@/lib/hooks/use-server-action";
import { addToCart } from "@/server/cart/actions/add-to-cart";
import { Button } from "@/ui/shadcn/button";

interface AddToCartButtonProps {
  productId: string;
}

export const AddToCartButton = ({ productId }: AddToCartButtonProps) => {
  const [run, isPending] = useServerAction(addToCart);

  return (
    <Button
      className="w-full"
      disabled={isPending}
      onClick={() => run(productId)}
    >
      {isPending ? "Adding…" : "Add to cart"}
    </Button>
  );
};
