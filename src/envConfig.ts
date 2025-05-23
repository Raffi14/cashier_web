export const defaultConfig = {
  databaseUrl: process.env.DATABASE_URL,
  databaseMaxPool: 50,
  secretKey: process.env.SECRET_KEY,
  webUrl: process.env.NEXT_PUBLIC_API_URL,
} as const;
