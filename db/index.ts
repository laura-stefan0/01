
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_KEY');
}

// Create Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// For Drizzle ORM with Supabase, we need to construct the connection string
const connectionString = `postgresql://postgres:[password]@[host]:5432/postgres`;

// Since we're using Supabase, let's use the Supabase client directly for now
// and phase out Drizzle gradually if needed
const client = postgres(process.env.DATABASE_URL || connectionString);
export const db = drizzle(client);
