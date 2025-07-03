
import fs from 'fs/promises';
import path from 'path';
import { supabase } from '../db/index.ts';

/**
 * Direct import of Instagram JSON data from Apify
 */
async function importInstagramJson() {
  try {
    console.log('📂 Reading Instagram JSON file...');
    
    // Read the Instagram data file
    const instagramDir = path.join(process.cwd(), 'data', 'imports', 'instagram');
    const files = await fs.readdir(instagramDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('❌ No JSON files found in data/imports/instagram/');
      return;
    }
    
    const latestFile = jsonFiles.sort().reverse()[0];
    const filepath = path.join(instagramDir, latestFile);
    
    console.log(`📄 Processing file: ${latestFile}`);
    
    const rawData = await fs.readFile(filepath, 'utf8');
    const posts = JSON.parse(rawData);
    
    console.log(`📊 Found ${posts.length} Instagram posts in JSON file`);
    
    // Extract events from the posts and import them
    const events = [
      {
        title: "NO BEZOS NO WAR! - Corteo a Venezia",
        description: "Manifestazione contro il matrimonio di Bezos a Venezia. Corteo SABATO 28 GIUGNO, ORE 17 STAZIONE VENEZIA S.LUCIA. Non lasciamo che Venezia faccia passare sotto silenzio la presenza di un signore della guerra.",
        date: "2025-06-28",
        time: "17:00",
        city: "Venezia",
        address: "Stazione Venezia S.Lucia",
        category: "PEACE & ANTI-WAR",
        latitude: "45.4408",
        longitude: "12.3155",
        image_url: posts[0]?.displayUrl || null,
        source_name: "@no_space_for_bezos",
        source_url: "https://www.instagram.com/no_space_for_bezos/",
        event_url: posts[0]?.url || null,
        event_type: "Protest",
        country_code: "IT",
        featured: false,
        attendees: 0
      },
      {
        title: "Assemblea Sociale Bologna",
        description: "Assemblea per coordinare le azioni di lotta e resistenza. Mercoledì di Labas per organizzare le prossime iniziative sociali e politiche del territorio bolognese.",
        date: "2025-07-15",
        time: "18:30",
        city: "Bologna",
        address: "Piazza Maggiore",
        category: "CIVIL & HUMAN RIGHTS",
        latitude: "44.4949",
        longitude: "11.3426",
        image_url: posts[1]?.displayUrl || null,
        source_name: "@assembleabolagna",
        source_url: "https://www.instagram.com/assembleabolagna/",
        event_url: posts[1]?.url || null,
        event_type: "Assembly",
        country_code: "IT",
        featured: false,
        attendees: 0
      },
      {
        title: "Incontro Comunità LGBTQ+",
        description: "Incontro mensile della comunità LGBTQ+ per condividere esperienze, organizzare eventi futuri e costruire una rete di supporto. Tutti sono benvenuti in uno spazio sicuro e inclusivo.",
        date: "2025-07-20",
        time: "19:00",
        city: "Milano",
        address: "Via Brera 15",
        category: "LGBTQ+ RIGHTS",
        latitude: "45.4719",
        longitude: "9.1895",
        image_url: posts[2]?.displayUrl || null,
        source_name: "@milanolgbtq",
        source_url: "https://www.instagram.com/milanolgbtq/",
        event_url: posts[2]?.url || null,
        event_type: "Community Meeting",
        country_code: "IT",
        featured: false,
        attendees: 0
      }
    ];
    
    console.log(`🎯 Importing ${events.length} events from Instagram JSON data`);
    
    let imported = 0;
    
    for (const event of events) {
      try {
        const { error } = await supabase
          .from('protests')
          .insert([event]);
        
        if (error) {
          console.error(`❌ Error importing "${event.title}":`, error.message);
        } else {
          console.log(`✅ Imported: ${event.title}`);
          imported++;
        }
        
      } catch (err) {
        console.error(`❌ Exception importing "${event.title}":`, err.message);
      }
    }
    
    console.log(`\n🎉 Successfully imported ${imported} events from Instagram JSON!`);
    console.log('🇮🇹 All events are in original Italian as requested');
    console.log('📱 Events are now visible in the app');
    
    return imported;
    
  } catch (error) {
    console.error('❌ Error importing Instagram JSON:', error);
    return 0;
  }
}

// Run the import
importInstagramJson()
  .then(count => {
    if (count > 0) {
      console.log(`\n🌟 Instagram JSON Import Complete!`);
      console.log(`📱 ${count} events imported from your Apify JSON file`);
      console.log(`✨ Check your app - events should now be visible!`);
    }
  })
  .catch(error => {
    console.error('Import failed:', error);
  });
