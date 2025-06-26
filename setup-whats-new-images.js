import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create sample image data (SVG strings)
const sampleImages = [
  {
    name: 'climate-rally.svg',
    content: `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#22c55e"/>
      <text x="200" y="100" text-anchor="middle" fill="white" font-size="20" font-family="Arial">Climate Action</text>
      <circle cx="100" cy="50" r="30" fill="#ffffff" opacity="0.3"/>
      <circle cx="300" cy="150" r="40" fill="#ffffff" opacity="0.2"/>
    </svg>`,
    title: 'Climate Activists Rally for Green New Deal'
  },
  {
    name: 'workers-unite.svg',
    content: `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#ef4444"/>
      <text x="200" y="100" text-anchor="middle" fill="white" font-size="20" font-family="Arial">Workers Unite</text>
      <polygon points="150,50 250,50 200,100" fill="#ffffff" opacity="0.3"/>
      <rect x="50" y="150" width="300" height="20" fill="#ffffff" opacity="0.2"/>
    </svg>`,
    title: 'Workers Unite for Fair Wage Legislation'
  },
  {
    name: 'student-movement.svg',
    content: `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#3b82f6"/>
      <text x="200" y="100" text-anchor="middle" fill="white" font-size="20" font-family="Arial">Student Power</text>
      <rect x="100" y="40" width="200" height="120" fill="#ffffff" opacity="0.2" rx="10"/>
      <circle cx="300" cy="60" r="25" fill="#ffffff" opacity="0.3"/>
    </svg>`,
    title: 'Student Movement Gains Momentum'
  },
  {
    name: 'test-news.svg',
    content: `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#8b5cf6"/>
      <text x="200" y="100" text-anchor="middle" fill="white" font-size="20" font-family="Arial">Breaking News</text>
      <rect x="50" y="50" width="100" height="100" fill="#ffffff" opacity="0.2" rx="5"/>
      <rect x="250" y="50" width="100" height="100" fill="#ffffff" opacity="0.2" rx="5"/>
    </svg>`,
    title: 'Test'
  }
];

async function setupWhatsNewImages() {
  console.log('🚀 Setting up What\'s New images...');
  
  try {
    // 1. Upload images to whats-new bucket
    console.log('📤 Uploading images to whats-new bucket...');
    
    const uploadPromises = sampleImages.map(async (imageData) => {
      const { data, error } = await supabase.storage
        .from('whats-new')
        .upload(imageData.name, imageData.content, {
          contentType: 'image/svg+xml',
          upsert: true
        });
      
      if (error) {
        console.error(`❌ Failed to upload ${imageData.name}:`, error);
        return null;
      }
      
      console.log(`✅ Uploaded ${imageData.name}`);
      return { ...imageData, path: data.path };
    });
    
    const uploadResults = await Promise.all(uploadPromises);
    const successfulUploads = uploadResults.filter(result => result !== null);
    
    console.log(`✅ Successfully uploaded ${successfulUploads.length} images`);
    
    // 2. Get all what's new records from database
    console.log('📊 Fetching what\'s new records from database...');
    
    const { data: newsRecords, error: fetchError } = await supabase
      .from('whats_new')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Error fetching news records:', fetchError);
      return;
    }
    
    console.log(`📋 Found ${newsRecords?.length || 0} news records`);
    
    // 3. Update records with image URLs
    if (newsRecords && newsRecords.length > 0) {
      console.log('🔗 Linking images to news records...');
      
      const updatePromises = newsRecords.map(async (record, index) => {
        // Find matching image by title or use index-based assignment
        const matchingImage = successfulUploads.find(img => 
          record.title.includes(img.title) || img.title.includes(record.title)
        ) || successfulUploads[index % successfulUploads.length];
        
        if (matchingImage) {
          const { data: urlData } = supabase.storage
            .from('whats-new')
            .getPublicUrl(matchingImage.name);
          
          const { error: updateError } = await supabase
            .from('whats_new')
            .update({ image_url: urlData.publicUrl })
            .eq('id', record.id);
          
          if (updateError) {
            console.error(`❌ Failed to update record ${record.id}:`, updateError);
            return null;
          }
          
          console.log(`✅ Updated "${record.title}" with image: ${matchingImage.name}`);
          return record.id;
        }
        
        return null;
      });
      
      const updateResults = await Promise.all(updatePromises);
      const successfulUpdates = updateResults.filter(result => result !== null);
      
      console.log(`✅ Successfully updated ${successfulUpdates.length} records with images`);
    }
    
    // 4. Verify the setup
    console.log('🔍 Verifying setup...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('whats_new')
      .select('id, title, image_url')
      .order('created_at', { ascending: false });
    
    if (verifyError) {
      console.error('❌ Error verifying setup:', verifyError);
      return;
    }
    
    console.log('📋 Final verification:');
    verifyData?.forEach(record => {
      console.log(`  - "${record.title}": ${record.image_url ? '✅ Has image' : '❌ No image'}`);
    });
    
    console.log('🎉 What\'s New images setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up What\'s New images:', error);
  }
}

setupWhatsNewImages();