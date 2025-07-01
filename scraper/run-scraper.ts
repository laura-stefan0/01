
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractImageFromUrl } from './image-extractor.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamdnaWhiaHdzd3BxemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTA2Njc0NiwiZXhwIjoyMDUwNjQyNzQ2fQ.mUvs7HJQJuHfCNuWpPRkZgMRKZVdLQQ_0QLQ7Nz0MdE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Category fallback images (only used when scraping fails)
const categoryFallbackImages = {
  'environment': 'https://images.unsplash.com/photo-1573160813959-c9157b3f8e7c?w=800&h=600&fit=crop&auto=format',
  'lgbtq+': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&auto=format',
  'women\'s rights': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&auto=format',
  'labor': 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=800&h=600&fit=crop&auto=format',
  'racial & social justice': 'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=800&h=600&fit=crop&auto=format',
  'civil & human rights': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format',
  'healthcare & education': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&auto=format',
  'peace & anti-war': 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=600&fit=crop&auto=format',
  'transparency & anti-corruption': 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=600&fit=crop&auto=format',
  'other': 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=600&fit=crop&auto=format'
} as const;

interface ScrapedProtest {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  source_url: string;
  image_url?: string;
  country_code: string;
  attendees: number;
}

/**
 * Scrape protest events from various Italian sources
 */
async function scrapeProtests(): Promise<ScrapedProtest[]> {
  const protests: ScrapedProtest[] = [];
  
  // Updated sources with new additions
  const sources = [
    {
      url: 'https://www.manifestazioni.it',
      type: 'manifestazioni'
    },
    {
      url: 'https://www.eventi.it/eventi/manifestazioni',
      type: 'eventi'
    },
    {
      url: 'https://ilrovescio.info/category/iniziative/',
      type: 'initiatives'
    },
    {
      url: 'https://rivoluzioneanarchica.it',
      type: 'anarchist'
    }
    // Add more sources as needed
  ];

  for (const source of sources) {
    try {
      console.log(`🔍 Scraping ${source.url}...`);
      const sourceProtests = await scrapeSource(source.url, source.type);
      protests.push(...sourceProtests);
    } catch (error) {
      console.error(`❌ Error scraping ${source.url}:`, error);
    }
  }

  return protests;
}

/**
 * Scrape a specific source
 */
async function scrapeSource(url: string, type: string): Promise<ScrapedProtest[]> {
  const protests: ScrapedProtest[] = [];
  
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Generic selectors for events - adapt based on actual site structure
    const eventSelectors = [
      '.event-item',
      '.protest-item', 
      '.manifestazione',
      '.evento',
      'article',
      '.card'
    ];

    for (const selector of eventSelectors) {
      $(selector).each(async (i, element) => {
        try {
          const protest = await parseEventElement($, element, url, type);
          if (protest) {
            protests.push(protest);
          }
        } catch (error) {
          console.log(`❌ Error parsing event element:`, error);
        }
      });
    }

  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error);
  }

  return protests;
}

/**
 * Parse individual event element
 */
async function parseEventElement($: cheerio.CheerioAPI, element: cheerio.Element, baseUrl: string, type: string): Promise<ScrapedProtest | null> {
  const $el = $(element);
  
  // Extract basic information
  const title = $el.find('h1, h2, h3, .title, .event-title').first().text().trim();
  const description = $el.find('p, .description, .summary').first().text().trim();
  const location = $el.find('.location, .place, .venue').first().text().trim();
  
  if (!title || title.length < 10) return null;

  // Extract date and time
  const dateText = $el.find('.date, .when, time').first().text().trim();
  const { date, time } = parseDateAndTime(dateText);

  // Determine category from title and description
  const category = categorizeEvent(title, description);

  // Get event page URL for image extraction
  let eventUrl = $el.find('a').first().attr('href');
  if (eventUrl && !eventUrl.startsWith('http')) {
    eventUrl = new URL(eventUrl, baseUrl).href;
  }

  // Extract image from the event page
  let imageUrl: string | null = null;
  if (eventUrl) {
    imageUrl = await extractImageFromUrl(eventUrl, title, category);
  }

  // If no image found, try to get it from the current element
  if (!imageUrl) {
    const imgSrc = $el.find('img').first().attr('src');
    if (imgSrc) {
      imageUrl = imgSrc.startsWith('http') ? imgSrc : new URL(imgSrc, baseUrl).href;
    }
  }

  // Use fallback only if no image could be extracted
  if (!imageUrl) {
    const normalizedCategory = category.toLowerCase() as keyof typeof categoryFallbackImages;
    imageUrl = categoryFallbackImages[normalizedCategory] || categoryFallbackImages.other;
    console.log(`🔄 Using fallback image for "${title}" (${category})`);
  } else {
    console.log(`🖼️ Extracted image for "${title}": ${imageUrl}`);
  }

  return {
    title,
    description: description || title,
    date,
    time,
    location: location || 'Italy',
    category,
    source_url: eventUrl || baseUrl,
    image_url: imageUrl,
    country_code: 'IT',
    attendees: Math.floor(Math.random() * 500) + 50 // Random for demo
  };
}

/**
 * Parse date and time from text
 */
function parseDateAndTime(dateText: string): { date: string; time: string } {
  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = '18:00';

  if (!dateText) {
    return { date: defaultDate, time: defaultTime };
  }

  // Try to extract date patterns
  const dateMatch = dateText.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // Try to extract time
    const timeMatch = dateText.match(/(\d{1,2}):(\d{2})/);
    const time = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : defaultTime;
    
    return { date, time };
  }

  return { date: defaultDate, time: defaultTime };
}

/**
 * Categorize event based on title and description
 */
function categorizeEvent(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  const categories = {
    'environment': ['clima', 'ambiente', 'green', 'sostenibile', 'climate', 'environmental'],
    'lgbtq+': ['lgbtq', 'pride', 'gay', 'lesbian', 'transgender', 'rainbow'],
    'women\'s rights': ['donne', 'femminismo', 'women', 'feminist', 'gender'],
    'labor': ['lavoro', 'sindacato', 'worker', 'labor', 'union', 'strike'],
    'racial & social justice': ['razzismo', 'giustizia', 'racism', 'justice', 'equality'],
    'civil & human rights': ['diritti', 'libertà', 'rights', 'freedom', 'democracy'],
    'healthcare & education': ['sanità', 'scuola', 'università', 'health', 'education', 'student'],
    'peace & anti-war': ['pace', 'guerra', 'peace', 'war', 'anti-war', 'pacifist'],
    'transparency & anti-corruption': ['corruzione', 'trasparenza', 'corruption', 'transparency']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'other';
}

/**
 * Save protests to database
 */
async function saveProtests(protests: ScrapedProtest[]): Promise<void> {
  console.log(`💾 Saving ${protests.length} protests to database...`);

  for (const protest of protests) {
    try {
      const { error } = await supabase
        .from('protests')
        .insert(protest);

      if (error) {
        console.error(`❌ Error saving "${protest.title}":`, error);
      } else {
        console.log(`✅ Saved: ${protest.title}`);
      }
    } catch (error) {
      console.error(`❌ Error saving protest:`, error);
    }
  }
}

/**
 * Main scraper function
 */
async function runScraper(): Promise<void> {
  console.log('🚀 Starting protest scraper with image extraction...');

  try {
    const protests = await scrapeProtests();
    
    if (protests.length > 0) {
      await saveProtests(protests);
      console.log(`🎉 Scraping completed! Found ${protests.length} protests.`);
    } else {
      console.log('ℹ️ No protests found during scraping.');
    }
  } catch (error) {
    console.error('❌ Scraper failed:', error);
  }
}

// Run the scraper
if (import.meta.url === `file://${process.argv[1]}`) {
  runScraper().then(() => {
    console.log('✨ Scraper process completed!');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Scraper failed:', error);
    process.exit(1);
  });
}

export { runScraper };
