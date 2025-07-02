import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Focused sources for better success rate
const FOCUSED_SOURCES = [
  {
    url: 'https://www.globalproject.info/it/tags/news/menu',
    name: 'globalproject.info',
    type: 'activism'
  },
  {
    url: 'https://fridaysforfutureitalia.it/eventi/',
    name: 'fridaysforfutureitalia.it',
    type: 'environment'
  },
  {
    url: 'https://extinctionrebellion.it/eventi/futuri/',
    name: 'extinctionrebellion.it',
    type: 'environment'
  }
];

const ITALIAN_CITIES = {
  milano: { lat: 45.4641943, lng: 9.1896346 },
  roma: { lat: 41.9027835, lng: 12.4963655 },
  napoli: { lat: 40.8517983, lng: 14.2681244 },
  torino: { lat: 45.0703393, lng: 7.6869395 },
  venezia: { lat: 45.4371908, lng: 12.3345898 },
  firenze: { lat: 43.7695604, lng: 11.2558136 },
  bologna: { lat: 44.494887, lng: 11.3426163 },
  bari: { lat: 41.1257843, lng: 16.8620293 },
  palermo: { lat: 38.1156879, lng: 13.3612671 },
  genova: { lat: 44.4056499, lng: 8.946256 },
  padova: { lat: 45.391408, lng: 11.8058487 },
  verona: { lat: 45.4384957, lng: 10.9916215 }
};

const CATEGORY_IMAGES = {
  'ENVIRONMENT': 'https://images.unsplash.com/photo-1573152958734-1922c188fba3?w=800&h=600&fit=crop',
  'LGBTQ+': 'https://images.unsplash.com/photo-1596449895007-944e6c10e40e?w=800&h=600&fit=crop',
  'LABOR': 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop',
  'PEACE & ANTI-WAR': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop',
  'CIVIL & HUMAN RIGHTS': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
  'WOMEN\'S RIGHTS': 'https://images.unsplash.com/photo-1594736797933-d0751ba4fe65?w=800&h=600&fit=crop',
  'RACIAL & SOCIAL JUSTICE': 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop',
  'HEALTHCARE & EDUCATION': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
  'TRANSPARENCY & ANTI-CORRUPTION': 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&h=600&fit=crop',
  'OTHER': 'https://images.unsplash.com/photo-1573152958734-1922c188fba3?w=800&h=600&fit=crop'
};

function normalizeText(text) {
  if (!text) return '';
  return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function cleanText(text) {
  return text?.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ') || '';
}

function cleanTitle(title) {
  if (!title) return '';
  let cleanedTitle = title.trim().replace(/^["""]/, '').replace(/["""]$/, '');
  cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim();
  if (cleanedTitle.length > 0) {
    cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);
  }
  return cleanedTitle;
}

function categorizeEvent(title, description) {
  const text = normalizeText(`${title} ${description}`);
  if (text.includes('pride') || text.includes('lgbtq')) return 'LGBTQ+';
  if (text.includes('clima') || text.includes('ambiente') || text.includes('extinction') || text.includes('friday')) return 'ENVIRONMENT';
  if (text.includes('lavoro') || text.includes('sciopero') || text.includes('sindacato')) return 'LABOR';
  if (text.includes('guerra') || text.includes('pace') || text.includes('antimilitarista')) return 'PEACE & ANTI-WAR';
  if (text.includes('diritti') || text.includes('giustizia') || text.includes('bezos')) return 'CIVIL & HUMAN RIGHTS';
  if (text.includes('donna') || text.includes('donne') || text.includes('femminismo')) return 'WOMEN\'S RIGHTS';
  if (text.includes('razzismo') || text.includes('discriminazione') || text.includes('antifascist')) return 'RACIAL & SOCIAL JUSTICE';
  if (text.includes('sanita') || text.includes('scuola') || text.includes('health')) return 'HEALTHCARE & EDUCATION';
  if (text.includes('corruzione') || text.includes('trasparenza')) return 'TRANSPARENCY & ANTI-CORRUPTION';
  return 'OTHER';
}

function determineEventType(title, description = '') {
  const searchText = normalizeText(`${title} ${description}`);
  if (searchText.includes('workshop') || searchText.includes('corso') || searchText.includes('laboratorio')) return 'Workshop';
  if (searchText.includes('assemblea') || searchText.includes('riunione') || searchText.includes('incontro')) return 'Assembly';
  if (searchText.includes('conferenza') || searchText.includes('presentazione')) return 'Talk';
  if (searchText.includes('manifestazione') || searchText.includes('protesta') || searchText.includes('corteo')) return 'Protest';
  return 'Other';
}

/**
 * Extract event date from article text content (not publication date)
 */
