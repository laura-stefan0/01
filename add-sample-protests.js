import { db } from './db/index.js';
import { protests } from './shared/schema.js';

const sampleEvents = [
  {
    title: 'Manifestazione per i Diritti Umani',
    description: 'Una grande manifestazione per sostenere i diritti umani e la pace mondiale.',
    category: 'HUMAN_RIGHTS',
    event_type: 'DEMONSTRATION',
    city: 'Roma',
    address: 'Piazza del Popolo, Roma',
    latitude: '41.9109',
    longitude: '12.4767',
    date: '2025-08-25',
    time: '15:00',
    image_url: null,
    country_code: 'IT',
    attendees: 0,
    featured: false
  },
  {
    title: 'Corteo per l\'Ambiente',
    description: 'Corteo pacifico per sensibilizzare sulla crisi climatica e promuovere politiche ambientali.',
    category: 'ENVIRONMENT',
    event_type: 'MARCH',
    city: 'Milano',
    address: 'Duomo di Milano, Milano',
    latitude: '45.4642',
    longitude: '9.1900',
    date: '2025-08-30',
    time: '10:00',
    image_url: null,
    country_code: 'IT',
    attendees: 0,
    featured: true
  },
  {
    title: 'Assemblea Studentesca',
    description: 'Assemblea aperta per discutere dei diritti degli studenti e delle riforme universitarie.',
    category: 'EDUCATION',
    event_type: 'ASSEMBLY',
    city: 'Firenze',
    address: 'Università di Firenze, Firenze',
    latitude: '43.7696',
    longitude: '11.2558',
    date: '2025-08-22',
    time: '18:00',
    image_url: null,
    country_code: 'IT',
    attendees: 0,
    featured: false
  },
  {
    title: 'Solidarietà per la Palestina',
    description: 'Corteo di solidarietà per il popolo palestinese e per la pace in Medio Oriente.',
    category: 'SOLIDARITY',
    event_type: 'MARCH',
    city: 'Napoli',
    address: 'Piazza Garibaldi, Napoli',
    latitude: '40.8518',
    longitude: '14.2681',
    date: '2025-08-27',
    time: '16:00',
    image_url: null,
    country_code: 'IT',
    attendees: 0,
    featured: false
  },
  {
    title: 'Presidio contro la Guerra',
    description: 'Presidio pacifico contro la guerra e per il disarmo nucleare.',
    category: 'PEACE',
    event_type: 'VIGIL',
    city: 'Torino',
    address: 'Piazza Castello, Torino',
    latitude: '45.0703',
    longitude: '7.6869',
    date: '2025-08-26',
    time: '17:30',
    image_url: null,
    country_code: 'IT',
    attendees: 0,
    featured: false
  }
];

async function addSampleProtests() {
  try {
    console.log('🔄 Adding sample protest events to database...');
    
    for (const event of sampleEvents) {
      const result = await db.insert(protests).values(event).returning();
      console.log(`✅ Added: ${event.title} (ID: ${result[0].id})`);
    }
    
    console.log(`🎉 Successfully added ${sampleEvents.length} protest events!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample protests:', error);
    process.exit(1);
  }
}

addSampleProtests();