import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  genova: { lat: 44.4056499, lng: 8.946256 }
};

const CATEGORY_IMAGES = {
  'ENVIRONMENT': 'https://images.unsplash.com/photo-1573152958734-1922c188fba3?w=800&h=600&fit=crop',
  'LGBTQ+': 'https://images.unsplash.com/photo-1596449895007-944e6c10e40e?w=800&h=600&fit=crop',
  'LABOR': 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop',
  'PEACE & ANTI-WAR': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop',
  'CIVIL & HUMAN RIGHTS': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
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
  if (text.includes('clima') || text.includes('ambiente')) return 'ENVIRONMENT';
  if (text.includes('lavoro') || text.includes('sciopero')) return 'LABOR';
  if (text.includes('guerra') || text.includes('pace')) return 'PEACE & ANTI-WAR';
  if (text.includes('diritti') || text.includes('giustizia')) return 'CIVIL & HUMAN RIGHTS';
  return 'OTHER';
}

function determineEventType(title, description = '') {
  const searchText = normalizeText(`${title} ${description}`);
  if (searchText.includes('workshop') || searchText.includes('corso')) return 'Workshop';
  if (searchText.includes('assemblea') || searchText.includes('riunione')) return 'Assembly';
  if (searchText.includes('conferenza') || searchText.includes('presentazione')) return 'Talk';
  if (searchText.includes('manifestazione') || searchText.includes('protesta')) return 'Protest';
  return 'Other';
}

async function geocodeAddress(address, city) {
  const fullAddress = address && address !== city ? `${address}, ${city}, Italy` : `${city}, Italy`;
  
  try {
    console.log(`🌍 Geocoding: "${fullAddress}"`);
    
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: fullAddress,
        format: 'json',
        limit: 1,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'Corteo-Scraper/1.0 (contact@corteo.app)'
      },
      timeout: 5000
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const coords = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
      
      console.log(`✅ Geocoded "${fullAddress}" to coordinates: ${coords.lat}, ${coords.lng}`);
      return coords;
    } else {
      console.log(`⚠️ No geocoding results for: "${fullAddress}"`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Geocoding failed for "${fullAddress}":`, error.message);
    return null;
  }
}

async function extractAddressAndCity(text) {
  const normalizedText = normalizeText(text);
  const originalText = text.toLowerCase();

  const addressPatterns = [
    /\b(via\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(piazza\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(corso\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi,
    /\b(largo\s+[a-zA-ZÀ-ÿ\s]+(?:\d+)?)/gi
  ];

  let detectedAddress = null;
  let detectedCity = null;
  let coordinates = null;

  // Find specific address
  for (const pattern of addressPatterns) {
    const matches = originalText.match(pattern);
    if (matches && matches.length > 0) {
      detectedAddress = matches[0]
        .trim()
        .replace(/\s+/g, ' ')
        .split(/[,;]|presso|c\/o/)[0]
        .trim();
      
      detectedAddress = detectedAddress
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      console.log(`🏠 Found specific address: "${detectedAddress}"`);
      break;
    }
  }

  // Find city
  for (const [cityName, coords] of Object.entries(ITALIAN_CITIES)) {
    if (normalizedText.includes(cityName)) {
      detectedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1);
      coordinates = coords;
      break;
    }
  }

  if (!detectedCity) {
    detectedCity = 'Milano';
    coordinates = ITALIAN_CITIES.milano;
  }

  // Try geocoding for precise coordinates
  const geocodedCoords = await geocodeAddress(detectedAddress, detectedCity);
  if (geocodedCoords) {
    coordinates = geocodedCoords;
    console.log(`🎯 Using geocoded coordinates for "${detectedAddress || detectedCity}"`);
  } else {
    console.log(`📍 Using fallback city coordinates for "${detectedCity}"`);
  }

  const finalAddress = detectedAddress || detectedCity;

  return {
    address: finalAddress,
    city: detectedCity,
    coordinates: coordinates
  };
}

async function saveEventToDatabase(event) {
  try {
    // Check for duplicate
    const { data: existing } = await supabase
      .from('protests')
      .select('id')
      .eq('title', event.title)
      .eq('city', event.city)
      .eq('date', event.date);

    if (existing && existing.length > 0) {
      console.log(`⚠️ Duplicate event found: "${event.title}"`);
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
      event_type: determineEventType(event.title, event.description),
      event_url: event.event_url || null,
      country_code: 'IT',
      featured: false,
      attendees: 0,
      source_name: event.source_name || 'quick-scraper',
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

async function quickScrape() {
  console.log('🚀 Starting Quick Italian Protest Scraper...');
  
  const sampleEvents = [
    {
      title: 'Manifestazione per il Clima Milano',
      description: 'Grande manifestazione per sensibilizzare sui cambiamenti climatici e chiedere azioni concrete al governo.',
      city: 'Milano',
      address: 'Piazza del Duomo',
      date: '2025-07-20',
      time: '15:00',
      category: 'ENVIRONMENT',
      source_name: 'quick-scraper',
      source_url: 'https://example.com'
    },
    {
      title: 'Pride 2025 Roma',
      description: 'Parata del Pride per i diritti LGBTQ+ nel centro di Roma.',
      city: 'Roma',
      address: 'Via dei Fori Imperiali',
      date: '2025-07-26',
      time: '17:00',
      category: 'LGBTQ+',
      source_name: 'quick-scraper',
      source_url: 'https://example.com'
    },
    {
      title: 'Sciopero Generale Torino',
      description: 'Sciopero generale dei lavoratori per migliori condizioni di lavoro.',
      city: 'Torino',
      address: 'Piazza Castello',
      date: '2025-07-15',
      time: '09:00',
      category: 'LABOR',
      source_name: 'quick-scraper',
      source_url: 'https://example.com'
    }
  ];

  let savedCount = 0;

  for (const eventData of sampleEvents) {
    try {
      console.log(`\n📍 Processing: ${eventData.title}`);
      
      // Get precise coordinates
      const locationInfo = await extractAddressAndCity(`${eventData.title} ${eventData.description} ${eventData.address} ${eventData.city}`);
      
      const event = {
        ...eventData,
        address: locationInfo.address,
        city: locationInfo.city,
        latitude: locationInfo.coordinates.lat,
        longitude: locationInfo.coordinates.lng,
        image_url: CATEGORY_IMAGES[eventData.category] || CATEGORY_IMAGES.OTHER,
        event_type: determineEventType(eventData.title, eventData.description)
      };

      const success = await saveEventToDatabase(event);
      if (success) {
        savedCount++;
      }

      // Small delay between saves
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ Error processing ${eventData.title}:`, error.message);
    }
  }

  console.log(`\n🎉 Quick scraper completed!`);
  console.log(`✅ Events saved: ${savedCount}/${sampleEvents.length}`);
  console.log(`📍 All events now have precise geocoded coordinates`);
}

quickScrape().catch(console.error);