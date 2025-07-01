#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Keywords for filtering
const PROTEST_KEYWORDS = [
  'manifestazione', 'protesta', 'sciopero', 'presidio', 'corteo', 'occupazione',
  'sit-in', 'mobilitazione', 'marcia', 'picchetto', 'concentramento',
  'assemblea pubblica', 'iniziativa politica', 'blocco stradale', 'pride',
  'flash mob', 'raduno', 'comizio', 'assemblea', 'incontro pubblico'
];

const EXCLUDE_KEYWORDS = [
  'concerto', 'spettacolo', 'festival', 'mostra', 'fiera', 'mercatino',
  'messa', 'celebrazione', 'evento gastronomico', 'laboratorio',
  'evento sportivo', 'corsa', 'maratona', 'dj set', 'sagra', 'reading',
  'workshop', 'meditazione', 'presentazione', 'cena', 'aperitivo'
];

// Italian month names to numbers
const ITALIAN_MONTHS = {
  'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
  'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
  'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12',
  'gen': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'mag': '05', 'giu': '06',
  'lug': '07', 'ago': '08', 'set': '09', 'ott': '10', 'nov': '11', 'dic': '12'
};

// Italian day names
const ITALIAN_DAYS = {
  'lunedì': 'monday', 'martedì': 'tuesday', 'mercoledì': 'wednesday',
  'giovedì': 'thursday', 'venerdì': 'friday', 'sabato': 'saturday', 'domenica': 'sunday',
  'lun': 'monday', 'mar': 'tuesday', 'mer': 'wednesday', 'gio': 'thursday',
  'ven': 'friday', 'sab': 'saturday', 'dom': 'sunday'
};

// Category fallback images from Unsplash
const CATEGORY_IMAGES = {
  'environment': 'https://images.unsplash.com/photo-1569163139394-de44cb4e4ddb?w=500&h=300&fit=crop&auto=format',
  'lgbtq+': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop&auto=format',
  'women\'s rights': 'https://images.unsplash.com/photo-1594736797933-d0d39831ad1f?w=500&h=300&fit=crop&auto=format',
  'labor': 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500&h=300&fit=crop&auto=format',
  'racial & social justice': 'https://images.unsplash.com/photo-1593113616828-6f22bca04804?w=500&h=300&fit=crop&auto=format',
  'civil & human rights': 'https://images.unsplash.com/photo-1585515656559-a9dc1f06cc13?w=500&h=300&fit=crop&auto=format',
  'healthcare & education': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&h=300&fit=crop&auto=format',
  'peace & anti-war': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop&auto=format',
  'transparency & anti-corruption': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=300&fit=crop&auto=format',
  'other': 'https://images.unsplash.com/photo-1573152958734-1922c188fba3?w=500&h=300&fit=crop&auto=format'
};

// Major Italian cities with coordinates
const ITALIAN_CITIES = {
  'roma': { lat: 41.9028, lng: 12.4964 },
  'milano': { lat: 45.4642, lng: 9.1900 },
  'napoli': { lat: 40.8518, lng: 14.2681 },
  'torino': { lat: 45.0703, lng: 7.6869 },
  'palermo': { lat: 38.1157, lng: 13.3615 },
  'genova': { lat: 44.4056, lng: 8.9463 },
  'bologna': { lat: 44.4949, lng: 11.3426 },
  'firenze': { lat: 43.7696, lng: 11.2558 },
  'bari': { lat: 41.1171, lng: 16.8719 },
  'catania': { lat: 37.5079, lng: 15.0830 },
  'venezia': { lat: 45.4408, lng: 12.3155 },
  'verona': { lat: 45.4384, lng: 10.9916 },
  'messina': { lat: 38.1938, lng: 15.5540 },
  'padova': { lat: 45.4064, lng: 11.8768 },
  'trieste': { lat: 45.6495, lng: 13.7768 }
};

