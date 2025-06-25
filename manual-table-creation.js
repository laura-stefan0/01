// Manual table creation for Supabase database
// Run this in the Supabase SQL Editor at: https://supabase.com/dashboard/project/mfzlajgnahbhwswpqzkj/sql

const sqlCommands = `
-- Create users table
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

-- Create protests table
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE protests ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for testing)
CREATE POLICY "Allow public access" ON users FOR ALL USING (true);
CREATE POLICY "Allow public access" ON protests FOR ALL USING (true);

-- Insert sample data
INSERT INTO users (username, email, password_hash, name) VALUES 
('demo_user', 'demo@example.com', '$2b$10$example_hash', 'Demo User')
ON CONFLICT (username) DO NOTHING;

INSERT INTO protests (title, description, category, location, address, latitude, longitude, date, time, attendees, featured) VALUES 
('Sample Climate Strike', 'Demo protest event', 'Environment', 'City Center', '123 Main St', '40.7128', '-74.0060', '2025-02-01', '14:00', 150, true)
ON CONFLICT DO NOTHING;
`;

console.log('Copy and paste this SQL into your Supabase SQL Editor:');
console.log('https://supabase.com/dashboard/project/mfzlajgnahbhwswpqzkj/sql');
console.log('\n' + sqlCommands);

export { sqlCommands };