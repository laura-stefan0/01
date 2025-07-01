
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Performance Configuration
const PERFORMANCE_CONFIG = {
  MAX_PAGES_PER_WEBSITE: 10,          // Maximum pages to scrape per website
  DATE_CUTOFF_DAYS: 30,               // Only scrape events from last 30 days
  REQUEST_TIMEOUT: 10000,             // 10 seconds timeout
  MAX_CONCURRENT_REQUESTS: 3,         // Limit concurrent requests
  DELAY_BETWEEN_REQUESTS: 2000,       // 2 seconds between requests
  DELAY_BETWEEN_PAGES: 3000,          // 3 seconds between page requests
  DELAY_BETWEEN_SOURCES: 5000         // 5 seconds between different sources
};

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
 * Performance and Date Utility Functions
 */

function getDateCutoff() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - PERFORMANCE_CONFIG.DATE_CUTOFF_DAYS);
  return cutoffDate;
}

function isDateWithinCutoff(eventDate) {
  if (!eventDate) return true; // Allow events without dates for now
  
  try {
    const eventDateObj = new Date(eventDate);
    const cutoffDate = getDateCutoff();
    
    console.log(`📅 Checking date: ${eventDate} against cutoff: ${cutoffDate.toISOString()}`);
    
    const isValid = eventDateObj >= cutoffDate;
    if (!isValid) {
      console.log(`❌ Event date ${eventDate} is older than cutoff (${PERFORMANCE_CONFIG.DATE_CUTOFF_DAYS} days)`);
    }
    
    return isValid;
  } catch (error) {
    console.log(`⚠️ Error parsing date ${eventDate}: ${error.message}`);
    return true; // Allow events with unparseable dates
  }
}

