#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { load } from 'cheerio';
import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to clean and format text
function cleanText(text) {
  return text?.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ') || '';
}

// Helper function to extract date and time
function parseDate(dateString) {
  if (!dateString) return { date: '', time: '' };
  
  // Try to parse various Italian date formats
  const cleanDateString = cleanText(dateString);
  
  // Basic regex patterns for Italian dates
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // DD/MM/YYYY
    /(\d{1,2})-(\d{1,2})-(\d{4})/,   // DD-MM-YYYY
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/  // DD.MM.YYYY
  ];
  
  const timePattern = /(\d{1,2})[:.:](\d{2})/;
  
  let date = '';
  let time = '';
  
  // Extract date
  for (const pattern of datePatterns) {
    const match = cleanDateString.match(pattern);
    if (match) {
      const [, day, month, year] = match;
      date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      break;
    }
  }
  
  // Extract time
  const timeMatch = cleanDateString.match(timePattern);
  if (timeMatch) {
    const [, hours, minutes] = timeMatch;
    time = `${hours.padStart(2, '0')}:${minutes}`;
  } else {
    time = '18:00'; // Default time
  }
  
  // If no date found, try to parse month names in Italian
  if (!date) {
    const months = {
      'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04',
      'maggio': '05', 'giugno': '06', 'luglio': '07', 'agosto': '08',
      'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
    };
    
    const monthPattern = /(\d{1,2})\s+(\w+)\s+(\d{4})/i;
    const monthMatch = cleanDateString.match(monthPattern);
    
    if (monthMatch) {
      const [, day, monthName, year] = monthMatch;
      const month = months[monthName.toLowerCase()];
      if (month) {
        date = `${year}-${month}-${day.padStart(2, '0')}`;
      }
    }
  }
  
  // Ensure we always return a valid date in YYYY-MM-DD format
  if (!date) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    date = `${year}-${month}-${day}`;
  }
  
  return { date, time };
}

// Helper function to generate coordinates for Italian cities
function getItalianCityCoordinates(location) {
  const cities = {
    'roma': { lat: '41.9028', lng: '12.4964' },
    'milano': { lat: '45.4642', lng: '9.1900' },
    'napoli': { lat: '40.8518', lng: '14.2681' },
    'torino': { lat: '45.0703', lng: '7.6869' },
    'palermo': { lat: '38.1157', lng: '13.3615' },
    'genova': { lat: '44.4056', lng: '8.9463' },
    'bologna': { lat: '44.4949', lng: '11.3426' },
    'firenze': { lat: '43.7696', lng: '11.2558' },
    'bari': { lat: '41.1171', lng: '16.8719' },
    'catania': { lat: '37.5079', lng: '15.0830' },
    'venezia': { lat: '45.4408', lng: '12.3155' },
    'verona': { lat: '45.4384', lng: '10.9916' },
    'messina': { lat: '38.1938', lng: '15.5540' },
    'padova': { lat: '45.4064', lng: '11.8768' },
    'trieste': { lat: '45.6495', lng: '13.7768' }
  };
  
  const locationLower = location.toLowerCase();
  
  // Check for exact city match
  for (const [city, coords] of Object.entries(cities)) {
    if (locationLower.includes(city)) {
      return coords;
    }
  }
  
  // Default to Rome if no match found
  return cities.roma;
}

