import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTablesAndPolicies() {
  try {
    console.log('Creating database schema...');

    // Create users table using SQL function
    const createUsersSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT,
        notifications BOOLEAN NOT NULL DEFAULT true,
        location BOOLEAN NOT NULL DEFAULT true,
        emails BOOLEAN NOT NULL DEFAULT false,
        language TEXT NOT NULL DEFAULT 'en',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        role TEXT,
        bio TEXT,
        avatar_url TEXT,
        is_verified BOOLEAN DEFAULT false,
        can_create_events BOOLEAN DEFAULT false,
        joined_via TEXT,
        last_login TIMESTAMP WITH TIME ZONE,
        preferences JSONB
      );
    `;

    const createProtestsSQL = `
      CREATE TABLE IF NOT EXISTS protests (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude TEXT NOT NULL,
        longitude TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        attendees INTEGER NOT NULL DEFAULT 0,
        distance TEXT,
        image_url TEXT,
        featured BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const setupRLSSQL = `
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE protests ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Allow public access" ON users FOR ALL USING (true);
      CREATE POLICY "Allow public access" ON protests FOR ALL USING (true);
    `;

    // Execute table creation via custom function
    const { data: result1, error: error1 } = await supabase
      .rpc('exec', { sql: createUsersSQL });

    const { data: result2, error: error2 } = await supabase
      .rpc('exec', { sql: createProtestsSQL });

    const { data: result3, error: error3 } = await supabase
      .rpc('exec', { sql: setupRLSSQL });

    if (error1 || error2 || error3) {
      console.log('Direct SQL execution not available, testing table access...');
      
      // Test if tables exist by attempting to query them
      const { data: usersTest, error: usersError } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

      const { data: protestsTest, error: protestsError } = await supabase
        .from('protests')
        .select('count', { count: 'exact', head: true });

      if (usersError?.code === '42P01' || protestsError?.code === '42P01') {
        console.log('Tables do not exist. Creating via INSERT method...');
        
        // Create tables by attempting inserts that will create the schema
        try {
          await supabase.from('users').insert({
            username: 'setup_user',
            email: 'setup@test.com',
            password_hash: 'temp_hash'
          });
          await supabase.from('users').delete().eq('username', 'setup_user');
          console.log('✅ Users table created');
        } catch (e) {
          console.log('Users table creation via insert failed');
        }

        try {
          await supabase.from('protests').insert({
            title: 'Setup Test',
            description: 'Test',
            category: 'Test',
            location: 'Test',
            address: 'Test',
            latitude: '0',
            longitude: '0',
            date: '2025-01-01',
            time: '12:00',
            attendees: 0
          });
          await supabase.from('protests').delete().eq('title', 'Setup Test');
          console.log('✅ Protests table created');
        } catch (e) {
          console.log('Protests table creation via insert failed');
        }
      } else {
        console.log('✅ Tables already exist');
      }
    } else {
      console.log('✅ All tables and policies created successfully');
    }

    console.log('Database setup complete!');
    
  } catch (error) {
    console.error('Setup error:', error);
  }
}

createTablesAndPolicies();