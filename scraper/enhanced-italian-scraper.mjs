import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Performance Configuration
const PERFORMANCE_CONFIG = {
  MAX_PAGES_PER_WEBSITE: 3,           // Reduced for faster processing
  DATE_CUTOFF_DAYS: 60,               // Extended for more events
  REQUEST_TIMEOUT: 8000,              // Reduced timeout
  MAX_CONCURRENT_REQUESTS: 2,         // Reduced concurrency
  DELAY_BETWEEN_REQUESTS: 1000,       // Faster requests
  DELAY_BETWEEN_SOURCES: 2000         // Faster source switching
};

// Keywords for filtering
const PROTEST_KEYWORDS = [
  'manifestazione', 'protesta', 'sciopero', 'presidio', 'corteo', 'occupazione',
  'sit-in', 'mobilitazione', 'marcia', 'picchetto', 'concentramento',
  'assemblea pubblica', 'iniziativa politica', 'blocco', 'pride',
  'flash mob', 'raduno', 'comizio', 'assemblea',
  // NEW: educational and organizing events
  'workshop', 'seminario', 'formazione', 'incontro', 'presentazione', 'assemblea', 'gruppo'
];

const EXCLUDE_KEYWORDS = [
  'concerto', 'spettacolo', 'festival', 'mostra', 'fiera', 'mercatino', 'messa', 'celebrazione', 'evento gastronomico', 'evento sportivo', 'corsa', 'maratona', 'dj set', 'sagra', 'reading', 'meditazione', 'cena', 'aperitivo'
];

// Italian month names to numbers
const ITALIAN_MONTHS = {
  'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
  'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
  'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12',
  'gen': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'mag': '05', 'giu': '06',
  'lug': '07', 'ago': '08', 'set': '09', 'ott': '10', 'nov': '11', 'dic': '12'
};

// Category fallback images from Unsplash
const CATEGORY_IMAGES = {
  'ENVIRONMENT': 'https://images.unsplash.com/photo-1569163139394-de44cb4e4ddb?w=500&h=300&fit=crop&auto=format',
  'LGBTQ+': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop&auto=format',
  'WOMEN\'S RIGHTS': 'https://images.unsplash.com/photo-1594736797933-d0d39831ad1f?w=500&h=300&fit=crop&auto=format',
  'LABOR': 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500&h=300&fit=crop&auto=format',
  'RACIAL & SOCIAL JUSTICE': 'https://images.unsplash.com/photo-1593113616828-6f22bca04804?w=500&h=300&fit=crop&auto=format',
  'CIVIL & HUMAN RIGHTS': 'https://images.unsplash.com/photo-1585515656559-a9dc1f06cc13?w=500&h=300&fit=crop&auto=format',
  'HEALTHCARE & EDUCATION': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&h=300&fit=crop&auto=format',
  'PEACE & ANTI-WAR': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop&auto=format',
  'TRANSPARENCY & ANTI-CORRUPTION': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=300&fit=crop&auto=format',
  'OTHER': 'https://images.unsplash.com/photo-1573152958734-1922c188fba3?w=500&h=300&fit=crop&auto=format'
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

// Comprehensive Italian news and activism sources
const SCRAPE_SOURCES = [
  // Activism and Social Movement Sites
  {
    url: 'https://www.globalproject.info/it/tags/news/menu',
    name: 'globalproject.info',
    type: 'activism'
  },
  {
    url: 'https://www.dinamopress.it/categoria/eventi',
    name: 'dinamopress.it',
    type: 'activism'
  },
  {
    url: 'https://adlcobas.it/',
    name: 'adlcobas.it',
    type: 'labor'
  },
  {
    url: 'https://www.notav.info/',
    name: 'notav.info',
    type: 'movement'
  },
  {
    url: 'https://ilrovescio.info/category/iniziative/',
    name: 'ilrovescio.info',
    type: 'initiatives'
  },

  // Environmental Activism
  {
    url: 'https://fridaysforfutureitalia.it/eventi/',
    name: 'fridaysforfutureitalia.it',
    type: 'environment'
  },
  {
    url: 'https://extinctionrebellion.it/eventi/futuri/',
    name: 'extinctionrebellion.it',
    type: 'environment'
  },

  // Alternative Movement Sources
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

  // Only remove quotes at the beginning and end
  cleanedTitle = cleanedTitle.replace(/^["""]/, '').replace(/["""]$/, '');

  // Clean up extra spaces
  cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim();

  // Capitalize first letter if needed
  if (cleanedTitle.length > 0) {
    cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);
  }

  return cleanedTitle;
}

