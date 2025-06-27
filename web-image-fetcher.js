import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Use environment variables 
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamdnaWhiaHdzd3BxemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTA2Njc0NiwiZXhwIjoyMDUwNjQyNzQ2fQ.mUvs7HJQJuHfCNuWpPRkZgMRKZVdLQQ_0QLQ7Nz0MdE';

console.log('Using SUPABASE_URL:', SUPABASE_URL);
console.log('Service key length:', SUPABASE_SERVICE_KEY ? SUPABASE_SERVICE_KEY.length : 'undefined');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Category-specific fallback images (high quality)
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

// Check if an image URL is accessible
async function validateImageUrl(url) {
  try {
    const response = await axios.head(url, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const contentType = response.headers['content-type'];
    return contentType && contentType.startsWith('image/');
  } catch (error) {
    return false;
  }
}

// Search for images based on category and event details
async function findWebImage(protest) {
  const { category, title, location } = protest;
  
  // Category-specific search terms
  const searchTerms = {
    'Environment': ['climate protest italy', 'environmental demonstration', 'green activism'],
    'LGBTQ+': ['pride parade italy', 'lgbtq demonstration', 'rainbow protest'],
    'Women\'s Rights': ['women protest italy', 'feminist demonstration', 'gender equality march'],
    'Labor': ['workers protest italy', 'labor strike', 'union demonstration'],
    'Racial & Social Justice': ['social justice italy', 'racial equality protest', 'justice demonstration'],
    'Civil & Human Rights': ['human rights italy', 'civil rights protest', 'freedom demonstration'],
    'Healthcare & Education': ['education protest italy', 'student demonstration', 'healthcare protest'],
    'Peace & Anti-War': ['peace march italy', 'anti war protest', 'peace demonstration'],
    'Transparency & Anti-Corruption': ['anti corruption italy', 'transparency protest', 'governance demonstration'],
    'Other': ['protest italy', 'demonstration', 'activism']
  };

  const terms = searchTerms[category] || searchTerms['Other'];
  
  // Try different image sources
  for (const term of terms) {
    try {
      // Use Unsplash Source API (no API key required)
      const unsplashUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(term)}`;
      console.log(`Testing Unsplash image for "${term}": ${unsplashUrl}`);
      
      const isValid = await validateImageUrl(unsplashUrl);
      if (isValid) {
        console.log(`Found valid web image: ${unsplashUrl}`);
        return unsplashUrl;
      }
    } catch (error) {
      console.log(`Failed to fetch image for "${term}":`, error.message);
    }
  }
  
  return null;
}

// Update all protest images
async function updateAllProtestImages() {
  console.log('Starting web image fetcher...');
  
  try {
    // Test Supabase connection first
    const { data: testData, error: testError } = await supabase
      .from('protests')
      .select('count(*)');
    
    if (testError) {
      console.error('Supabase connection failed:', testError);
      return;
    }
    
    console.log('Supabase connection successful');
    
    // Get all protests
    const { data: protests, error } = await supabase
      .from('protests')
      .select('*');
    
    if (error) {
      console.error('Error fetching protests:', error);
      return;
    }
    
    console.log(`Found ${protests.length} protests to process`);
    
    let updated = 0;
    let webFetched = 0;
    let fallbackUsed = 0;
    
    for (const protest of protests) {
      console.log(`\nProcessing: ${protest.title}`);
      
      // Check if image needs updating
      let needsUpdate = false;
      
      if (!protest.image_url || protest.image_url.trim() === '') {
        console.log('No image URL found');
        needsUpdate = true;
      } else {
        console.log(`Checking existing image: ${protest.image_url}`);
        const isValid = await validateImageUrl(protest.image_url);
        if (!isValid) {
          console.log('Invalid image URL');
          needsUpdate = true;
        } else {
          console.log('Valid image found, skipping');
          continue;
        }
      }
      
      if (needsUpdate) {
        // Try to find web image first
        let newImageUrl = await findWebImage(protest);
        
        if (newImageUrl) {
          console.log(`Using web-fetched image: ${newImageUrl}`);
          webFetched++;
        } else {
          // Use category fallback
          newImageUrl = categoryFallbackImages[protest.category] || categoryFallbackImages['Other'];
          console.log(`Using fallback image for ${protest.category}: ${newImageUrl}`);
          fallbackUsed++;
        }
        
        // Update database
        const { error: updateError } = await supabase
          .from('protests')
          .update({ image_url: newImageUrl })
          .eq('id', protest.id);
        
        if (updateError) {
          console.error(`Error updating ${protest.title}:`, updateError);
        } else {
          console.log(`Successfully updated image for: ${protest.title}`);
          updated++;
        }
        
        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\nImage update completed!');
    console.log(`Statistics:`);
    console.log(`  Total protests: ${protests.length}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Web-fetched: ${webFetched}`);
    console.log(`  Fallbacks used: ${fallbackUsed}`);
    console.log(`  Already valid: ${protests.length - updated}`);
    
  } catch (error) {
    console.error('Error in web image fetcher:', error);
  }
}

// Run the image fetcher
updateAllProtestImages().then(() => {
  console.log('Process completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});