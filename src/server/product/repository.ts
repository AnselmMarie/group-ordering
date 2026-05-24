import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { product } from "@/server/db/schema";

import type { Product } from "./types";

export const findAll = async (): Promise<Product[]> => {
  return db.select().from(product).orderBy(product.createdAt);
};

export const findById = async (id: string): Promise<Product | null> => {
  const rows = await db
    .select()
    .from(product)
    .where(eq(product.id, id))
    .limit(1);
  return rows[0] ?? null;
};
