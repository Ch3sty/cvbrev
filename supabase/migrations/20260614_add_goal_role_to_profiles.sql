-- Lägger till goal_role (målroll) på profiles. Används av chatten (Karriärguiden)
-- och kan förbättra jobbmatchning. Additiv, nullable - bryter inget befintligt.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goal_role text;

COMMENT ON COLUMN public.profiles.goal_role IS 'Användarens målroll/drömjobb (fritext). Personaliserar chatt och jobbmatchning.';
