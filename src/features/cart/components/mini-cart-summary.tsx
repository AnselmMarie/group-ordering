import { formatUSD } from "@/lib/money";
import { getCartSummaryView } from "@/server/cart/repository/get-cart-summary-view";
import { CheckoutButton } from "./checkout-button";
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
      (acc, item) => acc + item.price * item.quantity,
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
          <span className="font-semibold">{formatUSD(subtotal)}</span>
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
    <div className="relative">
      <div className="flex flex-col gap-6 mb-[100px]">
        <div className="flex flex-col gap-6">
          {view.groups.map((group) => (
            <MiniCartSummaryGroup key={group.userId} {...group} />
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <span className="text-sm font-medium">Total</span>
          <span className="font-semibold">{formatUSD(grandTotal)}</span>
        </div>
      </div>
      <div className="fixed bg-white w-[384px] bottom-0">
        <div className="flex items-center justify-center border-t border-zinc-200 py-4 -ml-[16px] dark:border-zinc-800">
          <CheckoutButton />
        </div>
      </div>
    </div>
  );
};
