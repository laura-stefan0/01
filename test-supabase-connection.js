
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase Connection Test');
console.log('===========================');
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('Service Key Present:', !!SUPABASE_SERVICE_KEY);
console.log('Service Key Length:', SUPABASE_SERVICE_KEY?.length || 0);

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing!');
  console.error('Please add it to your Replit secrets.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testInsert() {
  try {
    const testUser = {
      username: `test_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password_hash: '$2b$10$testhashedpassword'
    };

    console.log('\n📤 Testing user insert...');
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(testUser)
      .select()
      .single();

    if (error) {
      console.error('❌ Insert failed:', error);
    } else {
      console.log('✅ Insert successful:', data);
      
      // Clean up
      await supabaseAdmin.from('users').delete().eq('id', data.id);
      console.log('🧹 Test user cleaned up');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testInsert();
