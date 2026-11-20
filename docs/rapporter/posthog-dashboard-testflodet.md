# PostHog-dashboarden "Testflödet"

Skapad 2026-11-20 i etapp 7 av `docs/plan-testflode-2026-11-20.md` (avsnitt 8.3 och 12).

Länk: https://eu.posthog.com/project/148688/dashboard/1134121

Ägarens konto (kohort 248676) och QA-konton (e-post med `jobbcoach-qa`) är bortfiltrerade i tabellerna; trattarna använder projektets testkontofilter. Allt räknas från 2026-11-20 03:12, när etapp 1 gick live.

| Insikt | Vad den visar |
|---|---|
| Testflödet: tratten per läge | `test_start_viewed` till `test_session_started` till `test_session_completed` inom ett dygn, uppdelad på `lage` |
| Testflödet: tratten per testtyp | Samma tratt uppdelad på `test_kind` |
| Testflödet: tratten per läge och testtyp (tabell) | Startskärmar, startade, slutförda, avbrutna och andel slutförda per `lage` och `test_kind` |
| Betalväggar: klick per visning, per plats och enhet | `betalvagg_visad` mot `paywall_cta_clicked` (primärknappen) per `plats` och dator eller mobil |
| Betalväggar: per läge och testtyp | Testväggarna med `lage` och `test_kind` (från etapp 7) |

Baslinjen för betalväggarna (planen avsnitt 9.1): 10 % klick per visning totalt, 12 % på dator och 7 % på mobil, 30 dagar till 2026-11-20. Under 8 % på 100 visningar utreds; inget backas automatiskt.

Sanningen om slutförande kommer ur Supabase (`logic_test_v4_sessions`, samma fråga som baslinjen i saas-leads förslag avsnitt 0). Dashboarden säger var i sessionen folk lämnar.
