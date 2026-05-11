-- ============================================================================
-- PERSONLIGHETSTESTER (Big Five / IPIP-NEO)
-- ============================================================================
-- Två varianter:
--   1. personlighet-grund     (IPIP-NEO-50, gratis, 5 dimensioner)
--   2. personlighet-avancerad (IPIP-NEO-120, premium, 5 dimensioner + 30 facetter)
--
-- Datamodell:
--   personality_test_sessions  – varje test-försök (historik)
--   user_personality_profile   – senaste/aktiva profilen per user (snabb läsning
--                                från andra verktyg som CV och personligt brev)
-- ============================================================================

-- ============================================================================
-- TEST SESSIONS (historik)
-- ============================================================================
CREATE TABLE personality_test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Test info
  test_type TEXT NOT NULL CHECK (test_type IN ('personlighet-grund', 'personlighet-avancerad')),

  -- Frågesvar: [{ questionId: string, value: 1-5 }, ...]
  -- value är Likert 1-5 där 1=stämmer inte alls, 5=stämmer perfekt
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Beräknade scores per dimension (0-100 normaliserat)
  -- { openness, conscientiousness, extraversion, agreeableness, neuroticism }
  scores JSONB,

  -- Facetter (endast för avancerad): 30 facetter med score 0-100
  -- { "n1": 65, "n2": 50, ... }
  facet_scores JSONB,

  -- Tid
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER, -- sekunder

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_personality_sessions_user_completed
  ON personality_test_sessions(user_id, completed_at DESC);

CREATE INDEX idx_personality_sessions_user_type
  ON personality_test_sessions(user_id, test_type);

-- ============================================================================
-- USER PROFILE (snabb läsning från andra verktyg)
-- ============================================================================
-- Innehåller den *senaste slutförda* profilen per user.
-- Uppdateras automatiskt via trigger när en session slutförs.
CREATE TABLE user_personality_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Referens till sessionen profilen kommer från
  source_session_id UUID REFERENCES personality_test_sessions(id) ON DELETE SET NULL,
  source_test_type TEXT NOT NULL CHECK (source_test_type IN ('personlighet-grund', 'personlighet-avancerad')),

  -- Big Five-scores 0-100
  openness INTEGER NOT NULL CHECK (openness BETWEEN 0 AND 100),
  conscientiousness INTEGER NOT NULL CHECK (conscientiousness BETWEEN 0 AND 100),
  extraversion INTEGER NOT NULL CHECK (extraversion BETWEEN 0 AND 100),
  agreeableness INTEGER NOT NULL CHECK (agreeableness BETWEEN 0 AND 100),
  neuroticism INTEGER NOT NULL CHECK (neuroticism BETWEEN 0 AND 100),

  -- Facetter (endast satta om avancerad-test gjorts)
  facet_scores JSONB,

  -- Cachad AI-genererad analys (för avancerad), så vi inte regenererar
  ai_analysis JSONB,

  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE personality_test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personality_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own personality sessions"
  ON personality_test_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personality sessions"
  ON personality_test_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personality sessions"
  ON personality_test_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own personality profile"
  ON user_personality_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personality profile"
  ON user_personality_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personality profile"
  ON user_personality_profile FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER: uppdatera user_personality_profile när session slutförs
-- ============================================================================
-- Regel: avancerad-resultat skriver alltid över. Grund-resultat skriver bara
-- över om det inte redan finns en avancerad-profil (avancerad är mer komplett).
CREATE OR REPLACE FUNCTION upsert_personality_profile()
RETURNS TRIGGER AS $$
DECLARE
  existing_test_type TEXT;
BEGIN
  -- Bara om sessionen precis slutfördes och har scores
  IF NEW.completed_at IS NULL OR NEW.scores IS NULL THEN
    RETURN NEW;
  END IF;

  -- Om vi precis sätter completed_at (övergång från NULL till värde)
  IF OLD.completed_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Kolla om vi har en befintlig profil
  SELECT source_test_type INTO existing_test_type
  FROM user_personality_profile
  WHERE user_id = NEW.user_id;

  -- Skriv inte över avancerad med grund
  IF existing_test_type = 'personlighet-avancerad'
     AND NEW.test_type = 'personlighet-grund' THEN
    RETURN NEW;
  END IF;

  INSERT INTO user_personality_profile (
    user_id,
    source_session_id,
    source_test_type,
    openness,
    conscientiousness,
    extraversion,
    agreeableness,
    neuroticism,
    facet_scores,
    computed_at,
    updated_at
  )
  VALUES (
    NEW.user_id,
    NEW.id,
    NEW.test_type,
    COALESCE((NEW.scores->>'openness')::int, 50),
    COALESCE((NEW.scores->>'conscientiousness')::int, 50),
    COALESCE((NEW.scores->>'extraversion')::int, 50),
    COALESCE((NEW.scores->>'agreeableness')::int, 50),
    COALESCE((NEW.scores->>'neuroticism')::int, 50),
    NEW.facet_scores,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    source_session_id = EXCLUDED.source_session_id,
    source_test_type = EXCLUDED.source_test_type,
    openness = EXCLUDED.openness,
    conscientiousness = EXCLUDED.conscientiousness,
    extraversion = EXCLUDED.extraversion,
    agreeableness = EXCLUDED.agreeableness,
    neuroticism = EXCLUDED.neuroticism,
    facet_scores = EXCLUDED.facet_scores,
    -- Rensa ai_analysis när profilen ändras så ny analys kan genereras
    ai_analysis = NULL,
    computed_at = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_personality_session_complete
  AFTER UPDATE ON personality_test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION upsert_personality_profile();

-- ============================================================================
-- GDPR: städa gamla ofullbordade sessioner efter 30 dagar
-- ============================================================================
CREATE OR REPLACE FUNCTION delete_old_personality_sessions()
RETURNS void AS $$
BEGIN
  -- Ta bort sessioner som påbörjats men aldrig slutförts (skräp)
  DELETE FROM personality_test_sessions
  WHERE completed_at IS NULL
    AND started_at < NOW() - INTERVAL '30 days';

  -- Slutförda sessioner sparas i 24 månader (längre än kognitiva tester
  -- eftersom profilen är mer värdefull över tid)
  DELETE FROM personality_test_sessions
  WHERE completed_at IS NOT NULL
    AND completed_at < NOW() - INTERVAL '24 months';
END;
$$ LANGUAGE plpgsql;
