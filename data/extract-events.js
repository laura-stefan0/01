import fs from 'fs/promises';
import path from 'path';
import { supabase } from '../db/index.ts';

/**
 * Extract events from Instagram data and import to database
 */

// Event detection keywords
const EVENT_KEYWORDS = [
  'corteo', 'manifestazione', 'protesta', 'sciopero', 'assemblea', 'incontro',
  'protest', 'march', 'rally', 'demonstration', 'strike', 'action', 'event',
  'gathering', 'assembly', 'meeting', 'conference', 'workshop',
  'ore', 'quando', 'dove', 'when', 'where', 'join us', 'partecipa'
];

/**
 * Extract event details from Instagram post
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
  
  // Extract event details
  const event = {
    title: extractTitle(caption),
    description: caption.slice(0, 1000), // Extended description length
    date: extractDate(caption),
    time: extractTime(caption),
    location: extractLocation(caption),
    address: extractAddress(caption) || extractLocation(caption),
    category: determineCategory(caption, post.ownerUsername),
    image_url: extractImage(post),
    country_code: 'IT',
    featured: false,
    event_type: determineEventType(caption),
    latitude: '45.4640', // Default to Milan coordinates
    longitude: '9.1900' // Will be improved with geocoding
  };
  
  return event;
}

/**
 * Extract title from Instagram caption
 */