// Websites to scrape
const SCRAPE_SOURCES = [
  { 
    url: 'https://www.globalproject.info/it/tags/news/menu', 
    name: 'globalproject.info',
    type: 'news_list'
  },
  { 
    url: 'https://fridaysforfutureitalia.it/eventi/', 
    name: 'fridaysforfutureitalia.it',
    type: 'event_list'
  },
  { 
    url: 'https://extinctionrebellion.it/eventi/futuri/', 
    name: 'extinctionrebellion.it',
    type: 'event_list'
  },
  { 
    url: 'https://www.dinamopress.it/categoria/eventi', 
    name: 'dinamopress.it',
    type: 'news_list'
  },
  { 
    url: 'https://adlcobas.it/', 
    name: 'adlcobas.it',
    type: 'union_news'
  },
  { 
    url: 'https://www.notav.info/', 
    name: 'notav.info',
    type: 'movement_news'
  },
  { 
    url: 'https://it.euronews.com/tag/manifestazioni-in-italia', 
    name: 'euronews.com',
    type: 'news_major'
  },
  { 
    url: 'https://www.globalist.it/', 
    name: 'globalist.it',
    type: 'news_major'
  },
  { 
    url: 'https://www.open.online/', 
    name: 'open.online',
    type: 'news_major'
  },
  { 
    url: 'https://ilmanifesto.it/', 
    name: 'ilmanifesto.it',
    type: 'news_major'
  },
  { 
    url: 'https://ilrovescio.info/category/iniziative/', 
    name: 'ilrovescio.info',
    type: 'initiatives'
  },
  { 
    url: 'https://rivoluzioneanarchica.it/', 
    name: 'rivoluzioneanarchica.it',
    type: 'anarchist'
  }
];

/**
 * Utility Functions
 */

function normalizeText(text) {
  if (!text) return '';
  return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function cleanText(text) {
  return text?.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ') || '';
}

function cleanTitle(title) {
  if (!title) return '';
  
  let cleanedTitle = title.trim();
  
  // Remove date patterns at the beginning (DD/MM, DD-MM, DD.MM, DD/MM/YYYY, etc.)
  cleanedTitle = cleanedTitle.replace(/^\d{1,2}[\/\-\.]\d{1,2}(\/{1,2}\d{2,4})?\s*[\-–]?\s*/, '');
  
  // Remove city/location patterns at the beginning followed by dash
  // Common Italian cities and regions
  const italianCities = [
    'roma', 'milano', 'napoli', 'torino', 'palermo', 'genova', 'bologna', 'firenze', 'bari', 'catania',
    'venezia', 'verona', 'messina', 'padova', 'trieste', 'brescia', 'taranto', 'prato', 'reggio calabria',
    'modena', 'parma', 'perugia', 'livorno', 'cagliari', 'foggia', 'salerno', 'ravenna', 'ferrara',
    'rimini', 'syrakuse', 'sassari', 'monza', 'bergamo', 'pescara', 'vicenza', 'terni', 'forlì',
    'trento', 'novara', 'piacenza', 'ancona', 'andria', 'arezzo', 'udine', 'cesena', 'lecce', 'pesaro'
  ];
  
  // Create regex pattern for cities
  const cityPattern = new RegExp(`^(${italianCities.join('|')})\\s*[\\-–]?\\s*`, 'i');
  cleanedTitle = cleanedTitle.replace(cityPattern, '');
  
  // Remove generic location patterns like "Piazza X -" or "Via Y -"
  cleanedTitle = cleanedTitle.replace(/^(piazza|via|corso|viale|largo|ponte)\s+[^-–]+[\-–]\s*/i, '');
  
  // Remove double quotes at the beginning and end of title
  cleanedTitle = cleanedTitle.replace(/^["""]/, '').replace(/["""]$/, '');
  
  // Remove extra spaces and dashes at the beginning
  cleanedTitle = cleanedTitle.replace(/^[\s\-–]+/, '');
  
  // Capitalize first letter
  if (cleanedTitle.length > 0) {
    cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);
  }
  
  return cleanedTitle.trim();
}

function containsProtestKeywords(text) {
  const normalizedText = normalizeText(text);
  return PROTEST_KEYWORDS.some(keyword => normalizedText.includes(keyword));
}

function containsExcludeKeywords(text) {
  const normalizedText = normalizeText(text);
  return EXCLUDE_KEYWORDS.some(keyword => normalizedText.includes(keyword));
}

/**
 * Enhanced date and time parsing
 */
