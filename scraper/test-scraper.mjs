import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testScraper() {
  console.log('🧪 Testing scraper functionality...');
  
  try {
    // Test database connection
    const { data, error } = await supabase.from('protests').select('id').limit(5);
    if (error) throw error;
    
    console.log('✅ Database connection successful');
    console.log(`📊 Current protests in database: ${data.length} sample records`);
    
    // Test simple HTTP request
    const response = await axios.get('https://www.globalproject.info/it/tags/news/menu', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`✅ HTTP request successful: ${response.status}`);
    console.log('🎉 Test scraper completed successfully!');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testScraper().then(success => {
  console.log(success ? '✅ All tests passed!' : '❌ Tests failed!');
  process.exit(success ? 0 : 1);
});