-- Sidebar-counten för Sökta tjänster uppdateras via realtime (postgres_changes).
-- RLS gäller även för realtime, så användare ser bara sina egna rader.
-- Applicerad mot produktion 2026-07-29 via Supabase MCP (apply_migration: sokta_tjanster_realtime).
--
-- OBS: cv_texts och letters ligger INTE i supabase_realtime-publikationen,
-- trots att Sidebar.tsx redan prenumererar på dem. Det är en befintlig lucka
-- (countarna uppdateras först vid sidladdning). Läggs de till senare börjar
-- även de kanalerna fungera.
alter publication supabase_realtime add table public.job_applications;
