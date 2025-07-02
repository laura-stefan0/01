import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ITALIAN_CITIES = {
  'roma': { lat: 41.9028, lng: 12.4964 },
  'milano': { lat: 45.4642, lng: 9.1900 },
  'napoli': { lat: 40.8518, lng: 14.2681 },
  'torino': { lat: 45.0703, lng: 7.6869 },
  'venezia': { lat: 45.4371, lng: 12.3345 },
  'firenze': { lat: 43.7695, lng: 11.2558 },
  'bologna': { lat: 44.4949, lng: 11.3426 },
  'bari': { lat: 41.1257, lng: 16.8620 },
  'palermo': { lat: 38.1156, lng: 13.3612 },
  'genova': { lat: 44.4056, lng: 8.9463 },
  'padova': { lat: 45.3914, lng: 11.8058 },
  'verona': { lat: 45.4384, lng: 10.9916 },
  'sassari': { lat: 40.7259, lng: 8.5592 },
  'bancali': { lat: 40.7259, lng: 8.5592 } // Same as Sassari
};

const CATEGORY_IMAGES = {
  'CIVIL & HUMAN RIGHTS': 'https://images.unsplash.com/photo-1585515656559-a9dc1f06cc13?w=500&h=300&fit=crop&auto=format',
  'PEACE & ANTI-WAR': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop&auto=format',
  'OTHER': 'https://images.unsplash.com/photo-1573152958734-1922c188fba3?w=500&h=300&fit=crop&auto=format'
};

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

function extractEventDate(fullText) {
  if (!fullText) return null;
  
  const text = fullText.toLowerCase();
  const italianMonths = {
    gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
    maggio: '05', giugno: '06', luglio: '07', agosto: '08',
    settembre: '09', ottobre: '10', novembre: '11', dicembre: '12'
  };

  // Look for specific date patterns
  const datePatterns = [
    // "5 luglio" or "3 e 4 luglio"
    /(\d{1,2})\s+(luglio|giugno|agosto|settembre|ottobre|novembre|dicembre)/g,
    // "3 e 4 luglio"
    /(\d{1,2})\s+e\s+(\d{1,2})\s+(luglio|giugno|agosto|settembre|ottobre|novembre|dicembre)/g
  ];

  for (const pattern of datePatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      if (match[3]) {
        // "3 e 4 luglio" format
        const day = match[1].padStart(2, '0');
        const month = italianMonths[match[3]];
        const year = new Date().getFullYear().toString();
        return `${year}-${month}-${day}`;
      } else if (match[2]) {
        // "5 luglio" format
        const day = match[1].padStart(2, '0');
        const month = italianMonths[match[2]];
        const year = new Date().getFullYear().toString();
        return `${year}-${month}-${day}`;
      }
    }
  }
  
  return null;
}

function categorizeEvent(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('carcere') || text.includes('corteo') || text.includes('lotta')) return 'CIVIL & HUMAN RIGHTS';
  if (text.includes('processo') || text.includes('operazione')) return 'PEACE & ANTI-WAR';
  return 'OTHER';
}

function getCoordinatesForCity(text) {
  const normalizedText = text.toLowerCase();
  
  for (const [cityName, coords] of Object.entries(ITALIAN_CITIES)) {
    if (normalizedText.includes(cityName)) {
      return {
        city: cityName.charAt(0).toUpperCase() + cityName.slice(1),
        coordinates: coords
      };
    }
  }
  
  return {
    city: 'Milano',
    coordinates: ITALIAN_CITIES.milano
  };
}

async function saveEventToDatabase(event) {
  try {
    console.log(`💾 Saving: "${event.title}"`);

    // Check for duplicate
    const { data: existing } = await supabase
      .from('protests')
      .select('id')
      .eq('title', event.title);

    if (existing && existing.length > 0) {
      console.log(`⚠️ Duplicate found, skipping: "${event.title}"`);
      return false;
    }

    const eventData = {
      title: cleanTitle(event.title),
      description: event.description || 'No description available',
      category: event.category || 'OTHER',
      city: event.city || 'Milano',
      address: event.address || event.city || 'Milano',
      latitude: String(event.latitude || ITALIAN_CITIES.milano.lat),
      longitude: String(event.longitude || ITALIAN_CITIES.milano.lng),
      date: event.date || null,
      time: event.time || 'N/A',
      image_url: event.image_url || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.OTHER,
      event_type: event.event_type || 'Protest',
      event_url: event.event_url || null,
      country_code: 'IT',
      featured: false,
      attendees: 0,
      source_name: 'ilrovescio.info',
      source_url: 'https://ilrovescio.info',
      scraped_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('protests')
      .insert([eventData])
      .select();

    if (error) {
      console.error(`❌ Error saving: ${error.message}`);
      return false;
    }

    console.log(`✅ Saved: "${event.title}" | ${event.city} | ${event.date}`);
    return true;

  } catch (error) {
    console.error(`❌ Exception: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🎯 Quick ilrovescio.info scraper for missing articles...');
  
  // The specific articles to add
  const targetArticles = [
    {
      title: '5 luglio, Bancali (Sassari): Corteo contro il carcere',
      url: 'https://ilrovescio.info/2025/06/28/5-luglio-bancali-sassari-corteo-contro-il-carcere/',
      description: 'Corteo contro il carcere organizzato a Bancali, Sassari, per protestare contro le condizioni carcerarie e il sistema penitenziario.'
    },
    {
      title: 'Torino, 3 e 4 luglio: appuntamenti di lotta per l\'inizio del processo per l\'operazione City',
      url: 'https://ilrovescio.info/2025/06/28/torino-3-e-4-luglio-appuntamenti-di-lotta-per-linizio-del-processo-per-loperazione-city/',
      description: 'Appuntamenti di lotta a Torino per l\'inizio del processo dell\'operazione City, mobilitazione contro la repressione.'
    }
  ];

  let savedCount = 0;

  for (const article of targetArticles) {
    const fullText = `${article.title} ${article.description}`;
    const locationInfo = getCoordinatesForCity(fullText);
    const eventDate = extractEventDate(fullText);
    
    const event = {
      title: article.title,
      description: article.description,
      category: categorizeEvent(article.title, article.description),
      city: locationInfo.city,
      address: locationInfo.city,
      latitude: locationInfo.coordinates.lat,
      longitude: locationInfo.coordinates.lng,
      date: eventDate,
      time: 'N/A',
      event_type: 'Protest',
      event_url: article.url,
      image_url: CATEGORY_IMAGES[categorizeEvent(article.title, article.description)]
    };

    const success = await saveEventToDatabase(event);
    if (success) savedCount++;
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n🎉 Quick scraper completed!`);
  console.log(`✅ Successfully saved ${savedCount} missing articles from ilrovescio.info`);
}

main().catch(console.error);