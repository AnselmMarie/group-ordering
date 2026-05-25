import { Pool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl } from "@/lib/env";

import * as schema from "./schema";

const url = getDatabaseUrl();
const isNeon = /\.neon\.(tech|build)/i.test(url);

const createDb = () =>
  isNeon
    ? drizzleNeon(new Pool({ connectionString: url }), { schema })
    : drizzlePg(postgres(url, { max: 5 }), { schema });

type DbClient = ReturnType<typeof createDb>;

const globalForDb = globalThis as unknown as { __db?: DbClient };

export const db: DbClient = globalForDb.__db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__db = db;
}

export type Database = typeof db;
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type TxOrDb = Database | Tx;
