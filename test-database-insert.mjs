import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://mfzlajgnahbhwswpqzkj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo');

const { data, error } = await supabase.from('protests').select('*');

if (error) {
  console.log('❌ Error:', error);
} else {
  console.log(`📊 Total events in database: ${data.length}`);
  console.log(`📋 Event types: ${[...new Set(data.map(e => e.event_type))].join(', ')}`);
  console.log(`🏷️ Categories: ${[...new Set(data.map(e => e.category))].join(', ')}`);
  
  console.log('\n📝 All events:');
  data.forEach((e, i) => {
    console.log(`${i+1}. [${e.event_type}] "${e.title.slice(0, 50)}..." | ${e.city} | ${e.category}`);
  });
}