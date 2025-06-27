#!/usr/bin/env node

import { load } from 'cheerio';
import axios from 'axios';

// Test scraper to examine Ultima Generazione website structure
async function testUltimaGenerazioneStructure() {
  console.log('🔍 Testing Ultima Generazione website structure...\n');
  
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
    
    console.log('📄 Page title:', $('title').text());
    console.log('📝 Page description:', $('meta[name="description"]').attr('content'));
    console.log('\n🔍 Looking for event containers...\n');
    
    // Test different selectors to find actual events
    const selectors = [
      '.event', '.evento', 'article', '.post', '.wp-block-post', 
      '.entry', '.item', '.card', '[class*="event"]', '[class*="evento"]',
      '.grid-item', '.blog-post', '.news-item', '.event-item',
      '.wp-block-group', '.wp-block-column'
    ];
    
    let eventCount = 0;
    selectors.forEach(selector => {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`📊 Found ${elements.length} elements with selector: ${selector}`);
        
        // Examine first few elements
        elements.slice(0, 3).each((index, element) => {
          const $element = $(element);
          
          const title = $element.find('h1, h2, h3, h4, .title, .entry-title, .post-title').first().text().trim();
          const date = $element.find('.date, .data, .when, time, [class*="date"]').first().text().trim();
          const location = $element.find('.location, .dove, .place, .venue, .city, [class*="location"]').first().text().trim();
          const content = $element.text().trim().substring(0, 200);
          
          console.log(`  📌 Element ${index + 1}:`);
          console.log(`     Title: ${title || 'NOT FOUND'}`);
          console.log(`     Date: ${date || 'NOT FOUND'}`);
          console.log(`     Location: ${location || 'NOT FOUND'}`);
          console.log(`     Content preview: ${content.replace(/\s+/g, ' ')}`);
          console.log(`     Classes: ${$element.attr('class') || 'NONE'}\n`);
          
          if (title && title.length > 5) eventCount++;
        });
      }
    });
    
    console.log(`\n📊 Total potential events found: ${eventCount}`);
    
    // Look for specific date/location patterns in the raw HTML
    console.log('\n🔍 Analyzing HTML structure for date/location patterns...\n');
    
    const htmlContent = response.data;
    
    // Look for common Italian date patterns
    const datePatterns = [
      /\d{1,2}\/\d{1,2}\/\d{4}/g,
      /\d{1,2}-\d{1,2}-\d{4}/g,
      /\d{1,2}\.\d{1,2}\.\d{4}/g,
      /\d{1,2}\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+\d{4}/gi
    ];
    
    datePatterns.forEach((pattern, index) => {
      const matches = htmlContent.match(pattern);
      if (matches && matches.length > 0) {
        console.log(`📅 Date pattern ${index + 1} found ${matches.length} matches:`, matches.slice(0, 5));
      }
    });
    
    // Look for Italian city names
    const cityPattern = /(Roma|Milano|Napoli|Torino|Palermo|Genova|Bologna|Firenze|Bari|Catania|Venezia|Verona|Messina|Padova|Trieste|Brescia|Taranto|Prato|Parma|Modena|Reggio)/gi;
    const cityMatches = htmlContent.match(cityPattern);
    if (cityMatches && cityMatches.length > 0) {
      const uniqueCities = [...new Set(cityMatches.map(city => city.toLowerCase()))];
      console.log(`🏙️ Italian cities found: ${uniqueCities.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing website:', error.message);
  }
}

// Run the test
testUltimaGenerazioneStructure();