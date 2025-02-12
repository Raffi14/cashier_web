import { sql } from "drizzle-orm";
import { date, decimal, integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { Users } from "./user";
import { Customers } from "./customers";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const Sale = pgTable('sales', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    user_id: integer().notNull().references(() => Users.id),
    customer_id: integer().notNull().references(() => Customers.id),
    total_price: decimal().notNull(),
    sale_date: date().notNull(),
    created_at: timestamp({ withTimezone: true }).notNull().default(sql `now()`),
});

export const saleSchema = {
    insert: createInsertSchema(Sale),
    select: createSelectSchema(Sale),
}