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

Det kalla klicket utan förhämtning slipper 250 ms fördröjning men konkurrerade på utvecklingsservern med miniatyrernas rader som hämtades samtidigt (värsta fallet 1038 ms). Rättat i uppföljningen, se "Arkets förtur" nedan.

**Arkets förtur (uppföljningen efter steg 3).** När arket hämtar mallen hon klickade på (`useForhandsvisning`, inloggat) tar det förtur (`lyssnaPaFortur`, `harFortur` i hooks.ts): miniatyrernas rad som är i luften avbryts och läggs först i kön igen, och ingen ny rad startar förrän arket har sitt svar. Miniatyrerna har som förut högst en fråga i luften. Mätt igen (tre körningar efter en uppvärmning, samma miljö):

| Fall | Före (steg 1) | Steg 2 | Med förtur |
|---|---|---|---|
| Kall, föreslagen mall vars ruta syns | 606 till 758 ms | 141 till 162 ms | 116 ms |
| Kall, granne till vald mall | 647 ms | 82 till 100 ms | 84 till 109 ms |
| Kall, pekaren 400 ms före klick | som kall | 123 ms | 75 till 87 ms |
| Kall, klick utan pekare, ingen förhämtning | 606 till 758 ms | 418 till 1038 ms | 337 till 416 ms |
| Varm, visad förut | 86 till 112 ms | 105 till 140 ms | 81 till 179 ms | Varm är oförändrad inom bruset (iframen laddas om i båda). Siffrorna är utvecklingsläge; LCP mäts i slutsteget med `scripts/perf-inloggat.ts`.

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

- Typsnittsarkets antal och Helvetica-märkningen (avsnitt 8 punkt 3): gjort i integrationen.
- Klicktestet för mallkomponenterna: uppdaterat i integrationen (växeln --skarpt), körs i slutsteget.
- Ditt CV:s länk "Lägg till språken" pekar sedan steg 3 och integrationen direkt på arbetsläget; `?andra=sprak` är reserv.

### Testkonton och skärmdumpar

`QA_TAGG=-s2 node scripts/qa-cv-rummet-konton.mjs skapa|radera` (taggen ger egna adresser när två agenter kör samtidigt; nytt konto `nedladdat` med gratisnedladdningen använd). `scripts/skarm-mallar.mjs` fotograferar alla lägen, spärrar och målgången utan riktiga nedladdningar (generate-formatted och forsta-traff besvaras i webbläsaren); `--vy` för bara första vyn.

### Backning

`dd4c9140` (mallbytet) går att backa för sig. `059ab821` (spärrar, merförsäljning, målgång) och `2f80e10c` (Mallar-sidan och CSS:en för båda) hör ihop: backa i omvänd ordning, med rättelserna efter dem först.
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

- Mallyta importerar fortfarande AvsnittArk. Uppföljningen: AvsnittArk lever kvar, för provsidan utan konto (ProvaArbetsyta skickar avsnitt till Mallyta). Det som bevisligen var dött togs bort: Mallytas byggarprops (bygg, lucka, utanKnapp, ovanRad, kolumn, utanSvep), som bara den gamla byggaren använde. /cv-mallar och /cv-mallar/prova pixeljämförda efteråt: 0 olika pixlar.
- Mallar bär bara `mall` till arbetsläget. Löst i integrationen: valen står i adressen (se nedan).
- Kör hela klicktestet en gång (`skapa`, `klicka`, `radera`).

### Backning

Commit 1 (arbetsläget) går att backa för sig; den ändrar bara `src/app/dashboard/skapa-cv/**` och raden `sprakHref` i Ditt CV. Commit 2 (klicktestet och de här noterna) påverkar ingen kod som körs.

## Integrationen Mallar och arbetsläget (efter sammanslagningen av steg 3)

- **Sammanslagningen:** tsc rent; vitest för `src/components/cv`, `src/components/paywall`, `src/lib/cv`, `src/lib/rum` och `src/app/dashboard/skapa-cv` 681 av 681 efter en rättelse: en kommentar i `egnaMallar.ts` ("... 8). Rutorna ber om sina mallar") fällde mallantalstestet.
- **Valen följer med:** valen sparas inte på uppladdade CV (bara byggda har `bygge.val`), så kontraktet bär dem i adressen med exempel-API:ts namn: `typsnitt`, `farg`, `ordning`, `ensida`, `uppsattning` (`valTillQuery` och `valUrAdress` i `src/lib/cv/mallar/val.ts`). Mallar skriver dem i sin adress, länkarna till arbetsläget (`arbetslageHref(..., { val })`) bär dem, arbetsläget ritar arket med dem (`initialVal`, annars de sparade på ett byggt CV), och Klar, tillbaka och Byt mall (`tillbakaHref(..., val)`) lämnar dem tillbaka till Mallar. Håller vid omladdning; ett byggt CV som sparas i arbetsläget får valen i `bygge.val` som förut. Rubrikerna följer inte med i adressen: de sparas på CV:t.
- **Rätt avsnitt:** brickan Ändra texten skickar `avsnitt=kontakt`, och arbetsläget öppnar Kontakt när det kommer från en flik (`fran`) utan avsnitt i ett befintligt CV. Ditt CV:s "Lägg till språken du kan" byggs med `arbetslageHref(id, 'ditt-cv', { avsnitt: 'sprak', mall })`; `?andra=sprak` finns kvar som reserv på Mallar (vidare till arbetsläget) och i arbetsläget.
- **Sidomenyn:** `menyPath` i `src/lib/rum/rum.ts`: på `/dashboard/skapa-cv` med `?cv=` markeras fliken i `fran` (mallar, analys; annars Ditt CV). Skapa nytt CV är aktiv bara när CV:t byggs från början. Sidomenyn läser adressen med `useSearchParams` (dashboard-layouten är dynamisk, så ingen Suspense behövs).
- **Typsnittsarket:** texten räknas ur arkets lista ("14 typsnitt i tre grupper"), Helvetica är gratis och står bland de ATS-säkra i `FONTS`. Det gäller också brevens typsnittsval (`skapa-brev/components/FontSelector.tsx` låste Helvetica för gratis) och exempelsidornas typsnittslista, som läser samma `FONTS`. `/cv-mallar` och `/cv-mallar/prova` pixeljämförda efteråt: 0 olika pixlar vid laddning (arket med texten öppnas först vid tryck).
- **Städningen:** AvsnittArk lever kvar (provsidan utan konto). Mallytas byggarprops togs bort (se ovan under Steg 3, Till slutsteget).

### Klicktesterna inför slutsteget

`scripts/klicktest-cv-yta.ts` samlar väljarna för den inloggade mallytan (`YTA`), `klickaSynlig`/`synlig` (synlig = har en ruta, också fasta lager som målgången) och växeln `--skarpt`. Utan växeln besvaras `/api/cv/generate-formatted` i webbläsaren med en liten PDF eller Word-fil, och kontroller som kräver servern hoppas över med en OK-rad som säger det.

| Skript | Ändrat |
|---|---|
| `klicktest-mallar-komponenter.ts` | Inloggat: fasta raden mot navet på telefonen, vald mall i kolumnen på datorn, rubrikarket, spärren mall och köpsteget, första nedladdningen och målgången, köpreturen `?ladda=1`, Word. Merförsäljningen och provsidans kontoskapande bara med `--skarpt` |
| `klicktest-nedladdning.ts` | Nedladdningsknappen i nya ytan, målgången; andra försöket (merförsäljningen), 402, Word och brevet bara med `--skarpt` |
| `klicktest-cv-word.ts` | Formatvalet i nya ytan: Word öppet i gratismall, låst i Premiummall (spärren cv-export-word), avstängt i mall utan Word, nedladdning och målgång; använd gratisnedladdning ger merförsäljningen |
| `klicktest-helskarm-dator.ts` | Inloggat: galleriet (alla 40 i grupper, klick byter arket), format och nedladdning nåbara, titeln öppnar arbetsläget i Kontakt; titeln i PDF och Word bara med `--skarpt` |
| `klicktest-helskarm-sidor.ts` | Inloggat: helskärmen på Mallar; jämförelsen med filens sidor bara med `--skarpt`; byggarens gamla steg 7 borttaget (arbetsläget har klicktest-cv-byggare) |

Körda nu: `npx tsx scripts/klicktest-cv-yta.ts prova --konton <qa-json>` mot lokal server, 22 av 22 (gratis 1280: väggen, knappen, formatet, arket, förstoringsglaset, Ändra texten, rutorna, panelen, pilarna, gratisvägen, Premiumkortet, spärren mall; Premium 412: samma plus den fasta raden och målgången efter en påhittad nedladdning). Skripten typkontrollerade (bara de sedan tidigare kända `link!.properties`-varningarna). Testerna i sin helhet är inte körda.

### Flödet Mallar, arbetsläget och tillbaka

Skärmdumpar i scratchpad `cv/bygge/steg23/flode/` (1440 och 412): Koppar med Georgia och tredje färgen, Ändra texten, titeln ändrad, Klar (telefonen: tillbaka-pilen), tillbaka på Mallar. 9 av 9 kontroller: valen i adressen på Mallar, arbetsläget i Kontakt med valen och `fran=mallar`, sidomenyn markerar Mallar, tillbaka med samma mall och val, brickan visar Georgia och arket den nya titeln.
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

## Steg 5 (slutkontrollen)

Grenen innehåller origin/main till och med `1c1dda8c` (två sammanslagningar: `073be47f` med d922e403, en krock i `globals.css` där båda sidor lagt ett block sist, båda behållna; `04ac57c0` med 1c1dda8c, inga krockar, fyra delade filer lästa: Sidomeny, Final, copy.ts, namn-valfritt.test.ts).

### Rättelser

| Commit | Vad | Backas |
|---|---|---|
| `c89712e5` | Mallar räknade plus och poäng per CV själv (steg 1:s borttagna `potential.ts`, AI:ns sparade tal). Nu `analysPerCv`, `underlagForCv`, `medForslagUrAnalys`, `poangForRad`, `atgardadAtFor` som Ditt CV | `git revert` (tsc blir då rött) |
| `7cbed8a0` | Gratisanalysen släppte profilförslaget utöver det tyngsta fyndet (två åtgärder). Profilen är nu ett fynd bland de andra i `gateAnalysisResult`; öppet bara när det är tyngst. Ändrar gratisnivåns utlämning också i analysflödet | revert, tester följer med |
| `4dcba502` | React-varningen om listnycklar på Analys: CvRad skapad i serverkomponenten fick en nyckel | revert |
| `3d0da6ee` | "Ändra texten" på Analys går till arbetsläget (`fran=analys`, fyndets avsnitt); Ditt CV:s Fortsätt bygga och Redigera i byggaren med `arbetslageHref` | revert |
| `6f1f1275` | Mallar utan `?mall=` visar samma mall som Ditt CV och Analys (senast nedladdade, CV:ts sparade, katalogens första) | revert |
| `53d0116a`, `3d9ff4c0`, `64f32153` | Testerna: namnkravet prövas på Mallar; byggarens klicktest följer arbetsläget och Ditt CV; Word-testets regex hade tappat sina bakstreck; analystestet läser `BAS` | revert, påverkar ingen kod |
| `3a7ca731` | Inläsningen (`parseCV` frågar inte modellen om namnet) gav tomt namn, och `normalizeStructuredData` kastade då hela ParsedCV:t: den publika tolkningen fick ingen erfarenhet. Normaliseras nu med tomt namn när roller eller profil finns | revert |
| `feefe161` | "Alla 40" i Mallars helskärm gjorde ingenting; öppnar nu AllaArk | revert |
| `dd902c75` | Den återupptagna analysen (`?job=`) kraschade i produktionsbygget: CvFlikRemsa (server) anropade `cvRadData` ur en klientmodul. Flyttad till `rum3/cvRadData.ts` | revert (då kraschar Åtgärda i CV:t igen) |
| `9262b92b` | Gratisanvändarens enda analys: svaret räknade kvoten till 0 och spärren ersatte flödet som väntade på resultatet. Spärren gäller nu bara innan en analys startats i visningen | revert |
| `5635ddab` | Poängmodellens läsning av roles-formatet: punkterna ur `responsibilities` först (som arket), och "och"/"samt" delar bara när båda leden har minst tre tecken ("Truckkort A och B" tappade B). Det som räknas och sparas vid Ersätt är det arket visar. Kalibreringen oförändrad | revert |
| `ef567c5b` | Förhämtade sidor låg kvar i routerns minne: efter nedladdning, sparning i arbetsläget eller analys visade flikarna och sidomenyn gamla tal. CV-rummets tre sidor förhämtas inte (`forhamtaCvSida`) | revert |

### Kontrollerna

| Kontroll | Kommando | Utfall |
|---|---|---|
| tsc | `npx tsc --noEmit -p .` | Rent i `src`. Efter ett webpack-bygge tar tsc med `.next/types/app/api/jobs/redact/route.ts`, som klagar på main:s export av `FREE_TIER_JOB_LIMIT` ur en route (finns likadant på main, syns bara med webpack) |
| vitest | `npx vitest run` | 309 filer, 3974 gröna, 13 överhoppade (3 filer med flit), 0 röda på slutläget. Första körningen: 1 röd (`namn-valfritt`, föråldrad av steg 4), grön på origin/main |
| Bygge | se nedan | Turbopack kan inte följa junctionen (`Symlink node_modules is invalid`). Webpack (`next build --webpack`) går igenom utan typsteget; med typsteget stoppar det på main:s route-export ovan. Slutbygget på slutläget (med 1c1dda8c): Turbopack med `turbopack.root`/`outputFileTracingRoot` tillfälligt på `C:/Users/chris/cvbrev` och `@` på arbetskopians `src` (inte committat), grönt med typkontroll, 799 sidor; grenens kod kontrollerad i bygget. Klicktesterna, SEO-diffen, pixel och perf kördes mot webpack-byggen av grenen före den sista sammanslagningen (som bara rörde brevrummet) |
| ATS | `npm run test:ats` | 330 av 330 (testet har vuxit sedan specens 160). Första körningen fick tidsgräns medan bygget gick |
| Mall, Word, byggare | i vitest | gröna (`src/lib/cv`, `src/components/cv`, `src/app/dashboard/skapa-cv`, `src/lib/cv/word`) |
| SEO-diff | `seo-diff-artiklar.ts ta/jamfor`, före mot main-bygget (d922e403), efter mot grenen | 48 sidor: Fel 2, båda `ogImage` på `/verktyg/personlighetstest` och `/verktyg/bli-upptackt` ("" blev verktygens opengraph-bild). Sidorna är orörda; produktionen (Turbopack) ger "" som main, webpack-bygget ärver bilden. 11 mallsidor och `/verktyg/cv-analys`: Fel 0 |
| Avsiktliga publika ändringar | | `/verktyg/cv-analys`: FAQ-svaret om poängen ("räknas fram ur det som står i CV:t ... samma CV ger alltid samma poäng"), FAQ-svaret om förslagen ("Allmänna råd" i stället för "Automatiska förbättringar") och WebApplication `featureList` ("allmänna råd"). Ord i main 949 till 968. Typsnittsarkets antal syns först när arket öppnas och finns inte i serverns HTML |
| Pixel | `pixel.mjs` (scratchpad), 1440 och 412, ljust och mörkt | `/cv-mallar`, `/cv-mallar/prova`, `/dashboard/tester` mot main-bygget: 0 olika pixlar på alla 12 (bruset mot samma server: 0) |
| Klicktest byggaren | `klicktest-cv-byggare.ts` alla flöden | 56 OK, 2 FEL (föråldrade kontroller), rättade; gratisflödet omkört grönt |
| Mallkomponenterna | `--skarpt` | 115 OK, 0 FEL |
| Nedladdning | `--skarpt` | 39 OK, 0 FEL |
| Word | `--skarpt` | 82 OK, 0 FEL efter rättat test (först 66/16, alla testfel) |
| Helskärm dator | `--skarpt` | 552 OK, 52 FEL; efter `3a7ca731` och `feefe161`: `--snabb --skarpt` 303 OK, 0 FEL |
| Helskärm sidor | `--skarpt` | 108 OK, 8 FEL: "arken åtskilda (-763 px)" och ett klickfel efteråt, utloggat och inloggat. Main:s version mot main ger samma utloggade fel (testet förutsätter ark under varandra). Inte rättat |
| Analysens sparning | `klicktest-cv-analys-spara.mjs` | Först sidfel (se `dd902c75`); sedan 81, profil +2, efter Ersätt 83, profilen inte kvar som fynd |
| Perf | `perf-inloggat.ts --samtycke` (Pixel 7, 3x CPU, LTE) | Ditt CV LCP 1008 och 1044 ms, Mallar 1336, Analys 1188, CLS 0. `/dashboard/tester` (orörd) mäter 1120 i samma miljö |
| Black Week | `KAMPANJ_NU=2026-11-24` lokalt | 99 kr första månaden på Ditt CV:s köprad, Analys betalvägg, Mallars Premiumkort, knapp och spärr; Jobbcoach-kortet ritar samma PaywallCard (`PaywallCard.kampanj.test.tsx`) |
| Texter om samtycke, GDPR, villkor | `git diff origin/main` | Orörda. Samtycket står ordagrant i InlineCVUpload; den gamla MinaCvClient är borttagen |

