# Svep 4, fyra rättningar efter ägarens beslut (2026-11-22)

Arbetskopian `cvbrev-publikt3`, gren `design/publikt-omgang3`. En commit per punkt, ingen push.

## 1. Facebook-adressen

**Orsak.** Foten länkade till `https://www.facebook.com/jobbcoachai` och startsidans Organization `sameAs` till `https://www.facebook.com/jobbcoach.ai`. Ägarens besked: rätt sida är `facebook.com/jobbcoachai`. Inga andra ställen i `src` nämner Facebook-adressen.

**Lösning.** `src/lib/sociala-konton.ts` med `FACEBOOK_URL`, läst av `Footer.tsx` och `Startsidan.tsx`. SEO-grinden: en ny `LD_UNDANTAG`-rad för `/` i `scripts/seo-baslinje/publikt-omgang3-undantag.json` (datum 2026-11-22, skälet "ägarens besked 2026-11-22: Facebook-sidan är facebook.com/jobbcoachai"). Inga rader borttagna.

**Övriga sociala adresser, inte ändrade:**

- Instagram: foten `https://www.instagram.com/jobbcoach.ai/` (med snedstreck), schemat på startsidan `https://www.instagram.com/jobbcoach.ai` (utan). Samma konto, olika skrivning.
- Artiklarnas schema (BlogPosting publisher i `artiklar/[slug]/page.tsx`) och författarschemat (`worksFor` i `src/lib/authors.ts`) har `sameAs` med `https://www.linkedin.com/company/jobbcoach-ai` och `https://twitter.com/jobbcoach_ai`. Ingen av dem finns i foten eller i startsidans schema, och varken Facebook eller Instagram finns i artiklarnas schema. Om LinkedIn- och X-kontona finns behöver ägaren avgöra; ändras de fäller grinden alla artiklar och kräver egna undantag.

## 2. Jobbkartans länsrader

**Orsak.** Länsstaplarna (`#jk-lanstaplar`) ritades i en fast viewBox 640 bred med 32 enheter per rad med mus (44 bara i telefon och på pekskärm). Diagrammet skalades ned i kortet, så raden blev under 32 px.

**Lösning** (`src/components/jobbkartan/app.ts`, `jobbkartan.css`). Diagrammet ritas i sina egna mått på skärmen, en enhet är en pixel, med 44 px per rad i alla lägen, och ritas om när bredden ändras. Så att listan håller: namn och värden i 13 px (12 px under 700 px), staplarna 22 px (20 i telefonen), hela raden får en svag markering vid mus och fokus så att det syns att raden är tryckytan, och den reserverade höjden före skriptet följer de nya måtten. Sökförslagen under yrkes- och kommunsöket var cirka 42 px och har nu `min-height: 44px`.

**Mätvärden:** se avsnittet Webbläsarkontrollen.

## 3. Brevet från startflödet och veckans gratisbrev

**Läget före.** Kvoten räknas ur `profiles.weekly_letter_count` och `weekly_letter_first_used_at` (`quotaService.resolveWeeklyLetterCounter`), och räknaren ökas bara av `raknaBrevMotKvot` (generate-preview, skriv-om) och `/api/letters/generate`. Claim-rutten (`/api/public/letter-draft/claim`) rörde aldrig kolumnerna, och ingen trigger i databasen gör det. **Det inhämtade brevet räknades alltså inte mot veckans gratisbrev.** Däremot fanns ingen spärr per konto: varje utkast ur startflödet (bara begränsat per IP i `public_rate_limits`) kunde hämtas in utan att räknas, så ett konto kunde samla obegränsat med gratisbrev den vägen.

**Lösning, utan schemaändring.**

- `src/lib/letters/claim-brev.ts`: `FRIA_INHAMTADE_UTKAST = 1` och den rena regeln `claimKvot(tidigareInhamtade, harBetalt, profil, nu)`. Betalt konto eller kontots första inhämtade utkast: `fritt`, räknaren rörs inte. Senare utkast: `raknas` (som ett brev skrivet i kontot), eller `slut` om veckans gratisbrev redan är skrivet.
- `src/lib/letters/public-draft.ts`: `raknaInhamtadeUtkast` räknar tidigare inhämtade utkast som det största av två tal: rader i `public_letter_drafts` med kontot som `claimed_by` (raderna städas bort sju dygn efter att utkastet skapats) och kvittona i `user_activities` (`activity_type = 'letter_created'`, `metadata->>kalla = 'publikt_startflode'`, skrivs av `kvitteraBrevFranPublikt` vid varje claim och står kvar). Spärren håller därför också efter städningen. `forstaInhamtadeUtkast` ger kontots tidigaste inhämtade utkast.
- Claim-rutten: efter den idempotenta grenen (samma utkast igen ger samma brev, räknas aldrig igen) läses kvoten. `slut` ger 429 med samma kropp som generate-preview, inget brev skapas och utkastet märks inte. `raknas` kör `raknaBrevMotKvot` efter att brevet sparats. Två samtidiga anrop med olika utkast: efter märkningen är bara kontots tidigaste utkast fritt, ett annat som trodde sig vara fritt räknas ändå.
- Kvoterna, talen och texterna är oförändrade. Vyerna läser samma profilkolumner, så direkt efter att kontot skapats ur startflödet säger de att veckans gratisbrev är kvar, vilket nu är sant.

**Enhetstester.** `src/lib/letters/__tests__/claim-brev.test.ts` (regeln och texternas kvot: utan inhämtat brev, med inhämtat brev, två inhämtade, två när veckans brev är skrivet, utgånget fönster, betalt) och `src/app/api/public/letter-draft/claim/__tests__/route.test.ts` (första fritt, andra räknas, andra nekas med 429 utan brev, samtidiga anrop, betalt räknas aldrig).

**Kvarvarande lucka.** Misslyckas skrivningen av kvittot i `user_activities` (loggas tyst) och har utkastet städats bort kan kontot hämta in ett utkast till utan att det räknas. Två helt samtidiga anrop där båda läser före den andras märkning kan också ge två fria. Båda är begränsade av IP-gränsen och ger inte obegränsat.

### Så kontrolleras punkt 3 på live (efter deploy, med ett nytt testkonto)

1. Utloggad: `/skapa-brev/start`, skriv ett brev, klicka Skapa ett gratiskonto, registrera med e-post.
2. Kontot landar i brevet. Öppna `/dashboard/mina-brev`: kvotraden ska säga att veckans gratisbrev inte är använt. Gå till Skriv brev: det ska gå att skriva ett brev utan spärr.
3. I databasen (läsning): `select weekly_letter_count, weekly_letter_first_used_at from profiles where id = '<id>'` ska vara 0 eller null före steg 4.
4. Skriv ett brev i kontot. Kvotraden ska nu säga att veckans gratisbrev är skrivet, och `weekly_letter_count` ska vara 1.
5. Spärren: logga ut, skriv ett nytt utkast i startflödet, gå till `/login?redirect=...` via spärrens länk Logga in (eller `/register?draft=<token>` och logga in med samma konto). Claim ska nu ge 429 (veckans gratisbrev är skrivet) och inget nytt brev ska finnas i Mina brev. Med ett konto vars veckobrev inte är skrivet ska det andra utkastet i stället hämtas in och `weekly_letter_count` bli 1.
6. Radera testkontots rader efter id enligt städregeln.

## 4. Lösenord på minst 8 tecken

`src/lib/auth/losenord.ts`: `MIN_LOSENORD = 8`, `LOSENORD_HJALP` ("Minst 8 tecken"), `LOSENORD_FEL` ("Lösenordet måste vara minst 8 tecken.") och `arSvagtLosenord(err)` (koden `weak_password`, `AuthWeakPasswordError`, eller "Password should be at least" / "Password should contain").

| Ställe | Före | Efter |
|---|---|---|
| `src/app/rekryterare/registrera/page.tsx` (signUp) | 6 tecken, platshållaren "Minst 6 tecken", `minLength={6}`, Supabases fel rått | 8, platshållaren och en synlig hjälptext under fältet "Minst 8 tecken", vårt fel, `weak_password` översatt |
| `src/components/registrering/RegisterKontoSteg.tsx` (signUp) | 8, men svagt lösenord känt bara på meddelandet | konstanten, `arSvagtLosenord` |
| `src/components/registrering/registrering-copy.ts` | lydelserna för hand | lydelserna ur konstanten, ordagrant samma |
| `src/components/cv/Dokument/KontoArk.tsx` + `texter.ts` (signUp i CV-provet) | 8, felet "Lösenordet behöver vara minst 8 tecken." | konstanten och samma lydelse som registreringen, `arSvagtLosenord` |
| `src/components/mobilapp/inloggning/konto.ts` (appens signUp och updateUser på anonym) | 8, felet "Lösenordet behöver minst 8 tecken." | konstanten och samma lydelse, `arSvagtLosenord`; hjälptexten i `KontoVy.tsx` står redan före fältet |
| `src/app/auth/reset-password/NyttLosenFormular.tsx` (updateUser) | 8, Supabases fel visades rått | konstanten, `weak_password` och `same_password` på svenska, annars ett allmänt svenskt fel |
| `src/components/dashboard/SetPasswordPrompt.tsx` (updateUser) | 8, Supabases fel rått, webbläsarens egen validering före vår | konstanten, `noValidate`, felen på svenska |

Inloggningsformulären (`LoginFlode.tsx`, appens `loggaInEpost`) har ingen längdkontroll och är orörda. Inställningarna i kontot har inget lösenordsbyte (KontoSection visar bara inloggningssättet). Inga andra `signUp(` eller `updateUser(` med lösenord finns i `src`. Mejlmallen för återställning säger redan "Minst 8 tecken långt".

## Grindarna

En tung process i taget.

- `npx tsc --noEmit`: rent (efter en typrättning i rutttestet, fixup till punkt 3).
- Hela vitest: 397 filer och 4 896 test gröna, 3 filer och 13 test överhoppade som förut.
- `next build --webpack` med `--max-old-space-size=6144`: gick igenom första gången, 804 sidor.
- SEO-grinden mot `publikt-omgang3-efter-live-3.json` för `/`, `/jobbkartan`, `/priser`, `/artiklar/alva-labs-logiktest`, `/artiklar/ai-jobbmatchning` och `/for-rekryterare`: **Fel: 0** (`docs/qa/seo-diff/svep4-diff.md`, avtrycket `svep4-efter.json`). Startsidans Organization faller under den nya raden; ord, rubriker och länkar oförändrade på alla sex. Jämförelsen kördes mot de sex sidorna ur baslinjen (skriptet jämför annars hela baslinjen och anmäler sidor som inte hämtades).

## Webbläsarkontrollen (produktionsbygge, utloggad, ingen skrivning)

- **Foten:** Facebook-länken pekar på `https://www.facebook.com/jobbcoachai`, `target="_blank"`, `rel="noopener noreferrer"`, på startsidan och i artikeln.
- **Schemat:** startsidans Organization `sameAs` är `["https://www.facebook.com/jobbcoachai","https://www.instagram.com/jobbcoach.ai"]`. Artikeln har ingen Facebook-adress i schemat (se avvikelserna ovan).
- **Jobbkartan, `getBoundingClientRect`:**

| | 1440, mus (`pointer: fine`) | 412, finger |
|---|---|---|
| Länsraderna (21) | 44 px, alla | 44 px, alla |
| Text i diagrammet | 13 px | 12 px |
| Diagrammets höjd | 956 px | 956 px |
| Yrkeschipen (10) | 44 | 44 |
| Sökförslagen (yrke, 7 träffar) | 44 | 44 |
| Lägst och högst, kommuner (6) | 44 | 44 |
| Länsväljaren, spela-knappen | 44 | 44 |
| Data- och delningsknapparna (5) | 44 | 44 |
| Tabellens summary | 52,8 | 77,6 |
| Brödsmulan | 44 | 44 |

  Före: raderna 32 enheter i en viewBox som skalades ned i kortet, alltså under 32 px med mus. Med 44 px per rad blir diagrammet högre än kortet bredvid på dator; texten i 13 px, staplarna i 22 px och radmarkeringen gör att listan läses som en lista och inte som tomrum.
- **Yrkeskartan** (`/cv-exempel/larare`, `/personligt-brev-exempel/larare`): enda klickbara är Se hela kartan, 44 px i 1440 och 412.
- **Rekryterarnas registrering:** hjälptexten "Minst 8 tecken" syns under fältet och som platshållare innan man skriver. Alla fält giltiga och lösenordet `1234567`: felet "Lösenordet måste vara minst 8 tecken." och inget anrop till Supabase Auth.

Inte kontrollerat i webbläsare: allt inloggat (punkt 3, SetPasswordPrompt, återställningen med en riktig länk, appens konto), eftersom ingen inloggning eller skrivning fick göras. Punkt 3 är verifierad med enhetstester och kodläsning, se avsnittet om live ovan.

Efteråt: servern stängd, `.next` borttagen, `scripts/arbetsyta.mjs` visar ingen server från svepet. Den headless Chrome som står kvar (`qa-live-4`) är den andra agentens.
