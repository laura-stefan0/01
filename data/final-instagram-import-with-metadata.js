import fs from 'fs/promises';
import path from 'path';
import { supabaseAdmin } from '../db/index.ts';

/**
 * Final Instagram import with complete metadata including source fields
 */
async function finalInstagramImportWithMetadata() {
  try {
    console.log('🚀 Starting final Instagram import with complete metadata...');
    
    // Load the latest Instagram data with full fields
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
    
    console.log(`📊 Processing ${posts.length} Instagram posts with complete metadata extraction...`);
    
    // Extract events with full metadata
    const extractedEvents = [];
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      if (!post.caption || !post.caption.trim()) {
        continue;
      }
      
      console.log(`🔍 Processing post ${i + 1}/${posts.length}: @${post.ownerUsername || 'unknown'}`);
      console.log(`📝 Caption: ${post.caption.slice(0, 100)}...`);
      
      const events = extractEventsWithMetadata(post);
      if (events.length > 0) {
        console.log(`✅ Extracted ${events.length} event(s) with complete metadata`);
        extractedEvents.push(...events);
      }
    }
    
    console.log(`🎯 Total events extracted: ${extractedEvents.length}`);
    
    // Import events with metadata to database
    let imported = 0;
    let skipped = 0;
    
    for (const event of extractedEvents) {
      try {
        // Check for duplicates by title and source
        const { data: existing } = await supabaseAdmin
          .from('protests')
          .select('id')
          .eq('title', event.title)
          .eq('source_name', event.source_name)
          .maybeSingle();
        
        if (existing) {
          console.log(`⏭️ Skipping duplicate: ${event.title} from ${event.source_name}`);
          skipped++;
          continue;
        }
        
        // Insert new event with complete metadata
        const { error } = await supabaseAdmin
          .from('protests')
          .insert([event])
          .select('id, title');
        
        if (error) {
          console.error(`❌ Error inserting "${event.title}":`, error.message);
        } else {
          console.log(`✅ Imported: ${event.title}`);
          console.log(`   📱 Source: @${event.source_name}`);
          console.log(`   🔗 Post URL: ${event.event_url}`);
          console.log(`   📍 Location: ${event.city}, ${event.address}`);
          console.log(`   📅 Date: ${event.date} at ${event.time}`);
          console.log(`   🏷️ Category: ${event.category}`);
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
 * Extract events with complete metadata from Instagram post
 */
function extractEventsWithMetadata(post) {
  const caption = post.caption || '';
  const username = post.ownerUsername || '';
  const events = [];
  
  // Enhanced Italian event detection
  const eventKeywords = [
    'corteo', 'manifestazione', 'protesta', 'assemblea', 'incontro',
    'workshop', 'evento', 'marcia', 'presidio', 'sit-in', 'sciopero',
    'mobilitazione', 'iniziativa', 'azione', 'raduno', 'concentramento',
    'mercoledì di', 'appuntamento', 'giornata', 'dalle lotte', 'info day',
    'no bezos', 'no space', 'decreto sicurezza', 'zona rossa', 'opposizione sociale'
  ];
  
  const lowercaseCaption = caption.toLowerCase();
  const hasEventKeyword = eventKeywords.some(keyword => 
    lowercaseCaption.includes(keyword)
  );
  
  if (!hasEventKeyword) {
    return events;
  }
  
  // Generate title automatically from post description
  const autoTitle = generateTitleFromDescription(caption, username);
  const date = extractDateFromCaption(caption);
  const time = extractTimeFromCaption(caption);
  const location = extractLocationFromCaption(caption);
  const address = extractAddressFromCaption(caption, location);
  const category = determineCategoryFromPost(caption, username);
  const eventType = determineEventTypeFromPost(caption);
  
  // Extract source metadata
  const sourceName = username;
  const eventUrl = post.url || '';
  const sourceUrl = post.inputUrl || `https://www.instagram.com/${username}/`;
  
  // Get authentic Instagram image
  const imageUrl = getBestImageFromPost(post);
  
  if (autoTitle && autoTitle.length > 5) {
    const event = {
      title: autoTitle.slice(0, 200),
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
      attendees: 0,
      // New metadata fields
      source_name: sourceName,
      event_url: eventUrl,
      source_url: sourceUrl
    };
    
    events.push(event);
  }
  
  return events;
}

/**
 * Generate automatic title from post description
 */
function generateTitleFromDescription(caption, username) {
  const lines = caption.split('\n').filter(line => line.trim());
  
  // Strategy 1: Look for event announcement patterns
  for (const line of lines) {
    let cleanLine = line
      .replace(/^[🔥💪✊👊🚨⚡️🎯📍📅⚡️🔴❌]+\s*/, '') // Remove emoji prefixes
      .replace(/\s*[🔥💪✊👊🚨⚡️🎯📍📅⚡️🔴❌]+$/, '') // Remove emoji suffixes
      .replace(/repost da @\w+/i, '')
      .replace(/^[•\-\*]\s*/, '') // Remove bullet points
      .replace(/^#+\s*/, '') // Remove hashtags at start
      .trim();
    
    // Skip repost/credit lines
    if (cleanLine.toLowerCase().includes('repost') || 
        cleanLine.toLowerCase().includes('photo by') ||
        cleanLine.toLowerCase().includes('link in bio')) continue;
    
    // Look for event titles
    if (cleanLine.length >= 10 && cleanLine.length <= 100 && 
        !cleanLine.toLowerCase().includes('http') &&
        !cleanLine.toLowerCase().includes('www.')) {
      
      // Clean up special characters for database compatibility
      cleanLine = cleanLine
        .replace(/[^\w\s\-\.\,\!\?\:àáâäèéêëìíîïòóôöùúûüç]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanLine.length >= 10) {
        return cleanLine;
      }
    }
  }
  
  // Strategy 2: Extract key phrases that indicate events
  const eventPatterns = [
    /(?:corteo|manifestazione|protesta|assemblea|incontro|workshop|evento|marcia|presidio)\s+[A-Za-zÀ-ÿ\s]+/gi,
    /(?:no\s+bezos|no\s+space)\s+[A-Za-zÀ-ÿ\s]*/gi,
    /(?:mercoledì|giovedì|venerdì|sabato|domenica)\s+di\s+[A-Za-zÀ-ÿ\s]+/gi,
    /(?:dalle\s+lotte|opposizione\s+sociale)[A-Za-zÀ-ÿ\s:]*/gi
  ];
  
  for (const pattern of eventPatterns) {
    const matches = caption.match(pattern);
    if (matches && matches.length > 0) {
      let title = matches[0].trim()
        .replace(/[^\w\s\-\.\,\!\?\:àáâäèéêëìíîïòóôöùúûüç]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (title.length >= 10 && title.length <= 100) {
        return title;
      }
    }
  }
  
  // Strategy 3: Create descriptive title from content and account
  const contentKeywords = extractKeywords(caption);
  const accountName = username.replace(/[_\d]/g, ' ').replace(/cso|labas|rete/gi, '').trim();
  
  if (contentKeywords.length > 0) {
    return `${contentKeywords.slice(0, 3).join(' ')} - ${accountName}`.slice(0, 100);
  }
  
  // Fallback: account-based title
  return `Evento ${accountName}`.slice(0, 50);
}

/**
 * Extract keywords that indicate event type/theme
 */
function extractKeywords(caption) {
  const keywordPatterns = [
    'NO BEZOS', 'NO WAR', 'MANIFESTAZIONE', 'CORTEO', 'ASSEMBLEA',
    'PROTESTA', 'ZONA SOLIDALE', 'DECRETO SICUREZZA', 'OPPOSIZIONE SOCIALE',
    'MERCOLEDÌ DI LABÀS', 'ZONE ROSSA', 'ANTIFASCISTA', 'ANTISESSISTA',
    'PRIDE', 'CLIMATE', 'AMBIENTE', 'DIRITTI'
  ];
  
  const found = [];
  const upperCaption = caption.toUpperCase();
  
  for (const keyword of keywordPatterns) {
    if (upperCaption.includes(keyword) && !found.includes(keyword)) {
      found.push(keyword);
    }
  }
  
  return found;
}

function extractDateFromCaption(caption) {
  const italianMonths = {
    'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
    'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
    'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
  };
  
  // Date patterns for Italian
  const patterns = [
    /(sabato|domenica|lunedì|martedì|mercoledì|giovedì|venerdì)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i,
    /(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i,
    /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/,
    /mercoledì\s+(\d{1,2})\s+(luglio|agosto|settembre)/i
  ];
  
  for (const pattern of patterns) {
    const match = caption.match(pattern);
    if (match) {
      if (match[3] && italianMonths[match[3].toLowerCase()]) {
        const day = match[2].padStart(2, '0');
        const month = italianMonths[match[3].toLowerCase()];
        return `2025-${month}-${day}`;
      } else if (match[2] && italianMonths[match[2].toLowerCase()]) {
        const day = match[1].padStart(2, '0');
        const month = italianMonths[match[2].toLowerCase()];
        return `2025-${month}-${day}`;
      } else if (match[2] && !isNaN(match[2])) {
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

function extractTimeFromCaption(caption) {
  const patterns = [
    /ore\s+(\d{1,2}):?(\d{2})?/i,
    /h\.?\s*(\d{1,2}):?(\d{2})?/i,
    /(\d{1,2})[:\.](\d{2})/,
    /(alle|dalle)\s+(\d{1,2}):?(\d{2})?/i
  ];
  
  for (const pattern of patterns) {
    const match = caption.match(pattern);
    if (match) {
      let hours, minutes;
      
      if (match[3]) {
        hours = match[2];
        minutes = match[3] || '00';
      } else if (match[2] && !isNaN(match[2])) {
        hours = match[1];
        minutes = match[2];
      } else {
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

function extractLocationFromCaption(caption) {
  const italianCities = [
    'Milano', 'Roma', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 
    'Firenze', 'Venezia', 'Verona', 'Padova', 'Trieste', 'Perugia', 'Bari', 
    'Catania', 'Cagliari', 'Brescia', 'Modena', 'Reggio Emilia', 'Parma',
    'Bussoleno', 'Susa', 'Lecce', 'Messina', 'Bergamo', 'Vicenza', 'Treviso'
  ];
  
  for (const city of italianCities) {
    const regex = new RegExp(`\\b${city}\\b`, 'i');
    if (regex.test(caption)) {
      return city;
    }
  }
  
  return null;
}

function extractAddressFromCaption(caption, city) {
  const addressPatterns = [
    /(?:piazza|via|corso|viale|largo)\s+[A-Za-zÀ-ÿ\s]+/gi,
    /stazione\s+[A-Za-zÀ-ÿ\s\.]+/gi,
    /(centro\s+sociale|università)\s+[A-Za-zÀ-ÿ\s]+/gi
  ];
  
  for (const pattern of addressPatterns) {
    const matches = caption.match(pattern);
    if (matches && matches.length > 0) {
      const address = matches[0].trim().replace(/[^\w\s\.\-]/g, '').replace(/\s+/g, ' ');
      if (address.length > 5 && address.length < 100) {
        return address;
      }
    }
  }
  
  return null;
}

function determineCategoryFromPost(caption, username) {
  const categories = {
    'PEACE & ANTI-WAR': ['bezos', 'guerra', 'pace', 'no war', 'antimilitarista', 'no space for bezos'],
    'LGBTQ+': ['lgbtq', 'pride', 'gay', 'trans', 'queer', 'transfemministe'],
    'ENVIRONMENT': ['ambiente', 'clima', 'grandi navi', 'tav', 'notav'],
    'CIVIL & HUMAN RIGHTS': ['diritti', 'antifascista', 'sociale', 'labas', 'decreto sicurezza', 'assemblea pubblica', 'opposizione sociale'],
    'WOMEN\'S RIGHTS': ['donne', 'femminista', 'antisessista', 'violenza', 'genere'],
    'LABOR': ['lavoro', 'sindacato', 'sciopero', 'lavoratori', 'cobas'],
    'RACIAL & SOCIAL JUSTICE': ['razzismo', 'giustizia', 'migranti', 'zona solidale', 'solidale']
  };
  
  const text = (caption + ' ' + username).toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  return 'CIVIL & HUMAN RIGHTS';
}

function determineEventTypeFromPost(caption) {
  const types = {
    'Protest': ['corteo', 'manifestazione', 'protesta', 'marcia', 'presidio'],
    'Assembly': ['assemblea', 'incontro', 'riunione', 'mercoledì di'],
    'Workshop': ['workshop', 'laboratorio', 'info day'],
    'Talk': ['conferenza', 'dibattito', 'presentazione']
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
  if (post.displayUrl) return post.displayUrl;
  if (post.images && post.images.length > 0) return post.images[0];
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
  future.setDate(today.getDate() + 7);
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
    'Padova': { lat: '45.4064', lng: '11.8768' }
  };
  
  return coordinates[city] || coordinates['Milano'];
}

// Run the final import
finalInstagramImportWithMetadata()
  .then(result => {
    console.log('\n🌟 Final Instagram Integration With Metadata Complete:');
    console.log(`• Processed authentic Instagram posts with complete metadata`);
    console.log(`• Generated automatic titles from post descriptions`);
    console.log(`• Added source_name, event_url, and source_url fields`);
    console.log(`• Successfully imported ${result.imported} events to database`);
    console.log(`• Skipped ${result.skipped} duplicate events`);
    console.log(`• Events now have complete source attribution and metadata`);
  })
  .catch(error => {
    console.error('❌ Failed to process Instagram data:', error);
  });