// Concurrency control
class RequestQueue {
  constructor(maxConcurrent = PERFORMANCE_CONFIG.MAX_CONCURRENT_REQUESTS) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { requestFn, resolve, reject } = this.queue.shift();

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

const requestQueue = new RequestQueue();

/**
 * Enhanced HTTP request with timeout and retry
 */
async function makeRequest(url, options = {}) {
  return await requestQueue.add(async () => {
    try {
      console.log(`🔗 Making request to: ${url}`);
      
      const response = await axios.get(url, {
        timeout: PERFORMANCE_CONFIG.REQUEST_TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3'
        },
        ...options
      });
      
      console.log(`✅ Request successful: ${url} (${response.status})`);
      return response;
    } catch (error) {
      console.log(`❌ Request failed: ${url} - ${error.message}`);
      throw error;
    }
  });
}

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
    
    const response = await makeRequest(eventUrl);
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
    const response = await makeRequest(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
    
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
    
    // Only check for duplicates if we have both title and date
    if (!title || !date) {
      console.log(`⚠️ Skipping duplicate check - missing title or date`);
      return false;
    }
    
    const { data, error } = await supabase
      .from('protests')
      .select('id, title, date')
      .eq('date', date)
      .limit(10);
    
    if (error) {
      console.error('Error checking duplicates:', error);
      return false; // Don't block saving if duplicate check fails
    }
    
    if (data && data.length > 0) {
      for (const existing of data) {
        const existingTitle = normalizeText(existing.title);
        
        // More lenient duplicate checking - only exact title matches
        if (existingTitle === normalizedTitle) {
          console.log(`🔄 Duplicate found: "${title}"`);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in checkDuplicate:', error);
    return false; // Don't block saving if duplicate check fails
  }
}

/**
 * Detect and follow pagination with limits
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
  
  // Remove duplicates and limit to max pages
  const uniqueLinks = [...new Set(paginationLinks)].slice(0, PERFORMANCE_CONFIG.MAX_PAGES_PER_WEBSITE - 1);
  console.log(`📄 Found ${uniqueLinks.length} pagination links (limited to ${PERFORMANCE_CONFIG.MAX_PAGES_PER_WEBSITE} total pages)`);
  
  return uniqueLinks;
}

/**
 * Enhanced scraping with pagination and performance limits
 */
async function scrapeWebsiteWithPagination(source) {
  console.log(`🔍 Scraping ${source.name} with pagination support...`);
  
  const stats = {
    pagesScraped: 0,
    eventsFound: 0,
    eventsSkippedByDate: 0,
    eventsSkippedByKeywords: 0,
    earlyStop: false
  };
  
  const allEvents = [];
  const processedUrls = new Set();
  const urlsToProcess = [source.url];
  
  while (urlsToProcess.length > 0 && stats.pagesScraped < PERFORMANCE_CONFIG.MAX_PAGES_PER_WEBSITE) {
    const currentUrl = urlsToProcess.shift();
    
    if (processedUrls.has(currentUrl)) {
      console.log(`⏭️ Skipping already processed URL: ${currentUrl}`);
      continue;
    }
    
    processedUrls.add(currentUrl);
    stats.pagesScraped++;
    
    console.log(`📄 Processing page ${stats.pagesScraped}/${PERFORMANCE_CONFIG.MAX_PAGES_PER_WEBSITE}: ${currentUrl}`);
    
    try {
      const response = await makeRequest(currentUrl);
      const $ = load(response.data);
      
      // Detect pagination for next iterations (only if we haven't hit the limit)
      if (stats.pagesScraped < PERFORMANCE_CONFIG.MAX_PAGES_PER_WEBSITE) {
        const paginationLinks = await detectPagination($, currentUrl);
        for (const link of paginationLinks) {
          if (!processedUrls.has(link) && !urlsToProcess.includes(link)) {
            urlsToProcess.push(link);
          }
        }
      }
      
      // Extract events from current page
      const { events: pageEvents, shouldStop } = await extractEventsFromPageWithDateCheck($, currentUrl, source.name, stats);
      allEvents.push(...pageEvents);
      
      console.log(`📊 Page ${stats.pagesScraped}: Found ${pageEvents.length} valid events. Total: ${allEvents.length}`);
      
      // Early stop if we found old events (indicating we've gone too far back)
      if (shouldStop) {
        console.log(`🛑 Early stop triggered: Found events older than ${PERFORMANCE_CONFIG.DATE_CUTOFF_DAYS} days cutoff`);
        stats.earlyStop = true;
        break;
      }
      
      // Add delay between page requests
      if (urlsToProcess.length > 0) {
        console.log(`⏳ Waiting ${PERFORMANCE_CONFIG.DELAY_BETWEEN_PAGES}ms before next page...`);
        await new Promise(resolve => setTimeout(resolve, PERFORMANCE_CONFIG.DELAY_BETWEEN_PAGES));
      }
      
    } catch (error) {
      console.error(`❌ Error scraping ${currentUrl}:`, error.message);
    }
  }
  
  // Log final statistics for this source
  console.log(`\n📊 ${source.name} Statistics:`);
  console.log(`   📄 Pages scraped: ${stats.pagesScraped}/${PERFORMANCE_CONFIG.MAX_PAGES_PER_WEBSITE}`);
  console.log(`   📋 Events found: ${stats.eventsFound}`);
  console.log(`   ✅ Valid events: ${allEvents.length}`);
  console.log(`   📅 Skipped by date: ${stats.eventsSkippedByDate}`);
  console.log(`   🔍 Skipped by keywords: ${stats.eventsSkippedByKeywords}`);
  console.log(`   🛑 Early stop: ${stats.earlyStop ? 'Yes' : 'No'}`);
  
  return { events: allEvents, stats };
}

/**
 * Extract events from a single page with date checking
 */
async function extractEventsFromPageWithDateCheck($, pageUrl, sourceName, stats) {
  const events = [];
  let shouldStop = false;
  
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
      stats.eventsFound++;
      
      // Extract text content
      const rawTitle = cleanText($el.find('h1, h2, h3, .title, .headline').first().text() || $el.text().substring(0, 100));
      const title = cleanTitle(rawTitle);
      const description = cleanText($el.find('p, .description, .content, .summary').text() || $el.text().substring(0, 500));
      
      if (!title || title.length < 5) {
        console.log(`⚠️ Skipping event with short title: "${title}"`);
        stats.eventsSkippedByKeywords++;
        return;
      }
      
      // Check if it's a protest-related event
      const fullText = `${title} ${description}`;
      if (!containsProtestKeywords(fullText)) {
        console.log(`⚠️ Skipping non-protest event: "${title}"`);
        stats.eventsSkippedByKeywords++;
        return;
      }
      
      if (containsExcludeKeywords(fullText)) {
        console.log(`⚠️ Skipping excluded event: "${title}"`);
        stats.eventsSkippedByKeywords++;
        return;
      }
      
      // Extract date and time
      const dateTimeText = cleanText($el.find('.date, .when, time, .data, .orario').text());
      const { date, time } = parseItalianDateTime(dateTimeText);
      
      // Check date cutoff
      if (date && !isDateWithinCutoff(date)) {
        console.log(`📅 Skipping event older than cutoff: "${title}" (${date})`);
        stats.eventsSkippedByDate++;
        shouldStop = true; // Trigger early stop if we found an old event
        return;
      }
      
      // Extract address
      const addressInfo = extractAddress(element, $);
      
      // Extract event URL
      const eventUrl = extractEventUrl(element, $, pageUrl);
      
      // Try to get more details from event page (with concurrency control)
      let eventDetails = null;
      if (eventUrl) {
        try {
          eventDetails = await fetchEventDetails(eventUrl);
          // Small delay between detail requests
          await new Promise(resolve => setTimeout(resolve, PERFORMANCE_CONFIG.DELAY_BETWEEN_REQUESTS));
        } catch (error) {
          console.log(`⚠️ Failed to fetch event details: ${error.message}`);
        }
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
  
  return { events, shouldStop };
}

/**
 * Save event to database
 */
async function saveEventToDatabase(event) {
  try {
    console.log(`💾 Attempting to save: "${event.title}"`);
    
    // Validate required fields
    if (!event.title || event.title.length < 3) {
      console.log(`⚠️ Skipping event with invalid title: "${event.title}"`);
      return false;
    }
    
    // Check for duplicates only if we have a date
    if (event.date) {
      const isDuplicate = await checkDuplicate(event.title, event.date, event.city);
      if (isDuplicate) {
        console.log(`⏭️ Duplicate event skipped: "${event.title}"`);
        return false;
      }
    }
    
    // Geocode address with fallback
    let coordinates;
    try {
      coordinates = await geocodeAddress(event.address, event.city);
    } catch (error) {
      console.log(`⚠️ Geocoding failed, using default coordinates: ${error.message}`);
      coordinates = { lat: 45.4642, lng: 9.1900 }; // Milano fallback
    }
    
    // Prepare event data for database with fallbacks
    const eventData = {
      title: cleanTitle(event.title) || event.title,
      description: event.description || '',
      category: event.category || 'other',
      location: event.city || 'Milano',  // Use 'location' field name from schema
      address: event.address || event.city || 'Milano, Italy',
      latitude: coordinates.lat.toString(),
      longitude: coordinates.lng.toString(),
      date: event.date || null,
      time: event.time || null,
      image_url: event.image_url || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES['other'],
      event_url: event.event_url || null,
      country_code: 'IT',
      featured: false,
      attendees: 0,
      source_name: event.source_name || 'unknown',
      source_url: event.source_url || null,
      scraped_at: new Date().toISOString()
    };
    
    console.log(`📋 Event data prepared:`, {
      title: eventData.title,
      date: eventData.date,
      city: eventData.city,
      category: eventData.category
    });
    
    // Insert into database
    const { data, error } = await supabase
      .from('protests')
      .insert([eventData])
      .select();
    
    if (error) {
      console.error('❌ Error inserting event:', error);
      console.error('📋 Event data that failed:', eventData);
      return false;
    }
    
    console.log(`✅ Saved: "${eventData.title}" in ${eventData.city} (ID: ${data[0].id})`);
    return true;
    
  } catch (error) {
    console.error('❌ Error in saveEventToDatabase:', error);
    console.error('📋 Event data:', event);
    return false;
  }
}

/**
 * Main scraping function with performance optimizations
 */
async function main() {
  console.log('🚀 Starting Enhanced Italian Protest Scraper with Performance Optimizations...');
  console.log(`📊 Configuration:`);
  console.log(`   📄 Max pages per website: ${PERFORMANCE_CONFIG.MAX_PAGES_PER_WEBSITE}`);
  console.log(`   📅 Date cutoff: ${PERFORMANCE_CONFIG.DATE_CUTOFF_DAYS} days`);
  console.log(`   ⏱️ Request timeout: ${PERFORMANCE_CONFIG.REQUEST_TIMEOUT}ms`);
  console.log(`   🔄 Max concurrent requests: ${PERFORMANCE_CONFIG.MAX_CONCURRENT_REQUESTS}`);
  console.log(`   📊 Scraping ${SCRAPE_SOURCES.length} sources`);
  
  const globalStats = {
    totalPagesScraped: 0,
    totalEventsFound: 0,
    totalEventsSkippedByDate: 0,
    totalEventsSkippedByKeywords: 0,
    totalEventsSaved: 0,
    totalDuplicatesSkipped: 0,
    sourcesWithEarlyStop: 0,
    sourcesProcessed: 0
  };
  
  const startTime = Date.now();
  
  for (const source of SCRAPE_SOURCES) {
    console.log(`\n🔍 Processing source ${globalStats.sourcesProcessed + 1}/${SCRAPE_SOURCES.length}: ${source.name}`);
    
    try {
      const { events, stats } = await scrapeWebsiteWithPagination(source);
      
      // Update global statistics
      globalStats.totalPagesScraped += stats.pagesScraped;
      globalStats.totalEventsFound += stats.eventsFound;
      globalStats.totalEventsSkippedByDate += stats.eventsSkippedByDate;
      globalStats.totalEventsSkippedByKeywords += stats.eventsSkippedByKeywords;
      globalStats.sourcesProcessed++;
      
      if (stats.earlyStop) {
        globalStats.sourcesWithEarlyStop++;
      }
      
      console.log(`📊 Found ${events.length} valid events from ${source.name}`);
      
      // Save events to database
      for (const event of events) {
        const success = await saveEventToDatabase(event);
        if (success) {
          globalStats.totalEventsSaved++;
        } else {
          globalStats.totalDuplicatesSkipped++;
        }
        
        // Add delay between saves
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Add delay between sources
      if (globalStats.sourcesProcessed < SCRAPE_SOURCES.length) {
        console.log(`⏳ Waiting ${PERFORMANCE_CONFIG.DELAY_BETWEEN_SOURCES}ms before next source...`);
        await new Promise(resolve => setTimeout(resolve, PERFORMANCE_CONFIG.DELAY_BETWEEN_SOURCES));
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${source.name}:`, error.message);
    }
  }
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log('\n🎉 Scraping completed!');
  console.log('\n📊 FINAL STATISTICS:');
  console.log(`   ⏱️ Total duration: ${duration} seconds`);
  console.log(`   🌐 Sources processed: ${globalStats.sourcesProcessed}/${SCRAPE_SOURCES.length}`);
  console.log(`   📄 Total pages scraped: ${globalStats.totalPagesScraped}`);
  console.log(`   📋 Total events found: ${globalStats.totalEventsFound}`);
  console.log(`   ✅ Events saved to database: ${globalStats.totalEventsSaved}`);
  console.log(`   📅 Events skipped by date cutoff: ${globalStats.totalEventsSkippedByDate}`);
  console.log(`   🔍 Events skipped by keywords: ${globalStats.totalEventsSkippedByKeywords}`);
  console.log(`   ⏭️ Duplicates skipped: ${globalStats.totalDuplicatesSkipped}`);
  console.log(`   🛑 Sources with early stop: ${globalStats.sourcesWithEarlyStop}`);
  console.log(`   📈 Success rate: ${Math.round((globalStats.totalEventsSaved / Math.max(globalStats.totalEventsFound, 1)) * 100)}%`);
  
  return globalStats;
}

// Run the scraper if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Export for use as module
export { main, PERFORMANCE_CONFIG };
