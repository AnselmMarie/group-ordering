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
      return getCartSummaryEditor(ctx.cartId, ctx.userId);
    }

    return getCartSummaryOwner(ctx.cartId);
  };
