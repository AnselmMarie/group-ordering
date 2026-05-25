import { getCartSummaryView } from "@/server/cart/repository/get-cart-summary-grouped";

import { MiniCartSummaryGroup } from "./mini-cart-summary-group";
import { MiniCartSummaryItem } from "./mini-cart-summary-item";

export const MiniCartSummary = async () => {
  const view = await getCartSummaryView();

  // Handle empty cart
  if (!view || (view.kind === "solo" && view.items.length === 0)) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Your cart is empty.
      </p>
    );
  }

  // Handle solo cart
  if (view.kind === "solo") {
    const subtotal = view.items.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0,
    );

    return (
      <div className="flex flex-col gap-4">
        <div className="space-y-4">
          {view.items.map((item) => (
            <MiniCartSummaryItem key={item.id} {...item} />
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <span className="text-sm font-medium">Subtotal</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  // Handle group
  const grandTotal = view.groups.reduce(
    (acc, group) => acc + group.subtotal,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        {view.groups.map((group) => (
          <MiniCartSummaryGroup key={group.userId} {...group} />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="text-sm font-medium">Total</span>
        <span className="font-semibold">${grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
};
