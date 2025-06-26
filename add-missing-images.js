
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
  console.log('🔧 Please check your environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create sample SVG images
const sampleImages = {
  'know-rights-italy.svg': `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="200" fill="#1e40af"/>
    <text x="200" y="100" text-anchor="middle" fill="white" font-size="18" font-family="Arial">Know Your Rights</text>
    <rect x="100" y="40" width="200" height="120" fill="#ffffff" opacity="0.2" rx="10"/>
    <circle cx="320" cy="60" r="25" fill="#ffffff" opacity="0.3"/>
  </svg>`,
  'find-protests.svg': `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="200" fill="#16a34a"/>
    <text x="200" y="100" text-anchor="middle" fill="white" font-size="18" font-family="Arial">Find Events</text>
    <circle cx="150" cy="70" r="30" fill="#ffffff" opacity="0.3"/>
    <circle cx="250" cy="130" r="25" fill="#ffffff" opacity="0.2"/>
    <rect x="80" y="150" width="240" height="15" fill="#ffffff" opacity="0.2" rx="7"/>
  </svg>`
};

async function addMissingImages() {
  console.log('🖼️ Adding sample images to cards without images...');
  
  try {
    // 1. Upload images to storage
    console.log('\n📤 Uploading images to whats-new bucket...');
    
    for (const [filename, svgContent] of Object.entries(sampleImages)) {
      const { data, error } = await supabase.storage
        .from('whats-new')
        .upload(filename, svgContent, {
          contentType: 'image/svg+xml',
          upsert: true
        });
      
      if (error) {
        console.error(`❌ Failed to upload ${filename}:`, error);
      } else {
        console.log(`✅ Uploaded ${filename}`);
      }
    }
    
    // 2. Update database records with image URLs
    console.log('\n🔗 Updating database records...');
    
    // Update "Know Your Rights in Italy" card
    const { data: urlData1 } = supabase.storage
      .from('whats-new')
      .getPublicUrl('know-rights-italy.svg');
    
    const { error: rightsError } = await supabase
      .from('whats_new')
      .update({ image_url: urlData1.publicUrl })
      .eq('title', 'Know Your Rights in Italy');
    
    if (rightsError) {
      console.error('❌ Error updating "Know Your Rights" card:', rightsError);
    } else {
      console.log('✅ Updated "Know Your Rights in Italy" card');
      console.log(`   Image URL: ${urlData1.publicUrl}`);
    }
    
    // Update "Find protests in your area" card
    const { data: urlData2 } = supabase.storage
      .from('whats-new')
      .getPublicUrl('find-protests.svg');
    
    const { error: findError } = await supabase
      .from('whats_new')
      .update({ image_url: urlData2.publicUrl })
      .eq('title', 'Find protests in your area');
    
    if (findError) {
      console.error('❌ Error updating "Find protests" card:', findError);
    } else {
      console.log('✅ Updated "Find protests in your area" card');
      console.log(`   Image URL: ${urlData2.publicUrl}`);
    }
    
    // 3. Verify the updates
    console.log('\n📊 Verification - checking updated cards:');
    const { data: updatedCards, error: verifyError } = await supabase
      .from('whats_new')
      .select('title, image_url')
      .in('title', ['Find protests in your area', 'Know Your Rights in Italy']);
    
    if (verifyError) {
      console.error('❌ Error during verification:', verifyError);
    } else {
      updatedCards?.forEach((card, index) => {
        console.log(`  ${index + 1}. "${card.title}"`);
        console.log(`     Image URL: ${card.image_url || 'NULL'}`);
      });
    }
    
    console.log('\n🎉 Images added successfully! All cards should now display properly.');
    
  } catch (error) {
    console.error('❌ Error adding images:', error);
  }
}

addMissingImages();
