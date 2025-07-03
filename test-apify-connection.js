
#!/usr/bin/env node

import { ApifyApi } from 'apify-client';
import dotenv from 'dotenv';

dotenv.config();

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;

console.log('🔍 Testing Apify Connection');
console.log('===========================');
console.log('APIFY_API_TOKEN present:', !!APIFY_API_TOKEN);
console.log('APIFY_API_TOKEN length:', APIFY_API_TOKEN?.length || 0);

if (!APIFY_API_TOKEN) {
  console.error('❌ APIFY_API_TOKEN is missing!');
  console.error('Please add it to your Replit secrets.');
  process.exit(1);
}

async function testApifyConnection() {
  try {
    const client = new ApifyApi({
      token: APIFY_API_TOKEN,
    });

    console.log('🔄 Testing Apify API...');
    
    // Test basic API access by getting user info
    const user = await client.user().get();
    console.log('✅ Apify connection successful!');
    console.log('📊 User info:', {
      username: user.username,
      email: user.email,
      plan: user.plan
    });

    // List available actors (optional)
    console.log('🔍 Checking available actors...');
    const actors = await client.actors().list({ limit: 5 });
    console.log('📈 Found', actors.count, 'actors in your account');
    
    if (actors.items.length > 0) {
      console.log('🎭 Sample actors:');
      actors.items.slice(0, 3).forEach(actor => {
        console.log(`  - ${actor.name} (${actor.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Apify connection failed:', error.message);
    if (error.message.includes('401')) {
      console.error('   This usually means the API token is invalid.');
    }
    process.exit(1);
  }
}

testApifyConnection();
