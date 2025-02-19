import { pgTable, text, integer, pgEnum, serial, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const user_role = pgEnum('user_role', ['admin', 'petugas']);
export const users = pgTable('users', {
    id: serial().primaryKey(),
    username: varchar({length:255}).notNull(),
    password: varchar().notNull(),
    full_name: varchar({length:50}).notNull(),
    role: user_role().notNull(),
})

export const userSchema = {
    insert: createInsertSchema(users),
    select: createSelectSchema(users),
}
