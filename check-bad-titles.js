#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkForBadTitles() {
  console.log('🔍 Checking for events with date-like titles...\n');
  
  try {
    const { data: events, error } = await supabase
      .from('protests')
      .select('id, title, date, location, description')
      .eq('country_code', 'IT');
    
    if (error) {
      console.error('Error fetching events:', error);
      return;
    }
    
    console.log(`Found ${events.length} total events\n`);
    
    // Look for suspicious titles
    const badTitles = events.filter(event => {
      const title = event.title;
      
      // Check for date patterns
      if (/^\d{1,2}[A-Za-z]{3}$/.test(title)) return true; // "27Giu"
      if (/^\d{1,2}[A-Za-z]{3}-\d{1,2}[A-Za-z]{3}$/.test(title)) return true; // "27Giu-28Giu"
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(title)) return true; // "2025-06-27"
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(title)) return true; // "27/06/2025"
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(title)) return true; // "27-06-2025"
      
      // Check for very short titles (likely dates)
      if (title.length < 6 && /\d/.test(title)) return true;
      
      // Check for titles that are just numbers or mostly numbers
      if (/^\d+$/.test(title)) return true;
      
      return false;
    });
    
    if (badTitles.length > 0) {
      console.log(`❌ Found ${badTitles.length} events with suspicious titles:\n`);
      
      badTitles.forEach((event, index) => {
        console.log(`${index + 1}. "${event.title}"`);
        console.log(`   Date: ${event.date}`);
        console.log(`   Location: ${event.location}`);
        console.log(`   Description: ${event.description?.substring(0, 100)}...`);
        console.log(`   ID: ${event.id}\n`);
      });
      
      return badTitles;
    } else {
      console.log('✅ No events found with date-like titles');
      return [];
    }
    
  } catch (error) {
    console.error('Error in checkForBadTitles:', error);
    return [];
  }
}

async function deleteBadTitleEvents() {
  const badEvents = await checkForBadTitles();
  
  if (badEvents.length > 0) {
    console.log('🗑️ Deleting events with bad titles...\n');
    
    const idsToDelete = badEvents.map(event => event.id);
    
    const { error } = await supabase
      .from('protests')
      .delete()
      .in('id', idsToDelete);
    
    if (error) {
      console.error('Error deleting bad events:', error);
    } else {
      console.log(`✅ Deleted ${badEvents.length} events with bad titles`);
    }
  }
}

// Run the check and cleanup
deleteBadTitleEvents();