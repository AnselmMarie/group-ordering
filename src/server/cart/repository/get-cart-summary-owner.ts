import { and, eq } from "drizzle-orm";

import type { CartSummaryItem } from "@/server/cart/repository/get-cart-summary-view";
import type { CartParticipantRole } from "@/server/cart/types";
import { db } from "@/server/db";
import {
  cartInvitation,
  cartItem,
  cartParticipant,
  product,
} from "@/server/db/schema";

import type {
  CartParticipantGroup,
  CartSummaryView,
} from "./get-cart-summary-view";

const isParticipantRole = (value: string): value is CartParticipantRole =>
  value === "owner" || value === "editor";

export const getCartSummaryOwner = async (
  cartId: string,
): Promise<CartSummaryView> => {
  const rows = await db
    .select({
      participantUserId: cartParticipant.userId,
      role: cartParticipant.role,
      invitedEmail: cartInvitation.invitedEmail,
      itemId: cartItem.id,
      itemProductId: cartItem.productId,
      itemUserId: cartItem.userId,
      itemQuantity: cartItem.quantity,
      itemPrice: cartItem.price,
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.image,
    })
    .from(cartParticipant)
    .leftJoin(
      cartInvitation,
      and(
        eq(cartInvitation.cartId, cartParticipant.cartId),
        eq(cartInvitation.acceptedByUserId, cartParticipant.userId),
      ),
    )
    .leftJoin(
      cartItem,
      and(
        eq(cartItem.cartId, cartParticipant.cartId),
        eq(cartItem.userId, cartParticipant.userId),
      ),
    )
    .leftJoin(product, eq(cartItem.productId, product.id))
    .where(
      and(
        eq(cartParticipant.cartId, cartId),
        eq(cartParticipant.status, "active"),
      ),
    );

  const groupMap = new Map<string, CartParticipantGroup>();
  for (const row of rows) {
    let group = groupMap.get(row.participantUserId);
    if (!group) {
      const role = isParticipantRole(row.role) ? row.role : "editor";
      group = {
        userId: row.participantUserId,
        invitedEmail: row.invitedEmail,
        role,
        items: [],
        subtotal: 0,
      };
      groupMap.set(row.participantUserId, group);
    }

    if (
      row.itemId !== null &&
      row.itemProductId !== null &&
      row.itemUserId !== null &&
      row.itemQuantity !== null &&
      row.itemPrice !== null &&
      row.productId !== null &&
      row.productTitle !== null &&
      row.productPrice !== null
    ) {
      const item: CartSummaryItem = {
        id: row.itemId,
        productId: row.itemProductId,
        userId: row.itemUserId,
        quantity: row.itemQuantity,
        price: row.itemPrice,
        product: {
          id: row.productId,
          title: row.productTitle,
          price: row.productPrice,
          image: row.productImage,
        },
      };
      group.items.push(item);
      group.subtotal += row.itemPrice * row.itemQuantity;
    }
  }

  const groups = Array.from(groupMap.values());

  if (groups.length <= 1) {
    const items = groups[0]?.items ?? [];
    return { kind: "solo", items };
  }

  const sortedGroups = [...groups].sort((a, b) => {
    if (a.role === "owner" && b.role !== "owner") return -1;
    if (b.role === "owner" && a.role !== "owner") return 1;
    const aKey = (a.invitedEmail ?? "").toLowerCase();
    const bKey = (b.invitedEmail ?? "").toLowerCase();
    return aKey.localeCompare(bKey);
  });

  return { kind: "group", groups: sortedGroups };
};
