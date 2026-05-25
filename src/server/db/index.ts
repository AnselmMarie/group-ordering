import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl } from "@/lib/env";

import * as schema from "./schema";

const url = getDatabaseUrl();
const isNeon = /\.neon\.(tech|build)/i.test(url);

export const db = isNeon
  ? drizzleNeon(neon(url), { schema })
  : drizzlePg(postgres(url), { schema });

export type Database = typeof db;
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type TxOrDb = Database | Tx;
