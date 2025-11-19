-- Migration: Add contact fields and visibility preferences to profiles
-- Purpose: Enable users to add optional phone/location and control inclusion in cover letters
-- Security: These fields contain PII and should NEVER be sent to external AI services

-- Add contact information fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS include_phone_in_letters BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS include_location_in_letters BOOLEAN DEFAULT false;

-- Add helpful comments
COMMENT ON COLUMN profiles.phone IS 'User phone number (optional) - used in cover letters if include_phone_in_letters is true';
COMMENT ON COLUMN profiles.location IS 'User location/city (optional) - used in cover letters if include_location_in_letters is true';
COMMENT ON COLUMN profiles.include_phone_in_letters IS 'Whether to include phone number in generated cover letters';
COMMENT ON COLUMN profiles.include_location_in_letters IS 'Whether to include location in generated cover letters';

-- Create indexes for faster lookups (only where values exist)
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location) WHERE location IS NOT NULL;

-- Add template tracking to letters table
ALTER TABLE public.letters
ADD COLUMN IF NOT EXISTS template_id VARCHAR(50) DEFAULT 'classic';

COMMENT ON COLUMN letters.template_id IS 'ID of the letter template used (classic, modern, executive, minimalist, creative, traditional)';

CREATE INDEX IF NOT EXISTS idx_letters_template ON letters(template_id);

-- Update RLS policies to ensure users can only access their own contact data
-- (Existing RLS policies already handle this, but let's be explicit)

-- Ensure users can read their own profile contact fields
DROP POLICY IF EXISTS "Users can read own profile contact" ON profiles;
CREATE POLICY "Users can read own profile contact"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Ensure users can update their own profile contact fields
DROP POLICY IF EXISTS "Users can update own profile contact" ON profiles;
CREATE POLICY "Users can update own profile contact"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
