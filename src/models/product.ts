import { sql } from "drizzle-orm";
import { decimal, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {z} from "Zod"

export const Products = pgTable('products', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    name: text().notNull(),
    price: decimal().notNull(),
    stock: integer().notNull(),
    created_at: timestamp({ withTimezone: true }).notNull().default(sql `now()`),
});

export const productSchema = {
    insert: createInsertSchema(Products),
    select: createSelectSchema(Products),
};