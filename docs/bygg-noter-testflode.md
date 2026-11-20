# Byggnoter: testflödet i sessionsramen

Planen: `docs/plan-testflode-2026-11-20.md`. En rad per push med vad som gick live och hur det backas. Backning är alltid `git revert` av etappens commitserie; de gamla komponenterna står kvar i trädet till och med etapp 4, så en revert saknar aldrig kod.

## Etapp 0, sanningsrättelser (2026-11-20)

- Commit `b9c5699f`, "fix(tester): sanningsrättelser i testflödet, etapp 0".
- Backning: `git revert b9c5699f`.

## Etapp 1, ramen på figurserier (2026-11-20)

- Commit "feat(tester): sessionsramen, etapp 1 figurserier".
- Live: `src/components/session/` (SessionsRam, Svarskort, Klocka, Startskarm, Resultatskarm, Forklaringen, Uppgiftsarket, lägesflödena och figurseriernas typ) för figurseriernas nivåtest, Nivåkollen, Träna och övningsprov. Övriga typer går kvar i sina gamla komponenter.
- Databas: `profiles.test_installningar` (nullbar jsonb), migreringen `supabase/migrations/20261120200000_profiles_test_installningar.sql`, körd i produktion 2026-11-20. Kolumnen kan stå kvar vid en revert (ingen kod läser den då); ska den bort: `alter table public.profiles drop column if exists test_installningar;`.
- Backning: `git revert $(git log --format=%H --grep='sessionsramen, etapp 1' -1)`.
