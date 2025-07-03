import fs from 'fs/promises';
import path from 'path';
import { supabaseAdmin } from '../db/index.ts';

/**
 * Enhanced Instagram import using authentic images and complete metadata
 */
async function enhancedInstagramImport() {
  try {
    console.log('🚀 Starting enhanced Instagram import with authentic images...');
    
    // Load the latest Instagram data with full metadata
    const dataFiles = await fs.readdir('data/imports/instagram');
    const latestFile = dataFiles
      .filter(file => file.startsWith('instagram-data-'))
      .sort()
      .pop();
    
    if (!latestFile) {
      console.log('❌ No Instagram data found');
      return;
    }
    
    const filePath = path.join('data/imports/instagram', latestFile);
    const rawData = await fs.readFile(filePath, 'utf8');
    const posts = JSON.parse(rawData);
    
    console.log(`📊 Processing ${posts.length} Instagram posts with enhanced extraction...`);
    
    // Extract events with authentic Instagram content and images
    const extractedEvents = [];
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`🔍 Processing post ${i + 1}/${posts.length}: @${post.ownerUsername || 'unknown'}`);
      
      if (post.caption && post.caption.trim()) {
        const events = extractEnhancedEventsFromPost(post);
        if (events.length > 0) {
          console.log(`✅ Extracted ${events.length} event(s) with authentic content`);
          extractedEvents.push(...events);
        }
      }
    }
    
    console.log(`🎯 Total events extracted: ${extractedEvents.length}`);
    
    // Import events to database
    let imported = 0;
    let skipped = 0;
    
    for (const event of extractedEvents) {
      try {
        // Check for duplicates by title
        const { data: existing } = await supabaseAdmin
          .from('protests')
          .select('id')
          .eq('title', event.title)
          .maybeSingle();
        
        if (existing) {
          console.log(`⏭️ Skipping duplicate: ${event.title}`);
          skipped++;
          continue;
        }
        
        // Insert new event with authentic Instagram content
        const { error } = await supabaseAdmin
          .from('protests')
          .insert([event])
          .select('id, title');
        
        if (error) {
          console.error(`❌ Error inserting "${event.title}":`, error.message);
        } else {
          console.log(`✅ Imported: ${event.title}`);
          console.log(`   📍 Location: ${event.city}, ${event.address}`);
          console.log(`   📅 Date: ${event.date} at ${event.time}`);
          console.log(`   🏷️ Category: ${event.category}`);
          console.log(`   🖼️ Image: ${event.image_url ? 'Authentic Instagram image' : 'Fallback image'}`);
          imported++;
        }
        
      } catch (error) {
        console.error(`❌ Exception for "${event.title}":`, error.message);
      }
    }
    
    console.log(`📊 Import complete: ${imported} events imported, ${skipped} duplicates skipped`);
    
    return { imported, skipped, total: extractedEvents.length };
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

/**
 * Extract events from Instagram post with enhanced analysis
 */
function extractEnhancedEventsFromPost(post) {
  const caption = post.caption || '';
  const username = post.ownerUsername || '';
  const events = [];
  
  // Enhanced Italian event detection
  const eventKeywords = [
    'corteo', 'manifestazione', 'protesta', 'assemblea', 'incontro',
    'workshop', 'evento', 'marcia', 'presidio', 'sit-in', 'sciopero',
    'mobilitazione', 'iniziativa', 'azione', 'raduno', 'concentramento',
    'mercoledì di', 'appuntamento', 'giornata di', 'dalle lotte'
  ];
  
  const lowercaseCaption = caption.toLowerCase();
  const hasEventKeyword = eventKeywords.some(keyword => 
    lowercaseCaption.includes(keyword)
  );
  
  if (!hasEventKeyword) {
    return events;
  }
  
  // Enhanced extraction with authentic data
  const title = extractEnhancedTitle(caption, username);
  const date = extractEnhancedDate(caption);
  const time = extractEnhancedTime(caption);
  const location = extractEnhancedLocation(caption);
  const address = extractEnhancedAddress(caption, location);
  const category = determineCategoryFromContent(caption, username);
  const eventType = determineEventTypeFromContent(caption);
  
  // Use authentic Instagram image
  const imageUrl = getBestImageFromPost(post);
  
  if (title && title.length > 5) {
    const event = {
      title: title.slice(0, 200), // Limit title length
      description: cleanDescription(caption).slice(0, 700),
      date: date || getDefaultUpcomingDate(),
      time: time || '18:00',
      city: location || 'Milano',
      address: address || (location ? `Centro ${location}` : 'Centro città'),
      category,
      latitude: getCoordinatesForCity(location || 'Milano').lat,
      longitude: getCoordinatesForCity(location || 'Milano').lng,
      event_type: eventType,
      country_code: 'IT',
      featured: false,
      image_url: imageUrl,
      attendees: 0
    };
    
    events.push(event);
  }
  
  return events;
}

