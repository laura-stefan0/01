
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg0NTk2NiwiZXhwIjoyMDY2NDIxOTY2fQ.eBsUTTrlCRuQhAQP6HMcOJg2D18LVr3KV7TIE1QwNho';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Category mapping from lowercase to uppercase
const CATEGORY_MAPPING = {
  'environment': 'ENVIRONMENT',
  'lgbtq+': 'LGBTQ+',
  'women\'s rights': 'WOMEN\'S RIGHTS',
  'labor': 'LABOR',
  'racial & social justice': 'RACIAL & SOCIAL JUSTICE',
  'civil & human rights': 'CIVIL & HUMAN RIGHTS',
  'healthcare & education': 'HEALTHCARE & EDUCATION',
  'peace & anti-war': 'PEACE & ANTI-WAR',
  'transparency & anti-corruption': 'TRANSPARENCY & ANTI-CORRUPTION',
  'other': 'OTHER'
};

async function updateCategoriesToUppercase() {
  console.log('🔄 Starting category update to uppercase...');

  try {
    // Fetch all events with their current categories
    const { data: events, error: fetchError } = await supabase
      .from('protests')
      .select('id, category');

    if (fetchError) {
      console.error('❌ Error fetching events:', fetchError.message);
      return;
    }

    console.log(`📊 Found ${events.length} events to update`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const event of events) {
      const currentCategory = event.category;
      const uppercaseCategory = CATEGORY_MAPPING[currentCategory.toLowerCase()] || currentCategory.toUpperCase();

      // Only update if the category is different
      if (currentCategory !== uppercaseCategory) {
        const { error: updateError } = await supabase
          .from('protests')
          .update({ category: uppercaseCategory })
          .eq('id', event.id);

        if (updateError) {
          console.error(`❌ Error updating event ${event.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated "${currentCategory}" → "${uppercaseCategory}" (ID: ${event.id})`);
          updatedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    console.log('\n🎉 Category update completed!');
    console.log(`✅ Updated: ${updatedCount} events`);
    console.log(`⏭️ Skipped: ${skippedCount} events (already uppercase)`);

  } catch (error) {
    console.error('❌ Error updating categories:', error.message);
  }
}

// Run the update
updateCategoriesToUppercase();
