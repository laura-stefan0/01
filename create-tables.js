import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createTables() {
  try {
    console.log('Creating users table...');
    
    // Create users table using raw SQL
    const createUsersTable = `
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

    const { data: usersResult, error: usersError } = await supabase.rpc('exec_sql', { 
      sql: createUsersTable 
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('Users table created successfully');
    }

    console.log('Creating protests table...');
    
    // Create protests table
    const createProtestsTable = `
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

    const { data: protestsResult, error: protestsError } = await supabase.rpc('exec_sql', { 
      sql: createProtestsTable 
    });

    if (protestsError) {
      console.error('Error creating protests table:', protestsError);
    } else {
      console.log('Protests table created successfully');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTables();