-- Läsrollen får anropa admin_undantagna_konton() (analysen 2026-11-08, beslut 5).
--
-- Analysagenterna läser med supabase_read_only_user och fick återskapa
-- undantagslogiken i SQL, eftersom funktionen bara var öppen för service_role.
-- Additiv: bara en grant. anon och authenticated får inte rätten.
grant execute on function public.admin_undantagna_konton() to supabase_read_only_user;
