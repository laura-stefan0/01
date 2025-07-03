-- Add approved column to protests table
-- Run this in your Supabase SQL editor

ALTER TABLE protests ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional: Set existing protests to approved (so they remain visible)
-- UPDATE protests SET approved = TRUE WHERE approved IS NULL OR approved = FALSE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_protests_approved ON protests(approved);