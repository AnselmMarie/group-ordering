import { getCurrentUserId } from "@/server/auth/get-current-user-id";
import { findActiveCartRole } from "@/server/cart/repository/find-active-cart-role";
import type { CartSummaryItem } from "@/server/cart/repository/get-cart-summary";
import { getCartSummaryEditor } from "@/server/cart/repository/get-cart-summary-editor";
import { getCartSummaryOwner } from "@/server/cart/repository/get-cart-summary-owner";
import type { CartParticipantRole } from "@/server/cart/types";

export interface CartParticipantGroup {
  userId: string;
  invitedEmail: string | null;
  role: CartParticipantRole;
  items: CartSummaryItem[];
  subtotal: number;
}

export type CartSummaryView =
  | { kind: "solo"; items: CartSummaryItem[] }
  | { kind: "group"; groups: CartParticipantGroup[] };

export const getCartSummaryView =
  async (): Promise<CartSummaryView | null> => {
    const ctx = await findActiveCartRole();
    if (!ctx) {
      return null;
    }

    if (ctx.role === "editor") {
      const userId = await getCurrentUserId();
      if (!userId) {
        return null;
      }
      return getCartSummaryEditor(ctx.cartId, userId);
    }

    return getCartSummaryOwner(ctx.cartId);
  };
