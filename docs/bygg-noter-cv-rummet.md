# Byggnoter: CV-rummet, omgång 1

Byggspec: scratchpad `cv/BYGGSPEC.md` (ägarens godkända skiss 2026-11-21). Gren `feat/cv-rummet-omgang1`.

## Steg 1 (grunden, flikarna, miniatyrerna, Ditt CV)

### Formspråket: rumsmedvetna tokens

Valet: testernas `.t3-*`-klasser återanvänds, och deras tokens (`--t3-*`, `--sess-*`) får petrolvärden under `[data-rum="cv"]` (globals.css, blocket "CV-rummet, omgång 1"). Testerna står i `[data-rum="tran"]` och läser fortfarande `:root`-värdena; inga testklasser ändrades, bara nya regler lades till. Det CV-rummet behöver utöver testerna (CV-raden, arket på väggen, fyndkorten, mallrutorna, Hem-nys kort, Byt CV-arket) är egna `.cv3-*` i skissens mått.

Kontroll: `/dashboard/tester` fotograferad före och efter i 1440 och 412, ljust och mörkt, pixeljämförd. 1440: 0 olika pixlar. 412: bara kopparpunktens puls (animationen) skiljer.

Mönstret för mörkt läge är rummens: ljust på både elementet och roten, mörkt i båda formerna av mörkt läge. Väggen byts aldrig.

Fälla: våra klasser ligger efter Tailwinds verktyg, så en `.cv3-*` som sätter `display` vinner över `hidden`/`xl:hidden` på samma element. Lägg brytpunktsklasserna på ett omslag i stället.

### Komponenterna (återanvänds i steg 2 till 4)

| Fil | Vad |
|---|---|
| `src/components/cv/rum3/flikar.ts` | `CV_FLIKAR`, `flikHref(flik, cvId?, extra?)`, `CvFlik = 'cv' \| 'mallar' \| 'analys'` |
| `src/components/cv/rum3/CvFlikar.tsx` | `{ aktiv, cvId? }` flikraden |
| `src/components/cv/rum3/CvVagg.tsx` | `{ aktiv, cvId?, cvRad?, vanster, hoger, mobil, etikett, lage? }` hela väggen (558/500/426 px) |
| `src/components/cv/rum3/CvFlikRemsa.tsx` | `{ aktiv, cvId?, cvRad?, utanAtgarder? }` flikraden ensam (Mallar och Analys tills deras väggar byggs) |
| `src/components/cv/rum3/CvRad.tsx` | `{ cvs, aktivtId, sida, fullt, onValj?, onBorttaget?, onUppladdat?, utanRad? }` raden "CV: namn  Byt CV  Skapa nytt", äger arken. `oppnaBytCv()`, `oppnaNyttCv(fil?)` öppnar dem var som helst |
| `src/components/cv/rum3/BytCvArk.tsx` | Byt CV-arket; typen `CvListRad` |
| `src/components/cv/rum3/NyttCvArk.tsx` | Ett CV till: uppladdning (InlineCVUpload, samtycket ordagrant) eller byggaren; PaywallCard "cv-antal" vid full kvot |
| `src/components/cv/rum3/SkrivFranBorjan.tsx` | "Vilket jobb söker du?" + Börja skriva, `byggarenHref(titel)` |
| `src/components/cv/rum3/DokumentBana.tsx` | `DokumentBanaDator`/`DokumentBanaMobil` `{ steg: BanaSteg[] }` |
| `src/components/cv/rum3/cvLista.ts` | `cvListaUr(rader, lasta, poang?)`, `valtCvId(rader, lasta, cvParam)` |
| `src/components/cv/rum3/texter.ts` | texterna |
| `src/components/cv/Dokument/EgenMiniatyr.tsx` | `{ mall, cv: EgetCv \| null, direkt?, bild?, alt?, className?, style? }` hennes CV i mallen, katalogbilden tills det är ritat |
| `src/components/cv/Dokument/egnaMallar.ts` | `EgetCv`, `kallaForMall`, `begarEgnaMallar(cv, mallar)`, `useEgenMall(cv, mall, aktiv)` |
| `src/app/api/cv/preview-html/flera/route.ts` | flera mallar i ett svar (högst 8), CV:t tolkas en gång |

### Miniatyrer och delat minne (avsnitt 6 punkt 1 till 3)

- `hooks.ts`: minnets nyckel är nu `nyckelFor(kalla)`: CV-id, mall, valen med sorterade nycklar och utan tomma värden, och ett avtryck (FNV) av datan. Samma CV och mall ger samma nyckel från Ditt CV och från Mallar. Minnet rymmer 48 (förut 24). Publika källor (exempel, publik) har samma nyckel som förut.
- `egnaMallar.ts` samlar rutornas begäran per CV och skickar en fråga per åtta mallar, en åt gången, när sidan är ledig. Misslyckade rutor behåller katalogbilden och frågas inte igen under besöket.
- Verifierat i Chrome mot lokal server: Ditt CV (gratiskontot) gjorde en fråga med koppar, skylt och linne (rutorna i bild); Kalksten längre ner hämtas när den kommer nära bild. Klick på fliken Mallar därefter: noll nya förhandsvisningsfrågor, arket stod direkt ur minnet.
- Punkt 4 till 7 (förhämtning av grannar, ingen fördröjning vid klick, 40 i minnet per CV, mätningen före och efter) hör till steg 2.

### Ditt CV: lägen

`page.tsx` läser allt parallellt (CV, behörighet, profil, poäng per CV, senaste analysen, senaste nedladdningen, analyskvoten räknad som `checkCvAnalysisQuota`). En andra fråga bara när senaste analysen inte gäller CV:t som visas. Lägen (`data-lage` på roten): `ny`, `utkast`, `analysera`, `analysera-sparr`, `atgarda`, `ladda-ner`, `brev`.

- Mallen på arket: senast nedladdade mallen (`formatted_cv_downloads.template_id`), annars `structured_data.bygge.mall`, annars katalogens första.
- Potentialen: analysöversiktens uträkning är flyttad till `src/lib/cv/analys/potential.ts` och används av både wizarden och Ditt CV.
- Innehållet: `innehallUrCv` i `cvRum.ts`; språk via `sprakLage`, 'inte_inlast' räknar fyra avsnitt och säger inget om språk.
- Analysera-knappen: med kvot kvar länk till Analys med `?cv=`; utan kvot öppnar den dagens betalvägg för omkörning (GraValSheet "analys-omkorning"), sidoraden är `kvotCopy('cv_analysis').title`.
- Låsta fyndkort öppnar GraValSheet "analys". Köpraden: `PremiumPrisradText` och `PremiumKnappText` (kampanjpriset följer med), knappen mäter `paywall_cta_clicked` och går till köpsteget med platsen "analys".
- Byggaren: `/dashboard/skapa-cv?fran=mina_cv&borja=1&titel=<titel>` hoppar över startbladet med titeln ifylld (inte vid full kvot). Utan titel visas startbladet.

### Var dagens funktioner från Mina CV hamnade

| Funktion | Plats nu |
|---|---|
| Ladda upp fler CV | Skapa nytt (väggens CV-rad), raden "Ett CV till" och Byt CV-arkets fot: arket Ett CV till med InlineCVUpload |
| Uppladdning utan CV | Hem-ny: "Välj fil" öppnar filväljaren, sedan arket med samtycket |
| Ta bort (med bekräftelse) | Byt CV-arket, per CV |
| Låsta CV | Byt CV-arket, "Låst. Ingår i Premium."; kan tas bort men inte visas |
| Strukturera nu | Panelen, mätaren Innehållet, när CV:t saknar struktur |
| Snabbpoängen (QuickScoreReveal) | Golvet under panelen efter första uppladdningen; väggens knapp blir då vit (en kopparknapp per vy) |
| PaywallCard "cv-antal" | Arket Ett CV till vid full kvot; "Ta bort ett gammalt CV" öppnar Byt CV |
| Redigera i byggaren / Fortsätt bygga | Utkast: väggens knapp "Fortsätt bygga". Byggt och klart: raden "Byggt i CV-byggaren" |
| Välj mall och ladda ner | Läget ladda-ner (väggens knapp), arket och mallrutorna (till Mallar) |
| Öppna råtext i nytt fönster | Byt CV-arket, "Råtext" (texten escapas nu) |
| Poäng per CV, "Inte analyserat", "Ändrat ..." | Byt CV-arket, raden under namnet |
| Detaljvyn (profil, erfarenhet, utbildning, kontakt) | Ersatt av arket: CV:t ritat i sin mall på väggen och i mallrutorna |
| Poängringen, vad som drar ner, dokumentets väg | Väggen (talet och banan) och golvet (fyndkorten) |

### Namn

Sidomenyn i CV-rummet: Ditt CV, Mallar, Analys, Skapa nytt CV, LinkedIn-profilen (lås som förut). `UNDERSIDA.minaCv` och `RUBRIK.minaCv` = "Ditt CV". Länktexter i byggaren, mallflödets målgång och analysens steg säger "Ditt CV". Publika FAQ-texter som nämner Mina CV är orörda (SEO-sidor).

### Avvikelser mot skissen

- Telefonens vägg är 426 px (skissen Mobil-hem); testerna har 344. Innehållet (två rader rubrik, arket med poängen, banan, knappen) ryms inte på 344.
- Med sidomenyn (248 px) är golvet 1112 px brett, inte 1120; arkstapeln är förskjuten 30 px åt vänster och 10 px smalare så att bakre arket inte klipps vid väggens kant.
- "+36" i mallrutan (skissen +37): 40 mallar minus nuvarande och de tre som syns.
- Köpraden säger "Öppna alla tre åtgärder" när fyra fynd finns: det första ingår redan gratis.
- Länken "Lägg till språken du kan" går till Mallar med `?andra=sprak`; arbetsläget som öppnar avsnittet byggs i steg 3.

### Testkonton och skärmdumpar

`scripts/qa-cv-rummet-konton.mjs skapa|radera` (fyra konton, bara egna rader per id), `scripts/skarm-cv-rummet.mjs` (helsida i 1440 och 412, `--morkt`, `--mellan` för 1024).

### Backning per commit

Varje commit går att backa för sig i omvänd ordning. Flikremsan på Mallar och Analys tas bort genom att backa sidornas ändringar; `RumHuvud.utanTopprad` är valfri och påverkar inget annat.

## Steg 3 (arbetsläget: ändra ett CV eller skriv ett nytt)

Byggspecen avsnitt 7 och 10b, skisserna Redigera-1440, Bygg-1440 och Mobil-redigera. Allt bor i `src/app/dashboard/skapa-cv/`.

### Vägvalet: en vy för alla CV

Byggaren hade redan det som behövs för att redigera vilket CV som helst: den läser `?cv=` på servern (normalizeStructuredData tar både CVMetadata och gamla ParsedCV), bladen har dagens fält och validering, och den sparar med samma `PUT /api/cv/strukturerad` som mallsidans AvsnittArk. Därför blev byggaren arbetsläget, och AvsnittArk lämnas orört (steg 2 länkar hit i stället; när Mallyta slutar importera den kan filen tas bort).

Datamodellen är oförändrad. Skillnaden mellan CV-sorterna ligger bara i `structured_data.bygge`:

| CV | Läge | Vad som sparas |
|---|---|---|
| Nytt (ingen `cv`) | bygg | Raden skapas vid första sparade bladet (`/api/cv/save-improved`, samma kvot), med `bygge: { utkast: true, mall, val }` som förut |
| Utkast ur byggaren (`bygge.utkast === true`) | bygg | Som förut; `utkast: false` efter nedladdningen |
| Klart byggt CV (`bygge.utkast === false`) | redigera | Som förut, `bygge` följer med |
| Uppladdat (inget `bygge`) | redigera | `PUT /api/cv/strukturerad` med CV:t som det är. Inga byggarfält läggs till (`medBygge` rör bara CV som redan har `bygge`, nedladdningen märker bara utkast som klara), så ett uppladdat CV blir aldrig ett utkast och ändringen gäller i alla mallar |
| Gammalt utan struktur | (inget) | Servern skickar till Ditt CV (`?cv=`), där "Strukturera nu" finns |

Kontrollerat mot databasen: ett uppladdat CV som ändrats i Erfarenhet och Språk har fortfarande inget `bygge`, och jobben som inte ändrats är byte för byte desamma. Att tänka på: som i dagens byggare fylls tomma kontaktfält (namn, e-post, telefon, ort) ur profilen när CV:t öppnas och följer med vid första sparningen. Det är samma regel som PDF:en redan använder (kontaktForCv), så filen ändras inte.

### Adressen (kontraktet med steg 2)

`/dashboard/skapa-cv?cv=<id>&avsnitt=<kontakt|profil|erfarenhet|utbildning|kompetenser|sprak|fler>&mall=<mallid>&fran=<mallar|ditt-cv|analys>`. Tolkningen ligger i `arbetslage.ts` (`tolkaFran`, `tolkaAvsnitt`, `tillbakaHref`, `arkForParam`). Klar, tillbaka och "Byt mall" sparar det hon skrivit, väntar in sparkön och går med `lamnaFlodet` till sidan i `fran` med samma cv (och mall för Mallar). Utan `fran` och utan CV går krysset till rummet flödet startades från, som förut. `?borja=1&titel=` (steg 1) och `fran=mina_cv` fungerar som förut (mina_cv skrivs om till ditt-cv i adressen). Gamla `?andra=sprak` tolkas som `avsnitt=sprak`. Avsnittet hon står i skrivs i adressen med replaceState (bladet är inte längre en historikpost).

### Arket medan hon skriver

`levande.ts`, `useLevandeArk`: samma `/api/cv/preview-html` som resten av rummet, men 450 ms paus efter sista tangenten, en fråga i taget (en ny ändring avbryter den som är på väg) och utkasten i ett eget litet minne (8), så att flikens delade minne (hooks.ts) inte fylls av halvskrivna meningar. Det sparade läget läses ur det delade minnet, så serverns första HTML visas utan fråga. Mätt mot den lokala servern: en titel på 30 tecken skriven i normal takt gav en enda fråga; att öppna arbetsläget gav ingen.

`ArbetsArk.tsx` ritar arket med två iframes i växel (den nya versionen byts in först när den laddat, det gamla arket står kvar skarpt), hela dokumentet med brytlinje mellan sidorna, träffytor per avsnitt (`section[data-avsnitt]`) och huvudet (`[data-falt]`), markeringen och etiketten. Jobbet hon ändrar hittas som den `[data-post]` i avsnittet vars text bär titeln och arbetsgivaren; går det inte markeras hela avsnittet. Mallarna ändras inte.

### Delarna

| Fil | Vad |
|---|---|
| `ByggareClient.tsx` | Arbetsläget: huvudet, avsnittsraden, bladet, arket, sparkön, reserven, nedladdningen, Final, merförsäljningen, startbladet |
| `arbetslage.ts` | Adressen, läget (`lageFor`), jobbens ordning på arket (`ordning`), startbladet och Nästa (`startArk`, `nastaFor`), källan till arket (`arkKalla`: spöktext bara när CV:t byggs) |
| `arbetslage.module.css` | Formspråket ur skissens CSS, som CSS-modul (inte globals.css) så att steg 2 och 3 inte skriver i samma fil. Mörkt läge byter papper, fält och kant, aldrig väggen |
| `ArbetsArk.tsx`, `levande.ts` | Arket, se ovan |
| `blad/Ram.tsx` | Papper med mörkt huvud; `ArbetsKontext`, `useUtkast` (utkastet till arket, jämfört med bladets första version så att ett blad som bara öppnats aldrig räknas som ändrat), `useRegistrera` (bladets spara, för Klar och avsnittsbyten) |
| `blad/Blad.tsx` | Bladen med dagens fält, validering och texter; Erfarenhet och Utbildning med posten utfälld och övriga som rader |
| `blad/Jobbcoach.tsx` | Kortet, kvoten (`CoachKvotProvider`, läst på servern med `checkCvByggAiQuota`, nedräknad ur svarets `kvar`), resultatraden |

### Var byggarens funktioner hamnade

| Funktion | Plats nu |
|---|---|
| Startbladet, uppladdning med samtycket ordagrant, spärren vid full kvot | Oförändrat (StartBlad), nu över väggen i stället för under FlowShells topprad |
| Sparstatus | Huvudet: Sparar, Sparat, Kunde inte spara med Försök igen |
| Lokal reserv | Oförändrad |
| Spärren när raden inte får skapas (403) | PaywallCard "cv-antal" överst i bladet |
| Miniminivån | Fotens text "Du kan ladda ner när ..." tills den är nådd; Nästa-raden pekar på luckan |
| Nästa-luckan och förslaget med Hoppa över | Nästa-raden i bladet (skissen Bygg) |
| Format och nedladdning med dagens spärrar, merförsäljningen, NameRequiredNotice | Raden under arket när miniminivån är nådd i ett CV som byggs (mörk knapp: Spara är vyns kopparknapp). Redigera har Klar; nedladdningen finns på Mallar |
| Final efter nedladdning | Oförändrad komponent, som förut |
| Fler avsnitt | "+ Fler" i avsnittsraden |
| Fyll i testdata (admin) | Under arket |
| Ta bort med Ångra | Länken "Ta bort jobbet på ...", Ångra-raden överst i bladet i åtta sekunder |
| Mallremsan, typsnitt, färg, ordning, foto, rubrikbyte, helskärm | Mallar (mallbrickan "Byt mall" i huvudet går dit med samma cv och mall) |

### Avvikelser mot skissen

- Sidomenyn står kvar till vänster på datorn, som i alla flöden: DashboardShell lägger innehållet i en stapelordning under sidomenyn, och att täcka den hade krävt en portal, som tar bort serverns första målning av arket. Därför börjar ytan vid huvudets kant (40 px), arket är 440 px (skissen 480) och mellanrummet 40 px. Etiketten "Du ändrar här" flyttar in i markeringens hörn om den inte ryms i fönstret.
- Från och Till är dagens månad och år (val plus fyra siffror) i stället för ett fritextfält; Ort står bakom "+ Ort (valfritt)" när jobbet saknar ort (dagens fält, mindre plats); fältnamnet "Punkter (en per rad)" är dagens.
- Bladets rubrik är avsnittets rubrik på arket (Arbetslivserfarenhet, Om mig, Färdigheter), som i dagens byggare; skissen Bygg säger Erfarenhet.
- "+ Lägg till ..." står vid rubriken på ett tomt avsnitt (dagens godkända mönster) och inte under varje avsnitt; "Lägg till ett jobb" finns i bladet.
- Telefonen: avsnittsraden står överst i bottenbladet (skissen visar ingen väg mellan avsnitten), Till visas när Pågående är urkryssat, och huvudet fäller ihop bladet så att hela arket och filraden syns.
- Ett avsnitt som saknas helt i ett uppladdat CV (till exempel Språk) markeras först när hon skrivit något, eftersom mallen inte ritar tomma avsnitt utanför byggläget.
- Kortet för Profil och Kompetenser: "Jobbcoachen skriver profilen åt dig" / "Låt Jobbcoachen skriva om profilen" och "Jobbcoachen föreslår kompetenser". Knapparna har dagens texter.
- När gratisförslagen är slut står dagens PaywallCard i kortet redan när bladet öppnas (servern vet kvoten), inte först efter ett tryck. paywall_shown mäts då när kortet visas.
- Nästa-raden har en pil i ikonrutan (ingen examensmössa finns i ikonfilerna).
- Klar visas i byggläget först när miniminivån är nådd.

### Kontroller

- `tsc` rent (utom en typfil som dev-servern genererar i `.next/dev/types` för `/api/cv/parse`). vitest: `src/app/dashboard/skapa-cv` (nya `arbetslage.test.ts`), `src/lib/cv/bygg`, `src/lib/cv/__tests__/sprak.test.ts`, 50 av 50.
- eslint gick inte att köra meningsfullt i arbetskopian (parsern läser inte TypeScript här, även för orörda filer).
- Skärmdumpar (scratchpad `cv/bygge/steg3/bilder/`): redigera uppladdat CV i Erfarenhet, Profil och Språk (1440, Erfarenhet även 412 och mörkt), arket medan hon skriver (`levande-1` till `levande-4`), bygg från början (startblad 1440 och 412, första jobbet med Jobbcoachens tre punkter, läget efter miniminivån med filraden, kvoten slut), telefonens bottenblad öppet och ihopfällt, Final efter nedladdning.
- Ett riktigt förslag från Jobbcoachen (tre punkter), och ett som gick på tidsgränsen medan dev-servern kompilerade rutten. En PDF i Linne laddades ner; den lokala PDF-kedjan fick tidsgräns på navigeringen och använde reserven (miljön, inte ändringen).
- `scripts/klicktest-cv-byggare.ts` följer arbetsläget (nya kontroller: arket ändras före Spara, bladet till vänster om arket med markering, kvoten i kortet, nytt flöde `--bara redigera` för ett uppladdat CV). Körda mot lokal server: `--bara full` och `--bara redigera`, alla OK, kontona raderade. Inte körda: `gratis`, `upp`, `premium`, `kvot` (Jobbcoachen, uppladdning och tre filer); de hör till slutstegets enda körning.

### Utanför steg 3:s område

- `src/app/dashboard/profil/cv/DittCvClient.tsx`, raden `sprakHref`: "Lägg till språken du kan" går nu till `/dashboard/skapa-cv?cv=<id>&avsnitt=sprak&fran=ditt-cv&mall=<mallen på arket>` i stället för Mallar med `?andra=sprak`.
- Bara lästa, inte ändrade: `rum3/flikar.ts` (`flikHref`), `Dokument/hooks.ts` (`lasForhandsvisning`, `nyckelFor`, `minnsForhandsvisning`, `useNedladdning`), `Dokument/matning.ts`, `Dokument/FastRad.tsx` (`FormatVal`), `Final`, `Merforsaljning`, `GraValSheet`, `PaywallCard`.

### Till slutsteget

- Mallyta importerar fortfarande AvsnittArk; när steg 2 länkar hit kan AvsnittArk tas bort.
- Mallar bär bara `mall` till arbetsläget. Har hon valt typsnitt eller färg på Mallar för ett uppladdat CV syns arket här i mallens standardval; ska arket vara exakt detsamma behöver kontraktet en `val`-parameter.
- Kör hela klicktestet en gång (`skapa`, `klicka`, `radera`).

### Backning

Commit 1 (arbetsläget) går att backa för sig; den ändrar bara `src/app/dashboard/skapa-cv/**` och raden `sprakHref` i Ditt CV. Commit 2 (klicktestet och de här noterna) påverkar ingen kod som körs.
