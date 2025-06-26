import { supabase } from './db/index.ts';

async function addLawsData() {
  try {
    console.log('Adding Italian protest rights laws...');

    const laws = [
      {
        title: "Right to Peaceful Assembly (Article 17)",
        description: "Constitutional right to organize and participate in peaceful demonstrations",
        content: `Article 17 of the Italian Constitution guarantees the right to peaceful assembly without arms. Citizens may gather in public or private places, but public gatherings in public places must be notified to authorities in advance.

Key provisions:
• No authorization required for private gatherings
• Public gatherings require advance notification to local authorities (Questura)
• Peaceful nature must be maintained at all times
• Authorities cannot ban assemblies without justified security concerns
• Right applies to all citizens and legal residents
• Gatherings must not obstruct traffic without proper permits
• Police can only intervene if public order is threatened`,
        country_code: "IT"
      },
      {
        title: "Freedom of Expression (Article 21)",
        description: "Constitutional protection for speech and expression during protests",
        content: `Article 21 of the Italian Constitution protects freedom of thought and expression. This right extends to peaceful protests and demonstrations.

Key protections:
• Right to express opinions through speech, writing, and other means
• Protection extends to protest signs, banners, and symbolic expression
• Content cannot be censored prior to expression
• Limitations only apply to expressions that incite violence or hatred
• Right to distribute leaflets and informational materials
• Protection for peaceful chanting and slogans during demonstrations`,
        country_code: "IT"
      },
      {
        title: "Police Powers During Protests",
        description: "Understanding police authority and limitations during demonstrations",
        content: `Italian law enforcement has specific powers and limitations during public demonstrations. Understanding these helps protect your rights.

Police can:
• Request identification documents
• Disperse gatherings that turn violent or threaten public safety
• Arrest individuals committing crimes
• Control traffic and crowd movement for safety

Police cannot:
• Prevent peaceful, properly notified gatherings
• Use excessive force against peaceful protesters
• Arrest individuals solely for participating in legal demonstrations
• Search personal belongings without probable cause
• Prohibit recording of police activities in public spaces`,
        country_code: "IT"
      },
      {
        title: "Notification Requirements for Public Assemblies",
        description: "Legal requirements for organizing public demonstrations in Italy",
        content: `Italian law requires advance notification for public assemblies in public spaces. This is not an authorization request but an informational requirement.

Requirements:
• Notify local Questura (police headquarters) at least 3 days in advance
• Provide details: date, time, location, estimated participants, purpose
• Include organizer contact information
• Specify planned route for marches or processions
• No fee required for notification

Important notes:
• Notification is not the same as requesting permission
• Authorities can only prohibit if there are serious public safety concerns
• Alternative locations may be suggested if original poses safety risks
• Spontaneous gatherings in response to urgent events may have different rules`,
        country_code: "IT"
      },
      {
        title: "Rights When Detained",
        description: "Your legal protections if detained during a protest",
        content: `If detained during a protest in Italy, you have specific rights that must be respected by law enforcement.

Your rights include:
• Right to remain silent (you don't have to answer questions)
• Right to know the reason for detention
• Right to contact a lawyer immediately
• Right to have someone notified of your detention
• Right to medical assistance if needed
• Right to an interpreter if you don't speak Italian

Time limits:
• Police can hold you for identification for maximum 12 hours
• Formal arrest requires a warrant or flagrant crime
• You must be brought before a judge within 48 hours of arrest
• Right to be informed of charges in a language you understand

Important: Always remain calm and cooperative while asserting your rights clearly.`,
        country_code: "IT"
      }
    ];

    for (const law of laws) {
      const { data, error } = await supabase
        .from('laws')
        .insert([law])
        .select();

      if (error) {
        console.error('Error inserting law:', law.title, error);
      } else {
        console.log('✅ Added law:', law.title);
      }
    }

    console.log('Finished adding laws data');
  } catch (error) {
    console.error('Error adding laws data:', error);
  }
}

addLawsData();