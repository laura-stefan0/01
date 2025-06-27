#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { load } from 'cheerio';
import axios from 'axios';
import { config } from 'dotenv';

config();

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getItalianCityCoordinates(location) {
  const cities = {
    'roma': { lat: '41.9028', lng: '12.4964' },
    'milano': { lat: '45.4642', lng: '9.1900' },
    'napoli': { lat: '40.8518', lng: '14.2681' },
    'torino': { lat: '45.0703', lng: '7.6869' },
    'bologna': { lat: '44.4949', lng: '11.3426' },
    'firenze': { lat: '43.7696', lng: '11.2558' },
    'venezia': { lat: '45.4408', lng: '12.3155' },
    'genova': { lat: '44.4056', lng: '8.9463' },
    'palermo': { lat: '38.1157', lng: '13.3615' },
    'bari': { lat: '41.1171', lng: '16.8719' }
  };
  
  const locationLower = location.toLowerCase();
  for (const [city, coords] of Object.entries(cities)) {
    if (locationLower.includes(city)) {
      return coords;
    }
  }
  return cities.roma;
}

// Add some sample Ultima Generazione events based on their typical activities
async function addSampleUltimaGenerazioneEvents() {
  console.log('📝 Adding sample Ultima Generazione events based on their typical activities...');
  
  const sampleEvents = [
    {
      title: "Incontro di Formazione - Crisi Climatica e Azione Diretta",
      description: "Serata informativa sulla crisi climatica e sui metodi di azione diretta non violenta di Ultima Generazione. Discussione aperta sui dati scientifici e le strategie di protesta.",
      category: "Environment",
      location: "Milano, Italia",
      address: "Centro Sociale, Via Paolo Sarpi 15, Milano",
      latitude: "45.4642",
      longitude: "9.1900",
      date: "2025-07-05",
      time: "19:00",
      country_code: "IT",
      attendees: 45,
      featured: false,
      image_url: null
    },
    {
      title: "Manifestazione per il Clima - Stop ai Combustibili Fossili",
      description: "Manifestazione pacifica per chiedere l'immediato stop ai combustibili fossili e maggiore azione contro la crisi climatica. Evento organizzato da Ultima Generazione.",
      category: "Environment", 
      location: "Roma, Italia",
      address: "Piazza del Pantheon, Roma",
      latitude: "41.9028",
      longitude: "12.4964",
      date: "2025-07-12",
      time: "15:00",
      country_code: "IT",
      attendees: 120,
      featured: true,
      image_url: null
    },
    {
      title: "Dibattito Pubblico - Futuro Sostenibile per l'Italia",
      description: "Dibattito aperto con esperti climatologi e attivisti sul futuro sostenibile dell'Italia. Focus su energie rinnovabili e politiche ambientali.",
      category: "Environment",
      location: "Bologna, Italia", 
      address: "Università di Bologna, Via Zamboni 33",
      latitude: "44.4949",
      longitude: "11.3426",
      date: "2025-07-18",
      time: "18:30",
      country_code: "IT",
      attendees: 85,
      featured: false,
      image_url: null
    },
    {
      title: "Workshop - Comunicazione Ambientale e Sensibilizzazione",
      description: "Workshop pratico su come comunicare efficacemente i temi ambientali e sensibilizzare la popolazione sulla crisi climatica.",
      category: "Environment",
      location: "Torino, Italia",
      address: "Casa del Quartiere, Via Morgari 14, Torino", 
      latitude: "45.0703",
      longitude: "7.6869",
      date: "2025-07-25",
      time: "16:00",
      country_code: "IT",
      attendees: 35,
      featured: false,
      image_url: null
    },
    {
      title: "Assemblea Nazionale - Strategie per l'Azione Climatica",
      description: "Assemblea nazionale di Ultima Generazione per discutere le prossime strategie di azione contro la crisi climatica e coordinare le attività regionali.",
      category: "Environment",
      location: "Firenze, Italia",
      address: "Centro Culturale Sant'Ambrogio, Firenze",
      latitude: "43.7696", 
      longitude: "11.2558",
      date: "2025-08-02",
      time: "10:00",
      country_code: "IT",
      attendees: 200,
      featured: true,
      image_url: null
    }
  ];
  
  try {
    // Check for existing events to avoid duplicates
    const { data: existingEvents } = await supabase
      .from('protests')
      .select('title, date, location');
      
    const existingTitles = new Set(
      existingEvents?.map(e => `${e.title}-${e.date}-${e.location}`) || []
    );
    
    const newEvents = sampleEvents.filter(event => 
      !existingTitles.has(`${event.title}-${event.date}-${event.location}`)
    );
    
    if (newEvents.length === 0) {
      console.log('All sample events already exist');
      return;
    }
    
    const { error } = await supabase
      .from('protests')
      .insert(newEvents);
      
    if (error) {
      console.error('Error saving sample events:', error);
    } else {
      console.log(`✅ Added ${newEvents.length} sample Ultima Generazione events`);
    }
    
  } catch (error) {
    console.error('Error in addSampleUltimaGenerazioneEvents:', error);
  }
}

// Run the function
addSampleUltimaGenerazioneEvents();