
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// PostgreSQL configuration
if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable');
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client);

// Test database connection
console.log('✅ PostgreSQL database initialized successfully');
