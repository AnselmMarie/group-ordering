import { formatUSD } from "@/lib/money";
import type { CartParticipantGroup } from "@/server/cart/repository/get-cart-summary-grouped";

import { MiniCartSummaryItem } from "./mini-cart-summary-item";

export const MiniCartSummaryGroup = ({
  invitedEmail,
  role,
  items,
  subtotal,
}: CartParticipantGroup) => {
  const isOwner = role === "owner";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOwner ? (
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Owner
            </span>
          ) : (
            <p className="text-sm font-semibold">{invitedEmail}</p>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Hasn&apos;t added any items yet
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <MiniCartSummaryItem key={item.id} {...item} />
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
            <span className="font-medium">{formatUSD(subtotal)}</span>
          </div>
        </>
      )}
    </div>
  );
};
