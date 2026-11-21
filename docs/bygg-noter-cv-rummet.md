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
- Potentialen: analysöversiktens uträkning var flyttad till `src/lib/cv/analys/potential.ts`. Ersatt i steg 4 av poängmodellen (se steg 4 nedan); filen är borttagen.
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

## Steg 4 (Analys-sidan, ovanpå poängmodellen)

Gren `feat/cv-analys-poang`. Poängmodellen: `docs/poangmodell-cv-analys.md`, typerna: `docs/bygg-noter-cv-analys-poang.md`.

### Sammanslagningen med steg 1

`git merge d0d7f505` (bara den commiten). Krockar i `cvRum.ts`, Ditt CV:s `page.tsx` och wizarden; båda sidorna behölls. Steg 1:s `src/lib/cv/analys/potential.ts` (summerade AI:ns plus) är borttagen. I stället:

- `src/lib/cv/analys/cvAnalys.ts`: vilken analys som hör till ett CV (egen rad, annars originalets för ett "-improved"), `underlagUrRad` (poängsätter analysen på CV:t som visas med `poangsattAnalys`), `atgardadAtFor` (dokumentets väg) och `friaNycklarFor` (vilka fynd gratisnivån får med åtgärd).
- `AnalysUnderlag` (cvRum.ts) fick `medForslag` (poängmodellens med våra förslag) och `friaNycklar`; `medForslagUrAnalys(a)` ersätter `potentialPoang`. Ditt CV:s stora tal, "Med våra förslag", "N poäng att hämta", fyndkortens plus, målkortet och mätaren Läsbarheten kommer därifrån.
- Ditt CV:s utseende är oförändrat. En sak ändrades i logiken: "Ingår gratis" och de öppna korten följer nu `friaNycklar` (profilen och det fynd servern släpper), inte "första kortet". Förut kunde Ditt CV kalla ett kort gratis som analysen sedan låste.

### Analys-sidan

`page.tsx` läser allt parallellt och väljer CV med `valtCvId` (aldrig ett låst). Lägen (`data-lage`): `resultat`, `utan-struktur`, `intro`, `sparr`. `?job=<id>` öppnar dagens steg (wizarden) som förut; `&steg=4|5&valj=profil|roll-<i>|kompetenser|forvalda` kommer från sidans knappar.

| Fil | Vad |
|---|---|
| `src/app/dashboard/cv-analys/analysData.ts` | `byggAnalysVy`: fynden (profil, roller, kompetenserna tillsammans) med verkligt plus, texterna bara för de öppna, "Vad vi har ändrat" ur modellens kontroller |
| `src/app/dashboard/cv-analys/AnalysVy.tsx` | väggen (CvVagg), golvet, introt och spärren; "Analysera mitt CV" monterar dagens flöde med CV:t valt |
| `src/app/dashboard/cv-analys/components/AnalysArk.tsx` | arket med markeringar: avsnittsmätningen (`matDokument`), rollen letas upp på titeln i erfarenhetsavsnittet, annars markeras avsnittet; markeringar under sida ett ritas inte |
| `src/app/dashboard/cv-analys/analys.css` | egna `.cv4-*` (egen fil, så globals.css inte krockar med steg 2 och 3) |
| `src/app/dashboard/cv-analys/analysTexter.ts` | texterna; introts och spärrens är dagens |

Kvoten: `getCvAnalysData` räknar nu med `checkCvAnalysisQuota` (jobb med usage_counted), samma som Ditt CV och spärren i `/api/cv/analyze`. Kvoten i sig är oförändrad.

Gratisnivån: talen (i dag, med våra förslag, plus per fynd och kategori) är desamma som för Premium. Åtgärdstexten finns bara för profilen och det servern släpper (`analysForKlient`, `gateAnalysisResult` med en lista över säkra fält).

### Flödet efter resultatet

- "Åtgärda i CV:t" landar i väljsteget med de förvalda förslagen; "Ändra texten" i väljsteget med fyndet valt; "Använd förslaget" i granskningen med bara det förslaget.
- Slutsteget sparar och går till Mallar (`/dashboard/cv-mallar?cv=<id>`). Ingen egen mallväljare eller nedladdning (rättar fynd 1 och 2). "Spara som nytt CV" kräver ledig plats, "Ersätt mitt nuvarande CV" uppdaterar det analyserade CV:t på plats (`POST /api/cv/save-improved` med `lage: 'ersatt'`, bara egna CV, ingen kvotkontroll). Båda bygger CV:t med `byggForbattratCv`, så poängen blir den utlovade.
- Analysraden för det sparade CV:t byggs på servern ur den ursprungliga analysen (`save-improved-analysis`) och märks `result.forbattradSparad = { at, satt: 'nytt' | 'ersatt' }`. Ditt CV:s väg läser det som åtgärdat (också vid ersättning, där filvägen inte ändras). Förslag som redan står i CV:t (samma profiltext, samma rolltext) tas bort när raden läses, så de visas aldrig som kvar att göra; poängen räknas alltid på det som står i CV:t.
- Fynd 4: "Analysera ett annat CV" går till `/dashboard/cv-analys`, klart till Ditt CV.
- Fynd 3: Helvetica är inte längre märkt premium (`src/lib/cv/preview-utils.ts`). Kvar för steg 2: texten "Elva typsnitt i tre grupper" i `src/components/cv/Dokument/texter.ts` rad 96 ska bli "Fjorton typsnitt i tre grupper" (14 typsnitt; Helvetica ligger nu i gruppen ATS-säkra, så grupperna är tre).

Klicktest: `scripts/klicktest-cv-analys-spara.mjs` (premiumkontot: granska, Ersätt, Spara, Mallar, Ditt CV, Analys). Utfall: 81 i dag, profilförslaget +2, sparat CV 83, profilen inte kvar som fynd, Ditt CV visar åtgärdat.

### Personuppgifter (punkt D)

`/api/linkedin/optimize` och edge-funktionerna `optimize-linkedin` (den LinkedIn-optimeraren anropar) och `parse-cv-for-matching` (jobbmatchningens tolkning av CV:t) maskar med samma mekanism (`maskaCvForModel`/`maskeraSektioner`, `_shared/pii.ts`) och tar bort platshållarna ur svaren. `match-jobs` skickar bara annonser och yrkestermer till Arbetsförmedlingens tjänster, inga CV-uppgifter; där ändrades inget. Test: `src/lib/privacy/__tests__/linkedin-matchning-ai.test.ts`.

### Testkonton och skärmdumpar

`scripts/qa-cv-analys-konton.mjs skapa|radera` (fem konton med prefixet `qa-cv-analys4-`, analysrader som testdata utan AI-anrop), `scripts/skarm-cv-analys.mjs` (`--morkt`, `--mellan`).

### Avvikelser mot skissen

- Förslagets text markeras inte med gröna `<mark>` per ändrad fras (det kräver en ordvis jämförelse vi inte har); `[antal]` markeras.
- Gratis: det utfällda fyndet är det första ÖPPNA (profilen eller det servern släpper), inte alltid nummer ett; numreringen följer verkligt plus.
- "Så räknas poängen" visar modellens kategorier (Personbeskrivning, Erfarenhet, ...) i stället för skissens fyndnamn, plus förklaringen och "Alla sju delar".
- Två kopparknappar i resultatläget för gratis (väggens "Åtgärda i CV:t" och köpknappen), som skissen och Ditt CV i steg 1.
- Telefon: arket först (lyft in i väggen), sedan fynden, sedan "Så räknas poängen".
