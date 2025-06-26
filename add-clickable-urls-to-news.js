import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addClickableUrls() {
  console.log('🔗 Adding clickable URLs to What\'s New cards...');
  
  try {
    // Get all current news items
    const { data: allItems, error: fetchError } = await supabase
      .from('whats_new')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Error fetching news items:', fetchError);
      return;
    }
    
    console.log(`📰 Found ${allItems?.length || 0} news items to update`);
    
    // Define URL updates based on titles and content
    const urlUpdates = [
      // US Items
      {
        condition: (item) => item.title?.includes('March for Democracy'),
        updates: {
          cta_url: 'https://www.fairvote.org/',
          cta_text: 'Learn About Voting Rights'
        }
      },
      {
        condition: (item) => item.title?.includes('Labor Strike'),
        updates: {
          cta_url: '/resources',
          cta_text: 'Worker Resources'
        }
      },
      // IT Items  
      {
        condition: (item) => item.title?.includes('Roma Students'),
        updates: {
          cta_url: '/know-your-rights',
          cta_text: 'Student Rights Guide'
        }
      },
      {
        condition: (item) => item.title?.includes('Student Movement Gains'),
        updates: {
          cta_url: 'https://www.udu.it/',
          cta_text: 'Join Student Union'
        }
      },
      {
        condition: (item) => item.title?.includes('Workers Unite for Fair'),
        updates: {
          cta_url: '/resources',
          cta_text: 'Labor Resources'
        }
      },
      {
        condition: (item) => item.title?.includes('Climate Activists Rally'),
        updates: {
          cta_url: 'https://fridaysforfuture.org/',
          cta_text: 'Join Climate Action'
        }
      },
      // Test item
      {
        condition: (item) => item.title === 'Test',
        updates: {
          cta_url: '/transparency',
          cta_text: 'Test Link'
        }
      }
    ];
    
    // Process each item
    for (const item of allItems || []) {
      const matchingUpdate = urlUpdates.find(update => update.condition(item));
      
      if (matchingUpdate) {
        console.log(`🔗 Updating "${item.title}" with URL: ${matchingUpdate.updates.cta_url}`);
        
        const { error: updateError } = await supabase
          .from('whats_new')
          .update(matchingUpdate.updates)
          .eq('id', item.id);
        
        if (updateError) {
          console.error(`❌ Error updating "${item.title}":`, updateError);
        } else {
          console.log(`✅ Updated "${item.title}"`);
        }
      } else {
        console.log(`⏭️ No URL update needed for "${item.title}"`);
      }
    }
    
    // Verify updates
    console.log('\n📊 Verification - checking updated items:');
    const { data: updatedItems, error: verifyError } = await supabase
      .from('whats_new')
      .select('title, cta_url, cta_text, country_code')
      .order('created_at', { ascending: false });
    
    if (verifyError) {
      console.error('❌ Error during verification:', verifyError);
      return;
    }
    
    updatedItems?.forEach((item, index) => {
      const hasUrl = item.cta_url && item.cta_url !== null;
      console.log(`  ${index + 1}. "${item.title}" (${item.country_code}) - ${hasUrl ? `✅ ${item.cta_url}` : '❌ No URL'}`);
    });
    
    const itemsWithUrls = updatedItems?.filter(item => item.cta_url && item.cta_url !== null).length || 0;
    console.log(`\n🎉 Successfully added clickable URLs to ${itemsWithUrls}/${updatedItems?.length || 0} news items!`);
    
  } catch (error) {
    console.error('❌ Error adding clickable URLs:', error);
  }
}

addClickableUrls();