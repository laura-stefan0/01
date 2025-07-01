#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';
import { promises as fs } from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Keywords for filtering
const PROTEST_KEYWORDS = [
  'manifestazione', 'protesta', 'sciopero', 'presidio', 'corteo', 'occupazione',
  'sit-in', 'mobilitazione', 'marcia', 'picchetto', 'concentramento',
  'assemblea pubblica', 'iniziativa politica', 'blocco stradale', 'pride'
];

const EXCLUDE_KEYWORDS = [
  'concerto', 'spettacolo', 'festival', 'mostra', 'fiera', 'mercatino',
  'messa', 'celebrazione', 'evento gastronomico', 'laboratorio',
  'evento sportivo', 'corsa', 'maratona', 'dj set', 'sagra', 'reading',
  'workshop', 'meditazione', 'presentazione'
];

// Italian month names to numbers
const ITALIAN_MONTHS = {
  'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
  'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
  'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
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

// Websites to scrape
const SCRAPE_SOURCES = [
  { url: 'https://www.globalproject.info/it/tags/news/menu', name: 'globalproject.info' },
  { url: 'https://fridaysforfutureitalia.it', name: 'fridaysforfutureitalia.it' },
  { url: 'https://extinctionrebellion.it/eventi/futuri/', name: 'extinctionrebellion.it' },
  { url: 'https://adlcobas.it/', name: 'adlcobas.it' },
  { url: 'https://www.notav.info/', name: 'notav.info' },
  { url: 'https://it.euronews.com/tag/manifestazioni-in-italia', name: 'euronews.com' },
  { url: 'https://www.globalist.it/', name: 'globalist.it' },
  { url: 'https://www.open.online/', name: 'open.online' },
  { url: 'https://ilmanifesto.it/', name: 'ilmanifesto.it' },
  { url: 'https://ilrovescio.info/category/iniziative/', name: 'ilrovescio.info' },
  { url: 'https://rivoluzioneanarchica.it/', name: 'rivoluzioneanarchica.it' }
];

// Helper functions
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

function parseItalianDate(dateString) {
  if (!dateString || dateString.trim().length === 0) {
    // Default to a future date (2 weeks from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    return futureDate.toISOString().split('T')[0];
  }
  
  const cleanDateString = cleanText(dateString).toLowerCase();
  
  // Try to find day
  const dayMatch = cleanDateString.match(/(\d{1,2})/);
  const day = dayMatch ? dayMatch[1].padStart(2, '0') : '15';
  
  // Try to find month
  let month = '08'; // Default to August
  for (const [monthName, monthNum] of Object.entries(ITALIAN_MONTHS)) {
    if (cleanDateString.includes(monthName)) {
      month = monthNum;
      break;
    }
  }
  
  // Try to find year
  const yearMatch = cleanDateString.match(/20(\d{2})/);
  const year = yearMatch ? `20${yearMatch[1]}` : '2025';
  
  // Ensure valid date
  const dateResult = `${year}-${month}-${day}`;
  
  // Validate the date
  const testDate = new Date(dateResult);
  if (isNaN(testDate.getTime())) {
    // If invalid, return a default future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    return futureDate.toISOString().split('T')[0];
  }
  
  return dateResult;
}

function parseTime(timeString) {
  if (!timeString) return '18:00';
  
  const timeMatch = timeString.match(/(\d{1,2})[:.:](\d{2})/);
  return timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : '18:00';
}

function categorizeEvent(title, description) {
  const text = normalizeText(`${title} ${description}`);
  
  // Environment
  if (text.includes('clima') || text.includes('ambiente') || text.includes('extinction') || 
      text.includes('fridays for future') || text.includes('verde') || text.includes('ecolog')) {
    return 'environment';
  }
  
  // LGBTQ+
  if (text.includes('pride') || text.includes('lgbt') || text.includes('gay') || 
      text.includes('omofob') || text.includes('transfob') || text.includes('queer')) {
    return 'lgbtq+';
  }
  
  // Women's Rights
  if (text.includes('donna') || text.includes('donne') || text.includes('femminic') || 
      text.includes('violenza') || text.includes('non una di meno') || text.includes('aborto')) {
    return 'women\'s rights';
  }
  
  // Labor
  if (text.includes('sciopero') || text.includes('lavoro') || text.includes('operai') || 
      text.includes('sindacat') || text.includes('usb') || text.includes('cgil') || 
      text.includes('sicobas') || text.includes('licenziament')) {
    return 'labor';
  }
  
  // Racial & Social Justice
  if (text.includes('razzis') || text.includes('migranti') || text.includes('rifugiat') || 
      text.includes('antirazzist') || text.includes('accoglienza') || text.includes('fascis')) {
    return 'racial & social justice';
  }
  
  // Civil & Human Rights
  if (text.includes('diritti') || text.includes('costituzione') || text.includes('democrazia') || 
      text.includes('libertà') || text.includes('censura') || text.includes('repression')) {
    return 'civil & human rights';
  }
  
  // Healthcare & Education
  if (text.includes('sanità') || text.includes('scuola') || text.includes('università') || 
      text.includes('ospedale') || text.includes('medic') || text.includes('istruzione')) {
    return 'healthcare & education';
  }
  
  // Peace & Anti-war
  if (text.includes('pace') || text.includes('guerra') || text.includes('militare') || 
      text.includes('armi') || text.includes('antimilitarist') || text.includes('palestin')) {
    return 'peace & anti-war';
  }
  
  // Transparency & Anti-corruption
  if (text.includes('corruzione') || text.includes('trasparenza') || text.includes('mafia') || 
      text.includes('antimafia') || text.includes('legalità')) {
    return 'transparency & anti-corruption';
  }
  
  return 'other';
}

// Italian cities with coordinates (fallback for geocoding)
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
  'messina': { lat: 38.1938, lng: 15.5540 }
};

