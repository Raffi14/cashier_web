import { pgTable, text, varchar, serial} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const customers = pgTable('customer', {
    id: serial().primaryKey(),
    name: varchar({length:255}).notNull(),
    address: text().notNull(),
    phone_number: varchar({length:15}).notNull(),
})

export const customerSchema = {
    insert: createInsertSchema(customers),
    select: createSelectSchema(customers),
}