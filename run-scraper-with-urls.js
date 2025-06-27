
#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { load } from 'cheerio';
import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to update existing events with event URLs
async function updateEventUrls() {
  console.log('🔄 Updating existing events with event URLs...');
  
  try {
    // Get all events that don't have event_url set
    const { data: events, error } = await supabase
      .from('protests')
      .select('id, title, category, description')
      .is('event_url', null)
      .eq('country_code', 'IT');
    
    if (error) {
      console.error('Error fetching events:', error);
      return;
    }
    
    console.log(`Found ${events.length} events to update with URLs`);
    
    let updatedCount = 0;
    
    for (const event of events) {
      let eventUrl = null;
      
      // Determine URL based on event category and content
      if (event.category === 'LGBTQ+' || event.title.toLowerCase().includes('pride')) {
        if (event.title.toLowerCase().includes('arcigay')) {
          eventUrl = 'https://www.arcigay.it/eventi/';
        } else if (event.title.toLowerCase().includes('milano')) {
          eventUrl = 'https://www.milanopride.it/';
        } else if (event.title.toLowerCase().includes('roma')) {
          eventUrl = 'https://www.romapride.it/';
        } else if (event.title.toLowerCase().includes('torino')) {
          eventUrl = 'https://www.torinopride.it/';
        } else {
          eventUrl = 'https://ondapride.it/';
        }
      } else if (event.category === 'Environment' || event.title.toLowerCase().includes('ultima generazione')) {
        eventUrl = 'https://ultima-generazione.com/eventi/';
      } else {
        // Generic fallback based on category
        switch (event.category) {
          case 'Civil & Human Rights':
            eventUrl = 'https://www.amnesty.it/';
            break;
          case 'Peace & Anti-War':
            eventUrl = 'https://www.pacedifesa.org/';
            break;
          case 'Labor':
            eventUrl = 'https://www.cgil.it/';
            break;
          case 'Women\'s Rights':
            eventUrl = 'https://www.nonunadimeno.wordpress.com/';
            break;
          default:
            eventUrl = 'https://www.eventbrite.it/';
        }
      }
      
      if (eventUrl) {
        const { error: updateError } = await supabase
          .from('protests')
          .update({ event_url: eventUrl })
          .eq('id', event.id);
        
        if (updateError) {
          console.log(`❌ Failed to update "${event.title}": ${updateError.message}`);
        } else {
          console.log(`✅ Updated "${event.title}" with URL: ${eventUrl}`);
          updatedCount++;
        }
      }
    }
    
    console.log(`\n🎉 Updated ${updatedCount} events with event URLs!`);
    
  } catch (error) {
    console.error('Error in updateEventUrls:', error);
  }
}

// Run the update
updateEventUrls();or);
  }
}

// Run the update
updateEventUrls();
