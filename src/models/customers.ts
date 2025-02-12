import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const Customers = pgTable('customers', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    name: text().notNull(),
    address: text().notNull(),
    phone_number: text().notNull(),
    created_at: timestamp({ withTimezone: true }).notNull().default(sql `now()`),
})

export const customerSchema = {
    insert: createInsertSchema(Customers),
    select: createSelectSchema(Customers),
}