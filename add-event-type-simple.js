import { supabaseAdmin } from './db/index.js';

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
  console.log('🔧 Adding event_type column and categorizing events...');
  
  try {
    // First, add the column if it doesn't exist
    const { error: alterError } = await supabaseAdmin
      .rpc('exec', {
        sql: "ALTER TABLE protests ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'Protest';"
      });
    
    if (alterError) {
      console.log('📝 Column likely already exists:', alterError.message);
    } else {
      console.log('✅ Column added successfully');
    }
    
    // Fetch all existing protests
    const { data: protests, error: fetchError } = await supabaseAdmin
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
      const eventType = determineEventType(protest.title, protest.description);
      
      const { error: updateError } = await supabaseAdmin
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
    
    console.log(`🎉 Successfully updated ${updatedCount} protests with event types`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the function
addEventTypeColumn();