import { numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const ts = (name: string) =>
  timestamp(name, { precision: 3, withTimezone: true, mode: "date" });

export const pk = () => uuid("id").primaryKey().$defaultFn(uuidv7);

export const money = (name: string) =>
  numeric(name, { precision: 10, scale: 2 });
