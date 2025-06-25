import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function setupDatabase() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });

  try {
    // Create the SQL function to execute DDL statements
    console.log('Setting up database schema...');

    // First, create a custom function to execute SQL
    const createFunction = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text) 
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Try to create the function using a direct RPC call
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql: createFunction })
    }).catch(() => {}); // Ignore errors for function creation

    // Now create the tables using SQL
    const createTablesSQL = `
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

      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE protests ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow public access" ON users;
      DROP POLICY IF EXISTS "Allow public access" ON protests;

      CREATE POLICY "Allow public access" ON users FOR ALL USING (true);
      CREATE POLICY "Allow public access" ON protests FOR ALL USING (true);
    `;

    // Execute the SQL using the exec_sql function
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql: createTablesSQL })
    });

    if (response.ok) {
      console.log('✅ Database tables created successfully');
    } else {
      const error = await response.text();
      console.log('Direct SQL execution failed, trying alternative method...');
      
      // Alternative: Use the management API
      const managementResponse = await fetch(`${SUPABASE_URL}/database/query`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: createTablesSQL
        })
      });

      if (managementResponse.ok) {
        console.log('✅ Database tables created via management API');
      } else {
        console.log('Both methods failed. Tables must be created manually.');
        console.log('Use this SQL in Supabase dashboard:');
        console.log(createTablesSQL);
      }
    }

    // Test table access
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    if (testResponse.ok) {
      console.log('✅ Tables are accessible');
    } else {
      console.log('Tables need manual creation');
    }

  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupDatabase();