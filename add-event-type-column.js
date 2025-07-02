import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamdvYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzMzEwNzcsImV4cCI6MjAzNDkwNzA3N30.TJufVNOJ5mTjKdWIGE3cjUKAjHrpMlM4WG_S1iAk-WA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to determine event type based on title and description
function determineEventType(title, description = '') {
  const searchText = `${title} ${description}`.toLowerCase();
  
  // Define keywords for each type
  const protestKeywords = [
    'protest', 'march', 'rally', 'demonstration', 'strike', 'parade', 'pride', 'blockade', 'occupation', 'sit-in',
    'manifestazione', 'corteo', 'sciopero', 'mobilitazione', 'presidio', 'marcia', 'parata', 'assembramento',
    'blocco', 'occupazione', 'manifestare'
  ];
  
  const workshopKeywords = [
    'workshop', 'training', 'skill-share', 'legal info', 'activist education', 'course', 'formazione',
    'corso', 'laboratorio', 'addestramento', 'educazione'
  ];
  
  const assemblyKeywords = [
    'assembly', 'meeting', 'forum', 'strategy', 'open forum', 'public assembly',
    'assemblea', 'riunione', 'incontro', 'forum', 'strategia'
  ];
  
  const talkKeywords = [
    'talk', 'presentation', 'speaker', 'lecture', 'conference', 'summit',
    'presentazione', 'conferenza', 'relatore', 'intervento', 'discorso'
  ];
  
  // Check for each type in order of specificity
  if (workshopKeywords.some(keyword => searchText.includes(keyword))) {
    return 'Workshop';
  }
  
  if (assemblyKeywords.some(keyword => searchText.includes(keyword))) {
    return 'Assembly';
  }
  
  if (talkKeywords.some(keyword => searchText.includes(keyword))) {
    return 'Talk';
  }
  
  if (protestKeywords.some(keyword => searchText.includes(keyword))) {
    return 'Protest';
  }
  
  // Default to Other for political events that don't fit above categories
  return 'Other';
}

async function addEventTypeColumn() {
  console.log('🔧 Adding event_type column to protests table...');
  
  try {
    // First, try to add the column (this may fail if it already exists)
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE protests ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'Protest';"
    });
    
    if (alterError && !alterError.message.includes('already exists')) {
      console.error('❌ Error adding column:', alterError.message);
      return;
    }
    
    console.log('✅ Column added or already exists');
    
    // Fetch all existing protests
    const { data: protests, error: fetchError } = await supabase
      .from('protests')
      .select('id, title, description, event_type');
    
    if (fetchError) {
      console.error('❌ Error fetching protests:', fetchError.message);
      return;
    }
    
    console.log(`📊 Found ${protests.length} protests to analyze`);
    
    // Update each protest with determined event type
    let updatedCount = 0;
    for (const protest of protests) {
      // Only update if event_type is null or default
      if (!protest.event_type || protest.event_type === 'Protest') {
        const eventType = determineEventType(protest.title, protest.description);
        
        const { error: updateError } = await supabase
          .from('protests')
          .update({ event_type: eventType })
          .eq('id', protest.id);
        
        if (updateError) {
          console.error(`❌ Error updating protest ${protest.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated "${protest.title}" → ${eventType}`);
          updatedCount++;
        }
      }
    }
    
    console.log(`🎉 Successfully updated ${updatedCount} protests with event types`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the function
addEventTypeColumn();