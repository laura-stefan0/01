// Script to set up country filtering demo data in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupCountryFilteringData() {
  console.log('🔧 Setting up country filtering demo data...');

  try {
    // Add country_code column to existing protests if not exists
    console.log('📝 Adding country_code to existing protests...');
    
    const { data: existingProtests, error: fetchError } = await supabase
      .from('protests')
      .select('id, country_code');

    if (fetchError) {
      console.error('❌ Error fetching protests:', fetchError);
    } else {
      // Update existing protests to have IT country code
      for (const protest of existingProtests) {
        if (!protest.country_code) {
          const { error: updateError } = await supabase
            .from('protests')
            .update({ country_code: 'IT' })
            .eq('id', protest.id);

          if (updateError) {
            console.error('❌ Error updating protest:', updateError);
          } else {
            console.log('✅ Updated protest', protest.id, 'with country_code: IT');
          }
        }
      }
    }

    // Add sample safety tips for Italy
    console.log('📝 Adding sample safety tips for Italy...');
    
    const sampleSafetyTips = [
      {
        title: "Know Your Rights in Italy",
        content: "In Italy, peaceful protest is protected under Article 17 of the Constitution. This guarantees the right to peaceful assembly without arms.",
        category: "protesters",
        type: "rights",
        country_code: "IT"
      },
      {
        title: "Safety Checklist for Italian Protests",
        content: "Essential safety tips for protesters in Italy: Bring ID, stay hydrated, know emergency contacts (112), and understand local laws.",
        category: "protesters", 
        type: "safety",
        country_code: "IT"
      },
      {
        title: "Organizing Guide for Italy",
        content: "Legal requirements for organizing protests in Italy: notify prefecture 3 days in advance, comply with public order laws.",
        category: "organizers",
        type: "organizing", 
        country_code: "IT"
      }
    ];

    for (const safetyTip of sampleSafetyTips) {
      const { error: safetyTipError } = await supabase
        .from('safety-tips')
        .insert(safetyTip);

      if (safetyTipError) {
        console.error('❌ Error inserting safety tip:', safetyTipError);
      } else {
        console.log('✅ Added safety tip:', safetyTip.title);
      }
    }

    // Add sample laws for Italy  
    console.log('📝 Adding sample laws for Italy...');
    
    const sampleLaws = [
      {
        title: "Constitutional Right to Assembly",
        description: "Article 17 of the Italian Constitution",
        category: "assembly_rights",
        content: "Citizens have the right to assemble peacefully and without arms. For meetings in public places, prior notice to authorities may be required.",
        country_code: "IT"
      },
      {
        title: "Public Order Laws",
        description: "TULPS (Testo Unico delle Leggi di Pubblica Sicurezza)",
        category: "public_order",
        content: "Regulations governing public demonstrations and requirements for notification of authorities.",
        country_code: "IT"
      }
    ];

    for (const law of sampleLaws) {
      const { error: lawError } = await supabase
        .from('laws')
        .insert(law);

      if (lawError) {
        console.error('❌ Error inserting law:', lawError);
      } else {
        console.log('✅ Added law:', law.title);
      }
    }

    console.log('🎉 Country filtering setup complete!');
    console.log('📊 All data is now filtered by country_code = "IT"');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupCountryFilteringData();