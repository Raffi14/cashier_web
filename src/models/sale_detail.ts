import { pgTable, integer, decimal, timestamp, serial } from "drizzle-orm/pg-core";
import { products } from "./product";
import { sales } from "./sales";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export  const saleDetails = pgTable('sale_detail', {
    id: serial().primaryKey(),
    sale_id: integer().notNull().references(() => sales.id),
    product_id: integer().notNull().references(() => products.id),
    quantity: integer().notNull(),
    sub_total: integer().notNull(),
});

export const saleDetailSchema = {
    insert: createInsertSchema(saleDetails),
    select: createSelectSchema(saleDetails),
};