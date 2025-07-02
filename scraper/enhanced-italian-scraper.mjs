import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Date range filter: 30 days in the past to future events
const getDateRange = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const futureLimit = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // Allow future events up to 1 year

  return {
    minDate: thirtyDaysAgo,
    maxDate: futureLimit,
    minDateString: thirtyDaysAgo.toISOString().split('T')[0],
    maxDateString: futureLimit.toISOString().split('T')[0]
  };
};

// Check if a date is within our range
const isDateInRange = (dateString) => {
  if (!dateString) return false;

  const eventDate = new Date(dateString);
  const { minDate, maxDate } = getDateRange();

  return eventDate >= minDate && eventDate <= maxDate;
};

// Performance Configuration - Enhanced for deeper searching
const PERFORMANCE_CONFIG = {
  MAX_PAGES_PER_WEBSITE: 10,          // Increased from 5 to 10 as requested
  MAX_ARTICLES_PER_PAGE: 15,          // More articles per page
  DATE_CUTOFF_DAYS: 120,              // Extended date range for more events
  REQUEST_TIMEOUT: 15000,             // Longer timeout for complex pages
  MAX_CONCURRENT_REQUESTS: 1,         // Sequential for reliability
  DELAY_BETWEEN_REQUESTS: 300,        // Faster processing
  DELAY_BETWEEN_SOURCES: 800,         // Balanced source switching
  DELAY_BETWEEN_PAGES: 500            // Page switching delay
};

// Expanded keywords for broader event detection - including meetups, workshops, talks
const ACTIVISM_KEYWORDS = [
  // Traditional protest activities
  'manifestazione', 'protesta', 'sciopero', 'presidio', 'corteo', 'occupazione',
  'sit-in', 'mobilitazione', 'marcia', 'picchetto', 'concentramento',
  'assemblea pubblica', 'iniziativa politica', 'blocco', 'pride',
  'flash mob', 'raduno', 'comizio', 'assemblea',

  // Meetings and gatherings
  'incontro', 'riunione', 'assemblea', 'meeting', 'tavolo', 'forum',
  'dibattito', 'discussione', 'confronto', 'dialogo', 'colloquio',
  'gruppo di lavoro', 'coordinamento', 'network', 'collettivo',

  // Educational events
  'workshop', 'seminario', 'formazione', 'corso', 'laboratorio',
  'addestramento', 'educazione', 'training', 'skill-share',
  'condivisione competenze', 'autoformazione', 'lezione',

  // Talks and presentations
  'conferenza', 'presentazione', 'relatore', 'intervento', 'discorso',
  'talk', 'speaker', 'lecture', 'testimonianza', 'racconto',

  // Activism organizing
  'attivismo', 'attivisti', 'movimento', 'campagna', 'advocacy',
  'sensibilizzazione', 'awareness', 'volontariato', 'solidarietà',

  // Justice and rights
  'diritti', 'giustizia', 'lotta', 'resistenza', 'liberazione',
  'uguaglianza', 'discriminazione', 'oppressione', 'emancipazione',

  // Community and social
  'comunità', 'sociale', 'civico', 'cittadino', 'partecipazione',
  'democrazia', 'inclusione', 'diversità', 'integrazione',

  // Environment and climate
  'ambiente', 'clima', 'sostenibilità', 'ecologia', 'verde',
  'rinnovabili', 'inquinamento', 'biodiversità',

  // Labor and workers
  'lavoro', 'lavoratori', 'sindacato', 'operai', 'precari',
  'diritti del lavoro', 'sicurezza sul lavoro',

  // LGBTQ+ and gender
  'lgbtq', 'gay', 'lesbian', 'trans', 'queer', 'gender',
  'identità', 'orientamento', 'discriminazione di genere',

  // Anti-war and peace
  'pace', 'guerra', 'antimilitarista', 'nonviolenza', 'disarmo',

  // Generic activism terms
  'cambiamento', 'trasformazione', 'riforma', 'rivoluzione',
  'protesta pacifica', 'azione diretta', 'disobbedienza civile'
];

// Reduced exclusion keywords to be less restrictive
const EXCLUDE_KEYWORDS = [
  'partita calcio', 'match sportivo', 'evento gastronomico',
  'sagra paesana', 'degustazione vini', 'aperitivo commerciale',
  'concerto pop', 'dj commerciale', 'discoteca', 'nightclub'
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

// All 13 specified Italian activism sources with multiple pages each
const SCRAPE_SOURCES = [
  // 4 Activism and Social Movement Sites
  {
    url: 'http://globalproject.info/',
    name: 'globalproject.info',
    type: 'activism',
    pages: ['/', '/it/', '/in_movimento/', '/categoria/appuntamenti/']
  },
  {
    url: 'http://dinamopress.it/',
    name: 'dinamopress.it',
    type: 'activism',
    pages: ['/', '/categoria/movimenti/', '/categoria/societa/', '/eventi/']
  },
  {
    url: 'http://ilrovescio.info/',
    name: 'ilrovescio.info',
    type: 'activism',
    pages: ['/', '/category/appuntamenti/', '/category/eventi/']
  },
  {
    url: 'http://notav.info/',
    name: 'notav.info',
    type: 'territorial-activism',
    pages: ['/', '/appuntamenti/', '/iniziative/']
  },

  // 5 Environmental and Climate Sources
  {
    url: 'http://fridaysforfutureitalia.it/',
    name: 'fridaysforfutureitalia.it',
    type: 'environment',
    pages: ['/', '/eventi/', '/appuntamenti/']
  },
  {
    url: 'https://ultima-generazione.com/',
    name: 'ultima-generazione.com',
    type: 'environment',
    pages: ['/eventi/', '/', '/appuntamenti/']
  },
  {
    url: 'http://greenpeace.org/italy/',
    name: 'greenpeace.org/italy',
    type: 'environment',
    pages: ['/', '/eventi/', '/campagne/']
  },
  {
    url: 'https://rebellion.global/groups/it-bologna/',
    name: 'XR Bologna',
    type: 'environment',
    pages: ['/#events', '/', '/events/']
  },
  {
    url: 'https://rebellion.global/groups/it-verona/',
    name: 'XR Verona',
    type: 'environment',
    pages: ['/#events', '/', '/events/']
  },

  // 2 Labor and Union Sources
  {
    url: 'http://adlcobas.it/',
    name: 'adlcobas.it',
    type: 'labor',
    pages: ['/', '/appuntamenti/', '/eventi/', '/iniziative/']
  },
  {
    url: 'http://usb.it/',
    name: 'usb.it',
    type: 'labor',
    pages: ['/', '/eventi/', '/mobilitazioni/', '/appuntamenti/']
  },

  // 2 LGBTQ+ and Rights Sources
  {
    url: 'https://www.arcigay.it/',
    name: 'arcigay.it',
    type: 'lgbtq',
    pages: ['/en/eventi/', '/eventi/', '/', '/iniziative/']
  },
  {
    url: 'http://gaynet.it/',
    name: 'gaynet.it',
    type: 'lgbtq',
    pages: ['/', '/eventi/', '/appuntamenti/']
  }
];

// Import enhanced geocoding function
import { geocodeAddress, FALLBACK_COORDINATES, clearGeocodeCache } from './enhanced-geocoding.mjs';

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
  cleanedTitle = cleanedTitle.replace(/^["""]/, '').replace(/["""]$/, '');
  cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim();
  if (cleanedTitle.length > 0) {
    cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);
  }
  return cleanedTitle;
}

