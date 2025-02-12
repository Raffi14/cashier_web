import { sql } from "drizzle-orm";
import { pgTable, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { Products } from "./product";
import { Sale } from "./sales";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export  const saleDetail = pgTable('sale_detail', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    sale_id: integer().notNull().references(() => Sale.id),
    product_id: integer().notNull().references(() => Products.id),
    quantity: integer().notNull(),
    sub_total: decimal().notNull(),
    created_at: timestamp({ withTimezone: true }).notNull().default(sql `now()`),
});

export const saleDetailSchema = {
    insert: createInsertSchema(saleDetail),
    select: createSelectSchema(saleDetail),
};