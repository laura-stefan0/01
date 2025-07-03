import fs from 'fs/promises';
import path from 'path';

/**
 * Fetch Instagram data from Apify using REST API
 */
async function fetchApifyData() {
  try {
    console.log('🔍 Fetching your latest Apify Instagram data...');
    
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) {
      throw new Error('APIFY_API_TOKEN environment variable is required');
    }
    
    // Fetch recent runs from Instagram Post Scraper
    const runsResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-post-scraper/runs?token=${apiToken}&limit=10&desc=1`
    );
    
    if (!runsResponse.ok) {
      throw new Error(`Failed to fetch runs: ${runsResponse.status} ${runsResponse.statusText}`);
    }
    
    const runsData = await runsResponse.json();
    console.log(`📊 Found ${runsData.data.items.length} recent runs`);
    
    // Find most recent successful run
    const successfulRun = runsData.data.items.find(run => run.status === 'SUCCEEDED');
    
    if (!successfulRun) {
      console.log('❌ No successful runs found. Please run your Instagram scraper first.');
      return null;
    }
    
    console.log(`✅ Found successful run: ${successfulRun.id}`);
    console.log(`📅 Started: ${new Date(successfulRun.startedAt).toLocaleString()}`);
    
    // Fetch the dataset results with all fields
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/datasets/${successfulRun.defaultDatasetId}/items?token=${apiToken}&format=json&clean=false&attachment=false`
    );
    
    if (!datasetResponse.ok) {
      throw new Error(`Failed to fetch dataset: ${datasetResponse.status} ${datasetResponse.statusText}`);
    }
    
    const items = await datasetResponse.json();
    console.log(`📊 Retrieved ${items.length} Instagram posts`);
    
    // Save to data folder
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `instagram-data-${timestamp}.json`;
    const filepath = path.join(process.cwd(), 'data', 'imports', 'instagram', filename);
    
    await fs.writeFile(filepath, JSON.stringify(items, null, 2));
    console.log(`💾 Data saved to: ${filepath}`);
    
    // Show sample of data structure
    if (items.length > 0) {
      console.log('\n📋 Sample post structure:');
      const sample = items[0];
      console.log(`- Username: ${sample.ownerUsername || 'N/A'}`);
      console.log(`- Caption: ${(sample.caption || '').slice(0, 100)}...`);
      console.log(`- URL: ${sample.url || 'N/A'}`);
      console.log(`- Image: ${sample.displayUrl ? 'Yes' : 'No'}`);
      console.log(`- Timestamp: ${sample.timestamp || 'N/A'}`);
    }
    
    return { items, filepath, runInfo: successfulRun };
    
  } catch (error) {
    console.error('❌ Error fetching Apify data:', error.message);
    throw error;
  }
}

// Run the fetch
fetchApifyData()
  .then(result => {
    if (result) {
      console.log('\n🎉 Successfully fetched Instagram data from Apify!');
      console.log(`📄 File: ${result.filepath}`);
      console.log(`📊 Posts: ${result.items.length}`);
      console.log('\n🔄 Next steps:');
      console.log('1. Review the data structure in the saved JSON file');
      console.log('2. Run the event extraction script to parse events');
      console.log('3. Import extracted events to your database');
    }
  })
  .catch(error => {
    console.error('❌ Failed to fetch data:', error.message);
    process.exit(1);
  });