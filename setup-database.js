import postgres from 'postgres';

// Use Supabase connection string with service role key
const connectionString = `postgresql://postgres.mfzlajgnahbhwswpqzkj:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function setupDatabase() {
  const sql = postgres(connectionString);
  
  try {
    console.log('Creating users table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT,
        notifications BOOLEAN NOT NULL DEFAULT true,
        location BOOLEAN NOT NULL DEFAULT true,
        emails BOOLEAN NOT NULL DEFAULT false,
        language TEXT NOT NULL DEFAULT 'en',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        role TEXT,
        bio TEXT,
        avatar_url TEXT,
        is_verified BOOLEAN DEFAULT false,
        can_create_events BOOLEAN DEFAULT false,
        joined_via TEXT,
        last_login TIMESTAMP WITH TIME ZONE,
        preferences JSONB
      );
    `;
    
    console.log('✅ Users table created successfully');

    console.log('Creating protests table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS protests (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude TEXT NOT NULL,
        longitude TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        attendees INTEGER NOT NULL DEFAULT 0,
        distance TEXT,
        image_url TEXT,
        featured BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log('✅ Protests table created successfully');

    // Enable RLS and create policies
    console.log('Setting up Row Level Security...');
    
    await sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE protests ENABLE ROW LEVEL SECURITY;`;
    
    // Drop existing policies if they exist
    await sql`DROP POLICY IF EXISTS "Allow public access" ON users;`;
    await sql`DROP POLICY IF EXISTS "Allow public access" ON protests;`;
    
    // Create new policies
    await sql`CREATE POLICY "Allow public access" ON users FOR ALL USING (true);`;
    await sql`CREATE POLICY "Allow public access" ON protests FOR ALL USING (true);`;
    
    console.log('✅ RLS policies configured successfully');
    console.log('Database setup complete!');
    
  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    await sql.end();
  }
}

setupDatabase();