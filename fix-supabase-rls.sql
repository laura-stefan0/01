-- Disable RLS on Users table to allow API insertions
ALTER TABLE "Users" DISABLE ROW LEVEL SECURITY;

-- Create protests table if it doesn't exist
CREATE TABLE IF NOT EXISTS "protests" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    location TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    date_time TIMESTAMP,
    attendees INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Disable RLS on protests table
ALTER TABLE "protests" DISABLE ROW LEVEL SECURITY;

-- Insert sample protest data
INSERT INTO "protests" (title, description, category, location, latitude, longitude, date_time, attendees, featured) VALUES
('Global Climate Strike', 'Join the worldwide movement for climate action', 'Climate', 'Central Park, NYC', 40.7829, -73.9654, '2024-03-15 14:00:00', 1250, true),
('Pride March 2024', 'Celebrate love, diversity, and equality', 'Pride', 'Castro District, SF', 37.7609, -122.4350, '2024-06-29 12:00:00', 2500, true),
('Fair Wage Strike', 'Fighting for living wages for all workers', 'Workers', 'Downtown LA', 34.0522, -118.2437, '2024-02-20 10:00:00', 800, false),
('Justice for All Rally', 'Standing up for civil rights and justice', 'Justice', 'Washington Mall, DC', 38.8895, -77.0353, '2024-04-10 11:00:00', 1500, false),
('Save Our Forests', 'Protecting local ecosystems from development', 'Environment', 'Golden Gate Park, SF', 37.7694, -122.4862, '2024-03-22 09:00:00', 600, false),
('Education Funding March', 'Demanding proper funding for public schools', 'Education', 'State Capitol, Austin', 30.2672, -97.7431, '2024-05-01 13:00:00', 950, false);