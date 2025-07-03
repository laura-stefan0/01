
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Category-specific fallback images
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

function getCategoryFallback(category) {
  return categoryFallbackImages[category] || categoryFallbackImages['Other'];
}

async function fixProblematicImages() {
  console.log('🔧 Fixing problematic image URLs...\n');
  
  try {
    // Get all protests with problematic image URLs
    const { data: protests, error } = await supabase
      .from('protests')
      .select('id, title, category, image_url')
      .eq('country_code', 'IT');
    
    if (error) {
      console.error('Error fetching protests:', error);
      return;
    }
    
    const problematicDomains = [
      'greenpeace.org',
      'ultima-generazione.com', 
      'arcigay.it',
      'instagram.com',
      'fbcdn.net',
      'facebook.com'
    ];
    
    let fixedCount = 0;
    
    for (const protest of protests) {
      if (!protest.image_url) continue;
      
      const isProblematic = problematicDomains.some(domain => 
        protest.image_url.includes(domain)
      );
      
      if (isProblematic) {
        const fallbackUrl = getCategoryFallback(protest.category);
        
        const { error: updateError } = await supabase
          .from('protests')
          .update({ image_url: fallbackUrl })
          .eq('id', protest.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${protest.title}:`, updateError);
        } else {
          console.log(`✅ Fixed: ${protest.title} (${protest.category})`);
          fixedCount++;
        }
      }
    }
    
    console.log(`\n🎉 Fixed ${fixedCount} problematic images`);
    
  } catch (error) {
    console.error('❌ Error fixing images:', error);
  }
}

// Run the fix
fixProblematicImages();
