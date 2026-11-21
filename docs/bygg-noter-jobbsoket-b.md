# Byggnoter: Jobbsöket omgång 1, etapp 2B (Sökta tjänster)

Byggare B, gren `feat/jobbsoket-b`, arbetskopia `jobb-b`, 2026-11-21. Bas: `feat/jobbsoket-omgang1` (595fa99a).

## Vad som byggdes

- `/dashboard/sokta-tjanster` (`page.tsx`, server): `hamtaSoktaTjanster` i ett varv, vyn `src/components/jobb3/sokta/SoktaVy.tsx`.
  - Lista (`Lista.tsx`): väggen med StegFack, veckans mål (Ändra öppnar arket), avslutade-chip; panelen med växeln, sökfältet, filterraden och grupperna Följ upp, Intervju på gång, Erbjudande; under panelen ifyllnad i efterhand, Ska sökas, Väntar svar, Avslutade (hopfällt kort, Visa).
  - Statistik (`Statistik.tsx`): väggen "Tre av sju har svarat" med brickgrupper, tratten, veckostaplarna med mållinje (växeln Vecka/Månad, månad utan mållinje), Hur du sökte, Svar per CV med tomt läge. Sankey är borta här.
  - Rapport (`Rapport.tsx`): nedräkningen (StortTal och tidslinjen I dag, Öppnar, Sista dag), månadsväljaren (den här månaden bakåt till första sökta, högst sex), rapportbladet, utskrift (samma `printing-tracker-report`), kopiera som text, delningslänken (skapa, kopiera, återkalla).
  - Arket Logga sökt tjänst (`LoggaArk.tsx`): Jag har sökt / Jag ska söka, fälten som i Mobil-logga, Fler detaljer, CV-val. Används också för Markera som sökt / Sökt ändå (Ska sökas) och Redigera (tjänstens sida).
  - Ifyllnad i efterhand (`Backfill.tsx`): samma rutt och 30 dagars snooze som förut.
- `/dashboard/sokta-tjanster/[id]` (`page.tsx`, server): `hamtaSoktTjanst`, vyn `TjanstVy.tsx`. Väggen med TjanstHuvud, DatumRuta och Ändra tid, tjänstens bana. Panelen Nästa steg: Hur gick intervjun? (tre svar), Förbered intervjun (sju frågekort, Kraven i annonsen bara när brevet har krav) eller Följ upp. Händelser (lodrät bana, Följde upp insorterad, kommande intervju, nästa steg), snabbval, "Rätta en händelse" (Ta bort / Ångra per rad), Om tjänsten, Redigera, Ta bort tjänsten med bekräftelse.
- Uppföljningen (`Uppfoljning.tsx`): laddningsläge, utkast som papper med textarea (sparas vid blur, PUT), Skriv om kortare (döljs när tre är använda, felet ordagrant ur ETAPP2), Öppna i e-post (mailto), Kopiera mejlet, "Skickade du mejlet?" (Ja loggar med via epost/kopierat), Jag har redan skickat det (via eget), Vad som händer sedan, bekräftelse med Ångra. 402 ger betalväggen i SparrRam, 429 ett eget läge; Kryssrutan står kvar i båda.
- Små ark (`SmaArk.tsx`): Ändra veckans mål, Lägg till händelse (Kallad till intervju frågar dag, tid, plats), Intervjuns tid (Ändra tid och Den blev flyttad), bekräftelse, HurGickSvar.
- CSS: `src/app/jobb3-b.css` (prefix `j3-b-`), importerad i `src/app/dashboard/layout.tsx` direkt efter `jobb3.css`.
- Borttaget: `SoktaTjansterClient.tsx`, `[id]/ApplicationDetailClient.tsx` och komponenterna AddEventSheet, ApplicationCard, BackfillBanner, CvComparisonCard, QuickLogSheet, SheetShell, ShareTab, StatsTab, StatusBits, TrackerIllustrations. `FunnelBars` och `SankeyChart` står kvar: den publika delningssidan `/dela/sokta-tjanster/[token]` använder dem.

