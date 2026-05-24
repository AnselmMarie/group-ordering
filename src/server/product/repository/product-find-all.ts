import { db } from "@/server/db";
import { product } from "@/server/db/schema";

import type { Product } from "../types";

export const productFindAll = async (): Promise<Product[]> => {
  return db.select().from(product).orderBy(product.createdAt);
};
