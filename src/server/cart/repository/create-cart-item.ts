import { db } from "@/server/db";
import { cartItem } from "@/server/db/schema";

interface CreateCartItemParams {
  cartId: string;
  productId: string;
  userId: string;
  price: number;
  quantity?: number;
}

export const createCartItem = async ({
  cartId,
  productId,
  userId,
  price,
  quantity = 1,
}: CreateCartItemParams): Promise<void> => {
  await db
    .insert(cartItem)
    .values({ cartId, productId, userId, price, quantity });
};
