import { defaultConfig } from '../../envConfig';
import { users } from '@/models/user';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import readline from 'readline';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const dbConnect = db;

async function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

const databaseUrl = defaultConfig.databaseUrl;
export async function runMigrations() {
  try {
    if(!databaseUrl) {
        console.error('❌ databaseUrl is not set');
        process.exit(1);
    }
    const dbName = new URL(databaseUrl).pathname.slice(1);
    const pgClient = new pg.Client({
      connectionString: databaseUrl.replace(`/${dbName}`, '/postgres')
    });

    await pgClient.connect();

    const dbExists = await pgClient.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );

    if (!dbExists.rows.length) {
      const answer = await question(`Database "${dbName}" does not exist. Create it? (y/n): `);
      
      if (answer.toLowerCase() === 'y') {
        await pgClient.query(`CREATE DATABASE ${dbName}`);
        console.log(`✅ Database "${dbName}" created successfully`);
      } else {
        console.log('❌ Database creation cancelled');
        process.exit(1);
      }
    }

    await pgClient.end();
    const db = new pg.Client({ connectionString: databaseUrl });
    await db.connect();
    console.log('📦 Running migrations...');
    await migrate(drizzle(db, { casing: 'snake_case' }), {
      migrationsFolder: './drizzle'
    });
    console.log('✅ Migrations completed successfully');

    console.log('👤 Creating default user...');
    const defaultUser = {
      username: 'admin',
      password: '$argon2id$v=19$m=16,t=2,p=1$SkI5aFN6TUo1RWhGVFpBUQ$gE9t/yHLQrkD4/Lg5bk9ZA',
      full_name: "admin default",
      role: sql`'admin'`,
    };

    await dbConnect.insert(users).values(defaultUser).onConflictDoNothing().execute();
    console.log('✅ Default user created');

    await db.end();
    rl.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    rl.close();
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations();
}