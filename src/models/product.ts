import { decimal, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const is_active = pgEnum('is_active', ['active', 'inactive']);
export const products = pgTable('product', {
    id: serial().primaryKey(),
    product_name: varchar({length:255}).notNull(),
    price: integer().notNull(),
    stock: integer().notNull(),
    is_active: is_active().notNull(),
});

export const productSchema = {
    insert: createInsertSchema(products),
    select: createSelectSchema(products),
};