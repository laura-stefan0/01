import { supabase } from './db/index.ts';

async function setupLawsTable() {
  try {
    console.log('Setting up laws table and adding data...');

    // First, let's check if the laws table exists and create it if not
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_info', { table_name: 'laws' })
      .single();

    if (tablesError && tablesError.code === '42P01') {
      console.log('Laws table does not exist, creating...');
      
      // Create the laws table
      const { error: createError } = await supabase.rpc('create_laws_table');
      
      if (createError) {
        console.error('Error creating laws table:', createError);
        return;
      }
      
      console.log('Laws table created successfully');
    }

    // Add Italian protest rights data
    const laws = [
      {
        title: "Right to Peaceful Assembly (Article 17)",
        description: "Constitutional right to organize and participate in peaceful demonstrations",
        category: "assembly_rights",
        content: "Article 17 of the Italian Constitution guarantees the right to peaceful assembly without arms. Citizens may gather in public or private places, but public gatherings in public places must be notified to authorities in advance.\n\nKey provisions:\n• No authorization required for private gatherings\n• Public gatherings require advance notification to local authorities (Questura)\n• Peaceful nature must be maintained at all times\n• Authorities cannot ban assemblies without justified security concerns\n• Right applies to all citizens and legal residents\n• Gatherings must not obstruct traffic without proper permits\n• Police can only intervene if public order is threatened",
        country_code: "IT"
      },
      {
        title: "Freedom of Expression (Article 21)",
        description: "Constitutional protection for speech and expression during protests",
        category: "expression_rights", 
        content: "Article 21 of the Italian Constitution protects freedom of thought and expression. This right extends to peaceful protests and demonstrations.\n\nKey protections:\n• Right to express opinions through speech, writing, and other means\n• Protection extends to protest signs, banners, and symbolic expression\n• Content cannot be censored prior to expression\n• Limitations only apply to expressions that incite violence or hatred\n• Right to distribute leaflets and informational materials\n• Protection for peaceful chanting and slogans during demonstrations",
        country_code: "IT"
      },
      {
        title: "Police Powers During Protests",
        description: "Understanding police authority and limitations during demonstrations",
        category: "police_interaction",
        content: "Italian law enforcement has specific powers and limitations during public demonstrations. Understanding these helps protect your rights.\n\nPolice can:\n• Request identification documents\n• Disperse gatherings that turn violent or threaten public safety\n• Arrest individuals committing crimes\n• Control traffic and crowd movement for safety\n\nPolice cannot:\n• Prevent peaceful, properly notified gatherings\n• Use excessive force against peaceful protesters\n• Arrest individuals solely for participating in legal demonstrations\n• Search personal belongings without probable cause\n• Prohibit recording of police activities in public spaces",
        country_code: "IT"
      }
    ];

    // Insert laws data
    for (const law of laws) {
      const { data, error } = await supabase
        .from('laws')
        .insert([law])
        .select();

      if (error) {
        console.error('Error inserting law:', law.title, error);
      } else {
        console.log('Added law:', law.title);
      }
    }

    console.log('Laws setup completed');
  } catch (error) {
    console.error('Error setting up laws:', error);
  }
}

setupLawsTable();