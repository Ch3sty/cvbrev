# Slutlig copy för inloggat läge

Skriven 2026-09-14 av `svensk-ux-copywriter` utifrån `docs/plan-copy-inloggat.md`, avsnitt B2, C, D, E och F. Beslut som gäller: Premium behålls som produktnamn, matchgraden förklaras i ord utan vikter, sexsekundersregeln saknar källa i briefen och skrivs därför som hur rekryterare arbetar utan siffra.

Alla längder är räknade i tecken inklusive mellanslag och skiljetecken. Kolumnen "Nuvarande text" är hämtad ur koden 2026-09-14, radnumren ur briefen kan ha förskjutits något.

## Sex tonprinciper

1. **Svenska facktermer först.** Vi skriver som Arbetsförmedlingen, TRR och svenska rekryterare talar: kravprofil, meriterande, skall-krav, urval, personligt brev, ansökningshandlingar, kompetenser, och tar ett engelskt ord bara när svenskan saknar ett.
2. **Vi säger vad vi gör, aldrig vad vi är.** "Vi läser annonsens kravprofil" i stället för "kraftfull plattform", och därför heller aldrig "magi", "lås upp din potential", talstreck eller andra ord som låter som reklam eller maskin.
3. **Rekryterarens perspektiv är auktoriteten.** En nyckelmening får gärna säga vem som läser, vad de letar efter först och vad som avgör i urvalet, men beskriver hur de arbetar, inte med en siffra vi inte kan belägga.
4. **Siffror bara när koden backar dem.** 30 sekunder, tre träffar, ett brev om dagen, 49 kr, står bara där det är sant i koden; är vi osäkra skriver vi ordet i stället för siffran.
5. **Vi och du, aldrig systemet.** Vi läser, vi hittar, vi föreslår, du väljer och du bestämmer; ingen passiv form och inget "plattformen", "verktyget" eller "AI:n" som subjekt.
6. **Integritet där filen lämnar användaren, och gränser utan skam.** Vid uppladdning, analys och matchning står att namn, telefon och adress maskas innan texten går till någon AI-modell, och varje betalvägg säger vad du har gratis, vad som ligger bakom och varför, utan att fira och utan att skryta.

Gränsfall bedöms så här: om en mening bryter mot princip 3 eller 4 stryks siffran eller påståendet, aldrig meningen. Om en mening bryter mot princip 1 byts ordet, aldrig satsen runt omkring.

---

## Omgång 1: sidomenyn och hemskärmen

### `src/components/dashboard/Sidebar.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| Sidebar.tsx:222, label | `CV` | `Mina CV` | ja (7/18) | etikett |
| Sidebar.tsx:226, sublabel utan CV | `Ladda upp ditt första CV` | `Ladda upp ditt första CV` (oförändrad) | ja (24/34) | tom vy |
| Sidebar.tsx:231, label | `Brev` | `Personliga brev` | ja (15/18) | etikett |
| Sidebar.tsx:234, sublabel utan CV | `Ladda upp CV först` | `Ladda upp ett CV så börjar vi` | ja (29/34) | tom vy |
| Sidebar.tsx:246, label | `Skriv brev` | `Skriv nytt brev` | ja (15/20) | etikett |
| Sidebar.tsx:246, ny sublabel | (saknas) | `Klistra in annonsen, vi skriver` | ja (31/34) | hjälprad |
| Sidebar.tsx:253, label | `Analysera CV` | `Analysera CV` (oförändrad) | ja | etikett |
| Sidebar.tsx:253, ny sublabel | (saknas) | `Så läser en rekryterare ditt CV` | ja (31/34) | hjälprad |
| Sidebar.tsx:260, label | `Jobbmatchning` | `Jobbmatchning` (oförändrad, se anmärkning) | ja | etikett |
| Sidebar.tsx:260, ny sublabel | (saknas) | `Lediga jobb som passar ditt CV` | ja (30/34) | hjälprad |
| Sidebar.tsx:274, label | `Rekryteringstester` | `Rekryteringstester` (oförändrad) | ja | etikett |
| Sidebar.tsx:274, ny sublabel | (saknas) | `Träna på testerna innan urvalet` | ja (31/34) | hjälprad |
| Sidebar.tsx:302, label | `Premium` | `Premium` (oförändrad, beslut) | ja (7/14) | etikett |
| Sidebar.tsx:86, badge gratis | `Gratis` | `Från 49 kr` | ja (10/12) | etikett |
| Sidebar.tsx:73/83, badge aktiv | `Aktiv` | `Aktiv` (oförändrad) | ja (5/12) | etikett |
| Sidebar.tsx:80, badge nedräkning | `{n} dagar kvar` | `{n} dagar kvar` (oförändrad) | ja vid n ≤ 9 | etikett |

Anmärkningar:
- "Jobbmatchning" står kvar som etikett. Briefens avsnitt F ber bara om sublabel, och "matchning" är gångbar svenska (Arbetsförmedlingen använder "matchning" om sin egen verksamhet). Sublabeln bär argumentet.
- "Från 49 kr" är sant: dagspasset kostar 49 kr enligt `PrenumerationFAQ.tsx:13`. Ändras dagspassets pris måste badgen följa med.
- Sublabels för de fyra verktygsraderna ska visas alltid, inte bara i tomt tillstånd. Det kräver att `sublabel`-propen inte villkoras på `hasNoCv` för dessa rader.

### `src/app/dashboard/(oversikt)/DashboardHero.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| DashboardHero.tsx:91, rubrik | `Börja med ditt CV` / `Börja med ditt CV, {firstName}` | oförändrad | ja | etikett |
| DashboardHero.tsx:94, underrad | `Vi läser det och visar vad en rekryterare ser. Tar 30 sekunder.` | `Rekryterare letar först efter senaste rollen och vad du uppnådde. Vi läser ditt CV likadant, på 30 sekunder.` | ja (108/110) | ingress |
| DashboardHero.tsx, ny rad under dropzonen | (saknas) | `Namn, telefon och adress maskas innan texten går vidare till någon AI.` | ja (70/80) | hjälprad |

Anmärkningar:
- Sexsekundersregeln har ingen källa i briefen och skrivs därför inte ut som siffra. "Senaste roll och vad du uppnådde" är hur rekryterare beskriver sin första genomläsning och kräver ingen källa.
- Förtroenderaden är sann enligt `src/lib/privacy/pii.ts`: namn, e-post, telefon, adress, postnummer och personnummer ersätts med platshållare före varje AI-anrop. Placeras som `text-meta text-ink-3` direkt under `InlineCVUpload`, före länken "Har du inget CV? Bygg ett här".

### `src/app/dashboard/(oversikt)/SnabbAtgarder.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| SnabbAtgarder.tsx:43, skapa-brev | `Personligt brev anpassat efter rollen.` | `Vi läser kravprofilen och skriver brevet.` | ja (41/48) | hjälprad |
| SnabbAtgarder.tsx:60, jobbmatchning | `Tusentals lediga tjänster i Sverige.` | `Ditt CV mot Arbetsförmedlingens annonser.` | ja (41/48) | hjälprad |
| SnabbAtgarder.tsx:68, cv-analys | `Poäng och förbättringar direkt.` | `Vad rekryteringssystemet ser och vad du ändrar.` | ja (47/48) | hjälprad |
| SnabbAtgarder.tsx:84, bli-upptäckt | `Låt rekryterare hitta din profil.` | `Anonym tills du själv svarar rekryteraren.` | ja (42/48) | hjälprad |

Anmärkningar:
- "Anonym tills du själv svarar" är sant enligt Bli upptäckt-planen (anonym profil först, kandidaten svarar på intresse). Ändras det flödet måste raden följa med.
- Övriga två brödtexter (sökta tjänster, tester) står inte i briefen och lämnas orörda.

---

## Omgång 2: brevflödet

### `src/app/dashboard/skapa-brev/CreateLetterClient.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| CreateLetterClient.tsx:920, ny ingress överst i steg 1 | (saknas) | `I ett svenskt urval läses brevet mot annonsens kravprofil. Välj vilket CV vi ska utgå från, så lyfter vi fram det som svarar mot kraven.` | ja (136/140) | ingress |

Anmärkning: placeras som `<p className="text-sm leading-[22px] text-ink-2">` före `OnboardingNextStep`, inne i `step === 1`-blocket. Visas inte när `pendingDraft` tar över steget.

### `src/app/dashboard/skapa-brev/components/steps/TonalityLanguageStep.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| TonalityLanguageStep.tsx:123, title | `Smart-anpassad` | `Vi väljer ton åt dig` | ja (20/22) | etikett |
| TonalityLanguageStep.tsx:124, description | `Vi läser ditt CV, annonsen och företagets ton, och väljer den som ger högst chans till intervju.` | `Vi läser annonsens språk och bransch och skriver brevet i den ton arbetsgivaren själv använder.` | ja (95/110) | hjälprad |
| TonalityLanguageStep.tsx:137, rad under kortet för gratis | `Smart-anpassad ingår i Premium.` | `Automatiskt tonval ingår i Premium.` | ja | hjälprad |
| TonalityLanguageStep.tsx:58, professional | `Formell och saklig.` | `Saklig och formell. Går rakt på kraven.` | ja (39/40) | hjälprad |
| TonalityLanguageStep.tsx:65, enthusiastic | `Energisk och varm.` | `Varm, energisk. Visar att du vill hit.` | ja (38/40) | hjälprad |
| TonalityLanguageStep.tsx:72, creative | `Nytänkande och personlig.` | `Personlig och oväntad. Vågar sticka ut.` | ja (39/40) | hjälprad |
| TonalityLanguageStep.tsx:79, confident | `Betonar dina resultat.` | `Leder med dina resultat, i siffror.` | ja (35/40) | hjälprad |
| TonalityLanguageStep.tsx:86, balanced | `Professionell med personlighet.` | `Saklig men varm. Passar de flesta.` | ja (34/40) | hjälprad |

Anmärkningar:
- "Högst chans till intervju" utgår helt. Det nya påståendet är det koden gör: läser annonsen och väljer ton efter den.
- Raderna `recommendedFor` ("Traditionella branscher", "Kreativa yrken, startups" osv.) står inte i briefen och lämnas orörda. De bär branschkopplingen, beskrivningarna bär tonen.
- `meta` "Läser kraven · Branschens ton" lämnas orörd.

### `src/app/dashboard/skapa-brev/components/steps/JobDescriptionStep.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| JobDescriptionStep.tsx:80, placeholder | `Klistra in jobbannonsen här. Företag, roll och krav ger oss det vi behöver för ett vasst brev.` | `Klistra in hela annonsen. Vi läser ut kravprofilen, skall-krav och meriterande, och skriver brevet mot den.` | ja (107/120) | hjälprad |
| JobDescriptionStep.tsx:90, rubrik | `Nyckelord vi hittat` | `Krav vi läst ut ur annonsen` | ja (27/28) | etikett |

### Följdändringar för samma term (B2, "Smart-anpassad")

Dessa står inte i avsnitt F men tabell B2 är bindande och etiketten måste stämma överallt.

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| LetterFlowSummary.tsx:30, auto | `Smart-anpassad` | `Vi väljer ton åt dig` | ja | etikett |
| PremiumGateModal.tsx:41, smart-tone title | `Lås upp Smart val` | `Automatiskt tonval ingår i Premium` | ja | betalvägg |
| PremiumGateModal.tsx:42, subtitle | `Vi väljer den ton som passar varje annons bäst, automatiskt för varje brev.` | `Vi läser annonsens språk och bransch och väljer tonen åt dig, brev för brev.` | ja | betalvägg |
| PremiumGateModal.tsx:46, bullet 3 | `Högre träffsäkerhet i dina ansökningar` | `Samma ton som arbetsgivaren använder i annonsen` | ja | betalvägg |

Anmärkning: bullet 3 byts för att "högre träffsäkerhet" är samma obelagda påstående som "högst chans till intervju".

---

## Omgång 3: analys, matchning, betalväggar och prissida

### `src/app/dashboard/cv-analys/components/CVAnalysisIntro.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| CVAnalysisIntro.tsx:19, title | `ATS-optimering` | `Läsbar i rekryteringssystem` | ja | etikett |
| CVAnalysisIntro.tsx:21, description | `Vi analyserar om ditt CV passerar de automatiska urvalssystem som de flesta arbetsgivare använder.` | `De flesta arbetsgivare låter ett rekryteringssystem (ATS) sortera ansökningarna först. Vi visar om ditt CV klarar det.` | ja (118/120) | hjälprad |
| CVAnalysisIntro.tsx:26, title | `Detaljerad feedback` | `Genomgång per avsnitt` | ja (21/24) | etikett |
| CVAnalysisIntro.tsx:27, description | `Konkreta förslag på förbättringar för varje sektion av ditt CV.` | `Färdiga formuleringar för varje del av CV:t, från profiltext till kompetenser.` | ja (78/90) | hjälprad |
| CVAnalysisIntro.tsx:36, INNEHALL rad 1 | `Poäng för hur ATS-vänligt ditt CV är` | `Poäng för hur väl rekryteringssystem läser ditt CV` | ja | hjälprad |
| CVAnalysisIntro.tsx:62, PageHeader description | `Vi läser CV:t och visar vad en rekryterare ser. Tar 30 sekunder.` | `Rekryterare letar först efter senaste rollen och vad du uppnådde. Vi läser ditt CV likadant, på 30 sekunder.` | ja (108/110) | ingress |

Anmärkningar:
- Första förekomsten på sidan är kortet på rad 19 till 21, så förkortningen står i parentes där och ingen annanstans i vyn.
- Rad 62 är samma mening som `DashboardHero.tsx:94` och `MinaCvClient.tsx:336` (briefens rad 12). Alla tre får samma nya text.

### `src/app/dashboard/profil/cv/MinaCvClient.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| MinaCvClient.tsx:336, tomt tillstånd description | `Vi läser det och visar vad en rekryterare ser. Tar 30 sekunder.` | `Rekryterare letar först efter senaste rollen och vad du uppnådde. Vi läser ditt CV likadant, på 30 sekunder.` | ja (108/110) | tom vy |

### `src/app/dashboard/cv-analys/components/steps/SelectImprovementsStep.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| SelectImprovementsStep.tsx:245, label | `Skills` | `Kompetenser` | ja (11/14) | etikett |

### `src/app/dashboard/cv-analys/components/review/ReviewHeader.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| ReviewHeader.tsx:61, Stat label | `ATS-poäng` | `läsbarhetspoäng` | ja (15/18) | etikett |
| ReviewHeader.tsx, ny rad under statsraden | (saknas) | `Poängen går från 0 till 100 och mäter hur väl ett rekryteringssystem tolkar ditt CV.` | ja (84/90) | hjälprad |

Anmärkning: skalan 0 till 100 är den som visas i `UnifiedATSSection.tsx:79` och `CVSectionAnalysisOverview.tsx:224` ("av 100"). Stat-etiketterna är gemener i dag ("ändringar", "nyckelord"), därför gemen "läsbarhetspoäng".

### `src/app/dashboard/jobbmatchning/components/MatchRow.tsx` och `JobDetailModal.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| MatchRow.tsx:86, etikett under talet | `% match` | `% matchgrad` | ja (11/12) | etikett |
| JobbmatchningClient.tsx, ny förklaringsrad överst i träfflistan | (saknas) | `Matchgraden väger kravprofilens kompetenser mot ditt CV, dina roller, orten och hur färsk annonsen är.` | ja (102/120) | hjälprad |
| JobDetailModal.tsx, ny förklaring i detaljarket (två meningar) | (saknas) | `Matchgraden bygger på fyra saker: hur stor del av kravprofilens kompetenser du täcker, om dina tidigare roller stämmer med tjänsten, om orten passar och hur färsk annonsen är. Kompetenserna väger tyngst, så två annonser i samma yrke och stad kan få olika grad.` | ja | hjälprad |

Anmärkningar:
- Vikterna anges inte (beslut). Att kompetenserna väger tyngst är sant i `match-score.ts` och är det enda vi säger om ordningen.
- Förklaringsraden i träfflistan placeras som `text-meta text-ink-3` direkt under listrubriken, före första `MatchRow`.

### `src/app/dashboard/jobbmatchning/JobbmatchningClient.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| JobbmatchningClient.tsx:1155, title | `Inga annonser passade den här gången` | `Inget passade den här gången` | ja (28/40) | tom vy |
| JobbmatchningClient.tsx:1158, description | `Prova att rensa ett filter, eller vidga orterna under Så söker vi åt dig.` / `Vidga orterna under Så söker vi åt dig, eller sök igen om en stund.` | Ersätts av tre steg som punktlista, se nedan | ja | tom vy |
| steg 1 | (saknas) | `Vidga orterna under Så söker vi åt dig` | ja (38/45) | tom vy |
| steg 2 | (saknas) | `Sänk eller ta bort lägsta lön` | ja (29/45) | tom vy |
| steg 3 | (saknas) | `Rätta det vi läste ut ur ditt CV` | ja (32/45) | tom vy |
| JobbmatchningClient.tsx:1166, knapp | `Sök igen` | `Sök igen` (oförändrad) | ja | knapp |
| JobbmatchningClient.tsx:882, 899, 986 | `Vi läser ditt CV och letar bland Arbetsförmedlingens annonser efter jobb som passar dig.` | oförändrad (briefens mönstermening) | ja | ingress |

Anmärkningar:
- Steg 2 förutsätter att preferensen "lägsta lön" finns i panelen Så söker vi åt dig (`getJobbmatchningData.ts:73`, `job-filtering.ts:102`). Har användaren ingen lön satt bör steg 2 döljas, annars är rådet tomt.
- Steg 3 pekar på det redigerbara "det vi läste ut"-avsnittet. Om det avsnittet heter något annat i gränssnittet ska stegets ordval följa rubriken där.
- När aktiva filter finns kan steg 1 föregås av `Rensa ett filter` (17 tecken) som fjärde punkt, eller ersätta steg 1. Överlåts till införandet.

### `src/app/dashboard/jobbmatchning/components/JobFilterPanel.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| JobFilterPanel.tsx:60, sortering | `Deadline` | `Sista ansökningsdag` | ja (19/20) | etikett |

### `src/app/dashboard/sokta-tjanster/components/ShareTab.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| ShareTab.tsx:266, StatusRow label | `Deadline för aktivitetsrapporten` | `Sista inlämningsdag` | ja (19/20) | etikett |

Anmärkning: raden ligger inne i aktivitetsrapportens flik, så "för aktivitetsrapporten" behöver inte upprepas inom 20 tecken. Finns utrymme utanför maxlängden är `Sista inlämningsdag för rapporten` (33) tydligare.

### `src/app/dashboard/linkedin-optimizer/components/steps/Step1Mode.tsx` och `SectionStrength.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| Step1Mode.tsx:137, description | `Bredd och slagkraft. Vi säljer din unika styrka och rensar bort buzzwords.` | `Bredd och skärpa. Vi lyfter det du kan bäst och rensar bort flosklerna.` | ja (71/73) | hjälprad |
| SectionStrength.tsx:80, reason | `Vi hittade buzzwords` | `Vi hittade floskler` | ja (19/20) | hjälprad |

### `src/components/paywall/paywall-copy.ts`

