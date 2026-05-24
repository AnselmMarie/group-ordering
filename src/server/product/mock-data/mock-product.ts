import type { Product } from "@/server/product/types";

import { MOCK_PRODUCT_ID } from "./ids";

const MOCK_DATE = new Date("2026-01-01T00:00:00.000Z");

export const createMockProduct = (
  overrides: Partial<Product> = {},
): Product => ({
  id: MOCK_PRODUCT_ID,
  title: "Espresso",
  price: "10.22",
  image: null,
  createdAt: MOCK_DATE,
  updatedAt: MOCK_DATE,
  ...overrides,
});
