
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseInsert() {
  console.log('🔍 Testing database insert capability...');

  // Create a test event
  const testEvent = {
    title: 'Test Event - Database Verification',
    description: 'This is a test event to verify the database insert functionality is working correctly.',
    category: 'OTHER',
    location: 'Milano',
    address: 'Piazza del Duomo, Milano',
    latitude: '45.4642',
    longitude: '9.1900',
    date: '2025-07-15',
    time: '18:00',
    image_url: 'https://images.unsplash.com/photo-1573152958734-1922c188fba3?w=500&h=300&fit=crop&auto=format',
    event_type: 'Other',
    event_url: 'https://example.com/test-event',
    country_code: 'IT',
    featured: false,
    attendees: 0,
    source_name: 'test-script',
    source_url: 'https://example.com'
  };

  try {
    console.log('💾 Attempting to insert test event...');
    
    const { data, error } = await supabase
      .from('protests')
      .insert([testEvent])
      .select();

    if (error) {
      console.error('❌ Database insert error:', error);
      console.error('Error details:', {
        message: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code
      });
      return false;
    }

    console.log('✅ Test event inserted successfully!');
    console.log('📋 Event data:', data[0]);
    
    // Now try to fetch it back
    const { data: fetchedEvents, error: fetchError } = await supabase
      .from('protests')
      .select('*')
      .eq('source_name', 'test-script');

    if (fetchError) {
      console.error('❌ Error fetching events:', fetchError);
      return false;
    }

    console.log('✅ Successfully fetched back test events:', fetchedEvents.length);
    return true;

  } catch (error) {
    console.error('❌ Exception during database test:', error);
    return false;
  }
}

// Run the test
testDatabaseInsert().then(success => {
  if (success) {
    console.log('\n🎉 Database insert test completed successfully!');
    console.log('The database connection and insert functionality is working correctly.');
    console.log('The issue with the scraper might be in the event detection or data formatting.');
  } else {
    console.log('\n❌ Database insert test failed!');
    console.log('There is an issue with the database configuration or permissions.');
  }
}).catch(error => {
  console.error('❌ Test script error:', error);
});
