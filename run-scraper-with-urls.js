const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const { load } = require('cheerio');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is missing!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to extract event URL from Facebook event page
async function getEventUrl(title, location) {
  try {
    // For now, we'll create a simple Facebook search URL as a placeholder
    // In a real implementation, you'd want to scrape Facebook or use their API
    const searchQuery = encodeURIComponent(`${title} ${location}`);
    const facebookSearchUrl = `https://www.facebook.com/search/events/?q=${searchQuery}`;
    return facebookSearchUrl;
  } catch (error) {
    console.error(`❌ Error getting event URL for "${title}":`, error.message);
    return null;
  }
}

// Function to update existing events with event URLs
async function updateEventUrls() {
  try {
    console.log('🔍 Fetching all events without event_url...');

    // Get all events that don't have an event_url
    const { data: events, error } = await supabase
      .from('protests')
      .select('id, title, location')
      .is('event_url', null);

    if (error) {
      console.error('❌ Error fetching events:', error);
      return;
    }

    console.log(`📊 Found ${events.length} events without event URLs`);

    for (const event of events) {
      console.log(`🔗 Processing event: ${event.title}`);

      const eventUrl = await getEventUrl(event.title, event.location);

      if (eventUrl) {
        const { error: updateError } = await supabase
          .from('protests')
          .update({ event_url: eventUrl })
          .eq('id', event.id);

        if (updateError) {
          console.error(`❌ Error updating event ${event.id}:`, updateError);
        } else {
          console.log(`✅ Updated event: ${event.title}`);
        }
      }

      // Add a small delay to avoid overwhelming any external services
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Finished updating event URLs');
  } catch (error) {
    console.error('❌ Error in updateEventUrls:', error);
  }
}

// Run the update
updateEventUrls();