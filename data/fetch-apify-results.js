import pkg from 'apify-client';
const { ApifyApi } = pkg;
import fs from 'fs/promises';
import path from 'path';

// Initialize Apify client
const client = new ApifyApi({
  token: process.env.APIFY_API_TOKEN,
});

/**
 * Fetch latest results from Apify Instagram scraper
 */
async function fetchLatestApifyResults() {
  try {
    console.log('🔍 Fetching your latest Apify runs...');
    
    // Get list of recent runs
    const runs = await client.actor('apify/instagram-post-scraper').runs().list({
      limit: 10,
      desc: true // Most recent first
    });
    
    if (runs.items.length === 0) {
      console.log('❌ No runs found. Please run your Instagram scraper first.');
      return null;
    }
    
    // Get the most recent completed run
    const completedRun = runs.items.find(run => run.status === 'SUCCEEDED');
    
    if (!completedRun) {
      console.log('❌ No completed runs found. Please wait for your scraper to finish.');
      return null;
    }
    
    console.log(`✅ Found completed run: ${completedRun.id}`);
    console.log(`📅 Started: ${new Date(completedRun.startedAt).toLocaleString()}`);
    console.log(`⏱️ Duration: ${Math.round((new Date(completedRun.finishedAt) - new Date(completedRun.startedAt)) / 1000)}s`);
    
    // Fetch the results
    const { items } = await client.dataset(completedRun.defaultDatasetId).listItems();
    
    console.log(`📊 Retrieved ${items.length} Instagram posts`);
    
    // Save to data folder
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `instagram-data-${timestamp}.json`;
    const filepath = path.join('data/imports/instagram', filename);
    
    await fs.writeFile(filepath, JSON.stringify(items, null, 2));
    console.log(`💾 Data saved to: ${filepath}`);
    
    return { items, filepath, runInfo: completedRun };
    
  } catch (error) {
    console.error('❌ Error fetching Apify results:', error);
    throw error;
  }
}

// Run the fetch
fetchLatestApifyResults()
  .then(result => {
    if (result) {
      console.log('🎉 Successfully fetched Instagram data from Apify!');
      console.log(`📄 File: ${result.filepath}`);
      console.log(`📊 Posts: ${result.items.length}`);
    }
  })
  .catch(error => {
    console.error('❌ Failed to fetch data:', error);
    process.exit(1);
  });