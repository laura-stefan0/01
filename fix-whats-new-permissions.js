import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

console.log('⚠️ Note: Using anon key since service key is not available in environment.');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixWhatsNewPermissions() {
  console.log('🔧 Fixing whats_new table permissions...');
  
  try {
    // Check current table structure and permissions
    console.log('📊 Checking whats_new table structure...');
    
    const { data: tableData, error: tableError } = await supabase
      .from('whats_new')
      .select('*')
      .limit(5);
    
    if (tableError) {
      console.error('❌ Error accessing whats_new table:', tableError);
      return;
    }
    
    console.log(`✅ Successfully accessed whats_new table. Found ${tableData?.length || 0} items.`);
    
    // Test insert operation
    console.log('🧪 Testing insert operation...');
    
    const testData = {
      title: "Test Insert Permissions",
      body: "Testing if we can insert into whats_new table",
      country_code: "US",
      visible: true
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('whats_new')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      console.log('🔧 This indicates the table has RLS (Row Level Security) enabled or permission issues.');
      
      // Try to disable RLS or create policies if needed
      console.log('📝 The table likely needs RLS policies or RLS disabled for full access.');
      console.log('💡 You can fix this in Supabase Dashboard:');
      console.log('   1. Go to Authentication > Policies');
      console.log('   2. Find the whats_new table');
      console.log('   3. Either disable RLS or create insert/update/delete policies');
      
    } else {
      console.log('✅ Insert test successful!', insertData);
      
      // Clean up test data
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('whats_new')
          .delete()
          .eq('id', insertData[0].id);
        
        if (deleteError) {
          console.log('⚠️ Could not delete test data:', deleteError);
        } else {
          console.log('🧹 Test data cleaned up successfully');
        }
      }
    }
    
    // Test update operation
    console.log('🧪 Testing update operation...');
    
    if (tableData && tableData[0]) {
      const { data: updateData, error: updateError } = await supabase
        .from('whats_new')
        .update({ body: tableData[0].body + ' (updated)' })
        .eq('id', tableData[0].id)
        .select();
      
      if (updateError) {
        console.error('❌ Update test failed:', updateError);
      } else {
        console.log('✅ Update test successful!');
        
        // Revert the update
        const { error: revertError } = await supabase
          .from('whats_new')
          .update({ body: tableData[0].body })
          .eq('id', tableData[0].id);
        
        if (revertError) {
          console.log('⚠️ Could not revert test update:', revertError);
        } else {
          console.log('🔄 Test update reverted');
        }
      }
    }
    
    console.log('🎯 Permission check completed!');
    
  } catch (error) {
    console.error('❌ Error during permission check:', error);
  }
}

fixWhatsNewPermissions();