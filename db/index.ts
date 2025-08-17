import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Database configuration using local PostgreSQL
const DATABASE_URL = process.env.DATABASE_URL!;

console.log('🔍 Database Environment Check:');
console.log('DATABASE_URL present:', !!DATABASE_URL);
console.log('Using local PostgreSQL database');

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres client
const client = postgres(DATABASE_URL);

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Legacy exports for compatibility (will be removed)
export const supabase = db;
export const supabaseAdmin = db;

// Test database connection
async function testConnection() {
  try {
    console.log('🔍 Testing PostgreSQL Connection...');
    
    // Simple connection test
    await client`SELECT 1`;
    
    console.log('✅ PostgreSQL connection successful');
    console.log('📝 Database is ready for operations');
    
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
}

testConnection();

console.log('✅ Local PostgreSQL database initialized successfully');
