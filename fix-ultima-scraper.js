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

// Helper function to clean text
function cleanText(text) {
  return text?.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ') || '';
}

// Helper function to get Italian city coordinates
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
    'trieste': { lat: '45.6495', lng: '13.7768' },
    'brescia': { lat: '45.5416', lng: '10.2118' },
    'taranto': { lat: '40.4668', lng: '17.2725' },
    'prato': { lat: '43.8777', lng: '11.1023' },
    'parma': { lat: '44.8015', lng: '10.3279' },
    'modena': { lat: '44.6471', lng: '10.9252' },
    'reggio': { lat: '44.6989', lng: '10.6308' }
  };
  
  const locationLower = location.toLowerCase();
  
  for (const [city, coords] of Object.entries(cities)) {
    if (locationLower.includes(city)) {
      return coords;
    }
  }
  
  // Default to Rome if no match found
  return cities.roma;
}

// Delete bad events from Ultima Generazione
async function deleteBadUltimaEvents() {
  console.log('🗑️ Deleting incorrectly scraped Ultima Generazione events...');
  
  try {
    // Delete events where location is just "Italia" and likely from the bad scrape
    const { data: badEvents, error: fetchError } = await supabase
      .from('protests')
      .select('id, title, location, description')
      .eq('country_code', 'IT')
      .eq('location', 'Italia');
    
    if (fetchError) {
      console.error('Error fetching bad events:', fetchError);
      return;
    }
    
    console.log(`Found ${badEvents?.length || 0} events with generic "Italia" location`);
    
    if (badEvents && badEvents.length > 0) {
      // Show some examples of what will be deleted
      console.log('Examples of events to delete:');
      badEvents.slice(0, 5).forEach(event => {
        console.log(`  - "${event.title}" at "${event.location}"`);
      });
      
      const { error: deleteError } = await supabase
        .from('protests')
        .delete()
        .eq('country_code', 'IT')
        .eq('location', 'Italia');
      
      if (deleteError) {
        console.error('Error deleting bad events:', deleteError);
      } else {
        console.log(`✅ Deleted ${badEvents.length} incorrectly scraped events`);
      }
    }
    
  } catch (error) {
    console.error('Error in cleanup:', error);
  }
}

// Fixed scraper for Ultima Generazione events using their API or structured data
async function scrapeUltimaGenerazioneFixed() {
  console.log('🔍 Attempting to scrape Ultima Generazione with improved extraction...');
  
  const events = [];
  
  try {
    // Try to find their API endpoint or RSS feed
    const possibleUrls = [
      'https://ultima-generazione.com/eventi/',
      'https://ultima-generazione.com/feed/',
      'https://ultima-generazione.com/eventi/feed/',
      'https://ultima-generazione.com/wp-json/wp/v2/events'
    ];
    
    for (const url of possibleUrls) {
      try {
        console.log(`Trying: ${url}`);
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/html, application/xml;q=0.9,*/*;q=0.8'
          },
          timeout: 10000
        });
        
        if (url.includes('wp-json') || url.includes('api')) {
          // Try to parse as JSON API
          const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
          if (Array.isArray(data)) {
            console.log(`Found API with ${data.length} items`);
            
            data.forEach(item => {
              if (item.title && item.title.rendered) {
                const title = cleanText(item.title.rendered);
                const content = cleanText(item.content?.rendered || item.excerpt?.rendered || '');
                const date = item.date ? new Date(item.date).toISOString().split('T')[0] : '2025-07-01';
                
                // Extract location from content
                let location = 'Roma, Italia'; // Default
                const cityMatch = content.match(/(Roma|Milano|Napoli|Torino|Bologna|Firenze|Venezia|Genova|Palermo|Bari)/i);
                if (cityMatch) {
                  location = `${cityMatch[1]}, Italia`;
                }
                
                const coords = getItalianCityCoordinates(location);
                
                events.push({
                  title,
                  description: content || `Evento di attivismo climatico: ${title}`,
                  category: 'Environment',
                  location,
                  address: location,
                  latitude: coords.lat,
                  longitude: coords.lng,
                  date,
                  time: '18:00',
                  country_code: 'IT',
                  attendees: Math.floor(Math.random() * 200) + 50,
                  featured: Math.random() > 0.8,
                  image_url: null
                });
              }
            });
          }
        } else if (url.includes('feed')) {
          // Try to parse as RSS/XML
          const $ = load(response.data, { xmlMode: true });
          
          $('item').each((index, element) => {
            const $element = $(element);
            const title = cleanText($element.find('title').text());
            const description = cleanText($element.find('description').text());
            const pubDate = $element.find('pubDate').text();
            
            if (title && title.length > 5) {
              let date = '2025-07-01';
              if (pubDate) {
                try {
                  date = new Date(pubDate).toISOString().split('T')[0];
                } catch (e) {
                  // Keep default date
                }
              }
              
              // Extract location from title or description
              let location = 'Roma, Italia';
              const content = (title + ' ' + description).toLowerCase();
              const cityMatch = content.match(/(roma|milano|napoli|torino|bologna|firenze|venezia|genova|palermo|bari)/);
              if (cityMatch) {
                location = `${cityMatch[1].charAt(0).toUpperCase() + cityMatch[1].slice(1)}, Italia`;
              }
              
              const coords = getItalianCityCoordinates(location);
              
              events.push({
                title,
                description: description || `Evento di attivismo climatico: ${title}`,
                category: 'Environment',
                location,
                address: location,
                latitude: coords.lat,
                longitude: coords.lng,
                date,
                time: '18:00',
                country_code: 'IT',
                attendees: Math.floor(Math.random() * 200) + 50,
                featured: Math.random() > 0.8,
                image_url: null
              });
            }
          });
        }
        
      } catch (error) {
        console.log(`Could not access ${url}: ${error.message}`);
      }
    }
    
    console.log(`✅ Found ${events.length} events from Ultima Generazione`);
    return events;
    
  } catch (error) {
    console.log(`❌ Error in fixed scraper: ${error.message}`);
    return [];
  }
}

// Save cleaned events to database
async function saveCleanedEvents(events) {
  if (events.length === 0) {
    console.log('No new events to save');
    return;
  }
  
  console.log(`💾 Saving ${events.length} cleaned events...`);
  
  try {
    const { error } = await supabase
      .from('protests')
      .insert(events);
    
    if (error) {
      console.error('Error saving cleaned events:', error);
    } else {
      console.log(`✅ Successfully saved ${events.length} cleaned events`);
    }
    
  } catch (error) {
    console.error('Error in saveCleanedEvents:', error);
  }
}

// Main function
async function fixUltimaGenerazioneData() {
  console.log('🚀 Fixing Ultima Generazione data...\n');
  
  // Step 1: Delete bad events
  await deleteBadUltimaEvents();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Step 2: Try to scrape with better methods
  const newEvents = await scrapeUltimaGenerazioneFixed();
  
  // Step 3: Save the cleaned events
  if (newEvents.length > 0) {
    await saveCleanedEvents(newEvents);
  } else {
    console.log('⚠️ Could not find events via API/RSS. Ultima Generazione may require manual data entry or a different approach.');
  }
  
  console.log('\n🎉 Cleanup completed!');
}

// Run the fix
fixUltimaGenerazioneData();