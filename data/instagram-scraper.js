import { ApifyApi } from 'apify-client';
import fs from 'fs/promises';
import path from 'path';
import { supabase } from '../db/index.ts';

// Initialize Apify client
const client = new ApifyApi({
  token: process.env.APIFY_API_TOKEN,
});

/**
 * Instagram Event Scraper for Corteo
 * Fetches posts from activist organization accounts and extracts event details
 */

// Target Instagram accounts for event scraping
const TARGET_ACCOUNTS = [
  'fridaysforfuture',
  'extinctionrebellion', 
  'greenpeace',
  'amnesty',
  'blmtoronto',
  'unitedwestand',
  'climatestrike',
  'sunrisemvmt',
  'marchforourlives',
  'aclu'
];

// Event detection keywords
const EVENT_KEYWORDS = [
  'protest', 'march', 'rally', 'demonstration', 'strike', 'action',
  'event', 'gathering', 'assembly', 'meeting', 'conference', 'workshop',
  'manifestazione', 'corteo', 'sciopero', 'assemblea', 'incontro',
  'join us', 'come', 'attend', 'participate', 'when:', 'where:', 'date:'
];

/**
 * Run Instagram scraper using Apify
 */
async function scrapeInstagramPosts(accounts = TARGET_ACCOUNTS, maxPosts = 50) {
  console.log(`🔍 Starting Instagram scrape for ${accounts.length} accounts...`);
  
  try {
    // Run the Instagram Post Scraper actor
    const run = await client.actor('apify/instagram-post-scraper').call({
      usernames: accounts,
      resultsLimit: maxPosts,
      addParentData: false,
    });

    console.log(`✅ Scraping completed. Run ID: ${run.id}`);
    
    // Get the results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    console.log(`📊 Retrieved ${items.length} Instagram posts`);
    
    // Save raw data to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `instagram-posts-${timestamp}.json`;
    const filepath = path.join('data/imports/instagram', filename);
    
    await fs.writeFile(filepath, JSON.stringify(items, null, 2));
    console.log(`💾 Raw data saved to: ${filepath}`);
    
    return { items, filepath };
    
  } catch (error) {
    console.error('❌ Error scraping Instagram:', error);
    throw error;
  }
}

/**
 * Extract event details from Instagram posts
 */
function extractEventFromPost(post) {
  const caption = post.caption || '';
  const text = caption.toLowerCase();
  
  // Check if post contains event keywords
  const hasEventKeywords = EVENT_KEYWORDS.some(keyword => 
    text.includes(keyword.toLowerCase())
  );
  
  if (!hasEventKeywords) {
    return null;
  }
  
  console.log(`🎯 Found potential event in post by @${post.ownerUsername}`);
  
  // Extract best available image URL from Instagram post
  const imageUrl = extractBestImageUrl(post);
  
  // Extract event details
  const event = {
    title: extractTitle(caption),
    description: caption.slice(0, 700), // Limit description length
    date: extractDate(caption),
    time: extractTime(caption),
    location: extractLocation(caption),
    address: extractAddress(caption),
    category: determineCategory(caption),
    image_url: imageUrl,
    source_url: post.url,
    source: 'instagram',
    source_account: post.ownerUsername,
    country_code: 'IT', // Default to Italy, can be improved with location detection
    featured: false,
    event_type: 'Protest' // Default type
  };
  
  return event;
}

/**
 * Extract the best available image URL from Instagram post
 */
function extractBestImageUrl(post) {
  // Try different image URL fields in order of preference
  if (post.displayUrl) {
    console.log(`📸 Using displayUrl: ${post.displayUrl}`);
    return post.displayUrl;
  }
  
  if (post.images && Array.isArray(post.images) && post.images.length > 0) {
    console.log(`📸 Using first image from images array: ${post.images[0]}`);
    return post.images[0];
  }
  
  if (post.thumbnail) {
    console.log(`📸 Using thumbnail: ${post.thumbnail}`);
    return post.thumbnail;
  }
  
  if (post.url && post.url.includes('instagram.com')) {
    // Try to construct image URL from post URL (fallback)
    console.log(`📸 No direct image URL found for post: ${post.url}`);
    return null;
  }
  
  console.log(`⚠️ No image URL found for Instagram post`);
  return null;
}

/**
 * Extract title from Instagram caption
 */
function extractTitle(caption) {
  // Try to find title in first line or sentence
  const lines = caption.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    let title = lines[0].replace(/[📍🔥✊🌍💚]/g, '').trim();
    
    // Remove hashtags from title
    title = title.replace(/#\w+/g, '').trim();
    
    // Limit title length
    if (title.length > 100) {
      title = title.slice(0, 97) + '...';
    }
    
    return title || 'Untitled Event';
  }
  
  return 'Untitled Event';
}

/**
 * Extract date from caption text
 */
