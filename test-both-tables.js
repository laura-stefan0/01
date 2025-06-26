
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Both Tables Separately');
console.log('===================================');

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing!');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testUsersTable() {
  try {
    console.log('\n📤 Testing USERS table...');
    
    const testUser = {
      username: `test_user_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password_hash: '$2b$10$testhashedpassword'
    };

    console.log('🔄 Inserting test user:', { username: testUser.username, email: testUser.email });

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(testUser)
      .select()
      .single();

    if (error) {
      console.error('❌ Users table insert failed:', error);
      return false;
    } else {
      console.log('✅ Users table insert successful:', data.id);
      
      // Clean up
      await supabaseAdmin.from('users').delete().eq('id', data.id);
      console.log('🧹 Test user cleaned up');
      return true;
    }
  } catch (error) {
    console.error('❌ Users table test failed:', error);
    return false;
  }
}

async function testProtestsTable() {
  try {
    console.log('\n📤 Testing PROTESTS table...');
    
    const testProtest = {
      title: `Test Protest ${Date.now()}`,
      description: 'Test Description',
      category: 'Test Category',
      location: 'Test Location',
      address: 'Test Address',
      latitude: '40.4168',
      longitude: '-3.7038',
      date: '2025-01-01',
      time: '12:00'
    };

    console.log('🔄 Inserting test protest:', { title: testProtest.title, category: testProtest.category });

    const { data, error } = await supabaseAdmin
      .from('protests')
      .insert(testProtest)
      .select()
      .single();

    if (error) {
      console.error('❌ Protests table insert failed:', error);
      return false;
    } else {
      console.log('✅ Protests table insert successful:', data.id);
      
      // Clean up
      await supabaseAdmin.from('protests').delete().eq('id', data.id);
      console.log('🧹 Test protest cleaned up');
      return true;
    }
  } catch (error) {
    console.error('❌ Protests table test failed:', error);
    return false;
  }
}

async function runTests() {
  const usersResult = await testUsersTable();
  const protestsResult = await testProtestsTable();
  
  console.log('\n📊 Test Results:');
  console.log('Users table:', usersResult ? '✅ Working' : '❌ Failed');
  console.log('Protests table:', protestsResult ? '✅ Working' : '❌ Failed');
  
  if (usersResult && protestsResult) {
    console.log('\n🎉 Both tables are working correctly!');
  } else {
    console.log('\n⚠️  Some tables need attention');
  }
}

runTests();
