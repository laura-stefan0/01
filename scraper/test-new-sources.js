#!/usr/bin/env node

import axios from 'axios';
import { load } from 'cheerio';

// Test the new sources
const NEW_SOURCES = [
  { url: 'https://adlcobas.it/', name: 'adlcobas.it' },
  { url: 'https://www.notav.info/', name: 'notav.info' }
];

async function testNewSources() {
  console.log('🧪 Testing New Scraper Sources');
  console.log('==============================\n');

  for (const source of NEW_SOURCES) {
    console.log(`🔍 Testing: ${source.name}`);
    console.log(`🌐 URL: ${source.url}`);
    
    try {
      const response = await axios.get(source.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = load(response.data);
      
      console.log(`✅ Website accessible`);
      console.log(`📄 Page title: ${$('title').text()}`);
      
      // Look for potential event elements
      const eventElements = $('article, .post, .news, .item, .event, h2, h3').slice(0, 5);
      console.log(`📊 Found ${eventElements.length} potential content elements`);
      
      eventElements.each((i, element) => {
        const $el = $(element);
        const title = $el.text().trim().substring(0, 80);
        const link = $el.find('a').first().attr('href') || $el.closest('a').attr('href');
        
        if (title.length > 10) {
          console.log(`   ${i + 1}. ${title}${title.length > 79 ? '...' : ''}`);
          if (link) {
            console.log(`      🔗 ${link}`);
          }
        }
      });
      
      // Check for pagination elements
      const paginationElements = $('a[href*="page"], .pagination a, .next, .load-more').length;
      console.log(`📄 Pagination elements found: ${paginationElements}`);
      
    } catch (error) {
      console.error(`❌ Error testing ${source.name}: ${error.message}`);
    }
    
    console.log('---\n');
  }
  
  console.log('🎉 Testing completed!');
}

testNewSources().catch(console.error);