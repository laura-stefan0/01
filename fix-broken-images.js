#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Reliable image URLs that definitely work
const workingImages = {
  'LGBTQ+': [
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1594736797933-d0a9ba7802ca?w=800&h=400&fit=crop'
  ],
  'Environment': [
    'https://images.unsplash.com/photo-1573833011-4c175e6bfaac?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1573833011-8b5c9b5b6e40?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop'
  ],
  'Labor': [
    'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=400&fit=crop'
  ]
};

async function fixBrokenImages() {
  console.log('Fixing broken protest images with reliable alternatives...\n');
  
  try {
    // Target the specific broken image URL
    const brokenUrl = 'https://images.unsplash.com/photo-1518709414026-6a7c6a5a0c14?w=800&h=400&fit=crop&auto=format';
    const brokenEnvUrl = 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=400&fit=crop&auto=format';
    
    // Fix LGBTQ+ events with the broken image
    const { data: lgbtqEvents, error: lgbtqError } = await supabase
      .from('protests')
      .select('id, title, category')
      .eq('image_url', brokenUrl)
      .eq('category', 'LGBTQ+');
    
    if (lgbtqError) {
      console.error('Error fetching LGBTQ+ events:', lgbtqError);
    } else if (lgbtqEvents && lgbtqEvents.length > 0) {
      console.log(`Fixing ${lgbtqEvents.length} LGBTQ+ events with broken images...`);
      
      for (let i = 0; i < lgbtqEvents.length; i++) {
        const event = lgbtqEvents[i];
        const newImageUrl = workingImages['LGBTQ+'][i % workingImages['LGBTQ+'].length];
        
        const { error: updateError } = await supabase
          .from('protests')
          .update({ image_url: newImageUrl })
          .eq('id', event.id);
        
        if (updateError) {
          console.log(`Failed to update "${event.title}": ${updateError.message}`);
        } else {
          console.log(`Fixed "${event.title}"`);
        }
      }
    }
    
    // Fix Environment events with the broken image
    const { data: envEvents, error: envError } = await supabase
      .from('protests')
      .select('id, title, category')
      .eq('image_url', brokenEnvUrl)
      .eq('category', 'Environment');
    
    if (envError) {
      console.error('Error fetching Environment events:', envError);
    } else if (envEvents && envEvents.length > 0) {
      console.log(`Fixing ${envEvents.length} Environment events with broken images...`);
      
      for (let i = 0; i < envEvents.length; i++) {
        const event = envEvents[i];
        const newImageUrl = workingImages['Environment'][i % workingImages['Environment'].length];
        
        const { error: updateError } = await supabase
          .from('protests')
          .update({ image_url: newImageUrl })
          .eq('id', event.id);
        
        if (updateError) {
          console.log(`Failed to update "${event.title}": ${updateError.message}`);
        } else {
          console.log(`Fixed "${event.title}"`);
        }
      }
    }
    
    // Fix any remaining events with null or empty image_url
    const { data: nullEvents, error: nullError } = await supabase
      .from('protests')
      .select('id, title, category')
      .or('image_url.is.null,image_url.eq.')
      .eq('country_code', 'IT');
    
    if (nullError) {
      console.error('Error fetching null image events:', nullError);
    } else if (nullEvents && nullEvents.length > 0) {
      console.log(`Fixing ${nullEvents.length} events with null/empty images...`);
      
      for (const event of nullEvents) {
        const categoryImgs = workingImages[event.category] || workingImages['LGBTQ+'];
        const hash = event.id ? event.id.split('-').pop() : '0';
        const index = parseInt(hash.substring(0, 2), 16) % categoryImgs.length;
        const newImageUrl = categoryImgs[index];
        
        const { error: updateError } = await supabase
          .from('protests')
          .update({ image_url: newImageUrl })
          .eq('id', event.id);
        
        if (updateError) {
          console.log(`Failed to update "${event.title}": ${updateError.message}`);
        } else {
          console.log(`Fixed "${event.title}"`);
        }
      }
    }
    
    console.log('\nCompleted fixing broken images!');
    
  } catch (error) {
    console.error('Error in fixBrokenImages:', error);
  }
}

fixBrokenImages();