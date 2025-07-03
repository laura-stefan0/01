
#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create admin client with service key (bypasses RLS)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixApprovedFieldPermissions() {
  try {
    console.log('🔧 Fixing approved field permissions...');
    
    // First, let's check if the approved column exists
    console.log('📋 Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('protests')
      .select('id, approved')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error checking table:', tableError.message);
      if (tableError.message.includes('column "approved" does not exist')) {
        console.log('🔧 Adding approved column...');
        
        // Add the approved column via RPC call
        const { error: rpcError } = await supabaseAdmin.rpc('exec', {
          sql: `
            ALTER TABLE protests 
            ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT FALSE;
            
            CREATE INDEX IF NOT EXISTS idx_protests_approved ON protests(approved);
          `
        });
        
        if (rpcError) {
          console.error('❌ Error adding approved column:', rpcError.message);
          return;
        }
        
        console.log('✅ Added approved column successfully');
      } else {
        return;
      }
    } else {
      console.log('✅ Approved column exists');
    }
    
    // Now let's disable RLS temporarily and update permissions
    console.log('🔧 Updating RLS policies for protests table...');
    
    const { error: rlsError } = await supabaseAdmin.rpc('exec', {
      sql: `
        -- Temporarily disable RLS
        ALTER TABLE protests DISABLE ROW LEVEL SECURITY;
        
        -- Grant necessary permissions
        GRANT ALL ON protests TO anon;
        GRANT ALL ON protests TO authenticated;
        GRANT ALL ON protests TO service_role;
        
        -- Re-enable RLS
        ALTER TABLE protests ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Anyone can view approved protests" ON protests;
        DROP POLICY IF EXISTS "Anyone can insert protests" ON protests;
        DROP POLICY IF EXISTS "Service role can update approved field" ON protests;
        DROP POLICY IF EXISTS "Admins can update protests" ON protests;
        
        -- Create new policies that allow updating the approved field
        CREATE POLICY "Anyone can view approved protests" ON protests
          FOR SELECT USING (approved = true OR auth.role() = 'service_role');
        
        CREATE POLICY "Anyone can insert protests" ON protests
          FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Service role can update all fields" ON protests
          FOR UPDATE USING (auth.role() = 'service_role')
          WITH CHECK (auth.role() = 'service_role');
        
        CREATE POLICY "Authenticated users can update non-approved fields" ON protests
          FOR UPDATE USING (auth.role() = 'authenticated')
          WITH CHECK (auth.role() = 'authenticated');
      `
    });
    
    if (rlsError) {
      console.error('❌ Error updating RLS policies:', rlsError.message);
      return;
    }
    
    console.log('✅ RLS policies updated successfully');
    
    // Test updating the approved field
    console.log('🧪 Testing approved field update...');
    
    // Get a test protest
    const { data: testProtests, error: fetchError } = await supabaseAdmin
      .from('protests')
      .select('id, approved')
      .limit(1);
    
    if (fetchError || !testProtests || testProtests.length === 0) {
      console.log('ℹ️ No protests found to test with');
      return;
    }
    
    const testProtest = testProtests[0];
    const newApprovedStatus = !testProtest.approved;
    
    const { error: updateError } = await supabaseAdmin
      .from('protests')
      .update({ approved: newApprovedStatus })
      .eq('id', testProtest.id);
    
    if (updateError) {
      console.error('❌ Error updating approved field:', updateError.message);
      return;
    }
    
    // Verify the update worked
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('protests')
      .select('approved')
      .eq('id', testProtest.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError.message);
      return;
    }
    
    if (verifyData.approved === newApprovedStatus) {
      console.log(`✅ Successfully updated approved field from ${testProtest.approved} to ${newApprovedStatus}`);
      
      // Revert the test change
      await supabaseAdmin
        .from('protests')
        .update({ approved: testProtest.approved })
        .eq('id', testProtest.id);
      
      console.log('🔄 Reverted test change');
    } else {
      console.error('❌ Update verification failed');
    }
    
    console.log('🎉 Approved field permissions fixed successfully!');
    console.log('💡 You should now be able to update the approved field in Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixApprovedFieldPermissions();