function parseItalianDateTime(dateTimeString) {
  if (!dateTimeString || dateTimeString.trim().length === 0) {
    return { date: null, time: null };
  }
  
  const cleanDateTimeString = cleanText(dateTimeString).toLowerCase();
  console.log(`🕐 Parsing date/time: "${cleanDateTimeString}"`);
  
  let date = null;
  let time = null;
  
  // Extract time first (HH:MM format)
  const timeMatch = cleanDateTimeString.match(/(\d{1,2})[:\.](\d{2})/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2];
    time = `${hours}:${minutes}`;
    console.log(`⏰ Extracted time: ${time}`);
  }
  
  // Extract date
  // Try DD/MM/YYYY or DD-MM-YYYY format (with or without spaces)
  let dateMatch = cleanDateTimeString.match(/(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{4})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = dateMatch[3];
    date = `${year}-${month}-${day}`;
    console.log(`📅 Extracted date (DD/MM/YYYY): ${date}`);
    return { date, time };
  }
  
  // Try DD/MM format (assume current year, with or without spaces)
  dateMatch = cleanDateTimeString.match(/(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = new Date().getFullYear();
    date = `${year}-${month}-${day}`;
    console.log(`📅 Extracted date (DD/MM): ${date}`);
    return { date, time };
  }
  
  // Try to find month names
  let month = null;
  let day = null;
  let year = new Date().getFullYear();
  
  for (const [monthName, monthNum] of Object.entries(ITALIAN_MONTHS)) {
    if (cleanDateTimeString.includes(monthName)) {
      month = monthNum;
      console.log(`📅 Found month: ${monthName} (${month})`);
      break;
    }
  }
  
  if (month) {
    // Try to find day number near the month
    const dayMatch = cleanDateTimeString.match(/(\d{1,2})/);
    if (dayMatch) {
      day = dayMatch[1].padStart(2, '0');
      console.log(`📅 Found day: ${day}`);
    }
  }
  
  if (month && day) {
    date = `${year}-${month}-${day}`;
    console.log(`📅 Constructed date: ${date}`);
  }
  
  return { date, time };
}

/**
 * Enhanced address extraction
 */
function extractAddress(element, $) {
  const addressSelectors = [
    '.location', '.address', '.venue', '.place', '.dove', '.luogo',
    '.address-line', '.event-location', '.location-info'
  ];
  
  let fullAddress = '';
  let city = '';
  let postalCode = '';
  
  // Try to find address in specific selectors
  for (const selector of addressSelectors) {
    const addressText = cleanText($(element).find(selector).text());
    if (addressText && addressText.length > 3) {
      fullAddress = addressText;
      break;
    }
  }
  
  // If no specific address found, look in general text
  if (!fullAddress) {
    const allText = cleanText($(element).text());
    
    // Look for patterns like "Via ...", "Piazza ...", "Corso ..."
    const addressPattern = /(via|piazza|corso|viale|largo|ponte)\s+[^,\n]+/gi;
    const addressMatch = allText.match(addressPattern);
    if (addressMatch) {
      fullAddress = addressMatch[0];
    }
  }
  
  // Extract city from address or find in text
  if (fullAddress) {
    // Look for Italian cities in the address
    for (const [cityName, coords] of Object.entries(ITALIAN_CITIES)) {
      if (normalizeText(fullAddress).includes(cityName)) {
        city = cityName.charAt(0).toUpperCase() + cityName.slice(1);
        break;
      }
    }
  }
  
  // Extract postal code
  const postalMatch = fullAddress.match(/\b\d{5}\b/);
  if (postalMatch) {
    postalCode = postalMatch[0];
  }
  
  // If no city found in address, look in broader text
  if (!city) {
    const fullText = cleanText($(element).text());
    for (const [cityName, coords] of Object.entries(ITALIAN_CITIES)) {
      if (normalizeText(fullText).includes(cityName)) {
        city = cityName.charAt(0).toUpperCase() + cityName.slice(1);
        break;
      }
    }
  }
  
  // Default to Milano if no city found
  if (!city) {
    city = 'Milano';
  }
  
  return {
    fullAddress: fullAddress || city,
    city: city,
    postalCode: postalCode
  };
}

/**
 * Enhanced event URL extraction
 */
function extractEventUrl(element, $, baseUrl) {
  const linkSelectors = [
    'a[href*="evento"]', 'a[href*="event"]', 'a[href*="manifestazione"]',
    '.event-link a', '.title a', '.headline a', 'h1 a', 'h2 a', 'h3 a'
  ];
  
  let eventUrl = '';
  
  // Try specific selectors first
  for (const selector of linkSelectors) {
    const link = $(element).find(selector).first();
    if (link.length > 0) {
      eventUrl = link.attr('href');
      break;
    }
  }
  
  // If no specific link found, look for any link in the element
  if (!eventUrl) {
    const anyLink = $(element).find('a').first();
    if (anyLink.length > 0) {
      eventUrl = anyLink.attr('href');
    }
  }
  
  // Convert relative URLs to absolute
  if (eventUrl && !eventUrl.startsWith('http')) {
    try {
      eventUrl = new URL(eventUrl, baseUrl).href;
    } catch (error) {
      console.log(`⚠️ Could not convert URL: ${eventUrl}`);
      eventUrl = '';
    }
  }
  
  return eventUrl || null;
}

