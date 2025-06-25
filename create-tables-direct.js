import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  try {
    console.log('Creating users table...');
    
    // Create users table by inserting and then deleting a test record
    // This approach works around Supabase's limitations with direct DDL
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        username: 'test_setup_user',
        email: 'setup@test.com',
        password_hash: 'test_hash',
        name: 'Setup Test User'
      })
      .select()
      .single();

    if (userError) {
      if (userError.code === '42P01') {
        console.log('Users table does not exist, attempting to create schema...');
        
        // Use the management API to create the table
        const tableCreationSQL = `
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
        `;
        
        console.log('Tables need to be created manually in Supabase dashboard');
        console.log('SQL to execute:', tableCreationSQL);
      } else {
        console.error('Error with users table:', userError);
      }
    } else {
      console.log('✅ Users table exists and is working');
      // Clean up test user
      await supabase.from('users').delete().eq('id', userData.id);
    }

    // Test protests table
    console.log('Testing protests table...');
    const { data: protestData, error: protestError } = await supabase
      .from('protests')
      .insert({
        title: 'Test Protest',
        description: 'Test Description',
        category: 'Test',
        location: 'Test Location',
        address: 'Test Address',
        latitude: '0',
        longitude: '0',
        date: '2025-01-01',
        time: '12:00',
        attendees: 0,
        featured: false
      })
      .select()
      .single();

    if (protestError) {
      if (protestError.code === '42P01') {
        console.log('Protests table does not exist');
        const protestTableSQL = `
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
        `;
        console.log('SQL for protests table:', protestTableSQL);
      } else {
        console.error('Error with protests table:', protestError);
      }
    } else {
      console.log('✅ Protests table exists and is working');
      // Clean up test protest
      await supabase.from('protests').delete().eq('id', protestData.id);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTables();