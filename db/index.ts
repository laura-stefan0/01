console.log('SUPABASE_SERVICE_ROLE_KEY env var:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

console.log('supabaseAdmin initialized with key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key' : 'Anon Key');

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

// Test Supabase connection and permissions
async function testConnection() {
  try {
    console.log('\n🔍 Testing Supabase Connection and Permissions...');
    
    // Test 1: Check if users table exists with read client
    console.log('1️⃣ Testing read access with anon client...');
    const { data: readData, error: readError, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (readError) {
      if (readError.code === '42P01') {
        console.log('❌ Users table does not exist in Supabase database');
        console.log('   Please create the required tables using the SQL provided in supabase-setup.sql');
        console.log('   Go to: https://supabase.com/dashboard/project/mfzlajgnahbhwswpqzkj/sql');
        return;
      } else {
        console.error('❌ Read access error:', readError.message);
      }
    } else {
      console.log('✅ Read access successful. Current user count:', count || 0);
    }

    // Test 2: Test write access with admin client
    console.log('2️⃣ Testing write access with admin client...');
    const testUser = {
      username: `test_user_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password_hash: '$2b$10$testhashedpassword',
      name: 'Test User'
    };

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert(testUser)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Write access failed:', insertError.message);
      console.error('   Error code:', insertError.code);
      console.error('   Error hint:', insertError.hint);
      
      if (insertError.code === '42501') {
        console.error('   This suggests insufficient permissions - check your service role key!');
      }
    } else {
      console.log('✅ Write access successful! Test user created:', insertData.id);
      
      // Clean up test user
      await supabaseAdmin.from('users').delete().eq('id', insertData.id);
      console.log('🧹 Test user cleaned up');
    }

    // Test 3: Verify final count
    const { count: finalCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    console.log('📊 Final user count:', finalCount || 0);
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  }
}

testConnection();

console.log('✅ Supabase database initialized successfully');
