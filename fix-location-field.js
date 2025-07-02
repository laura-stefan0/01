import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function fixLocationField() {
  console.log('🔧 Fixing location field for existing events...');

  try {
    // Get all events where location is null
    const { data: events, error: fetchError } = await supabase
      .from('protests')
      .select('id, title, address, location')
      .is('location', null);

    if (fetchError) {
      console.error('❌ Error fetching events:', fetchError);
      return;
    }

    console.log(`📊 Found ${events.length} events with null location field`);

    for (const event of events) {
      // Try to extract city from address or use a default
      let cityName = 'Milano'; // default fallback
      
      // Common Italian cities to look for in the address
      const cities = {
        'roma': 'Roma',
        'milano': 'Milano', 
        'napoli': 'Napoli',
        'torino': 'Torino',
        'venezia': 'Venezia',
        'firenze': 'Firenze',
        'bologna': 'Bologna',
        'bari': 'Bari',
        'palermo': 'Palermo',
        'genova': 'Genova',
        'padova': 'Padova',
        'verona': 'Verona',
        'sassari': 'Sassari',
        'cagliari': 'Cagliari'
      };

      // Check if any city name appears in the title or address
      const searchText = `${event.title} ${event.address}`.toLowerCase();
      for (const [cityKey, cityValue] of Object.entries(cities)) {
        if (searchText.includes(cityKey)) {
          cityName = cityValue;
          break;
        }
      }

      // Update the event with the detected city
      const { error: updateError } = await supabase
        .from('protests')
        .update({ location: cityName })
        .eq('id', event.id);

      if (updateError) {
        console.error(`❌ Error updating event ${event.id}:`, updateError);
      } else {
        console.log(`✅ Updated "${event.title}" -> location: ${cityName}`);
      }

      // Small delay between updates
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`🎉 Completed fixing location field for ${events.length} events`);

  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

// Run the fix
fixLocationField();