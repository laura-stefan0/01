import { supabaseAdmin } from './db/index.js';
import * as cheerio from 'cheerio';
import axios from 'axios';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

/**
 * Extract image from a webpage
 */
async function extractImageFromWebsite(url, title) {
  try {
    console.log(`🔍 Extracting image from: ${url}`);
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 10000,
      validateStatus: status => status < 500
    });
    
    if (response.status !== 200) {
      console.log(`❌ Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    
    const $ = cheerio.load(response.data);
    
    // Try different image selectors based on common patterns
    const imageSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      '.featured-image img',
      '.post-thumbnail img',
      'article img',
      '.content img',
      '.entry-content img:first',
      'img[src*="wp-content"]',
      'img[src*="uploads"]'
    ];
    
    for (const selector of imageSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        let imageSrc = element.attr('content') || element.attr('src');
        
        if (imageSrc) {
          // Make absolute URL
          if (imageSrc.startsWith('//')) {
            imageSrc = 'https:' + imageSrc;
          } else if (imageSrc.startsWith('/')) {
            const baseUrl = new URL(url).origin;
            imageSrc = baseUrl + imageSrc;
          }
          
          // Validate image URL
          if (imageSrc.includes('unsplash.com') || imageSrc.includes('placeholder')) {
            continue;
          }
          
          console.log(`✅ Found image: ${imageSrc}`);
          return imageSrc;
        }
      }
    }
    
    console.log(`⚠️ No suitable image found for: ${url}`);
    return null;
  } catch (error) {
    console.log(`❌ Error extracting image from ${url}:`, error.message);
    return null;
  }
}

/**
 * Update website-scraped events with authentic images
 */
async function updateWebsiteImages() {
  console.log('🔄 Updating website-scraped events with authentic images...');
  
  // Get website-scraped events that currently have Unsplash fallbacks
  const { data: websiteEvents, error } = await supabaseAdmin
    .from('protests')
    .select('id, title, event_url, source_name, image_url, category')
    .not('source_name', 'is', null)
    .not('event_url', 'is', null)
    .like('image_url', '%unsplash.com%');
  
  if (error) {
    console.error('Error fetching website events:', error);
    return;
  }
  
  console.log(`Found ${websiteEvents.length} website events to update`);
  
  let updated = 0;
  
  for (const event of websiteEvents) {
    console.log(`\n🔍 Processing: ${event.title.slice(0, 60)}...`);
    console.log(`   Source: ${event.source_name}`);
    console.log(`   URL: ${event.event_url}`);
    
    try {
      // Extract image from the event URL
      const extractedImage = await extractImageFromWebsite(event.event_url, event.title);
      
      if (extractedImage) {
        // Update the event with the extracted image
        const { error: updateError } = await supabaseAdmin
          .from('protests')
          .update({ image_url: extractedImage })
          .eq('id', event.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${event.title}:`, updateError);
        } else {
          console.log(`✅ Updated with authentic image: ${extractedImage}`);
          updated++;
        }
      } else {
        console.log(`⚠️ No image found, keeping category fallback`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${event.title}:`, error.message);
    }
    
    // Add delay to be respectful to servers
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Updated ${updated} website events with authentic images`);
}

// Run the update
updateWebsiteImages().catch(console.error);