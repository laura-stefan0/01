#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateLGBTtoLGBTQ() {
  console.log('🏳️‍🌈 Updating "LGBT+" tags to "LGBTQ+" for all events...\n');
  
  try {
    // First, find all events with "LGBT+" category
    const { data: lgbtEvents, error: fetchError } = await supabase
      .from('protests')
      .select('id, title, category')
      .eq('category', 'LGBT+');
    
    if (fetchError) {
      console.error('Error fetching LGBT+ events:', fetchError);
      return;
    }
    
    console.log(`Found ${lgbtEvents?.length || 0} events with "LGBT+" category`);
    
    if (lgbtEvents && lgbtEvents.length > 0) {
      // Show some examples
      console.log('Examples of events to update:');
      lgbtEvents.slice(0, 5).forEach(event => {
        console.log(`  - "${event.title}" (${event.category})`);
      });
      
      // Update all LGBT+ events to LGBTQ+
      const { error: updateError } = await supabase
        .from('protests')
        .update({ category: 'LGBTQ+' })
        .eq('category', 'LGBT+');
      
      if (updateError) {
        console.error('Error updating categories:', updateError);
      } else {
        console.log(`✅ Successfully updated ${lgbtEvents.length} events from "LGBT+" to "LGBTQ+"`);
      }
    } else {
      console.log('No events found with "LGBT+" category');
    }
    
    // Also check for any other LGBT variations and update them
    const variations = ['LGBT', 'lgbt+', 'lgbt', 'Lgbt+', 'LGBT+ & Equality'];
    
    for (const variation of variations) {
      const { data: variantEvents, error: variantFetchError } = await supabase
        .from('protests')
        .select('id, title, category')
        .eq('category', variation);
      
      if (variantFetchError) {
        console.log(`Could not check for "${variation}" events:`, variantFetchError.message);
        continue;
      }
      
      if (variantEvents && variantEvents.length > 0) {
        console.log(`\nFound ${variantEvents.length} events with "${variation}" category`);
        
        const { error: variantUpdateError } = await supabase
          .from('protests')
          .update({ category: 'LGBTQ+' })
          .eq('category', variation);
        
        if (variantUpdateError) {
          console.error(`Error updating "${variation}" categories:`, variantUpdateError);
        } else {
          console.log(`✅ Updated ${variantEvents.length} events from "${variation}" to "LGBTQ+"`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error in updateLGBTtoLGBTQ:', error);
  }
}

// Run the update
updateLGBTtoLGBTQ();