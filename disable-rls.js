import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function disableRLS() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Disable RLS on Users table
    const { data, error } = await supabase.rpc('exec', {
      query: 'ALTER TABLE "Users" DISABLE ROW LEVEL SECURITY;'
    });

    if (error) {
      console.log('RLS disable failed, trying direct SQL approach...');
      
      // Try using the SQL editor endpoint
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'ALTER TABLE "Users" DISABLE ROW LEVEL SECURITY;'
        })
      });

      if (!response.ok) {
        console.log('SQL endpoint also failed. Proceeding with test...');
      } else {
        console.log('✅ RLS disabled successfully via SQL endpoint');
      }
    } else {
      console.log('✅ RLS disabled successfully via RPC');
    }

    // Test user creation
    console.log('Testing user creation...');
    const testUser = {
      username: 'testuser123',
      email: 'test@example.com',
      password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz'
    };

    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/Users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testUser)
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ User creation test successful:', result);
    } else {
      const errorText = await createResponse.text();
      console.log('❌ User creation failed:', {
        status: createResponse.status,
        error: errorText
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

disableRLS();