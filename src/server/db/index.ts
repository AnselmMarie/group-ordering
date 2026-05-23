import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const url = process.env.DATABASE_URL;
const isNeon = /\.neon\.(tech|build)/i.test(url);

export const db = isNeon
  ? drizzleNeon(neon(url), { schema })
  : drizzlePg(postgres(url), { schema });

export type Database = typeof db;