function containsProtestKeywords(text) {
  const normalizedText = normalizeText(text);
  return PROTEST_KEYWORDS.some(keyword => normalizedText.includes(keyword));
}

function containsExcludeKeywords(text) {
  const normalizedText = normalizeText(text);
  return EXCLUDE_KEYWORDS.some(keyword => normalizedText.includes(keyword));
}

function getDateCutoff() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - PERFORMANCE_CONFIG.DATE_CUTOFF_DAYS);
  return cutoffDate;
}

function isDateWithinCutoff(eventDate) {
  if (!eventDate) return true;

  try {
    const eventDateObj = new Date(eventDate);
    const cutoffDate = getDateCutoff();
    return eventDateObj >= cutoffDate;
  } catch (error) {
    return true;
  }
}

/**
 * Enhanced date parsing
 */
function parseItalianDateTime(dateTimeString) {
  if (!dateTimeString || dateTimeString.trim().length === 0) {
    return { date: null, time: null };
  }

  const cleanDateTimeString = cleanText(dateTimeString).toLowerCase();

  let date = null;
  let time = null;

  // Extract time (HH:MM format)
  const timeMatch = cleanDateTimeString.match(/(\d{1,2})[:\.](\d{2})/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2];
    time = `${hours}:${minutes}`;
  }

  // Extract date - DD/MM/YYYY format
  let dateMatch = cleanDateTimeString.match(/(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{4})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = dateMatch[3];
    date = `${year}-${month}-${day}`;
    return { date, time };
  }

  // Extract date - DD/MM format (assume current year)
  dateMatch = cleanDateTimeString.match(/(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = new Date().getFullYear();
    date = `${year}-${month}-${day}`;
    return { date, time };
  }

  // Try month names
  let month = null;
  let day = null;
  let year = new Date().getFullYear();

  for (const [monthName, monthNum] of Object.entries(ITALIAN_MONTHS)) {
    if (cleanDateTimeString.includes(monthName)) {
      month = monthNum;
      break;
    }
  }

  if (month) {
    const dayMatch = cleanDateTimeString.match(/(\d{1,2})/);
    if (dayMatch) {
      day = dayMatch[1].padStart(2, '0');
      date = `${year}-${month}-${day}`;
    }
  }

  return { date, time };
}

/**
 * Address and location extraction
 */
function extractCityFromText(text) {
  const normalizedText = normalizeText(text);

  for (const [cityName, coords] of Object.entries(ITALIAN_CITIES)) {
    if (normalizedText.includes(cityName)) {
      return {
        city: cityName.charAt(0).toUpperCase() + cityName.slice(1),
        coordinates: coords
      };
    }
  }

  return {
    city: 'Milano',  // Default fallback
    coordinates: ITALIAN_CITIES.milano
  };
}

/**
 * Event categorization
 */
