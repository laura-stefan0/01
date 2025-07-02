import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://mfzlajgnahbhwswpqzkj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo');

const { data } = await supabase.from('protests').select('id, title, city').limit(50);
console.log('📊 Total events in database:', data.length);
console.log('\n📋 Recent events:');
data.forEach((event, i) => {
  console.log(`${i+1}. "${event.title.slice(0, 60)}..." | ${event.city}`);
});