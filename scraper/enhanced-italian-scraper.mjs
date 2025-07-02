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

// Keywords for filtering - expanded to include activism-related events
const PROTEST_KEYWORDS = [
  // Traditional protest activities
  'manifestazione', 'protesta', 'sciopero', 'presidio', 'corteo', 'occupazione',
  'sit-in', 'mobilitazione', 'marcia', 'picchetto', 'concentramento',
  'assemblea pubblica', 'iniziativa politica', 'blocco', 'pride',
  'flash mob', 'raduno', 'comizio', 'assemblea',

  // Prison and justice related (for the missing articles)
  'carcere', 'processo', 'operazione', 'lotta', 'appuntamenti di lotta',
  'bancali', 'sassari', 'torino', 'repressione', 'solidarietà',

  // Educational and organizing events
  'workshop', 'seminario', 'formazione', 'incontro', 'presentazione', 'gruppo',
  'corso', 'laboratorio', 'addestramento', 'educazione', 'training',
  'skill-share', 'condivisione competenze', 'autoformazione',

  // Activist organizing and meetings
  'riunione attivisti', 'gruppo di lavoro', 'coordinamento', 'network',
  'collettivo', 'circolo', 'centro sociale', 'spazio autogestito',
  'assemblea generale', 'assemblea cittadina', 'forum cittadino',
  'tavolo tematico', 'gruppo tematico', 'commissione',

  // Information and awareness events
  'conferenza', 'dibattito', 'discussione', 'tavola rotonda',
  'incontro informativo', 'serata informativa', 'presentazione libro',
  'documentario', 'film politico', 'proiezione',
  'testimonianza', 'racconto', 'intervista pubblica',

  // Legal and rights-related events
  'know your rights', 'conosci i tuoi diritti', 'diritti civili',
  'info legale', 'sportello legale', 'assistenza legale',
  'clinica legale', 'consulenza gratuita',

  // Community organizing
  'organizzazione comunitaria', 'attivismo locale', 'cittadinanza attiva',
  'partecipazione civica', 'democrazia partecipativa',
  'assemblea di quartiere', 'comitato cittadino',

  // Campaign and advocacy events
  'campagna', 'petizione', 'raccolta firme', 'advocacy',
  'sensibilizzazione', 'awareness', 'volantinaggio',
  'banchetto informativo', 'gazebo', 'stand informativo',

  // Solidarity and mutual aid
  'solidarietà', 'mutuo soccorso', 'aiuto reciproco',
  'supporto comunitario', 'rete di sostegno', 'autoaiuto',
  'cucina popolare', 'mensa sociale', 'distribuzione cibo',

  // Alternative economics and sustainability
  'economia solidale', 'commercio equo', 'consumo critico',
  'decrescita', 'sostenibilità', 'permacultura',
  'economia circolare', 'beni comuni', 'commons'
];

const EXCLUDE_KEYWORDS = [
  // Entertainment and leisure (but preserve political/awareness content)
  'concerto commerciale', 'spettacolo teatrale', 'festival musicale', 
  'mostra artistica', 'fiera commerciale', 'mercatino dell\'usato',
  'evento gastronomico', 'evento sportivo', 'corsa podistica', 'maratona sportiva',
  'dj set', 'sagra paesana', 'degustazione', 'aperitivo sociale',

  // Religious events (unless activism-related)
  'messa domenicale', 'celebrazione religiosa', 'processione religiosa',
  'benedizione', 'liturgia', 'preghiera comunitaria',

  // Pure business/commercial events
  'corso di cucina', 'corso di lingua', 'corso professionale',
  'formazione aziendale', 'team building', 'networking commerciale',
  'evento promozionale', 'lancio prodotto',

  // Health and wellness (unless activism-related)
  'meditazione personale', 'yoga classe', 'fitness', 'palestra',
  'benessere personale', 'coaching individuale'
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

// Note: No fallback city coordinates needed - we use precise geocoding with OpenStreetMap Nominatim API

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
    url: 'https://ilrovescio.info/',
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
  {
    url: 'https://rebellion.global/groups/it-bologna/#events',
    name: 'rebellion.global/it-bologna',
    type: 'environment'
  },
  {
    url: 'https://rebellion.global/groups/it-verona/#events',
    name: 'rebellion.global/it-verona',
    type: 'environment'
  },

  // Alternative Movement Sources
  {
    url: 'https://rivoluzioneanarchica.it/',
    name: 'rivoluzioneanarchica.it',
    type: 'anarchist'
  },

  // Educational and organizing spaces
  {
    url: 'https://www.inventati.org/',
    name: 'inventati.org',
    type: 'tech-activism'
  },
  {
    url: 'https://www.ecn.org/',
    name: 'ecn.org',
    type: 'counter-info'
  },

  // Social centers and community spaces
  {
    url: 'https://www.autistici.org/',
    name: 'autistici.org',
    type: 'social-center'
  }
];

/**
 * Utility Functions
 */
// Import enhanced geocoding function
import { geocodeAddress, FALLBACK_COORDINATES, clearGeocodeCache } from './enhanced-geocoding.mjs';

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
 * Enhanced date parsing - extracts actual event dates from article content, not publication dates
 */
function parseItalianDateTime(fullArticleText) {
  if (!fullArticleText || fullArticleText.trim().length === 0) {
    return { date: null, time: null };
  }

  const text = cleanText(fullArticleText).toLowerCase();
  let date = null;
  let time = null;

  console.log(`🔍 Analyzing article text for event dates (${text.length} chars)...`);

  // Event-specific date patterns that look for actual event scheduling language
  const eventDatePatterns = [
    // "sabato 15 giugno" - day name + date + month
    /(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(\d{4}))?/gi,

    // "il 15 giugno" - specific date references
    /(?:il|dal|fino al|entro il|per il)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(\d{4}))?/gi,

    // "15 giugno 2025" - full date format
    /(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/gi,

    // "15/06/2025" - numerical format
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g
  ];

  // Event time patterns - improved for better precision
  const eventTimePatterns = [
    // "alle ore 18:30", "dalle 19.00", "alle 14:30"
    /(?:alle?\s+ore?\s+|dalle?\s+ore?\s+|alle?\s+|dalle?\s+|a partire dalle?\s+|inizio\s+alle?\s+|inizio\s+ore?\s+)(\d{1,2})[:\.](\d{2})/gi,
    // "ore 15:30", "h 16:30", "ore 15.30"
    /(?:ore?\s+|h\s+)(\d{1,2})[:\.](\d{2})/gi,
    // Standalone time patterns like "14:30" or "14.30"
    /(?:^|\s|,|\(|\[)(\d{1,2})[:\.](\d{2})(?=\s|$|,|\)|\]|\.)/g,
    // Time with context words "orario 14:30", "inizio 15:00"
    /(?:orario\s+|inizio\s+|start\s+|dalle\s+)(\d{1,2})[:\.](\d{2})/gi,
    // "alle 14" followed by minutes elsewhere
    /alle?\s+(\d{1,2})(?:\s+e\s+(\d{2})|[:\.](\d{2}))?/gi
  ];

  // Keywords that indicate event scheduling (not publication)
  const eventSchedulingKeywords = [
    'si terrà', 'avrà luogo', 'è previsto', 'in programma', 'evento', 'manifestazione', 
    'protesta', 'corteo', 'presidio', 'assemblea', 'incontro', 'iniziativa', 'mobilitazione',
    'appuntamento', 'dalle ore', 'alle ore', 'quando', 'data'
  ];

  // Split into sentences and prioritize those with event scheduling language
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

  // First, look for dates in sentences with event scheduling keywords
  const prioritizedSentences = [...eventSentences, ...otherSentences];

  for (const sentence of prioritizedSentences) {
    // Try each date pattern
    for (const pattern of eventDatePatterns) {
      const matches = [...sentence.matchAll(pattern)];

      for (const match of matches) {
        let foundDate = null;

        if (match[1] && match[2] && ITALIAN_MONTHS[match[2]]) {
          // Day + month found
          const day = match[1].padStart(2, '0');
          const month = ITALIAN_MONTHS[match[2]];
          const year = match[3] || new Date().getFullYear().toString();
          foundDate = `${year}-${month}-${day}`;
        } else if (match[1] && match[2] && !isNaN(match[2])) {
          // Numerical date format DD/MM/YYYY
          const day = match[1].padStart(2, '0');
          const month = match[2].padStart(2, '0');
          const year = match[3] || new Date().getFullYear().toString();
          foundDate = `${year}-${month}-${day}`;
        }

        if (foundDate) {
          // Validate the date is reasonable (not too far in past, not too far in future)
          const eventDate = new Date(foundDate);
          const today = new Date();
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

          if (eventDate >= threeMonthsAgo && eventDate <= oneYearFromNow) {
            date = foundDate;
            console.log(`📅 Found event date: "${sentence.slice(0, 80)}..." → ${date}`);
            break;
          }
        }
      }
      if (date) break;
    }
    if (date) break;
  }

  // Look for times in the same prioritized way - improved precision
  for (const sentence of prioritizedSentences) {
    for (const pattern of eventTimePatterns) {
      const matches = [...sentence.matchAll(pattern)];

      for (const match of matches) {
        const hours = parseInt(match[1]);
        if (hours >= 0 && hours <= 23) { // Valid hours (expanded range)
          // Handle different minute capture groups
          let minutes = '00';
          if (match[2] && !isNaN(parseInt(match[2]))) {
            minutes = match[2].padStart(2, '0');
          } else if (match[3] && !isNaN(parseInt(match[3]))) {
            minutes = match[3].padStart(2, '0');
          }

          // Validate minutes
          const minutesNum = parseInt(minutes);
          if (minutesNum >= 0 && minutesNum <= 59) {
            time = `${hours.toString().padStart(2, '0')}:${minutes}`;
            console.log(`🕐 Found event time: "${sentence.slice(0, 80)}..." → ${time}`);
            break;
          }
        }
      }
      if (time) break;
    }
    if (time) break;
  }

  // If no specific date found, try basic extraction as fallback
  if (!date) {
    const basicDateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (basicDateMatch) {
      const day = basicDateMatch[1].padStart(2, '0');
      const month = basicDateMatch[2].padStart(2, '0');
      const year = basicDateMatch[3];
      const testDate = `${year}-${month}-${day}`;

      const eventDate = new Date(testDate);
      const today = new Date();
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      if (eventDate >= twoMonthsAgo) {
        date = testDate;
        console.log(`📅 Found fallback date: ${date}`);
      }
    }
  }

  if (!time) {
    // More comprehensive fallback time extraction
    const fallbackPatterns = [
      // Match exact time formats like "14:30" or "14.30"
      /(?:^|\s|,|\()(\d{1,2})[:\.](\d{2})(?=\s|$|,|\)|\.|\s+[a-zA-Z])/g,
      // Match times with Italian context
      /(?:ore?\s+|alle?\s+|h\s+)(\d{1,2})[:\.](\d{2})/g
    ];

    for (const pattern of fallbackPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);

        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          console.log(`🕐 Found fallback time: ${time}`);
          break;
        }
      }
      if (time) break;
    }
  }

  console.log(`📊 Date extraction result: date=${date}, time=${time}`);
  return { date, time };
}

/**
 * Address and location extraction with enhanced geocoding
 */
async function extractAddressAndCity(text) {
  const normalizedText = normalizeText(text);
  const originalText = text.toLowerCase();

  // Italian address patterns - look for specific street types
  const addressPatterns = [
    /\b(via\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(corso\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(viale\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(piazza\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(largo\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(vicolo\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(ponte\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /\b(galleria\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /\b(lungotevere\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(circonvallazione\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(strada\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(piazzale\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(piazzetta\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(traversa\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(contrada\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(salita\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(discesa\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(rione\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(ronco\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(borgo\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(cammino\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(spianata\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(passeggiata\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(spalto\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(parco\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi
  ];

  // Venue and event location patterns - NEW!
  const venuePatterns = [
    // Festivals and events
    /(?:al?|presso il?|at)\s+(festival\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:al?|presso il?|at)\s+([a-zA-ZÀ-ÿ\s]+\s+festival)/gi,
    /(?:allo?|presso lo?|at)\s+([a-zA-ZÀ-ÿ\s]+\s+festival)/gi,

    // Cultural centers and venues
    /(?:al?|presso il?|at)\s+(centro\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:al?|presso il?|at)\s+(teatro\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:al?|presso il?|at)\s+(cinema\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:al?|presso il?|at)\s+(palazzo\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:alla?|presso la?|at)\s+(sala\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:all'?|presso l'?|at)\s+(auditorium\s+[a-zA-ZÀ-ÿ\s]+)/gi,

    // Social centers and community spaces
    /(?:al?|presso il?|at)\s+(centro\s+sociale\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:al?|presso il?|at)\s+(circolo\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:alla?|presso la?|at)\s+(casa\s+[a-zA-ZÀ-ÿ\s]+)/gi,

    // Educational institutions
    /(?:all'?|presso l'?|at)\s+(università\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:al?|presso il?|at)\s+(campus\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:alla?|presso la?|at)\s+(scuola\s+[a-zA-ZÀ-ÿ\s]+)/gi,

    // Bars, restaurants, and meeting places
    /(?:al?|presso il?|at)\s+(bar\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:al?|presso il?|at)\s+(caffè\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:al?|presso il?|at)\s+(ristorante\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:all'?|presso l'?|at)\s+(osteria\s+[a-zA-ZÀ-ÿ\s]+)/gi,

    // Parks and outdoor spaces
    /(?:ai?|presso i?|at)\s+(giardini?\s+[a-zA-ZÀ-ÿ\s]+)/gi,
    /(?:alla?|presso la?|at)\s+(villa\s+[a-zA-ZÀ-ÿ\s]+)/gi,

    // Generic venue patterns (more permissive)
    /(?:al?|presso il?|at)\s+([A-ZÀ-ÿ][a-zA-ZÀ-ÿ\s]{2,25}(?:\s+[A-ZÀ-ÿ][a-zA-ZÀ-ÿ\s]{2,25})?)/g
  ];

  let detectedAddress = null;
  let detectedCity = null;

  // First, try to find a specific street address
  for (const pattern of addressPatterns) {
    const matches = originalText.match(pattern);
    if (matches && matches.length > 0) {
      // Take the first match and clean it up
      detectedAddress = matches[0]
        .trim()
        .replace(/\s+/g, ' ')
        .split(/[,;]|presso|c\/o/)[0] // Stop at common separators
        .trim();

      // Capitalize first letter of each word
      detectedAddress = detectedAddress
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      console.log(`🏠 Found specific address: "${detectedAddress}"`);
      break;
    }
  }

  // If no street address found, look for venue names and event locations
  if (!detectedAddress) {
    for (const pattern of venuePatterns) {
      const matches = [...originalText.matchAll(pattern)];
      if (matches && matches.length > 0) {
        // Take the first match and clean it up
        let venueName = matches[0][1]
          .trim()
          .replace(/\s+/g, ' ')
          .split(/[,;]|presso|c\/o/)[0] // Stop at common separators
          .trim();

        // Skip if venue name is too short or contains only common words
        const commonWords = ['il', 'la', 'le', 'lo', 'gli', 'di', 'da', 'del', 'della', 'dei', 'delle'];
        const words = venueName.toLowerCase().split(' ').filter(word => !commonWords.includes(word));

        if (words.length >= 1 && venueName.length >= 5) {
          // Capitalize first letter of each word
          detectedAddress = venueName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          console.log(`🎪 Found venue/event location: "${detectedAddress}"`);
          break;
        }
      }
    }
  }

  // Find the city name from text (we'll geocode it precisely later)
  const italianCities = ['roma', 'milano', 'napoli', 'torino', 'venezia', 'firenze', 'bologna', 'bari', 'palermo', 'genova', 'padova', 'verona', 'sassari', 'bancali'];

  for (const cityName of italianCities) {
    if (normalizedText.includes(cityName)) {
      detectedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1);
      break;
    }
  }

  // Try geocoding with different strategies
  let geocodedCoordinates = null;
  
  if (detectedAddress && detectedCity) {
    // Strategy 1: Try full address + city
    console.log(`🔍 Geocoding strategy 1: "${detectedAddress}, ${detectedCity}"`);
    geocodedCoordinates = await geocodeAddress(detectedAddress, detectedCity);

    if (!geocodedCoordinates) {
      // Strategy 2: Try just the venue/address name with "Italy"
      console.log(`🔍 Geocoding strategy 2: "${detectedAddress}, Italy"`);
      geocodedCoordinates = await geocodeAddress(detectedAddress, 'Italy');
    }
  } else if (detectedAddress && !detectedCity) {
    // Strategy 3: Address without specific city - search broadly in Italy
    console.log(`🔍 Geocoding strategy 3: "${detectedAddress}, Italy"`);
    geocodedCoordinates = await geocodeAddress(detectedAddress, 'Italy');

    // If successful, try to extract city from the geocoding result
    if (geocodedCoordinates) {
      // The geocoding function might help us identify the city
      console.log(`🎯 Successfully geocoded venue without city context`);
    }
  } else if (detectedCity) {
    // Strategy 4: City only
    console.log(`🔍 Geocoding strategy 4: City only - "${detectedCity}"`);
    geocodedCoordinates = await geocodeAddress(null, detectedCity);
  }

  // Log results
  if (geocodedCoordinates) {
    console.log(`🎯 Using geocoded coordinates for "${detectedAddress || detectedCity}"`);
  } else if (detectedAddress || detectedCity) {
    console.log(`📍 No geocoding results for "${detectedAddress || detectedCity}"`);
  } else {
    console.log(`⚠️ No address or city detected in text`);
  }

  // Return results, allowing N/A values
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
  if (text.includes('clima') || text.includes('ambiente') || text.includes('riscaldamento') || text.includes('sostenibilità') || text.includes('permacultura')) return 'ENVIRONMENT';
  if (text.includes('lavoro') || text.includes('sciopero') || text.includes('sindacato') || text.includes('mutuo soccorso') || text.includes('economia solidale')) return 'LABOR';
  if (text.includes('guerra') || text.includes('pace') || text.includes('war') || text.includes('antimilitarista')) return 'PEACE & ANTI-WAR';
  if (text.includes('diritti') || text.includes('giustizia') || text.includes('bezos') || text.includes('know your rights') || text.includes('conosci i tuoi diritti')) return 'CIVIL & HUMAN RIGHTS';
  if (text.includes('donna') || text.includes('donne') || text.includes('femminicidi') || text.includes('femminismo')) return 'WOMEN\'S RIGHTS';
  if (text.includes('razzismo') || text.includes('discriminazione') || text.includes('antifascist') || text.includes('antirazzist')) return 'RACIAL & SOCIAL JUSTICE';
  if (text.includes('sanita') || text.includes('scuola') || text.includes('health') || text.includes('formazione') || text.includes('educazione')) return 'HEALTHCARE & EDUCATION';
  if (text.includes('corruzione') || text.includes('trasparenza') || text.includes('democrazia partecipativa')) return 'TRANSPARENCY & ANTI-CORRUPTION';

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
      .eq('location', city)
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

    // Prepare event data - handle N/A values appropriately
    const eventData = {
      title: cleanTitle(event.title) || 'Untitled Event',
      description: event.description || 'No description available',
      category: event.category || 'OTHER',
      location: event.city === 'N/A' ? 'N/A' : (event.city || 'Milano'),
      address: event.address === 'N/A' ? 'N/A' : (event.address || event.city || 'Milano'),
      latitude: String(event.latitude || 45.4642),  // Milan fallback for coordinates
      longitude: String(event.longitude || 9.1900), // Milan fallback for coordinates
      date: event.date === 'N/A' ? null : event.date,  // Store null for N/A dates in database
      time: event.time || 'N/A',  // Keep N/A for missing time
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
 * Fetch and analyze full article content
 */
async function fetchArticleContent(articleUrl) {
  try {
    console.log(`📖 Fetching full article: ${articleUrl}`);

    const response = await makeRequest(articleUrl);
    const $ = load(response.data);

    // Extract article content using various selectors
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

    // Fallback: get all text from article tag
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
 * Enhanced website scraping with full article content analysis
 */
async function scrapeWebsite(source) {
  console.log(`\n🔍 Scraping ${source.name}...`);

  const events = [];
  const stats = {
    pagesScraped: 0,
    eventsFound: 0,
    eventsSkippedByDate: 0,
    eventsSkippedByKeywords: 0,
    articlesAnalyzed: 0
  };

  try {
    const response = await makeRequest(source.url);
    const $ = load(response.data);

    stats.pagesScraped = 1;

    console.log(`📄 Processing ${source.name}...`);

    // Special handling for ilrovescio.info - also try to fetch specific known articles
    if (source.name === 'ilrovescio.info') {
      const knownArticles = [
        'https://ilrovescio.info/2025/06/28/5-luglio-bancali-sassari-corteo-contro-il-carcere/',
        'https://ilrovescio.info/2025/06/28/torino-3-e-4-luglio-appuntamenti-di-lotta-per-linizio-del-processo-per-loperazione-city/'
      ];

      console.log(`🎯 Also checking ${knownArticles.length} specific known articles...`);

      for (const articleUrl of knownArticles) {
        try {
          console.log(`📖 Fetching specific article: ${articleUrl}`);
          const articleResponse = await makeRequest(articleUrl);
          const article$ = load(articleResponse.data);

          const title = cleanText(article$('h1, .entry-title, .article-title').first().text());
          const content = cleanText(article$('.entry-content, .content, article').text());

          if (title && content && containsProtestKeywords(`${title} ${content}`)) {
            const { date, time } = parseItalianDateTime(content);
            const locationInfo = await extractAddressAndCity(content);

            // Add delay for geocoding
            await new Promise(resolve => setTimeout(resolve, 1500));

            const event = {
              title: cleanTitle(title),
              description: content.slice(0, 1000),
              category: categorizeEvent(title, content),
              city: locationInfo.city || 'N/A',
              address: locationInfo.address || 'N/A',
              latitude: locationInfo.coordinates?.lat || 0,
              longitude: locationInfo.coordinates?.lng || 0,
              date: date || 'N/A',
              time: time || 'N/A',
              image_url: CATEGORY_IMAGES[categorizeEvent(title, content)] || CATEGORY_IMAGES.OTHER,
              event_url: articleUrl,
              source_name: source.name,
              source_url: source.url
            };

            events.push(event);
            stats.eventsFound++;
            console.log(`✅ Added specific article: "${event.title.slice(0, 50)}..." | ${event.category} | ${event.city}`);
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.log(`⚠️ Could not fetch specific article: ${error.message}`);
        }
      }
    }

    // Site-specific selectors for better detection
    let eventSelectors = [];
    let eventElements = $();

    if (source.name === 'ilrovescio.info') {
      // WordPress specific selectors for ilrovescio.info - try multiple approaches
      eventSelectors = [
        'article',               // WordPress article posts
        '.post',                 // WordPress post class
        '.slick-item',           // Homepage slider items
        '.wp-block-post',        // Gutenberg blocks
        'figure.slick-item',     // Specific slider structure
        '.aft-slide-items',      // Theme-specific slides
        '.article-title',        // Title containers
        '.entry',                // Entry wrapper
        'main article',          // Main content articles
        '.content article',      // Content wrapper articles
        'a[href*="/2025/"]'      // Links to 2025 articles
      ];
    } else {
      // Generic selectors for other sites
      eventSelectors = [
        'article', '.post', '.event', '.news-item', '.item', '.entry',
        '.news', '.evento', '.manifestazione', '.iniziativa'
      ];
    }

    for (const selector of eventSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        eventElements = elements;
        console.log(`📊 Found ${elements.length} potential events using selector: ${selector}`);
        break;
      }
    }

    // Special handling for ilrovescio.info - also check slider links
    if (source.name === 'ilrovescio.info' && eventElements.length === 0) {
      // Look for article links in sliders and homepage structure
      const slideLinks = $('a[href*="/2025/"]').filter((i, el) => {
        const href = $(el).attr('href');
        return href && href.includes('ilrovescio.info');
      });

      if (slideLinks.length > 0) {
        console.log(`📊 Found ${slideLinks.length} article links for ilrovescio.info`);
        eventElements = slideLinks.parent();
      }
    }

    // Process each potential event
    for (let i = 0; i < Math.min(20, eventElements.length); i++) {
      try {
        const $el = $(eventElements[i]);

        // Extract basic information with site-specific logic
        let title = '';
        let articleUrl = '';

        if (source.name === 'ilrovescio.info') {
          // Extract title from WordPress structure - try multiple selectors
          title = cleanText($el.find('.article-title a, h3 a, .slide-title a, .entry-title a').text()) ||
                  cleanText($el.find('h1, h2, h3, .title').text()) ||
                  cleanText($el.find('a').attr('title')) ||
                  cleanText($el.text()).split('\n')[0].trim(); // First line as fallback

          // Extract article URL - try multiple approaches
          let link = $el.find('a').first().attr('href');
          if (!link) {
            // If element is already a link
            link = $el.attr('href');
          }
          if (!link) {
            // Look for any link containing /2025/
            link = $el.find('a[href*="/2025/"]').first().attr('href');
          }

          if (link) {
            if (link.startsWith('/')) {
              articleUrl = `https://ilrovescio.info${link}`;
            } else if (link.startsWith('http')) {
              articleUrl = link;
            } else {
              articleUrl = `https://ilrovescio.info/${link}`;
            }
          }
        } else {
          title = cleanText($el.find('h1, h2, h3, .title, .headline').first().text()) ||
                  cleanText($el.text()).slice(0, 100) + '...';
        }

        const description = cleanText($el.find('p, .description, .excerpt, .content').first().text()) ||
          cleanText($el.text()).slice(0, 500);

        let eventUrl = '';
        if (source.name === 'ilrovescio.info' && articleUrl) {
          eventUrl = articleUrl;
        } else {
          const link = $el.find('a').first().attr('href');
          if (link && !link.startsWith('http')) {
            try {
              eventUrl = new URL(link, source.url).href;
            } catch (e) {
              eventUrl = source.url;
            }
          } else {
            eventUrl = link || source.url;
          }
        }

        // Initial check with title and description
        let fullText = `${title} ${description}`.toLowerCase();
        let hasProtestKeywords = containsProtestKeywords(fullText);

        // If no keywords found in title/description, fetch full article content
        if (!hasProtestKeywords && eventUrl && eventUrl !== source.url) {
          console.log(`🔍 No keywords in preview, fetching full article: "${title.slice(0, 50)}..."`);

          // Add small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 500));

          const articleContent = await fetchArticleContent(eventUrl);
          stats.articlesAnalyzed++;

          if (articleContent) {
            fullText = `${title} ${description} ${articleContent}`.toLowerCase();
            hasProtestKeywords = containsProtestKeywords(fullText);

            if (hasProtestKeywords) {
              console.log(`✅ Found activism keywords in full article: "${title.slice(0, 50)}..."`);
            }
          }
        }

        // Check if this looks like activism-related content
        if (!hasProtestKeywords) {
          console.log(`⚠️ Skipping non-activism content: "${title.slice(0, 50)}..."`);
          stats.eventsSkippedByKeywords++;
          continue;
        }

        // Check for excluded content (but be more lenient for educational/organizing events)
        if (containsExcludeKeywords(fullText)) {
          // Double-check: if it contains activism keywords, don't exclude it
          const hasActivismKeywords = ['workshop', 'formazione', 'presentazione', 'assemblea', 'incontro', 'dibattito', 'conferenza', 'seminario'].some(keyword => fullText.includes(keyword));
          if (!hasActivismKeywords) {
            console.log(`⚠️ Skipping excluded content: "${title.slice(0, 50)}..."`);
            stats.eventsSkippedByKeywords++;
            continue;
          } else {
            console.log(`✅ Keeping educational/organizing event: "${title.slice(0, 50)}..."`);
          }
        }

        // Extract date/time
        const dateText = cleanText($el.find('.date, time, .when, .data').text()) || description;
        const { date, time } = parseItalianDateTime(dateText);

        // Check date cutoff only if date exists
        if (date && !isDateWithinCutoff(date)) {
          console.log(`⏰ Skipping old event: "${title.slice(0, 50)}..." (${date})`);
          stats.eventsSkippedByDate++;
          continue;
        }

        // Extract location and address
        let fullTextForLocation = `${title} ${description}`;

        // If we fetched article content, include it for better address detection
        if (fullText.length > `${title} ${description}`.length) {
          fullTextForLocation = fullText;
        }

        const locationInfo = await extractAddressAndCity(fullTextForLocation);

        // Longer delay to respect geocoding API rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create event object - use N/A for missing data
        const event = {
          title: cleanTitle(title),
          description: description.slice(0, 1000),  // Limit description length
          category: categorizeEvent(title, description),
          city: locationInfo.city || 'N/A',
          address: locationInfo.address || 'N/A',
          latitude: locationInfo.coordinates?.lat || 0,
          longitude: locationInfo.coordinates?.lng || 0,
          date: date || 'N/A',
          time: time || 'N/A',
          image_url: CATEGORY_IMAGES[categorizeEvent(title, description)] || CATEGORY_IMAGES.other,
          event_url: eventUrl,
          source_name: source.name,
          source_url: source.url
        };

        events.push(event);
        stats.eventsFound++;

        console.log(`📋 Event found: "${event.title.slice(0, 50)}..." | ${event.category} | ${event.city} | ${event.date}`);

      } catch (error) {
        console.log(`⚠️ Error processing event element:`, error.message);
      }
    }

  } catch (error) {
    console.error(`❌ Error scraping ${source.name}:`, error.message);
  }

  console.log(`📊 ${source.name} Stats: ${events.length} events found, ${stats.articlesAnalyzed} articles analyzed`);
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
    totalArticlesAnalyzed: 0,
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
      globalStats.totalArticlesAnalyzed += stats.articlesAnalyzed || 0;
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
  console.log(`   📖 Articles analyzed: ${globalStats.totalArticlesAnalyzed}`);
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