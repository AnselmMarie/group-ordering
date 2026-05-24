import { getCartSummary } from "@/server/cart/repository/get-cart-summary";

import { MiniCartSummaryItem } from "./mini-cart-summary-item";

export const MiniCartSummary = async () => {
  const cartSummary = await getCartSummary();

  if (!cartSummary || cartSummary.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Your cart is empty.
      </p>
    );
  }

  const subtotal = cartSummary.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        {cartSummary.map((item) => (
          <MiniCartSummaryItem key={item.id} {...item} />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="text-sm font-medium">Subtotal</span>
        <span className="font-semibold">${subtotal.toFixed(2)}</span>
      </div>
    </div>
  );
};