## Signaturer som andra behöver

- **Öppna arket från Översikt eller en träff:** `/dashboard/sokta-tjanster?logga=1` (eller `?logga=ska-soka`). Förifyllt med `tjanst`, `arbetsgivare`, `ort`, `lank` (http/https), `sista` (YYYY-MM-DD), `af` (AF:s annons-id, ger `af_ad_id`) och `matchning` (0 till 100). Exempel: `soktaHref({ logga: 'sokt' }) + '&tjanst=Ekonomiassistent&arbetsgivare=Ålö%20AB&af=123'`.
- Vy och filter: `?vy=statistik|rapport`, `?filter=folj-upp|ska-sokas|vantar-svar|intervju|erbjudande|avslutade` och de gamla parametrarna (via `tolkaSoktaAdress`). `?manad=YYYY-MM` väljer rapportens månad.
- Tjänsten: `tjanstHref(id, 'forbered' | 'folj-upp' | 'hur-gick' | 'andra-tid')`. `andra-tid` öppnar arket för tiden direkt.
- `LoggaArk` (default export) och `HurGickSvar`, `IntervjuTidArk`, `HandelseArk`, `MalArk` ur `SmaArk.tsx` går att importera om någon annan vy behöver dem.

## Ändringar i kit och motor (rättade fel)

1. `src/lib/jobbsok/adress.ts`, `las()`: Next 16:s `ReadonlyURLSearchParams` är inte en `URLSearchParams`-instans, så `tolkaSoktaAdress(useSearchParams())` gav alltid listan. Läser nu allt som har en `get`-metod. Test gröna (41).
2. `src/app/jobb3.css`: `TjanstRad handlingMobil={false}` dolde inte knappen på telefon (`.j3-rad-handling { display: flex }` vann över Tailwinds `hidden`). Lagt till `.j3-rad-handling.hidden` med rätt display under och över 1280.

## Egna beslut

1. **Betalväggen för uppföljningen:** ingen befintlig variant har rätt text (alla säger något annat: tio meddelanden, brev, rapport). Därför egen rubrik och mening i SparrRam ("Fler uppföljningsmejl ingår i Premium", inget pris i vår text) och dagens `PaywallCard variant="chatt" del="fot"`: bara köpknappen med dagens pris, logik och kassa. `chatt` är närmast i sak (Jobbcoachens AI-text). Visningen mäts av servern (`uppfoljning_sparr`) eftersom `del="fot"` inte mäter visning. Vill ägaren ha en egen variant (`uppfoljning`) är det ett tillägg i `paywall-copy.ts`.
2. **Vy och filter byts med `history.pushState`**, inte en ny serverrunda: all data finns redan, bakåtknappen fungerar. Rapportens månad hämtas med dagens `GET /api/applications/report?month=`.
3. **Grupperna:** Följ upp, Intervju på gång och Erbjudande står i panelen; finns ingen av dem står Väntar svar i panelen. Erbjudande ligger i panelen (det är en handling), inte efter Väntar svar.
4. **Hur gick intervjun? i listan** öppnar ett ark med de tre svaren; Den blev flyttad går vidare till arket för ny tid.
5. **Snabbvalen** följer läget: väntar svar (Kallad till intervju, Fick avslag, Annat), intervju (Intervju genomförd, Provjobbade, Fick erbjudande, Fick avslag, Annat), erbjudande (Tackade ja, Tackade nej, Annat), avslutad (bara Lägg till händelse).
6. **Ta bort en händelse** (fanns i dag som kryss per rad) ligger bakom "Rätta en händelse" under snabbvalen så att banan ser ut som skissen.
7. **Panelens block:** Hur gick > Förbered (kallad, med eller utan tid) > Följ upp (tyst eller utkast finns). `?steg=` styr när blocket är giltigt. Följ upp står kvar på sidan efter att mejlet loggats, så att bekräftelsen och Ångra syns.
8. **Utkastet skrivs när blocket Följ upp visas** (POST vid första visning; sparat utkast visas utan anrop). Ämnesraden går inte att ändra (motorn har alltid mallens ämne); brödtexten går att ändra och sparas vid blur, före Skriv om kortare och före Öppna i e-post.
9. **Kopiera mejlet** kopierar brödtexten (ämnet står i rutan ovanför).
10. **Delningslänkens kryssruta** är förvald av, som skissen (i dag var den förvald på).
11. **Rapportens siffror** ("Hela din sökning i siffror") tas ur tratten, så de stämmer med statistiken; de syns också på gratisnivån (antalen är fria, som i dag).
12. **Månadsväljaren** visar högst sex månader bakåt till första sökta tjänsten (i dag pilar utan slut).
13. **Nedräkningen** efter att fönstret öppnat (1 till 14): noderna blir Öppnade, I dag, Sista dag. Passerad sista dag: ingen nedräkning, väggen säger dagens text (`afReportStatusText`).
14. **Sökfältet** finns kvar på telefon (under filterraden) fast skissen inte ritar det: det finns i dag.

