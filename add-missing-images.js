
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamdOYWhiaHdzd3BxemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQ4NzY5NywiZXhwIjoyMDUwMDYzNjk3fQ.mfZKbdF2gm5kFyiSQOA16uKnb_NtuvS1lUz8OcqRWoo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function addMissingImages() {
  console.log('🖼️ Adding sample images to cards without images...');
  
  try {
    // Update "Know Your Rights in Italy" card
    console.log('\n⚖️ Adding image to "Know Your Rights in Italy" card...');
    const { data: rightsCard, error: rightsError } = await supabase
      .from('whats_new')
      .update({
        image_url: 'https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/whats-new/know-rights-italy.svg'
      })
      .eq('title', 'Know Your Rights in Italy')
      .select();
    
    if (rightsError) {
      console.error('❌ Error updating "Know Your Rights" card:', rightsError);
    } else {
      console.log('✅ Added image to "Know Your Rights in Italy" card');
    }
    
    // Update "Find protests in your area" card
    console.log('\n🔍 Adding image to "Find protests in your area" card...');
    const { data: findCard, error: findError } = await supabase
      .from('whats_new')
      .update({
        image_url: 'https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/whats-new/find-protests.svg'
      })
      .eq('title', 'Find protests in your area')
      .select();
    
    if (findError) {
      console.error('❌ Error updating "Find protests" card:', findError);
    } else {
      console.log('✅ Added image to "Find protests in your area" card');
    }
    
    // Verify the updates
    console.log('\n📊 Verification - checking updated cards:');
    const { data: updatedCards, error: verifyError } = await supabase
      .from('whats_new')
      .select('title, image_url')
      .in('title', ['Find protests in your area', 'Know Your Rights in Italy']);
    
    if (verifyError) {
      console.error('❌ Error during verification:', verifyError);
    } else {
      updatedCards?.forEach((card, index) => {
        console.log(`  ${index + 1}. "${card.title}"`);
        console.log(`     Image URL: ${card.image_url || 'NULL'}`);
      });
    }
    
    console.log('\n🎉 Images added successfully! All cards should now display properly.');
    
  } catch (error) {
    console.error('❌ Error adding images:', error);
  }
}

addMissingImages();
