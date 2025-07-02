import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check existing events
    const { data: existingEvents, error: readError } = await supabase
      .from('protests')
      .select('*')
      .limit(5);
      
    if (readError) {
      console.error('❌ Error reading from database:', readError);
      return;
    }
    
    console.log(`📊 Found ${existingEvents?.length || 0} existing events in database`);
    
    // Test 2: Try to insert a test event
    const testEvent = {
      title: 'Test Event - Precise Geocoding Demo',
      description: 'Test event to verify enhanced geocoding system',
      category: 'OTHER',
      city: 'Milano',
      address: 'Piazza del Duomo',
      latitude: '45.4641943',
      longitude: '9.1896346',
      date: '2025-07-15',
      time: '18:00',
      image_url: 'https://images.unsplash.com/photo-1573152958734-1922c188fba3?w=800&h=600&fit=crop',
      event_type: 'Protest',
      event_url: 'https://example.com/test',
      country_code: 'IT',
      featured: false,
      attendees: 0,
      source_name: 'test-scraper',
      source_url: 'https://example.com',
      scraped_at: new Date().toISOString()
    };
    
    console.log('💾 Attempting to save test event...');
    
    const { data, error } = await supabase
      .from('protests')
      .insert([testEvent])
      .select();
      
    if (error) {
      console.error('❌ Error saving test event:', error);
      return;
    }
    
    console.log(`✅ Test event saved successfully! ID: ${data[0].id}`);
    console.log(`📍 Event coordinates: ${data[0].latitude}, ${data[0].longitude}`);
    
    // Test 3: Verify the event was saved
    const { data: verifyData, error: verifyError } = await supabase
      .from('protests')
      .select('*')
      .eq('id', data[0].id);
      
    if (verifyError) {
      console.error('❌ Error verifying saved event:', verifyError);
      return;
    }
    
    console.log(`🎯 Verification: Event "${verifyData[0].title}" exists in database`);
    console.log(`📍 Address: ${verifyData[0].address}, ${verifyData[0].city}`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabaseConnection();