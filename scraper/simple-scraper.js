
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const { load } = require('cheerio');

// Initialize Supabase client
const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample protest data for testing
const sampleEvents = [
  {
    title: 'Manifestazione per il Clima - Milano',
    description: 'Corteo per la giustizia climatica e contro il riscaldamento globale. Partecipazione aperta a tutti.',
    category: 'environment',
    location: 'Milano',
    address: 'Piazza Duomo, Milano, Italy',
    latitude: '45.4642',
    longitude: '9.1900',
    date: '2025-02-15',
    time: '15:00',
    image_url: 'https://images.unsplash.com/photo-1569163139394-de44cb4e4ddb?w=500&h=300&fit=crop&auto=format',
    country_code: 'IT',
    featured: false,
    attendees: 0
  },
  {
    title: 'Pride Roma 2025',
    description: 'Marcia per i diritti LGBTQ+ e contro le discriminazioni. Evento organizzato da Arcigay Roma.',
    category: 'lgbtq+',
    location: 'Roma',
    address: 'Piazza della Repubblica, Roma, Italy',
    latitude: '41.9028',
    longitude: '12.4964',
    date: '2025-06-28',
    time: '16:00',
    image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop&auto=format',
    country_code: 'IT',
    featured: true,
    attendees: 0
  },
  {
    title: 'Sciopero Generale - Torino',
    description: 'Sciopero generale per i diritti dei lavoratori e contro la precarietà. Organizzato dai sindacati.',
    category: 'labor',
    location: 'Torino',
    address: 'Piazza Castello, Torino, Italy',
    latitude: '45.0703',
    longitude: '7.6869',
    date: '2025-03-08',
    time: '09:00',
    image_url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500&h=300&fit=crop&auto=format',
    country_code: 'IT',
    featured: false,
    attendees: 0
  },
  {
    title: 'Marcia per la Pace - Napoli',
    description: 'Manifestazione pacifista contro la guerra e per la solidarietà internazionale.',
    category: 'peace & anti-war',
    location: 'Napoli',
    address: 'Piazza del Plebiscito, Napoli, Italy',
    latitude: '40.8518',
    longitude: '14.2681',
    date: '2025-04-25',
    time: '17:00',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop&auto=format',
    country_code: 'IT',
    featured: false,
    attendees: 0
  },
  {
    title: 'Assemblea Pubblica - Bologna',
    description: 'Assemblea cittadina per discutere di giustizia sociale e diritti civili.',
    category: 'civil & human rights',
    location: 'Bologna',
    address: 'Piazza Maggiore, Bologna, Italy',
    latitude: '44.4949',
    longitude: '11.3426',
    date: '2025-02-20',
    time: '18:30',
    image_url: 'https://images.unsplash.com/photo-1585515656559-a9dc1f06cc13?w=500&h=300&fit=crop&auto=format',
    country_code: 'IT',
    featured: false,
    attendees: 0
  }
];

async function saveEventToDatabase(event) {
  try {
    console.log(`💾 Saving: "${event.title}"`);
    
    // Add missing required fields based on database schema
    const eventData = {
      ...event,
      source_name: 'simple-scraper',
      source_url: 'manual-entry',
      scraped_at: new Date().toISOString()
    };
    
    console.log(`📋 Event data:`, eventData);
    
    const { data, error } = await supabase
      .from('protests')
      .insert([eventData])
      .select();
    
    if (error) {
      console.error('❌ Error inserting event:', error);
      console.error('❌ Full error details:', JSON.stringify(error, null, 2));
      return false;
    }
    
    console.log(`✅ Saved: "${eventData.title}" (ID: ${data[0].id})`);
    return true;
    
  } catch (error) {
    console.error('❌ Error in saveEventToDatabase:', error);
    console.error('❌ Stack trace:', error.stack);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Simple Italian Protest Scraper...');
  
  let savedCount = 0;
  
  for (const event of sampleEvents) {
    const success = await saveEventToDatabase(event);
    if (success) {
      savedCount++;
    }
    
    // Small delay between saves
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n🎉 Scraping completed!`);
  console.log(`✅ Events saved to database: ${savedCount}`);
  console.log(`📊 Total events processed: ${sampleEvents.length}`);
}

// Run the scraper
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
