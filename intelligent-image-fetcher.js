import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Supabase configuration
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamdnaWhiaHdzd3BxemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTA2Njc0NiwiZXhwIjoyMDUwNjQyNzQ2fQ.mUvs7HJQJuHfCNuWpPRkZgMRKZVdLQQ_0QLQ7Nz0MdE';

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

// Image search sources with category-specific keywords
const getImageSearchKeywords = (category, title, location) => {
  const baseKeywords = {
    'Environment': ['environmental protest', 'climate change demonstration', 'green activism', 'climate strike'],
    'LGBTQ+': ['pride parade', 'lgbtq protest', 'rainbow flag demonstration', 'pride march'],
    'Women\'s Rights': ['women protest', 'feminist demonstration', 'gender equality march', 'women rights'],
    'Labor': ['workers protest', 'labor strike', 'union demonstration', 'workers rights'],
    'Racial & Social Justice': ['social justice protest', 'racial equality march', 'civil rights demonstration', 'justice rally'],
    'Civil & Human Rights': ['human rights protest', 'civil rights march', 'freedom demonstration', 'human rights rally'],
    'Healthcare & Education': ['education protest', 'healthcare demonstration', 'student march', 'education rights'],
    'Peace & Anti-War': ['peace march', 'anti war protest', 'peace demonstration', 'pacifist rally'],
    'Transparency & Anti-Corruption': ['anti corruption protest', 'transparency demonstration', 'accountability march', 'governance protest'],
    'Other': ['protest', 'demonstration', 'march', 'rally']
  };

  const keywords = baseKeywords[category] || baseKeywords['Other'];
  
  // Add location-specific keywords
  const locationKeywords = [];
  if (location.includes('Milano')) locationKeywords.push('milano protest', 'milan demonstration');
  if (location.includes('Roma')) locationKeywords.push('roma protest', 'rome demonstration');
  if (location.includes('Italy')) locationKeywords.push('italy protest', 'italian demonstration');

  return [...keywords, ...locationKeywords];
};

