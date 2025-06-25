
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Supabase configuration
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
}

console.log('Supabase URL:', process.env.SUPABASE_URL?.substring(0, 30) + '...');
console.log('Supabase Key starts with:', process.env.SUPABASE_KEY?.substring(0, 10) + '...');

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Test Supabase connection on startup
supabase.from('users').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully. Current user count:', count);
    }
  });

// Legacy Replit DB (keeping for compatibility)
if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable');
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client);
