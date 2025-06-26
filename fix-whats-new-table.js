
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixWhatsNewTable() {
  try {
    console.log('🔧 Adding country_code column to whats_new table...');
    
    // Add country_code column if it doesn't exist
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE whats_new 
        ADD COLUMN IF NOT EXISTS country_code TEXT NOT NULL DEFAULT 'IT';
      `
    });

    if (alterError) {
      console.error('❌ Error adding country_code column:', alterError);
      return;
    }

    console.log('✅ Successfully added country_code column');

    // Update existing records to have IT as country_code
    const { error: updateError } = await supabase
      .from('whats_new')
      .update({ country_code: 'IT' })
      .is('country_code', null);

    if (updateError) {
      console.error('❌ Error updating existing records:', updateError);
      return;
    }

    console.log('✅ Updated existing records with country_code: IT');
    console.log('🎉 whats_new table fix completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixWhatsNewTable();
