import { db } from "@/server/db";
import { cartItem } from "@/server/db/schema";

interface InsertCartItemParams {
  cartId: string;
  productId: string;
  userId: string;
  price: number;
  quantity?: number;
}

export const insertCartItem = async ({
  cartId,
  productId,
  userId,
  price,
  quantity = 1,
}: InsertCartItemParams): Promise<void> => {
  await db
    .insert(cartItem)
    .values({ cartId, productId, userId, price, quantity });
};
