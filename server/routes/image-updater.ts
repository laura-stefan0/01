import { Router } from "express";
import { supabase } from "../../db/index.js";
import axios from "axios";

const router = Router();

// Category-specific web search terms and fallback images
const categoryConfig = {
  'Environment': {
    searchTerms: ['climate protest', 'environmental demonstration', 'green activism', 'climate strike'],
    fallback: 'https://images.unsplash.com/photo-1573160813959-c9157b3f8e7c?w=800&h=600&fit=crop&auto=format'
  },
  'LGBTQ+': {
    searchTerms: ['pride parade', 'lgbtq demonstration', 'rainbow protest', 'pride march'],
    fallback: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&auto=format'
  },
  'Women\'s Rights': {
    searchTerms: ['women protest', 'feminist demonstration', 'gender equality march', 'women rights'],
    fallback: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&auto=format'
  },
  'Labor': {
    searchTerms: ['workers protest', 'labor strike', 'union demonstration', 'workers rights'],
    fallback: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=800&h=600&fit=crop&auto=format'
  },
  'Racial & Social Justice': {
    searchTerms: ['social justice protest', 'racial equality march', 'civil rights demonstration'],
    fallback: 'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=800&h=600&fit=crop&auto=format'
  },
  'Civil & Human Rights': {
    searchTerms: ['human rights protest', 'civil rights march', 'freedom demonstration'],
    fallback: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format'
  },
  'Healthcare & Education': {
    searchTerms: ['education protest', 'student demonstration', 'healthcare protest'],
    fallback: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&auto=format'
  },
  'Peace & Anti-War': {
    searchTerms: ['peace march', 'anti war protest', 'peace demonstration'],
    fallback: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=600&fit=crop&auto=format'
  },
  'Transparency & Anti-Corruption': {
    searchTerms: ['anti corruption protest', 'transparency demonstration', 'accountability march'],
    fallback: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=600&fit=crop&auto=format'
  },
  'Other': {
    searchTerms: ['protest', 'demonstration', 'activism', 'rally'],
    fallback: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=600&fit=crop&auto=format'
  }
};

// Validate if an image URL is accessible
async function validateImageUrl(url: string): Promise<boolean> {
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

// Find a web image for a protest
async function findWebImage(category: string): Promise<string | null> {
  const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig['Other'];
  
  // Try different search terms
  for (const term of config.searchTerms.slice(0, 2)) {
    try {
      // Use Unsplash Source API (no key required)
      const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(term)}`;
      
      const isValid = await validateImageUrl(imageUrl);
      if (isValid) {
        console.log(`✅ Found web image for ${category} with term "${term}"`);
        return imageUrl;
      }
    } catch (error) {
      console.log(`❌ Failed to fetch image for "${term}"`);
    }
  }
  
  return null;
}

// Update images for all protests
router.post("/update-all", async (req, res) => {
  try {
    console.log('🚀 Starting image update process...');
    
    // Get all protests
    const { data: protests, error } = await supabase
      .from('protests')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`📊 Found ${protests.length} protests to process`);
    
    let updated = 0;
    let webFetched = 0;
    let fallbackUsed = 0;
    let alreadyValid = 0;
    
    for (const protest of protests) {
      console.log(`🔍 Processing: ${protest.title}`);
      
      // Check if current image is valid
      let needsUpdate = false;
      
      if (!protest.image_url || protest.image_url.trim() === '') {
        console.log(`❌ No image URL for: ${protest.title}`);
        needsUpdate = true;
      } else {
        const isValid = await validateImageUrl(protest.image_url);
        if (!isValid) {
          console.log(`❌ Invalid image for: ${protest.title}`);
          needsUpdate = true;
        } else {
          console.log(`✅ Valid image for: ${protest.title}`);
          alreadyValid++;
        }
      }
      
      if (needsUpdate) {
        // Try to find web image first
        let newImageUrl = await findWebImage(protest.category);
        
        if (newImageUrl) {
          console.log(`🌐 Using web image for: ${protest.title}`);
          webFetched++;
        } else {
          // Use category fallback
          const config = categoryConfig[protest.category as keyof typeof categoryConfig] || categoryConfig['Other'];
          newImageUrl = config.fallback;
          console.log(`🔄 Using fallback for ${protest.category}: ${protest.title}`);
          fallbackUsed++;
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
          updated++;
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    const result = {
      total: protests.length,
      updated,
      webFetched,
      fallbackUsed,
      alreadyValid,
      message: 'Image update completed successfully'
    };
    
    console.log('🎉 Image update process completed:', result);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error updating images:', error);
    res.status(500).json({ 
      error: 'Failed to update images', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update image for a specific protest
router.post("/update/:id", async (req, res) => {
  try {
    const protestId = req.params.id;
    
    // Get protest details
    const { data: protest, error } = await supabase
      .from('protests')
      .select('*')
      .eq('id', protestId)
      .single();
    
    if (error || !protest) {
      return res.status(404).json({ error: 'Protest not found' });
    }
    
    // Try to find web image
    let newImageUrl = await findWebImage(protest.category);
    
    if (!newImageUrl) {
      // Use fallback
      const config = categoryConfig[protest.category as keyof typeof categoryConfig] || categoryConfig['Other'];
      newImageUrl = config.fallback;
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('protests')
      .update({ image_url: newImageUrl })
      .eq('id', protestId);
    
    if (updateError) {
      throw updateError;
    }
    
    res.json({ 
      success: true, 
      imageUrl: newImageUrl,
      source: newImageUrl.includes('source.unsplash.com') ? 'web' : 'fallback'
    });
    
  } catch (error) {
    console.error('Error updating protest image:', error);
    res.status(500).json({ 
      error: 'Failed to update protest image', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;