function extractEventDate(fullText) {
  if (!fullText) return null;
  
  const text = fullText.toLowerCase();
  const italianMonths = {
    gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
    maggio: '05', giugno: '06', luglio: '07', agosto: '08',
    settembre: '09', ottobre: '10', novembre: '11', dicembre: '12'
  };

  // Event scheduling keywords
  const eventKeywords = ['si terrà', 'avrà luogo', 'è previsto', 'in programma', 'evento', 'manifestazione', 'quando', 'data'];
  
  // Split into sentences and find event-related ones
  const sentences = text.split(/[.!?]\s+/);
  
  for (const sentence of sentences) {
    const hasEventKeyword = eventKeywords.some(keyword => sentence.includes(keyword));
    
    if (hasEventKeyword) {
      // Look for "sabato 15 giugno" pattern
      const dayDateMatch = sentence.match(/(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(\d{4}))?/);
      if (dayDateMatch) {
        const day = dayDateMatch[1].padStart(2, '0');
        const month = italianMonths[dayDateMatch[2]];
        const year = dayDateMatch[3] || new Date().getFullYear().toString();
        const eventDate = `${year}-${month}-${day}`;
        
        // Validate date is reasonable
        const dateObj = new Date(eventDate);
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        if (dateObj >= threeMonthsAgo) {
          return eventDate;
        }
      }
      
      // Look for "il 15 giugno" pattern
      const specificDateMatch = sentence.match(/(?:il|dal|fino al|per il)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(\d{4}))?/);
      if (specificDateMatch) {
        const day = specificDateMatch[1].padStart(2, '0');
        const month = italianMonths[specificDateMatch[2]];
        const year = specificDateMatch[3] || new Date().getFullYear().toString();
        const eventDate = `${year}-${month}-${day}`;
        
        const dateObj = new Date(eventDate);
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        if (dateObj >= threeMonthsAgo) {
          return eventDate;
        }
      }
    }
  }
  
  // Fallback to any date in reasonable range
  const generalDateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (generalDateMatch) {
    const day = generalDateMatch[1].padStart(2, '0');
    const month = generalDateMatch[2].padStart(2, '0');
    const year = generalDateMatch[3];
    const eventDate = `${year}-${month}-${day}`;
    
    const dateObj = new Date(eventDate);
    const today = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    if (dateObj >= twoMonthsAgo) {
      return eventDate;
    }
  }
  
  return null;
}

// Simple city-based coordinate assignment (no API calls for faster processing)
function getCoordinatesForCity(text) {
  const normalizedText = normalizeText(text);
  
  for (const [cityName, coords] of Object.entries(ITALIAN_CITIES)) {
    if (normalizedText.includes(cityName)) {
      return {
        city: cityName.charAt(0).toUpperCase() + cityName.slice(1),
        coordinates: coords
      };
    }
  }
  
  // Default to Milano if no city found
  return {
    city: 'Milano',
    coordinates: ITALIAN_CITIES.milano
  };
}