function categorizeEvent(title, description) {
  const text = normalizeText(`${title} ${description}`);

  if (text.includes('pride') || text.includes('lgbtq')) return 'LGBTQ+';
  if (text.includes('clima') || text.includes('ambiente') || text.includes('riscaldamento')) return 'ENVIRONMENT';
  if (text.includes('lavoro') || text.includes('sciopero') || text.includes('sindacato')) return 'LABOR';
  if (text.includes('guerra') || text.includes('pace') || text.includes('war')) return 'PEACE & ANTI-WAR';
  if (text.includes('diritti') || text.includes('giustizia') || text.includes('bezos')) return 'CIVIL & HUMAN RIGHTS';
  if (text.includes('donna') || text.includes('donne') || text.includes('femminicidi')) return 'WOMEN\'S RIGHTS';
  if (text.includes('razzismo') || text.includes('discriminazione')) return 'RACIAL & SOCIAL JUSTICE';
  if (text.includes('sanita') || text.includes('scuola') || text.includes('health')) return 'HEALTHCARE & EDUCATION';
  if (text.includes('corruzione') || text.includes('trasparenza')) return 'TRANSPARENCY & ANTI-CORRUPTION';

  return 'OTHER';
}

/**
 * Event type classification (for map icons)
 */
function determineEventType(title, description = '') {
  const searchText = normalizeText(`${title} ${description}`);
  
  // Define keywords for each type
  const protestKeywords = [
    'protest', 'march', 'rally', 'demonstration', 'strike', 'parade', 'pride', 'blockade', 'occupation', 'sit-in',
    'manifestazione', 'corteo', 'sciopero', 'mobilitazione', 'presidio', 'marcia', 'parata', 'assembramento',
    'blocco', 'occupazione', 'manifestare'
  ];
  
  const workshopKeywords = [
    'workshop', 'training', 'skill-share', 'legal info', 'activist education', 'course', 'formazione',
    'corso', 'laboratorio', 'addestramento', 'educazione'
  ];
  
  const assemblyKeywords = [
    'assembly', 'meeting', 'forum', 'strategy', 'open forum', 'public assembly',
    'assemblea', 'riunione', 'incontro', 'forum', 'strategia'
  ];
  
  const talkKeywords = [
    'talk', 'presentation', 'speaker', 'lecture', 'conference', 'summit',
    'presentazione', 'conferenza', 'relatore', 'intervento', 'discorso'
  ];
  
  // Check for each type in order of specificity
  if (workshopKeywords.some(keyword => searchText.includes(keyword))) {
    return 'Workshop';
  }
  
  if (assemblyKeywords.some(keyword => searchText.includes(keyword))) {
    return 'Assembly';
  }
  
  if (talkKeywords.some(keyword => searchText.includes(keyword))) {
    return 'Talk';
  }
  
  if (protestKeywords.some(keyword => searchText.includes(keyword))) {
    return 'Protest';
  }
  
  // Default to Other for political events that don't fit above categories
  return 'Other';
}

/**
 * Enhanced HTTP request with simple retry
 */
async function makeRequest(url) {
  try {
    console.log(`🔗 Fetching: ${url}`);

    const response = await axios.get(url, {
      timeout: PERFORMANCE_CONFIG.REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3'
      }
    });

    console.log(`✅ Request successful: ${response.status}`);
    return response;
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    throw error;
  }
}

/**
 * Check for duplicate events
 */
async function checkDuplicate(title, date, city) {
  try {
    const cleanTitleForDupe = cleanTitle(title).toLowerCase();

    const { data, error } = await supabase
      .from('protests')
      .select('id, title')
      .eq('city', city)
      .limit(10);

    if (error) {
      console.log('⚠️ Error checking duplicates:', error.message);
      return false;
    }

    // Check for similar titles
    const isDuplicate = data.some(event => {
      const existingTitle = cleanTitle(event.title).toLowerCase();
      return existingTitle === cleanTitleForDupe ||
        existingTitle.includes(cleanTitleForDupe) ||
        cleanTitleForDupe.includes(existingTitle);
    });

    return isDuplicate;
  } catch (error) {
    console.log('⚠️ Exception checking duplicates:', error.message);
    return false;
  }
}

/**
 * Save event to database with validation
 */
