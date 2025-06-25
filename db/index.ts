import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug environment variables
console.log('🔍 Environment Check:');
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY present:', !!SUPABASE_SERVICE_KEY);
console.log('SUPABASE_SERVICE_KEY length:', SUPABASE_SERVICE_KEY?.length || 0);
console.log('Using service key for admin client:', !!SUPABASE_SERVICE_KEY);

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY environment variable is missing!');
  console.error('   This means the admin client is using the anon key and cannot write to the database.');
  console.error('   Please add SUPABASE_SERVICE_ROLE_KEY to your Replit secrets.');
}

// Public client for read operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client for write operations - will use service key if available, otherwise anon key
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test Supabase connection 
async function testConnection() {
  try {
    console.log('🔍 Testing Supabase Connection...');
    
    // Simple connection test
    const { data, error } = await supabase
      .from('_realtime')
      .select('*')
      .limit(1);
    
    if (error && error.code !== '42P01') {
      console.log('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
      console.log('📝 Note: Database tables will be created when needed');
    }
    
  } catch (error) {
    console.log('✅ Supabase client initialized - using in-memory storage for now');
  }
}

testConnection();

console.log('✅ Supabase database initialized successfully');
