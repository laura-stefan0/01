import fs from 'fs/promises';
import path from 'path';
import { supabase } from '../db/index.ts';

/**
 * Process the authentic Instagram data fetched from Apify
 * Extract real event information from Italian activist posts
 */
async function processInstagramImport() {
  try {
    console.log('🚀 Processing authentic Instagram data from Apify...');
    
    // Load the latest fetched data
    const dataFiles = await fs.readdir('data/imports/instagram');
    const latestFile = dataFiles
      .filter(file => file.startsWith('instagram-data-'))
      .sort()
      .pop();
    
    if (!latestFile) {
      console.log('❌ No Instagram data files found. Run fetch-apify-data.js first.');
      return;
    }
    
    console.log(`📄 Processing file: ${latestFile}`);
    
    const filePath = path.join('data/imports/instagram', latestFile);
    const rawData = await fs.readFile(filePath, 'utf8');
    const instagramPosts = JSON.parse(rawData);
    
    console.log(`📊 Analyzing ${instagramPosts.length} Instagram posts...`);
    
    // Extract real events from the posts
    const extractedEvents = [];
    
    for (const post of instagramPosts) {
      const event = extractEventFromPost(post);
      if (event) {
        extractedEvents.push(event);
      }
    }
    
    console.log(`🎯 Extracted ${extractedEvents.length} events from Instagram posts`);
    
    // Import events to database
    let imported = 0;
    let skipped = 0;
    
    for (const event of extractedEvents) {
      try {
        // Check for duplicates
        const { data: existing } = await supabase
          .from('protests')
          .select('id')
          .eq('title', event.title)
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
          console.error(`❌ Error inserting "${event.title}":`, error.message);
        } else {
          console.log(`✅ Imported: ${event.title}`);
          imported++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing "${event.title}":`, error.message);
      }
    }
    
    console.log(`📊 Import complete: ${imported} events imported, ${skipped} duplicates skipped`);
    console.log('🎉 Instagram event integration successful!');
    
    return { imported, skipped, total: extractedEvents.length };
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

/**
 * Extract event details from Instagram post
 */
function extractEventFromPost(post) {
  const caption = post.caption || '';
  const username = post.ownerUsername || '';
  
  // Look for event indicators in Italian
  const eventKeywords = [
    'corteo', 'manifestazione', 'protesta', 'assemblea', 'incontro',
    'workshop', 'evento', 'marcia', 'presidio', 'sit-in', 'sciopero'
  ];
  
  const hasEventKeyword = eventKeywords.some(keyword => 
    caption.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (!hasEventKeyword) {
    return null;
  }
  
  // Extract event details
  const title = extractTitle(caption);
  const date = extractDate(caption);
  const time = extractTime(caption);
  const location = extractLocation(caption);
  const category = determineCategory(caption, username);
  const eventType = determineEventType(caption);
  
  if (!title || !date || !location) {
    return null;
  }
  
  return {
    title,
    description: caption.slice(0, 700).trim(),
    date,
    time: time || '18:00',
    location,
    address: location,
    category,
    latitude: getCoordinatesForLocation(location).lat,
    longitude: getCoordinatesForLocation(location).lng,
    event_type: eventType,
    country_code: 'IT',
    featured: false,
    image_url: post.displayUrl || null,
    attendees: 0
  };
}

/**
 * Extract title from Instagram caption
 */
function extractTitle(caption) {
  const lines = caption.split('\n').filter(line => line.trim());
  
  // Look for title patterns
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip repost indicators
    if (trimmedLine.toLowerCase().includes('repost')) continue;
    
    // Look for event titles
    if (trimmedLine.length > 10 && trimmedLine.length < 100) {
      // Clean up the title
      let title = trimmedLine
        .replace(/^[🔥💪✊👊🚨⚡️]+\s*/, '') // Remove emoji prefixes
        .replace(/\s*[🔥💪✊👊🚨⚡️]+$/, '') // Remove emoji suffixes
        .replace(/[!]{2,}/g, '!') // Multiple exclamation marks
        .trim();
      
      if (title.length > 10) {
        return title;
      }
    }
  }
  
  return null;
}

/**
 * Extract date from caption
 */
function extractDate(caption) {
  const datePatterns = [
    /(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i,
    /(\d{1,2})\/(\d{1,2})/,
    /(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i
  ];
  
  const months = {
    gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
    maggio: '05', giugno: '06', luglio: '07', agosto: '08',
    settembre: '09', ottobre: '10', novembre: '11', dicembre: '12'
  };
  
  for (const pattern of datePatterns) {
    const match = caption.match(pattern);
    if (match) {
      if (match[3]) { // Full date with month name
        const day = match[2].padStart(2, '0');
        const month = months[match[3].toLowerCase()];
        return `2025-${month}-${day}`;
      } else if (match[2]) { // DD/MM format
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        return `2025-${month}-${day}`;
      }
    }
  }
  
  return null;
}

/**
 * Extract time from caption
 */
function extractTime(caption) {
  const timePatterns = [
    /ore\s+(\d{1,2}):?(\d{2})?/i,
    /(\d{1,2}):(\d{2})/,
    /(\d{1,2})\s*h/i
  ];
  
  for (const pattern of timePatterns) {
    const match = caption.match(pattern);
    if (match) {
      const hours = match[1].padStart(2, '0');
      const minutes = match[2] ? match[2].padStart(2, '0') : '00';
      return `${hours}:${minutes}`;
    }
  }
  
  return null;
}

/**
 * Extract location from caption
 */
function extractLocation(caption) {
  const locationPatterns = [
    /(?:a|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
    /([A-Z][a-z]+)\s*,/g,
    /(Milano|Roma|Napoli|Torino|Palermo|Genova|Bologna|Firenze|Venezia|Verona|Padova|Trieste|Perugia|Bari|Catania|Cagliari)/gi
  ];
  
  for (const pattern of locationPatterns) {
    const matches = [...caption.matchAll(pattern)];
    for (const match of matches) {
      const location = match[1].trim();
      if (location.length > 2 && location.length < 30) {
        return location;
      }
    }
  }
  
  return null;
}

/**
 * Determine category based on content
 */
function determineCategory(caption, username) {
  const categories = {
    'PEACE & ANTI-WAR': ['war', 'guerra', 'pace', 'no war', 'bezos', 'arms'],
    'LGBTQ+': ['pride', 'lgbtq', 'rainbow', 'gay', 'trans', 'queer'],
    'ENVIRONMENT': ['climate', 'ambiente', 'verde', 'clima', 'extinctionrebellion'],
    'CIVIL & HUMAN RIGHTS': ['diritti', 'rights', 'assemblea', 'sociale', 'civili'],
    'WOMEN\'S RIGHTS': ['donne', 'women', 'femminista', 'feminist', 'violenza'],
    'LABOR': ['lavoro', 'workers', 'sindacato', 'sciopero', 'strike'],
    'RACIAL & SOCIAL JUSTICE': ['razzismo', 'racism', 'giustizia', 'justice'],
    'TRANSPARENCY & ANTI-CORRUPTION': ['corruzione', 'trasparenza', 'corruption']
  };
  
  const text = (caption + ' ' + username).toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  return 'OTHER';
}

/**
 * Determine event type
 */
function determineEventType(caption) {
  const types = {
    'Protest': ['corteo', 'manifestazione', 'protesta', 'marcia', 'presidio'],
    'Assembly': ['assemblea', 'incontro', 'riunione'],
    'Workshop': ['workshop', 'laboratorio', 'corso'],
    'Talk': ['conferenza', 'dibattito', 'presentazione'],
    'Other': ['evento', 'iniziativa']
  };
  
  const text = caption.toLowerCase();
  
  for (const [type, keywords] of Object.entries(types)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return type;
    }
  }
  
  return 'Other';
}

/**
 * Get coordinates for Italian cities
 */
function getCoordinatesForLocation(location) {
  const coordinates = {
    'Milano': { lat: '45.4642', lng: '9.1900' },
    'Roma': { lat: '41.9028', lng: '12.4964' },
    'Napoli': { lat: '40.8518', lng: '14.2681' },
    'Torino': { lat: '45.0703', lng: '7.6869' },
    'Palermo': { lat: '38.1157', lng: '13.3613' },
    'Genova': { lat: '44.4056', lng: '8.9463' },
    'Bologna': { lat: '44.4949', lng: '11.3426' },
    'Firenze': { lat: '43.7696', lng: '11.2558' },
    'Venezia': { lat: '45.4408', lng: '12.3155' },
    'Verona': { lat: '45.4384', lng: '10.9916' },
    'Padova': { lat: '45.4064', lng: '11.8768' },
    'Trieste': { lat: '45.6495', lng: '13.7768' },
    'Perugia': { lat: '43.1122', lng: '12.3888' },
    'Bari': { lat: '41.1177', lng: '16.8512' },
    'Catania': { lat: '37.5079', lng: '15.0830' },
    'Cagliari': { lat: '39.2238', lng: '9.1217' }
  };
  
  return coordinates[location] || { lat: '45.4642', lng: '9.1900' }; // Default to Milan
}

// Run the import
processInstagramImport()
  .then(result => {
    if (result) {
      console.log('\n🌟 Instagram Integration Summary:');
      console.log(`• Processed authentic Instagram data from Apify`);
      console.log(`• Successfully imported ${result.imported} events to database`);
      console.log(`• Skipped ${result.skipped} duplicate events`);
      console.log(`• Events now visible in your Corteo app`);
    }
  })
  .catch(error => {
    console.error('❌ Failed to process Instagram data:', error);
  });