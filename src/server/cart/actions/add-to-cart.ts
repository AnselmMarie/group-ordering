"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/server/auth";
import { createCart } from "@/server/cart/repository/create-cart";
import { findCartIdByUserId } from "@/server/cart/repository/find-cart-id-by-user";
import { findCartItem } from "@/server/cart/repository/find-cart-item";
import { incrementCartItem } from "@/server/cart/repository/increment-cart-item";
import { insertCartItem } from "@/server/cart/repository/insert-cart-item";

export const addToCart = async (productId: string): Promise<void> => {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id;

  if (!userId) {
    throw new Error("User is not found");
  }

  const existingCartId = await findCartIdByUserId(userId);
  const cartId = existingCartId ?? (await createCart(userId));

  if (!cartId) {
    throw new Error("Failed to get or create cart");
  }

  const existingItem = await findCartItem({ cartId, productId, userId });

  if (existingItem) {
    await incrementCartItem({ cartId, productId, userId });
  } else {
    // @todo: get price from products table
    await insertCartItem({ cartId, productId, userId, price: "10.22" });
  }

  revalidatePath("/");
};
