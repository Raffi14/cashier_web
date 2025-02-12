import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be provided");
}

export const defaultConfig = {
  databaseUrl: process.env.DATABASE_URL,
  databaseMaxPool: 50,
  secretKey: process.env.SECRET_KEY,
} as const;