import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixWhatsNewImages() {
  console.log('🔧 Fixing What\'s New images...');
  
  try {
    // 1. Check current state of database
    console.log('🔍 Checking current database state...');
    const { data: currentData, error: currentError } = await supabase
      .from('whats_new')
      .select('id, title, image_url')
      .order('created_at', { ascending: false });
    
    if (currentError) {
      console.error('❌ Error fetching current data:', currentError);
      return;
    }
    
    console.log('📊 Current database state:');
    currentData?.forEach((item, index) => {
      console.log(`  ${index + 1}. "${item.title}" - Image URL: ${item.image_url || 'NULL'}`);
    });
    
    // 2. Check what images are available in the whats-new bucket
    console.log('\n🔍 Checking whats-new storage bucket...');
    const { data: bucketFiles, error: bucketError } = await supabase.storage
      .from('whats-new')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      
    if (bucketError) {
      console.error('❌ Error accessing whats-new bucket:', bucketError);
      return;
    }
    
    console.log(`📁 Found ${bucketFiles?.length || 0} files in whats-new bucket:`);
    bucketFiles?.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name}`);
    });
    
    // 3. Create image mapping and update database
    if (currentData && bucketFiles && bucketFiles.length > 0) {
      console.log('\n🔗 Updating database records with image URLs...');
      
      const imageMapping = {
        'Climate Activists Rally for Green New Deal': 'climate-rally.svg',
        'Workers Unite for Fair Wage Legislation': 'workers-unite.svg', 
        'Student Movement Gains Momentum': 'student-movement.svg',
        'Test': 'test-news.svg'
      };
      
      for (const record of currentData) {
        const imageName = imageMapping[record.title];
        
        if (imageName && bucketFiles.find(f => f.name === imageName)) {
          // Get public URL for the image
          const { data: urlData } = supabase.storage
            .from('whats-new')
            .getPublicUrl(imageName);
          
          const imageUrl = urlData.publicUrl;
          
          // Update the database record
          const { error: updateError } = await supabase
            .from('whats_new')
            .update({ image_url: imageUrl })
            .eq('id', record.id);
          
          if (updateError) {
            console.error(`❌ Failed to update "${record.title}":`, updateError);
          } else {
            console.log(`✅ Updated "${record.title}" with image: ${imageName}`);
            console.log(`   URL: ${imageUrl}`);
          }
        } else {
          console.log(`⚠️ No matching image found for "${record.title}"`);
        }
      }
    }
    
    // 4. Verify the fix
    console.log('\n🔍 Verifying the fix...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('whats_new')
      .select('id, title, image_url')
      .order('created_at', { ascending: false });
    
    if (verifyError) {
      console.error('❌ Error during verification:', verifyError);
      return;
    }
    
    console.log('📋 Final verification:');
    let successCount = 0;
    verifyData?.forEach((item, index) => {
      const hasImage = item.image_url && item.image_url !== null;
      if (hasImage) successCount++;
      console.log(`  ${index + 1}. "${item.title}" - ${hasImage ? '✅ Has image' : '❌ No image'}`);
    });
    
    console.log(`\n🎉 Fix completed! ${successCount}/${verifyData?.length || 0} items now have images.`);
    
  } catch (error) {
    console.error('❌ Error fixing What\'s New images:', error);
  }
}

fixWhatsNewImages();