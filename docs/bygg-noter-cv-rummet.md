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

## Steg 2 (Mallar, mallbytet, spärrarna, merförsäljningen, målgången)

### Struktur och hur publikt och inloggat hålls isär

| Fil | Vad |
|---|---|
| `src/app/dashboard/cv-mallar/page.tsx` | Valt CV med `valtCvId` (aldrig låst, aldrig `cvRows[0]`), poängen per CV till Byt CV, plus i analysen och dokumentets väg för valt CV (en fråga för analyserna, en för valt CV:s analys). `?andra=sprak` från Ditt CV går vidare till arbetsläget. Flikremsan borttagen: väggen ritas av sidan. |
| `src/app/dashboard/cv-mallar/CvMallarClient.tsx` | Datan, valen, spärrordningen, nedladdningen och mätningen (flyttad hit från Mallyta, samma händelser) |
| `src/components/cv/rum3/mallar/MallarVy.tsx` | Ytan: väggen (CvVagg), arket, golvet, kolumnen som följer med, den fasta raden på telefonen. `AndraBricka` |
| `src/components/cv/rum3/mallar/MallGalleri.tsx` | Panelen: filter med antal ur katalogen, sökning, alla grupper (grupperaMallar), rutor med EgenMiniatyr |
| `src/components/cv/rum3/sparr/CvSparr.tsx` | Spärrens bild (vänster eller överst) runt PaywallCards texter |
| `src/components/cv/rum3/CvRadMobil.tsx` | "CV: namn" under flikarna på telefonen med fler än ett CV |
| `src/components/cv/rum3/flikar.ts` | `arbetslageHref(cvId, fran, { avsnitt, mall })`, kontraktet i 10b |

Publikt (`/cv-mallar`, `/cv-mallar/prova`, artiklarna) använder fortfarande `Mallyta`, `Remsa`, `AllaArk`, `FastRad` och `Miniatyr`, och de är orörda. Delade komponenter fick bara valfria tillägg som är av som standard:

- `Dokument` `vagg`: utan tipsraden och bandet, markering och penna på avsnittet under pekaren.
- `Verktygsrad` `brickor` och `forst`: samma val och ark, ritade som brickor.
- `useForhandsvisning(kalla, { fordrojning })`: utelämnat 250 ms som förut.
- `PaywallCard` `utseende: 'cv'` och `cvSparr`, `GraValSheet` `cvSparr` och `onSecondary`: utelämnat som förut.
- `Final` och `Merforsaljning` har det nya utseendet (galleriet och byggaren, inloggat). Provsidan importerar de gamla bladen, flyttade oförändrade till `FinalArk.tsx` och `MerforsaljningArk.tsx`. Byggarens filer rördes inte; Final läser där arket som står på sidan (iframen) i stället för minnet.

Kontroll: `/cv-mallar` och `/cv-mallar/prova` fotograferade före och efter i 1440 och 412 och pixeljämförda: 0 olika pixlar (en första körning skilde i arkets iframe och förslagen, laddningstiming; omkörd: 0). Serverns HTML för `/cv-mallar`, `/cv-mallar/prova`, `/cv-mallar/underskoterska`, `/artiklar/bra-cv-guide` och `/verktyg/cv-mallar` jämförd före (steg 1:s commit) och efter: identisk.

SEO-diffen (`scripts/seo-diff-artiklar.ts ta`) går inte att köra lokalt just nu: `/artiklar/logiska-tester` svarar 500 i utvecklingsläget ("failed to pipe response") redan på steg 1:s commit, och skriptet avbryts där. Inte orsakat av steg 2; slutsteget bör köra den mot ett bygge.

### Mallbytet (avsnitt 6 punkt 4 till 8)