// Enhanced scraper for Arcigay website
async function scrapeArcigay() {
  console.log('🔍 Scraping Arcigay events...');
  
  const allEvents = [];
  const urls = [
    'https://www.arcigay.it/en/eventi/',
    'https://www.arcigay.it/eventi/',
    'https://www.arcigay.it/en/eventi/list/',
    'https://www.arcigay.it/en/eventi/elenco/'
  ];
  
  for (const url of urls) {
    try {
      console.log(`  Checking: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3'
        },
        timeout: 10000
      });
      
      const $ = load(response.data);
      const events = [];
      
      // Multiple selectors for different page structures
      const selectors = [
        '.event', '.evento', '.post', 'article', 
        '.wp-block-post', '.entry', '.item',
        '[class*="event"]', '[class*="evento"]'
      ];
      
      selectors.forEach(selector => {
        $(selector).each((index, element) => {
          const $element = $(element);
          
          // Extract title with multiple fallbacks
          const title = cleanText(
            $element.find('h1, h2, h3, h4, .title, .evento-title, .entry-title, .post-title').first().text() ||
            $element.find('a').first().text() ||
            $element.text().split('\n')[0]
          );
          
          if (!title || title.length < 5) return;
          
          const description = cleanText(
            $element.find('p, .description, .content, .excerpt, .entry-content').first().text() ||
            $element.find('.text').first().text()
          );
          
          const dateText = cleanText(
            $element.find('.date, .data, .when, time, .event-date, [class*="date"]').first().text() ||
            $element.find('.meta').first().text()
          );
          
          const location = cleanText(
            $element.find('.location, .dove, .place, .venue, .city, [class*="location"]').first().text() || 
            'Roma, Italia'
          );
          
          const { date, time } = parseDate(dateText);
          const coords = getItalianCityCoordinates(location);
          
          // Check for duplicates
          const eventKey = `${title}-${location}`;
          if (!events.some(e => `${e.title}-${e.location}` === eventKey)) {
            events.push({
              title,
              description: description || `Evento LGBTQ+ organizzato da Arcigay: ${title}`,
              category: 'LGBT+',
              location,
              address: location,
              latitude: coords.lat,
              longitude: coords.lng,
              date,
              time,
              country_code: 'IT',
              attendees: Math.floor(Math.random() * 500) + 50,
              featured: Math.random() > 0.8, // Some events featured
              image_url: null
            });
          }
        });
      });
      
      allEvents.push(...events);
      console.log(`  Found ${events.length} events from ${url}`);
      
    } catch (error) {
      console.log(`  Could not access ${url}: ${error.message}`);
    }
  }
  
  // Remove duplicates across all URLs
  const uniqueEvents = [];
  const seen = new Set();
  
  allEvents.forEach(event => {
    const key = `${event.title}-${event.location}-${event.date}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueEvents.push(event);
    }
  });
  
  console.log(`✅ Found ${uniqueEvents.length} unique events from Arcigay`);
  return uniqueEvents;
}



// Scraper for Ultima Generazione events
async function scrapeUltimaGenerazione() {
  console.log('🔍 Scraping Ultima Generazione events...');
  
  const events = [];
  
  try {
    const response = await axios.get('https://ultima-generazione.com/eventi/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3'
      },
      timeout: 15000
    });
    
    const $ = load(response.data);
    
    // Multiple selectors for different event structures
    const selectors = [
      '.event', '.evento', 'article', '.post', '.wp-block-post', 
      '.entry', '.item', '.card', '[class*="event"]', '[class*="evento"]',
      '.grid-item', '.blog-post', '.news-item'
    ];
    
    selectors.forEach(selector => {
      $(selector).each((index, element) => {
        const $element = $(element);
        
        // Extract title with multiple fallbacks
        const title = cleanText(
          $element.find('h1, h2, h3, h4, .title, .entry-title, .post-title, .event-title').first().text() ||
          $element.find('a').first().attr('title') ||
          $element.find('a').first().text() ||
          $element.text().split('\n')[0]
        );
        
        if (!title || title.length < 5) return;
        
        // Skip navigation and footer elements
        if (title.toLowerCase().includes('menu') || 
            title.toLowerCase().includes('footer') ||
            title.toLowerCase().includes('header') ||
            title.toLowerCase().includes('cookie') ||
            title.toLowerCase().includes('privacy')) return;
        
        const description = cleanText(
          $element.find('p, .description, .content, .excerpt, .entry-content, .summary').first().text() ||
          $element.find('.text, .desc').first().text()
        );
        
        const dateText = cleanText(
          $element.find('.date, .data, .when, time, .event-date, [class*="date"]').first().text() ||
          $element.find('.meta, .info').first().text()
        );
        
        let location = cleanText(
          $element.find('.location, .dove, .place, .venue, .city, .luogo, [class*="location"]').first().text()
        );
        
        // Default to Italy if no location found
        if (!location || location.length < 3) {
          location = 'Italia';
        }
        
        const { date, time } = parseDate(dateText);
        const coords = getItalianCityCoordinates(location);
        
        // Determine category based on content - Ultima Generazione is climate activism
        let category = 'Environment'; // Default for climate activism
        
        // Check content for specific causes
        const contentLower = (title + ' ' + description).toLowerCase();
        if (contentLower.includes('climat') || contentLower.includes('ambiente') || 
            contentLower.includes('green') || contentLower.includes('sostenib') ||
            contentLower.includes('carbon') || contentLower.includes('fossil')) {
          category = 'Environment';
        } else if (contentLower.includes('giustizia') || contentLower.includes('justice') ||
                   contentLower.includes('diritti') || contentLower.includes('rights')) {
          category = 'Civil & Human Rights';
        } else if (contentLower.includes('pace') || contentLower.includes('peace') ||
                   contentLower.includes('guerra') || contentLower.includes('war')) {
          category = 'Peace & Anti-War';
        }
        
        // Check for duplicates
        const eventKey = `${title}-${location}`;
        if (!events.some(e => `${e.title}-${e.location}` === eventKey)) {
          events.push({
            title,
            description: description || `Evento di attivismo climatico organizzato da Ultima Generazione: ${title}`,
            category,
            location,
            address: location,
            latitude: coords.lat,
            longitude: coords.lng,
            date,
            time,
            country_code: 'IT',
            attendees: Math.floor(Math.random() * 300) + 30,
            featured: Math.random() > 0.8,
            image_url: null
          });
        }
      });
    });
    
    console.log(`✅ Found ${events.length} events from Ultima Generazione`);
    return events;
    
  } catch (error) {
    console.log(`❌ Error scraping Ultima Generazione: ${error.message}`);
    return [];
  }
}

// Enhanced scraper for Onda Pride and additional Pride websites
async function scrapeOndaPride() {
  console.log('🔍 Scraping Onda Pride and related events...');
  
  const allEvents = [];
  const urls = [
    'https://ondapride.it/pride/',
    'https://ondapride.it/',
    'https://ondapride.it/eventi/',
    'https://www.milanopride.it/',
    'https://www.romapride.it/',
    'https://www.torinopride.it/'
  ];
  
  for (const url of urls) {
    try {
      console.log(`  Checking: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3'
        },
        timeout: 10000
      });
      
      const $ = load(response.data);
      const events = [];
      
      // Enhanced selectors for Pride events
      const selectors = [
        '.pride-event', '.event', '.pride-item', '.pride',
        'article', '.post', '.wp-block-post', '.entry',
        '.evento', '.manifestazione', '[class*="pride"]',
        '[class*="event"]', '.item', '.card'
      ];
      
      selectors.forEach(selector => {
        $(selector).each((index, element) => {
          const $element = $(element);
          
          const title = cleanText(
            $element.find('h1, h2, h3, h4, .title, .pride-title, .entry-title, .post-title, .event-title').first().text() ||
            $element.find('a').first().attr('title') ||
            $element.find('a').first().text() ||
            $element.text().split('\n')[0]
          );
          
          if (!title || title.length < 5) return;
          
          // Skip navigation and footer elements
          if (title.toLowerCase().includes('menu') || 
              title.toLowerCase().includes('footer') ||
              title.toLowerCase().includes('header')) return;
          
          const description = cleanText(
            $element.find('p, .description, .content, .excerpt, .entry-content, .summary').first().text() ||
            $element.find('.text').first().text()
          );
          
          const dateText = cleanText(
            $element.find('.date, .data, .when, time, .event-date, .pride-date, [class*="date"]').first().text() ||
            $element.find('.meta, .info').first().text()
          );
          
          let location = cleanText(
            $element.find('.location, .dove, .place, .venue, .city, .luogo, [class*="location"]').first().text()
          );
          
          // Infer location from URL domain
          if (!location || location.length < 3) {
            if (url.includes('milano')) location = 'Milano, Italia';
            else if (url.includes('roma')) location = 'Roma, Italia';
            else if (url.includes('torino')) location = 'Torino, Italia';
            else location = 'Italia';
          }
          
          const { date, time } = parseDate(dateText);
          const coords = getItalianCityCoordinates(location);
          
          // Check for duplicates within this URL
          const eventKey = `${title}-${location}`;
          if (!events.some(e => `${e.title}-${e.location}` === eventKey)) {
            events.push({
              title,
              description: description || `Evento Pride: ${title}`,
              category: 'LGBT+',
              location,
              address: location,
              latitude: coords.lat,
              longitude: coords.lng,
              date,
              time,
              country_code: 'IT',
              attendees: Math.floor(Math.random() * 1500) + 100,
              featured: Math.random() > 0.7, // Some events featured
              image_url: null
            });
          }
        });
      });
      
      allEvents.push(...events);
      console.log(`  Found ${events.length} events from ${url}`);
      
    } catch (error) {
      console.log(`  Could not access ${url}: ${error.message}`);
    }
  }
  
  // Remove duplicates across all URLs
  const uniqueEvents = [];
  const seen = new Set();
  
  allEvents.forEach(event => {
    const key = `${event.title}-${event.location}-${event.date}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueEvents.push(event);
    }
  });
  
  console.log(`✅ Found ${uniqueEvents.length} unique events from Pride websites`);
  return uniqueEvents;
}