async function saveEventToDatabase(event) {
  try {
    console.log(`💾 Saving event: "${event.title}"`);

    // Check for duplicate
    const isDuplicate = await checkDuplicate(event.title, event.date, event.city);
    if (isDuplicate) {
      console.log(`⏭️ Skipping duplicate: "${event.title}"`);
      return false;
    }

    // Prepare event data
    const eventData = {
      title: cleanTitle(event.title) || 'Untitled Event',
      description: event.description || 'No description available',
      category: event.category || 'OTHER',
      city: event.city || 'Milano',
      address: event.address || event.city || 'Milano',
      latitude: String(event.latitude || ITALIAN_CITIES.milano.lat),
      longitude: String(event.longitude || ITALIAN_CITIES.milano.lng),
      date: event.date || null,
      time: event.time || 'N/A',  // N/A if no time found
      image_url: event.image_url || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.OTHER,
      event_type: determineEventType(event.title, event.description),
      event_url: event.event_url || null,
      country_code: 'IT',
      featured: false,
      attendees: 0,
      source_name: event.source_name || 'enhanced-scraper',
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

    console.log(`✅ Saved event: "${event.title}" (ID: ${data[0].id})`);
    return true;

  } catch (error) {
    console.error(`❌ Exception saving event "${event.title}":`, error.message);
    return false;
  }
}

/**
 * Enhanced website scraping with simplified logic
 */
async function scrapeWebsite(source) {
  console.log(`\n🔍 Scraping ${source.name}...`);

  const events = [];
  const stats = {
    pagesScraped: 0,
    eventsFound: 0,
    eventsSkippedByDate: 0,
    eventsSkippedByKeywords: 0
  };

  try {
    const response = await makeRequest(source.url);
    const $ = load(response.data);

    stats.pagesScraped = 1;

    console.log(`📄 Processing ${source.name}...`);

    // Generic selectors for finding events/articles
    const eventSelectors = [
      'article', '.post', '.event', '.news-item', '.item', '.entry',
      '.news', '.evento', '.manifestazione', '.iniziativa'
    ];

    let eventElements = $();
    for (const selector of eventSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        eventElements = elements;
        console.log(`📊 Found ${elements.length} potential events using selector: ${selector}`);
        break;
      }
    }

    // Process each potential event
    eventElements.slice(0, 20).each((index, element) => {
      try {
        const $el = $(element);

        // Extract basic information
        const title = cleanText($el.find('h1, h2, h3, .title, .headline').first().text()) ||
          cleanText($el.text()).slice(0, 100) + '...';

        const description = cleanText($el.find('p, .description, .excerpt, .content').first().text()) ||
          cleanText($el.text()).slice(0, 500);

        const link = $el.find('a').first().attr('href');
        let eventUrl = '';
        if (link && !link.startsWith('http')) {
          try {
            eventUrl = new URL(link, source.url).href;
          } catch (e) {
            eventUrl = source.url;
          }
        } else {
          eventUrl = link || source.url;
        }

        // Check if this looks like a protest/event
        const fullText = `${title} ${description}`.toLowerCase();
        if (!containsProtestKeywords(fullText)) {
          console.log(`⚠️ Skipping non-protest content: "${title.slice(0, 50)}..."`);
          stats.eventsSkippedByKeywords++;
          return;
        }

        // Check for excluded content
        if (containsExcludeKeywords(fullText)) {
          console.log(`⚠️ Skipping excluded content: "${title.slice(0, 50)}..."`);
          stats.eventsSkippedByKeywords++;
          return;
        }

        // Extract date/time
        const dateText = cleanText($el.find('.date, time, .when, .data').text()) || description;
        const { date, time } = parseItalianDateTime(dateText);

        // Check date cutoff
        if (date && !isDateWithinCutoff(date)) {
          console.log(`⏰ Skipping old event: "${title.slice(0, 50)}..." (${date})`);
          stats.eventsSkippedByDate++;
          return;
        }

        // Extract location
        const locationInfo = extractCityFromText(`${title} ${description}`);

        // Create event object
        const event = {
          title: cleanTitle(title),
          description: description.slice(0, 700),  // Limit description length
          category: categorizeEvent(title, description),
          city: locationInfo.city,
          address: locationInfo.city,
          latitude: locationInfo.coordinates.lat,
          longitude: locationInfo.coordinates.lng,
          date: date,
          time: time,
          image_url: CATEGORY_IMAGES[categorizeEvent(title, description)] || CATEGORY_IMAGES.other,
          event_url: eventUrl,
          source_name: source.name,
          source_url: source.url
        };

        events.push(event);
        stats.eventsFound++;

        console.log(`📋 Event found: "${event.title.slice(0, 50)}..." | ${event.category} | ${event.city} | ${event.date || 'No date'}`);

      } catch (error) {
        console.log(`⚠️ Error processing event element:`, error.message);
      }
    });

  } catch (error) {
    console.error(`❌ Error scraping ${source.name}:`, error.message);
  }

  console.log(`📊 ${source.name} Stats: ${events.length} events found`);
  return { events, stats };
}

