import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function findSpecificCards() {
  console.log('🔍 Searching for specific cards...');
  
  try {
    // Search in protests table
    console.log('\n📍 Searching protests table:');
    const { data: protests, error: protestError } = await supabase
      .from('protests')
      .select('*')
      .or('title.ilike.%Find protests%,title.ilike.%Know Your Rights%,description.ilike.%Find protests%,description.ilike.%Know Your Rights%');
    
    if (protestError) {
      console.error('❌ Error searching protests:', protestError);
    } else {
      console.log(`Found ${protests?.length || 0} matching protests:`);
      protests?.forEach(p => console.log(`  - "${p.title}": ${p.description}`));
    }
    
    // Search in whats_new table
    console.log('\n📰 Searching whats_new table:');
    const { data: news, error: newsError } = await supabase
      .from('whats_new')
      .select('*')
      .or('title.ilike.%Find protests%,title.ilike.%Know Your Rights%,body.ilike.%Find protests%,body.ilike.%Know Your Rights%');
    
    if (newsError) {
      console.error('❌ Error searching whats_new:', newsError);
    } else {
      console.log(`Found ${news?.length || 0} matching news items:`);
      news?.forEach(n => console.log(`  - "${n.title}": ${n.body || n.summary}`));
    }
    
    // Search in safety-tips table
    console.log('\n🛡️ Searching safety-tips table:');
    const { data: safety, error: safetyError } = await supabase
      .from('safety-tips')
      .select('*')
      .or('title.ilike.%Find protests%,title.ilike.%Know Your Rights%,description.ilike.%Find protests%,description.ilike.%Know Your Rights%');
    
    if (safetyError) {
      console.error('❌ Error searching safety-tips:', safetyError);
    } else {
      console.log(`Found ${safety?.length || 0} matching safety tips:`);
      safety?.forEach(s => console.log(`  - "${s.title}": ${s.description}`));
    }
    
    // Search in laws table  
    console.log('\n⚖️ Searching laws table:');
    const { data: laws, error: lawsError } = await supabase
      .from('laws')
      .select('*')
      .or('title.ilike.%Find protests%,title.ilike.%Know Your Rights%,description.ilike.%Find protests%,description.ilike.%Know Your Rights%');
    
    if (lawsError) {
      console.error('❌ Error searching laws:', lawsError);
    } else {
      console.log(`Found ${laws?.length || 0} matching laws:`);
      laws?.forEach(l => console.log(`  - "${l.title}": ${l.description}`));
    }
    
    // Let's also create test cards with these exact titles
    console.log('\n➕ Creating test cards with requested titles...');
    
    // Add "Find protests in your area" card
    const { data: findCard, error: findError } = await supabase
      .from('whats_new')
      .upsert({
        title: 'Find protests in your area',
        body: 'Discover upcoming protests and activism events happening near you',
        summary: 'Discover upcoming protests and activism events happening near you',
        image_url: 'https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/whats-new/find-protests.svg',
        cta_text: 'Search Events',
        cta_url: '/filter',
        country_code: 'IT',
        visible: true
      }, { onConflict: 'title' })
      .select();
    
    if (findError) {
      console.error('❌ Error creating "Find protests" card:', findError);
    } else {
      console.log('✅ Created "Find protests in your area" card');
    }
    
    // Add "Know Your Rights in Italy" card
    const { data: rightsCard, error: rightsError } = await supabase
      .from('whats_new')
      .upsert({
        title: 'Know Your Rights in Italy',
        body: 'Essential legal information for asylum seekers and refugees in Italy',
        summary: 'Essential legal information for asylum seekers and refugees in Italy',
        image_url: 'https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/whats-new/know-rights-italy.svg',
        cta_text: 'Learn Your Rights',
        cta_url: 'https://help.unhcr.org/italy/asylum-italy/rights/',
        country_code: 'IT',
        visible: true
      }, { onConflict: 'title' })
      .select();
    
    if (rightsError) {
      console.error('❌ Error creating "Know Your Rights" card:', rightsError);
    } else {
      console.log('✅ Created "Know Your Rights in Italy" card');
    }
    
    console.log('\n🎉 Done! The cards should now appear in the "What\'s new" section for Italy.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findSpecificCards();