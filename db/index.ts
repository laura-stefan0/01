
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable');
}

// Create PostgreSQL client using the DATABASE_URL from Replit
const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client);
