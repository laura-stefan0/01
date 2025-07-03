import { supabaseAdmin } from '../db/index.ts';

/**
 * Capitalize address fields in the protests table
 */
async function capitalizeAddresses() {
  try {
    console.log('🚀 Starting address capitalization...');
    
    // Fetch all protests with their current addresses
    const { data: protests, error: fetchError } = await supabaseAdmin
      .from('protests')
      .select('id, address');
    
    if (fetchError) {
      throw new Error(`Failed to fetch protests: ${fetchError.message}`);
    }
    
    console.log(`📊 Found ${protests.length} protests to process`);
    
    let updated = 0;
    
    for (const protest of protests) {
      if (!protest.address || typeof protest.address !== 'string') {
        continue;
      }
      
      const originalAddress = protest.address;
      const capitalizedAddress = capitalizeAddress(originalAddress);
      
      // Only update if there's a change
      if (originalAddress !== capitalizedAddress) {
        const { error: updateError } = await supabaseAdmin
          .from('protests')
          .update({ address: capitalizedAddress })
          .eq('id', protest.id);
        
        if (updateError) {
          console.error(`❌ Error updating protest ${protest.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated: "${originalAddress}" → "${capitalizedAddress}"`);
          updated++;
        }
      }
    }
    
    console.log(`📊 Capitalization complete: ${updated} addresses updated`);
    
    return { total: protests.length, updated };
    
  } catch (error) {
    console.error('❌ Capitalization failed:', error);
    throw error;
  }
}

/**
 * Capitalize address with proper title case
 */
function capitalizeAddress(address) {
  // Words that should remain lowercase (articles, prepositions, conjunctions)
  const lowercaseWords = [
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'de', 'del', 'della', 'delle', 'di', 'e', 'for', 
    'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with'
  ];
  
  // Split by spaces and process each word
  return address
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Always capitalize the first word
      if (index === 0) {
        return capitalizeWord(word);
      }
      
      // Check if it's a word that should stay lowercase
      if (lowercaseWords.includes(word)) {
        return word;
      }
      
      // Capitalize other words
      return capitalizeWord(word);
    })
    .join(' ');
}

/**
 * Capitalize a single word properly
 */
function capitalizeWord(word) {
  if (!word || word.length === 0) {
    return word;
  }
  
  // Handle special cases like abbreviations
  if (word.length <= 3 && word.toUpperCase() === word) {
    return word.toUpperCase();
  }
  
  // Regular capitalization
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Run the capitalization
capitalizeAddresses()
  .then(result => {
    console.log('\n🌟 Address Capitalization Summary:');
    console.log(`• Processed ${result.total} total addresses`);
    console.log(`• Updated ${result.updated} addresses with proper capitalization`);
    console.log(`• All addresses now have proper title case formatting`);
  })
  .catch(error => {
    console.error('❌ Failed to capitalize addresses:', error);
  });