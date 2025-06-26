import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixCardCountries() {
  console.log('🌍 Setting country codes for the cards...');
  
  try {
    // Update "Find protests in your area" to show for Italy
    const { error: findError } = await supabase
      .from('whats_new')
      .update({ country_code: 'IT' })
      .eq('title', 'Find protests in your area');
    
    if (findError) {
      console.error('❌ Error updating Find protests card country:', findError);
    } else {
      console.log('✅ Set "Find protests in your area" to show in Italy (IT)');
    }
    
    // Update "Know Your Rights in Italy" to show for Italy
    const { error: rightsError } = await supabase
      .from('whats_new')
      .update({ country_code: 'IT' })
      .eq('title', 'Know Your Rights in Italy');
    
    if (rightsError) {
      console.error('❌ Error updating Know Your Rights card country:', rightsError);
    } else {
      console.log('✅ Set "Know Your Rights in Italy" to show in Italy (IT)');
    }
    
    console.log('\n🎉 Cards should now appear when Italy is selected!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixCardCountries();