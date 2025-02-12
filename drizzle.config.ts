import { defineConfig } from 'drizzle-kit';
import { readdirSync } from 'fs';

export default defineConfig({
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    dialect: 'postgresql',
    schema: readdirSync("src/models").map(file => `./src/models/${file}`),
    casing: 'snake_case',
});