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
