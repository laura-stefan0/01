import { createClient } from '@supabase/supabase-js';

// Hard-coded for script execution
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamdnaWhiaHdzd3BxemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTA2Njc0NiwiZXhwIjoyMDUwNjQyNzQ2fQ.mUvs7HJQJuHfCNuWpPRkZgMRKZVdLQQ_0QLQ7Nz0MdE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Standard fallback images for each category
const categoryFallbackImages = {
  'Environment': 'https://images.unsplash.com/photo-1573160813959-c9157b3f8e7c?w=800&h=600&fit=crop&auto=format',
  'LGBTQ+': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&auto=format',
  'Women\'s Rights': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&auto=format',
  'Labor': 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=800&h=600&fit=crop&auto=format',
  'Racial & Social Justice': 'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=800&h=600&fit=crop&auto=format',
  'Civil & Human Rights': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format',
  'Healthcare & Education': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&auto=format',
  'Peace & Anti-War': 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=600&fit=crop&auto=format',
  'Transparency & Anti-Corruption': 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=600&fit=crop&auto=format',
  'Other': 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=600&fit=crop&auto=format'
};

async function checkImageAvailability(url) {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
    return response.ok;
  } catch (error) {
    console.log(`Image not available: ${url}`);
    return false;
  }
}

async function fixMissingImages() {
  console.log('🔍 Checking for missing or broken images...');
  
  try {
    // Get all protests from database
    const { data: protests, error } = await supabase
      .from('protests')
      .select('*');
    
    if (error) {
      console.error('Error fetching protests:', error);
      return;
    }
    
    console.log(`📊 Found ${protests.length} protests to check`);
    
    let fixedCount = 0;
    
    for (const protest of protests) {
      let needsUpdate = false;
      let newImageUrl = protest.image_url;
      
      // Check if image_url is missing or broken
      if (!protest.image_url) {
        console.log(`❌ Missing image for: ${protest.title}`);
        newImageUrl = categoryFallbackImages[protest.category] || categoryFallbackImages['Other'];
        needsUpdate = true;
      } else {
        // Check if current image is accessible
        const isAvailable = await checkImageAvailability(protest.image_url);
        if (!isAvailable) {
          console.log(`🔗 Broken image for: ${protest.title}`);
          newImageUrl = categoryFallbackImages[protest.category] || categoryFallbackImages['Other'];
          needsUpdate = true;
        }
      }
      
      // Update if needed
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('protests')
          .update({ image_url: newImageUrl })
          .eq('id', protest.id);
        
        if (updateError) {
          console.error(`Error updating ${protest.title}:`, updateError);
        } else {
          console.log(`✅ Fixed image for: ${protest.title} -> ${protest.category}`);
          fixedCount++;
        }
      }
    }
    
    console.log(`\n🎉 Image fixing completed!`);
    console.log(`📈 Fixed ${fixedCount} out of ${protests.length} events`);
    
    // Log category breakdown
    const categoryCounts = {};
    protests.forEach(protest => {
      categoryCounts[protest.category] = (categoryCounts[protest.category] || 0) + 1;
    });
    
    console.log('\n📊 Events by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} events`);
    });
    
  } catch (error) {
    console.error('❌ Error in fixMissingImages:', error);
  }
}

// Run the fix
fixMissingImages().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});