
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is missing!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to get appropriate event URL based on event details
function getEventUrl(event) {
  const title = event.title.toLowerCase();
  const description = event.description ? event.description.toLowerCase() : '';
  const category = event.category;
  
  // Check for specific organizations or event types
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
  
  // Category-based fallbacks
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

// Function to update existing events with event URLs
async function updateEventUrls() {
  try {
    console.log('🔍 Fetching all events without event_url...');

    // Get all events that don't have an event_url
    const { data: events, error } = await supabase
      .from('protests')
      .select('id, title, description, category, location')
      .or('event_url.is.null,event_url.eq.""');

    if (error) {
      console.error('❌ Error fetching events:', error);
      return;
    }

    console.log(`📊 Found ${events.length} events without event URLs`);

    let updatedCount = 0;

    for (const event of events) {
      console.log(`🔗 Processing event: ${event.title}`);

      const eventUrl = getEventUrl(event);

      if (eventUrl) {
        const { error: updateError } = await supabase
          .from('protests')
          .update({ event_url: eventUrl })
          .eq('id', event.id);

        if (updateError) {
          console.error(`❌ Error updating event ${event.id}:`, updateError);
        } else {
          console.log(`✅ Updated "${event.title}" with URL: ${eventUrl}`);
          updatedCount++;
        }
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} events with event URLs!`);
  } catch (error) {
    console.error('❌ Error in updateEventUrls:', error);
  }
}

// Run the update
updateEventUrls();
