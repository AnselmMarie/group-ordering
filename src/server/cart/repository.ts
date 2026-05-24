import type { Cart, CartLine } from "./types";

const carts = new Map<string, ReadonlyArray<CartLine>>();

export const findByCartId = (cartId: string): Cart => {
  return {
    id: cartId,
    lines: carts.get(cartId) ?? [],
  };
};

export const addLine = (cartId: string, productId: string): Cart => {
  const existing = carts.get(cartId) ?? [];
  const match = existing.find((line) => line.productId === productId);

  const next: ReadonlyArray<CartLine> = match
    ? existing.map((line) =>
        line.productId === productId
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      )
    : [...existing, { productId, quantity: 1 }];

  carts.set(cartId, next);
  return { id: cartId, lines: next };
};

export const countItems = (cartId: string): number => {
  const lines = carts.get(cartId) ?? [];
  return lines.reduce((total, line) => total + line.quantity, 0);
};