// Check if an image URL is accessible and valid
async function validateImageUrl(url) {
  try {
    const response = await axios.head(url, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const contentType = response.headers['content-type'];
    const contentLength = parseInt(response.headers['content-length']) || 0;
    
    // Check if it's an image and has reasonable size
    if (contentType && contentType.startsWith('image/') && contentLength > 1000) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Search for images using Unsplash API (requires no API key for basic searches)
async function searchUnsplashImages(keywords, category) {
  const searchTerms = keywords.slice(0, 3); // Use top 3 keywords
  
  for (const keyword of searchTerms) {
    try {
      console.log(`🔍 Searching Unsplash for: "${keyword}"`);
      
      // Using Unsplash Source API (no API key required)
      const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)}`;
      
      // Validate the image
      const isValid = await validateImageUrl(imageUrl);
      if (isValid) {
        console.log(`✅ Found valid image for "${keyword}": ${imageUrl}`);
        return imageUrl;
      }
    } catch (error) {
      console.log(`❌ Failed to fetch image for "${keyword}":`, error.message);
    }
  }
  
  return null;
}

// Search for images from Pixabay (backup source)
async function searchPixabayImages(keywords, category) {
  // Using Pixabay's public API endpoint (limited but no key required)
  const searchTerms = keywords.slice(0, 2);
  
  for (const keyword of searchTerms) {
    try {
      console.log(`🔍 Searching Pixabay for: "${keyword}"`);
      
      const imageUrl = `https://pixabay.com/get/g/${Math.floor(Math.random() * 1000000)}-${encodeURIComponent(keyword)}/`;
      
      // For Pixabay, we'll use a more direct approach with common image IDs
      const pixabayImages = {
        'protest': 'https://cdn.pixabay.com/photo/2017/06/17/18/35/demonstration-2413029_960_720.jpg',
        'demonstration': 'https://cdn.pixabay.com/photo/2017/01/28/12/36/protest-2013963_960_720.jpg',
        'march': 'https://cdn.pixabay.com/photo/2016/11/22/19/17/black-lives-matter-1850087_960_720.jpg',
        'climate': 'https://cdn.pixabay.com/photo/2019/09/27/15/45/fridays-for-future-4508470_960_720.jpg',
        'pride': 'https://cdn.pixabay.com/photo/2018/06/12/15/39/rainbow-3470507_960_720.jpg'
      };
      
      // Find matching image based on keyword
      for (const [key, url] of Object.entries(pixabayImages)) {
        if (keyword.toLowerCase().includes(key)) {
          const isValid = await validateImageUrl(url);
          if (isValid) {
            console.log(`✅ Found Pixabay image for "${keyword}": ${url}`);
            return url;
          }
        }
      }
    } catch (error) {
      console.log(`❌ Failed to fetch Pixabay image for "${keyword}":`, error.message);
    }
  }
  
  return null;
}

// Main function to find or assign images to protests
async function updateProtestImages() {
  console.log('🚀 Starting intelligent image fetcher...');
  
  try {
    // Get all protests from database
    const { data: protests, error } = await supabase
      .from('protests')
      .select('*');
    
    if (error) {
      console.error('Error fetching protests:', error);
      return;
    }
    
    console.log(`📊 Found ${protests.length} protests to process`);
    
    let updatedCount = 0;
    let webFetchedCount = 0;
    let fallbackCount = 0;
    
    for (const protest of protests) {
      console.log(`\n🔍 Processing: ${protest.title}`);
      
      let imageUrl = protest.image_url;
      let needsUpdate = false;
      
      // Check if current image is missing or invalid
      if (!imageUrl || imageUrl.trim() === '') {
        console.log(`❌ No image URL for: ${protest.title}`);
        needsUpdate = true;
      } else {
        console.log(`🔗 Validating existing image: ${imageUrl}`);
        const isValid = await validateImageUrl(imageUrl);
        if (!isValid) {
          console.log(`❌ Invalid image URL for: ${protest.title}`);
          needsUpdate = true;
        } else {
          console.log(`✅ Valid image found for: ${protest.title}`);
          continue; // Skip if image is valid
        }
      }
      
      if (needsUpdate) {
        // Try to find a relevant image from the web
        const keywords = getImageSearchKeywords(protest.category, protest.title, protest.location);
        console.log(`🔎 Keywords for ${protest.category}: ${keywords.slice(0, 3).join(', ')}`);
        
        // Try Unsplash first
        let newImageUrl = await searchUnsplashImages(keywords, protest.category);
        
        // Try Pixabay as backup
        if (!newImageUrl) {
          newImageUrl = await searchPixabayImages(keywords, protest.category);
        }
        
        // Use category fallback if no web image found
        if (!newImageUrl) {
          newImageUrl = categoryFallbackImages[protest.category] || categoryFallbackImages['Other'];
          console.log(`🔄 Using fallback image for ${protest.category}: ${newImageUrl}`);
          fallbackCount++;
        } else {
          console.log(`🌐 Using web-fetched image: ${newImageUrl}`);
          webFetchedCount++;
        }
        
        // Update database
        const { error: updateError } = await supabase
          .from('protests')
          .update({ image_url: newImageUrl })
          .eq('id', protest.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${protest.title}:`, updateError);
        } else {
          console.log(`✅ Updated image for: ${protest.title}`);
          updatedCount++;
        }
        
        // Small delay to be respectful to image services
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`\n🎉 Image fetching completed!`);
    console.log(`📈 Statistics:`);
    console.log(`  Total protests: ${protests.length}`);
    console.log(`  Updated: ${updatedCount}`);
    console.log(`  Web-fetched: ${webFetchedCount}`);
    console.log(`  Fallbacks used: ${fallbackCount}`);
    console.log(`  Already valid: ${protests.length - updatedCount}`);
    
  } catch (error) {
    console.error('❌ Error in intelligent image fetcher:', error);
  }
}

// Run the intelligent image fetcher
updateProtestImages().then(() => {
  console.log('\n✨ Process completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});