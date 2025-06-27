#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Category-specific image mappings
const categoryImages = {
  'LGBTQ+': [
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop&auto=format', // Pride march
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=400&fit=crop&auto=format', // Pride flags
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=400&fit=crop&auto=format', // Pride celebration
    'https://images.unsplash.com/photo-1518709414026-6a7c6a5a0c14?w=800&h=400&fit=crop&auto=format', // Pride crowd
  ],
  'Environment': [
    'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=400&fit=crop&auto=format', // Climate protest
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=400&fit=crop&auto=format', // Environmental activism
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop&auto=format', // Earth day
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&h=400&fit=crop&auto=format', // Green protest
  ],
  'Labor': [
    'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=400&fit=crop&auto=format', // Workers protest
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop&auto=format', // Union rally
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=400&fit=crop&auto=format', // Labor demonstration
  ],
  'Civil & Human Rights': [
    'https://images.unsplash.com/photo-1573496130103-ad5eac3d1b57?w=800&h=400&fit=crop&auto=format', // Rights march
    'https://images.unsplash.com/photo-1594312915251-48db9280c8f1?w=800&h=400&fit=crop&auto=format', // Justice protest
  ]
};

// Location-specific images for Italian cities
const locationImages = {
  'roma': 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&h=400&fit=crop&auto=format',
  'milano': 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&h=400&fit=crop&auto=format',
  'napoli': 'https://images.unsplash.com/photo-1544608915-8de2eed7ca1c?w=800&h=400&fit=crop&auto=format',
  'torino': 'https://images.unsplash.com/photo-1568849676085-51415703900f?w=800&h=400&fit=crop&auto=format',
  'bologna': 'https://images.unsplash.com/photo-1571492956373-ed37b3b8c30e?w=800&h=400&fit=crop&auto=format',
  'firenze': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&auto=format',
  'venezia': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=400&fit=crop&auto=format'
};

function getImageForEvent(event) {
  const category = event.category;
  const location = event.location?.toLowerCase() || '';
  const title = event.title?.toLowerCase() || '';
  
  // Try to get a category-appropriate image
  if (categoryImages[category]) {
    const images = categoryImages[category];
    
    // Use event ID to deterministically select an image (so same event gets same image)
    const hash = event.id ? event.id.split('-').pop() : '0';
    const index = parseInt(hash.substring(0, 2), 16) % images.length;
    return images[index];
  }
  
  // Fallback to generic protest image
  return 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=400&fit=crop&auto=format';
}

async function updateAllEventImages() {
  console.log('Updating images for all protest events...\n');
  
  try {
    // Get all events without proper images
    const { data: events, error } = await supabase
      .from('protests')
      .select('id, title, category, location, image_url')
      .eq('country_code', 'IT');
    
    if (error) {
      console.error('Error fetching events:', error);
      return;
    }
    
    console.log(`Processing ${events.length} events...\n`);
    
    let updatedCount = 0;
    
    for (const event of events) {
      // Get appropriate image for this event
      const newImageUrl = getImageForEvent(event);
      
      if (newImageUrl && newImageUrl !== event.image_url) {
        const { error: updateError } = await supabase
          .from('protests')
          .update({ image_url: newImageUrl })
          .eq('id', event.id);
        
        if (updateError) {
          console.log(`Failed to update "${event.title}": ${updateError.message}`);
        } else {
          console.log(`Updated "${event.title}" (${event.category})`);
          updatedCount++;
        }
      }
    }
    
    console.log(`\nCompleted: Updated ${updatedCount} events with appropriate images`);
    
  } catch (error) {
    console.error('Error in updateAllEventImages:', error);
  }
}

// Run the update
updateAllEventImages();