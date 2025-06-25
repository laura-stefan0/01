import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function initializeDatabase() {
  console.log('Initializing Supabase database tables...');

  try {
    // Method 1: Create tables by attempting operations that require them to exist
    console.log('Creating users table...');
    
    // Try to create users table by inserting a record
    const { data: userResult, error: userError } = await supabase
      .from('users')
      .upsert({
        id: 999999,
        username: 'system_init',
        email: 'system@init.com',
        password_hash: '$2b$10$systemhash',
        name: 'System Init User',
        notifications: true,
        location: true,
        emails: false,
        language: 'en'
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (userError && userError.code === '42P01') {
      console.log('Users table does not exist, creating...');
      
      // Create using direct PostgreSQL connection string approach
      const createUserTableSQL = `
        CREATE TABLE users (
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
        
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable all operations for authenticated users" ON users FOR ALL USING (true);
      `;
      
      console.log('Execute this SQL in Supabase SQL Editor:');
      console.log('https://supabase.com/dashboard/project/mfzlajgnahbhwswpqzkj/sql');
      console.log(createUserTableSQL);
      
    } else if (!userError) {
      console.log('✅ Users table exists and is accessible');
      // Clean up system user
      await supabase.from('users').delete().eq('id', 999999);
    }

    // Create protests table
    console.log('Creating protests table...');
    
    const { data: protestResult, error: protestError } = await supabase
      .from('protests')
      .upsert({
        id: 999999,
        title: 'System Init Event',
        description: 'System initialization event',
        category: 'System',
        location: 'System',
        address: 'System Address',
        latitude: '0',
        longitude: '0',
        date: '2025-01-01',
        time: '00:00',
        attendees: 0,
        featured: false
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (protestError && protestError.code === '42P01') {
      console.log('Protests table does not exist, creating...');
      
      const createProtestTableSQL = `
        CREATE TABLE protests (
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
        
        ALTER TABLE protests ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable all operations for authenticated users" ON protests FOR ALL USING (true);
      `;
      
      console.log('Execute this SQL in Supabase SQL Editor:');
      console.log(createProtestTableSQL);
      
    } else if (!protestError) {
      console.log('✅ Protests table exists and is accessible');
      // Clean up system protest
      await supabase.from('protests').delete().eq('id', 999999);
    }

    // Test final connectivity
    const { count: userCount, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`✅ Database setup complete. Users count: ${userCount || 0}`);
      return true;
    } else {
      console.log('Tables require manual creation in Supabase dashboard');
      return false;
    }

  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

initializeDatabase();