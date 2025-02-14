import { defaultConfig } from "@/envConfig";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from 'pg';

export const dbCLient = new pg.Pool({
    connectionString: defaultConfig.databaseUrl,
    max: defaultConfig.databaseMaxPool,
});

export const db = drizzle({client: dbCLient, casing: 'snake_case' });