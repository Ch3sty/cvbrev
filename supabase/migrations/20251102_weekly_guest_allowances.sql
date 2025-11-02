-- Migration: Weekly Guest Allowances System
-- Description: Replace monthly guest invitation system with weekly (7-day rolling) system
-- Date: 2025-11-02

-- Create weekly_guest_allowances table
CREATE TABLE IF NOT EXISTS public.weekly_guest_allowances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_allowance INTEGER NOT NULL DEFAULT 5,
  used_invitations INTEGER NOT NULL DEFAULT 0,
  first_used_at TIMESTAMPTZ,
  reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one record per user
  CONSTRAINT unique_user_weekly_allowance UNIQUE(user_id),

  -- Ensure valid counts
  CONSTRAINT valid_allowance CHECK (base_allowance > 0),
  CONSTRAINT valid_used CHECK (used_invitations >= 0)
);

-- Create index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_weekly_guest_allowances_user_id
  ON public.weekly_guest_allowances(user_id);

-- Create index for reset queries
CREATE INDEX IF NOT EXISTS idx_weekly_guest_allowances_reset_at
  ON public.weekly_guest_allowances(reset_at)
  WHERE reset_at IS NOT NULL;

-- Enable RLS
ALTER TABLE public.weekly_guest_allowances ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own allowance
CREATE POLICY "Users can view own weekly allowance"
  ON public.weekly_guest_allowances
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own allowance (for increment)
CREATE POLICY "Users can update own weekly allowance"
  ON public.weekly_guest_allowances
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own allowance
CREATE POLICY "Users can insert own weekly allowance"
  ON public.weekly_guest_allowances
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_weekly_guest_allowances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_weekly_guest_allowances_timestamp
  BEFORE UPDATE ON public.weekly_guest_allowances
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_guest_allowances_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.weekly_guest_allowances TO authenticated;

-- Comment on table
COMMENT ON TABLE public.weekly_guest_allowances IS 'Tracks weekly guest invitation allowances with 7-day rolling reset period';
COMMENT ON COLUMN public.weekly_guest_allowances.base_allowance IS 'Base weekly allowance (5 for premium users)';
COMMENT ON COLUMN public.weekly_guest_allowances.used_invitations IS 'Number of invitations sent in current period';
COMMENT ON COLUMN public.weekly_guest_allowances.first_used_at IS 'Timestamp when first invitation was sent in current period';
COMMENT ON COLUMN public.weekly_guest_allowances.reset_at IS 'Timestamp when allowance will reset (7 days from first_used_at)';
