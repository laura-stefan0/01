import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { load } from 'cheerio';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const targetUrls = [
  'https://ilrovescio.info/2025/06/28/5-luglio-bancali-sassari-corteo-contro-il-carcere/',
  'https://ilrovescio.info/2025/06/28/torino-3-e-4-luglio-appuntamenti-di-lotta-per-linizio-del-processo-per-loperazione-city/'
];

async function testIlrovescioScraping() {
  console.log('🔍 Testing ilrovescio.info scraping for specific articles...');
  
  try {
    // First, check the homepage to see if these articles are listed
    console.log('\n📄 Checking homepage...');
    const homepageResponse = await axios.get('https://ilrovescio.info/', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = load(homepageResponse.data);
    
    // Look for the specific articles
    const foundArticles = [];
    
    // Check slider items
    $('.slick-item').each((i, element) => {
      const $el = $(element);
      const link = $el.find('a').attr('href');
      const title = $el.find('.article-title a, h3 a, .slide-title a').text().trim();
      
      if (link && (link.includes('bancali-sassari') || link.includes('torino-3-e-4-luglio'))) {
        foundArticles.push({
          title: title,
          url: link,
          source: 'slider'
        });
      }
    });
    
    // Check direct links
    $('a[href*="/2025/"]').each((i, element) => {
      const $el = $(element);
      const link = $el.attr('href');
      const title = $el.text().trim() || $el.attr('title') || '';
      
      if (link && (link.includes('bancali-sassari') || link.includes('torino-3-e-4-luglio'))) {
        foundArticles.push({
          title: title,
          url: link,
          source: 'direct-link'
        });
      }
    });
    
    console.log(`\n✅ Found ${foundArticles.length} target articles on homepage:`);
    foundArticles.forEach(article => {
      console.log(`  📋 "${article.title}" (${article.source})`);
      console.log(`      🔗 ${article.url}`);
    });
    
    // Now test extracting content from each target URL
    console.log('\n📖 Testing article content extraction...');
    
    for (const url of targetUrls) {
      console.log(`\n🔍 Processing: ${url}`);
      
      try {
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const article$ = load(response.data);
        
        // Extract title
        const title = article$('h1').first().text().trim() || 
                     article$('.entry-title').text().trim() ||
                     article$('title').text().replace(' – il Rovescio', '').trim();
        
        // Extract content
        const content = article$('.entry-content').text() || 
                       article$('article .content').text() ||
                       article$('main article').text();
        
        console.log(`  📝 Title: "${title}"`);
        console.log(`  📄 Content length: ${content.length} chars`);
        console.log(`  📅 Content preview: "${content.slice(0, 200)}..."`);
        
        // Check for event dates and locations
        const dateMatches = content.match(/(\d{1,2})\s+(luglio|giugno|agosto)/gi) || [];
        const locationMatches = content.match(/(sassari|torino|bancali)/gi) || [];
        
        console.log(`  📅 Found dates: ${dateMatches.join(', ')}`);
        console.log(`  📍 Found locations: ${locationMatches.join(', ')}`);
        
        // Determine if this should be categorized as activism
        const activismKeywords = ['corteo', 'carcere', 'lotta', 'processo', 'operazione', 'manifestazione', 'protesta'];
        const hasActivismKeywords = activismKeywords.some(keyword => 
          content.toLowerCase().includes(keyword) || title.toLowerCase().includes(keyword)
        );
        
        console.log(`  🏴 Activism content: ${hasActivismKeywords ? 'YES' : 'NO'}`);
        
        if (hasActivismKeywords) {
          console.log(`  ✅ This article should be captured by the scraper`);
        } else {
          console.log(`  ⚠️ This article might be missed due to keyword filtering`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error processing article: ${error.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Error testing ilrovescio.info:', error.message);
  }
}

testIlrovescioScraping().catch(console.error);