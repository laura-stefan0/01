import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createTables() {
  try {
    console.log('Creating database tables...');

    // Create users table
    const createUsersTableSQL = `
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

    const { data: usersResult, error: usersError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createUsersTableSQL
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('✅ Users table created successfully');
    }

    // Create protests table
    const createProtestsTableSQL = `
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

    const { data: protestsResult, error: protestsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createProtestsTableSQL
    });

    if (protestsError) {
      console.error('Error creating protests table:', protestsError);
    } else {
      console.log('✅ Protests table created successfully');
    }

    // Enable RLS and create policies
    const enableRLSSQL = `
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE protests ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Allow public access" ON users FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "Allow public access" ON protests FOR ALL USING (true);
    `;

    const { data: rlsResult, error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: enableRLSSQL
    });

    if (rlsError) {
      console.error('Error setting up RLS policies:', rlsError);
    } else {
      console.log('✅ RLS policies created successfully');
    }

    console.log('Database setup complete!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTables();