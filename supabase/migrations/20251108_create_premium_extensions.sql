-- Migration: Create premium_extensions table
-- Created: 2025-11-08
-- Purpose: Track all premium extensions from rewards and other sources

-- Create premium_extensions table
CREATE TABLE IF NOT EXISTS premium_extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  days_added INTEGER NOT NULL CHECK (days_added > 0),
  source TEXT NOT NULL, -- 'reward', 'referral', 'compensation', 'admin'
  reward_id UUID REFERENCES premium_rewards(id) ON DELETE SET NULL,
  subscription_id TEXT, -- Stripe subscription ID (if applicable)
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT valid_source CHECK (source IN ('reward', 'referral', 'compensation', 'admin', 'guest_invitation'))
);

-- Add indexes
CREATE INDEX idx_premium_extensions_user ON premium_extensions(user_id);
CREATE INDEX idx_premium_extensions_granted ON premium_extensions(granted_at DESC);
CREATE INDEX idx_premium_extensions_source ON premium_extensions(source);
CREATE INDEX idx_premium_extensions_reward ON premium_extensions(reward_id) WHERE reward_id IS NOT NULL;

-- Enable RLS
ALTER TABLE premium_extensions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own extensions
CREATE POLICY "Users can view own extensions"
  ON premium_extensions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only backend can insert/update
CREATE POLICY "Service role can manage extensions"
  ON premium_extensions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE premium_extensions IS 'Tracks all premium time extensions from various sources';
COMMENT ON COLUMN premium_extensions.days_added IS 'Number of days added to premium subscription';
COMMENT ON COLUMN premium_extensions.source IS 'Source of the extension (reward, referral, etc.)';
COMMENT ON COLUMN premium_extensions.subscription_id IS 'Stripe subscription ID if extension is for paying customer';
COMMENT ON COLUMN premium_extensions.metadata IS 'Additional metadata about the extension';
