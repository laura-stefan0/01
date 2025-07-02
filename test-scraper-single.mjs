import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSingleSource() {
  console.log('🧪 Testing single source...');
  
  try {
    // Test database connection first
    const { data: existingEvents, error: queryError } = await supabase
      .from('protests')
      .select('id, title')
      .limit(5);
      
    if (queryError) {
      console.error('❌ Database query error:', queryError);
      return;
    }
    
    console.log(`✅ Database connected - found ${existingEvents.length} existing events`);
    
    // Try to fetch globalproject.info
    const response = await axios.get('http://globalproject.info/', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`✅ Fetched globalproject.info - status: ${response.status}`);
    
    const $ = load(response.data);
    const items = $('.item');
    console.log(`📊 Found ${items.length} .item elements`);
    
    // Try to insert a simple test event with city field
    const testEvent = {
      title: 'Test Event from Scraper',
      description: 'Test description',
      category: 'OTHER',
      city: 'Milano',
      address: 'Test Address, Milano',
      latitude: '45.4642',
      longitude: '9.1900',
      date: '2025-07-10',
      time: '18:00',
      country_code: 'IT',
      event_type: 'Protest',
      featured: false,
      attendees: 0
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('protests')
      .insert(testEvent)
      .select();
      
    if (insertError) {
      console.error('❌ Insert error:', insertError);
    } else {
      console.log('✅ Successfully inserted test event:', insertData[0].id);
      
      // Clean up - delete the test event
      await supabase.from('protests').delete().eq('id', insertData[0].id);
      console.log('🧹 Cleaned up test event');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSingleSource();