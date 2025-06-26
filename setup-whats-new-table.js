import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL not found in environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupWhatsNewTable() {
  try {
    console.log('🔍 Setting up whats-new table...');
    
    // Create the whats-new table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS "whats-new" (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          summary TEXT NOT NULL,
          content TEXT,
          country_code TEXT NOT NULL DEFAULT 'IT',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.error('❌ Error creating table:', createError);
      return;
    }

    console.log('✅ Table created successfully');

    // Insert sample data
    const sampleData = [
      {
        title: "Climate Activists Rally for Green New Deal",
        summary: "Major cities see coordinated protests for environmental policy reform",
        country_code: "IT",
        content: "Activists across Italy are organizing coordinated climate strikes demanding immediate action on environmental policies."
      },
      {
        title: "Workers Unite for Fair Wage Legislation", 
        summary: "Labor unions organize nationwide for minimum wage increases",
        country_code: "IT",
        content: "Italian labor unions are pushing for significant minimum wage increases and better working conditions."
      },
      {
        title: "Student Movement Gains Momentum",
        summary: "University campuses join forces for education reform",
        country_code: "IT", 
        content: "Students across Italian universities are organizing protests for education reform and reduced tuition fees."
      }
    ];

    const { error: insertError } = await supabase
      .from('whats-new')
      .insert(sampleData);

    if (insertError) {
      console.error('❌ Error inserting sample data:', insertError);
      return;
    }

    console.log('✅ Sample data inserted successfully');
    console.log('🎉 What\'s New table setup completed!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupWhatsNewTable();