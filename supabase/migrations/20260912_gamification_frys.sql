-- Gamification tas bort ur produkten (docs/plan-inloggat-omdesign.md, våg 2
-- punkt 21). Migrationen DROPPAR INGENTING.
--
-- Beslutet: alla tio milstolpar var premiumdagar eller rabatt på vår egen
-- produkt, alltså en rabattstege förklädd till spel. Systemet gav dessutom XP
-- för att klicka på belöningen man fått av sin XP, och sidan var föräldralös
-- utan väg från sidebar, mobilnav eller profilmeny.
--
-- Varför tabellerna ändå står kvar: 209 XP-rader på 27 konton och två
-- utfärdade belöningsanspråk är riktig historik. Vi slutar skriva till dem,
-- men kastar dem inte, och redan utfärdade rabattkoder ska fortsätta gå att
-- lösa in. Inlösenvägen (/api/rewards/activate, src/lib/rewards/activators.ts)
-- lever vidare och rör discount_codes och user_reward_claims som förut.
--
-- Frysta (inga nya skrivningar från appen):
--   xp_history               XP-transaktioner
--   global_user_stats        total_xp, current_level, daily_streak, longest_streak
--   user_daily_xp            dagligt XP-tak
--   premium_rewards          milstolpekatalogen
--
-- Aktiva (läses och skrivs fortfarande):
--   user_reward_claims       inlösen av redan utfärdade anspråk
--   discount_codes           rabattkoder som fortfarande kan användas
--   premium_extensions       premiumtid som redan delats ut
--   weekly_guest_allowances  gästinbjudningar, hänger på premium och inte på XP

comment on table public.xp_history is
  'FRYST 2026-09-12 (våg 2 punkt 21): historik bevarad, inga nya rader skrivs. Gamification borttagen ur produkten.';

comment on table public.global_user_stats is
  'FRYST 2026-09-12 (våg 2 punkt 21): XP, nivå och streak skrivs inte längre. Raderna bevaras som historik.';

comment on table public.user_daily_xp is
  'FRYST 2026-09-12 (våg 2 punkt 21): dagligt XP-tak används inte längre. Raderna bevaras som historik.';

comment on table public.premium_rewards is
  'FRYST 2026-09-12 (våg 2 punkt 21): milstolpekatalogen delas inte längre ut. Läses fortfarande vid inlösen av gamla anspråk.';

comment on table public.user_reward_claims is
  'AKTIV: nya anspråk utfärdas inte, men redan utfärdade ska fortsätta gå att aktivera via /api/rewards/activate.';

comment on table public.discount_codes is
  'AKTIV: redan utfärdade rabattkoder ska fortsätta gå att lösa in. Nya koder skapas inte av belöningssystemet.';
