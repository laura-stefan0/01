#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addEventUrlField() {
  console.log('🔧 Adding event_url field to protests table...');
  
  try {
    // First check if the field already exists by attempting to select it
    const { data, error } = await supabase
      .from('protests')
      .select('event_url')
      .limit(1);
    
    if (error && error.code === '42703') {
      console.log('📋 event_url field does not exist, would need to be added via SQL');
      console.log('💡 The field will be automatically handled by the scraper');
    } else if (error) {
      console.error('❌ Error checking field:', error);
    } else {
      console.log('✅ event_url field already exists in the table');
    }
    
    // Test insert with event_url field
    const testData = {
      title: 'Test Event URL Field',
      description: 'Testing event_url field functionality',
      category: 'other',
      city: 'Milano',
      address: 'Milano, Italy',
      latitude: '45.4642',
      longitude: '9.1900',
      date: '2025-12-31',
      time: '23:59',
      image_url: 'https://example.com/test.jpg',
      event_url: 'https://example.com/test-event',
      country_code: 'IT',
      featured: false,
      attendees: 0,
      source_name: 'test',
      source_url: 'https://test.com'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('protests')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Error testing insert:', insertError);
    } else {
      console.log('✅ Successfully tested event_url field insertion');
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('protests')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.error('⚠️ Error cleaning up test data:', deleteError);
      } else {
        console.log('🧹 Test data cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addEventUrlField().catch(console.error);