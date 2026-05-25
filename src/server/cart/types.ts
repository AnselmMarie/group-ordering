export type CartParticipantStatus = "active" | "inactive";
export type CartParticipantRole = "editor" | "owner";

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string;
  lines: ReadonlyArray<CartLine>;
}
