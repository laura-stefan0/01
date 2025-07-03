import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = "https://mfzlajgnahbhwswpqzkj.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createSavedProtestsTables() {
  try {
    console.log('🔧 Creating saved_protests table...');
    
    // Create saved_protests table
    const { error: savedProtestsError } = await supabaseAdmin.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS saved_protests (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          protest_id TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, protest_id)
        );
      `
    });

    if (savedProtestsError) {
      console.error('❌ Error creating saved_protests table:', savedProtestsError);
    } else {
      console.log('✅ saved_protests table created successfully');
    }

    console.log('🔧 Creating archived_protests table...');
    
    // Create archived_protests table
    const { error: archivedProtestsError } = await supabaseAdmin.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS archived_protests (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          protest_id TEXT NOT NULL,
          checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          notes TEXT,
          UNIQUE(user_id, protest_id)
        );
      `
    });

    if (archivedProtestsError) {
      console.error('❌ Error creating archived_protests table:', archivedProtestsError);
    } else {
      console.log('✅ archived_protests table created successfully');
    }

    console.log('🔧 Setting up RLS policies...');
    
    // Enable RLS and create policies for saved_protests
    const { error: rlsError1 } = await supabaseAdmin.rpc('sql', {
      query: `
        ALTER TABLE saved_protests ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own saved protests" ON saved_protests
        FOR SELECT USING (auth.uid() = user_id::text);
        
        CREATE POLICY "Users can insert their own saved protests" ON saved_protests
        FOR INSERT WITH CHECK (auth.uid() = user_id::text);
        
        CREATE POLICY "Users can delete their own saved protests" ON saved_protests
        FOR DELETE USING (auth.uid() = user_id::text);
      `
    });

    if (rlsError1) {
      console.error('❌ Error setting up saved_protests RLS:', rlsError1);
    } else {
      console.log('✅ saved_protests RLS policies created successfully');
    }

    // Enable RLS and create policies for archived_protests
    const { error: rlsError2 } = await supabaseAdmin.rpc('sql', {
      query: `
        ALTER TABLE archived_protests ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own archived protests" ON archived_protests
        FOR SELECT USING (auth.uid() = user_id::text);
        
        CREATE POLICY "Users can insert their own archived protests" ON archived_protests
        FOR INSERT WITH CHECK (auth.uid() = user_id::text);
        
        CREATE POLICY "Users can update their own archived protests" ON archived_protests
        FOR UPDATE USING (auth.uid() = user_id::text);
      `
    });

    if (rlsError2) {
      console.error('❌ Error setting up archived_protests RLS:', rlsError2);
    } else {
      console.log('✅ archived_protests RLS policies created successfully');
    }

  } catch (error) {
    console.error('❌ Error in createSavedProtestsTables:', error);
  }
}

// Run the function
createSavedProtestsTables();