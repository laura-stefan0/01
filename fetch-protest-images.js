#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { load } from 'cheerio';
import axios from 'axios';
import { config } from 'dotenv';

config();

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to find images from website content
async function findImageFromWebsite(title, category, description) {
  try {
    let searchQuery = '';
    let websiteUrls = [];
    
    // Determine which websites to search based on category and title
    if (category === 'LGBTQ+') {
      websiteUrls = [
        'https://www.arcigay.it/en/eventi/',
        'https://ondapride.it/',
        'https://www.milanopride.it/',
        'https://www.romapride.it/'
      ];
      searchQuery = title.toLowerCase();
    } else if (category === 'Environment') {
      websiteUrls = [
        'https://ultima-generazione.com/',
        'https://ultima-generazione.com/eventi/'
      ];
      searchQuery = title.toLowerCase();
    }
    
    // Search for images on relevant websites
    for (const url of websiteUrls) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });
        
        const $ = load(response.data);
        
        // Look for images that might be related to the event
        const images = [];
        
        // Find images with alt text or nearby text matching the event
        $('img').each((index, element) => {
          const $img = $(element);
          const src = $img.attr('src');
          const alt = $img.attr('alt') || '';
          const title_attr = $img.attr('title') || '';
          
          if (!src) return;
          
          // Convert relative URLs to absolute
          let imageUrl = src;
          if (src.startsWith('/')) {
            const baseUrl = new URL(url).origin;
            imageUrl = baseUrl + src;
          } else if (!src.startsWith('http')) {
            const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
            imageUrl = baseUrl + src;
          }
          
          // Skip very small images, icons, logos
          if (src.includes('icon') || src.includes('logo') || 
              src.includes('avatar') || src.includes('thumb') ||
              alt.toLowerCase().includes('logo') ||
              alt.toLowerCase().includes('icon')) {
            return;
          }
          
          // Look for content-related images
          const textContent = (alt + ' ' + title_attr).toLowerCase();
          const titleWords = title.toLowerCase().split(' ');
          
          // Check if image is related to the event
          let relevanceScore = 0;
          titleWords.forEach(word => {
            if (word.length > 3 && textContent.includes(word)) {
              relevanceScore++;
            }
          });
          
          // For Pride events, look for rainbow/pride related images
          if (category === 'LGBTQ+') {
            if (textContent.includes('pride') || textContent.includes('rainbow') ||
                textContent.includes('lgbtq') || textContent.includes('gay') ||
                src.toLowerCase().includes('pride')) {
              relevanceScore += 3;
            }
          }
          
          // For environment events, look for climate/nature related images
          if (category === 'Environment') {
            if (textContent.includes('climate') || textContent.includes('environment') ||
                textContent.includes('natura') || textContent.includes('green') ||
                src.toLowerCase().includes('climate') || src.toLowerCase().includes('green')) {
              relevanceScore += 3;
            }
          }
          
          if (relevanceScore > 0 || (textContent === '' && src.match(/\.(jpg|jpeg|png|webp)$/i))) {
            images.push({
              url: imageUrl,
              relevance: relevanceScore,
              alt: alt
            });
          }
        });
        
        // Sort by relevance and return the best image
        if (images.length > 0) {
          images.sort((a, b) => b.relevance - a.relevance);
          const bestImage = images[0];
          
          // Validate the image URL
          try {
            const imageResponse = await axios.head(bestImage.url, { timeout: 5000 });
            if (imageResponse.status === 200 && 
                imageResponse.headers['content-type']?.startsWith('image/')) {
              return bestImage.url;
            }
          } catch (e) {
            // Image not accessible, continue to next
          }
        }
        
      } catch (error) {
        console.log(`Could not search ${url}: ${error.message}`);
      }
    }
    
    // If no specific image found, return a category-appropriate stock image
    if (category === 'LGBTQ+') {
      return 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop&auto=format'; // Pride march
    } else if (category === 'Environment') {
      return 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=500&h=300&fit=crop&auto=format'; // Climate protest
    } else if (category === 'Labor') {
      return 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=500&h=300&fit=crop&auto=format'; // Workers
    }
    
    return null;
    
  } catch (error) {
    console.log(`Error finding image for "${title}": ${error.message}`);
    return null;
  }
}

// Update events with proper images
async function updateProtestImages() {
  console.log('🖼️ Fetching authentic images for protest events...\n');
  
  try {
    // Get all events that need images
    const { data: events, error } = await supabase
      .from('protests')
      .select('id, title, category, description, image_url')
      .eq('country_code', 'IT')
      .limit(20); // Process in batches to avoid rate limiting
    
    if (error) {
      console.error('Error fetching events:', error);
      return;
    }
    
    console.log(`Processing ${events.length} events for image updates...\n`);
    
    for (const event of events) {
      console.log(`Searching for image: "${event.title}" (${event.category})`);
      
      // Find appropriate image
      const imageUrl = await findImageFromWebsite(event.title, event.category, event.description);
      
      if (imageUrl && imageUrl !== event.image_url) {
        // Update the event with new image
        const { error: updateError } = await supabase
          .from('protests')
          .update({ image_url: imageUrl })
          .eq('id', event.id);
        
        if (updateError) {
          console.log(`  ❌ Failed to update image for "${event.title}": ${updateError.message}`);
        } else {
          console.log(`  ✅ Updated image for "${event.title}"`);
          console.log(`     ${imageUrl}\n`);
        }
      } else {
        console.log(`  ⏭️ No new image found for "${event.title}"\n`);
      }
      
      // Small delay to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('🎉 Image update completed!');
    
  } catch (error) {
    console.error('Error in updateProtestImages:', error);
  }
}

// Run the image update
updateProtestImages();