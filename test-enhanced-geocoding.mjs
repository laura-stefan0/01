
#!/usr/bin/env node

/**
 * Test script for Enhanced Geocoding with Geometry Support
 * Demonstrates the improved geocoding functionality with Turf.js
 */

import { geocodeAddress, exampleUsage, getCacheStats, clearGeocodeCache } from './scraper/enhanced-geocoding.mjs';

async function runGecodingTests() {
  console.log('🧪 Testing Enhanced Geocoding System\n');
  console.log('=' .repeat(50));
  
  try {
    // Run the example usage
    await exampleUsage();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎯 Additional Test Cases\n');
    
    // Test specific Italian locations known for their geometry
    const testCases = [
      { address: 'Corso Buenos Aires', city: 'Milano', description: 'Long shopping street (LineString)' },
      { address: 'Piazza del Duomo', city: 'Milano', description: 'Cathedral square (Polygon)' },
      { address: 'Via dei Fori Imperiali', city: 'Roma', description: 'Historic avenue (LineString)' },
      { address: 'Campo San Polo', city: 'Venezia', description: 'Venetian campo (Polygon)' },
      { address: null, city: 'Torino', description: 'City only geocoding' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📍 Testing: ${testCase.description}`);
      console.log(`   Query: ${testCase.address || 'N/A'}, ${testCase.city}`);
      
      const result = await geocodeAddress(testCase.address, testCase.city);
      
      if (result) {
        console.log(`   ✅ Result: ${result.lat.toFixed(6)}, ${result.lng.toFixed(6)}`);
      } else {
        console.log(`   ❌ No result returned`);
      }
      
      // Small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Final cache statistics
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Final Cache Statistics:');
    const stats = getCacheStats();
    console.log(`   Cached entries: ${stats.size}`);
    console.log(`   Cache keys: ${stats.keys.slice(0, 5).join(', ')}${stats.size > 5 ? '...' : ''}`);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runGecodingTests();
}
