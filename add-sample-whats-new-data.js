import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfzlajgnahbhwswpqzkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1memxhamduYWhiaHdzd3BxemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDU5NjYsImV4cCI6MjA2NjQyMTk2Nn0.o2OKrJrTDW7ivxZUl8lYS73M35zf7JYO_WoAmg-Djbo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addSampleData() {
  console.log('📰 Adding sample What\'s New data for different countries...');
  
  const sampleData = [
    // US Data
    {
      title: "March for Democracy in Washington DC",
      body: "Thousands gather on the National Mall demanding voting rights protection and electoral reform",
      country_code: "US",
      image_url: "https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/whats-new/us-democracy-march.svg",
      visible: true
    },
    {
      title: "Labor Strike Gains Support Across States", 
      body: "Workers from multiple industries unite for better wages and working conditions nationwide",
      country_code: "US",
      image_url: "https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/whats-new/us-labor-strike.svg",
      visible: true
    },
    // More IT Data (to complement existing)
    {
      title: "Roma Students Protest Education Cuts",
      body: "University students in Rome organize against proposed budget cuts to higher education",
      country_code: "IT", 
      image_url: "https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/whats-new/roma-students.svg",
      visible: true
    },
    // UK Data
    {
      title: "London Climate Activists Block City Streets",
      body: "Environmental protesters demand immediate action on climate emergency across central London",
      country_code: "UK",
      image_url: "https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/whats-new/london-climate.svg", 
      visible: true
    },
    {
      title: "NHS Workers Rally for Better Pay",
      body: "Healthcare workers across the UK unite for fair compensation and improved working conditions",
      country_code: "UK",
      image_url: "https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/whats-new/uk-nhs-rally.svg",
      visible: true
    }
  ];
  
  try {
    // Insert the sample data
    const { data, error } = await supabase
      .from('whats_new')
      .insert(sampleData)
      .select();
      
    if (error) {
      console.error('❌ Error inserting sample data:', error);
      return;
    }
    
    console.log(`✅ Successfully added ${data?.length || 0} new What's New items`);
    
    // Show summary by country
    console.log('\n📊 Added items by country:');
    const countryCounts = {};
    data?.forEach(item => {
      countryCounts[item.country_code] = (countryCounts[item.country_code] || 0) + 1;
    });
    
    Object.entries(countryCounts).forEach(([country, count]) => {
      console.log(`  ${country}: ${count} items`);
    });
    
    // Verify total count in database
    const { data: allData, error: countError } = await supabase
      .from('whats_new')
      .select('country_code')
      .order('created_at', { ascending: false });
      
    if (countError) {
      console.error('❌ Error getting total count:', countError);
      return;
    }
    
    console.log(`\n📈 Total items in database: ${allData?.length || 0}`);
    
    const totalCounts = {};
    allData?.forEach(item => {
      totalCounts[item.country_code] = (totalCounts[item.country_code] || 0) + 1;
    });
    
    console.log('📊 Total by country:');
    Object.entries(totalCounts).forEach(([country, count]) => {
      console.log(`  ${country}: ${count} items`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addSampleData();