- Ingen fördröjning vid klick, 250 ms vid svep och pil (pilknapparna och piltangenterna). Det gamla arket står skarpt tills det nya är klart; en tunn kopparlinje överst på arket visar att det ritas.
- Arket tar HTML:en direkt om miniatyrernas rad hämtar samma mall medan arket väntar (`VANTAR` i hooks.ts), och avbryter då sin egen fråga.
- Förhämtning: de föreslagna och grannarna till vald mall när sidan är ledig (egnaMallar, en fråga per åtta), mallen under pekaren eller i fokus direkt. Miniatyrerna hämtas rad för rad när de kommer nära bild. Inget hämtas för den som inte öppnar Mallar.
- Minnet rymmer 64 (alla 40 plus ett andra val) och glömmer andra CV:n och äldre versioner av samma CV när CV:t byts eller ändras (`rensaForhandsvisningar`).
- Miniatyrerna ritas med samma val som arket (typsnitt, färg, ordning, rubriker), så att minnet delas; ett nytt typsnitt hämtar om raderna i bild.

Mätning (`scripts/mat-mallbyte.mjs`, lokal utvecklingsserver, 1440, gratiskontot, tid från klick till att arkets iframe laddat ny HTML; en uppvärmning, sedan en eller två körningar):

| Fall | Före (steg 1) | Efter |
|---|---|---|
| Kall, föreslagen mall vars ruta syns | 606 till 758 ms | 141 till 162 ms (förhämtad) |
| Kall, mall längst ner (Affisch, granne till Linne) | 647 ms | 82 till 100 ms (förhämtad som granne) |
| Kall, pekaren 400 ms över rutan före klick | som kall | 123 ms |
| Kall, klick utan pekare, ingen förhämtning | 606 till 758 ms | 418 till 1038 ms (Skylt, Tusch) |
| Varm, visad förut | 86 till 112 ms | 105 till 140 ms |

Det kalla klicket utan förhämtning slipper 250 ms fördröjning men konkurrerar på utvecklingsservern med miniatyrernas rader som hämtas samtidigt; spridningen är stor. Varm är oförändrad inom bruset (iframen laddas om i båda). Siffrorna är utvecklingsläge; LCP mäts i slutsteget med `scripts/perf-inloggat.ts`.

### Mallar: lägen

`data-lage` på väggen: `gratismall`, `premiummall`, `exempel`. Utan CV: exempel-CV:t, ingen nedladdning, "Ladda upp ditt CV" (arket Ett CV till via `oppnaNyttCv`) och "Skriv från början" (byggaren) på väggen och i den fasta raden. Gratisnedladdningen använd: knappen öppnar merförsäljningen (eller cv-export-spärren när urvalet är tomt). Mall utan Word: Word-knappen avstängd, skärmläsartexten "Word finns inte i den här mallen".

Var mallsidans funktioner hamnade: byta mall (rutorna, pilarna, svep, piltangenter, helskärmens remsa), typsnitt, färg, ordning med en sida och rubriker efter yrke, foto (brickorna, samma ark), rubrikbyte (tryck på rubriken på arket, RubrikArk som förut), redigera avsnitt (tryck på avsnittet, namnet eller kontakten, och brickan Ändra texten: länk till arbetsläget), helskärm (förstoringsglaset, tryck på arket, "Läs i helskärm"), PDF/Word och knappen (väggen, kolumnen som följer med, den fasta raden), Byt CV (CV-raden och arket ur steg 1 med låsta och Ta bort; bytet sker utan omladdning), fotoraden efter kontot (`?foto=1`, överst på väggen), köpreturen `?ladda=1` och `?kop=1` som förut.

### Spärrarna, merförsäljningen och målgången

- Spärrarna (mall, cv-export-word, cv-export) ritas av PaywallCard med `utseende="cv"`: eyebrow = dagens rubrik, ny rubrik per variant (mall: "Skicka CV:t precis som det ser ut här"; cv-export-word: "Ändra CV:t själv, i Word"; cv-export: "Ladda ner igen, i vilken mall du vill"), dagens brödtext, talrutor (antal mallar och antal med Word ur katalogen, plus i analysen bara när valt CV har en analys), tre punkter, prisraden och knappen ur paywall-copy (kampanjpriset följer med), "Se vad som ingår". Gratisvägen "Välj bland de 2 fria" mäts som sekundär och väljer gratismallen. Mätning och köpsteg oförändrade (test: `PaywallCard.cvsparr.test.tsx`).
- Merförsäljningen: samma ram, hennes CV i vald mall till vänster, korten som val till höger, dagens texter, knapp, kampanjrad och "Nej tack". Korten hämtas i en fråga.
- Målgången: hel vägg, arket landar med bocken, filraden, Öppna, Dela (bara när webbläsaren kan dela filer), dokumentets väg, och papperet med nästa steg. Galleriet: första jobbet som matchar (titel och ort ur CV:t), "Skriv personligt brev till annonsen", "Se fler jobb som matchar", "Tillbaka till Ditt CV"; utan träff reserven med brevet; byggaren analysen som nästa steg. Vägen visar det som är gjort (analyserat och åtgärdat bara när det är sant), nedladdat klart. Skissens etikett "Samma titel och ort som i ditt CV" är utelämnad: träffen söks på titel och ort men behöver inte ha samma titel.

### Beslut från projektledaren

- Alla tre flikarna visar samma CV (`valtCvId`); Mallar tar inte längre `cvRows[0]`.
- "CV: namn" under flikarna på telefonen med fler än ett CV: `CvVagg` och `CvFlikRemsa` läser den ur `cvRad` (CvRad-propsen), så Ditt CV, Mallar och Analys får den utan ändring på sidorna. Väggens telefonhöjd växer med raden (462 och 536 px).
- Räkneord: "+36" och "alla N åtgärder" räknades redan; "i tre andra" (Samma CV, annan mall) och "Exempel-CV i tre av" räknas nu ur urvalet.

### Avvikelser mot skissen

- Med sidomenyn är golvet smalare än skissens 1120 px: arkets kolumn är `clamp(300px, 36%, 400px)` och pilarna sitter över arkets kanter (−24 px) i stället för utanför, så att högerpilen inte hamnar utanför skärmen.
- Tipsraden "Tryck på ett avsnitt för att ändra texten" står nere på arket första besöket, inte till vänster om det: där täckte den väggens text med sidomenyn.
- Mallens rad på väggen är `mall.stil` (katalogens stil, ofta längre än skissens kortbeskrivning) följt av texten om att den följer med.
- Telefonens verktygsrad har Ändra texten först (skissen saknar den); föreslagna-gruppen är det riktiga urvalet för CV:t.
- Gratisvägen och Premiumkortet står på telefonen överst i panelen respektive under den (skissen visar dem inte på telefonen).
- Merförsäljningen och spärren cv-export har ingen egen skiss; de följer Sparr-mall.

### Inte gjort i steg 2

- Typsnittsarkets antal och Helvetica-märkningen (avsnitt 8 punkt 3) ligger i steg 4.
- Klicktestet för mallkomponenterna (`klicktest-mallar-komponenter.ts`) är inte kört: dess inloggade del letar efter den gamla ytan, och det gör riktiga nedladdningar och skapar konton mot produktionen. Slutsteget uppdaterar och kör det.
- Ditt CV:s länk "Lägg till språken" går fortfarande till Mallar (`?andra=sprak`), som nu skickar vidare till arbetsläget (`fran=ditt-cv`). Slutsteget kan peka länken direkt dit.

### Testkonton och skärmdumpar

`QA_TAGG=-s2 node scripts/qa-cv-rummet-konton.mjs skapa|radera` (taggen ger egna adresser när två agenter kör samtidigt; nytt konto `nedladdat` med gratisnedladdningen använd). `scripts/skarm-mallar.mjs` fotograferar alla lägen, spärrar och målgången utan riktiga nedladdningar (generate-formatted och forsta-traff besvaras i webbläsaren); `--vy` för bara första vyn.

### Backning

`dd4c9140` (mallbytet) går att backa för sig. `059ab821` (spärrar, merförsäljning, målgång) och `2f80e10c` (Mallar-sidan och CSS:en för båda) hör ihop: backa i omvänd ordning, med rättelserna efter dem först.
