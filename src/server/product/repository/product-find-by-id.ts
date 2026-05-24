import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { product } from "@/server/db/schema";

import type { Product } from "../types";

export const productFindById = async (id: string): Promise<Product | null> => {
  const rows = await db
    .select()
    .from(product)
    .where(eq(product.id, id))
    .limit(1);
  return rows[0] ?? null;
};
