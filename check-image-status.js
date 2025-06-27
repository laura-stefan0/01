#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { config } from 'dotenv';

config();

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkImageAvailability(url) {
  try {
    const response = await axios.head(url, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function checkAndFixImages() {
  console.log('Checking image status for all protests...\n');
  
  try {
    const { data: events, error } = await supabase
      .from('protests')
      .select('id, title, category, image_url')
      .eq('country_code', 'IT');
    
    if (error) {
      console.error('Error fetching events:', error);
      return;
    }
    
    console.log(`Checking ${events.length} events...\n`);
    
    const brokenImages = [];
    const workingImages = [];
    
    for (const event of events) {
      if (!event.image_url || event.image_url === 'null') {
        brokenImages.push({
          ...event,
          issue: 'No image URL'
        });
        continue;
      }
      
      const isWorking = await checkImageAvailability(event.image_url);
      
      if (isWorking) {
        workingImages.push(event);
        console.log(`✅ "${event.title}": Image working`);
      } else {
        brokenImages.push({
          ...event,
          issue: 'Image URL not accessible'
        });
        console.log(`❌ "${event.title}": Image broken - ${event.image_url}`);
      }
      
      // Small delay to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 Results:`);
    console.log(`Working images: ${workingImages.length}`);
    console.log(`Broken/missing images: ${brokenImages.length}`);
    
    if (brokenImages.length > 0) {
      console.log(`\n🔧 Fixing ${brokenImages.length} broken images...\n`);
      
      // Category-specific working images
      const categoryImages = {
        'LGBTQ+': [
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1518709414026-6a7c6a5a0c14?w=800&h=400&fit=crop&auto=format'
        ],
        'Environment': [
          'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&h=400&fit=crop&auto=format'
        ],
        'Labor': [
          'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=400&fit=crop&auto=format'
        ]
      };
      
      for (const event of brokenImages) {
        const categoryImgs = categoryImages[event.category] || categoryImages['LGBTQ+'];
        const hash = event.id ? event.id.split('-').pop() : '0';
        const index = parseInt(hash.substring(0, 2), 16) % categoryImgs.length;
        const newImageUrl = categoryImgs[index];
        
        // Verify the replacement image works
        const isNewImageWorking = await checkImageAvailability(newImageUrl);
        
        if (isNewImageWorking) {
          const { error: updateError } = await supabase
            .from('protests')
            .update({ image_url: newImageUrl })
            .eq('id', event.id);
          
          if (updateError) {
            console.log(`Failed to update "${event.title}": ${updateError.message}`);
          } else {
            console.log(`✅ Fixed "${event.title}" with ${event.category} image`);
          }
        } else {
          console.log(`❌ Replacement image also broken for "${event.title}"`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('\n🎉 Image check and fix completed!');
    
  } catch (error) {
    console.error('Error in checkAndFixImages:', error);
  }
}

checkAndFixImages();