### Genomgången som ny användare

Bilder i scratchpad `cv/bygge/steg5/ny-anvandare-1440/` (och `bygg/`) och `ny-anvandare-412/`. Två riktiga analyser (gamla edge-funktionen). 1440: snabbpoäng 71, analys 71 till 85, löftet 75, efter Ersätt 75 på Analys och Ditt CV, spärren "+10", nedladdning och målgång, titeln ändrad i arbetsläget. 412: 68 till 83, löftet 76, efter Ersätt 76 överallt, efter titeln 79 överallt (Analys två gånger, Ditt CV, Mallar). Byggflödet: titel från Ditt CV, ett jobb med Jobbcoachens tre punkter, miniminivån, PDF.

### Kända brister

- Perioder som "2019 till 2024" delades inte (bara bindestreck). Rättat i efterrättning B (`eaf406f9`), se nedan.
- Uppladdningen sparar texten med `[EMAIL]` och `[TEL]` (som main), så CV:ts egna e-post och telefon ersätts av profilens.
- Ett rollfynd på Analys öppnar arbetsläget i Erfarenhet på första jobbet, inte på rollen (adressen har inget jobbindex).
- `klicktest-helskarm-sidor.ts`: kontrollen "arken åtskilda" är röd också på main.
- Hydreringsvarningen på `<html>` (rotlayouten) syns på alla inloggade sidor, också testernas.

### Att driftsätta utöver webbappen

Inga migreringar. Edge-funktionerna som grenen ändrat (alla tar med `_shared/pii.ts`), efter att webbappen är ute (den klarar både gamla och nya analysen): 1. `analyze-cv-background` (lagrad struktur, `[antal]`, inga tal, maskering), 2. `optimize-linkedin` och 3. `parse-cv-for-matching` (maskeringen). Provkörning och loggar: `docs/bygg-noter-cv-analys-poang.md`.

### Hur steg 5 backas

Varje rättelse är en egen commit (tabellen ovan) och går att backa med `git revert`. Sammanslagningarna med main backas med `git revert -m 1 073be47f` respektive `04ac57c0`.

## Efterrättningar 2026-11-21

| Commit | Rättning | Backas |
|---|---|---|
| `eaf406f9` | B: perioder med "till", "till och med", "t.o.m.", "to"/"until" och tankstreck delas (`delaPeriod`, `startOchSlut`, `medDeladPeriod` i `poang/matt.ts`), i `normalizeStructuredData` (arket, PDF, Word) och `kanonisktCv` (poängen). Hela perioden i startdatumet utan slut delas också. Kalibreringens tal oförändrade, `POANG_VERSION` 1 | `git revert eaf406f9` |
| `60591d3d` | C: prompttext i `analyze-cv-background` (tal som finns byts aldrig mot `[antal]`, svenska facktermer, stavning). Inte driftsatt | `git revert 60591d3d` (och driftsätt den gamla) |
| `1aa7071d` | A: `[antal]` kvar i CV:t. `poang/siffror.ts` (`platshallareKvar`, `plusForSiffror`), Ditt CV:s läge `siffror`, Analys-fyndet Dina siffror, raden och arket vid nedladdning (`rum3/SiffrorKvar.tsx`) på Mallar och i arbetsläget | `git revert deb83978 1aa7071d` (D använder siffror.ts) |
| `deb83978` | D: `antalFynd` (`poang/fynd.ts`) och `fyndAntal` i `analysForKlient`; flödets "Vi hittade ..." räknar alla fynd som sidan | `git revert deb83978` |

Kontroll: tsc rent, vitest 313 filer, 4032 gröna, 13 överhoppade; `test:ats` grön. Verifierat i Chrome mot lokal server (två testkonton, raderade): Ditt CV, Analys och Mallar med två rader `[antal]` (91 i dag, +3), arbetsläget via Fyll i siffrorna två gånger (profil, sedan erfarenhet), därefter 94 på Analys och inga påminnelser på någon flik utan omladdning. "2017 till 2019" ritas 2017 – 2019 på arket.

Medvetet orört: Ditt CV:s mätare Läsbarheten säger fortfarande "Inget drar ner just nu" när bara siffrorna återstår (uppdraget: övriga delar av sidan lämnas som de är).


