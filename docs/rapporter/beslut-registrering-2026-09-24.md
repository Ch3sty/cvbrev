# Beslut: registreringstratten och profilomläggningen

Datum 2026-09-24. Roll: saas-lead. Underlag: `docs/design/profil-registrering-2026-09-24.html` med spec, `docs/plan-paket-och-onboarding.md` (Fas 2A och 2D), `docs/rapporter/beslut-paketnamn-2026-09-24.md`, `docs/rapporter/analys-seo-tillvaxt-2026-09-23.md`, koden på main (307e306d), PostHog utan kohort 248676 och Supabase utan `admin_undantagna_konton()`. Ingen kod och ingen designfil är ändrad.

## Vad koden och datan säger, som ägarens fråga hänger på

1. **Valet döljer ingenting, och kan inte göra det.** `onboarding_track` läses av betalväggens `suggestPlan` (`src/lib/access/features.ts`, rad 96), av sidomenyns grå rader och av tester- och cv-mallar-sidornas presentation. Ingen behörighet läser det. `suggestPlan` väljer dessutom paket efter den funktion hon faktiskt stötte på, spåret slår bara igenom när det är `allt`. Alltså: den som kom för CV och sedan öppnar nivå 2 i testerna får Träningspaketet föreslaget, inte CV-paketet. Ägarens uppgraderingsväg via upptäckt fungerar i dag av konstruktion.
2. **Det som planen lovade att spåret styr är inte byggt.** Fas 2A skärm 1.3 säger att spåret ordnar hemskärmen. `useNextBestAction` läser inte spåret, träningsfokus gäller bara betalande (`DashboardHem.tsx`, rad 206, `scope === 'tester'`), och Kom igång för gratiskonton har en fast lista (profil, CV, analys, mall, matrislogik) oavsett vad hon kom för. Ett gratiskonto som kom för testerna får i dag en hemskärm som pekar på CV-uppladdning.
3. **De två folkgrupperna möts inte, redan i dag, utan någon fråga.** Av 99 konton på 90 dagar gjorde 47 ett CV och 35 ett test. Fyra gjorde båda, alla samma dag och alla CV först. Noll gick från test till CV. Risken att en fråga smalnar av upptäckten är därför inte den verkliga risken. Den verkliga risken är att vi inte visar bredden för någon, och det är en hemskärmsfråga, inte en registreringsfråga.
4. **Formuläret är flaskhalsen, inte valet.** 140 personer på /register på 30 dagar, 33 tryckte Skapa konto, 60 konton i databasen (Google räknas inte i PostHog). Sedan spårvalet gick live 22 september: 5 nya konton, 3 valde CV gratis (förvalt kort), 0 Träningspaketet, 1 köp (Dagspasset).

## Fråga 1 och alternativ C: var frågan ska ligga, och om det ska vara en paketvy

Tre alternativ vägda på konto, köp och aktivering.

| | A. Fråga före kontot (designen) | B. Inget före, spårval efter (i dag) | C. Paketvy före kontot (ägarens tanke) |
|---|---|---|---|
| Till konto | Ett tryck extra för 84 procent, men kontosteget får ett skäl ("Du börjar med testerna"). Okänt netto, kill-regel finns. | Kortast väg, men formuläret står utan skäl när statistik och trialrad tas bort. | Störst risk. Den som tryckte "Starta gratis test" möter ett pris innan hon sett ett test. Gratis som fjärde kort tävlar på paketens villkor och förlorar (Fas 2D avvisade det). |
| Till köp | Priset syns i steg 3 med sammanhang, för den som redan har konto. | Samma skärm som A:s steg 3, fast utan intent, med CV förvalt. | Priset syns tidigast av alla, men köpet kräver ändå konto och kassa, så C kan aldrig ge fler köp än antalet konton, och den sänker antalet konton. |
| Aktivering | Landar i rätt verktyg. Bäst. | Landar på hemskärmen i allmänt läge, 47 procent i dag. | Gratisvalet säger inte vad hon vill göra. Samma som B. |

**Beslut: A, med tre villkor.** Frågan ställs före kontot, som ett verktygsval, aldrig som ett paketval. Den kostar ett tryck, går att hoppa över, ersätter dagens paketlista efter kontot, och den bär genom Googles redirect. Villkoren: (1) `onboarding_intent` får bara läsas av landningen, Kom igång och hemskärmens ordning, aldrig av `Sidebar`, `features.ts` eller någon behörighet, och det står som acceptanskriterium med grep. (2) Kill-regeln mäts med minst 60 ingångar, alltså tidigast fyra veckor efter deploy: tappar steg 1 mer än 25 procent mot kontosteget flyttar samma fem kort till efter kontot, inga andra ändringar. (3) Textsidan "Allt annat finns i menyn, och det mesta går att prova gratis" står kvar under frågan.

**C avvisas som ingång för bar /register, men två saker ur C behålls.** Formen: ChoiceCards i radiogrupp med en enda Fortsätt i foten, vilket är exakt designens steg 1 och spårvalets form i Fas 2D. Och pengavägen: den som redan vet att hon vill köpa kommer från /priser eller ett reklamkort med `?paket=`, hoppar över frågan och landar på köpsteget efter kontot. Den vägen är C i praktiken, och den finns sedan 22 september. Avläsning 22 oktober: ger /priser-ingången fler köp per konto än headeringången med minst tre gånger, byggs C som A/B-test på bar /register, då med gratis som sekundärknapp i foten, inte som fjärde kort, och längdväxeln bara på Hela paketet.