/**
 * Fetch event details from detail page
 */
async function fetchEventDetails(eventUrl) {
  if (!eventUrl) return null;
  
  try {
    console.log(`🔍 Fetching event details from: ${eventUrl}`);
    
    const response = await axios.get(eventUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = load(response.data);
    
    // Extract detailed address
    const detailedAddress = extractAddress($('body'), $);
    
    // Extract more detailed description
    const detailedDescription = cleanText($('.content, .description, .event-description, .post-content, article').text());
    
    // Extract more precise date/time
    const dateTimeText = cleanText($('.date, .time, .when, .data, .orario, time').text());
    const dateTime = parseItalianDateTime(dateTimeText);
    
    return {
      detailedAddress,
      detailedDescription: detailedDescription.substring(0, 500),
      dateTime
    };
    
  } catch (error) {
    console.log(`❌ Error fetching event details: ${error.message}`);
    return null;
  }
}

/**
 * Categorize events based on content
 */
function categorizeEvent(title, description) {
  const fullText = normalizeText(`${title} ${description}`);
  
  const categories = {
    'lgbtq+': ['pride', 'lgbt', 'gay', 'lesbian', 'trans', 'queer', 'omofobia', 'transfobia'],
    'environment': ['clima', 'ambiente', 'green', 'sostenibilità', 'ecologia', 'inquinamento', 'riscaldamento'],
    'women\'s rights': ['donna', 'donne', 'femminismo', 'parità', 'violenza donne', 'femminicidio'],
    'labor': ['lavoro', 'lavoratori', 'sindacato', 'sciopero', 'operai', 'precari', 'salario'],
    'racial & social justice': ['razzismo', 'immigrazione', 'rifugiati', 'antirazzismo', 'integrazione'],
    'civil & human rights': ['diritti', 'libertà', 'costituzione', 'democrazia', 'giustizia sociale'],
    'healthcare & education': ['sanità', 'scuola', 'università', 'istruzione', 'salute', 'medici'],
    'peace & anti-war': ['pace', 'guerra', 'palestina', 'ukraine', 'antimilitarismo', 'pacifismo'],
    'transparency & anti-corruption': ['corruzione', 'trasparenza', 'mafie', 'legalità', 'antimafia']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => fullText.includes(keyword))) {
      return category;
    }
  }
  
  return 'other';
}

/**
 * Geocode address to coordinates
 */
async function geocodeAddress(address, city) {
  // First try to use known Italian cities
  const cityKey = normalizeText(city);
  if (ITALIAN_CITIES[cityKey]) {
    console.log(`🗺️ Using known coordinates for ${city}`);
    return ITALIAN_CITIES[cityKey];
  }
  
  // Use OpenStreetMap Nominatim for geocoding
  try {
    const query = encodeURIComponent(`${address}, ${city}, Italy`);
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Corteo-Scraper/1.0'
      }
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      console.log(`🗺️ Geocoded ${address} to ${result.lat}, ${result.lon}`);
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    }
  } catch (error) {
    console.log(`⚠️ Geocoding failed for ${address}: ${error.message}`);
  }
  
  // Fallback to Milano coordinates
  return { lat: 45.4642, lng: 9.1900 };
}

/**
 * Check for duplicate events
 */
