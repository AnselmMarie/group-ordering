export interface CartLine {
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string;
  lines: ReadonlyArray<CartLine>;
}
