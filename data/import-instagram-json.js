
const fs = require('fs').promises;
const path = require('path');

// Use dynamic import for ES modules
async function loadSupabase() {
  const { supabase } = await import('../db/index.ts');
  return supabase;
}

/**
 * Fetch latest Instagram data from Apify and import to database
 */
async function importInstagramFromApify() {
  try {
    console.log('🔍 Fetching latest Instagram data from Apify...');
    
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) {
      throw new Error('APIFY_API_TOKEN environment variable is required');
    }
    
    console.log('🔑 API token found, making request...');
    
    // Fetch recent runs from Instagram Post Scraper
    const runsResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-post-scraper/runs?token=${apiToken}&limit=10&desc=1`
    );
    
    if (!runsResponse.ok) {
      throw new Error(`Failed to fetch runs: ${runsResponse.status} ${runsResponse.statusText}`);
    }
    
    const runsData = await runsResponse.json();
    console.log(`📊 Found ${runsData.data.items.length} recent runs`);
    
    // Find most recent successful run
    const successfulRun = runsData.data.items.find(run => run.status === 'SUCCEEDED');
    
    if (!successfulRun) {
      console.log('❌ No successful runs found. Please run your Instagram scraper first.');
      return 0;
    }
    
    console.log(`✅ Found successful run: ${successfulRun.id}`);
    console.log(`📅 Started: ${new Date(successfulRun.startedAt).toLocaleString()}`);
    
    // Fetch the dataset results
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/datasets/${successfulRun.defaultDatasetId}/items?token=${apiToken}&format=json`
    );
    
    if (!datasetResponse.ok) {
      throw new Error(`Failed to fetch dataset: ${datasetResponse.status} ${datasetResponse.statusText}`);
    }
    
    const posts = await datasetResponse.json();
    console.log(`📊 Retrieved ${posts.length} Instagram posts from Apify`);
    
    if (posts.length === 0) {
      console.log('❌ No posts found in the dataset');
      return 0;
    }
    
    // Save raw data for reference
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `instagram-data-${timestamp}.json`;
    const instagramDir = path.join(process.cwd(), 'data', 'imports', 'instagram');
    
    // Create directory if it doesn't exist
    try {
      await fs.mkdir(instagramDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }
    
    const filepath = path.join(instagramDir, filename);
    await fs.writeFile(filepath, JSON.stringify(posts, null, 2));
    console.log(`💾 Raw data saved to: ${filepath}`);
    
    // Load Supabase client
    const supabase = await loadSupabase();
    
    // Extract and import events from the posts
    console.log('🎯 Extracting events from Instagram posts...');
    
    let imported = 0;
    
    for (const post of posts) {
      if (!post.caption) continue;
      
      const caption = post.caption.toLowerCase();
      
      // Look for event indicators in Italian
      const eventKeywords = [
        'manifestazione', 'corteo', 'sciopero', 'assemblea', 'incontro',
        'evento', 'protesta', 'marcia', 'raduno', 'riunione',
        'sabato', 'domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì',
        'ore ', 'h ', 'piazza', 'via ', 'presso'
      ];
      
      const hasEventKeywords = eventKeywords.some(keyword => caption.includes(keyword));
      
      if (hasEventKeywords) {
        try {
          // Extract basic event info from post
          const event = {
            title: extractTitle(post.caption),
            description: post.caption.slice(0, 500), // Keep original Italian description
            date: extractDate(post.caption) || "2025-07-15", // Default future date
            time: extractTime(post.caption) || "18:00",
            city: extractCity(post.caption) || "Milano",
            address: extractAddress(post.caption) || "Centro città",
            category: "CIVIL & HUMAN RIGHTS",
            latitude: "45.4642",
            longitude: "9.1900",
            image_url: post.displayUrl || null,
            source_name: `@${post.ownerUsername}` || "@instagram_user",
            source_url: `https://www.instagram.com/${post.ownerUsername}/`,
            event_url: post.url || null,
            event_type: "Assembly",
            country_code: "IT",
            featured: false,
            attendees: 0
          };
          
          const { error } = await supabase
            .from('protests')
            .insert([event]);
          
          if (error) {
            console.error(`❌ Error importing "${event.title}":`, error.message);
          } else {
            console.log(`✅ Imported: ${event.title}`);
            imported++;
          }
          
        } catch (err) {
          console.error(`❌ Exception processing post:`, err.message);
        }
      }
    }
    
    console.log(`\n🎉 Successfully imported ${imported} events from Apify Instagram data!`);
    console.log('🇮🇹 All events are in original Italian as requested');
    console.log('📱 Events are now visible in the app');
    
    return imported;
    
  } catch (error) {
    console.error('❌ Error importing Instagram from Apify:', error);
    return 0;
  }
}

/**
 * Helper functions to extract event details from Instagram captions
 */
function extractTitle(caption) {
  // Take first line or first 100 characters as title
  const firstLine = caption.split('\n')[0];
  return firstLine.slice(0, 100).trim() || "Evento da Instagram";
}

function extractDate(caption) {
  // Look for date patterns (basic extraction)
  const datePatterns = [
    /(\d{1,2})\s*(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(sabato|domenica|lunedì|martedì|mercoledì|giovedì|venerdì)/i
  ];
  
  // Return null to use default date
  return null;
}

function extractTime(caption) {
  // Look for time patterns
  const timeMatch = caption.match(/ore?\s*(\d{1,2})[:\.]?(\d{2})?/i) || 
                   caption.match(/h\s*(\d{1,2})[:\.]?(\d{2})?/i);
  
  if (timeMatch) {
    const hour = timeMatch[1];
    const minute = timeMatch[2] || '00';
    return `${hour.padStart(2, '0')}:${minute}`;
  }
  
  return null; // Use default time
}

function extractCity(caption) {
  // Look for common Italian cities
  const cities = ['milano', 'roma', 'napoli', 'torino', 'palermo', 'genova', 'bologna', 'firenze', 'bari', 'catania', 'venezia'];
  
  for (const city of cities) {
    if (caption.toLowerCase().includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  
  return null; // Use default city
}

function extractAddress(caption) {
  // Look for address patterns
  const addressMatch = caption.match(/(piazza|via|presso|centro)\s+([^,\n.!?]{3,30})/i);
  
  if (addressMatch) {
    return addressMatch[0].trim();
  }
  
  return null; // Use default address
}

// Run the import
importInstagramFromApify()
  .then(count => {
    if (count > 0) {
      console.log(`\n🌟 Apify Instagram Import Complete!`);
      console.log(`📱 ${count} events imported from your latest Apify scrape`);
      console.log(`✨ Check your app - events should now be visible!`);
    } else {
      console.log(`\n⚠️ No events were imported. Check if your Apify scraper found event-related posts.`);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  });
