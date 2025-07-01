#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test inserting a simple event
async function testInsert() {
  console.log('🧪 Testing scraper database insertion...');
  
  const testEvent = {
    title: 'Test Manifestazione per il Clima',
    description: 'Evento di test per verificare il funzionamento del scraper italiano.',
    category: 'environment',
    city: 'Milano, Italy',
    address: 'Piazza Duomo, Milano',
    latitude: '45.4642',
    longitude: '9.1900',
    date: '2025-08-15',
    time: '18:00',
    image_url: 'https://images.unsplash.com/photo-1569163139394-de44cb4e4ddb?w=500&h=300&fit=crop&auto=format',
    country_code: 'IT',
    featured: false,
    attendees: 0,
    source_name: 'test-scraper',
    source_url: 'https://test.com',
    scraped_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('protests')
      .insert([testEvent])
      .select();
    
    if (error) {
      console.error('❌ Error inserting test event:', error);
      return false;
    }
    
    console.log('✅ Test event inserted successfully:', data[0].id);
    return true;
    
  } catch (error) {
    console.error('❌ Exception during test:', error);
    return false;
  }
}

// Check current database schema
async function checkSchema() {
  console.log('🔍 Checking database schema...');
  
  try {
    const { data, error } = await supabase
      .from('protests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error checking schema:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('📋 Available fields:', Object.keys(data[0]));
    } else {
      console.log('📋 No data found, but table exists');
    }
    
  } catch (error) {
    console.error('❌ Exception checking schema:', error);
  }
}

async function main() {
  await checkSchema();
  await testInsert();
}

main().catch(console.error);