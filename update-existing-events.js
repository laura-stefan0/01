
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';

const supabaseUrl = process.env.SUPABASE_URL || 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo');

// Function to scrape actual event URLs from organization websites
async function scrapeEventUrl(event) {
  const title = event.title.toLowerCase();
  const description = event.description ? event.description.toLowerCase() : '';
  
  try {
    // For Pride events
    if (title.includes('pride')) {
      let baseUrl = 'https://ondapride.it/';
      
      if (title.includes('milano')) {
        baseUrl = 'https://www.milanopride.it/';
      } else if (title.includes('roma')) {
        baseUrl = 'https://www.romapride.it/';
      } else if (title.includes('torino')) {
        baseUrl = 'https://www.torinopride.it/';
      }
      
      const eventUrl = await findEventOnWebsite(baseUrl, event.title);
      if (eventUrl) return eventUrl;
    }
    
    // For Ultima Generazione events
    if (title.includes('ultima generazione') || description.includes('ultima generazione')) {
      const eventUrl = await findEventOnWebsite('https://ultima-generazione.com/eventi/', event.title);
      if (eventUrl) return eventUrl;
    }
    
    // For Arcigay events
    if (title.includes('arcigay') || description.includes('arcigay')) {
      const eventUrl = await findEventOnWebsite('https://www.arcigay.it/eventi/', event.title);
      if (eventUrl) return eventUrl;
    }
    
    // For Environmental events
    if (event.category === 'Environment') {
      const eventUrl = await findEventOnWebsite('https://www.legambiente.it/eventi/', event.title);
      if (eventUrl) return eventUrl;
    }
    
  } catch (error) {
    console.log(`⚠️ Error scraping for "${event.title}": ${error.message}`);
  }
  
  // Fallback to homepage if no specific event page found
  return getEventUrl(event);
}

// Function to search for specific event on a website
async function findEventOnWebsite(baseUrl, eventTitle) {
  try {
    console.log(`🔍 Searching for "${eventTitle}" on ${baseUrl}`);
    
    const response = await axios.get(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    const $ = load(response.data);
    const titleWords = eventTitle.toLowerCase().split(' ').filter(word => word.length > 3);
    
    // Look for links that contain event title keywords
    const eventLinks = [];
    
    $('a').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const linkText = $link.text().toLowerCase();
      const linkTitle = $link.attr('title') || '';
      
      if (!href) return;
      
      // Check if link text or title contains event keywords
      const matchScore = titleWords.reduce((score, word) => {
        if (linkText.includes(word) || linkTitle.toLowerCase().includes(word)) {
          return score + 1;
        }
        return score;
      }, 0);
      
      if (matchScore >= Math.min(2, titleWords.length)) {
        let fullUrl = href;
        if (href.startsWith('/')) {
          const urlObj = new URL(baseUrl);
          fullUrl = `${urlObj.origin}${href}`;
        } else if (!href.startsWith('http')) {
          fullUrl = `${baseUrl}${href}`;
        }
        
        eventLinks.push({
          url: fullUrl,
          score: matchScore,
          text: linkText.substring(0, 100)
        });
      }
    });
    
    // Return the best matching event URL
    if (eventLinks.length > 0) {
      eventLinks.sort((a, b) => b.score - a.score);
      console.log(`✅ Found event URL: ${eventLinks[0].url}`);
      return eventLinks[0].url;
    }
    
    // Also check for specific date-based events
    const eventDate = extractDateFromTitle(eventTitle);
    if (eventDate) {
      const dateBasedLinks = [];
      
      $('a').each((index, element) => {
        const $link = $(element);
        const href = $link.attr('href');
        const linkText = $link.text().toLowerCase();
        
        if (!href) return;
        
        if (linkText.includes(eventDate.year) || linkText.includes(eventDate.month)) {
          let fullUrl = href;
          if (href.startsWith('/')) {
            const urlObj = new URL(baseUrl);
            fullUrl = `${urlObj.origin}${href}`;
          }
          
          dateBasedLinks.push(fullUrl);
        }
      });
      
      if (dateBasedLinks.length > 0) {
        console.log(`✅ Found date-based event URL: ${dateBasedLinks[0]}`);
        return dateBasedLinks[0];
      }
    }
    
  } catch (error) {
    console.log(`⚠️ Could not scrape ${baseUrl}: ${error.message}`);
  }
  
  return null;
}

// Helper function to extract date information from title
function extractDateFromTitle(title) {
  const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 
                  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  
  // Look for year (2024, 2025, etc.)
  const yearMatch = title.match(/20(2[4-9]|3[0-9])/);
  const year = yearMatch ? yearMatch[0] : null;
  
  // Look for month
  const month = months.find(m => title.toLowerCase().includes(m));
  
  return year || month ? { year, month } : null;
}

// Fallback function (original logic)
function getEventUrl(event) {
  const title = event.title.toLowerCase();
  const description = event.description ? event.description.toLowerCase() : '';
  const category = event.category;
  
  if (title.includes('ultima generazione') || description.includes('ultima generazione')) {
    return 'https://ultima-generazione.com/';
  }
  
  if (title.includes('arcigay') || description.includes('arcigay')) {
    return 'https://www.arcigay.it/';
  }
  
  if (title.includes('pride') || category === 'LGBTQ+') {
    if (title.includes('milano')) {
      return 'https://www.milanopride.it/';
    } else if (title.includes('roma')) {
      return 'https://www.romapride.it/';
    } else if (title.includes('torino')) {
      return 'https://www.torinopride.it/';
    } else {
      return 'https://ondapride.it/';
    }
  }
  
  if (title.includes('friday') && title.includes('future')) {
    return 'https://fridaysforfuture.org/';
  }
  
  if (title.includes('extinction rebellion')) {
    return 'https://extinctionrebellion.it/';
  }
  
  if (title.includes('non una di meno') || description.includes('non una di meno')) {
    return 'https://nonunadimeno.wordpress.com/';
  }
  
  switch (category) {
    case 'Environment':
      return 'https://www.legambiente.it/';
    case 'LGBTQ+':
      return 'https://www.gaynet.it/';
    case 'Civil & Human Rights':
      return 'https://www.amnesty.it/';
    case 'Peace & Anti-War':
      return 'https://www.pacedifesa.org/';
    case 'Labor':
      return 'https://www.cgil.it/';
    case "Women's Rights":
      return 'https://www.donneindifesa.it/';
    default:
      return 'https://www.eventbrite.it/';
  }
}

async function updateAllEvents() {
  console.log('🔄 Updating all events with specific event page URLs...');

  try {
    const { data: events, error } = await supabase
      .from('protests')
      .select('id, title, description, category')
      .limit(10); // Start with first 10 events to test

    if (error) {
      console.error('❌ Error fetching events:', error);
      return;
    }

    console.log(`📊 Found ${events.length} events to update`);

    for (const event of events) {
      console.log(`\n🔗 Processing: "${event.title}"`);
      
      const eventUrl = await scrapeEventUrl(event);
      
      const { error: updateError } = await supabase
        .from('protests')
        .update({ event_url: eventUrl })
        .eq('id', event.id);

      if (updateError) {
        console.error(`❌ Error updating event ${event.id}:`, updateError);
      } else {
        console.log(`✅ Updated "${event.title}" with URL: ${eventUrl}`);
      }
      
      // Add delay to avoid overwhelming the websites
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🎉 Finished updating events with specific URLs!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateAllEvents();
