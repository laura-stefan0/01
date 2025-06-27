
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo');

function getEventUrl(event) {
  const title = event.title.toLowerCase();
  const description = event.description ? event.description.toLowerCase() : '';
  const category = event.category;
  
  if (title.includes('ultima generazione') || description.includes('ultima generazione')) {
    return 'https://ultima-generazione.com/';
  }
  
  if (title.includes('arcigay') || description.includes('arcigay')) {
    return 'https://www.arcigay.it/';
  }
  
  if (title.includes('pride') || category === 'LGBTQ+') {
    if (title.includes('milano')) {
      return 'https://www.milanopride.it/';
    } else if (title.includes('roma')) {
      return 'https://www.romapride.it/';
    } else if (title.includes('torino')) {
      return 'https://www.torinopride.it/';
    } else {
      return 'https://ondapride.it/';
    }
  }
  
  if (title.includes('friday') && title.includes('future')) {
    return 'https://fridaysforfuture.org/';
  }
  
  if (title.includes('extinction rebellion')) {
    return 'https://extinctionrebellion.it/';
  }
  
  if (title.includes('non una di meno') || description.includes('non una di meno')) {
    return 'https://nonunadimeno.wordpress.com/';
  }
  
  switch (category) {
    case 'Environment':
      return 'https://www.legambiente.it/';
    case 'LGBTQ+':
      return 'https://www.gaynet.it/';
    case 'Civil & Human Rights':
      return 'https://www.amnesty.it/';
    case 'Peace & Anti-War':
      return 'https://www.pacedifesa.org/';
    case 'Labor':
      return 'https://www.cgil.it/';
    case "Women's Rights":
      return 'https://www.donneindifesa.it/';
    default:
      return 'https://www.eventbrite.it/';
  }
}

async function updateAllEvents() {
  console.log('🔄 Updating all events with event URLs...');

  try {
    const { data: events, error } = await supabase
      .from('protests')
      .select('id, title, description, category');

    if (error) {
      console.error('❌ Error fetching events:', error);
      return;
    }

    console.log(`📊 Found ${events.length} events to update`);

    for (const event of events) {
      const eventUrl = getEventUrl(event);
      
      const { error: updateError } = await supabase
        .from('protests')
        .update({ event_url: eventUrl })
        .eq('id', event.id);

      if (updateError) {
        console.error(`❌ Error updating event ${event.id}:`, updateError);
      } else {
        console.log(`✅ Updated "${event.title}" with URL: ${eventUrl}`);
      }
    }

    console.log('🎉 Finished updating all events!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateAllEvents();