/**
 * Main scraping function
 */
async function main() {
  console.log('🚀 Starting Enhanced Italian Protest Scraper...');
  console.log(`📊 Configuration: ${PERFORMANCE_CONFIG.DATE_CUTOFF_DAYS} days, ${SCRAPE_SOURCES.length} sources\n`);

  const globalStats = {
    totalEventsFound: 0,
    totalEventsSkippedByDate: 0,
    totalEventsSkippedByKeywords: 0,
    totalEventsSaved: 0,
    totalDuplicatesSkipped: 0,
    sourcesProcessed: 0
  };

  const startTime = Date.now();

  for (const source of SCRAPE_SOURCES) {
    console.log(`\n🌐 Processing source ${globalStats.sourcesProcessed + 1}/${SCRAPE_SOURCES.length}: ${source.name}`);

    try {
      const { events, stats } = await scrapeWebsite(source);

      // Update global statistics
      globalStats.totalEventsFound += stats.eventsFound;
      globalStats.totalEventsSkippedByDate += stats.eventsSkippedByDate;
      globalStats.totalEventsSkippedByKeywords += stats.eventsSkippedByKeywords;
      globalStats.sourcesProcessed++;

      // Save events to database
      for (const event of events) {
        const success = await saveEventToDatabase(event);
        if (success) {
          globalStats.totalEventsSaved++;
        } else {
          globalStats.totalDuplicatesSkipped++;
        }

        // Small delay between saves
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Delay before next source
      if (globalStats.sourcesProcessed < SCRAPE_SOURCES.length) {
        console.log(`⏳ Waiting ${PERFORMANCE_CONFIG.DELAY_BETWEEN_SOURCES}ms...`);
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
  console.log(`   ⏱️ Duration: ${duration} seconds`);
  console.log(`   🌐 Sources processed: ${globalStats.sourcesProcessed}/${SCRAPE_SOURCES.length}`);
  console.log(`   📋 Events found: ${globalStats.totalEventsFound}`);
  console.log(`   ✅ Events saved: ${globalStats.totalEventsSaved}`);
  console.log(`   📅 Skipped by date: ${globalStats.totalEventsSkippedByDate}`);
  console.log(`   🔍 Skipped by keywords: ${globalStats.totalEventsSkippedByKeywords}`);
  console.log(`   ⏭️ Duplicates skipped: ${globalStats.totalDuplicatesSkipped}`);
  console.log(`   📈 Success rate: ${Math.round((globalStats.totalEventsSaved / Math.max(globalStats.totalEventsFound, 1)) * 100)}%`);

  return globalStats;
}

// Run the scraper if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Export for use as module
export { main, PERFORMANCE_CONFIG };