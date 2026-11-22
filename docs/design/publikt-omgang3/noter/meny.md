# Skissnot: menyn

Skiss: `sidor/meny.html`, byggd till `ut/skiss-meny.html`. Bilder: `bilder/meny-375-*`, `-412-*`, `-1440-*`. Egen delfil: `delar/meny-mega.html`.

Skissen visar tre saker: datorläget med "Vad vi erbjuder" öppen över startsidans hjälte (bara i 1440-bilden), telefonen med stängd och öppen meny (i telefonbredderna i full bredd, i 1440 som två ytor i telefonbredd), och menyn i var och en av de fem färgerna.

## Vad som ändras mot i dag

- **Färg och stil.** Den vita raden på beige botten är borta. Menyn står i sidans mörka färg: indigo på startsidan, Funktioner, Priser, Om oss och testsidorna, petrol på CV-sidorna, plommon på brevsidorna, skog på Jobbsökets sidor och grafit på Artiklar, Hjälpcenter, Kontakt, Logga in och Skapa konto. "Skapa konto" är kopparknappen med klack i stället för den svarta knappen. Layouten är dagens: logga, fem val, Logga in, Skapa konto.
- **"Vad vi erbjuder" i datorn.** Tre grå grupper (Skriv och förbättra, Hitta jobb, Träna) blir fyra delar i samma ordning och färger som i kontot: Rekryteringstester, CV, Personliga brev, Jobbsöket. Varje del har ett färgat huvud och sina länkar med en rad förklaring. Testerna står först och har en liten matrisuppgift, breven ett litet brev. Under ligger Premium-raden med priset och "Se vad som ingår", och bredvid den Alla funktioner, Jobbkartan, Räkna ut lön och skatt och För rekryterare. Sidan bakom tonas ned när menyn är öppen.
- **Telefonen.** Menyn öppnas över hela skärmen i stället för som en vit lista. De fyra delarna är färgade block med länkarna som vita tryckytor (54 px höga). Under dem Funktioner, Priser, Artiklar, Om oss, Jobbkartan, För rekryterare och Räkna ut lön och skatt, sedan Premium-raden. Skapa konto gratis och Logga in ligger fast i skärmens nederkant. När menyn är öppen byts toppradens "Skapa konto" mot "Stäng", så att skärmen bara har en kopparknapp.

## Oförändrat för SEO

- Alla länkar i dagens meny finns kvar, med samma adresser: Funktioner, Priser, Artiklar, Om oss, Personligt brev, CV-analys, Skapa CV, CV-mallar, LinkedIn-profilen, Jobbmatchning, Bli upptäckt, Jobbkartan, Rekryteringstester, Jobbcoachen, Räkna ut lön och skatt, Se vad som ingår, Alla funktioner, För rekryterare, Logga in, Skapa konto.
- Megamenyns länkar ska fortsatt stå i HTML även när menyn är stängd, som i dag.
- Nya länkar: Sökta tjänster (med märket Nyhet), Personlighetstest och Personligt brev-exempel.

## Skillnad mot `delar/mega.html`

`delar/meny-mega.html` är en egen kopia. Skillnaderna:
- Varje del har ett färgat huvud i delens mörka färg i stället för en rubrik på ljus botten. Huvudet är en länk till delens huvudsida.
- Testkolumnen har en liten matrisuppgift och raden "Grundnivån är gratis i alla åtta". Brevkolumnen har ett litet brev och "Första brevet är gratis".
- Länken "Alla funktioner" är tillagd (finns i dag, saknades i grundens mega).
- "Jobbcoachen: Svar med källor" är bytt till "Intervju, avtal och avslag". Jag hittade inget belägg för att svaren alltid har källor.
- "LinkedIn-profilen: Syns i rekryterarnas sök" är bytt till "Rubrik och sammanfattning som hittas".
- Foten är delad i två: Premium-raden med knappen, och de fyra övriga länkarna i en egen ruta.
- CSS:en ligger i `sidor/meny.html` (klasserna `mm-*`), inte i kit.css.

## Rubriker och påståenden som bytts

Inga rubriker. Menyn har inga påståenden i dag utöver Premium-raden, som står kvar ordagrant.

## Kräver beslut

1. **Vart Sökta tjänster länkar.** Det finns ingen publik sida för Sökta tjänster i koden i dag. En annan skiss i den här omgången ritar en sådan sida (`noter/sokta-tjanster.md`). Tills den är byggd kan menyn länka till avsnittet `#sokta-tjanster` på /funktioner.
2. **Gruppnamnen.** Dagens grupper heter Skriv och förbättra, Hitta jobb och Träna. Skissen använder delarnas namn. Jobbcoachen flyttar från Träna till Jobbsöket (så ligger den i kontot), och Räkna ut lön och skatt och Jobbkartan hamnar bland övriga länkar.
3. **Kampanjraden** (Black Week) under menyn är inte ritad. Den kan stå kvar som i dag, i grundens `.kampanj`.
4. **Märket Nyhet** på Sökta tjänster: hur länge det ska sitta.

## Filer som bygget rör

- `src/components/landing/LandingNavbar.tsx`, `src/components/landing/nav-data.ts` (grupperna blir fyra, nya länkar), `src/components/landing/NavIkon.tsx`
- `src/components/Footer.tsx` läser samma `nav-data.ts`
- Flödesskalet för Logga in och Skapa konto har en egen topprad (`src/components/registrering/PubliktFlodesskal.tsx`), se noterna för de sidorna.

## Förslag till grunden

- `.nav-val button[aria-expanded='true'] svg { transform: rotate(180deg) }` så att pilen vänder när menyn är öppen.
- Klasserna `mm-*` (megamenyn) och `tm-*` (telefonmenyn) kan flyttas till kit.css om fler skisser ska visa en öppen meny.
- Grundens `.nav` trycker ihop menyknappen när den står i en yta som är smalare än fönstret. `flex: none` på `.nav-meny` löser det.
