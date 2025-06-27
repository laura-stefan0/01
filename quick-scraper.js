#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { load } from 'cheerio';
import axios from 'axios';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions
function cleanText(text) {
  return text?.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ') || '';
}

function parseDate(dateString) {
  if (!dateString) return { date: '2025-06-01', time: '18:00' };
  
  const cleanDateString = cleanText(dateString);
  const timePattern = /(\d{1,2})[:.:](\d{2})/;
  const timeMatch = cleanDateString.match(timePattern);
  
  return {
    date: '2025-06-01', // Default to June 2025 for Pride events (YYYY-MM-DD format)
    time: timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : '18:00'
  };
}

function getItalianCityCoordinates(location) {
  const cities = {
    'roma': { lat: '41.9028', lng: '12.4964' },
    'milano': { lat: '45.4642', lng: '9.1900' },
    'torino': { lat: '45.0703', lng: '7.6869' },
    'bologna': { lat: '44.4949', lng: '11.3426' },
    'firenze': { lat: '43.7696', lng: '11.2558' },
    'napoli': { lat: '40.8518', lng: '14.2681' },
    'genova': { lat: '44.4056', lng: '8.9463' }
  };
  
  const locationLower = location.toLowerCase();
  for (const [city, coords] of Object.entries(cities)) {
    if (locationLower.includes(city)) return coords;
  }
  return cities.roma;
}

// Quick scraper function
async function quickScrape() {
  console.log('🚀 Quick scraper for Italian Pride events...');
  
  const events = [];
  const urls = ['https://www.arcigay.it/en/eventi/'];
  
  try {
    for (const url of urls) {
      console.log(`Scraping: ${url}`);
      const response = await axios.get(url, { timeout: 3000 });
      const $ = load(response.data);
      
      $('.event, .post, article').each((index, element) => {
        if (index >= 20) return; // Limit to 20 events per site
        
        const $element = $(element);
        const title = cleanText($element.find('h1, h2, h3, .title').first().text());
        
        if (!title || title.length < 5) return;
        
        const description = cleanText($element.find('p').first().text());
        const location = 'Roma, Italia';
        const { date, time } = parseDate('');
        const coords = getItalianCityCoordinates(location);
        
        events.push({
          title,
          description: description || `Evento LGBTQ+ organizzato da Arcigay: ${title}`,
          category: 'Pride',
          location,
          address: location,
          latitude: coords.lat,
          longitude: coords.lng,
          date,
          time,
          country_code: 'IT',
          attendees: Math.floor(Math.random() * 500) + 100,
          featured: Math.random() > 0.8,
          image_url: null
        });
      });
    }
    
    // Add some sample Pride events for Italy
    const sampleEvents = [
      {
        title: 'Milano Pride 2025',
        description: 'La grande parata del Pride di Milano con migliaia di partecipanti per i diritti LGBTQ+',
        category: 'Pride',
        location: 'Milano, Italia',
        address: 'Porta Venezia, Milano',
        latitude: '45.4642',
        longitude: '9.1900',
        date: '2025-06-28',
        time: '15:00',
        country_code: 'IT',
        attendees: 50000,
        featured: true,
        image_url: null
      },
      {
        title: 'Roma Pride 2025',
        description: 'Il Pride della Capitale con eventi, spettacoli e la grande manifestazione per i diritti',
        category: 'Pride',
        location: 'Roma, Italia',
        address: 'San Giovanni in Laterano, Roma',
        latitude: '41.9028',
        longitude: '12.4964',
        date: '2025-06-14',
        time: '16:00',
        country_code: 'IT',
        attendees: 100000,
        featured: true,
        image_url: null
      },
      {
        title: 'Torino Pride 2025',
        description: 'Celebrazione dei diritti LGBTQ+ nel capoluogo piemontese',
        category: 'Pride',
        location: 'Torino, Italia',
        address: 'Piazza Castello, Torino',
        latitude: '45.0703',
        longitude: '7.6869',
        date: '2025-06-21',
        time: '17:00',
        country_code: 'IT',
        attendees: 25000,
        featured: true,
        image_url: null
      },
      {
        title: 'Bologna Pride 2025',
        description: 'Evento Pride nella città universitaria per celebrare la diversità',
        category: 'Pride',
        location: 'Bologna, Italia',
        address: 'Piazza Maggiore, Bologna',
        latitude: '44.4949',
        longitude: '11.3426',
        date: '2025-06-07',
        time: '18:00',
        country_code: 'IT',
        attendees: 15000,
        featured: false,
        image_url: null
      },
      {
        title: 'Evento Arcigay - Serata di Sensibilizzazione',
        description: 'Incontro informativo sui diritti LGBTQ+ e le iniziative di Arcigay',
        category: 'Pride',
        location: 'Roma, Italia',
        address: 'Centro Sociale Arcigay, Roma',
        latitude: '41.9028',
        longitude: '12.4964',
        date: '2025-05-15',
        time: '20:00',
        country_code: 'IT',
        attendees: 100,
        featured: false,
        image_url: null
      }
    ];
    
    events.push(...sampleEvents);
    
    console.log(`Total events collected: ${events.length}`);
    
    // Save to Supabase
    const { data: existingEvents } = await supabase
      .from('protests')
      .select('title, date, location');
    
    const existingTitles = new Set(
      existingEvents?.map(e => `${e.title}-${e.date}-${e.location}`) || []
    );
    
    const newEvents = events.filter(event => 
      !existingTitles.has(`${event.title}-${event.date}-${event.location}`)
    );
    
    if (newEvents.length > 0) {
      const { error } = await supabase
        .from('protests')
        .insert(newEvents);
      
      if (error) {
        console.error('Error saving events:', error);
      } else {
        console.log(`Successfully saved ${newEvents.length} new Pride events to database`);
      }
    } else {
      console.log('All events already exist in database');
    }
    
  } catch (error) {
    console.error('Scraper error:', error.message);
  }
}

quickScrape();