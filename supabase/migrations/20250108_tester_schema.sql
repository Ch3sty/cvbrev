-- ============================================================================
-- TESTER SCHEMA - Matrislogik Övningstester
-- ============================================================================

-- Questions (server-side, ej exponerad till klient)
CREATE TABLE test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type TEXT NOT NULL DEFAULT 'matrislogik-classic',
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),

  -- Serialized data (JSONB)
  matrix JSONB NOT NULL, -- 3x3 grid: [[cell, cell, cell], [...], [...]]
  options JSONB NOT NULL, -- 6 answer options: [cell, cell, ...]
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 0 AND 5),
  explanation TEXT NOT NULL,
  pattern_types TEXT[] NOT NULL, -- ['color-change', 'rotation', ...]

  -- Metadata
  time_estimate_seconds INTEGER DEFAULT 60, -- Genomsnittlig tid att lösa
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index för snabb lookup
CREATE INDEX idx_test_questions_type_difficulty
  ON test_questions(test_type, difficulty);

-- ============================================================================
-- USER TEST ATTEMPTS
-- ============================================================================

CREATE TABLE test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Test info
  test_type TEXT NOT NULL, -- 'matrislogik-classic'
  test_mode TEXT NOT NULL, -- 'practice'

  -- Scores
  score_raw DECIMAL(5,2) NOT NULL, -- % rätt (ex: 73.33)
  score_practice_rating INTEGER NOT NULL CHECK (score_practice_rating BETWEEN 1 AND 10),
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,

  -- Performance
  time_spent_seconds INTEGER NOT NULL,

  -- Detailed answers (for breakdown)
  answers JSONB NOT NULL, -- [{ questionId, userAnswer, isCorrect, timeSpent }, ...]

  -- Timestamps
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_score CHECK (score_raw >= 0 AND score_raw <= 100)
);

-- Index för snabb user lookup
CREATE INDEX idx_test_attempts_user_completed
  ON test_attempts(user_id, completed_at DESC);

-- Index för test type
CREATE INDEX idx_test_attempts_type
  ON test_attempts(test_type);

-- ============================================================================
-- USER STATS (Aggregerad data för dashboard)
-- ============================================================================

CREATE TABLE test_user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Matrislogik stats
  matrislogik_attempts INTEGER DEFAULT 0,
  matrislogik_best_score INTEGER DEFAULT 0,
  matrislogik_avg_score DECIMAL(4,2) DEFAULT 0.0,

  -- Overall stats
  total_test_time_seconds INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_test_date DATE,

  -- Achievements (future use)
  achievements JSONB DEFAULT '[]'::jsonb,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- test_questions: Endast backend kan läsa (ej RLS för users)
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

-- Ingen SELECT policy för users = endast server kan läsa

-- test_attempts: Users ser bara sina egna
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test attempts"
  ON test_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test attempts"
  ON test_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- test_user_stats: Users ser bara sin egen stats
ALTER TABLE test_user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON test_user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON test_user_stats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON test_user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS - Auto-update stats
-- ============================================================================

CREATE OR REPLACE FUNCTION update_test_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO test_user_stats (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE test_user_stats
  SET
    matrislogik_attempts = matrislogik_attempts + 1,
    matrislogik_best_score = GREATEST(matrislogik_best_score, NEW.score_practice_rating),
    matrislogik_avg_score = (
      SELECT AVG(score_practice_rating)::DECIMAL(4,2)
      FROM test_attempts
      WHERE user_id = NEW.user_id AND test_type = 'matrislogik-classic'
    ),
    total_test_time_seconds = total_test_time_seconds + NEW.time_spent_seconds,
    last_test_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_test_attempt_insert
  AFTER INSERT ON test_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_test_user_stats();

-- ============================================================================
-- GDPR RETENTION - Auto-delete gamla försök
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_old_test_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM test_attempts
  WHERE completed_at < NOW() - INTERVAL '12 months';

  RAISE NOTICE 'Deleted test attempts older than 12 months';
END;
$$ LANGUAGE plpgsql;

-- Kör monthly (via Supabase cron eller manuellt)
-- SELECT cron.schedule('delete-old-tests', '0 0 1 * *', $$
--   SELECT delete_old_test_attempts();
-- $$);
