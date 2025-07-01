#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Demonstrate all enhanced scraper features
 */
async function demonstrateEnhancedFeatures() {
  console.log('🎯 Demonstrating Enhanced Italian Protest Scraper Features');
  console.log('========================================================\n');

  // 1. Title Cleaning Demo
  console.log('1️⃣ TITLE CLEANING DEMONSTRATION');
  console.log('--------------------------------');
  
  const testTitles = [
    '15/07 Venezia - Assemblea',
    '"Fermiamo la guerra!"',
    'Milano - Manifestazione per il clima',
    'Piazza Duomo - Presidio per i diritti',
    '22/08/2025 Roma - Corteo studentesco'
  ];
  
  testTitles.forEach(title => {
    const cleaned = cleanTitle(title);
    console.log(`Input:  "${title}"`);
    console.log(`Output: "${cleaned}"`);
    console.log('---');
  });

  // 2. Date/Time Parsing Demo
  console.log('\n2️⃣ DATE/TIME PARSING DEMONSTRATION');
  console.log('-----------------------------------');
  
  const dateTimeTests = [
    '15/07/2025 alle 18:30',
    '22 agosto 2025, ore 17:00',
    '5/12 - 19:45',
    '28/02/2025',
    'martedì ore 20:00'
  ];
  
  dateTimeTests.forEach(dateTime => {
    const parsed = parseItalianDateTime(dateTime);
    console.log(`Input:  "${dateTime}"`);
    console.log(`Date:   ${parsed.date || 'N/A'}`);
    console.log(`Time:   ${parsed.time || 'N/A'}`);
    console.log('---');
  });

  // 3. Database Integration Demo
  console.log('\n3️⃣ DATABASE INTEGRATION DEMONSTRATION');
  console.log('--------------------------------------');
  
  try {
    const { data, error } = await supabase
      .from('protests')
      .select('id, title, date, time, city, event_url')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Database error:', error);
    } else {
      console.log(`✅ Database connected. Recent events (${data.length}):`);
      data.forEach((event, i) => {
        console.log(`   ${i + 1}. "${event.title}"`);
        console.log(`      📅 ${event.date || 'N/A'} ⏰ ${event.time || 'N/A'}`);
        console.log(`      📍 ${event.city}`);
        console.log(`      🔗 ${event.event_url || 'No URL'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }

  // 4. Feature Summary
  console.log('\n4️⃣ ENHANCED FEATURES SUMMARY');
  console.log('-----------------------------');
  console.log('✅ Pagination Support - Automatically follows multiple pages');
  console.log('✅ Enhanced Address Extraction - Gets full street addresses');
  console.log('✅ Improved Time Parsing - Extracts actual times or null');
  console.log('✅ Event URL Extraction - Links to detailed event pages');
  console.log('✅ Title Cleaning - Removes dates, locations, and quotes');
  console.log('✅ Deep Content Analysis - Fetches details from event pages');
  console.log('✅ Comprehensive Logging - Detailed progress tracking');
  console.log('✅ Database Integration - event_url field support');
  console.log('✅ Smart Deduplication - Advanced duplicate detection');
  console.log('✅ Rate Limiting - Respectful scraping with delays\n');

  console.log('🎉 Enhanced Italian Protest Scraper is ready for production use!');
  console.log('📋 Run "node enhanced-italian-scraper.js" to start scraping');
}

// Helper functions for demo
function cleanTitle(title) {
  if (!title) return '';
  
  let cleanedTitle = title.trim();
  
  // Remove date patterns at the beginning
  cleanedTitle = cleanedTitle.replace(/^\d{1,2}[\/\-\.]\d{1,2}(\/{1,2}\d{2,4})?\s*[\-–]?\s*/, '');
  
  // Remove city patterns
  const cityPattern = /^(roma|milano|napoli|torino|venezia|bologna|firenze)\s*[\-–]?\s*/i;
  cleanedTitle = cleanedTitle.replace(cityPattern, '');
  
  // Remove location patterns
  cleanedTitle = cleanedTitle.replace(/^(piazza|via|corso|viale|largo|ponte)\s+[^-–]+[\-–]\s*/i, '');
  
  // Remove quotes
  cleanedTitle = cleanedTitle.replace(/^["""]/, '').replace(/["""]$/, '');
  
  // Remove extra spaces and dashes
  cleanedTitle = cleanedTitle.replace(/^[\s\-–]+/, '');
  
  // Capitalize first letter
  if (cleanedTitle.length > 0) {
    cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);
  }
  
  return cleanedTitle.trim();
}

function parseItalianDateTime(dateTimeString) {
  if (!dateTimeString) return { date: null, time: null };
  
  const cleanDateTimeString = dateTimeString.toLowerCase().trim();
  let date = null;
  let time = null;
  
  // Extract time
  const timeMatch = cleanDateTimeString.match(/(\d{1,2})[:\.](\d{2})/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2];
    time = `${hours}:${minutes}`;
  }
  
  // Extract date
  let dateMatch = cleanDateTimeString.match(/(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{4})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = dateMatch[3];
    date = `${year}-${month}-${day}`;
    return { date, time };
  }
  
  dateMatch = cleanDateTimeString.match(/(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = new Date().getFullYear();
    date = `${year}-${month}-${day}`;
  }
  
  return { date, time };
}

// Run the demonstration
demonstrateEnhancedFeatures().catch(console.error);