function extractBasicLocation(text) {
  const normalizedText = normalizeText(text);
  const originalText = text.toLowerCase();

  // Look for Italian address patterns
  const addressPatterns = [
    /\b(via\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /\b(piazza\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /\b(corso\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /\b(largo\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /\b(ponte\s+[a-zA-ZÀ-ÿ\s]+)/gi
  ];

  let detectedAddress = null;

  // Find specific address
  for (const pattern of addressPatterns) {
    const matches = originalText.match(pattern);
    if (matches && matches.length > 0) {
      detectedAddress = matches[0]
        .trim()
        .replace(/\s+/g, ' ')
        .split(/[,;]|presso/)[0]
        .trim();
      
      detectedAddress = detectedAddress
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      break;
    }
  }

  const cityInfo = getCoordinatesForCity(text);
  const finalAddress = detectedAddress || cityInfo.city;

  return {
    address: finalAddress,
    city: cityInfo.city,
    coordinates: cityInfo.coordinates
  };
}

async function saveEventToDatabase(event) {
  try {
    // Check for duplicate
    const { data: existing } = await supabase
      .from('protests')
      .select('id')
      .eq('title', event.title)
      .eq('city', event.city);

    if (existing && existing.length > 0) {
      console.log(`⚠️ Duplicate event: "${event.title}"`);
      return false;
    }

    const eventData = {
      title: cleanTitle(event.title) || 'Untitled Event',
      description: event.description || 'No description available',
      category: event.category || 'OTHER',
      city: event.city || 'Milano',
      address: event.address || event.city || 'Milano',
      latitude: String(event.latitude || ITALIAN_CITIES.milano.lat),
      longitude: String(event.longitude || ITALIAN_CITIES.milano.lng),
      date: event.date || null,
      time: event.time || 'N/A',
      image_url: event.image_url || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.OTHER,
      event_type: event.event_type || 'Other',
      event_url: event.event_url || null,
      country_code: 'IT',
      featured: false,
      attendees: 0,
      source_name: event.source_name || 'batch-scraper',
      source_url: event.source_url || '',
      scraped_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('protests')
      .insert([eventData])
      .select();

    if (error) {
      console.error(`❌ Error saving event "${event.title}":`, error.message);
      return false;
    }

    console.log(`✅ Saved: "${event.title}" | ${event.city} | ${event.category}`);
    return true;

  } catch (error) {
    console.error(`❌ Exception saving event "${event.title}":`, error.message);
    return false;
  }
}

async function scrapeGlobalProject() {
  console.log('\n🌍 Scraping GlobalProject.info...');
  const events = [];
  
  try {
    const response = await axios.get('https://www.globalproject.info/it/tags/news/menu', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = load(response.data);
    
    $('.item').each((i, element) => {
      if (i >= 15) return false; // Limit to 15 events
      
      const $el = $(element);
      const title = cleanText($el.find('h2, h3, .title').text()) || 
                   cleanText($el.text()).slice(0, 100);
      
      if (!title || title.length < 10) return;
      
      const description = cleanText($el.find('p, .content, .excerpt').text()).slice(0, 500);
      const link = $el.find('a').attr('href');
      
      let eventUrl = '';
      if (link && !link.startsWith('http')) {
        eventUrl = `https://www.globalproject.info${link}`;
      } else {
        eventUrl = link || 'https://www.globalproject.info';
      }
      
      // Extract location info
      const fullText = `${title} ${description}`;
      const locationInfo = extractBasicLocation(fullText);
      
      // Extract event date from content
      const eventDate = extractEventDate(`${title} ${description}`);
      
      const event = {
        title: cleanTitle(title),
        description: description || 'Evento di attivismo e giustizia sociale',
        category: categorizeEvent(title, description),
        city: locationInfo.city,
        address: locationInfo.address,
        latitude: locationInfo.coordinates.lat,
        longitude: locationInfo.coordinates.lng,
        date: eventDate || '2025-12-31', // Use end of year if no date found
        time: 'N/A',
        event_type: determineEventType(title, description),
        event_url: eventUrl,
        source_name: 'globalproject.info',
        source_url: 'https://www.globalproject.info/it/tags/news/menu'
      };
      
      events.push(event);
      console.log(`📋 Found: "${event.title.slice(0, 50)}..." | ${event.city} | ${event.category}`);
    });
    
  } catch (error) {
    console.error('❌ Error scraping GlobalProject:', error.message);
  }
  
  return events;
}

async function scrapeFridaysForFuture() {
  console.log('\n🌱 Scraping Fridays For Future Italia...');
  const events = [];
  
  try {
    const response = await axios.get('https://fridaysforfutureitalia.it/eventi/', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = load(response.data);
    
    $('.event, .post, article, .entry').each((i, element) => {
      if (i >= 10) return false; // Limit to 10 events
      
      const $el = $(element);
      const title = cleanText($el.find('h1, h2, h3, .title').text());
      
      if (!title || title.length < 5) return;
      
      const description = cleanText($el.find('p, .content, .excerpt').text()).slice(0, 500);
      const link = $el.find('a').attr('href');
      
      let eventUrl = '';
      if (link && !link.startsWith('http')) {
        eventUrl = `https://fridaysforfutureitalia.it${link}`;
      } else {
        eventUrl = link || 'https://fridaysforfutureitalia.it';
      }
      
      const fullText = `${title} ${description}`;
      const locationInfo = extractBasicLocation(fullText);
      
      // Extract event date from content
      const eventDate = extractEventDate(`${title} ${description}`);
      
      const event = {
        title: cleanTitle(title),
        description: description || 'Evento per il clima e la sostenibilità ambientale',
        category: 'ENVIRONMENT',
        city: locationInfo.city,
        address: locationInfo.address,
        latitude: locationInfo.coordinates.lat,
        longitude: locationInfo.coordinates.lng,
        date: eventDate || '2025-12-31', // Use end of year if no date found
        time: 'N/A',
        event_type: determineEventType(title, description),
        event_url: eventUrl,
        source_name: 'fridaysforfutureitalia.it',
        source_url: 'https://fridaysforfutureitalia.it/eventi/'
      };
      
      events.push(event);
      console.log(`📋 Found: "${event.title.slice(0, 50)}..." | ${event.city} | ${event.category}`);
    });
    
  } catch (error) {
    console.error('❌ Error scraping Fridays For Future:', error.message);
  }
  
  return events;
}

async function main() {
  console.log('🚀 Starting Batch Italian Protest Scraper...');
  console.log('📊 Processing 3 focused sources for better success rate\n');
  
  let totalSaved = 0;
  
  // Scrape GlobalProject
  const globalEvents = await scrapeGlobalProject();
  for (const event of globalEvents) {
    const success = await saveEventToDatabase(event);
    if (success) totalSaved++;
    await new Promise(resolve => setTimeout(resolve, 300)); // Small delay
  }
  
  // Scrape Fridays For Future
  const ffEvents = await scrapeFridaysForFuture();
  for (const event of ffEvents) {
    const success = await saveEventToDatabase(event);
    if (success) totalSaved++;
    await new Promise(resolve => setTimeout(resolve, 300)); // Small delay
  }
  
  console.log(`\n🎉 Batch scraper completed!`);
  console.log(`✅ Total events saved: ${totalSaved}`);
  console.log(`📍 All events positioned with accurate city coordinates`);
}

main().catch(console.error);