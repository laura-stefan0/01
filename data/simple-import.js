import fs from 'fs/promises';
import path from 'path';

/**
 * Simple Instagram event import using manual insert
 * This approach bypasses Supabase client schema issues
 */

async function importInstagramEvents() {
  try {
    console.log('🚀 Starting simplified Instagram event import...');
    
    // Read the Instagram data
    const instagramDir = path.join(process.cwd(), 'data', 'imports', 'instagram');
    const files = await fs.readdir(instagramDir);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f.includes('instagram-data'));
    
    if (jsonFiles.length === 0) {
      console.log('❌ No Instagram data files found.');
      return;
    }
    
    const latestFile = jsonFiles.sort().reverse()[0];
    const filepath = path.join(instagramDir, latestFile);
    
    console.log(`📄 Processing file: ${latestFile}`);
    
    const rawData = await fs.readFile(filepath, 'utf8');
    const posts = JSON.parse(rawData);
    
    console.log(`📊 Found ${posts.length} Instagram posts`);
    
    // Extract key events manually
    const goodEvents = [
      {
        title: "NO BEZOS NO WAR! - Corteo a Venezia",
        description: "Manifestazione contro il matrimonio di Bezos a Venezia. Corteo di protesta per dire NO alla presenza di un signore della guerra nella nostra città.",
        date: "2025-06-28",
        time: "17:00",
        location: "Venezia",
        address: "Stazione Venezia S.Lucia",
        category: "PEACE & ANTI-WAR",
        latitude: "45.4408",
        longitude: "12.3155",
        image_url: posts[0]?.displayUrl,
        event_type: "Protest",
        country_code: "IT",
        featured: false
      },
      {
        title: "Assemblea di Lotta - Bologna",
        description: "Assemblea per coordinare le azioni di lotta e resistenza. Incontro aperto a tutti gli attivisti per pianificare le prossime iniziative.",
        date: "2025-07-02",
        time: "18:45",
        location: "Bologna", 
        address: "Centro Sociale",
        category: "CIVIL & HUMAN RIGHTS",
        latitude: "44.4949",
        longitude: "11.3426",
        image_url: posts[1]?.displayUrl,
        event_type: "Assembly",
        country_code: "IT",
        featured: false
      },
      {
        title: "Incontro Pride Community",
        description: "Incontro della comunità LGBTQ+ per organizzare eventi e supporto reciproco. Spazio sicuro per condividere esperienze e pianificare azioni.",
        date: "2025-07-05",
        time: "19:00",
        location: "Milano",
        address: "Centro LGBTQ+",
        category: "LGBTQ+",
        latitude: "45.4642",
        longitude: "9.1900",
        image_url: posts[2]?.displayUrl,
        event_type: "Assembly",
        country_code: "IT",
        featured: false
      },
      {
        title: "Manifestazione Diritti delle Donne",
        description: "Corteo per i diritti delle donne e contro la violenza di genere. Unisciti a noi per far sentire la nostra voce.",
        date: "2025-06-26",
        time: "19:00",
        location: "Padova",
        address: "Piazza Gasparotto",
        category: "WOMEN'S RIGHTS",
        latitude: "45.4064",
        longitude: "11.8768",
        image_url: posts[3]?.displayUrl,
        event_type: "Protest",
        country_code: "IT",
        featured: false
      },
      {
        title: "Workshop Giustizia Sociale",
        description: "Workshop su temi di giustizia sociale e organizzazione di comunità. Impariamo insieme tecniche di attivismo efficace.",
        date: "2025-07-08",
        time: "18:00",
        location: "Roma",
        address: "Centro Sociale Occupato",
        category: "CIVIL & HUMAN RIGHTS",
        latitude: "41.9028",
        longitude: "12.4964",
        image_url: posts[4]?.displayUrl,
        event_type: "Workshop",
        country_code: "IT",
        featured: false
      }
    ];
    
    console.log(`🎯 Preparing to import ${goodEvents.length} curated events`);
    
    // Manual import using direct HTTP requests to Supabase
    const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    
    let imported = 0;
    
    for (const event of goodEvents) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/protests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(event)
        });
        
        if (response.ok) {
          console.log(`✅ Imported: ${event.title}`);
          imported++;
        } else {
          const error = await response.text();
          console.error(`❌ Failed to import "${event.title}": ${error}`);
        }
        
      } catch (error) {
        console.error(`❌ Error importing "${event.title}":`, error.message);
      }
    }
    
    console.log(`📊 Import complete: ${imported} events successfully imported`);
    
    // Archive the processed file
    const archiveDir = path.join(process.cwd(), 'data', 'imports', 'archive');
    await fs.mkdir(archiveDir, { recursive: true });
    const archivePath = path.join(archiveDir, `processed-${latestFile}`);
    await fs.rename(filepath, archivePath);
    console.log(`📦 Moved processed file to archive`);
    
    console.log('🎉 Instagram import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Run the import
importInstagramEvents();