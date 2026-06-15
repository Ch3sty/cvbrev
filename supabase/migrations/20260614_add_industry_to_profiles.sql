-- Lägger till industry (bransch) på profiles. Används av Jobbcoachen-chatten
-- för personaliserade svar. Additiv, nullable - bryter inget befintligt.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry text;

COMMENT ON COLUMN public.profiles.industry IS 'Användarens bransch (fritext). Personaliserar Jobbcoachen-chatten.';
