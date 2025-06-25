# Supabase Database Setup Instructions

The application is now configured to use your Supabase database, but the required tables need to be created manually.

## Step 1: Access Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/mfzlajgnahbhwswpqzkj/sql

## Step 2: Execute the Following SQL

Copy and paste this SQL into the SQL Editor and run it:

```sql
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

-- Create policies for public access (for testing purposes)
CREATE POLICY "Allow public access" ON users FOR ALL USING (true);
CREATE POLICY "Allow public access" ON protests FOR ALL USING (true);
```

## Step 3: Verify Setup

After running the SQL, test the API endpoints:

1. Check user profile: `GET /api/users/profile`
2. Test user creation: `POST /api/users` with JSON body containing username, email, password
3. Check protests: `GET /api/protests`

## Current Status

- ✅ Application running on port 5000
- ✅ Supabase connection configured  
- ✅ API routes updated for Supabase
- ⏳ Database tables need manual creation (follow steps above)

Once you've created the tables, all API endpoints should work correctly with your Supabase database.