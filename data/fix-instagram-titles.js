
import { supabase } from '../db/index.ts';
import fs from 'fs/promises';
import path from 'path';

/**
 * Delete existing Instagram events and re-import with proper Italian titles
 */
async function fixInstagramTitles() {
  try {
    console.log('🧹 Deleting existing Instagram events...');
    
    // Delete events that were imported from Instagram (they have specific titles we can identify)
    const instagramTitles = [
      'NO BEZOS NO WAR! - Venice Protest',
      'Social Assembly Bologna',
      'LGBTQ+ Community Meeting',
      'NO BEZOS NO WAR! - Corteo a Venezia'
    ];
    
    for (const title of instagramTitles) {
      const { error } = await supabase
        .from('protests')
        .delete()
        .eq('title', title);
      
      if (error) {
        console.error(`❌ Error deleting "${title}":`, error.message);
      } else {
        console.log(`🗑️ Deleted: ${title}`);
      }
    }
    
    console.log('✅ Existing Instagram events deleted');
    
    // Now import with proper Italian titles from the actual Instagram data
    console.log('🇮🇹 Re-importing events with original Italian titles...');
    
    const italianEvents = [
      {
        title: "NO BEZOS NO WAR! - Corteo Venezia",
        description: "Repost da @no_space_for_bezos\n\nNO BEZOS NO WAR! Corteo\nSABATO 28 GIUGNO, \nORE 17 STAZIONE VENEZIA S.LUCIA \n\nAbbiamo vinto! La protesta è riuscita a rovinare i piani di Bezos e I giochetti di palazzo del sindaco Brugnaro. Sono stati costretti a scappare e rifugiarsi nella Tesa 91 dell'Arsenale.",
        date: "2025-06-28",
        time: "17:00",
        city: "Venezia",
        address: "Stazione Venezia S.Lucia",
        category: "PEACE & ANTI-WAR",
        latitude: "45.4408",
        longitude: "12.3155",
        image_url: "https://instagram.fjed4-1.fna.fbcdn.net/v/t51.2885-15/510452531_18514160515062529_3458165946057513632_n.webp?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=instagram.fjed4-1.fna.fbcdn.net&_nc_cat=101&_nc_oc=Q6cZ2QH39GHDRt-0RmsIfQtuRHQqI2WMOnCDhAZpq0NI8xdZVhb1eLJfJJ5BGYnoQNPIPuOIubYMRiOypV8uHVUMiTQ6&_nc_ohc=gvMDekpqu2sQ7kNvwG7lmuO&_nc_gid=aY9IRPGUg3dPYvOFzaaB7A&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfOhJ-9R6gwU_73_3knFv3p6OqYuVYaPIAR1JX-I-yHQhg&oe=686B8D1A&_nc_sid=10d13b",
        source_name: "@comitatonograndinavi",
        source_url: "https://www.instagram.com/comitatonograndinavi/",
        event_url: "https://www.instagram.com/p/DLR-6hmt61g/",
        event_type: "Protest",
        country_code: "IT",
        featured: false,
        attendees: 0
      },
      {
        title: "Multiservizi o multi sfruttamento? CCNL Pulizie/Multiservizi",
        description: "Per i sindacati confederali 7,8 euro lorde all'ora sono una paga dignitosa! Siglata pochi giorni fa l'ipotesi di accordo tra associazioni di categoria e sindacati confederali per il rinnovo del contratto collettivo Multiservizi pulizia.",
        date: "2025-07-02",
        time: "18:45",
        city: "Bologna",
        address: "Sede ADL Cobas",
        category: "LABOR",
        latitude: "44.4949",
        longitude: "11.3426",
        image_url: "https://scontent-iev1-1.cdninstagram.com/v/t51.29350-15/509621374_705281115480066_6842651166828841284_n.heic?stp=dst-jpg_e35_s1080x1080_tt6&_nc_ht=scontent-iev1-1.cdninstagram.com&_nc_cat=106&_nc_oc=Q6cZ2QHRqV9JyVDs6cC2_PQCk8_erksyaRDks-trW_8CZ4ZWPai4zD5JXcROADdZEZLZoao&_nc_ohc=u9SdAc4od24Q7kNvwFDmP3a&_nc_gid=8oMedshLjDe7DlDatNKREQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfOhJiNnDG-46IUerMoYrd8PHbW2WZl_y4OD4Y1Lsdxqzw&oe=686BBD8B&_nc_sid=10d13b",
        source_name: "@adl_cobas",
        source_url: "https://www.instagram.com/adl_cobas/",
        event_url: "https://www.instagram.com/p/DLaBxivss5Z/",
        event_type: "Assembly",
        country_code: "IT",
        featured: false,
        attendees: 0
      },
      {
        title: "Giustizia per Mario Paciolla - Proiezione documentario",
        description: "Pochi minuti fa il gip di Roma ha archiviato l'indagine relativa alla morte del cooperante italiano Mario Paciolla. Anna e Pino saranno a Villa Celestina giovedì 3 luglio, per parlare della storia del figlio, della sua vita e della sua morte, della lotta di questi cinque anni per avere verità e giustizia.",
        date: "2025-07-03",
        time: "21:00",
        city: "Bologna",
        address: "Villa Celestina",
        category: "CIVIL & HUMAN RIGHTS",
        latitude: "44.4949",
        longitude: "11.3426",
        image_url: "https://scontent-mia3-1.cdninstagram.com/v/t51.29350-15/511526615_4037153866530954_8685750175756040628_n.heic?stp=dst-jpg_e35_p1080x1080_tt6&_nc_ht=scontent-mia3-1.cdninstagram.com&_nc_cat=106&_nc_oc=Q6cZ2QFhpNM8j0GcUXQ6ZN2RrGUvWVOgv5v24OTNIjXQCvfcVuuI9oUDsbx26ABZVBkgsqg&_nc_ohc=1AErv_NLNuUQ7kNvwE_1CZB&_nc_gid=p6OQmhr83Tf6o9PcvO4j5w&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfO9-FUFT8BY7uep7eKJLhv5U37JYBZBtZtvnMwnxB0o7w&oe=686B9C12&_nc_sid=10d13b",
        source_name: "@fili_festival",
        source_url: "https://www.instagram.com/fili_festival/",
        event_url: "https://www.instagram.com/p/DLhhk5GMv2-/",
        event_type: "Talk",
        country_code: "IT",
        featured: false,
        attendees: 0
      },
      {
        title: "GUERRA ALLA GUERRA - Assemblea Nazionale",
        description: "Un appello per la costruzione di un percorso contro la guerra, il riarmo e il genocidio in Palestina. ASEMBLEA NAZIONALE 27 luglio H. 17.30 a Venaus (TO), durante il Festival Alta Felicità. Contro la guerra. Abbiamo amici dappertutto!",
        date: "2025-07-27",
        time: "17:30",
        city: "Venaus",
        address: "Festival Alta Felicità",
        category: "PEACE & ANTI-WAR",
        latitude: "45.1667",
        longitude: "7.1333",
        image_url: "https://scontent-gru2-2.cdninstagram.com/v/t51.2885-15/513819662_18365986021183661_7531116515112381210_n.jpg?stp=dst-jpg_e15_fr_p1080x1080_tt6&_nc_ht=scontent-gru2-2.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2QHQMqQHpe_OnL0DzoKc4VzhCzox_TqgcYH534I6UFCzVsDV8MSRbcNGUzK5tI1r-EI&_nc_ohc=e0nGsHIuyicQ7kNvwEFLGw1&_nc_gid=WTKZIQl6LvkaB0qF3IxklQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfOGx8-gnvghx5lGW5RwJj5c-QAL0LdBsOuGrmUT4Z3Btg&oe=686B92C1&_nc_sid=10d13b",
        source_name: "@infoaut",
        source_url: "https://www.instagram.com/infoaut/",
        event_url: "https://www.instagram.com/p/DLhaQowtHOa/",
        event_type: "Assembly",
        country_code: "IT",
        featured: false,
        attendees: 0
      },
      {
        title: "Alleanze Transfemministe e Sindacali",
        description: "Giovedì 26 giugno, Piazza Gasparotto ore 19:00. Studentesse e lavoratrici migranti in lotta comune. Il lavoro di cura, domestico e non, è ancora oggi svolto nella quasi totale invisibilità dalle donne: spesso da donne razzializzate, con condizioni pressocché prive di tutele.",
        date: "2025-06-26",
        time: "19:00",
        city: "Padova",
        address: "Piazza Gasparotto",
        category: "WOMEN'S RIGHTS",
        latitude: "45.4064",
        longitude: "11.8768",
        image_url: "https://instagram.fceb6-1.fna.fbcdn.net/v/t51.2885-15/510964110_18277823917258691_8420593027455210030_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=instagram.fceb6-1.fna.fbcdn.net&_nc_cat=111&_nc_oc=Q6cZ2QFNP6CrZTf1UzhtGDNO5baZDacmqWvzzFOOPKHIv7KeP7gHOKAxafvlzh9jl6eZseU&_nc_ohc=7l-sqA1F1MUQ7kNvwGZTmgn&_nc_gid=CMWzEWhN0dmQTYyVHHkdlg&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfPfVxlux6_Vg6Yfb0yT1iSIXRCpzdqIj8jv3u4mQQRKXg&oe=686BAFB9&_nc_sid=10d13b",
        source_name: "@yuccafest",
        source_url: "https://www.instagram.com/yuccafest/",
        event_url: "https://www.instagram.com/p/DLRota1NqWT/",
        event_type: "Workshop",
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
    
    return imported;
    
  } catch (error) {
    console.error('❌ Error fixing Instagram titles:', error);
    return 0;
  }
}

// Run the fix
fixInstagramTitles()
  .then(count => {
    if (count > 0) {
      console.log(`\n🌟 Instagram Title Fix Complete!`);
      console.log(`📱 ${count} events now display original Italian titles`);
      console.log(`🎯 No more English translations - authentic Italian content preserved`);
    }
  });
