#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test parsing Italian date/time
function parseItalianDateTime(dateTimeString) {
  if (!dateTimeString || dateTimeString.trim().length === 0) {
    return { date: null, time: null };
  }
  
  const cleanDateTimeString = dateTimeString.toLowerCase().trim();
  console.log(`🕐 Parsing date/time: "${cleanDateTimeString}"`);
  
  let date = null;
  let time = null;
  
  // Extract time first (HH:MM format)
  const timeMatch = cleanDateTimeString.match(/(\d{1,2})[:\.](\d{2})/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2];
    time = `${hours}:${minutes}`;
    console.log(`⏰ Extracted time: ${time}`);
  }
  
  // Extract date
  // Try DD/MM/YYYY or DD-MM-YYYY format
  let dateMatch = cleanDateTimeString.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = dateMatch[3];
    date = `${year}-${month}-${day}`;
    console.log(`📅 Extracted date (DD/MM/YYYY): ${date}`);
    return { date, time };
  }
  
  // Try DD/MM format (assume current year)
  dateMatch = cleanDateTimeString.match(/(\d{1,2})[\/\-\.](\d{1,2})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = new Date().getFullYear();
    date = `${year}-${month}-${day}`;
    console.log(`📅 Extracted date (DD/MM): ${date}`);
    return { date, time };
  }
  
  return { date, time };
}

// Test date/time parsing
async function testDateTimeParsing() {
  console.log('🧪 Testing Date/Time Parsing:');
  console.log('===============================');
  
  const testCases = [
    '15/07/2025 alle 18:30',
    '22 agosto 2025, ore 17:00',
    '5/12 - 19:45',
    'sabato 10 novembre alle 14:30',
    '28/02/2025',
    'martedì ore 20:00',
    '',
    null
  ];
  
  testCases.forEach(testCase => {
    console.log(`\nInput: "${testCase}"`);
    const result = parseItalianDateTime(testCase);
    console.log(`Output: date="${result.date}", time="${result.time}"`);
  });
}

// Test single source scraping
async function testSingleSource() {
  console.log('\n🧪 Testing Single Source Scraping:');
  console.log('===================================');
  
  const testUrl = 'https://www.globalproject.info/it/tags/news/menu';
  
  try {
    console.log(`🔍 Fetching: ${testUrl}`);
    
    const response = await axios.get(testUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = load(response.data);
    console.log(`📄 Page loaded successfully. Title: ${$('title').text()}`);
    
    // Test event extraction
    const articles = $('article, .post, .news, .item').slice(0, 3);
    console.log(`📊 Found ${articles.length} potential event elements`);
    
    articles.each((i, element) => {
      const $el = $(element);
      const title = $el.find('h1, h2, h3, .title').first().text().trim();
      const link = $el.find('a').first().attr('href');
      const dateText = $el.find('.date, time, .when').text().trim();
      
      console.log(`\n📋 Article ${i + 1}:`);
      console.log(`   Title: ${title}`);
      console.log(`   Link: ${link || 'N/A'}`);
      console.log(`   Date: ${dateText || 'N/A'}`);
      
      if (dateText) {
        const { date, time } = parseItalianDateTime(dateText);
        console.log(`   Parsed: ${date || 'N/A'} at ${time || 'N/A'}`);
      }
    });
    
  } catch (error) {
    console.error(`❌ Error testing single source: ${error.message}`);
  }
}

// Test database connection
async function testDatabase() {
  console.log('\n🧪 Testing Database Connection:');
  console.log('================================');
  
  try {
    const { data, error } = await supabase
      .from('protests')
      .select('id, title, event_url')
      .limit(3);
    
    if (error) {
      console.error('❌ Database error:', error);
    } else {
      console.log(`✅ Database connected. Found ${data.length} protests`);
      data.forEach((protest, i) => {
        console.log(`   ${i + 1}. ${protest.title} (URL: ${protest.event_url || 'N/A'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

// Run all tests
async function runTests() {
  await testDateTimeParsing();
  await testDatabase();
  await testSingleSource();
  
  console.log('\n🎉 Testing completed!');
}

runTests().catch(console.error);