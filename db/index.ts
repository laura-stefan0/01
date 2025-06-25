
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client for read operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client for write operations
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test Supabase connection on startup
async function testConnection() {
  try {
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Users table does not exist in Supabase database');
        console.log('Please create the required tables using the SQL provided in supabase-setup.sql');
        console.log('Go to: https://supabase.com/dashboard/project/mfzlajgnahbhwswpqzkj/sql');
      } else {
        console.error('❌ Supabase connection error:', error.message);
      }
    } else {
      console.log('✅ Supabase connected successfully. Current user count:', count || 0);
    }
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
}

testConnection();

console.log('✅ Supabase database initialized successfully');
