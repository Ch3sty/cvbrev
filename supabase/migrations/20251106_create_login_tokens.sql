-- Migration: Create login_tokens table for trial one-time login functionality
-- Created: 2025-11-06
-- Purpose: Store one-time login tokens for passwordless trial user authentication

-- Create login_tokens table
CREATE TABLE IF NOT EXISTS login_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT valid_expiration CHECK (expires_at > created_at)
);

-- Indexes for performance
CREATE INDEX idx_login_tokens_token ON login_tokens(token) WHERE NOT used;
CREATE INDEX idx_login_tokens_user_id ON login_tokens(user_id);
CREATE INDEX idx_login_tokens_expires_at ON login_tokens(expires_at);
CREATE INDEX idx_login_tokens_created_at ON login_tokens(created_at);

-- Function to automatically cleanup expired tokens (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_expired_login_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM login_tokens
  WHERE expires_at < NOW() - INTERVAL '7 days';

  RAISE NOTICE 'Cleaned up expired login tokens';
END;
$$;

-- Enable Row Level Security
ALTER TABLE login_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can manage login tokens
-- Users should never directly access this table from client-side
CREATE POLICY "Service role can manage login tokens"
  ON login_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE login_tokens IS 'One-time login tokens for trial user authentication after Stripe checkout';
COMMENT ON COLUMN login_tokens.token IS '32-byte hex token (64 characters) for secure one-time login';
COMMENT ON COLUMN login_tokens.expires_at IS 'Token expiration time (typically 1 hour from creation)';
COMMENT ON COLUMN login_tokens.used IS 'Whether the token has been used for login';
COMMENT ON COLUMN login_tokens.metadata IS 'Additional metadata (checkout_session_id, trial_source, ip_address, etc.)';
