import { decimal, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const products = pgTable('product', {
    id: serial().primaryKey(),
    product_name: varchar({length:255}).notNull(),
    price: decimal({precision:10, scale:6}).notNull(),
    stock: integer().notNull(),
});

export const productSchema = {
    insert: createInsertSchema(products),
    select: createSelectSchema(products),
};