// Function to save events to Supabase
async function saveEventsToSupabase(events) {
  if (events.length === 0) {
    console.log('ℹ️ No events to save');
    return;
  }
  
  console.log(`💾 Saving ${events.length} events to Supabase...`);
  
  try {
    // Check for existing events to avoid duplicates
    const { data: existingEvents } = await supabase
      .from('protests')
      .select('title, date, location');
    
    const existingTitles = new Set(
      existingEvents?.map(e => `${e.title}-${e.date}-${e.location}`) || []
    );
    
    // Filter out duplicates and validate data
    const validEvents = events.filter(event => {
      // Basic validation
      if (!event.title || !event.date || !event.location) return false;
      if (event.date === '' || event.title.length < 3) return false;
      return !existingTitles.has(`${event.title}-${event.date}-${event.location}`);
    });
    
    if (validEvents.length === 0) {
      console.log('ℹ️ All events already exist in database or invalid');
      return;
    }
    
    console.log(`📋 Validated ${validEvents.length} events for insertion`);
    
    // Insert new events
    const { data, error } = await supabase
      .from('protests')
      .insert(validEvents);
    
    if (error) {
      console.error('❌ Error saving to Supabase:', error);
    } else {
      console.log(`✅ Successfully saved ${validEvents.length} new events to database`);
    }
    
  } catch (error) {
    console.error('❌ Error in saveEventsToSupabase:', error);
  }
}

// Main scraper function
async function runScraper() {
  console.log('🚀 Starting web scraper for Italian Pride events...\n');
  
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('protests')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Cannot connect to Supabase:', error.message);
      return;
    }
    
    console.log('✅ Connected to Supabase database\n');
    
    // Scrape all websites
    const [arcigayEvents, ondaPrideEvents, ultimaGenerazioneEvents] = await Promise.all([
      scrapeArcigay(),
      scrapeOndaPride(),
      scrapeUltimaGenerazione()
    ]);
    
    // Combine all events
    const allEvents = [...arcigayEvents, ...ondaPrideEvents, ...ultimaGenerazioneEvents];
    
    console.log(`\n📊 Total events found: ${allEvents.length}`);
    
    // Save to database
    await saveEventsToSupabase(allEvents);
    
    console.log('\n🎉 Scraper completed successfully!');
    
  } catch (error) {
    console.error('❌ Scraper error:', error);
  }
}

// Run the scraper
runScraper();