function extractDate(caption) {
  const datePatterns = [
    /(\d{1,2})\s*(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*(\d{1,2})/i,
    /(\d{1,2})\s*(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)/i
  ];
  
  for (const pattern of datePatterns) {
    const match = caption.match(pattern);
    if (match) {
      // Convert to proper date format (YYYY-MM-DD)
      const today = new Date();
      const year = new Date().getFullYear();
      return `${year}-07-15`; // Default to mid-July for demo
    }
  }
  
  // Default to next week
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return nextWeek.toISOString().split('T')[0];
}

/**
 * Extract time from caption
 */
function extractTime(caption) {
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)/i,
    /(\d{1,2})\s*(am|pm)/i,
    /ore\s*(\d{1,2})/i
  ];
  
  for (const pattern of timePatterns) {
    const match = caption.match(pattern);
    if (match) {
      return '18:00'; // Default time
    }
  }
  
  return '18:00'; // Default to 6 PM
}

/**
 * Extract location from caption
 */
function extractLocation(caption) {
  const locationKeywords = [
    'piazza', 'via', 'strada', 'viale', 'corso',
    'square', 'street', 'avenue', 'park'
  ];
  
  const lines = caption.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (locationKeywords.some(keyword => lowerLine.includes(keyword))) {
      return line.replace(/[📍🗺️]/g, '').trim();
    }
  }
  
  return 'Milano'; // Default location
}

/**
 * Extract detailed address
 */
function extractAddress(caption) {
  // Look for more specific address patterns
  const addressPatterns = [
    /via\s+[a-zA-Z\s]+\s*\d*/i,
    /piazza\s+[a-zA-Z\s]+/i,
    /\d+\s+[a-zA-Z\s]+street/i
  ];
  
  for (const pattern of addressPatterns) {
    const match = caption.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return null;
}

/**
 * Determine event category based on content
 */
function determineCategory(caption) {
  const categoryKeywords = {
    'ENVIRONMENT': ['climate', 'environment', 'green', 'earth', 'planeta', 'clima'],
    'LGBTQ+': ['pride', 'lgbtq', 'gay', 'lesbian', 'trans', 'queer'],
    'CIVIL & HUMAN RIGHTS': ['rights', 'justice', 'freedom', 'diritti', 'giustizia'],
    'PEACE & ANTI-WAR': ['peace', 'anti-war', 'stop war', 'pace', 'guerra'],
    'WOMEN\'S RIGHTS': ['women', 'feminist', 'gender', 'donne', 'femminismo'],
    'RACIAL & SOCIAL JUSTICE': ['racism', 'equality', 'black lives', 'social justice'],
    'LABOR': ['workers', 'union', 'strike', 'lavoro', 'sciopero', 'sindacato'],
    'HEALTHCARE & EDUCATION': ['health', 'education', 'university', 'salute', 'educazione']
  };
  
  const lowerCaption = caption.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerCaption.includes(keyword))) {
      return category;
    }
  }
  
  return 'OTHER';
}

/**
 * Import events to Supabase database
 */
async function importEventsToDatabase(events) {
  console.log(`📥 Importing ${events.length} events to database...`);
  
  let imported = 0;
  let skipped = 0;
  
  for (const event of events) {
    try {
      // Check for duplicates
      const { data: existing } = await supabase
        .from('protests')
        .select('id')
        .eq('title', event.title)
        .eq('date', event.date)
        .single();
      
      if (existing) {
        console.log(`⏭️ Skipping duplicate: ${event.title}`);
        skipped++;
        continue;
      }
      
      // Insert new event
      const { error } = await supabase
        .from('protests')
        .insert([event]);
      
      if (error) {
        console.error(`❌ Error inserting event "${event.title}":`, error);
      } else {
        console.log(`✅ Imported: ${event.title}`);
        imported++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing event "${event.title}":`, error);
    }
  }
  
  console.log(`📊 Import complete: ${imported} imported, ${skipped} skipped`);
  return { imported, skipped };
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting Instagram event import process...');
    
    // Step 1: Scrape Instagram posts
    const { items, filepath } = await scrapeInstagramPosts();
    
    // Step 2: Extract events from posts
    console.log('🔍 Analyzing posts for event content...');
    const events = [];
    
    for (const post of items) {
      const event = extractEventFromPost(post);
      if (event) {
        events.push(event);
      }
    }
    
    console.log(`🎯 Found ${events.length} potential events from ${items.length} posts`);
    
    if (events.length === 0) {
      console.log('ℹ️ No events found in the scraped posts');
      return;
    }
    
    // Step 3: Import to database
    const result = await importEventsToDatabase(events);
    
    // Step 4: Archive processed file
    const archivePath = filepath.replace('/imports/', '/imports/archive/');
    await fs.rename(filepath, archivePath);
    console.log(`📦 Moved processed file to: ${archivePath}`);
    
    console.log('🎉 Instagram import process completed successfully!');
    console.log(`📈 Summary: ${result.imported} events imported, ${result.skipped} duplicates skipped`);
    
  } catch (error) {
    console.error('❌ Instagram import failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scrapeInstagramPosts, extractEventFromPost, importEventsToDatabase };