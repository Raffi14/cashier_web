import { date, decimal, integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";
import { customers } from "./customers";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const sales = pgTable('sale', {
    id: serial().primaryKey(),
    user_id: integer().notNull().references(() => users.id),
    customer_id: integer().notNull().references(() => customers.id),
    total_price: integer().notNull(),
    sale_date: date().notNull(),
});

export const saleSchema = {
    insert: createInsertSchema(sales),
    select: createSelectSchema(sales),
}