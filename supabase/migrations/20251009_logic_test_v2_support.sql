-- ============================================================================
-- LOGIC TEST V2 SUPPORT - Add support for matrislogik-avancerad
-- ============================================================================

-- Update logic_sessions to ensure test_type supports both tests
-- (This is safe to run even if the column already exists)
DO $$
BEGIN
  -- Add test_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'logic_sessions' AND column_name = 'test_type'
  ) THEN
    ALTER TABLE logic_sessions ADD COLUMN test_type TEXT NOT NULL DEFAULT 'matrislogik-minimal';
  END IF;
END $$;

-- Update logic_answers to ensure it has proper relationships
DO $$
BEGIN
  -- Add test_type column if it doesn't exist (for filtering)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'logic_answers' AND column_name = 'test_type'
  ) THEN
    ALTER TABLE logic_answers ADD COLUMN test_type TEXT;
  END IF;
END $$;

-- Update logic_results to ensure test_type supports both tests
DO $$
BEGIN
  -- Add test_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'logic_results' AND column_name = 'test_type'
  ) THEN
    ALTER TABLE logic_results ADD COLUMN test_type TEXT NOT NULL DEFAULT 'matrislogik-minimal';
  END IF;
END $$;

-- Add index for fast filtering by test_type
CREATE INDEX IF NOT EXISTS idx_logic_sessions_test_type
  ON logic_sessions(test_type);

CREATE INDEX IF NOT EXISTS idx_logic_results_test_type
  ON logic_results(test_type);

CREATE INDEX IF NOT EXISTS idx_logic_results_user_type_completed
  ON logic_results(user_id, test_type, completed_at DESC);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN logic_sessions.test_type IS 'Type of logic test: matrislogik-minimal or matrislogik-avancerad';
COMMENT ON COLUMN logic_results.test_type IS 'Type of logic test: matrislogik-minimal or matrislogik-avancerad';
