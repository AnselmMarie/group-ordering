import { Separator } from "@/ui/shadcn/separator";
import type { InvitationItem } from "@/server/invitations/repository/get-invitations-by-cart-id";
import type { InvitationStatus } from "@/server/invitations/types";

const STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

const STATUS_STYLES: Record<InvitationStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  accepted:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200",
};

export const InvitationStatusItem = ({
  idx,
  arrLength,
  ...item
}: InvitationItem & { idx: number; arrLength: number }) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{item.invitedEmail}</p>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[item.status]}`}
        >
          {STATUS_LABELS[item.status]}
        </span>
      </div>
      {idx < arrLength - 1 && <Separator className="my-4" />}
    </div>
  );
};