function extractTitle(caption) {
  const lines = caption.split('\n').filter(line => line.trim());
  
  // Look for patterns that indicate title
  for (const line of lines) {
    const cleanLine = line.replace(/[📍🔥✊🌍💚🚫]/g, '').trim();
    
    // Skip repost lines
    if (cleanLine.toLowerCase().includes('repost')) continue;
    
    // Skip lines that are just usernames
    if (cleanLine.startsWith('@')) continue;
    
    // Look for event announcement patterns
    if (cleanLine.includes('CORTEO') || 
        cleanLine.includes('MANIFESTAZIONE') ||
        cleanLine.includes('PROTESTA') ||
        cleanLine.includes('NO ')) {
      let title = cleanLine;
      
      // Remove hashtags and clean up
      title = title.replace(/#\w+/g, '').trim();
      title = title.replace(/[!]{2,}/g, '!').trim();
      
      if (title.length > 5 && title.length <= 150) {
        return title;
      }
    }
  }
  
  // Fallback: use first substantial line
  for (const line of lines) {
    const cleanLine = line.replace(/[📍🔥✊🌍💚🚫@]/g, '').trim();
    if (cleanLine.length > 10 && cleanLine.length <= 100) {
      return cleanLine.replace(/#\w+/g, '').trim();
    }
  }
  
  return 'Evento di Attivismo';
}

/**
 * Extract date from caption text
 */
function extractDate(caption) {
  const text = caption.toLowerCase();
  
  // Italian date patterns
  const datePatterns = [
    // "sabato 28 giugno"
    /(sabato|domenica|lunedì|martedì|mercoledì|giovedì|venerdì)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i,
    // "28 giugno" 
    /(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i,
    // "giovedì 26 giugno"
    /(giovedì|lunedì|martedì|mercoledì|venerdì|sabato|domenica)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i
  ];
  
  const monthMap = {
    gennaio: '01', febbraio: '02', marzo: '03', aprile: '04', maggio: '05', giugno: '06',
    luglio: '07', agosto: '08', settembre: '09', ottobre: '10', novembre: '11', dicembre: '12'
  };
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Extract day and month from match groups
      let day, month;
      
      if (match[3]) { // Pattern with day name: "sabato 28 giugno" or "giovedì 26 giugno"
        day = match[2];
        month = monthMap[match[3].toLowerCase()];
      } else if (match[2] && monthMap[match[2].toLowerCase()]) { // Pattern: "28 giugno"
        day = match[1];
        month = monthMap[match[2].toLowerCase()];
      }
      
      if (day && month) {
        const year = new Date().getFullYear();
        return `${year}-${month}-${day.padStart(2, '0')}`;
      }
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
    /ore\s*(\d{1,2})[:\.]?(\d{2})?/i,
    /(\d{1,2})[:\.](\d{2})/,
    /(\d{1,2})\s*(am|pm)/i
  ];
  
  for (const pattern of timePatterns) {
    const match = caption.match(pattern);
    if (match) {
      if (match[2]) { // Has minutes
        return `${match[1].padStart(2, '0')}:${match[2].padStart(2, '0')}`;
      } else {
        return `${match[1].padStart(2, '0')}:00`;
      }
    }
  }
  
  return '18:00'; // Default to 6 PM
}

/**
 * Extract location from caption
 */
function extractLocation(caption) {
  const lines = caption.split('\n');
  
  // Look for location indicators
  const locationKeywords = [
    'stazione', 'piazza', 'via', 'viale', 'corso', 'arsenale',
    'station', 'square', 'street', 'avenue', 'park'
  ];
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (locationKeywords.some(keyword => lowerLine.includes(keyword))) {
      const cleanLine = line.replace(/[📍🗺️]/g, '').trim();
      if (cleanLine.length > 5 && cleanLine.length < 100) {
        return cleanLine;
      }
    }
  }
  
  // Look for city names
  const italianCities = ['venezia', 'milano', 'roma', 'torino', 'napoli', 'firenze', 'bologna'];
  for (const city of italianCities) {
    if (caption.toLowerCase().includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  
  return 'Milano';
}

/**
 * Extract detailed address
 */
function extractAddress(caption) {
  const addressPatterns = [
    /stazione\s+venezia\s+s\.?\s*lucia/i,
    /via\s+[a-zA-ZÀ-ÿ\s]+\s*\d*/i,
    /piazza\s+[a-zA-ZÀ-ÿ\s]+/i,
    /arsenale[a-zA-ZÀ-ÿ\s,]*tesa\s*\d+/i
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
 * Determine event category based on content and account
 */
function determineCategory(caption, username) {
  const lowerCaption = caption.toLowerCase();
  const lowerUsername = username.toLowerCase();
  
  // Category detection based on keywords and account
  if (lowerCaption.includes('bezos') || lowerCaption.includes('war') || lowerCaption.includes('guerra') || 
      lowerCaption.includes('no war') || lowerCaption.includes('pace')) {
    return 'PEACE & ANTI-WAR';
  }
  
  if (lowerCaption.includes('environment') || lowerCaption.includes('clima') || lowerCaption.includes('green') ||
      lowerUsername.includes('green') || lowerUsername.includes('climate')) {
    return 'ENVIRONMENT';
  }
  
  if (lowerCaption.includes('rights') || lowerCaption.includes('diritti') || lowerCaption.includes('giustizia') ||
      lowerCaption.includes('freedom') || lowerCaption.includes('libertà')) {
    return 'CIVIL & HUMAN RIGHTS';
  }
  
  if (lowerCaption.includes('women') || lowerCaption.includes('donne') || lowerCaption.includes('feminist') ||
      lowerCaption.includes('femminismo') || lowerCaption.includes('gender')) {
    return 'WOMEN\'S RIGHTS';
  }
  
  if (lowerCaption.includes('lgbtq') || lowerCaption.includes('pride') || lowerCaption.includes('gay') ||
      lowerCaption.includes('lesbian') || lowerCaption.includes('trans')) {
    return 'LGBTQ+';
  }
  
  if (lowerCaption.includes('worker') || lowerCaption.includes('lavoro') || lowerCaption.includes('sindacato') ||
      lowerCaption.includes('sciopero') || lowerCaption.includes('union')) {
    return 'LABOR';
  }
  
  if (lowerCaption.includes('racism') || lowerCaption.includes('razzismo') || lowerCaption.includes('social justice')) {
    return 'RACIAL & SOCIAL JUSTICE';
  }
  
  return 'OTHER';
}

/**
 * Determine event type from content
 */
function determineEventType(caption) {
  const lowerCaption = caption.toLowerCase();
  
  if (lowerCaption.includes('corteo') || lowerCaption.includes('march')) {
    return 'Protest';
  }
  
  if (lowerCaption.includes('assemblea') || lowerCaption.includes('assembly')) {
    return 'Assembly';
  }
  
  if (lowerCaption.includes('workshop') || lowerCaption.includes('laboratorio')) {
    return 'Workshop';
  }
  
  if (lowerCaption.includes('talk') || lowerCaption.includes('conferenza')) {
    return 'Talk';
  }
  
  return 'Protest'; // Default
}

/**
 * Extract best image from post
 */
function extractImage(post) {
  if (post.displayUrl) {
    return post.displayUrl;
  }
  
  if (post.images && post.images.length > 0) {
    return post.images[0].url || post.images[0];
  }
  
  return null;
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
      // Check for duplicates by title and date
      const { data: existing } = await supabase
        .from('protests')
        .select('id')
        .eq('title', event.title)
        .eq('date', event.date)
        .maybeSingle();
      
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
 * Main function to process Instagram data
 */
async function main() {
  try {
    console.log('🚀 Starting Instagram event extraction...');
    
    // Find the latest Instagram data file
    const instagramDir = path.join(process.cwd(), 'data', 'imports', 'instagram');
    const files = await fs.readdir(instagramDir);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f.includes('instagram-data'));
    
    if (jsonFiles.length === 0) {
      console.log('❌ No Instagram data files found. Please run fetch-apify-data.js first.');
      return;
    }
    
    // Use the most recent file
    const latestFile = jsonFiles.sort().reverse()[0];
    const filepath = path.join(instagramDir, latestFile);
    
    console.log(`📄 Processing file: ${latestFile}`);
    
    // Read and parse the data
    const rawData = await fs.readFile(filepath, 'utf8');
    const posts = JSON.parse(rawData);
    
    console.log(`📊 Analyzing ${posts.length} Instagram posts...`);
    
    // Extract events from posts
    const events = [];
    for (const post of posts) {
      const event = extractEventFromPost(post);
      if (event) {
        events.push(event);
      }
    }
    
    console.log(`🎯 Found ${events.length} potential events`);
    
    if (events.length === 0) {
      console.log('ℹ️ No events found in the Instagram posts');
      return;
    }
    
    // Show extracted events
    console.log('\n📋 Extracted Events:');
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   📅 ${event.date} at ${event.time}`);
      console.log(`   📍 ${event.location}`);
      console.log(`   🏷️ ${event.category}`);
      console.log(`   📱 @${event.source_account}`);
      console.log('');
    });
    
    // Import to database
    const result = await importEventsToDatabase(events);
    
    // Move processed file to archive
    const archiveDir = path.join(process.cwd(), 'data', 'imports', 'archive');
    await fs.mkdir(archiveDir, { recursive: true });
    const archivePath = path.join(archiveDir, latestFile);
    await fs.rename(filepath, archivePath);
    console.log(`📦 Moved processed file to archive: ${latestFile}`);
    
    console.log('🎉 Instagram event extraction completed successfully!');
    console.log(`📈 Summary: ${result.imported} events imported, ${result.skipped} duplicates skipped`);
    
  } catch (error) {
    console.error('❌ Event extraction failed:', error);
    process.exit(1);
  }
}

// Run the extraction
main();