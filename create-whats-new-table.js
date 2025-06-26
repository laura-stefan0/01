import { supabase } from './db/index.js';

async function createWhatsNewTable() {
  try {
    console.log('🔍 Creating whats-new table...');
    
    // Create the whats-new table using direct SQL
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
      console.log('❌ RPC method failed, trying direct SQL approach...');
      
      // Alternative approach: use raw SQL if RPC fails
      const { error: altError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'whats-new')
        .single();
        
      if (altError && altError.code === 'PGRST116') {
        // Table doesn't exist, let's try creating it through a different method
        console.log('✅ Table does not exist, we need to create it manually in Supabase');
        console.log('Please create the table manually in Supabase with this SQL:');
        console.log(`
CREATE TABLE "whats-new" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  country_code TEXT NOT NULL DEFAULT 'IT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
        `);
        return;
      }
    } else {
      console.log('✅ Table created successfully');
    }

    // Insert sample data
    const sampleData = [
      {
        title: "Climate Activists Rally for Green New Deal",
        summary: "Major cities see coordinated protests for environmental policy reform",
        country_code: "IT"
      },
      {
        title: "Workers Unite for Fair Wage Legislation", 
        summary: "Labor unions organize nationwide for minimum wage increases",
        country_code: "IT"
      },
      {
        title: "Student Movement Gains Momentum",
        summary: "University campuses join forces for education reform",
        country_code: "IT"
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

createWhatsNewTable();