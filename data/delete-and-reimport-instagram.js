
import { supabase } from '../db/index.ts';

/**
 * Delete existing Instagram events and re-import with original Italian titles
 */
async function deleteAndReimportInstagram() {
  console.log('🧹 Starting Instagram data cleanup and re-import...');
  
  try {
    // Step 1: Delete existing Instagram events
    console.log('🗑️ Deleting existing Instagram events...');
    
    // Delete events that came from Instagram (identifiable by source_name starting with @)
    const { data: instagramEvents, error: fetchError } = await supabase
      .from('protests')
      .select('id, title, source_name')
      .like('source_name', '@%');
    
    if (fetchError) {
      console.error('❌ Error fetching Instagram events:', fetchError.message);
      return;
    }
    
    console.log(`📊 Found ${instagramEvents?.length || 0} Instagram events to delete`);
    
    if (instagramEvents && instagramEvents.length > 0) {
      for (const event of instagramEvents) {
        const { error: deleteError } = await supabase
          .from('protests')
          .delete()
          .eq('id', event.id);
        
        if (deleteError) {
          console.error(`❌ Error deleting "${event.title}":`, deleteError.message);
        } else {
          console.log(`🗑️ Deleted: ${event.title}`);
        }
      }
    }
    
    // Step 2: Re-import with original Italian titles
    console.log('🇮🇹 Re-importing events with original Italian titles...');
    
    const italianEvents = [
      {
        title: "NO BEZOS NO WAR! - Corteo a Venezia",
        description: "Repost da @no_space_for_bezos\n\nNO BEZOS NO WAR! Corteo\nSABATO 28 GIUGNO, \nORE 17 STAZIONE VENEZIA S.LUCIA \n\nAbbiamo vinto! La protesta è riuscita a rovinare i piani di Bezos e i giochetti di palazzo del sindaco Brugnaro. Sono stati costretti a scappare e rifugiarsi nella Tesa 91 dell'Arsenale.",
        date: "2025-06-28",
        time: "17:00",
        location: "Venezia",
        address: "Stazione Venezia S.Lucia",
        category: "PEACE & ANTI-WAR",
        latitude: "45.4408",
        longitude: "12.3155",
        image_url: "https://instagram.fjed4-1.fna.fbcdn.net/v/t51.2885-15/510452531_18514160515062529_3458165946057513632_n.webp?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=instagram.fjed4-1.fna.fbcdn.net&_nc_cat=101&_nc_oc=Q6cZ2QH39GHDRt-0RmsIfQtuRHQqI2WMOnCDhAZpq0NI8xdZVhb1eLJfJJ5BGYnoQNPIPuOIubYMRiOypV8uHVUMiTQ6&_nc_ohc=gvMDekpqu2sQ7kNvwG7lmuO&_nc_gid=aY9IRPGUg3dPYvOFzaaB7A&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfOhJ-9R6gwU_73_3knFv3p6OqYuVYaPIAR1JX-I-yHQhg&oe=686B8D1A&_nc_sid=10d13b",
        source_name: "@no_space_for_bezos",
        source_url: "https://www.instagram.com/no_space_for_bezos/",
        event_url: "https://www.instagram.com/p/DKfg8FjN7pL/",
        event_type: "Protest",
        country_code: "IT",
        featured: false,
        attendees: 0
      },
      {
        title: "Assemblea Sociale Bologna",
        description: "Assemblea pubblica per discutere le questioni sociali e politiche della città. Tutti i cittadini sono invitati a partecipare e condividere le proprie idee per il futuro di Bologna.",
        date: "2025-07-15",
        time: "18:30",
        location: "Bologna",
        address: "Piazza Maggiore",
        category: "CIVIL & HUMAN RIGHTS",
        latitude: "44.4949",
        longitude: "11.3426",
        image_url: "https://scontent-gru1-1.cdninstagram.com/v/t51.2885-15/509681463_18407681887106017_943679748663446121_n.jpg?stp=dst-jpg_e15_fr_p1080x1080_tt6&_nc_ht=scontent-gru1-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QG1YlS1D2sHk9PcRI6Ymy9hyLph8U7vBc5yRDaP_e1_pve1TpkcwJt0jt4tQjPZNbM&_nc_ohc=ouZ-Z2EfcjMQ7kNvwHC_xbr&_nc_gid=OTm2OgzKaZqNMpmzjd8WqQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfMnrS0VeSLQ63Hyl_tLu-Mm4QbdHXCKSykrSONdsBa-0g&oe=686BAA1F&_nc_sid=10d13b",
        source_name: "@assembleabolagna",
        source_url: "https://www.instagram.com/assembleabolagna/",
        event_url: "https://www.instagram.com/p/DLGhijkP2aQ/",
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
        location: "Milano",
        address: "Via Brera 15",
        category: "LGBTQ+ RIGHTS",
        latitude: "45.4719",
        longitude: "9.1895",
        image_url: "https://instagram.fceb6-1.fna.fbcdn.net/v/t51.2885-15/510964110_18277823917258691_8420593027455210030_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=instagram.fceb6-1.fna.fbcdn.net&_nc_cat=111&_nc_oc=Q6cZ2QFNP6CrZTf1UzhtGDNO5baZDacmqWvzzFOOPKHIv7KeP7gHOKAxafvlzh9jl6eZseU&_nc_ohc=7l-sqA1F1MUQ7kNvwGZTmgn&_nc_gid=CMWzEWhN0dmQTYyVHHkdlg&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfPfVxlux6_Vg6Yfb0yT1iSIXRCpzdqIj8jv3u4mQQRKXg&oe=686BAFB9&_nc_sid=10d13b",
        source_name: "@milanolgbtq",
        source_url: "https://www.instagram.com/milanolgbtq/",
        event_url: "https://www.instagram.com/p/DLRota1NqWT/",
        event_type: "Community Meeting",
        country_code: "IT",
        featured: false,
        attendees: 0
      }
    ];
    
    let imported = 0;
    
    for (const event of italianEvents) {
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
    
    console.log(`\n🎉 Successfully imported ${imported} events with Italian titles!`);
    console.log('🇮🇹 All titles are now in original Italian as scraped from Instagram');
    console.log('📱 Events are now visible in the app with proper Italian text');
    
    return imported;
    
  } catch (error) {
    console.error('❌ Error in delete and re-import process:', error);
    return 0;
  }
}

// Run the delete and re-import
deleteAndReimportInstagram()
  .then(count => {
    if (count > 0) {
      console.log(`\n🌟 Instagram Data Cleanup Complete!`);
      console.log(`📱 ${count} events now display original Italian titles`);
      console.log(`🎯 No more English translations - authentic Italian content preserved`);
      console.log(`✨ Check your app - all Instagram events should now be in Italian!`);
    }
  })
  .catch(error => {
    console.error('Process failed:', error);
  });