async function checkDuplicate(title, date, city) {
  try {
    const normalizedTitle = normalizeText(title);
    const normalizedCity = normalizeText(city);
    
    const { data, error } = await supabase
      .from('protests')
      .select('id, title, date, city')
      .eq('date', date);
    
    if (error) {
      console.error('Error checking duplicates:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      for (const existing of data) {
        const existingTitle = normalizeText(existing.title);
        const existingCity = normalizeText(existing.city || '');
        
        if (existingTitle === normalizedTitle && existingCity.includes(normalizedCity)) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in checkDuplicate:', error);
    return false;
  }
}

/**
 * Detect and follow pagination
 */
async function detectPagination($, baseUrl) {
  const paginationSelectors = [
    'a[href*="page"]', 'a[href*="pagina"]', '.pagination a', '.pager a',
    '.next-page', '.load-more', 'a:contains("Successiva")', 'a:contains("Avanti")',
    'a:contains("Next")', 'a:contains("More")', 'button[onclick*="load"]'
  ];
  
  const paginationLinks = [];
  
  for (const selector of paginationSelectors) {
    $(selector).each((i, element) => {
      const href = $(element).attr('href') || $(element).attr('onclick');
      if (href) {
        let url = href;
        if (href.includes('onclick')) {
          // Try to extract URL from onclick handler
          const urlMatch = href.match(/['"]([^'"]+)['"]/);
          if (urlMatch) {
            url = urlMatch[1];
          }
        }
        
        if (url && !url.startsWith('http')) {
          try {
            url = new URL(url, baseUrl).href;
          } catch (error) {
            console.log(`⚠️ Could not convert pagination URL: ${url}`);
            return;
          }
        }
        
        if (url && url.startsWith('http')) {
          paginationLinks.push(url);
        }
      }
    });
  }
  
  // Remove duplicates and limit to 5 pages max
  const uniqueLinks = [...new Set(paginationLinks)].slice(0, 5);
  console.log(`📄 Found ${uniqueLinks.length} pagination links`);
  
  return uniqueLinks;
}

/**
 * Enhanced scraping with pagination
 */
async function scrapeWebsiteWithPagination(source) {
  console.log(`🔍 Scraping ${source.name} with pagination support...`);
  const allEvents = [];
  const processedUrls = new Set();
  const urlsToProcess = [source.url];
  
  while (urlsToProcess.length > 0 && allEvents.length < 50) {
    const currentUrl = urlsToProcess.shift();
    
    if (processedUrls.has(currentUrl)) {
      console.log(`⏭️ Skipping already processed URL: ${currentUrl}`);
      continue;
    }
    
    processedUrls.add(currentUrl);
    console.log(`📄 Processing page: ${currentUrl}`);
    
    try {
      const response = await axios.get(currentUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = load(response.data);
      
      // Detect pagination for next iterations
      const paginationLinks = await detectPagination($, currentUrl);
      for (const link of paginationLinks) {
        if (!processedUrls.has(link) && !urlsToProcess.includes(link)) {
          urlsToProcess.push(link);
        }
      }
      
      // Extract events from current page
      const pageEvents = await extractEventsFromPage($, currentUrl, source.name);
      allEvents.push(...pageEvents);
      
      console.log(`📊 Found ${pageEvents.length} events on this page. Total: ${allEvents.length}`);
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error scraping ${currentUrl}:`, error.message);
    }
  }
  
  console.log(`✅ Completed scraping ${source.name}. Total events: ${allEvents.length}`);
  return allEvents;
}

/**
 * Extract events from a single page
 */
async function extractEventsFromPage($, pageUrl, sourceName) {
  const events = [];
  
  // Generic selectors for events
  const eventSelectors = [
    'article', '.event', '.evento', '.manifestazione', '.news', '.post',
    '.card', '.item', '.entry', '.event-item', '.post-item'
  ];
  
  const scrapedElements = new Set();
  
  for (const selector of eventSelectors) {
    $(selector).each(async (i, element) => {
      if (scrapedElements.has(element)) return;
      scrapedElements.add(element);
      
      const $el = $(element);
      
      // Extract text content
      const rawTitle = cleanText($el.find('h1, h2, h3, .title, .headline').first().text() || $el.text().substring(0, 100));
      const title = cleanTitle(rawTitle);
      const description = cleanText($el.find('p, .description, .content, .summary').text() || $el.text().substring(0, 500));
      
      if (!title || title.length < 5) {
        console.log(`⚠️ Skipping event with short title: "${title}"`);
        return;
      }
      
      // Check if it's a protest-related event
      const fullText = `${title} ${description}`;
      if (!containsProtestKeywords(fullText)) {
        console.log(`⚠️ Skipping non-protest event: "${title}"`);
        return;
      }
      
      if (containsExcludeKeywords(fullText)) {
        console.log(`⚠️ Skipping excluded event: "${title}"`);
        return;
      }
      
      // Extract date and time
      const dateTimeText = cleanText($el.find('.date, .when, time, .data, .orario').text());
      const { date, time } = parseItalianDateTime(dateTimeText);
      
      // Extract address
      const addressInfo = extractAddress(element, $);
      
      // Extract event URL
      const eventUrl = extractEventUrl(element, $, pageUrl);
      
      // Try to get more details from event page
      let eventDetails = null;
      if (eventUrl) {
        eventDetails = await fetchEventDetails(eventUrl);
        // Add small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Use enhanced details if available
      const finalAddress = eventDetails?.detailedAddress || addressInfo;
      const finalDescription = eventDetails?.detailedDescription || description;
      const finalDateTime = eventDetails?.dateTime || { date, time };
      
      // Extract image URL
      let imageUrl = $el.find('img').first().attr('src');
      if (imageUrl && !imageUrl.startsWith('http')) {
        try {
          imageUrl = new URL(imageUrl, pageUrl).href;
        } catch (error) {
          imageUrl = null;
        }
      }
      
      const category = categorizeEvent(title, finalDescription);
      
      // Log event details for debugging
      console.log(`📋 Event found: "${title}"`);
      console.log(`   📅 Date: ${finalDateTime.date || 'N/A'}`);
      console.log(`   ⏰ Time: ${finalDateTime.time || 'N/A'}`);
      console.log(`   📍 Address: ${finalAddress.fullAddress}`);
      console.log(`   🏙️ City: ${finalAddress.city}`);
      console.log(`   🔗 URL: ${eventUrl || 'N/A'}`);
      console.log(`   📂 Category: ${category}`);
      
      events.push({
        title,
        description: finalDescription,
        category,
        address: finalAddress.fullAddress,
        city: finalAddress.city,
        postalCode: finalAddress.postalCode,
        date: finalDateTime.date,
        time: finalDateTime.time,
        image_url: imageUrl,
        event_url: eventUrl,
        source_name: sourceName,
        source_url: pageUrl
      });
    });
  }
  
  return events;
}

/**
 * Save event to database
 */
async function saveEventToDatabase(event) {
  try {
    // Check for duplicates
    if (event.date) {
      const isDuplicate = await checkDuplicate(event.title, event.date, event.city);
      if (isDuplicate) {
        console.log(`⏭️ Duplicate event skipped: "${event.title}"`);
        return false;
      }
    }
    
    // Geocode address
    const coordinates = await geocodeAddress(event.address, event.city);
    
    // Prepare event data for database
    const eventData = {
      title: cleanTitle(event.title),
      description: event.description,
      category: event.category,
      city: event.city,
      address: event.address,
      latitude: coordinates.lat.toString(),
      longitude: coordinates.lng.toString(),
      date: event.date,
      time: event.time,
      image_url: event.image_url || CATEGORY_IMAGES[event.category],
      event_url: event.event_url,
      country_code: 'IT',
      featured: false,
      attendees: 0,
      source_name: event.source_name,
      source_url: event.source_url,
      scraped_at: new Date().toISOString()
    };
    
    // Insert into database
    const { data, error } = await supabase
      .from('protests')
      .insert([eventData])
      .select();
    
    if (error) {
      console.error('❌ Error inserting event:', error);
      return false;
    }
    
    console.log(`✅ Saved: "${event.title}" in ${event.city}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error in saveEventToDatabase:', error);
    return false;
  }
}

/**
 * Main scraping function
 */
async function main() {
  console.log('🚀 Starting Enhanced Italian Protest Scraper...');
  console.log(`📊 Scraping ${SCRAPE_SOURCES.length} sources including major Italian news outlets`);
  
  let totalEvents = 0;
  let savedEvents = 0;
  
  for (const source of SCRAPE_SOURCES) {
    console.log(`\n🔍 Processing source: ${source.name}`);
    
    try {
      const events = await scrapeWebsiteWithPagination(source);
      totalEvents += events.length;
      
      console.log(`📊 Found ${events.length} potential events from ${source.name}`);
      
      // Save events to database
      for (const event of events) {
        const success = await saveEventToDatabase(event);
        if (success) {
          savedEvents++;
        }
        
        // Add delay between saves
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Add delay between sources
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error(`❌ Error processing ${source.name}:`, error.message);
    }
  }
  
  console.log('\n🎉 Scraping completed!');
  console.log(`📊 Total events found: ${totalEvents}`);
  console.log(`💾 Events saved to database: ${savedEvents}`);
  console.log(`⏭️ Events skipped (duplicates): ${totalEvents - savedEvents}`);
}

// Run the scraper if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Export for use as module
export { main };