Skälet i en mening: HBO Max kan börja med priset därför att besökaren redan vet vad HBO är. Vår besökare sökte "logiskt test" på Google för tio sekunder sedan, och det enda hon vet om oss är att testet var gratis.

## Fråga 2: vad valet får påverka

Valet påverkar tre saker och inget mer: landningssidan vid Börja gratis, ordningen i Kom igång och Nästa handling, och vilket paket steg 3 föreslår. Steg 3 behålls som designen ritar det, ett kort med Börja gratis lika stor bredvid, av två skäl: det är den enda ytan där en ny användare ser ett pris med sammanhang (lärdomen från reverse trial var att ingen såg ett pris), och det enda köpet sedan juni kom just från skärmen efter kontot. Betalväggarna fortsätter föreslå paket efter funktionen hon stötte på, så upptäcktsvägen tester efter CV leder till Träningspaketet, inte tillbaka till CV-paketet. Ingen kodändring behövs för det, det är dagens `suggestPlan`.

## Fråga 3: så ser hon hela bredden första gången

Ingen ny "Det här finns också"-rad. Kom igång är den raden, och den byggs om så att bredden är inbyggd i stället för att förlita sig på menyn.

1. **Kom igång per intent för gratiskonton (S).** `KOM_IGANG_LISTA.gratis` blir fem listor, en per intent, med samma regel för alla: det hon kom för först, sedan en gratis bricka från varje annat område. Intent tester: matrislogik grund, personlighetstestet, intervjuprovet, ladda upp CV, analysen, tre matchade jobb. Intent CV: ladda upp CV, analysen, en mall, ett personligt brev, matrislogik grund, intervjuprovet. Varje bricka är något hon kan göra utan att betala, så raden säljer ingenting och visar allt.
2. **Träningsfokus på hemskärmen också för gratiskonton med intent tester eller intervju (S).** I dag kräver det `scope === 'tester'`. Utan det pekar hemskärmen på CV-uppladdning för den som kom för ett test, vilket är fel första handling.
3. **Nästa handlings oprövade funktion väljs ur det andra området (S).** `useUnusedFeatures` får intent som ordningsnyckel: CV-intent får testerna som första förslag efter första dokumentet, test-intent får CV-analysen. Det är där korsanvändningen ska födas, och den föds inte i dag (4 av 99).
4. **Menyn orörd.** Alla rader syns för alla. De grå raderna säger redan "Ingår inte. Finns i X" och gäller bara betalfunktioner.

## Fråga 4: de fem besluten

| # | Beslut | Svar |
|---|---|---|
| 1 | Före eller efter kontot | Före, med villkoren och kill-regeln ovan. Fas 2A:s argument gällde formulärfält; det här är en skärm som går att hoppa över och som ersätter dagens paketlista. |
| 2 | Fem val eller fyra | Fem. Tester och intervju landar på olika sidor med olika gratisnivå. |
| 3 | Paketet som primär i steg 3 | Ja, med Börja gratis i samma storlek. Avläsning efter fyra veckor: går över 85 procent till gratis och under 5 procent till kassan byts primären, inget annat. |
| 4 | /register och /login i nya skalet | Ja, samma släpp. Men raden om fem dagars Premium och statistikrutorna tas bort denna vecka, före allt annat. Det är osanna påståenden på sajtens viktigaste sida. |
| 5 | Klientförminskning av foton | Ja. 800 px längsta sida räcker för mallarnas fotoruta. |

## Fråga 5: profilomläggningen, tre ändringar

1. **Statusraden räknar namn och ort, aldrig foto.** Designen säger att vi inte ska tjata om foto och räknar sedan foto när ort också saknas. En regel: foto står aldrig i raden.
2. **"Smart val: Ingår när du har ett paket" står kvar** eftersom koden spärrar på `subscriptionTier` och alla tre paketen öppnar den. Ingen ny feature-nyckel nu; specens osäkerhet stryks.
3. **Byggordningen vänds.** Mätningen och de osanna påståendena först (S), sedan Del B, sedan Del A:s navigering (S) och profilsidan (M). Registreringen träffar varje nytt konto, profilen träffar bekvämligheten för befintliga. PaketKort-knappen (h-auto) följer med Del A:s navigering.

Resten av Del A godkänns som ritat: två menyrader, fyra sektioner, Hoppa till, spara per fält, fotofältet.

## Vad som ändras i designen och specen

- Steg 1: oförändrat. Acceptanskriterium tillkommer: `onboarding_intent` förekommer inte i `src/components/dashboard/Sidebar.tsx`, `src/lib/access/` eller någon route under `/api/` utom `/api/onboarding/track`.
- Steg 3: oförändrat i form. Mätregeln för primärknappen tillkommer.
- Nytt i Del B: Kom igång per intent, träningsfokus för gratiskonton, intent som ordning i `useUnusedFeatures`. Tre S-punkter, samma släpp som steg 3, annars är frågan tom för gratisanvändaren.
- Del A: statusraden utan foto, osäkerheten om Smart val struken.
- Byggordning: 1 mätningen, 2 osanna påståenden, 3 Del B datamodell och valkommen, 4 Del B steg 1 till 3 med de tre nya S-punkterna, 5 Del A navigering, 6 Del A profilsidan, 7 QA.
- Avläsning: 22 oktober för /priser-vägen mot headervägen (alternativ C-frågan), fyra veckor efter deploy för kill-regeln och steg 3.

## Behöver ägarens beslut

1. Godkänna A med villkoren, och att C avgörs av avläsningen 22 oktober i stället för att byggas nu.
2. Godkänna att de osanna påståendena på /register tas bort denna vecka, oberoende av resten.
3. Godkänna de tre S-punkterna för bredden i samma släpp som tratten.
