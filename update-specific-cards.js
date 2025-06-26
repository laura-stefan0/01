import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateSpecificCards() {
  console.log('🔗 Updating specific cards with requested URLs...');
  
  try {
    // Update "Find protests in your area" to redirect to Search page (/filter)
    console.log('\n📍 Updating "Find protests in your area" card...');
    const { data: findCard, error: findError } = await supabase
      .from('whats_new')
      .update({
        cta_text: 'Search Events',
        cta_url: '/filter'
      })
      .eq('title', 'Find protests in your area')
      .select();
    
    if (findError) {
      console.error('❌ Error updating "Find protests" card:', findError);
    } else {
      console.log('✅ Updated "Find protests in your area" card to redirect to /filter');
      console.log('   Data:', JSON.stringify(findCard, null, 2));
    }
    
    // Update "Know Your Rights in Italy" to open UNHCR URL
    console.log('\n⚖️ Updating "Know Your Rights in Italy" card...');
    const { data: rightsCard, error: rightsError } = await supabase
      .from('whats_new')
      .update({
        cta_text: 'Learn Your Rights',
        cta_url: 'https://help.unhcr.org/italy/asylum-italy/rights/'
      })
      .eq('title', 'Know Your Rights in Italy')
      .select();
    
    if (rightsError) {
      console.error('❌ Error updating "Know Your Rights" card:', rightsError);
    } else {
      console.log('✅ Updated "Know Your Rights in Italy" card to open UNHCR URL');
      console.log('   Data:', JSON.stringify(rightsCard, null, 2));
    }
    
    // Verify the updates
    console.log('\n📊 Verification - checking updated cards:');
    const { data: updatedCards, error: verifyError } = await supabase
      .from('whats_new')
      .select('title, cta_url, cta_text, country_code')
      .in('title', ['Find protests in your area', 'Know Your Rights in Italy']);
    
    if (verifyError) {
      console.error('❌ Error during verification:', verifyError);
    } else {
      updatedCards?.forEach((card, index) => {
        console.log(`  ${index + 1}. "${card.title}" (${card.country_code})`);
        console.log(`     URL: ${card.cta_url}`);
        console.log(`     Text: ${card.cta_text}`);
      });
    }
    
    console.log('\n🎉 Cards updated successfully! They should now be clickable in the "What\'s new" section.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateSpecificCards();