# Copy- och begriplighetsgranskning av inloggat läge

Granskad 2026-09-14 av saas-lead. Underlag: all användarvänd text under `src/app/dashboard`, `src/components/dashboard`, `src/components/paywall`, `src/components/tests`, skärmdumparna i `docs/qa/traden/`, `docs/qa/jobbmatchning/`, `docs/qa/cv-analys/`, `docs/qa/pwa/`, samt PostHog 30 dagar bakåt.

Slutlig copy skrivs av `svensk-ux-copywriter` enligt briefen i avsnitt F. Den här planen beslutar vad som ska skrivas, inte hur varje mening låter.

Det mätta gick live 2026-09-12 (omdesign), 2026-09-14 02:30 (Tråden), 2026-09-14 15:00 (jobbmatchning). Sidvisningsdatan nedan spänner över både den gamla och den nya designen. Konverteringsslutsatser på strängnivå är därför riktningsgivande, inte bevisade.

---

## A. Fem slutsatser

1. **Vi säger vad saker heter, nästan aldrig varför de är värda något.** Sidomenyns tolv rader är substantiv utan innehåll: "Brev", "CV", "LinkedIn", "Jobbcoachen", "Bli upptäckt". En förstagångsanvändare kan inte utläsa vad hen får av att klicka. Menyn är produktens huvudnavigation och den bär noll argument.

2. **Vi låter som en generisk app, inte som experter på svensk arbetsmarknad.** Vi har rätt fakta i systemet (Arbetsförmedlingens annonser, kravprofil, meriterande, aktivitetsrapport) men texten använder dem knappt. Ingenstans i det inloggade läget står en siffra om hur svenska rekryterare faktiskt arbetar. Auktoritet byggs av det konkreta: sex sekunders första genomläsning, kravprofilens skall-krav mot meriterande, kvantifierade resultat.

3. **Engelskan sitter kvar på de mest synliga ytorna.** "ATS" förekommer på elva ställen utan att förklaras första gången, "% match" står i 72-punkters siffra på jobbmatchningens träfflista, "Skills" står som etikett i CV-analysen, "Smart-anpassad" är standardvalet i brevflödet, "Deadline", "buzzwords", "feedback", "Premium" och "Trial" löper genom hela läget. Det underminerar precis det påstående vi vill göra: att vi kan svensk arbetsmarknad. Egen tabell i avsnitt B2.

4. **Trattens största tapp är mellan hemskärmen och första verktyget, och där är texten tunnast.** 54 personer öppnade `/dashboard` de senaste 30 dagarna. 24 nådde `/dashboard/profil/cv`, 16 nådde `/dashboard/skapa-brev`, 15 nådde `/dashboard/cv-analys`, 5 nådde `/dashboard/mina-brev`. Hemskärmens tillstånd A (skärmdump `docs/qa/traden/dashboard-tillstand-a-mobil.png`) säger "Börja med ditt CV" och "Vi läser det och visar vad en rekryterare ser. Tar 30 sekunder." Den säger vad som händer men inte varför det lönar sig, och den nämner inte att uppgifterna aldrig går till någon AI trots att det är vårt starkaste förtroendeargument just i det ögonblick användaren ska lämna ifrån sig sitt CV.

5. **Integritetslöftet är begravt på en sida ingen besöker.** "Dina uppgifter går aldrig till någon AI" finns på exakt två ställen, båda på profilsidan (`IntegritetsBlock.tsx`, `PresentationSection.tsx`). Det bör upprepas vid varje uppladdning, varje analys och varje matchning. Det kostar oss inget och det är sant i koden (`src/lib/privacy/pii.ts`).

---

## B1. De 40 viktigaste strängarna

Problemkolumnen: B = begriplighet, A = auktoritet, K = konvertering. Prioritet 1 = skrivs först, 3 = skrivs när tid finns.

| # | Fil | Nuvarande text | Problem | Pri |
|---|---|---|---|---|
| 1 | `src/components/dashboard/Sidebar.tsx:231` | `Brev` | B, A. Säger inte "personligt brev", som är den svenska fackterm annonser och Arbetsförmedlingen använder | 1 |
| 2 | `Sidebar.tsx:222` | `CV` (sublabel "Ladda upp ditt första CV") | B. Raden leder till `/dashboard/profil/cv`, användaren förväntar sig att CV ligger under CV, inte under Profil | 1 |
| 3 | `Sidebar.tsx:246` | `Skriv brev` | B, K. Nästan identisk med rad 1 "Brev". Två rader, samma ord, olika betydelse | 1 |
| 4 | `Sidebar.tsx:260` | `Jobbmatchning` | A. Anglicism-hybrid. Sidan heter "Dina matchningar" internt, menyn något annat | 1 |
| 5 | `Sidebar.tsx:274` | `Rekryteringstester` | B. Bra ord, men ingen antydan om att det är begåvningstest inför urval | 2 |
| 6 | `Sidebar.tsx:287` | `Jobbcoachen` | B. Vad är det? Enda rad utan motsvarighet i verkligheten | 2 |
| 7 | `Sidebar.tsx:302` | `Premium` | A, K. Engelska. Raden är vår enda permanenta säljyta i menyn och bär inget löfte | 1 |
| 8 | `sidebar/BliUpptacktSidebarLink.tsx` | `Bli upptäckt` | B. Upptäckt av vem, hur, och vad kostar det mig i integritet | 2 |
| 9 | `MobileBottomNav.tsx:56` | `Skapa` | B. Öppnar ark med tre olika saker. Etiketten lovar inget | 2 |
| 10 | `CreateSheet.tsx:53` | `Kräver ett CV, vi tar det först` | B. Läses som en spärr, inte som en väg framåt | 2 |
| 11 | `(oversikt)/DashboardHero.tsx:91` | `Börja med ditt CV` | K, A. Ingen anledning ges. Detta är den mest sedda rubriken i produkten (54 av 54 användare) | 1 |
| 12 | `cv-analys/CVAnalysisIntro.tsx:62` + `profil/cv/MinaCvClient.tsx:336` | `Vi läser det och visar vad en rekryterare ser. Tar 30 sekunder.` | A. Nära rätt, men "vad en rekryterare ser" är oprecist. Här hör sexsekundersregeln och maskeringslöftet hemma | 1 |
| 13 | `(oversikt)/SnabbAtgarder.tsx:43` | `Personligt brev anpassat efter rollen.` | A, K. Passivt. Säger inte att vi läser annonsens kravprofil | 2 |
| 14 | `SnabbAtgarder.tsx:60` | `Tusentals lediga tjänster i Sverige.` | A. Vagt. Källan är Arbetsförmedlingens annonsdatabas och det är ett auktoritetsargument | 1 |
| 15 | `SnabbAtgarder.tsx:68` | `Poäng och förbättringar direkt.` | B, A. "Poäng" av vad, mot vilken norm | 2 |
| 16 | `SnabbAtgarder.tsx:84` | `Låt rekryterare hitta din profil.` | K. Inget om anonymitet, som är hela poängen och det som gör det tryggt att slå på | 2 |
| 17 | `SnabbAtgarder.tsx` (etikett) | `Rekommenderas` | B. Rekommenderas av vem och på vilken grund | 3 |
| 18 | `skapa-brev/CreateLetterClient.tsx:871` | `Personligt brev` (flödets titel) | A. Korrekt term, men flödet saknar helt ingress om vad ett brev ska göra i ett svenskt urval | 1 |
| 19 | `skapa-brev/steps/JobDescriptionStep.tsx:80` | `Klistra in jobbannonsen här. Företag, roll och krav ger oss det vi behöver för ett vasst brev.` | A. Bra riktning. "krav" bör bli "kravprofil" och meriterande nämnas | 2 |
| 20 | `steps/JobDescriptionStep.tsx:90` | `Nyckelord vi hittat` | A. Anglifierat resultat. Det vi hittar är skall-krav och meriterande kvalifikationer | 1 |
| 21 | `steps/TonalityLanguageStep.tsx:123` | `Smart-anpassad` | A. Engelska, och standardvalet. Mest sedda tonvalet i produkten | 1 |
| 22 | `steps/TonalityLanguageStep.tsx:124` | `...väljer den som ger högst chans till intervju.` | A. Påstående utan grund. Sanningskravet: vi kan inte belägga "högst chans" | 1 |
| 23 | `steps/TonalityLanguageStep.tsx:56-85` | `Professionell / Entusiastisk / Kreativ / Självsäker / Balanserad` med beskrivningar på tre ord | B. Användaren kan inte välja informerat. Ingen koppling till bransch eller arbetsgivartyp | 2 |
| 24 | `CreateLetterClient.tsx:827` | `Skapa mitt brev` | K. Rätt handling, men ingen förväntanssättning om tid eller kvot | 3 |
| 25 | `CreateLetterClient.tsx:1012` | `Läs igenom det en gång. Spara det så hamnar det under Mina brev.` | B, K. Bra. Saknar att brevet ska granskas mot annonsen innan det skickas | 3 |
| 26 | `cv-analys/CVAnalysisIntro.tsx:19,36` | `ATS-optimering`, `Poäng för hur ATS-vänligt ditt CV är` | B, A. ATS förklaras aldrig första gången. Svensk term: automatiskt urvalssystem, rekryteringssystem | 1 |
| 27 | `cv-analys/CVAnalysisIntro.tsx:26` | `Detaljerad feedback` | A. Engelska. Svenska: genomgång, återkoppling, granskning | 1 |
| 28 | `cv-analys/steps/SelectImprovementsStep.tsx:245` | `Skills` | A. Ren engelska som etikett i gränssnittet. Svensk term: kompetenser | 1 |
| 29 | `cv-analys/review/ReviewHeader.tsx:61` | `ATS-poäng` | B, A. Poäng mot vilken skala, och vem sätter den | 1 |
| 30 | `jobbmatchning/JobbmatchningClient.tsx:882` | `Vi läser ditt CV och letar bland Arbetsförmedlingens annonser efter jobb som passar dig.` | A. Den bästa meningen i produkten. Ska bli mönster, inte undantag | 3 |
| 31 | Träfflista, `% match` (skärmdump `docs/qa/jobbmatchning/r2-trafflista-mobil.png`) | `94 % match` | A. Engelska i 72 px. Svenska: matchgrad, träffgrad, passning | 1 |
| 32 | `jobbmatchning/JobFilterPanel.tsx:60` | `Deadline` | A. Engelska. Svenska: sista ansökningsdag | 1 |
| 33 | `jobbmatchning/JobbmatchningClient.tsx:1155` | `Inga annonser passade den här gången` | B, K. Tomt tillstånd utan väg vidare | 2 |
| 34 | `paywall-copy.ts` `analys` | `...inklusive ATS-genomgången och formuleringsförslagen, ingår i Premium.` | A, K. Betalväggens argument vilar på en oförklarad förkortning | 1 |
| 35 | `paywall-copy.ts` `nedladdning` | `Ditt brev är klart` / `Lås upp nedladdning` | K. Rubriken firar, knappen säljer. Ingen brygga mellan dem | 1 |
| 36 | `paywall-copy.ts` `nedgraderad` | `Din Premium-period är slut` | K. Rent tapp-språk. Inget om vad användaren hann skapa | 2 |
| 37 | `profil/prenumeration/PrenumerationClient.tsx:113` | `Välj hur länge du vill ha Premium. Alla alternativ ger samma funktioner.` | K. Prissidan för inloggade säljer inte, den administrerar | 1 |
| 38 | `profil/prenumeration/PricingCard.tsx:19` | `Smart-anpassad ton för varje annons` | A. Engelska i säljpunkt | 2 |
| 39 | `tester/TesterHubClient.tsx:56` | `Träna på de moment rekryterare faktiskt använder: logik, verbalt resonemang, siffror och personlighet.` | A. Bra. Saknar att svenska arbetsgivare köper testerna av ett fåtal leverantörer, vilket är vårt starkaste argument här | 2 |
| 40 | `linkedin-optimizer/steps/Step1Mode.tsx:137` | `Vi säljer din unika styrka och rensar bort buzzwords.` | A. "buzzwords" är engelska och "säljer din unika styrka" är en AI-kliché | 1 |

---

## B2. Engelska och anglicismer

Ägarens krav: svensk arbetsmarknad, svenska facktermer. Tabellen är uttömmande för det inloggade läget. Termer i kolumn tre är de som Arbetsförmedlingen, TRR, Unionen och svenska rekryterare faktiskt använder.

| Ord idag | Var | Svensk term att använda | Anmärkning |
|---|---|---|---|
| ATS (11 förekomster) | `CVAnalysisIntro.tsx`, `CVAnalysisWizard.tsx:84`, `ReviewHeader.tsx:61`, `AnalysisOverviewStep.tsx:81`, `SelectImprovementsStep.tsx:124`, `introduktion/page.tsx:58,74,114,116`, `PremiumGateModal.tsx:34,36`, `paywall-copy.ts` | **rekryteringssystem** eller **automatiskt urvalssystem** | Förkortningen får stå kvar en gång i parentes efter första förklaringen, aldrig ensam. "ATS-poäng" blir "läsbarhet i rekryteringssystem" |
| Skills | `SelectImprovementsStep.tsx:245` | **kompetenser** | Ren engelska som etikett. Tas bort helt |
| % match, matchgrad | Träfflistan, `JobbmatchningClient.tsx` | **matchgrad** som huvudform, i löptext hellre **så väl du passar** | "match" ensamt utgår |
| Smart-anpassad | `TonalityLanguageStep.tsx:123`, `LetterFlowSummary.tsx:30`, `PricingCard.tsx:19`, `PremiumGateModal.tsx:42` | **Anpassad efter annonsen** eller **Vi väljer åt dig** | Standardvalet i brevflödet. Högst prioritet i tabellen |
| Deadline | `JobFilterPanel.tsx:60`, `ShareTab.tsx:266` | **sista ansökningsdag** (annons), **senaste inlämningsdag** (aktivitetsrapport) | |
| Feedback | `CVAnalysisIntro.tsx:26`, `bugg-feedback/` | **återkoppling**, **genomgång**; för buggsidan **synpunkter** | |
| buzzwords | `Step1Mode.tsx:137`, `SectionStrength.tsx:80` | **floskler**, **tomma ord** | |
| Trial | kod och `premium_source` | **provperiod**, **fem dagar fritt** | Får aldrig synas i gränssnittet. Kontrollera att `signup_trial` inte läcker ut som etikett |
| Premium | överallt, 263 träffar | **behålls** som produktnamn | Beslut: Premium är ett inarbetat produktnamn, inte en beskrivning. Men brödtexten omkring ska vara svensk: "ingår i Premium", aldrig "unlock", "uppgradera nu", "gå Pro" |
| Onboarding | `JobMatchingOnboarding.tsx`, `OnboardingContext` | **introduktion**, **kom igång** | Bara internt idag. Får inte nå ytan |
| Digest (weekly_digest) | mailfunktion | **veckobrev**, **veckans sammanfattning** | |
| Status | `ManageSubscriptionCard.tsx:38` | **Läge** eller **Din plan** | "Status" är gångbart svenskt men läses byråkratiskt här |
| Pitch | `PitchCard.tsx:67` "Din pitch" | **Din presentation**, **Din korta presentation** | |
| Tips | `MiniSuggestionChips.tsx:6`, `BuggFeedbackForm.tsx:192` | **råd**, **så gör du** | Gångbart men överanvänt |
| Export / exportera | `paywall-copy.ts`, `cv-mallar` | **ladda ner**, **hämta ut** | "Exportera" behålls bara där filformatet är poängen |
| Remote (jobbfilter) | `JobFilterPanel` | **distansarbete**, **på distans** | |
| Nice to have / must have | `JobDetailModal.tsx:438-439` | **Krav** och **Meriterande** | Redan rätt i gränssnittet. Behåll, och använd samma två ord i brevflödet och CV-analysen |
| Level / Pro / Plus | ej funna i ytan | inget | Kontrollerat, inga träffar. Inför aldrig |

Termer vi ska använda **mer**, inte bara undvika: kravprofil, meriterande, skall-krav, urval, gallring, referenser, tjänstgöringsintyg, arbetsgivarintyg, ansökningshandlingar, personligt brev, meritförteckning, anställningsform, provanställning, kollektivavtal, LAS, aktivitetsrapport, arbetsgivarens kravprofil.

---

## C. Ställen som behöver nytt textstöd, inte omskrivning

Här saknas text helt. Sju ställen, i fallande ordning av effekt.

1. **Hemskärmens tillstånd A, en förtroenderad under uppladdningsrutan.** Idag går användaren direkt från rubrik till fildragning utan att få veta vad som händer med filen. En rad om att personuppgifter maskas innan något går till en modell. Sitter i `(oversikt)/DashboardHero.tsx`, under dropzonen. Sant enligt `src/lib/privacy/pii.ts`.

2. **Sidomenyns Verktyg-grupp saknar underetiketter.** Åtta rader med ett ord var. Minst de fyra som leder till intäkt (Skriv brev, Analysera CV, Jobbmatchning, Rekryteringstester) behöver en sublabel på max 34 tecken. Mönstret finns redan i `SidebarLink` (`sublabel`-propen används idag bara för tomma tillstånd).

3. **Brevflödets steg 1, en ingress om vad brevet ska göra.** Flödet börjar med CV-val utan en mening om varför ett personligt brev spelar roll i ett svenskt urval. Två meningar överst i `skapa-brev/CreateLetterClient.tsx` steg 1.

4. **Jobbmatchningens matchgradssiffra behöver en förklaringsrad.** "94 % match" står i 72 px utan att någonstans förklaras hur den räknas. Vi räknar kompetenser 0,45, roller 0,30, ort 0,15, färskhet 0,10 (`docs/plan-jobbmatchning.md`). Att säga det rakt ut är auktoritet gratis. En rad överst i träfflistan eller i informationsarket.

5. **CV-analysens poäng saknar norm.** "ATS-poäng +10" betyder ingenting utan skala. Behöver en mening som säger vad som mäts och mot vad.

6. **Tomt tillstånd i jobbmatchningen** (`JobbmatchningClient.tsx:1155`) säger "Inga annonser passade den här gången" och stannar där. Behöver tre konkreta nästa steg: bredda orten, sänk lönegolvet, rätta det vi läste ut ur CV:t.

7. **Prenumerationssidan som inloggad prissida saknar argument helt.** "Alla alternativ ger samma funktioner" är administration. Sidan behöver en kort ingress som säger vad Premium löser, och per prisnivå vem den passar. `PrenumerationClient.tsx:109-113`.

---

## D. Tonprinciper

Åtta principer. Gäller allt inloggat.

**1. Svenska facktermer först.** Vi skriver som svensk arbetsmarknad talar: kravprofil, meriterande, urval, gallring, referenser, ansökningshandlingar, aktivitetsrapport. Engelska ord används bara när det svenska ordet inte finns. Tabell B2 är bindande.

**2. Vi säger vad vi gör, inte vad vi är.** Aldrig "kraftfull AI-driven plattform". Alltid "vi läser annonsens kravprofil och plockar ut skall-kraven".

**3. Rekryterarens perspektiv är vår auktoritet.** Varje nyckelmening får gärna säga vad som händer på andra sidan: vem läser, hur länge, vad de letar efter först.

**4. Siffror i stället för adjektiv.** "Snabbt" blir "30 sekunder". "Många annonser" blir "Arbetsförmedlingens hela annonsdatabas". Bara siffror som koden backar.

**5. Vi-form, aldrig "systemet" eller "plattformen".** Vi läser, vi hittar, vi föreslår. Användaren är "du".

**6. Integritet sägs där den är relevant, inte bara på profilsidan.** Vid varje uppladdning, analys och matchning: personuppgifterna maskas innan texten går till någon modell.

**7. Betalväggen förklarar gränsen, den skäms inte och den skryter inte.** Vad du får gratis, vad som ligger bakom, varför gränsen går just där.

**8. Inga AI-klichéer, inga talstreck.** Aldrig "i dagens konkurrensutsatta arbetsmarknad", "ta din karriär till nästa nivå", "lås upp din potential". Aldrig em-dash. Meningslängden varieras.

### Före och efter, tre strängar

**Sidomenyn, `Sidebar.tsx:231`**
Före: `Brev`
Efter, riktning: `Personliga brev` med sublabel som säger var de ligger och hur många. Facktermen är "personligt brev", det är så annonsen ber om det och så Arbetsförmedlingen benämner det. Ordet "Brev" ensamt kan lika gärna betyda meddelanden.

**Hemskärmens rubrik, `DashboardHero.tsx:91`**
Före: `Börja med ditt CV` / `Vi läser det och visar vad en rekryterare ser. Tar 30 sekunder.`
Efter, riktning: behåll rubriken, byt underraden mot något som ger rekryterarens verklighet och vårt integritetslöfte i samma andetag. En svensk rekryterare lägger sex sekunder på första genomläsningen och letar efter senaste roll och kvantifierade resultat. Vi läser CV:t på samma sätt, och namn, telefon och ort maskas innan texten går vidare.

**Brevflödets tonval, `TonalityLanguageStep.tsx:123-124`**
Före: `Smart-anpassad` / `Vi läser ditt CV, annonsen och företagets ton, och väljer den som ger högst chans till intervju.`
Efter, riktning: svensk etikett i stället för "Smart", och ett påstående vi kan stå för. Vi väljer ton efter annonsens språk och bransch, inte efter en chansberäkning vi inte kan belägga. Sanningskravet gäller.

---

## E. Konverteringspunkter där copyn ska göra jobbet

Rangordnat efter förväntad effekt på intäkt.

1. **Hemskärmens första skärm (tillstånd A).** 54 av 54 användare ser den. 24 laddar upp CV. Varje procent här flyttar hela tratten. Copyn ska ge ett skäl, inte en instruktion.

2. **Betalväggen på brevnedladdning** (`paywall-copy.ts`, variant `nedladdning`). Användaren har just fått ett färdigt brev, alltså maximal upplevd nytta. Rubriken firar och knappen säljer, men ingen mening binder ihop dem. Där ska argumentet stå.

3. **Betalväggen på CV-analysen** (variant `analys`). Vi visar tre fynd och döljer resten. Argumentet vilar idag på "ATS-genomgången", en förkortning användaren inte förstår. Byt till vad fynden faktiskt är.

4. **Jobbmatchningens betalvägg** (variant `jobbtraffar`). Gratisnivån sänktes till tre träffar 2026-09-14. Copyn är redan bland de bättre. Behåll argumentet (skälen saknas i resten av listan), byt "match" mot svensk term.

5. **Prenumerationssidan.** Inloggad prissida utan säljargument. Fyra prisnivåer utan vägledning om vem som ska välja vad. Här ska prisstegen förklaras: dagspass för den som har en ansökan inne ikväll, veckan för den som söker aktivt.

6. **Sidomenyns Premium-rad.** Enda permanenta säljytan. Idag bara ordet plus status. Kan inte bli en fylld orange yta (designsystemet), men badge-texten kan bära mer än "Gratis".

7. **Nedgraderingen dag 6** (variant `nedgraderad`). Rent tapp-språk idag. Ska påminna om vad användaren faktiskt hann skapa under fem dagar.

---

## F. Brief till svensk-ux-copywriter

Skriv följande strängar. Svenska, vi-form, inga em-dash, inga AI-klichéer. Läs tabell B2 före första meningen och håll dig till listan. Sanningskravet gäller: påstå ingenting koden inte backar. Där du är osäker på om ett påstående är sant, skriv en kommentar i stället för en gissning.

**Omgång 1, sidomenyn och hemskärmen (pri 1)**

| Sträng | Fil | Maxlängd |
|---|---|---|
| Menyrad, personliga brev | `Sidebar.tsx:231` | 18 tecken |
| Menyrad, CV | `Sidebar.tsx:222` | 18 tecken |
| Menyrad, skriv brev | `Sidebar.tsx:246` | 20 tecken |
| Sublabel × 4 (skriv brev, analysera CV, jobbmatchning, tester) | `Sidebar.tsx` | 34 tecken vardera |
| Menyrad + badge, Premium | `Sidebar.tsx:302` | 14 + 12 tecken |
| Hemskärmens underrad, tillstånd A | `DashboardHero.tsx:91` | 110 tecken, två meningar |
| Ny förtroenderad under dropzonen | `DashboardHero.tsx` | 80 tecken |
| Snabbåtgärdernas fyra brödtexter | `SnabbAtgarder.tsx:43,60,68,84` | 48 tecken vardera |

**Omgång 2, brevflödet (pri 1)**

| Sträng | Fil | Maxlängd |
|---|---|---|
| Ingress steg 1 | `CreateLetterClient.tsx` steg 1 | 140 tecken, två meningar |
| Etikett för automatiskt tonval | `TonalityLanguageStep.tsx:123` | 22 tecken |
| Beskrivning av automatiskt tonval | `TonalityLanguageStep.tsx:124` | 110 tecken |
| Fem tonbeskrivningar | `TonalityLanguageStep.tsx:56-85` | 40 tecken vardera |
| Rubrik för utlästa krav | `JobDescriptionStep.tsx:90` | 28 tecken |
| Platshållare i annonsfältet | `JobDescriptionStep.tsx:80` | 120 tecken |

**Omgång 3, analys, matchning och betalväggar (pri 1 till 2)**

| Sträng | Fil | Maxlängd |
|---|---|---|
| Förklaring av rekryteringssystem, första förekomsten | `CVAnalysisIntro.tsx:19,36` | 120 tecken |
| Ersättning för "Detaljerad feedback" | `CVAnalysisIntro.tsx:26` | 24 + 90 tecken |
| Ersättning för "Skills" | `SelectImprovementsStep.tsx:245` | 14 tecken |
| Ersättning för "ATS-poäng" med normförklaring | `ReviewHeader.tsx:61` + ny rad | 18 + 90 tecken |
| Matchgradens etikett och förklaringsrad | träfflistan, `JobbmatchningClient.tsx` | 12 + 120 tecken |
| Tomt tillstånd, tre nästa steg | `JobbmatchningClient.tsx:1155` | 40 + 3 × 45 tecken |
| Betalvägg nedladdning, brygga mellan rubrik och knapp | `paywall-copy.ts` | 130 tecken |
| Betalvägg analys, body utan förkortning | `paywall-copy.ts` | 140 tecken |
| Betalvägg nedgraderad, body | `paywall-copy.ts` | 140 tecken |
| Prenumerationssidans ingress | `PrenumerationClient.tsx:113` | 130 tecken |
| Prisstegens fyra vem-passar-vad-rader | `PricingCard.tsx` | 40 tecken vardera |
| Ersättning för "buzzwords" | `Step1Mode.tsx:137`, `SectionStrength.tsx:80` | inom befintlig längd |
| Ersättning för "Deadline" | `JobFilterPanel.tsx:60`, `ShareTab.tsx:266` | 20 tecken |

Leverera som en tabell fil för fil med exakt sträng, så införandet blir mekaniskt. Skriv inte om något som inte står i listan.

---

## G. Mätning, fyra veckor efter införande

Nuläge mätt 2026-08-15 till 2026-09-14, 30 dagar, PostHog. Låg volym, så målen är riktningar och inte signifikanstest. Läs av tidigast fyra veckor efter införandet, alltså efter att den nya copyn hunnit se minst lika många användare som utgångsläget.

| Mätpunkt | Händelse | Utgångsläge | Mål |
|---|---|---|---|
| Hemskärm till CV | `$pageview /dashboard` → `/dashboard/profil/cv` | 24 av 54, 44 % | 60 % |
| Hemskärm till brevflöde | → `/dashboard/skapa-brev` | 16 av 54, 30 % | 45 % |
| Brevflöde till sparat brev | → `/dashboard/mina-brev` | 5 av 54, 9 % | 20 % |
| Hemskärm till CV-analys | → `/dashboard/cv-analys` | 15 av 54, 28 % | 40 % |
| Betalvägg visad till klick | `paywall_shown` → `paywall_cta_clicked` | saknas, händelsen finns inte | införs, mål 12 % |
| Prissida till köp | `pricing_viewed` → `subscription_paid` | 0 händelser i perioden | följs |
| Matchning till brev | `match_letter_started` / `match_page_viewed` | live 2026-09-14, ingen data | följs |

**Två händelser saknas och bör införas samtidigt med copyn:** `paywall_shown` med variant som property, och `paywall_cta_clicked`. Utan dem kan vi inte mäta om betalväggscopyn gör något, och betalväggarna är fyra av sju konverteringspunkter. Det är en S-uppgift i kod.

---

## H. Tidsuppskattning

| Steg | Insats | Vem |
|---|---|---|
| Copy omgång 1, sidomeny och hemskärm | S, halv dag | `svensk-ux-copywriter` |
| Copy omgång 2, brevflödet | S, halv dag | `svensk-ux-copywriter` |
| Copy omgång 3, analys, matchning, betalväggar, prissida | M, en dag | `svensk-ux-copywriter` |
| Granskning mot sanningskravet och tabell B2 | S, två timmar | saas-lead |
| Införande i kod, omgång 1 och 2 | S, halv dag | opus-agent, strikt filägarskap |
| Införande i kod, omgång 3 plus de sju nya textstöden | M, en dag | opus-agent |
| Två nya betalväggshändelser | S, två timmar | opus-agent |
| Klicktest i riktig webbläsare, Pixel 7 plus desktop, skärmdump per steg | S, halv dag | saas-lead |

Totalt cirka fyra arbetsdagar från brief till driftsatt. Copyn kan skrivas parallellt med att händelserna införs.

---

## Vad ägaren behöver besluta

1. **Behåller vi "Premium" som produktnamn?** Planen utgår från ja. Alternativet är "Fullt läge" eller liknande, vilket kräver ändringar i Stripe-produktnamn, mail och publika prissidan. Rekommendation: behåll.
2. **Får matchgraden förklaras med sina faktiska vikter** (kompetenser 0,45, roller 0,30, ort 0,15, färskhet 0,10)? Det är auktoritet gratis men gör algoritmen synlig för konkurrenter. Rekommendation: förklara i ord utan att ange vikterna.
3. **Ska CV-analysens poäng byta skala eller bara förklaras?** Planen antar bara förklaras.