## Genomgången del för del och poängmodellen version 2 (2026-11-21)

Ägarens fråga: poängen stod på 80, "Inget drar ner just nu" och "Ingen ökning med förslagen", och det gick inte att se vad som fattades till 100. Orsaken var att sidan bara visade fynd med ett förslag, och att kontaktuppgifterna lästes ur strukturen fast arket fyller dem ur profilen.

| Commit | Ändring | Backas |
|---|---|---|
| `26014dca` | Poängmodellen version 2 (`POANG_VERSION = 2`): kontaktuppgifterna som arket visar dem (`poang/kontakt.ts`, `kontaktPaArket` delas med `forberedInloggatCv`), på Ditt CV, Mallar, Analys, analysjobbets svar, sparandet, snabbpoängen och `server.ts`. Personbeskrivning lagom från 30 ord, CV:t från 150, datumformat per grupp, titlar med bindestreck och korta titlar, samtidiga roller, "sex" och tio verb. Ny ren funktion `genomgang()` med tester (`version2.test.ts`) | `git revert 26014dca` (kräver att de två nedan backas först) |
| `67407c9d` | Analys: väggen ("{kvar} poäng kvar till 100", en knapp per läge), genomgången med sju delar som fälls ut, förslagen i sin del (låsta för gratis som förut), arket med markeringarna 1 till 6, kortet Vägen till 100, introt i tre steg, en ny analys landar i genomgången (`onAnalysisDone`, nyckel på `AnalysVy`). Ditt CV pekar på genomgången under 100; målgångens rubrik säger inte längre att CV:t är klart | `git revert 67407c9d` |
| `54fbf59b` | Rättat efter skärmdumparna: CV:ts namn inom citattecken, statusradens "Och en till.", raden Våra förslag döljs vid noll, förslagshuvudet på telefon | `git revert 54fbf59b` |
| (denna) | Dokumentation: `docs/poangmodell-cv-analys.md` version 2 och de här noterna | `git revert` av docs-commiten |

Backa allt: `git revert 54fbf59b 67407c9d 26014dca` (i den ordningen). Inga migreringar, ingen edge-funktion ändrad.

Ägarens CV (ff9f12e1): version 1 gav 80, version 2 ger 92 (kontakt 10, personbeskrivning 15, erfarenhet 33, kompetenser 12, utbildning 8, språk 0, datum och längd 14).

Kontroll: tsc rent; vitest `src/lib/cv src/lib/profile src/lib/rum src/app/dashboard` 40 filer, 898 gröna (därav `src/lib/cv/poang` och `src/app/dashboard/cv-analys` 11 filer, 141 gröna). Chrome mot lokal server med fyra egna testkonton (raderade efteråt, räknat per user_id): Analys med förslag (Premium), gratis med låsta förslag, utan förslag under 100, Språk utfälld, introt, Ditt CV med poäng kvar, 1440 och 412, inga sidledsrullningar, inga tryckytor under 44 px. En riktig analys från introt landade i genomgången efter 28 s.

Kända brister:
- Arbetsläget kan inte öppnas på en viss roll; "Öppna i CV:t" går till avsnittet.
- Ditt CV:s mätare Innehållet sa "Alla avsnitt finns" för ett CV utan språknyckel (CV-byggaren), medan genomgången räknade Språk som saknat. Rättat i `acc5a690`: Innehållet räknar språk som genomgången.
- Hydreringsvarningen om cookie-bannern (`jc-samtycke`) syns i utvecklingsläget på alla inloggade sidor, som förut.

Efter genomgången:

| Commit | Ändring | Backas |
|---|---|---|
| `acc5a690` | Ditt CV utan bubbla vid samma tal, Innehållet räknar språk som genomgången, markören på nedladdning, ingen dubbel Öppna i CV:t | `git revert acc5a690` |
| (denna) | Inlästa roller ritas och räknas på personens egna meningar: `rollensRader` i `poang/matt.ts` används av `normalizeStructuredData`, `kanonisktCv` och LinkedIn-autofyllet; nyckelord vinner inte längre över en rik beskrivning. Inläsningens prompt ber om rollens punkter eller meningar ordagrant i `responsibilities`, svarsgränsen höjd från 2600 till 4000 token så att längre svar inte kapas. Regeln i `docs/poangmodell-cv-analys.md`, tester i `rollens-rader.test.ts` | `git revert` av commiten |
