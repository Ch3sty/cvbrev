-- Migration: Onboarding Reward System
-- Description: Add tracking for onboarding completion reward (1 day premium)
-- Created: 2025-11-01

-- Add columns for tracking reward claim status
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_reward_claimed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;

-- Add comment explaining the reward system
COMMENT ON COLUMN profiles.onboarding_reward_claimed IS 'Tracks if user has claimed 1-day premium reward for completing onboarding';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when user completed all 6 onboarding steps';

-- Drop existing function and recreate with completion timestamp support
DROP FUNCTION IF EXISTS update_onboarding_progress(uuid, text);

CREATE FUNCTION update_onboarding_progress(
  user_id UUID,
  step_name TEXT
)
RETURNS VOID AS $$
DECLARE
  current_steps JSONB;
  step_count INT;
BEGIN
  -- Get current completed steps array
  SELECT onboarding_steps_completed INTO current_steps
  FROM profiles WHERE id = user_id;

  -- Initialize empty array if null
  IF current_steps IS NULL THEN
    current_steps := '[]'::jsonb;
  END IF;

  -- Add step if not already present
  IF NOT current_steps ? step_name THEN
    current_steps := current_steps || jsonb_build_array(step_name);
  END IF;

  -- Count total steps completed
  step_count := jsonb_array_length(current_steps);

  -- Update profile with new progress
  UPDATE profiles SET
    onboarding_steps_completed = current_steps,
    onboarding_completed = (step_count >= 6),
    -- Set completion timestamp only once when reaching 6 steps
    onboarding_completed_at = CASE
      WHEN step_count >= 6 AND onboarding_completed_at IS NULL THEN NOW()
      ELSE onboarding_completed_at
    END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to RPC function
COMMENT ON FUNCTION update_onboarding_progress IS 'Tracks user onboarding progress and sets completion flag when all 6 steps are done';
