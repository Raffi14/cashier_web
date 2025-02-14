import { decimal, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const products = pgTable('product', {
    id: serial().primaryKey(),
    product_name: varchar({length:255}).notNull(),
    price: integer().notNull(),
    stock: integer().notNull(),
});

export const productSchema = {
    insert: createInsertSchema(products),
    select: createSelectSchema(products),
};