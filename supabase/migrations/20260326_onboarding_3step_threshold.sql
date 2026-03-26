-- Migration: Ändra onboarding completion-tröskel från 6 till 3 kärnsteg
-- Kärnsteg: upload_cv, create_letter, analyze_cv
-- Övriga steg (optimize_linkedin, download_cv_template, match_jobs) blir bonussteg

-- Uppdatera RPC-funktionen
CREATE OR REPLACE FUNCTION update_onboarding_progress(user_id UUID, step_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_steps JSONB;
  required_steps TEXT[] := ARRAY['upload_cv', 'create_letter', 'analyze_cv'];
  required_completed INT := 0;
  req_step TEXT;
BEGIN
  SELECT onboarding_steps_completed INTO current_steps
  FROM profiles WHERE id = user_id;

  IF current_steps IS NULL THEN
    current_steps := '[]'::jsonb;
  END IF;

  IF NOT current_steps ? step_name THEN
    current_steps := current_steps || jsonb_build_array(step_name);
  END IF;

  FOREACH req_step IN ARRAY required_steps LOOP
    IF current_steps ? req_step THEN
      required_completed := required_completed + 1;
    END IF;
  END LOOP;

  UPDATE profiles SET
    onboarding_steps_completed = current_steps,
    onboarding_completed = (required_completed >= 3),
    onboarding_completed_at = CASE
      WHEN required_completed >= 3 AND onboarding_completed_at IS NULL THEN NOW()
      ELSE onboarding_completed_at
    END
  WHERE id = user_id;
END;
$$;

-- Backfill: markera create_letter för alla som har brev men saknar steget
UPDATE profiles SET onboarding_steps_completed =
  COALESCE(onboarding_steps_completed, '[]'::jsonb) || '"create_letter"'::jsonb
WHERE id IN (SELECT DISTINCT user_id FROM letters)
  AND NOT COALESCE(onboarding_steps_completed, '[]'::jsonb) @> '"create_letter"';

-- Uppdatera onboarding_completed för användare som redan har alla 3 kärnsteg
UPDATE profiles SET
  onboarding_completed = true,
  onboarding_completed_at = COALESCE(onboarding_completed_at, NOW())
WHERE onboarding_completed IS NOT TRUE
  AND COALESCE(onboarding_steps_completed, '[]'::jsonb) @> '"upload_cv"'
  AND COALESCE(onboarding_steps_completed, '[]'::jsonb) @> '"create_letter"'
  AND COALESCE(onboarding_steps_completed, '[]'::jsonb) @> '"analyze_cv"';