## Avvikelser från skissen, med skäl

- Rutan "Så ser det ut på gratisnivån" i Sokta-rapport är inte byggd för Premium: den är en förklaring till ägaren. Gratiskontot ser i stället de grå raderna och betalväggen (dagens `af-rapport`) i SparrRam.
- Taggen "Nytt i flödet" byggs inte (beslut efter etapp 1).
- "Tre av sju frågor övade" i listans intervjurad ersätts av motorns `intervjuText` (tid och dagar kvar): listan läser inte intervjuproven.
- Kraven i annonsen visas alla på telefon (skissen visar bara det saknade plus "Visa alla fem krav").
- Datumfälten är webbläsarens egna (beslut efter etapp 1).

## Det som inte är prövat

- Inget fullt bygge, ingen perf, ingen klickmatris (slutkontrollen). `npx tsc --noEmit` grön, `src/lib/jobbsok` vitest 41/41.
- Skrivande flöden är inte klickade mot databasen i den här etappen: Logga sökt tjänst, Jag ska söka, Markera som sökt, Lägg till händelse, Ändra tid, Hur gick-svaren, Skickade du mejlet, Jag har redan skickat det, Ångra, Skriv om kortare, Ta bort, delningslänken och utskriften. Rutterna är rökprovade av motorn; vyerna anropar dem enligt kontraktet. Ingen ny testdata är skapad.
- Gratisspärren är prövad: Clas Ohlson på gratiskontot gav 402 och betalväggen med kryssrutan kvar.
- Tomt läge utan några sökta tjänster är inte skärmprövat (inget QA-konto är tomt); tomt filter är prövat. Laddningsläget för utkastet syns bara kort.
- ESLint i arbetskopian tolkar inte TypeScript (parsningsfel på alla `type`-importer, också i andra filer); inte åtgärdat.
- `src/components/illustrations/ApplicationIllustrations.tsx` används inte längre (låg utanför min mapp, står kvar).

## Skärmbilder

`scratchpad/jobbsok/bygg/b/`: `sokta-1440-premium.png`, `sokta-412-premium.png`, `statistik-1440-premium.png`, `statistik-412-premium.png`, `rapport-1440-premium.png`, `rapport-412-premium.png`, `tjanst-ue-1440-premium.png`, `tjanst-ue-412-premium.png`, `tjanst-no-1440-premium.png` (Följ upp), `tjanst-no-412-premium.png`, `logga-ark-1440-premium.png`, `logga-ark-412-premium.png`, `sokta-1440-gratis.png`, `rapport-1440-gratis.png` (lås), `folj-clas-1440-gratis.png` (betalväggen), `folj-postnord-1440-gratis.png`, `tjanst-no-1440-premium-mork.png`, `sokta-tomtfilter-1440-premium-mork.png`. Skriptet: `skarm.cjs` (samma mapp).

## Hur man backar

`git revert` på commiten. Den återställer de gamla komponenterna och sidorna; motorn, kitet och migreringen påverkas inte (utom de två rättningarna ovan, som är ofarliga att behålla).
