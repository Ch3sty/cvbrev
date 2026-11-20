# Byggnoter: testflödet i sessionsramen

Planen: `docs/plan-testflode-2026-11-20.md`. En rad per push med vad som gick live och hur det backas. Backning är alltid `git revert` av etappens commitserie; de gamla komponenterna står kvar i trädet till och med etapp 4, så en revert saknar aldrig kod.

## Etapp 0, sanningsrättelser (2026-11-20)

- Commit `b9c5699f`, "fix(tester): sanningsrättelser i testflödet, etapp 0".
- Backning: `git revert b9c5699f`.

## Etapp 1, ramen på figurserier (2026-11-20)

- Commits `fe390a12` "feat(tester): sessionsramen, etapp 1 figurserier" och `3c4418a8` (resultatet tonar in utan genomsläpp).
- Live: `src/components/session/` (SessionsRam, Svarskort, Klocka, Startskarm, Resultatskarm, Forklaringen, Uppgiftsarket, lägesflödena och figurseriernas typ) för figurseriernas nivåtest, Nivåkollen, Träna och övningsprov. Övriga typer går kvar i sina gamla komponenter.
- Databas: `profiles.test_installningar` (nullbar jsonb), migreringen `supabase/migrations/20261120200000_profiles_test_installningar.sql`, körd i produktion 2026-11-20. Kolumnen kan stå kvar vid en revert (ingen kod läser den då); ska den bort: `alter table public.profiles drop column if exists test_installningar;`.
- Backning: `git revert 3c4418a8 fe390a12`.

## Etapp 2, ord och text och siffror och tabeller (2026-11-20)

- Commit `HASH_E2`, "feat(tester): sessionsramen, etapp 2 ord och text, siffror och tabeller".
- Live i ramen för verbalt och numeriskt: nivåtest på alla nivåer (expert inräknad, samma regler som övriga: fri navigering, mjuk gräns på provets tid ur config, Lämna in med dialog), Nivåkollen, Träna (textpasset, sifferpasset och det riktade) och övningsproven. Typen är `src/components/session/typer/Vn.tsx` (underlaget, uppgiften, tre fasta svar eller rader, diagrammen i `VnDiagram.tsx`), kopplingarna i `src/components/session/vn/`. VerbalTestSession, VerbalExpertSession, NumericalTestSession, VnPassFlode, Startark och OvningsprovFlode (för de två typerna) står kvar oanvända till etapp 5; NivakollFlode används fortfarande av deduktivt.
- Uppgifterna levereras från servern utan facit (`src/lib/tester/vn-nivatest.server.ts`, via `getRunData` och session-routernas reservväg `GET ?id=`, som nu också svarar med `vn`). Urvalet är oförändrat: samma `selectPassagesForSession` med sessionens id och underlagsversion som klienten körde förut; kontrakttestet `src/components/session/__tests__/kontrakt-vn.test.ts` låser både POST-kropparna och urvalet. Genomgången efter nivåtestet byggs på servern i `getResultsData`.
- Ändringar i ramen (minsta möjliga, generella): `TypRitare` fick valfria `underlag` (nyckel och ritning) och `arkGrupper`; `SessionsRam` ritar underlaget i egen spalt på dator och fäst överst på mobil och monterar om det bara när nyckeln byts (texten står kvar medan påståendena byts), och låter det rulla med när Förklaringen står under svaren på mobil. Lägena skickar typens underlag och arkets grupper vidare. `RamFacit` och `Forklaringen` fick en valfri löptext (`text`) för banker som förklarar i stället för att ge en regel. Övningsprovets `tillVarde` och `franVarde` får uppgiften (numeriskt har alternativ-id per fråga). Träna fick `vetInte={false}`: passens rutt tar bara emot ett valt svar, och ett obesvarat svar hade ändrat rättning och nivå, så Ord och text och Siffror och tabeller har ingen "Vet inte" i Träna (som förut). Kryssrutans rad säger nu "Rätt svar och förklaringen direkt efter svaret." (sant för alla typer).
- Ingen databasändring.
- Backning: `git revert HASH_E2`.
