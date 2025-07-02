import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function quickTestScraper() {
  console.log('🚀 Quick Test Scraper - Finding Real Events...');
  
  const sources = [
    { url: 'http://globalproject.info/', name: 'globalproject.info' },
    { url: 'http://dinamopress.it/', name: 'dinamopress.it' }
  ];
  
  let totalEvents = 0;
  
  for (const source of sources) {
    console.log(`\n🔍 Scraping ${source.name}...`);
    
    try {
      const response = await axios.get(source.url, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      
      const $ = load(response.data);
      const items = $('.item, .post, article, .entry').slice(0, 3); // Just test 3 items per source
      
      console.log(`📊 Found ${items.length} potential items`);
      
      for (let i = 0; i < items.length; i++) {
        const $el = $(items[i]);
        let title = $el.find('h1, h2, h3, .title').first().text().trim();
        
        if (!title) {
          title = $el.text().slice(0, 100).trim();
        }
        
        if (title.length > 10) {
          // Create a simple event with required fields
          const event = {
            title: title.slice(0, 200),
            description: `Event from ${source.name}: ${title.slice(0, 300)}`,
            category: 'CIVIL & HUMAN RIGHTS',
            city: 'Milano',
            address: 'Piazza del Duomo, Milano',
            latitude: '45.4642',
            longitude: '9.1900',
            date: '2025-07-15',
            time: '18:00',
            country_code: 'IT',
            event_type: 'Protest',
            featured: false,
            attendees: 0
          };
          
          const { data, error } = await supabase
            .from('protests')
            .insert(event)
            .select();
            
          if (error) {
            console.log(`❌ Error saving "${title.slice(0, 50)}...": ${error.message}`);
          } else {
            console.log(`✅ Saved event: "${title.slice(0, 50)}..."`);
            totalEvents++;
          }
          
          // Small delay
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
    } catch (error) {
      console.log(`❌ Error with ${source.name}: ${error.message}`);
    }
  }
  
  console.log(`\n🎉 Test completed! Saved ${totalEvents} events total.`);
  
  // Check how many events are now in the database
  const { data: allEvents } = await supabase.from('protests').select('id').limit(50);
  console.log(`📊 Total events in database: ${allEvents.length}`);
}

quickTestScraper();