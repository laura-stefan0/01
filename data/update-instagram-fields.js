import { supabase } from '../db/index.ts';
import fs from 'fs/promises';

/**
 * Update Instagram events with proper image URLs, source info, and post URLs
 */

async function updateInstagramFields() {
  try {
    console.log('🔄 Updating Instagram events with complete metadata...');
    
    // Load the Instagram data
    const instagramData = JSON.parse(
      await fs.readFile('data/imports/instagram/instagram-data-2025-07-03T00-46-08-966Z.json', 'utf8')
    );
    
    console.log(`📊 Loaded ${instagramData.length} Instagram posts`);
    
    // Map Instagram posts to our events
    const instagramEventUpdates = [
      {
        // Venice Bezos protest - from @comitatonograndinavi
        eventTitle: "NO BEZOS NO WAR! - Venice Protest",
        instagramPost: instagramData.find(post => 
          post.inputUrl.includes('comitatonograndinavi') && 
          post.caption.includes('NO BEZOS NO WAR')
        )
      },
      {
        // Bologna assembly - from @labas_bo (Wednesday event)
        eventTitle: "Social Assembly Bologna", 
        instagramPost: instagramData.find(post => 
          post.inputUrl.includes('labas_bo') &&
          post.caption.includes('Mercoledì 2 Luglio')
        )
      },
      {
        // LGBTQ+ meeting - from @asc_venezia (or similar LGBTQ+ account)
        eventTitle: "LGBTQ+ Community Meeting",
        instagramPost: instagramData.find(post => 
          (post.inputUrl.includes('asc_venezia') || 
           post.caption.toLowerCase().includes('lgbtq') ||
           post.caption.toLowerCase().includes('pride') ||
           post.caption.toLowerCase().includes('queer')) &&
          post.caption.toLowerCase().includes('riunione')
        )
      }
    ];
    
    console.log('🎯 Processing Instagram event updates...');
    
    let updated = 0;
    
    for (const eventUpdate of instagramEventUpdates) {
      const { eventTitle, instagramPost } = eventUpdate;
      
      if (!instagramPost) {
        console.log(`⚠️  No Instagram post found for "${eventTitle}"`);
        continue;
      }
      
      // Extract Instagram account name from URL
      const accountMatch = instagramPost.inputUrl.match(/instagram\.com\/([^\/]+)/);
      const accountName = accountMatch ? accountMatch[1] : 'Unknown';
      
      // Get the best image (first image from the post)
      const imageUrl = instagramPost.displayUrl || 
                      (instagramPost.images && instagramPost.images[0]) || 
                      null;
      
      // Prepare update data
      const updateData = {
        image_url: imageUrl,
        source_name: `@${accountName}`,
        event_url: instagramPost.url,
        source_url: instagramPost.inputUrl
      };
      
      console.log(`📱 Updating "${eventTitle}" with Instagram data:`);
      console.log(`   Source: ${updateData.source_name}`);
      console.log(`   Post URL: ${updateData.event_url}`);
      console.log(`   Image: ${imageUrl ? 'Found' : 'Not found'}`);
      
      // Update the event in database
      const { error } = await supabase
        .from('protests')
        .update(updateData)
        .eq('title', eventTitle);
      
      if (error) {
        console.error(`❌ Error updating "${eventTitle}": ${error.message}`);
      } else {
        console.log(`✅ Updated "${eventTitle}" with Instagram metadata`);
        updated++;
      }
    }
    
    console.log(`📊 Successfully updated ${updated} events with Instagram metadata`);
    
    // Also add fallback data for any events that didn't match
    await addFallbackInstagramData();
    
    return updated;
    
  } catch (error) {
    console.error('❌ Failed to update Instagram fields:', error);
    return 0;
  }
}

/**
 * Add fallback Instagram data for events that didn't match specific posts
 */
async function addFallbackInstagramData() {
  console.log('🔄 Adding fallback data for remaining Instagram events...');
  
  // Get Instagram events without source_name (meaning they weren't updated above)
  const { data: eventsNeedingUpdate, error } = await supabase
    .from('protests')
    .select('*')
    .in('title', [
      'NO BEZOS NO WAR! - Venice Protest',
      'Social Assembly Bologna', 
      'LGBTQ+ Community Meeting'
    ])
    .is('source_name', null);
  
  if (error) {
    console.error('❌ Error fetching events needing update:', error);
    return;
  }
  
  for (const event of eventsNeedingUpdate || []) {
    // Set fallback Instagram data
    const fallbackData = {
      source_name: 'Instagram',
      source_url: 'https://instagram.com',
      // Use existing image_url or a category-appropriate fallback
      image_url: event.image_url || getCategoryImage(event.category)
    };
    
    const { error: updateError } = await supabase
      .from('protests')
      .update(fallbackData)
      .eq('id', event.id);
    
    if (updateError) {
      console.error(`❌ Error adding fallback data for "${event.title}": ${updateError.message}`);
    } else {
      console.log(`✅ Added fallback Instagram data for "${event.title}"`);
    }
  }
}

/**
 * Get category-appropriate image for events without specific images
 */
function getCategoryImage(category) {
  const categoryImages = {
    'PEACE & ANTI-WAR': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'CIVIL & HUMAN RIGHTS': 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800',
    'LGBTQ+': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800'
  };
  
  return categoryImages[category] || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800';
}

// Run the update
updateInstagramFields()
  .then(count => {
    if (count > 0) {
      console.log('🎉 Instagram events successfully enhanced with metadata!');
      console.log(`📱 ${count} events now have proper image URLs, source names, and post URLs`);
    }
  });