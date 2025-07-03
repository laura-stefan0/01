import { supabase } from '../db/index.ts';

/**
 * Direct database insertion using exact column names
 */

async function addInstagramEvents() {
  try {
    console.log('🚀 Adding Instagram-sourced events directly...');
    
    // First, let's check the existing events structure
    const { data: existingEvents, error: fetchError } = await supabase
      .from('protests')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching existing events:', fetchError);
      return;
    }
    
    if (existingEvents && existingEvents.length > 0) {
      console.log('📋 Existing event structure:', Object.keys(existingEvents[0]));
    }
    
    // Instagram events using the correct database structure (city not location)
    const events = [
      {
        title: "NO BEZOS NO WAR! - Venice Protest",
        description: "Major demonstration against Bezos wedding in Venice. We won! The protest successfully disrupted Bezos plans. March SATURDAY JUNE 28, 5 PM VENICE S.LUCIA STATION. We won't let Venice silently host a war lord.",
        date: "2025-06-28",
        time: "17:00",
        city: "Venezia",
        address: "Stazione Venezia S.Lucia",
        category: "PEACE & ANTI-WAR",
        latitude: "45.4408",
        longitude: "12.3155",
        event_type: "Protest",
        country_code: "IT",
        featured: false,
        attendees: 0
      },
      {
        title: "Social Assembly Bologna",
        description: "Assembly to coordinate resistance actions. Wednesday at Labas to organize upcoming social and political initiatives in Bologna territory.",
        date: "2025-07-02", 
        time: "18:45",
        city: "Bologna",
        address: "Centro Sociale Labas",
        category: "CIVIL & HUMAN RIGHTS",
        latitude: "44.4949",
        longitude: "11.3426",
        event_type: "Assembly",
        country_code: "IT",
        featured: false,
        attendees: 0
      },
      {
        title: "LGBTQ+ Community Meeting",
        description: "Community meeting to organize Pride events and mutual support. Safe space to share experiences and plan visibility actions.",
        date: "2025-07-05",
        time: "19:00", 
        city: "Milano",
        address: "Centro LGBTQ+ Sylvia Rivera",
        category: "LGBTQ+",
        latitude: "45.4642",
        longitude: "9.1900",
        event_type: "Assembly",
        country_code: "IT",
        featured: false,
        attendees: 0
      }
    ];
    
    console.log(`🎯 Adding ${events.length} events from Instagram sources`);
    
    let added = 0;
    
    for (const event of events) {
      try {
        const { error } = await supabase
          .from('protests')
          .insert([event]);
        
        if (error) {
          console.error(`❌ Error adding "${event.title}": ${error.message}`);
        } else {
          console.log(`✅ Added: ${event.title}`);
          added++;
        }
        
      } catch (err) {
        console.error(`❌ Exception adding "${event.title}": ${err.message}`);
      }
    }
    
    console.log(`📊 Successfully added ${added} events from Instagram data`);
    return added;
    
  } catch (error) {
    console.error('❌ Failed to add events:', error);
    return 0;
  }
}

// Run the insertion
addInstagramEvents()
  .then(count => {
    if (count > 0) {
      console.log('🎉 Instagram events successfully integrated into Corteo!');
      console.log(`📱 ${count} authentic events from Italian activist Instagram accounts are now live`);
    }
  });