Alla varianter, hela texten per variant. "Oförändrad" betyder att strängen i koden redan uppfyller briefen och tabell B2.

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| nedladdning, title | `Ditt brev är klart` | `Ditt brev är klart` (oförändrad) | ja | betalvägg |
| nedladdning, body | `Du kan läsa och kopiera texten som den är. För att ladda ner som PDF eller Word behöver du Premium.` | `Läs och kopiera det fritt. Vill du bifoga det som PDF eller Word, formaterat och klart att skicka, ingår det i Premium.` | ja (119/130) | betalvägg |
| nedladdning, primary | `Lås upp nedladdning` | `Ladda ner med Premium` | ja | knapp |
| nedladdning, secondary | `Kopiera texten istället` | `Kopiera texten i stället` | ja | knapp |
| cv-export, title | `Din gratis nedladdning är använd` | `Din gratis nedladdning är använd` (oförändrad) | ja | betalvägg |
| cv-export, body | `Du har laddat ner ett CV. Fler nedladdningar, alla 42 mallar och obegränsade analyser ingår i Premium.` | `Du har laddat ner ett CV. Fler nedladdningar, alla mallar och obegränsade analyser ingår i Premium.` | ja | betalvägg |
| cv-export, primary | `Lås upp nedladdning` | `Ladda ner med Premium` | ja | knapp |
| cv-export, secondary | `Se vad Premium kostar` | oförändrad | ja | knapp |
| kvot, letter_generation title | `Du har skrivit dagens brev` | oförändrad | ja | betalvägg |
| kvot, letter_generation body | `Gratisnivån ger ett brev per dag. Med Premium skriver du så många du orkar.` | oförändrad | ja | betalvägg |
| kvot, letter_generation primary | `Fortsätt skriva med Premium` | oförändrad | ja | knapp |
| kvot, cv_analysis title | `Din CV-analys är använd` | oförändrad | ja | betalvägg |
| kvot, cv_analysis body | `Gratisnivån ger en analys var tredje dygn. Med Premium analyserar du så ofta du vill.` | oförändrad | ja | betalvägg |
| kvot, cv_analysis primary | `Analysera direkt med Premium` | oförändrad | ja | knapp |
| kvot, chat_message title | `Dagens meddelanden är slut` | oförändrad | ja | betalvägg |
| kvot, chat_message body | `Gratisnivån ger tio meddelanden per dag. Med Premium chattar du obegränsat.` | oförändrad | ja | betalvägg |
| kvot, chat_message primary | `Fortsätt chatta med Premium` | oförändrad | ja | knapp |
| kvot, secondary | `Påminn mig imorgon` | oförändrad | ja | knapp |
| analys, title | `Vi hittade {n} saker att fixa i ditt CV` / `Vi hittade fler saker att fixa i ditt CV` | oförändrad | ja | betalvägg |
| analys, body | `Du ser poängen och de tre viktigaste. Resten, inklusive ATS-genomgången och formuleringsförslagen, ingår i Premium.` | `Du ser poängen och de tre viktigaste fynden. Resten, med genomgången avsnitt för avsnitt och färdiga formuleringar, ingår i Premium.` | ja (132/140) | betalvägg |
| analys, primary | `Se hela analysen` | oförändrad | ja | knapp |
| analys, secondary | `Vad ingår i Premium?` | oförändrad | ja | knapp |
| test-tak, title | `Tre omgångar idag, det räcker för att bli varm` | oförändrad | ja | betalvägg |
| test-tak, body | `Med Premium tränar du obegränsat och får alla svårighetsnivåer.` | oförändrad | ja | betalvägg |
| test-tak, primary | `Träna obegränsat` | oförändrad | ja | knapp |
| test-tak, secondary | `Kom tillbaka imorgon` | oförändrad | ja | knapp |
| cv-antal, title | `Du har två sparade CV` | oförändrad | ja | betalvägg |
| cv-antal, body | `Gratisnivån sparar två CV åt gången. Med Premium sparar du hur många du vill.` | oförändrad | ja | betalvägg |
| cv-antal, primary | `Spara fler med Premium` | oförändrad | ja | knapp |
| cv-antal, secondary | `Ta bort ett gammalt CV` | oförändrad | ja | knapp |
| jobbtraffar, title | `Se varför du passar för alla 4` / `Se varför du passar för alla {totalt}` | oförändrad | ja | betalvägg |
| jobbtraffar, body | `Du ser de tre bästa träffarna med skälen utskrivna. Med Premium öppnas resten, med titel, arbetsgivare, ort och varför just du matchar.` | `Du ser de tre bästa träffarna med skälen utskrivna. Med Premium öppnas resten, med titel, arbetsgivare, ort och varför just du passar.` | ja | betalvägg |
| jobbtraffar, primary | `Se alla träffar` | oförändrad | ja | knapp |
| jobbtraffar, secondary | `Se vad Premium kostar` | oförändrad | ja | knapp |
| af-rapport, title | `Din rapport är sammanställd` | oförändrad | ja | betalvägg |
| af-rapport, body | `Vi har räknat ihop månaden i Arbetsförmedlingens format. Att logga dina ansökningar är gratis för alltid. Att hämta ut den färdiga rapporten som text, utskrift eller fil ingår i Premium.` | oförändrad | ja | betalvägg |
| af-rapport, primary | `Hämta rapporten` | oförändrad | ja | knapp |
| af-rapport, secondary | `Se vad Premium kostar` | oförändrad | ja | knapp |
| nedgraderad, title | `Din Premium-period är slut` | `Fem dagar med Premium är över` | ja | betalvägg |
| nedgraderad, body | `Du hade obegränsat i fem dagar. Nu gäller gratisnivån: ett brev om dagen, och nedladdning kräver Premium.` | `Allt du skrev och analyserade finns kvar att läsa och kopiera. Nu gäller gratisnivån: ett brev om dagen, och nedladdning ingår i Premium.` | ja (137/140) | betalvägg |
| nedgraderad, primary | `Se vad Premium kostar` | oförändrad | ja | knapp |
| nedgraderad, secondary | `Fortsätt gratis` | oförändrad | ja | knapp |

Anmärkningar:
- "Lås upp" är B2:s "unlock" och utgår i knapparna. "Ladda ner med Premium" säger vad som händer när man trycker.
- `cv-export` säger "alla 42 mallar" medan `PricingCard.tsx:20` säger "Alla 8 CV-mallar". En av dem är fel. Jag tar bort siffran tills antalet är verifierat mot mallregistret, i stället för att gissa. Den som för in texten bör kontrollera antalet i `cv-mallar` och sätta rätt siffra på båda ställena.
- `nedgraderad`: opts saknar antal skapade brev, så bodyn nämner inte en siffra. Finns antalet i anropet kan första meningen bli `Dina {n} brev och analyserna finns kvar att läsa och kopiera.` inom samma längd vid n ≤ 99.
- "Att logga dina ansökningar är gratis för alltid" i `af-rapport` är ett löfte om framtiden. Det står i koden i dag och lämnas, men bör bekräftas av ägaren som avsiktligt.

### `src/app/dashboard/profil/prenumeration/PrenumerationClient.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| PrenumerationClient.tsx:113, ingress gratis | `Välj hur länge du vill ha Premium. Alla alternativ ger samma funktioner.` | `Premium tar bort dagsgränserna: obegränsat med brev och analyser, och nedladdning som PDF och Word. Välj hur länge du behöver det.` | ja (130/130) | ingress |
| PrenumerationClient.tsx:112, ingress premium | `Din plan, din användning och hur du hanterar den.` | oförändrad | ja | ingress |

### `src/app/dashboard/profil/prenumeration/components/PricingCard.tsx`

| Fil och rad | Nuvarande text | Ny text | Max | Typ |
|---|---|---|---|---|
| PricingCard.tsx:20, FEATURES rad 2 | `Smart-anpassad ton för varje annons` | `Tonen vald efter varje annons` | ja | hjälprad |
| PricingCard.tsx:38, ingress under rubriken | `Allt upplåst, för dig som menar allvar med jobbsökandet.` | `Alla gränser borta, för dig som söker på riktigt.` | ja | ingress |
| Prisstege, dagspass (49 kr, ett dygn) | (saknas) | `En ansökan som ska in ikväll` | ja (28/40) | hjälprad |
| Prisstege, Jobbsökarveckan (99 kr, sju dagar) | (saknas) | `Flera ansökningar samma vecka` | ja (29/40) | hjälprad |
| Prisstege, månad (149 kr) | (saknas) | `Aktivt sökande, avsluta när du vill` | ja (35/40) | hjälprad |
| Prisstege, kvartal | (saknas) | `Ett längre sök eller byte av bransch` | ja (36/40) | hjälprad |

Anmärkningar:
- "Allt upplåst" är B2:s "unlock" i förklädnad, därför bytt även om raden inte står i F.
- Prisstegens fyra rader hör hemma under respektive prisnivå där de fyra nivåerna listas. I dag visar `PricingCard.tsx` bara månaden och nämner dagspass och veckopass i löptext på rad 47. Var kvartalet presenteras i gränssnittet har jag inte hittat, `planPrices.ts:30` bekräftar bara att det finns. Införandet får placera raden där kvartalet renderas, eller lämna den tills nivån syns.
- Kvartalsraden nämner inte pris eller besparing, eftersom kvartalspriset inte står i koden jag läst.

---

## Utanför briefen, noterat men inte skrivet

Dessa står i B1 men inte i F, och lämnas därför orörda enligt briefens sista mening. Listas så att nästa omgång ser dem.

- `CreateSheet.tsx:53` "Kräver ett CV, vi tar det först" (rad 10).
- `MobileBottomNav.tsx:56` "Skapa" (rad 9).
- `BliUpptacktSidebarLink.tsx` "Bli upptäckt" (rad 8).
- `SnabbAtgarder.tsx:107` "Rekommenderas" (rad 17).
- `CreateLetterClient.tsx:1012` "Läs igenom det en gång. Spara det så hamnar det under Mina brev." (rad 25).
- `TesterHubClient.tsx:56` (rad 39).
- `ManageSubscriptionCard.tsx:38` "Status" (B2).
- `PremiumGateModal.tsx:34-36` "ATS-poängen", "ATS-optimering" (B2, ATS-förekomster utanför analysvyn).
- `introduktion/page.tsx:58,74,114,116` (B2, ATS-förekomster).
