import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const user_role = pgEnum('user_role', ['admin', 'staff']);
export const Users = pgTable('users', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    username: text().notNull(),
    password: text().notNull(),
    full_name: text().notNull(),
    role: user_role().notNull(),
    created_at: timestamp({ withTimezone: true }).notNull().default(sql `now()`),
})

export const userSchema = {
    insert: createInsertSchema(Users),
    select: createSelectSchema(Users),
}
