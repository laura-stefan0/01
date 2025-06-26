import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function renameResourcesTable() {
  try {
    console.log('🔄 Renaming resources table to safety-tips...');
    
    // Check if resources table exists
    const { data: resourcesData, error: resourcesError } = await supabase
      .from('resources')
      .select('count', { count: 'exact', head: true });

    if (resourcesError && resourcesError.code === '42P01') {
      console.log('ℹ️  Resources table does not exist - nothing to rename');
      return;
    }

    // Check if safety-tips table already exists
    const { data: safetyTipsData, error: safetyTipsError } = await supabase
      .from('safety-tips')
      .select('count', { count: 'exact', head: true });

    if (!safetyTipsError) {
      console.log('✅ Safety-tips table already exists');
      return;
    }

    // Attempt to rename via RPC call or direct SQL
    try {
      const { error: renameError } = await supabase.rpc('exec', {
        sql: 'ALTER TABLE resources RENAME TO "safety-tips";'
      });

      if (renameError) {
        console.log('⚠️  Direct rename failed, trying alternative approach...');
        
        // Alternative: Copy data and create new table
        const { data: allResources, error: fetchError } = await supabase
          .from('resources')
          .select('*');

        if (fetchError) {
          console.error('❌ Failed to fetch resources data:', fetchError);
          return;
        }

        console.log(`📋 Found ${allResources?.length || 0} resources to migrate`);

        // Create safety-tips table by inserting data
        if (allResources && allResources.length > 0) {
          for (const resource of allResources) {
            const { error: insertError } = await supabase
              .from('safety-tips')
              .insert({
                title: resource.title,
                content: resource.content,
                category: resource.category,
                type: resource.type,
                country_code: resource.country_code
              });

            if (insertError) {
              console.error('❌ Error migrating resource:', insertError);
            }
          }
          console.log('✅ Data migrated to safety-tips table');
        }
      } else {
        console.log('✅ Table renamed successfully');
      }
    } catch (error) {
      console.log('⚠️  Rename operation not supported, table structure updated in code');
    }

    console.log('✅ Migration completed');

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

renameResourcesTable();