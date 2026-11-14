# Kontosteget före avläsningen (14 november 2026)

Underlag K7 (planens H4) till avläsningen 8 december. Fullständig rapport med tidslinje, tabeller, diagram och alla frågor: `underlag-kontosteget-2026-11-14.html` och `.pdf`.

Perioder: A = 17 okt till 8 nov (23 dygn, gamla kontosteget). B = 9 nov (övergångsdag). C = 10 nov till 14 nov kl. 16 (4,7 dygn, nya kontosteget). Baslinjen P2 = 12 okt till 8 nov. Källor: PostHog 148688 (Europe/Stockholm) och Supabase produktion, bara läsning. Ägaren, admin och testkonton undantagna (kohort 248676, admin_undantagna_konton() och e-postmönstret).

**Datan är tunn.** I C såg 63 personer kontosteget från provet. 95-procentsintervallet för andelen konton är 12 till 32 procent och rymmer både baslinjen 18 och målet 30. Rapporten säger var vi står och hur avläsningen görs, inte om ändringen fungerade.

## Fem fynd

1. **Kontosteget släpper igenom lika stor andel som förut.** Från provet: 13 av 63 konto i C (21 %, 12 till 32), 23 av 122 i A (19 %, 13 till 27), baslinjen 18 % (29 av 158). Med kontona ur Supabase som baslinjen räknades: 15 av 63 (24 %, 15 till 36).
2. **Fler når steget, och fler klickar sig dit.** 13,5 personer per dygn från provet i C mot 5,3 i A. Nya konton 5,6 per dygn mot 2,3. Spärren till kontoknappen 62 % (113 av 181) blev 79 % (60 av 76). 11 november ensam bar 30 av 69 visningar och 11 av 26 konton.
3. **Tappet sker före första försöket.** 50 av 70 i C tryckte aldrig på knappen, 31 av dem gick Tillbaka till provets resultat. Den som försöker får konto (lösenord 12 av 12). Ett enda valideringsfel sedan 10 november.
4. **Inloggade besökare förvränger felen, knappt tratten.** 6 av 10 misslyckade lösenordsregistreringar 17 okt till 14 nov kom från ett inloggat konto (user_already_exists, 28 okt). Med och utan inloggade: konto per person 30 mot 31 % i A, 30 mot 30 % i C.
5. **Mobilen och mätluckorna.** Försök efter 10 nov: mobil 4 av 27 (15 %), dator 11 av 35 (31 %), omvänt mot före. PostHog har 4 mitt_test_valt, test_planer har mitt_test på 14 av 26 nya konton (H1), så mitt_test läses ur Supabase före rättelsen.

## Tidslinje som påverkar avläsningen

| När | Vad |
|---|---|
| 23 sep | signup_completed för Google skjuts från servern, kopplas inte alltid till besökaren |
| 12 okt till 8 nov | Baslinjen P2: 29 av 158 (18 %) |
| 9 nov 00.28 | Fråga 1 bort, Tillbaka behåller resultatet (sample_restored), acquisition_source på alla konton |
| 9 nov 10.06 | Namnfältet bort |
| 9 nov kväll | test_kind, källan smakprov:/artikel:, mitt_test, provet utan konto i alla typer |
| 10 nov | Nya kontosteget live |
| [datum fylls i av saas-lead] | H3: inloggade får inte registreringsformuläret |
| [datum fylls i av saas-lead] | H1: mitt_test_valt även för lösenordskonton |
| 23 till 30 nov | Black Week och Cyber Monday, redovisas för sig |
| Tidigast 23 nov | Planens punkt 29, om mer av provet eller kontosteget driftsätts |

## Avläsningen 8 december

1. Huvudmått: konto per person som såg kontosteget från provet (fråga H2, raden smakprov), 10 nov till 7 dec utan 23 till 30 nov, med n och intervall.
2. Kontroll: täljaren ur Supabase (S1, källa smakprov:), som baslinjen räknades.
3. Dela på H3:s datum, med och utan inloggade (H1, H5, H6).
4. mitt_test ur test_planer (S2), PostHog (H9) bara efter H1:s datum.
5. Kampanjveckan i egen kolumn, tabellen står färdig i rapportens avsnitt 8.
6. Enhet (H4), testtyp och plats (H3), Tillbaka-steget (H7). Rader under 30 personer tolkas inte.

## Beslut

1. Huvudmåttet PostHog mot PostHog (baslinjen blir då 17 %, 26 av 157), den blandade 18 % som kontroll. Saas-lead avgör.
2. Avläsning 7 eller 8 december. Förslag 8 december och en andra avläsning vid 200 personer från provet utanför kampanjen.
3. Tillbaka-steget (31 av 70) är ett designbeslut för art-director, men rör det inte före avläsningen.

Alla HogQL- och SQL-frågor står i rapportens bilaga, med fönster och undantag som fragment.