function containsActivismKeywords(text) {
  const normalizedText = normalizeText(text);
  return ACTIVISM_KEYWORDS.some(keyword => normalizedText.includes(keyword));
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
function parseItalianDateTime(fullArticleText) {
  if (!fullArticleText || fullArticleText.trim().length === 0) {
    return { date: null, time: null };
  }

  const text = cleanText(fullArticleText).toLowerCase();
  let date = null;
  let time = null;

  console.log(`🔍 Analyzing text for dates (${text.length} chars)...`);

  // Enhanced date patterns
  const eventDatePatterns = [
    /(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(\d{4}))?/gi,
    /(?:il|dal|fino al|entro il|per il)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(\d{4}))?/gi,
    /(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/gi,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g
  ];

  // Enhanced time patterns
  const eventTimePatterns = [
    /(?:alle?\s+ore?\s+|dalle?\s+ore?\s+|alle?\s+|dalle?\s+|a partire dalle?\s+|inizio\s+alle?\s+|inizio\s+ore?\s+)(\d{1,2})[:\.](\d{2})/gi,
    /(?:ore?\s+|h\s+)(\d{1,2})[:\.](\d{2})/gi,
    /(?:^|\s|,|\(|\[)(\d{1,2})[:\.](\d{2})(?=\s|$|,|\)|\]|\.)/g,
    /(?:orario\s+|inizio\s+|start\s+|dalle\s+)(\d{1,2})[:\.](\d{2})/gi
  ];

  // Event scheduling keywords (prioritize future-tense)
  const eventSchedulingKeywords = [
    'si terrà', 'avrà luogo', 'è previsto', 'in programma', 'si svolgerà',
    'appuntamento', 'ci vediamo', 'vi aspettiamo', 'dalle ore', 'alle ore', 
    'quando', 'data', 'orario', 'evento', 'manifestazione', 'protesta', 
    'corteo', 'presidio', 'assemblea', 'incontro', 'iniziativa', 'mobilitazione',
    'workshop', 'seminario', 'partecipa', 'unisciti', 'aderire'
  ];

  const sentences = text.split(/[.!?]\s+/);
  const eventSentences = [];
  const otherSentences = [];

  for (const sentence of sentences) {
    const hasSchedulingKeyword = eventSchedulingKeywords.some(keyword => 
      sentence.includes(keyword)
    );
    if (hasSchedulingKeyword) {
      eventSentences.push(sentence);
    } else {
      otherSentences.push(sentence);
    }
  }

  const prioritizedSentences = [...eventSentences, ...otherSentences];

  // Extract date
  for (const sentence of prioritizedSentences) {
    for (const pattern of eventDatePatterns) {
      const matches = [...sentence.matchAll(pattern)];
      for (const match of matches) {
        let foundDate = null;
        if (match[1] && match[2] && ITALIAN_MONTHS[match[2]]) {
          const day = match[1].padStart(2, '0');
          const month = ITALIAN_MONTHS[match[2]];
          const year = match[3] || new Date().getFullYear().toString();
          foundDate = `${year}-${month}-${day}`;
        } else if (match[1] && match[2] && !isNaN(match[2])) {
          const day = match[1].padStart(2, '0');
          const month = match[2].padStart(2, '0');
          const year = match[3] || new Date().getFullYear().toString();
          foundDate = `${year}-${month}-${day}`;
        }

        if (foundDate) {
          const eventDate = new Date(foundDate);
          const today = new Date();
          const fourMonthsAgo = new Date();
          fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

          if (eventDate >= fourMonthsAgo && eventDate <= oneYearFromNow) {
            date = foundDate;
            console.log(`📅 Found event date: ${date}`);
            break;
          }
        }
      }
      if (date) break;
    }
    if (date) break;
  }

  // Extract time
  for (const sentence of prioritizedSentences) {
    for (const pattern of eventTimePatterns) {
      const matches = [...sentence.matchAll(pattern)];
      for (const match of matches) {
        const hours = parseInt(match[1]);
        if (hours >= 0 && hours <= 23) {
          let minutes = '00';
          if (match[2] && !isNaN(parseInt(match[2]))) {
            minutes = match[2].padStart(2, '0');
          }
          const minutesNum = parseInt(minutes);
          if (minutesNum >= 0 && minutesNum <= 59) {
            time = `${hours.toString().padStart(2, '0')}:${minutes}`;
            console.log(`🕐 Found event time: ${time}`);
            break;
          }
        }
      }
      if (time) break;
    }
    if (time) break;
  }

  console.log(`📊 Date extraction result: date=${date}, time=${time}`);
  return { date, time };
}

/**
 * Enhanced address and location extraction
 */
async function extractAddressAndCity(text) {
  const normalizedText = normalizeText(text);
  const originalText = text.toLowerCase();

  // Social media platforms to exclude when preceded by "via"
  const socialMediaPlatforms = [
    'facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin',
    'telegram', 'whatsapp', 'snapchat', 'pinterest', 'tumblr', 'reddit',
    'flickr', 'vimeo', 'twitch', 'discord', 'clubhouse', 'mastodon'
  ];

  // Comprehensive Italian address patterns
  const addressPatterns = [
    /\b(via\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(corso\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(viale\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(piazza\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(largo\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(vicolo\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(ponte\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /\b(galleria\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /\b(palazzo\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /\b(centro\s+[a-zA-ZÀ-ÿ\s]+)/gi
  ];

  // Enhanced venue patterns
  const venuePatterns = [
    /(?:al?|presso il?|at)\s+(centro\s+sociale\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:al?|presso il?|at)\s+(teatro\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:al?|presso il?|at)\s+(cinema\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:alla?|presso la?|at)\s+(sala\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:al?|presso il?|at)\s+(circolo\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:alla?|presso la?|at)\s+(biblioteca\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:all'?|presso l'?|at)\s+(università\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:al?|presso il?)\s+(municipio|comune)\s+di\s+([a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:in|a)\s+(piazza\s+[a-zA-ZÀ-ÿ\s]+)/gi
  ];

  // Patterns to exclude vague locations
  const vagueLocationPatterns = [
    /^italia$/i,
    /^italy$/i,
    /^tutta\s+italia$/i,
    /^in\s+tutta\s+italia$/i,
    /^territorio\s+nazionale$/i,
    /^diverse\s+città$/i,
    /^varie\s+città$/i,
    /^più\s+città$/i
  ];

  let detectedAddress = null;
  let detectedCity = null;

  // Try to find specific address
  for (const pattern of addressPatterns) {
    const matches = originalText.match(pattern);
    if (matches && matches.length > 0) {
      let potentialAddress = matches[0]
        .trim()
        .replace(/\s+/g, ' ')
        .split(/[,;]|presso|c\/o/)[0]
        .trim();

      // Check if this is a social media attribution (e.g., "via Facebook", "via Instagram")
      const addressWords = potentialAddress.toLowerCase().split(' ');
      if (addressWords.length >= 2 && addressWords[0] === 'via') {
        const secondWord = addressWords[1];
        const isSocialMedia = socialMediaPlatforms.some(platform => 
          secondWord.includes(platform) || platform.includes(secondWord)
        );
        
        if (isSocialMedia) {
          console.log(`🚫 Skipping social media attribution: "${potentialAddress}"`);
          continue; // Skip this match and try the next one
        }
      }

      detectedAddress = potentialAddress
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      console.log(`🏠 Found address: "${detectedAddress}"`);
      break;
    }
  }

  // Try to find venue if no address found
  if (!detectedAddress) {
    for (const pattern of venuePatterns) {
      const matches = [...originalText.matchAll(pattern)];
      if (matches && matches.length > 0) {
        let venueName = matches[0][1]
          .trim()
          .replace(/\s+/g, ' ')
          .split(/[,;]|presso|c\/o/)[0]
          .trim();

        const commonWords = ['il', 'la', 'le', 'lo', 'gli', 'di', 'da', 'del', 'della'];
        const words = venueName.toLowerCase().split(' ').filter(word => !commonWords.includes(word));

        if (words.length >= 1 && venueName.length >= 5) {
          detectedAddress = venueName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          console.log(`🎪 Found venue: "${detectedAddress}"`);
          break;
        }
      }
    }
  }

  // Enhanced city detection
  const italianCities = [
    'roma', 'milano', 'napoli', 'torino', 'venezia', 'firenze', 'bologna', 
    'bari', 'palermo', 'genova', 'padova', 'verona', 'sassari', 'bancali',
    'catania', 'messina', 'brescia', 'prato', 'taranto', 'modena', 'reggio',
    'livorno', 'cagliari', 'foggia', 'rimini', 'salerno', 'ferrara', 'ravenna',
    'vicenza', 'terni', 'forlì', 'novara', 'piacenza', 'cesena', 'lecce'
  ];

  for (const cityName of italianCities) {
    if (normalizedText.includes(cityName)) {
      detectedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1);
      break;
    }
  }

  // Try geocoding
  let geocodedCoordinates = null;

  if (detectedAddress && detectedCity) {
    console.log(`🔍 Geocoding: "${detectedAddress}, ${detectedCity}"`);
    geocodedCoordinates = await geocodeAddress(detectedAddress, detectedCity);
  } else if (detectedAddress && !detectedCity) {
    console.log(`🔍 Geocoding: "${detectedAddress}, Italy"`);
    geocodedCoordinates = await geocodeAddress(detectedAddress, 'Italy');
  } else if (detectedCity) {
    console.log(`🔍 Geocoding city: "${detectedCity}"`);
    geocodedCoordinates = await geocodeAddress(null, detectedCity);
  }

  // Final validation: reject vague locations
  if (detectedAddress) {
    const isVague = vagueLocationPatterns.some(pattern => 
      pattern.test(detectedAddress.trim())
    );
    if (isVague) {
      console.log(`❌ Rejecting vague location: "${detectedAddress}"`);
      detectedAddress = null;
    }
  }

  return {
    address: detectedAddress || detectedCity || null,
    city: detectedCity || null,
    coordinates: geocodedCoordinates
  };
}

/**
 * Event categorization
 */
function categorizeEvent(title, description) {
  const text = normalizeText(`${title} ${description}`);

  if (text.includes('pride') || text.includes('lgbtq')) return 'LGBTQ+';
  if (text.includes('clima') || text.includes('ambiente') || text.includes('riscaldamento') || text.includes('sostenibilità')) return 'ENVIRONMENT';
  if (text.includes('lavoro') || text.includes('sciopero') || text.includes('sindacato')) return 'LABOR';
  if (text.includes('guerra') || text.includes('pace') || text.includes('antimilitarista')) return 'PEACE & ANTI-WAR';
  if (text.includes('diritti') || text.includes('giustizia')) return 'CIVIL & HUMAN RIGHTS';
  if (text.includes('donna') || text.includes('donne') || text.includes('femminismo')) return 'WOMEN\'S RIGHTS';
  if (text.includes('razzismo') || text.includes('discriminazione') || text.includes('antifascist')) return 'RACIAL & SOCIAL JUSTICE';
  if (text.includes('sanita') || text.includes('scuola') || text.includes('formazione')) return 'HEALTHCARE & EDUCATION';
  if (text.includes('corruzione') || text.includes('trasparenza')) return 'TRANSPARENCY & ANTI-CORRUPTION';

  return 'OTHER';
}

/**
 * Enhanced HTTP request with retry
 */
async function makeRequest(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🔗 Fetching (attempt ${attempt + 1}): ${url}`);

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
      console.log(`❌ Request failed (attempt ${attempt + 1}): ${error.message}`);
      if (attempt === retries) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
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
      .select('id, title, city')
      .eq('city', city)
      .limit(30);

    if (error) {
      console.log('⚠️ Error checking duplicates:', error.message);
      return false;
    }

    const isDuplicate = data.some(event => {
      const existingTitle = cleanTitle(event.title).toLowerCase();
      if (existingTitle === cleanTitleForDupe) return true;

      const lengthDiff = Math.abs(existingTitle.length - cleanTitleForDupe.length);
      const maxLength = Math.max(existingTitle.length, cleanTitleForDupe.length);

      if (lengthDiff / maxLength < 0.2 && 
          (existingTitle.includes(cleanTitleForDupe) || cleanTitleForDupe.includes(existingTitle))) {
        return true;
      }

      return false;
    });

    return isDuplicate;
  } catch (error) {
    console.log('⚠️ Exception checking duplicates:', error.message);
    return false;
  }
}

/**
 * Save event to database
 */
async function saveEventToDatabase(event) {
  try {
    console.log(`💾 Saving event: "${event.title}"`);

    const isDuplicate = await checkDuplicate(event.title, event.date, event.city);
    if (isDuplicate) {
      console.log(`⏭️ Skipping duplicate: "${event.title}"`);
      return false;
    }

    const eventData = {
      title: cleanTitle(event.title) || 'Untitled Event',
      description: event.description || 'No description available',
      category: event.category || 'OTHER',
      city: event.city === 'N/A' ? 'Milano' : (event.city || 'Milano'),
      address: event.address === 'N/A' ? 'N/A' : (event.address || 'N/A'),
      latitude: String(event.latitude || 45.4642),
      longitude: String(event.longitude || 9.1900),
      date: event.date === 'N/A' ? null : event.date,
      time: event.time || 'N/A',
      image_url: event.image_url || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.OTHER,
      event_type: determineEventType(event.title, event.description),
      event_url: event.event_url || null,
      country_code: 'IT',
      featured: false,
      attendees: 0,
      source_name: event.source_name || 'enhanced-scraper',
      source_url: event.source_url || ''
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
 * Validate if content describes an actual event vs news article
 */
function validateActualEvent(title, description, fullText) {
  const normalizedTitle = normalizeText(title);
  const normalizedDescription = normalizeText(description);
  const normalizedFullText = normalizeText(fullText);

  // 1. STRONG INDICATORS this is NOT an event (news articles)
  const newsArticleIndicators = [
    // Article types
    'primo piano', 'focus', 'analisi', 'riflessioni', 'comunicato stampa',
    'dichiarazione', 'posizione', 'editoriale', 'opinione', 'commento',
    'rassegna stampa', 'cronaca', 'resoconto', 'reportage', 'intervista',
    
    // Past tense reporting
    'è avvenuto', 'si è svolto', 'ha avuto luogo', 'si è concluso',
    'è terminato', 'ha partecipato', 'hanno partecipato', 'si sono riuniti',
    
    // News reporting language
    'secondo quanto riportato', 'come riportato', 'stando a', 'fonti riferiscono',
    'è stato dichiarato', 'ha dichiarato', 'hanno dichiarato',
    
    // Historical references
    'la scorsa settimana', 'il mese scorso', 'lo scorso anno', 'in passato',
    'tempo fa', 'recentemente si è svolto', 'si è tenuto ieri'
  ];

  const hasNewsIndicators = newsArticleIndicators.some(indicator => 
    normalizedTitle.includes(indicator) || normalizedDescription.includes(indicator)
  );

  if (hasNewsIndicators) {
    return { isEvent: false, reason: 'News article indicators detected' };
  }

  // 2. STRONG INDICATORS this IS an event (announcements)
  const eventAnnouncementIndicators = [
    // Future scheduling
    'si terrà', 'avrà luogo', 'è in programma', 'è previsto', 'si svolgerà',
    'ci vediamo', 'vi aspettiamo', 'appuntamento', 'partecipa', 'partecipate',
    
    // Call to action
    'aderire', 'aderiscono', 'sostieni', 'unisciti', 'vieni', 'venite',
    'saremo presenti', 'sarà presente', 'invita', 'invitano',
    
    // Event organization
    'organizza', 'organizzano', 'promuove', 'promuovono', 'indice', 'indicono',
    'convoca', 'convocano', 'lancia', 'lanciano',
    
    // Direct scheduling language
    'quando:', 'dove:', 'data:', 'orario:', 'ore:', 'dalle ore', 'alle ore'
  ];

  const hasEventIndicators = eventAnnouncementIndicators.some(indicator => 
    normalizedTitle.includes(indicator) || normalizedDescription.includes(indicator)
  );

  // 3. Check for specific event announcement patterns
  const hasEventSchedulingPattern = /\b(si terrà|avrà luogo|è previsto|in programma)\b.*\b(il|dal|alle|ore)\b/.test(normalizedFullText) ||
    /\b(appuntamento|ci vediamo|vi aspettiamo)\b.*\b(\d{1,2}\/\d{1,2}|\d{1,2}\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre))\b/.test(normalizedFullText);

  // 4. Check if it's about farming/industrial issues without events
  const isIndustrialIssue = /\b(allevamento|agricoltura|industria|fabbrica|stabilimento)\b/.test(normalizedTitle) &&
    !/\b(protesta|manifestazione|presidio|mobilitazione|sciopero)\b/.test(normalizedTitle);

  if (isIndustrialIssue && !hasEventIndicators) {
    return { isEvent: false, reason: 'Industrial/farming issue without event indicators' };
  }

  // 5. Check for "about" language that suggests reporting rather than announcing
  const isAboutEvents = /\b(parlano? di|riferiscono|raccontano|descrivono|spiegano|riguarda|tratta di)\b/.test(normalizedFullText) ||
    /\b(storia|racconto|resoconto|cronaca|reportage|dossier)\b/.test(normalizedTitle);

  if (isAboutEvents && !hasEventIndicators) {
    return { isEvent: false, reason: 'Article about events rather than announcing events' };
  }

  // 6. POSITIVE validation: Must have event indicators OR clear scheduling
  if (hasEventIndicators || hasEventSchedulingPattern) {
    return { isEvent: true, reason: 'Event announcement indicators found' };
  }

  // 7. Fallback: If no clear indicators either way, be restrictive
  return { isEvent: false, reason: 'No clear event announcement indicators' };
}

/**
 * Determine event type for map icons
 */
function determineEventType(title, description = '') {
  const searchText = normalizeText(`${title} ${description}`);

  const protestKeywords = [
    'protest', 'march', 'rally', 'demonstration', 'strike', 'blockade', 'occupation',
    'manifestazione', 'corteo', 'sciopero', 'mobilitazione', 'presidio', 'marcia'
  ];

  const workshopKeywords = [
    'workshop', 'training', 'skill-share', 'course', 'formazione',
    'corso', 'laboratorio', 'addestramento', 'educazione'
  ];

  const assemblyKeywords = [
    'assembly', 'meeting', 'forum', 'assemblea', 'riunione', 'incontro'
  ];

  const talkKeywords = [
    'talk', 'presentation', 'speaker', 'lecture', 'conference',
    'presentazione', 'conferenza', 'relatore', 'intervento'
  ];

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
  return 'Other';
}

/**
 * Fetch and analyze full article content
 */
async function fetchArticleContent(articleUrl) {
  try {
    console.log(`📖 Fetching full article: ${articleUrl}`);

    const response = await makeRequest(articleUrl);
    const $ = load(response.data);

    const contentSelectors = [
      'article .content',
      'article .post-content', 
      '.entry-content',
      '.post-body',
'.article-body',
      'article p',
      '.content',
      'main article',
      '[class*="content"]'
    ];

    let articleContent = '';

    for (const selector of contentSelectors) {
      const content = $(selector).text();
      if (content && content.length > articleContent.length) {
        articleContent = content;
      }
    }

    if (!articleContent) {
      articleContent = $('article').text() || $('main').text() || '';
    }

    return cleanText(articleContent);

  } catch (error) {
    console.log(`⚠️ Could not fetch article content: ${error.message}`);
    return '';
  }
}

/**
 * Enhanced website scraping with multiple pages per source
 */
async function scrapeWebsite(source) {
  console.log(`\n🔍 Scraping ${source.name} (${source.pages.length} pages)...`);

  const events = [];
  const stats = {
    pagesScraped: 0,
    eventsFound: 0,
    eventsSkippedByDate: 0,
    eventsSkippedByKeywords: 0,
    articlesAnalyzed: 0
  };

  // Process each page for this source
  for (let pageIndex = 0; pageIndex < Math.min(source.pages.length, PERFORMANCE_CONFIG.MAX_PAGES_PER_WEBSITE); pageIndex++) {
    const page = source.pages[pageIndex];
    const fullUrl = source.url + (page === '/' ? '' : page);

    console.log(`📄 Processing page ${pageIndex + 1}/${source.pages.length}: ${fullUrl}`);

    try {
      const response = await makeRequest(fullUrl);
      const $ = load(response.data);
      stats.pagesScraped++;

      // Enhanced selectors for finding events
      let eventElements = [];
      const eventSelectors = [
        // WordPress and CMS selectors
        'article', '.post', '.hentry', '.entry', '.wp-block-post',

        // Event-specific selectors
        '.event', '.evento', '.manifestazione', '.iniziativa',
        '.news-item', '.item', '.news', '.comunicato',

        // Content containers
        '.content-item', '.blog-post', '.article-item',
        '.post-item', '.entry-content', '.post-content',

        // Links to articles (most important for activism sites)
        'h1 a', 'h2 a', 'h3 a', 'h4 a',
        '.title a', '.headline a', '.post-title a',
        '.entry-title a', '.article-title a',

        // Date-based content
        'a[href*="/2025/"]', 'a[href*="/2024/"]',

        // Sidebar and navigation elements
        '.sidebar a', '.menu a', '.navigation a',
        '.widget a', '.recent-posts a',

        // Generic containers that might hold events
        '.list-item', '.grid-item', 'li:has(a)'
      ];

      // Try each selector until we find content
      for (const selector of eventSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          eventElements = elements;
          console.log(`📊 Found ${elements.length} potential events using: ${selector}`);
          break;
        }
      }

      // If still no elements, try broader search
      if (eventElements.length === 0) {
        console.log(`⚠️ No elements found with standard selectors for ${source.name}`);
        eventElements = $('a[href]').filter((i, el) => {
          const text = $(el).text().trim();
          return text.length > 10 && text.length < 200;
        }).slice(0, 20);
        console.log(`📊 Using ${eventElements.length} fallback link elements`);
      }

      // Process events from this page
      const maxEventsFromPage = Math.min(PERFORMANCE_CONFIG.MAX_ARTICLES_PER_PAGE, eventElements.length);
      console.log(`🔍 Processing ${maxEventsFromPage} elements from this page...`);

      for (let i = 0; i < maxEventsFromPage; i++) {
        try {
          const $el = $(eventElements[i]);

          // Extract title
          let title = '';
          if ($el.is('a')) {
            title = cleanText($el.text()) || cleanText($el.attr('title')) || '';
          } else {
            title = cleanText($el.find('h1, h2, h3, h4, .title, .headline').first().text()) ||
                    cleanText($el.find('a').first().text()) ||
                    cleanText($el.text()).slice(0, 100);
          }

          if (!title || title.length < 10) {
            continue;
          }

          // Extract description - start with initial content
          let description = cleanText($el.find('p, .description, .excerpt, .content').first().text()) ||
            cleanText($el.text()).slice(0, 2000);

          // Extract article URL
          let eventUrl = '';
          if ($el.is('a')) {
            eventUrl = $el.attr('href');
          } else {
            eventUrl = $el.find('a').first().attr('href');
          }

          if (eventUrl && !eventUrl.startsWith('http')) {
            try {
              eventUrl = new URL(eventUrl, source.url).href;
            } catch (e) {
              eventUrl = source.url;
            }
          }

          // Initial keyword check
          let fullText = `${title} ${description}`.toLowerCase();
          let hasActivismKeywords = containsActivismKeywords(fullText);

          // If no keywords found, fetch full article content
          if (!hasActivismKeywords && eventUrl && eventUrl !== source.url) {
            console.log(`🔍 Fetching full article for: "${title.slice(0, 50)}..."`);

            await new Promise(resolve => setTimeout(resolve, 300));

            const articleContent = await fetchArticleContent(eventUrl);
            stats.articlesAnalyzed++;

            if (articleContent) {
              fullText = `${title} ${description} ${articleContent}`.toLowerCase();
              hasActivismKeywords = containsActivismKeywords(fullText);

              // Use full article content for a richer description if it's longer
              if (articleContent.length > description.length) {
                description = cleanText(articleContent).slice(0, 2500);
                console.log(`📝 Enhanced description with full article content (${description.length} chars)`);
              }

              if (hasActivismKeywords) {
                console.log(`✅ Found activism keywords in full article`);
              }
            }
          }

          // Relaxed keyword filtering - include more social/political content
          if (!hasActivismKeywords) {
            const socialKeywords = [
              'sociale', 'politico', 'diritti', 'giustizia', 'comunità',
              'cittadini', 'pubblico', 'partecipazione', 'cambiamento',
              'azione', 'movimento', 'organizzazione', 'coordinamento'
            ];
            const hasSocialKeywords = socialKeywords.some(keyword => fullText.includes(keyword));

            if (!hasSocialKeywords) {
              console.log(`⚠️ No activism/social keywords: "${title.slice(0, 50)}..."`);
              stats.eventsSkippedByKeywords++;
              continue;
            }
          }

          // Enhanced validation to distinguish real events from news articles
          const isActualEvent = validateActualEvent(title, description, fullText);
          
          if (!isActualEvent.isEvent) {
            console.log(`❌ Skipping non-event: "${title.slice(0, 50)}..." - Reason: ${isActualEvent.reason}`);
            stats.eventsSkippedByKeywords++;
            continue;
          }

          // Check excluded content (but be lenient)
          if (containsExcludeKeywords(fullText)) {
            const hasEducationalKeywords = ['workshop', 'formazione', 'incontro', 'assemblea'].some(keyword => fullText.includes(keyword));
            if (!hasEducationalKeywords) {
              console.log(`⚠️ Excluded content: "${title.slice(0, 50)}..."`);
              stats.eventsSkippedByKeywords++;
              continue;
            }
          }

          // Extract date/time (use fuller text if available)
          const dateText = fullText.length > `${title} ${description}`.length ? fullText : `${title} ${description}`;
          const { date, time } = parseItalianDateTime(dateText);

          // Date cutoff check
          if (date && !isDateWithinCutoff(date)) {
            console.log(`⏰ Skipping old event: "${title.slice(0, 50)}..." (${date})`);
            stats.eventsSkippedByDate++;
            continue;
          }

          // Extract location
          const locationInfo = await extractAddressAndCity(dateText);
          await new Promise(resolve => setTimeout(resolve, 200));

          // STRICT VALIDATION: Skip if no clear date or address
          if (!date || date === 'N/A') {
            console.log(`❌ Skipping - no clear date: "${title.slice(0, 50)}..."`);
            stats.eventsSkippedByDate++;
            continue;
          }

          if (!locationInfo.address || locationInfo.address === 'N/A') {
            console.log(`❌ Skipping - no clear address: "${title.slice(0, 50)}..."`);
            stats.eventsSkippedByKeywords++;
            continue;
          }

          // FINAL VALIDATION: Ensure this has event announcement language, not just news reporting
          const hasAnnouncementLanguage = /\b(si terrà|avrà luogo|è previsto|in programma|si svolgerà|appuntamento|ci vediamo|vi aspettiamo|partecipa|unisciti)\b/.test(fullText);
          const hasPastTenseReporting = /\b(si è svolto|ha avuto luogo|è avvenuto|si è concluso|ha partecipato|si sono riuniti)\b/.test(fullText);
          
          if (hasPastTenseReporting && !hasAnnouncementLanguage) {
            console.log(`❌ Skipping - past tense reporting without future event announcement: "${title.slice(0, 50)}..."`);
            stats.eventsSkippedByKeywords++;
            continue;
          }

          // Additional validation: ensure we have either a city or specific address
          const hasLocation = locationInfo.city && locationInfo.city !== 'N/A';
          const hasSpecificAddress = locationInfo.address && 
            locationInfo.address !== 'N/A' && 
            locationInfo.address.length > 3 &&
            !locationInfo.address.toLowerCase().includes('italia') &&
            !locationInfo.address.toLowerCase().includes('italy');

          if (!hasLocation && !hasSpecificAddress) {
            console.log(`❌ Skipping - unclear location: "${title.slice(0, 50)}..." (address: "${locationInfo.address}", city: "${locationInfo.city}")`);
            stats.eventsSkippedByKeywords++;
            continue;
          }

          // Create event object
          const event = {
            title: cleanTitle(title),
            description: description.slice(0, 2500),
            category: categorizeEvent(title, description),
            city: locationInfo.city || 'N/A',
            address: locationInfo.address || 'N/A',
            latitude: locationInfo.coordinates?.lat || 0,
            longitude: locationInfo.coordinates?.lng || 0,
            date: date || 'N/A',
            time: time || 'N/A',
            image_url: CATEGORY_IMAGES[categorizeEvent(title, description)] || CATEGORY_IMAGES.OTHER,
            event_url: eventUrl,
            source_name: source.name,
            source_url: source.url
          };

          events.push(event);
          stats.eventsFound++;

          console.log(`📋 Event found: "${event.title.slice(0, 50)}..." | ${event.category} | ${event.city} | ${event.date}`);

          // Small delay between elements
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.log(`⚠️ Error processing element:`, error.message);
        }
      }

      // Delay between pages
      if (pageIndex < source.pages.length - 1) {
        console.log(`⏳ Waiting ${PERFORMANCE_CONFIG.DELAY_BETWEEN_PAGES}ms before next page...`);
        await new Promise(resolve => setTimeout(resolve, PERFORMANCE_CONFIG.DELAY_BETWEEN_PAGES));
      }

    } catch (error) {
      console.error(`❌ Error scraping page ${fullUrl}:`, error.message);
    }
  }

  console.log(`📊 ${source.name} Results: ${events.length} events found, ${stats.articlesAnalyzed} articles analyzed`);
  return { events, stats };
}

/**
 * Main scraping function
 */
async function main() {
  console.log('🚀 Starting Enhanced Italian Activism Scraper...');
  console.log(`📊 Configuration: ${PERFORMANCE_CONFIG.DATE_CUTOFF_DAYS} days, ${SCRAPE_SOURCES.length} sources, ${PERFORMANCE_CONFIG.MAX_PAGES_PER_WEBSITE} pages per source\n`);

  const globalStats = {
    totalEventsFound: 0,
    totalEventsSkippedByDate: 0,
    totalEventsSkippedByKeywords: 0,
    totalEventsSaved: 0,
    totalDuplicatesSkipped: 0,
    totalArticlesAnalyzed: 0,
    sourcesProcessed: 0
  };

  const startTime = Date.now();

  // Process each source
  for (const source of SCRAPE_SOURCES) {
    console.log(`\n🌐 Processing source ${globalStats.sourcesProcessed + 1}/${SCRAPE_SOURCES.length}: ${source.name}`);

    try {
      const { events, stats } = await scrapeWebsite(source);

      // Update statistics
      globalStats.totalEventsFound += stats.eventsFound;
      globalStats.totalEventsSkippedByDate += stats.eventsSkippedByDate;
      globalStats.totalEventsSkippedByKeywords += stats.eventsSkippedByKeywords;
      globalStats.totalArticlesAnalyzed += stats.articlesAnalyzed || 0;
      globalStats.sourcesProcessed++;

      // Save events to database
      console.log(`💾 Saving ${events.length} events from ${source.name}...`);
      for (const event of events) {
        const success = await saveEventToDatabase(event);
        if (success) {
          globalStats.totalEventsSaved++;
        } else {
          globalStats.totalDuplicatesSkipped++;
        }

        await new Promise(resolve => setTimeout(resolve, 150));
      }

      // Delay before next source
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

  console.log('\n🎉 Enhanced Activism Scraping Completed!');
  console.log('\n📊 FINAL STATISTICS:');
  console.log(`   ⏱️ Duration: ${duration} seconds`);
  console.log(`   🌐 Sources processed: ${globalStats.sourcesProcessed}/${SCRAPE_SOURCES.length}`);
  console.log(`   📄 Pages analyzed: Multiple pages per source`);
  console.log(`   📋 Events found: ${globalStats.totalEventsFound}`);
  console.log(`   📖 Articles analyzed: ${globalStats.totalArticlesAnalyzed}`);
  console.log(`   ✅ Events saved: ${globalStats.totalEventsSaved}`);
  console.log(`   📅 Skipped by date: ${globalStats.totalEventsSkippedByDate}`);
  console.log(`   🔍 Skipped by keywords: ${globalStats.totalEventsSkippedByKeywords}`);
  console.log(`   ⏭️ Duplicates skipped: ${globalStats.totalDuplicatesSkipped}`);
  console.log(`   📈 Success rate: ${Math.round((globalStats.totalEventsSaved / Math.max(globalStats.totalEventsFound, 1)) * 100)}%`);

  if (globalStats.totalEventsSaved >= 50) {
    console.log('\n✅ SUCCESS: Found comprehensive activism event coverage!');
  } else if (globalStats.totalEventsSaved >= 25) {
    console.log('\n⚠️ PARTIAL SUCCESS: Found good event coverage but could be improved');
  } else {
    console.log('\n❌ LOW COVERAGE: Consider reviewing scraper settings or website structures');
  }

  return globalStats;
}

// Run the scraper if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Export for use as module
export { main, PERFORMANCE_CONFIG };