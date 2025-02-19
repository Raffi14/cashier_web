import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import readline from 'readline';
import argon2, { argon2id } from 'argon2';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(query: string) {
  return new Promise((resolve) => rl.question(query, resolve));
}

const databaseUrl = 'postgresql://postgres:123@localhost:5432/cashier_db';

export async function runMigrations() {
  try {
    if (!databaseUrl) {
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
      const answer = await question(`Database "${dbName}" does not exist. Create it? (y/n): `) as string;
      
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

    console.log('👤 Checking for default user...');
    const existingUser = await db.query(`SELECT * FROM users WHERE username = 'admin'`);
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Default user already exists');
    } else {
      console.log('👤 Creating default user...');
      
      const username = await question('Enter default username: ');
      const password = await question('Enter default password: ') as string;
      const fullName = await question('Enter full name: ');
      const hash = await argon2.hash(password, {
        type: argon2id,
      })

      await db.query(
        `INSERT INTO users (username, password, full_name, role, is_active) 
        VALUES ($1, $2, $3, $4, $5)`,
        [username, hash, fullName, 'admin', 'active']
      );
      console.log('✅ Default user created');
    }

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