function extractEnhancedTitle(caption, username) {
  const lines = caption.split('\n').filter(line => line.trim());
  
  // Try to find a good title from the caption
  for (const line of lines) {
    let cleanLine = line
      .replace(/^[🔥💪✊👊🚨⚡️🎯📍📅⚡️]+\s*/, '') // Remove emoji prefixes
      .replace(/\s*[🔥💪✊👊🚨⚡️🎯📍📅⚡️]+$/, '') // Remove emoji suffixes
      .replace(/repost da @\w+/i, '')
      .replace(/^[•\-\*]\s*/, '') // Remove bullet points
      .replace(/^#\w+/g, '') // Remove hashtags at start
      .trim();
    
    // Skip repost lines
    if (cleanLine.toLowerCase().includes('repost')) continue;
    
    // Look for event-like titles
    if (cleanLine.length >= 10 && cleanLine.length <= 150 && 
        !cleanLine.toLowerCase().includes('http') &&
        !cleanLine.toLowerCase().includes('www.') &&
        !cleanLine.toLowerCase().includes('link in bio')) {
      
      // Clean up some special characters that cause DB issues
      cleanLine = cleanLine
        .replace(/[^\w\s\-\.\,\!\?\:àáâäèéêëìíîïòóôöùúûüç]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanLine.length >= 10) {
        return cleanLine;
      }
    }
  }
  
  // Fallback: create descriptive title from account name and content
  const accountName = username.replace(/[_\d]/g, ' ').trim();
  return `Evento ${accountName}`.slice(0, 100);
}

function extractEnhancedDate(caption) {
  const italianMonths = {
    'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
    'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
    'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
  };
  
  // Multiple date patterns for Italian
  const patterns = [
    // "sabato 28 giugno"
    /(sabato|domenica|lunedì|martedì|mercoledì|giovedì|venerdì)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i,
    // "28 giugno"
    /(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i,
    // "28/06" or "28/6"
    /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/,
    // "giovedì 26 giugno"
    /(giovedì|venerdì|sabato|domenica|lunedì|martedì|mercoledì)\s+(\d{1,2})\s+(giugno|luglio|agosto)/i,
    // "mercoledì 2 luglio"
    /mercoledì\s+(\d{1,2})\s+(luglio|agosto|settembre)/i
  ];
  
  for (const pattern of patterns) {
    const match = caption.match(pattern);
    if (match) {
      if (match[3] && italianMonths[match[3].toLowerCase()]) {
        // Format: day month
        const day = match[2].padStart(2, '0');
        const month = italianMonths[match[3].toLowerCase()];
        return `2025-${month}-${day}`;
      } else if (match[2] && italianMonths[match[2].toLowerCase()]) {
        // Format: day month (when first capture is day)
        const day = match[1].padStart(2, '0');
        const month = italianMonths[match[2].toLowerCase()];
        return `2025-${month}-${day}`;
      } else if (match[2] && !isNaN(match[2])) {
        // Format: DD/MM
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        if (parseInt(month) <= 12) {
          return `2025-${month}-${day}`;
        }
      }
    }
  }
  
  return null;
}

function extractEnhancedTime(caption) {
  const patterns = [
    // "ore 17" or "ore 17:00"
    /ore\s+(\d{1,2}):?(\d{2})?/i,
    // "h. 17" or "h.17"
    /h\.?\s*(\d{1,2}):?(\d{2})?/i,
    // "17:00" or "17.00"
    /(\d{1,2})[:\.](\d{2})/,
    // "alle 17" or "dalle 18"
    /(alle|dalle)\s+(\d{1,2}):?(\d{2})?/i,
    // "17h" or "18h"
    /(\d{1,2})h/i
  ];
  
  for (const pattern of patterns) {
    const match = caption.match(pattern);
    if (match) {
      let hours, minutes;
      
      if (match[3]) {
        // Pattern with "alle/dalle"
        hours = match[2];
        minutes = match[3] || '00';
      } else if (match[2] && !isNaN(match[2])) {
        // Standard time pattern
        hours = match[1];
        minutes = match[2];
      } else {
        // Just hours
        hours = match[1];
        minutes = '00';
      }
      
      hours = hours.padStart(2, '0');
      minutes = minutes.padStart(2, '0');
      
      if (parseInt(hours) <= 23 && parseInt(minutes) <= 59) {
        return `${hours}:${minutes}`;
      }
    }
  }
  
  return null;
}

function extractEnhancedLocation(caption) {
  // Italian cities (expanded list)
  const italianCities = [
    'Milano', 'Roma', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 
    'Firenze', 'Venezia', 'Verona', 'Padova', 'Trieste', 'Perugia', 'Bari', 
    'Catania', 'Cagliari', 'Brescia', 'Modena', 'Reggio Emilia', 'Parma',
    'Bussoleno', 'Susa', 'Lecce', 'Messina', 'Bergamo', 'Vicenza', 'Treviso',
    'Ferrara', 'Pescara', 'Rimini', 'Salerno', 'Sassari', 'Monza', 'Forlì',
    'Ravenna', 'Reggio Calabria', 'Livorno', 'Cagliari', 'Foggia', 'Taranto'
  ];
  
  // Look for cities mentioned in the caption
  for (const city of italianCities) {
    // Case insensitive search
    const regex = new RegExp(`\\b${city}\\b`, 'i');
    if (regex.test(caption)) {
      return city;
    }
  }
  
  return null;
}

function extractEnhancedAddress(caption, city) {
  const addressPatterns = [
    // "Piazza Gasparotto", "Via Roma", etc.
    /(?:piazza|via|corso|viale|largo|vicolo)\s+[A-Za-zÀ-ÿ\s]+/gi,
    // "Stazione Venezia S.Lucia"
    /stazione\s+[A-Za-zÀ-ÿ\s\.]+/gi,
    // "Centro Sociale", "Università di"
    /(centro\s+sociale|università\s+di)\s+[A-Za-zÀ-ÿ\s]+/gi,
    // Generic building/location names
    /\b[A-Z][a-zÀ-ÿ]+\s+(sociale|culturale|universitario|comunale)\b/gi
  ];
  
  for (const pattern of addressPatterns) {
    const matches = caption.match(pattern);
    if (matches && matches.length > 0) {
      // Return the first good match, cleaned up
      const address = matches[0]
        .trim()
        .replace(/[^\w\s\.\-]/g, '')
        .replace(/\s+/g, ' ');
      
      if (address.length > 5 && address.length < 100) {
        return address;
      }
    }
  }
  
  return null;
}

function determineCategoryFromContent(caption, username) {
  const categories = {
    'PEACE & ANTI-WAR': ['bezos', 'guerra', 'pace', 'no war', 'antimilitarista', 'no space for bezos'],
    'LGBTQ+': ['lgbtq', 'pride', 'gay', 'trans', 'queer', 'arcobaleno', 'transfemministe'],
    'ENVIRONMENT': ['ambiente', 'clima', 'verde', 'fridays', 'extinction', 'tav', 'notav', 'grandi navi'],
    'CIVIL & HUMAN RIGHTS': ['diritti', 'antifascista', 'sociale', 'civili', 'labas', 'decreto sicurezza', 'assemblea pubblica'],
    'WOMEN\'S RIGHTS': ['donne', 'femminista', 'antisessista', 'violenza', 'genere', 'transfemministe'],
    'LABOR': ['lavoro', 'sindacato', 'sciopero', 'lavoratori', 'operai', 'cobas'],
    'RACIAL & SOCIAL JUSTICE': ['razzismo', 'giustizia', 'migranti', 'antirazzista', 'solidale']
  };
  
  const text = (caption + ' ' + username).toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  return 'CIVIL & HUMAN RIGHTS';
}

function determineEventTypeFromContent(caption) {
  const types = {
    'Protest': ['corteo', 'manifestazione', 'protesta', 'marcia', 'presidio'],
    'Assembly': ['assemblea', 'incontro', 'riunione', 'mercoledì di'],
    'Workshop': ['workshop', 'laboratorio', 'formazione', 'info day'],
    'Talk': ['conferenza', 'dibattito', 'presentazione', 'approfondimento']
  };
  
  const text = caption.toLowerCase();
  
  for (const [type, keywords] of Object.entries(types)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return type;
    }
  }
  
  return 'Other';
}

function getBestImageFromPost(post) {
  // Priority: displayUrl > first image in images array > fallback
  if (post.displayUrl) {
    return post.displayUrl;
  }
  
  if (post.images && post.images.length > 0) {
    return post.images[0];
  }
  
  // Fallback to category-appropriate image
  return null;
}

function cleanDescription(caption) {
  return caption
    .replace(/repost da @\w+/gi, '')
    .replace(/link in bio/gi, '')
    .replace(/[^\w\s\-\.\,\!\?\:àáâäèéêëìíîïòóôöùúûüç\n]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDefaultUpcomingDate() {
  const today = new Date();
  const future = new Date(today);
  future.setDate(today.getDate() + 7); // Default to next week
  return future.toISOString().split('T')[0];
}

function getCoordinatesForCity(city) {
  const coordinates = {
    'Milano': { lat: '45.4642', lng: '9.1900' },
    'Roma': { lat: '41.9028', lng: '12.4964' },
    'Napoli': { lat: '40.8518', lng: '14.2681' },
    'Torino': { lat: '45.0703', lng: '7.6869' },
    'Genova': { lat: '44.4056', lng: '8.9463' },
    'Bologna': { lat: '44.4949', lng: '11.3426' },
    'Firenze': { lat: '43.7696', lng: '11.2558' },
    'Venezia': { lat: '45.4408', lng: '12.3155' },
    'Padova': { lat: '45.4064', lng: '11.8768' },
    'Bussoleno': { lat: '45.1397', lng: '7.1394' }
  };
  
  return coordinates[city] || coordinates['Milano'];
}

// Run the enhanced import
enhancedInstagramImport()
  .then(result => {
    console.log('\n🌟 Enhanced Instagram Integration Complete:');
    console.log(`• Processed authentic Instagram posts from Italian activists`);
    console.log(`• Used real Instagram images and metadata`);
    console.log(`• Successfully imported ${result.imported} events to database`);
    console.log(`• Skipped ${result.skipped} duplicate events`);
    console.log(`• Events now visible in Corteo with authentic content`);
  })
  .catch(error => {
    console.error('❌ Failed to process Instagram data:', error);
  });