async function geocodeAddress(address, city) {
  try {
    // First try with known Italian cities
    const normalizedCity = normalizeText(city);
    if (ITALIAN_CITIES[normalizedCity]) {
      return {
        latitude: ITALIAN_CITIES[normalizedCity].lat,
        longitude: ITALIAN_CITIES[normalizedCity].lng
      };
    }
    
    // Rate limiting delay for external geocoding
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const fullAddress = `${address}, ${city}, Italy`;
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: fullAddress,
        format: 'json',
        limit: 1,
        countrycodes: 'it'
      },
      headers: {
        'User-Agent': 'ItalianProtestScraper/1.0 (educational purpose)'
      },
      timeout: 15000
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    }
    
  } catch (error) {
    console.log(`Using fallback coordinates for ${city}`);
  }
  
  // Default to Milan coordinates
  return {
    latitude: 45.4642,
    longitude: 9.1900
  };
}

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

async function scrapeWebsite(source) {
  console.log(`🔍 Scraping ${source.name}...`);
  const events = [];
  
  try {
    const response = await axios.get(source.url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = load(response.data);
    
    // Generic selectors for events
    const eventSelectors = [
      'article', '.event', '.evento', '.manifestazione', '.news', '.post',
      '.card', '.item', '.entry', 'h1', 'h2', 'h3', '.title', '.headline'
    ];
    
    const scrapedElements = new Set();
    
    for (const selector of eventSelectors) {
      $(selector).each((i, element) => {
        if (scrapedElements.has(element)) return;
        scrapedElements.add(element);
        
        const $el = $(element);
        
        // Extract text content
        const rawTitle = cleanText($el.find('h1, h2, h3, .title, .headline').first().text() || $el.text().substring(0, 100));
        const title = cleanTitle(rawTitle);
        const description = cleanText($el.find('p, .description, .content, .summary').text() || $el.text().substring(0, 500));
        
        if (!title || title.length < 10) return;
        
        // Check if it's a protest-related event
        const fullText = `${title} ${description}`;
        if (!containsProtestKeywords(fullText)) return;
        if (containsExcludeKeywords(fullText)) return;
        
        // Extract date and time
        const dateText = cleanText($el.find('.date, .when, time, .data').text());
        const timeText = cleanText($el.find('.time, .ora, .orario').text());
        
        // Extract location
        let address = cleanText($el.find('.location, .dove, .place, .venue, .address').text());
        let city = '';
        
        // Try to extract city from address or use generic Italian cities
        const cities = ['roma', 'milano', 'napoli', 'torino', 'palermo', 'genova', 'bologna', 'firenze', 'bari', 'catania'];
        for (const c of cities) {
          if (normalizeText(fullText).includes(c)) {
            city = c.charAt(0).toUpperCase() + c.slice(1);
            break;
          }
        }
        
        if (!city) city = 'Milano'; // Default city
        if (!address) address = city;
        
        // Extract image URL
        let imageUrl = $el.find('img').first().attr('src');
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = new URL(imageUrl, source.url).href;
        }
        
        const category = categorizeEvent(title, description);
        const date = parseItalianDate(dateText);
        const time = parseTime(timeText);
        
        events.push({
          title,
          description,
          category,
          address,
          city,
          date,
          time,
          image_url: imageUrl,
          source_name: source.name,
          source_url: source.url
        });
      });
    }
    
    // Limit events per source to avoid overwhelming
    return events.slice(0, 20);
    
  } catch (error) {
    console.error(`❌ Error scraping ${source.name}:`, error.message);
    return [];
  }
}

async function saveEventToDatabase(event) {
  try {
    // Check for duplicates
    const isDuplicate = await checkDuplicate(event.title, event.date, event.city);
    if (isDuplicate) {
      console.log("Duplicate event skipped:", event.title);
      return false;
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
      latitude: coordinates.latitude.toString(),
      longitude: coordinates.longitude.toString(),
      date: event.date,
      time: event.time,
      image_url: event.image_url || CATEGORY_IMAGES[event.category],
      country_code: 'IT',
      featured: false,
      attendees: 0,
      source_name: event.source_name,
      source_url: event.source_url,
      scraped_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('protests')
      .insert([eventData])
      .select();
    
    if (error) {
      console.error('❌ Error inserting event:', error);
      return false;
    }
    
    console.log(`✅ Saved: ${event.title} in ${event.city}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error saving event:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Italian Protest Scraper...');
  console.log(`📊 Scraping ${SCRAPE_SOURCES.length} sources for protest events`);
  
  let totalEvents = 0;
  let savedEvents = 0;
  
  for (const source of SCRAPE_SOURCES) {
    const events = await scrapeWebsite(source);
    totalEvents += events.length;
    
    console.log(`📊 Found ${events.length} potential events from ${source.name}`);
    
    for (const event of events) {
      const saved = await saveEventToDatabase(event);
      if (saved) savedEvents++;
      
      // Rate limiting to be respectful to geocoding service
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n🎉 Scraping completed!');
  console.log(`📊 Total events found: ${totalEvents}`);
  console.log(`💾 Events saved to database: ${savedEvents}`);
  console.log(`🚫 Duplicates skipped: ${totalEvents - savedEvents}`);
  
  // Show breakdown by category
  const { data: allEvents, error } = await supabase
    .from('protests')
    .select('category')
    .eq('country_code', 'IT');
  
  if (!error && allEvents) {
    const categories = {};
    allEvents.forEach(event => {
      categories[event.category] = (categories[event.category] || 0) + 1;
    });
    
    console.log('\n📈 Events by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} events`);
    });
  }
}

// Run the scraper
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as runScraper };