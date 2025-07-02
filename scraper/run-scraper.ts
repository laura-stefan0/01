import { main as runEnhancedScraper } from './enhanced-italian-scraper.mjs';

/**
 * TypeScript wrapper for the enhanced Italian protest scraper
 */
async function runScraper(): Promise<void> {
  console.log('🚀 Starting Enhanced Italian Protest Scraper via TypeScript...');

  try {
    await runEnhancedScraper();
    console.log('✨ Enhanced scraper completed successfully!');
  } catch (error) {
    console.error('💥 Enhanced scraper failed:', error);
    throw error;
  }
}

// Run the scraper if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runScraper().then(() => {
    console.log('✅ Scraper process completed!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Scraper process failed:', error);
    process.exit(1);
  });
}

export { runScraper };