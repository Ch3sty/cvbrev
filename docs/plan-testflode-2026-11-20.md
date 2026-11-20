# Testflödet: enad plan

Datum: 2026-11-20. Jämkad av saas-lead ur tre förslag: `docs/design/testflode-forslag-ux-2026-11-20.md` (UX-designern), `docs/design/testflode-forslag-art-director-2026-11-20.md` (art director) och `docs/design/testflode-forslag-saas-lead-2026-11-20.md` (saas-lead), på underlaget `docs/rapporter/testflode-inventering-2026-11-19.md`. Fakta i planen är kontrollerade mot koden på main 2026-11-20 (`src/lib/nivakoll/motor.server.ts`, `src/lib/tester/v4/rutter.ts`, `src/lib/quota/quotaService.ts`, `src/lib/traning/gratisniva.ts`, bankerna i `src/lib/talserierV1`, `spatialV1`, `ordforradV1`, tokens i `src/app/globals.css`) och mot Supabase samma dag.

**Ägarens mandat (2026-11-20):** gruppen enas, det enade byggs på Duolingo-nivå, allt körs i ett svep i etapper som pushas en i taget till main, var och en klicktestad och möjlig att backa. Om tiden räcker: Nivåkoll för alla testtyper och betalväggar där de passar, med minst samma konvertering som i dag. Inga prisändringar. Policy, datalagring och villkor rörs inte. Black Week (99 kr 23 till 29 nov, 49 kr 30 nov) får inte gå sönder. Ingen artefakt före bygge. Ägaren tar inga beslut nu.

**Avgörandeprincip:** UX-designern har sista ordet om interaktion och layout, art director om det visuella, saas-lead om affär och risk. Korsar en fråga gränserna väljs det som bäst tjänar en vuxen jobbsökare som förbereder sig för ett riktigt rekryteringstest.

---

## Sammanfattning: vad ändras för användaren

I dag möter användaren tre skal, fyra svarsmodeller, fyra klockor och fem resultatdesigner, och samma test ser olika ut beroende på vilken dörr hon tar. Efter planen finns **en sessionsram** för alla femton flöden och åtta testtyper:

- **Samma skärm överallt.** X till vänster, typens namn och läget i mitten, räknaren "3 / 15" och klockringen till höger, en framstegsstapel under huvudet, uppgiften i mitten, en primärknapp i foten. Sidomenyn, bottennavigeringen och bannrarna är borta under sessionen, också på dator.
- **Samma gest överallt.** Tryck markerar, knappen bekräftar. Svaret går att ändra tills man trycker Nästa. Ingen uppgift går vidare av sig själv (undantag: personlighetstestet, som saknar rätt svar).
- **Svaren syns alltid utan att scrolla**, på dator 1400×900 och på Pixel 7. Texten, tabellen eller villkoren står fast överst med egen scroll; uppgiften och svaren står under.
- **En startskärm i alla lägen** som säger exakt antal uppgifter och tid ur config, tre regler och en knapp. Sessionen skapas först när man trycker Starta. En påbörjad session kan fortsättas.
- **En klocka, ringen.** Den räknar ned i test och prov, fylls per uppgift mot provets tid i Träna, och saknas i Nivåkollen. I nivåtest stoppar den ingen; i övningsprov och I-provet lämnas provet in när den når noll, som i dag.
- **Rätt är grönt, fel är rött, koppar är handling.** Förklaringen efter varje svar i Träna ligger under svaren med regeln och misstaget. I alla andra lägen är det tyst tills resultatet.
- **En resultatskärm** med ett huvudtal, två tal, genomgång (alltid, även efter Nivåkollen), var du tappade, tempo och nästa steg.
- **Ett ord per sak.** Uppgift, inte fråga. Figurer och mönster, inte Logiktest. Grundnivå, inte grund. Nästa, Svara, Lämna in, Visa resultatet.
- **Nivåkollen för alla åtta typer**, med antal och tid som stämmer per typ.
- **Betalväggen bor på startskärmen, resultatsidan och i Tester-menyn**, aldrig mitt i en session, och visar kampanjpriset under Black Week.

---

## Beslut

Varje skiljelinje, beslutet, vem som avgjorde och en rad motivering.

| # | Skiljelinje | Beslut | Avgjorde | Motivering |
|---|---|---|---|---|
| 1a | Klockans form | **En ring** i huvudets högra hörn, 36 px mobil och 40 px dator. Den 4 px tidslinjen med "provets tid" försvinner som synligt element. Tre lägen: gräns (räknar ned, test och prov), referens (fylls per uppgift mot provets tid, utan siffra, ink-2, står full utan följd; Träna), ingen (Nivåkollen, personlighet). | Art director (form), saas-lead (läge per läge) | En klockform att lära. Nivåkollen mäter och ska inte ha synlig tidspress så att nivåerna blir jämförbara mellan typer; tempot sparas och visas i resultatet som i dag. Träna behåller referensen eftersom tempo mot provets tid är en del av träningen och ett säljargument. |
| 1b | Nedräkning med automatisk inlämning i nivåtest | **Mjuk gräns.** Ringen räknar ned från startsidans tid (verbalt 20 min, inte 25). Vid noll byter ringen till koppar och visar tiden över ("+1:23"), testet fortsätter, resultatet säger "2 min över provets tid". Startskärmens regel säger det rakt ut. Övningsprov och I-provet behåller hård gräns med automatisk inlämning. | saas-lead | Nivåtestet är gratisnivåns enda dagliga test och "göra ett helt test i lugn och ro"; numeriskt grund har snitt 23 min mot utlovade 20, så automatisk inlämning skulle kapa en stor del av dem som i dag slutför. Provets villkor finns i övningsprovet. Tempostatistik och `timeSpent` är oförändrade. |
| 2 | Framsteg | **Både räknare och stapel.** Räknaren "3 / 15" i huvudet (13 px tabular, 44 px träffyta) öppnar uppgiftsarket i lägen där man får gå tillbaka, och är då försedd med chevron. Framstegsstapeln 6 px direkt under huvudet, koppar på kant, alltid kontinuerlig, aldrig klickbar. "✓ 0 / 15" försvinner. Rutnätet och segmentstapeln i frågeytan försvinner till förmån för arket. | UX-designern (räknare och ark är interaktion), art director (stapelns mått och färg) | Talet säger var man är utan att läsas som antal rätt när bocken är borta; stapeln bär positionen visuellt. En väg in i arket, inte två. |
| 3 | Träna-inställningen | **En kryssruta på Träna-startskärmen**: "Förklaring efter varje svar" (på som standard). Sparas per konto, gäller alla typer, visas aldrig under sessionen och finns inte i något annat läge. Träna har samma gest som testerna: tryck markerar, knappen bekräftar. | UX-designern, ändrat efter samråd med ägaren 2026-11-20 | Kryssrutan "Ett tryck räcker som svar" stryks: namnet gick inte att förstå utan förklaring, och ombyggets poäng är ett enda sätt att svara överallt. |
| 4 | "Vet inte" | **Bara i Träna**, i fotens vänsterplats ("Vet inte, visa förklaringen"). Nivåkollen får ingen "Vet inte" (tas bort ur de fyra som har den i dag) och inget hopp: Nästa är inaktiv tills ett svar är valt, som i alla fem Nivåkoller i dag. | saas-lead | Tre profiler, en regel var: mäta kräver svar, testa får hoppa, träna får be om förklaringen. Riktiga test har ingen "Vet inte", nivåerna ska vara jämförbara mellan typer och matrisens kalibrering ska inte rubbas. |
| 5 | Startskärm även i Träna | **Ja**, kort variant: eyebrow, rubrik, en formatrad ur config, kryssrutan, en knapp. Som skärm i samma mall, inte som ark ovanpå en redan skapad session. | Alla tre eniga; UX-designern om formen | Utan startskärm finns ingen plats för reglerna, "Fortsätt där du var" eller betalväggen, och sessionen får inte skapas förrän Starta trycks. |
| 6 | Verbalt ett påstående i taget även i nivåtest | **Ja.** Texten fäst överst med egen scroll (mobil) eller i egen kolumn (dator), ett påstående i taget under. Räknaren räknar påståenden ("6 / 40"), arket grupperar dem per text. | UX-designern och art director eniga, saas-lead utan invändning | Det enda formatet som får plats på mobil med texten synlig; Nivåkollen, Träna och övningsprovet gör redan så. Verbalt nivåtest slutförs i dag till 63 % och första påståendet syns aldrig på mobil. |
| 7 | Nivåkollens antal och löftet "Tolv uppgifter, cirka åtta minuter" | **Antal per typ som i dag**, inga ändringar i motorerna: matris 12, figurserier 9, deduktivt 6, verbalt 8, numeriskt 8. De tre nya: talserier 9, spatial 9, ordförråd 12. Texten räknas alltid ur config: antal gånger provets tid per uppgift, avrundat till hela minuter, med "cirka". Konstanten `NIVAKOLL_ANTAL = 12` i `src/lib/tester/v4/niva-lage.ts` och `hamta.server.ts` blir per typ. | saas-lead | Att förlänga deduktivt eller numeriskt till tolv ger 15 minuters Nivåkoll och fler avbrott (Nivåkollen slutförs till 70 %). Sanningskravet uppfylls av att texten räknas, inte av att alla typer tvingas till samma antal. |
| 8 | Etappordning | **Ramen byggs först på en typ i alla lägen (figurserier), sedan de typer där förlusten är mätt (Ord och text, Siffror och tabeller), sedan resten, matris sist med vaktpunkt.** Städning, Nivåkoll för tre typer och betalväggsöversyn sist. | saas-lead, med art directors och UX-designerns argument för piloten | Figurseriernas Träna är dagens bästa session och figurserier har alla fyra lägen, så piloten bevisar "samma test ser lika ut oavsett dörr" med minst risk. Därefter går det största mätta tappet (numeriskt 33 %, verbalt 63 %) live före allt annat. |
| 9 | Färg för rätt och fel | **Rätt är `positiv`, fel är `fel`**, bara på det valda kortet, bara efter facit, bara i Träna och i genomgången. Koppar har två roller i sessionen: handlingen (knappen) och framsteget (stapeln, ringen på slutet). Resultatväggen är aldrig röd. | Art director | Tre betydelser behöver tre färger. I dag har facit och knapp samma kulör. Tokens finns i båda skärmlägena. |

### Övriga beslut som korsade gränserna

| Fråga | Beslut | Avgjorde |
|---|---|---|
| Sidomenyn under sessionen på dator | Borta. Ramen är `fixed inset-0` utan `lg:left-[248px]`. | Alla tre eniga |
| Svarsgesten | Tryck markerar, knappen bekräftar, i alla lägen och typer. Auto-nästa försvinner (150 ms i matris, figurserier, talserier, spatial, ordförråd, 180 ms i I-provet). Enda undantaget är personlighetstestet: ett tryck går vidare efter 250 ms, ‹ finns alltid. | Alla tre eniga, UX-designern om undantaget |
| Var förklaringen i Träna ligger | Under svaren, i frågeytan, scrollad fram så att nederkanten står 12 px över foten (dagens `Regelpanel`-mönster i matrisens Träna). Inte som ett ark från foten. Fotens knapp byter till "Nästa". Art director ger panelen färg efter utfall. | UX-designern (layout), art director (utseende) |
| Tre fasta svar i verbalt | Tre lika breda knappar på en rad, 52 px, "Går inte att avgöra" får brytas på två rader inne i knappen. | UX-designern |
| Hörnradier | 12 px (`rounded-xl`) på alla kort, matrisytan och panelen. Designsystemet säger `rounded-xl` max, så förslagens 14 och 16 utgår. | Designsystemet |
| Huvud och fot | Huvud 56 px i alla lägen och på alla enheter. Fot 72 px plus safe area: `KNAPP_PRIMAR` 48 px med 12 px över och under, en sanning i `--flow-footer-h`. | UX-designern (mått), designsystemet (knapphöjden) |
| Maskot | Ingen. Det levande kommer från scenerna (en per typ), märkena vid första klarade nivå och avslöjandet på resultatväggen. Pedro stannar i sociala kanaler. | Art director |
| Reglaget "Förklarande text av" och svårighetsprickarna i matrisens nivåtest | Bort. | UX-designern och art director eniga |
| Expert verbalt och numeriskt (låsta, linjära, 0 av 9 slutförda) | Samma regler som övriga nivåtest i ramen. | saas-lead |
| Legacy-sluggarna `*-prov` | 301 till `/dashboard/tester/ovningsprov/<typ>` i etapp 0, komponenterna raderas i städningen. | saas-lead |
| Backning per etapp | **Ingen körtidsflagga.** Varje etapp är en sammanhängande commitserie på main; backning är `git revert` av serien. Gamla komponenter står kvar i trädet till och med etapp 4 och raderas i etapp 5, så att en revert aldrig saknar kod. | saas-lead |
| Lagring av Träna-inställningen | Ny nullbar kolumn `profiles.test_installningar` (jsonb: `forklaring_efter_svar`), skrivs bara av `/api/traning/installningar`. Migrering körs under ägarens stående ja. Ingen personuppgift, policytext orörd. | saas-lead |

Motivering för flaggbeslutet: en ändrad miljövariabel i Vercel kräver en ny deploy precis som en revert, så flaggan vinner ingen tid, och två renderare per typ fördröjer bygget och ger dubbel sanning. Ägaren godtog uttryckligen att flaggan utgår om den fördröjer.

---

## 1. Sessionsramen

Internt namn `SessionsRam` (`src/components/session/SessionsRam.tsx`), byggd ur `PassShell`. Ersätter `TestFlowShell`, `PassShell`, det inbyggda skalet i `OvningsprovFlode` och i `IprovFlode`.

```
+----------------------------------------------------------+
| [X]  Figurer och mönster                  3 / 15   (o)   |  huvud 56 px, papper
|      Nivåtest, grundnivå                                  |
|■■■■■■■■■■■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□|  framstegsstapel 6 px
+----------------------------------------------------------+
|                                                          |
|  [underlag, om typen har ett]                            |  main, enda scrollytan, golv
|  [uppgift]                                               |
|  [svar]                                                  |
|  [Förklaringen, bara i Träna efter svar]                 |
+----------------------------------------------------------+
| [‹ eller Vet inte]  [          Nästa                   ] |  fot 72 px + safe area, papper
+----------------------------------------------------------+
```

**Lagret.** `fixed inset-0 z-50` i alla lägen och på alla enheter. `data-flow-active` sätts som i dag så att dörrnavet, bottennavigeringen, e-postbannern, kakbannern och installationsraden hålls undan (`useFriSikt`). Höjden är `h-dvh` med låst body (lärdomen från 2026-09-14).

**Huvud 56 px, papper.** X 44×44 till vänster (`IkonX` ur `RumSymboler`, `aria-label` "Avbryt"). Titel 15/20 600 `ink-1` = typens namn som i Tester. Undertitel 12/16 500 `ink-3` = läget och nivån ("Nivåtest, grundnivå", "Träna, grundnivå", "Nivåkollen", "Övningsprov, samma format som Matrigma", "Deltest 2 av 6, pappersvikning"). Båda `truncate`. Till höger räknaren "3 / 15" 13 px tabular i en 44 px hög knapp (tryckbar med chevron bara där man får gå tillbaka), sedan ringen 36 px (40 på dator) i lägen med klocka. På 412 px ryms titlar upp till 230 px.

**Framstegsstapeln 6 px.** Direkt under huvudet, hela ramens bredd, `bg-kant` med kopparfyllning, `scaleX` 240 ms. Kontinuerlig i alla lägen. Växer när nästa uppgift ritas i test och vid bekräftat svar i Träna. `aria-label` "Uppgift 3 av 15".

**Main.** Enda scrollytan, `overscroll-contain`, golvets kulör (`bg-golv`). Scrollas till toppen vid ny uppgift, men inte när underlaget är samma (flera uppgifter per text eller tabell). `padding-bottom: var(--flow-footer-h)` så att Förklaringen alltid kan scrollas fram.

**Fot 72 px + safe area, papper, `border-t border-kant`.** En rad, aldrig två. Vänsterplatsen: ‹ 48×48 (`IkonTillbaka`, aria "Föregående uppgift") i lägen med väg tillbaka, textknappen "Vet inte, visa förklaringen" 44 px hög i Träna ("Vet inte" när "Förklaring efter varje svar" är av; tom så snart uppgiften är besvarad), annars tom. Höger: `KNAPP_PRIMAR` `flex-1`. `flex-shrink-0` i kolumnen, aldrig `position: fixed` (iOS-tangentbordet). Knappen byter text utan att byta bredd. Vid sparande visar knappen en 16 px spinner inne i texten.

**Ramens spalt.** Huvudets och fotens innehåll följer innehållsformens kolumn (avsnitt 3) och står på samma pixel från uppgift 1 genom genomgången till resultatet i samma session. Framstegsstapeln går alltid över hela ramens bredd, aldrig bara kolumnen. Mobil: full bredd med 16 px marginal.

**Avbryt-dialogen.** X öppnar alltid samma `ConfirmDialog` (utom på resultatskärmen där X bara stänger). Rubrik "Avbryta nivåtestet?" (ordet byts per läge), en rad med konsekvensen, primärknapp "Fortsätt", textlänk "Avbryt". Esc stänger dialogen, inte sessionen. Konsekvensrader: nivåtest "Dina svar sparas. Du kan fortsätta från startsidan.", Nivåkollen "Du kan fortsätta senare i dag.", Träna "Svaren hittills sparas.", övningsprov och I-provet "Avbryter du sparas inget resultat."

**Lämna in-dialogen.** Sista uppgiften i testlägen: "Lämna in?" med raden "3 uppgifter är obesvarade och räknas som fel." eller "Alla uppgifter är besvarade.", primärknapp "Lämna in", textlänk "Fortsätt".

**Tangentbord, alla lägen och typer.** A till F eller 1 till 6 markerar alternativ (S, F, G för Sant, Falskt, Går inte att avgöra), Enter trycker på primärknappen, Backsteg eller vänsterpil går till föregående där det är tillåtet, Esc öppnar avbryt-dialogen. Med `gest: 'ett_tryck'` är bokstaven eller siffran svaret, precis som ett tryck. Lyssnaren är av när en dialog eller arket är öppet. Fokus flyttas till uppgiftens rubrik vid ny uppgift (`tabIndex -1`, ingen synlig ring).

**Skärmläsare.** Räknaren `aria-live="polite"` ("Uppgift 3 av 15"), ringen `role="timer" aria-live="off"`, Förklaringen `role="status"`, alternativen `role="radiogroup"` med `aria-checked`.

**Fel och laddning.** Samma `Meddelande`-kort som `FigurPassFlode` använder (sparfel med "Försök igen", startfel). Laddskelettet har exakt den färdiga layoutens höjder så att CLS är 0. Startskärmen och första uppgiften renderas på servern; skelett bara om data saknas.

**Sparande.** Testlägen: optimistisk nästa, svaret skickas i bakgrunden med kö och omförsök (`useRobustAnswerSaving`-mönstret, i dag bara i legacy-proven). Misslyckas sparningen efter omförsöken visas en rad "Ett svar sparades inte" med "Försök igen" ovanför foten, aldrig ett blockerande fel mitt i tiden. Träna, där servern rättar: knappen visar spinnern, högst 250 ms innan Förklaringens skelett ritas. Adaptiva lägen (matrisens Nivåkoll och Träna) väntar på serverns nästa uppgift på samma sätt. Inga routes, tabellformat eller POST-kroppar ändras; kontrakttest per motor snapshotar kroppen före och efter.

**Uppgiftsarket** (ersätter rutnätet och segmentstapeln). Öppnas från räknaren: ark nedifrån på mobil (max 70 vh), popover under räknaren på dator (360 px). Rubrik "Uppgifter", rad "9 av 15 besvarade". Celler 44×44, radie 12, 8 px mellan, fem per rad på mobil och åtta på dator. Besvarad: `ton` med `ton-ink`-siffra. Aktuell: 2 px ink-kant. Passerad obesvarad: kopparkant. Kvar: `kant`. Tryck stänger arket och visar uppgiften. Verbalt grupperar per text med textens rubrik som mellanrubrik. Finns bara i lägen med väg tillbaka.

**Testklar.** Ramen vet inte om den står i appen. Snitt via `var(--font-sess-display)` och `var(--font-sess-text)` (webben: Schibsted Grotesk och Inter; `[data-mobilapp]` sätter Bricolage Grotesque och Figtree). Appen mappar `--a-bg`, `--a-papper`, `--kop` till `--golv`, `--papper`, `--koppar` på sin rot. Webbens knapp gäller i sessionen också i appen så att foten är identisk. Android-tillbaka gör samma sak som X (finns). Haptik (`impact light`) vid rätt och fel i Träna bara i appen, aldrig ljud.

---

## 2. Lägesregler

Lägena skiljer sig i fem flaggor som ramen läser: `aterkoppling: 'direkt' | 'efter'`, `navigering: 'fri' | 'linjar'`, `tid: 'ingen' | 'referens' | 'mjuk' | 'hard'`, `hopp: 'nej' | 'ja' | 'vet_inte'`, `gest: 'bekrafta' | 'ett_tryck'`. `gest` är `bekrafta` i alla lägen, Träna inräknat, utom personlighet (`ett_tryck`). Ingen annan komponent fattar egna beslut om dem. (UX-designern: tillagd flagga, så att gesten inte avgörs per typ.)

| | Nivåkollen | Nivåtest (grund, avancerad, expert) | Träna | Övningsprov | I-provet | Personlighet |
|---|---|---|---|---|---|---|
| Startskärm | Kort | Startsidan `TestHubPage` med startarket ovanför korten "Ditt bästa" och "Dina försök" | Kort, med kryssrutan | Dagens `Startark` | Dagens start plus mellanskärm per deltest i kort mall | Kort |
| Klocka | Ingen | Ring, mjuk gräns, nedräkning från config | Ring, referens per uppgift | Ring, hård gräns, total eller per uppgift enligt format | Ring, hård gräns per deltest | Ingen |
| Räknare | "3 / 9", inte tryckbar | "3 / 15", tryckbar, öppnar arket | "3 / 6", inte tryckbar | "3 / 18", tryckbar i fasta format, inte i adaptiva | "3 / 6" tryckbar inom deltestet; "Deltest 2 av 6" i undertiteln | "12 / 50", tryckbar |
| Svar | Välj + Nästa | Välj + Nästa | Välj + Svara, Förklaringen, Nästa (standard); se kombinationerna i 5.1 | Välj + Nästa | Välj + Nästa | Ett tryck går vidare efter 250 ms |
| Ändra före Nästa | Ja | Ja | Ja | Ja | Ja | Ja (gå tillbaka) |
| Gå tillbaka | Nej | Ja (‹ och arket) | Nej | Fasta format ja, adaptiva nej | Inom deltestet ja, mellan nej | Ja |
| Hoppa över | Nej, Nästa inaktiv tills val | Ja, Nästa utan val lämnar obesvarad (markeras i arket) | Nej, "Vet inte" i stället | Ja | Ja | Nej |
| Vet inte | Nej | Nej | Ja, i foten | Nej | Nej | Nej |
| Återkoppling | Efteråt | Efteråt | Direkt (standard) eller efteråt | Efteråt | Efteråt | Profil efteråt |
| Sista knappen | "Visa resultatet" | "Lämna in" + dialog | "Visa resultatet" | "Lämna in" + dialog | "Avsluta deltestet" + dialog; sist "Lämna in" + dialog | "Lämna in" + dialog, aktiv först när allt är besvarat |
| X | "Avbryta Nivåkollen?" | "Avbryta nivåtestet?" | "Avbryta träningen?" | "Avbryta övningsprovet?" | "Avbryta övningsprovet?" | "Avbryta testet?" |
| Vem | Gratis en gång per typ, ommätning i Premium (`GRATISNIVA`) | Grund: ett om dagen över alla typer (`GRUND_KVOT_TEST_TYPER`), avancerad och expert i Premium | Premium (dag 0-grundträningen gratis som i dag) | Premium | Premium | Som i dag |

Lägesregler i detalj:

- **Nivåkollen.** Sessionen skapas när Starta trycks; första uppgiften kommer i samma svar. Öppnas den igen samma dag visas dagens resultatskärm med raden "Du gjorde Nivåkollen i dag. Nästa kan du göra i morgon." Matrisens "Gör Nivåkollen först"-lås på Träna står kvar som regel men ritas som startskärmens variant med knappen "Gör Nivåkollen".
- **Nivåtest.** Finns en session utan `completed_at` från senaste dygnet visar startarket "Fortsätt testet" med raden "Du har 9 uppgifter kvar." i stället för ny start; den läser samma `GET` som rehydreringen redan har. Tiden räknas från serverns `started_at`. I lägen med `navigering: 'fri'` kan ett redan bekräftat svar ändras genom att gå tillbaka; det nya svaret skickas på samma route med samma kropp som i dag (rutnätet tillåter redan det). Verbalt 20 minuter ur config, en källa. Bort: "Förklarande text av", "Svårighet ●●●", "Fråga 1 av 20 · Lätt", "✓ 0 / 15".
- **Träna.** Kryssrutans två lägen i 5.1. Ingen väg tillbaka. Talseriens Träna byter inte längre hela vyn mot en genomgång; Förklaringen kommer under svaren som för alla andra.
- **Övningsprov.** Formatvalet (Matrigma, Alva, Vårt format) görs i Plan inför provet som i dag och visas på startarket. Lämna in och X får dialog (saknas i dag). `useExamDeadline` orörd.
- **I-provet.** Mellanskärmen per deltest i startskärmens korta mall: eyebrow "DELTEST 2 AV 6", rubrik "Pappersvikning", formatrad "6 uppgifter på högst 5 minuter.", knapp "Starta deltestet".
- **Personlighet.** Likert som fem Svarskort-rader (mobil) eller fem lika breda på en rad (dator), designsystemets färger, ingen gradient, ingen framer-motion. Egen modal ersätts av den gemensamma dialogen. Översikten med 67×15 px knappar ersätts av arket. Foten har ‹ och "Nästa"; "Nästa" är inaktiv tills påståendet är besvarat och används bara som väg framåt efter att man gått tillbaka. På sista påståendet "Lämna in".

---

## 3. Layout per innehållsform

Regel: på dator 1400×900 och mobil 412×915 ska alla svarsalternativ synas utan scroll i utgångsläget. Utrymmet är 900 − 56 − 6 − 72 = 766 px på dator och 915 − 134 = 781 px på mobil (räkna med 745 på iPhone med safe area). Mobilkolumnen är 380 px bred.

| Innehållsform | Dator (ram och innehåll) | Mobil | Används av |
|---|---|---|---|
| Smal | 432 px | fluid | Figurer och mönster, spatial, talserier, ordförråd |
| Mellan | 560 px | fluid | Personlighet, I-provets ordtester |
| Remsa | 672 px | fluid, två remsor om tre | Figurserier |
| Bred | 1000 px, två spalter: underlag vänster 560, uppgift och svar höger 400, mellanrum 40 | fluid, underlag fäst överst med egen scroll | Deduktiv slutledning, Siffror och tabeller, Ord och text (alla nivåer, även expert) |

### 3.1 Gemensamma svarskomponenter (`Svarskort`)

- **Rad** (text, tal, påstående): min-höjd 52 px, radie 12, `papper` med 1 px `kant`, bricka 24 px rund till vänster (12/16 700), text 16/22 500 `ink-1`, 14 px inre marginal, 8 px mellan rader.
- **Ruta** (figur): kvadrat eller 4:3, min 96 px, radie 12, bricka 24 px uppe till vänster, figuren centrerad med 12 px marginal, 10 px mellan rutor.
- **Tre fasta svar** (Sant, Falskt, Går inte att avgöra): tre lika breda knappar 52 px på en rad, 8 px mellan, text 14/600, alltid en rad även på 360 px. De är Svarskort utan bricka: samma kant, yta och tillstånd (vald, rätt, fel, dämpad) som raderna, bocken och krysset ritas 16 px före texten i stället för på en bricka.
- **Tillstånd:** se färgrollerna i 7.2. Tvåpixelkanten ritas som `box-shadow: inset 0 0 0 1px` ovanpå 1 px `border`, så ingenting flyttar (CLS 0). Brickan bär bokstaven, bokstaven i vitt på bläck när valt, bock när rätt, kryss när fel; den flyttas aldrig och byter aldrig storlek.
- **Hover, fokus, aktiv:** hover `kant-stark`, fokus 2 px `--fokus`-ring med 2 px offset, tryck `scale(.985)` 90 ms. Alla träffytor minst 44×44.

### 3.2 Bildmatris (Figurer och mönster)

Mobil: matris 264×264 (3 × 88 px) centrerad, radie 12, `papper`, `.matrisyta`-reglerna. Under: uppgiftsraden "Vilken figur passar i den tomma rutan?" (`.text-fraga`), sex rutor 3×2 à 121×96. Totalt cirka 510 px, ryms. Dator (Smal 432): matris 336×336, sex rutor 3×2 à 133×104, cirka 600 px, ryms. Samma lodräta ordning på båda. I Träna fylls luckan efter facit med figuren i `ink-1` och 2 px `positiv`-ram.

### 3.3 Figurserie och spatial figur

Figurserie, mobil: serien som två remsor om tre à 121×100 i en ram, sex rutor 3×2 à 121×96, cirka 450 px. Dator (Remsa 672): serien som en remsa med sex rutor à 104, svaren på en rad à 104, cirka 260 px. Bryter-uppgiften: de sex rutorna i serien är själva svaren, etikett "Vilken figur bryter mönstret?" ovanför. Spatial: figurkortet överst som underlagsslot (figuren 160 px bred till vänster, eyebrow och uppgiftstext till höger), fyra rutor 2×2 à 186×150 på mobil, fyra på rad på dator. Spatial och figurserie går över till `.matrisyta`-reglerna (ink, papper, kant-stark), i dag fasta färger.

### 3.4 Text med villkor (Deduktiv slutledning)

`DeduktivLayout` behålls (Bred). Mobil: villkorskortet fäst överst `max-h-[42vh]` med egen scroll, `max-h-[38vh]` när uppgiften har fem alternativ (ramen räknar). Kortet heter alltid "Villkor". Hjälpraden "Utgå bara från det som står." står på startskärmen, inte ovanför varje uppgift. Fem rader à 52 = 292 px.

### 3.5 Lång text med påståenden (Ord och text)

`VnUppgift` är mallen: texten i en ram fäst överst, `max-h-[42vh]` på mobil, egen kolumn på dator (Bred: texten vänster 560, påståendet och svaren höger 400). Ett påstående i taget med eyebrow "PÅSTÅENDE 2 AV 4 OM TEXTEN", påståendet 17/600, tre knappar 52 px. Ämnet kvar som eyebrow, svårigheten bort. Verbalt expert (rader A till D): samma form med rader i stället för de tre knapparna.

### 3.6 Tabell och diagram (Siffror och tabeller)

Dator (Bred): underlaget vänster 560 med egen scroll, uppgiften och fyra rader höger 400; svaren står på y ≈ 200, inte 845. Mobil: underlaget fäst överst `max-h-[44vh]` med egen scroll (tabellen scrollar i sidled i sin ram), uppgiften 17/600 och fyra rader 52 px under, cirka 707 px, ryms. Diagrammets höjd låses till 240 px i underlaget; hela diagrammet finns i genomgången. Diagrammen ritas i `diagram-test` med fyra ljushetssteg (100, 75, 55, 40 procent) och `ink-3` för axlar, aldrig åtta kulörer och aldrig hårdkodad orange. Flera uppgifter per underlag: underlaget står kvar, bara uppgiften och svaren byts.

### 3.7 Talserie och ordförråd

Talserie: talraden i en ram överst (sex rutor 56×48 med "?" sist, 24/28 700 tabular display), eyebrow "VILKET TAL KOMMER HÄRNÄST?", fem rader 52 px, cirka 400 px. Ordförråd: ordkortet överst (eyebrow "MOTSATSORD" eller "SYNONYM", ordet 32/36 800 versaler display, hjälpraden), fyra till fem rader, cirka 380 px.

---

## 4. Start- och resultatskärm

### 4.1 Startskärmen (`Startskarm`, byggd ur övningsprovets `Startark`)

Den enda plats där sessionen skapas, serverrenderad med initialdata. Uppifrån:

1. Topprad på väggen med `IkonTillbaka` och lägets namn.
2. Eyebrow i koppar-ljus: typens namn.
3. Rubrik `.text-h1`: lägets rubrik ("Nivåkollen i figurserier", "Figurserier, grundnivå", "Träna figurserier", "Övningsprov mot klockan", "I-provet").
4. Scenen: typens illustration, 160×120 på dator till höger om texten, 96 px hög över texten på mobil, vagg-ink-kontur med vagg-2-yta och en kopparyta, samma SVG som på testkortet, ritas in 600 ms med `rita`. Fem typer saknar scen i dag (figurserier, deduktiv, talserier, spatial, ordförråd) och ritas i riktningen från `docs/design/tester-lyft-2026-10-11`.
5. Tre regler, alltid tre, alltid i samma ordning, alltid räknade ur config: omfång, återkoppling, vad som sparas. Ikon 28 px, rubrik 14/600, rad 12/16.
6. Det lyfta kortet med exakt en kopparknapp och en fotnot. Knappen står i foten på mobil.

| Läge | Regel 1 (omfång) | Regel 2 (återkoppling) | Regel 3 (vad som sparas) | Extra |
|---|---|---|---|---|
| Nivåkollen | "Nio uppgifter, cirka sju minuter." (per typ ur config; matris: "svårigheten följer dina svar") | "Ingen förklaring under tiden, den kommer efteråt." | "Nivån räknas. En gång om dagen." | |
| Nivåtest | "15 uppgifter. Provets tid är 20 minuter, klockan stoppar dig inte." | "Rätt svar efteråt, med genomgång." | "Resultatet syns i Din utveckling." | "Fortsätt testet" när en session är öppen |
| Träna | "Fyra uppgifter i egen takt. Ringen visar provets tid per uppgift." | Kryssrutan (44 px rad) | "Nivån rör sig högst ett halvt steg om dagen." | Kort variant |
| Övningsprov | Som i dag ur format ("18 uppgifter på 25 minuter. I fast ordning, du kan gå tillbaka.") | "Ingen hjälp under tiden." | "Obesvarade räknas som fel. Avbryter du sparas inget resultat." | Valt format visas |
| I-provet | Halva eller hela provet | "Deltesten i ordning, ingen väg tillbaka." | Lista med sex deltester | Mellanskärm per deltest i kort mall |
| Personlighet | "50 påståenden, cirka 10 minuter." | "Ingen rätt eller fel." | "Din profil sparas." | |

För ett låst läge byts knappen mot `PaywallCard` (avsnitt 9). För slut dagskvot visas kvotkortet med nästa tillfälle. Fortsätt-knappen för en påbörjad session syns alltid; kvoten räknar bara slutförda.

### 4.2 Resultatskärmen (`TestResultsPage` som enda bas)

```
VÄGG (mörk)
  Topprad: [X]  Figurer och mönster             20 nov
            Nivåtest, grundnivå
  Ring 56 px som fylls till andelen rätt
  Eyebrow:  NIVÅTESTET KLART  (TRÄNINGEN KLAR / NIVÅKOLLEN KLAR / ÖVNINGSPROVET KLART)
  Huvudtal: 11 av 15 rätt        (Nivåkollen: "5 av 10" nivå; Träna: "3 av 4 rätt")
  Två tal:  14:20 av 20 min  |  2 min över provets tid    (Träna: nivån +0,2  |  tempo)
  En mening om vad talet betyder
  Nivåskalan när läget rör nivån (Nivåkollen, Träna)
  Märke 72 px första gången en nivå klaras

GOLV
  Kort 1  GENOMGÅNG: "Femton uppgifter att titta på", miniatyrer av de missade, knapp "Gå igenom", länk "Visa alla"
  Kort 2  VAR DU TAPPADE: stapel per mönster eller uppgiftsform
  Kort 3  TEMPO MOT PROVETS TID (gränslägen och Träna) eller KURVAN (Nivåkollen, övningsprov)
  Kort 4  NÄSTA STEG, en primärknapp per läge:
            Nivåkollen → "Träna på grundnivå"
            Träna → "Träna igen i morgon" (låst tills i morgon) eller "Gör Nivåkollen"
            Nivåtest → "Alla tester" eller nästa nivå när den är öppen
            Övningsprov → "Plan inför provet"
  Statusrad med sälj där det är relevant (avsnitt 9)
  Länk    "Tillbaka till Rekryteringstester"
```

Kortordningen är fast; ett kort utan data tas bort, visas aldrig tomt. Genomgången är samma vy som sessionen (samma ram, räknaren, ‹ och Nästa i foten, Förklaringen under svaren), så användaren lär sig en skärm till, inte två. "Gå igenom" finns alltid, även efter matrisens Nivåkoll. Två tal max på väggen (regeln data som bild, inte text). Fyrstegsavslöjandet `.steg s1..s4` i alla lägen. `PassResultatVy`, `MatningResultatVy`, `OmmatningResultatVy`, `NivakollResultatVy`, `VnResultatVy`, `FigurResultatVy`, `DeduktivResultatVy`, `Steg2ResultatVy`, `OvningsResultatVy`, I-provets inline-resultat och personlighetens `ResultsView` blir varianter av samma vy eller försvinner.

---

## 5. Återkoppling

### 5.1 Träna: Förklaringen

Efter bekräftat svar sätts kortens tillstånd (rätt, fel, dämpade) och 120 ms senare glider Förklaringen in under svaren (280 ms, `cubic-bezier(.2,.8,.2,1)`), scrollad fram så att nederkanten står 12 px över foten. Panelen är `Regelpanel` vidareutvecklad, med färg efter utfall:

- **Rätt:** yta `positiv-mjuk`, bock 24 px i `positiv`, raden "Rätt" i `positiv` med tiden till höger i `ink-3` ("29 s, provets tid 80 s").
- **Fel:** yta `fel-mjuk`, kryss 24 px i `fel`, raden "Inte den här" i `fel`, tiden som ovan.
- **Vet inte:** yta `ton`, raden "Förklaringen" i `ton-ink`. Inget kryss, inget rött; att be om förklaringen är inte ett fel.

Under raden: eyebrow "FÖRKLARINGEN" i alla typer (i dag "REGELN" i figurtyperna), regeln i 18/23 700 display där banken har en, "Ditt misstag" 14/20 under, "Något ser fel ut" som `LANK`. Matrisens ifyllda lucka och talseriens markerade tal behålls. Fotens knapp byter till "Nästa".

Kryssrutans två lägen:

| Förklaring efter varje svar | Beteende |
|---|---|
| På (standard) | Tryck markerar, "Svara" bekräftar, Förklaringen, "Nästa". Samma gest som provet. |
| Av | Tryck markerar, "Nästa" bekräftar. Facit i genomgången. Provtempo med provets gest. |

### 5.2 Nivåkollen, nivåtest, övningsprov, I-provet: tystnaden

Inget avslöjande. Efter Nästa byter kortet till valt (bläck), stapeln växer, nästa uppgift kommer. Ingen färg, ingen bock, ingen regel. Raden "Ingen återkoppling under tiden" ovanför uppgift 1 i Nivåkollen flyttar till startskärmens regel 2.

---

## 6. Ordlista

En term per sak i all användartext i sessioner, startskärmar, resultat och Tester. Inga talstreck. Aldrig "pass" i användartext (Dagspasset är ett produktnamn och undantaget). Copywritern (`svensk-ux-copywriter`) äger de färdiga strängarna; mönstret nedan är det som måste vara lika.

| Sak | Termen | Ersätter |
|---|---|---|
| Enheten | **uppgift** ("Uppgift 3 av 15", "15 uppgifter") | fråga, passage, text, underlag som räkneenhet |
| Verbalt | **texten** är underlaget, **påståendet** är uppgiften; räknaren räknar påståenden | passage |
| Numeriskt | **underlaget** (tabell eller diagram) | graf, tabell som rubrikord |
| Typerna | Figurer och mönster, Figurserier, Deduktiv slutledning, Ord och text, Siffror och tabeller, Talserier, Spatial förmåga, Ordförråd (som i Tester) | Logiktest, Verbalt resonemang, Numeriskt test, matrislogik |
| Nivåerna | **grundnivå, avancerad nivå, expertnivå** (gemen i löptext, "Grundnivå" bara som eyebrow) | grund, Grund, nivå 3 som nivåord |
| Träningens nivå | "Träna, grundnivå" i undertiteln; den adaptiva nivån ("nivå 3,7") bara på kurvan och i resultatet | "Träna, nivå 3" |
| Lägena | **Nivåkollen, nivåtest, Träna, övningsprov, I-provet** | nivåmätning, mätning, prov, generalrepetition i användartext |
| Huvudets rader | titel = typens namn, undertitel = "[läge], [nivå]" eller "[läge], samma format som [namn]" | mönstrets namn som titel, "Vårt format" som undertitel |
| Gå vidare | **Nästa** | Nästa fråga, Nästa fråga →, Nästa uppgift, Svara och gå vidare |
| Bekräfta i Träna | **Svara** | |
| Sista steget | **Lämna in** (testlägen), **Visa resultatet** (Nivåkollen, Träna) | Avsluta testet, Avsluta och se resultat |
| Vet inte | **Vet inte, visa förklaringen** (bara Träna); **Vet inte** när förklaringen är avstängd | Vet inte, visa regeln / lösningen; Vet inte (Nivåkollen) |
| Förklaringen | **Förklaringen** (eyebrow), **Regeln** som fet första rad där banken har en, **Ditt misstag** under | Regeln som eyebrow, "Rätt svar är C" som rubrik |
| Tre fasta svar | **Sant / Falskt / Går inte att avgöra** | Kan ej avgöras |
| Villkor i deduktivt | **Villkor** | Premisser |
| Tillbaka i foten | ‹ med aria "Föregående uppgift" | Föregående som text |
| X | aria **Avbryt**; dialog "Avbryta [nivåtestet / träningen / Nivåkollen / övningsprovet / testet]?" med "Fortsätt" och "Avbryt" | Avsluta testet, Lämna testet, Avsluta träningen, Stäng |
| Inlämning | "Lämna in?" med "Lämna in" och "Fortsätt" | Lämna in testet?, Slutför testet?, Se min profil |
| Klart | "[Läget] klart" som eyebrow: Nivåtestet klart, Träningen klar, Nivåkollen klar, Övningsprovet klart | Testet klart, Träningen sparad, Klart, Nivåkollen sparad |
| Provets tid | **provets tid** | budget, tidsgräns i användartext |
| Över tiden | "2 min över provets tid" | |
| Startknappar | Starta testet, Starta Nivåkollen, Starta träningen, Starta övningsprovet, Starta deltestet; "Fortsätt …" när en session pågår; "Gör om testet" bara på startsidan efter ett avslutat försök | |
| Tillbaka från resultat | **Tillbaka till Rekryteringstester** | Alla tester, Till Alla tester, Tillbaka |
| Betalvägg i steg2 | "Träna i talserier ingår i Premium, 149 kr i månaden" via `paketMedPris` | "Träna talserieret ingår i Premium." (`${NAMN}et`) |

---

## 7. Visuellt system

### 7.1 Tokens

Alla finns i `src/app/globals.css` i båda skärmlägena: `--golv`, `--papper`, `--papper-2`, `--kant`, `--kant-stark`, `--ink-1/2/3`, `--koppar`, `--koppar-ink`, `--koppar-ljus`, `--koppar-mjuk`, `--positiv`, `--positiv-mjuk`, `--fel`, `--fel-mjuk`, `--fel-kant`, `--ton`, `--ton-ink`, `--fokus`, `--vagg*`, `--diagram-test`. Nytt: `.text-fraga` (20/26 700 mobil, 24/30 dator, display, `text-wrap: balance`), `--font-sess-display` och `--font-sess-text`, `[data-sessionsram]` som väljare för rörelseregler. Inga egna storlekar eller kulörer i komponenterna.

### 7.2 Färgroller i sessionen

| Tillstånd | Kant | Yta | Bricka | Text |
|---|---|---|---|---|
| Neutral | `kant` 1 px | `papper` | `papper-2`, text `ink-2` | `ink-1` |
| Hover | `kant-stark` | `papper` | samma | samma |
| Vald | `ink-1` 2 px (inset) | `papper` | `ink-1`, text `papper` | `ink-1` |
| Rätt (efter facit) | `positiv` 2 px | `positiv-mjuk` | `positiv`, vit bock | `ink-1` |
| Fel (bara det valda, efter facit) | `fel` 2 px | `fel-mjuk` | `fel`, vitt kryss | `ink-1` |
| Dämpad (övriga efter facit) | `kant` | `papper` | `papper-2` | opacitet .38 på hela kortet |
| Fokus | `--fokus` 2 px ring, 2 px offset | | | |

Koppar i sessionen: knappen, framstegsstapeln, ringen de sista två minuterna och över tid. Inga kopparrubriker, inga kopparpunkter på kort, ingen kopparfylld figur.

Ringens utseende per läge (ur dagens `Klocka`, spår `kant` 4 px, 36 px mobil och 40 px dator, `role="timer"`): **gräns** töms medurs i `ink-2`, talet hela minuter 13/16 display tabular `ink-1`; sista två minuterna m:ss i 12 px, båge och tal i koppar respektive `koppar-ink`; efter noll står bågen full i koppar och talet är tiden över som "+1:23" 12 px `koppar-ink`, fortfarande i samma 36 px. **Referens** (Träna) fylls medurs i `ink-2` per uppgift, utan tal, står full i `ink-2` när provets tid är nådd, blir aldrig koppar. **Ingen**: hörnet är tomt, titeln får bredden. Ringen ritas med `stroke-dashoffset` på ett fast `viewBox 48`, byter aldrig storlek. Rött finns bara på det valda felaktiga kortet och Förklaringens felyta i Träna och i genomgången; aldrig i rubriker, tal eller på väggen. Mörkt läge: Svarskort har aldrig skugga, bara kant; matrisytan och underlagskortet får `border-[color:var(--lyft-kant)]` som LyftKort.

### 7.3 Typskala i sessionen

| Roll | Mobil | Dator | Snitt | Token |
|---|---|---|---|---|
| Titel i huvudet | 15/20 600 | samma | text | `ink-1` |
| Undertitel | 12/16 500 | samma | text | `ink-3` |
| Uppgiftens fråga | 20/26 700 | 24/30 | display | `.text-fraga` |
| Instruktionsrad | 14/20 | samma | text | `ink-2` |
| Underlagstext | 16/26 | 17/28 | text | `ink-1`, max 640 px |
| Ord i ordförråd | 32/36 800 versaler | 40/44 | display | `ink-1`, `letter-spacing: .02em` |
| Talrad | 24/28 700 tabular | 28/32 | display | `ink-1` |
| Alternativtext | 16/22 500 | samma | text | `ink-1` |
| Bokstav på brickan | 12/16 700 | samma | text | se 7.2 |
| Ringens tal | 13/16 700 tabular | samma | display | `ink-1`, koppar-ink sista två minuterna |
| Förklaringens utfallsrad | 12/16 600 versaler | samma | text | `positiv`, `fel` eller `ton-ink` |
| Regeln | 18/23 700 | samma | display | `.regelpanel-regel` |
| Misstaget | 14/20 | samma | text | `ink-2` |

### 7.4 Ikonografi

Allt ur `RumSymboler` (24, stroke 1,75): `IkonX`, `IkonTillbaka`, `IkonCheck`, `IkonChev`, `IkonFraga`, `IkonInfo`. Tre nya i samma familj: `IkonKryss`, `IkonKlocka`, `IkonFlagga`. Typens glyf (`TestGlyfer`, 48) står på startskärmen och resultatet, aldrig i huvudet. Lucide försvinner ur sessionerna. Aldrig Sparkles.

### 7.5 Rörelse

Alla tider i millisekunder. Rörelse bara på `transform` och `opacity`, aldrig på höjd, bredd eller marginal. Kurvan för "något kommer fram" är `cubic-bezier(.2,.8,.2,1)`, för "något byter läge" `ease-out`.

| Ögonblick | Vad rör sig | Tid | Kurva |
|---|---|---|---|
| Tryck på kort | `scale(.985)` | 90 | ease-out |
| Släpp | tillbaka till `scale(1)` | 140 | ease-out |
| Markera | kant → `ink-1`, brickan fylls | 120 | ease-out |
| Avmarkera | tillbaka | 120 | ease-out |
| Bekräfta, rätt (Träna) | kant → `positiv`, yta → `positiv-mjuk` | 160 | ease-out |
| Bocken på brickan | `scale(.6)` → 1, opacitet 0 → 1 | 240 | `.2,.8,.2,1` |
| Bekräfta, fel (Träna) | valt kort kant → `fel`, yta → `fel-mjuk` | 160 | ease-out |
| Rätt svar visas efter fel | rätt kort kant → `positiv`, 120 ms efter felet | 160 | ease-out |
| Övriga kort dämpas | opacitet → .38 | 160 | ease-out |
| Förklaringen | `translateY(16px)` → 0, opacitet 0 → 1, sedan scroll | 280 | `.2,.8,.2,1` |
| Nästa uppgift, ut | opacitet → 0, `translateX(-12px)` | 120 | ease-in |
| Nästa uppgift, in | opacitet 0 → 1, `translateX(16px)` → 0 | 200 | ease-out |
| Framstegsstapeln | `scaleX` till ny andel | 240 | ease-out |
| Ringen (gräns) | `stroke-dashoffset` | 1000 | linear, per tick |
| Ringen (referens) | `stroke-dashoffset` | 1000 | linear, per tick |
| Ringen blir koppar | `stroke` och text | 300 | ease-out |
| Sista svaret → resultat | ramen tonar ut 160, väggen tonar in 240 | 400 | ease-out |
| Resultatets avslöjande | `.steg s1..s4` | 260 vardera, start 120/420/720/1020 | ease-out |
| Ringen på resultatet | `fyll` till andelen | 500, start 300 | ease-out |
| Märke | `scale(.92)` → 1 | 600, start 200 | `.2,.8,.2,1` |
| Scenen på startskärmen | kontur ritas in med `rita` | 600 | `.2,.8,.2,1` |

Inget skakar, ingen konfetti, inget ljud och ingen vibration på webben. Haptik bara i appen Testklar, `impact light` vid rätt och fel i Träna (avsnitt 1, Testklar). `prefers-reduced-motion: reduce`: alla `transition` och `animation` till `none`, Förklaringen står på plats direkt, stapeln hoppar, avslöjandet visar allt på en gång, scroll utan `smooth`.

CLS 0: tillstånd via `box-shadow` och färg, aldrig `border-width`; alla figurer har `aspect-ratio`; underlagskortet har `min-height` lika med sin första rendering; ringens tal är tabular och ringen har fast bredd; knappen byter text utan att byta bredd; main har reserverad `padding-bottom`.

---

## 8. Mätning

### 8.1 Bevaras oförändrat (namn och egenskaper)

Klient: `pass_startat`, `nivamatning_startad`, `vet_inte_tryckt`, `betalvagg_visad`, `paywall_shown`, `paywall_cta_clicked`, `feature_blocked`. Server: `pass_klart`, `riktat_klart`, `nivamatning_klar`, `ommatning_klar`, `generalrepetition_klar`, `provpaket_klart`, `kalibreringsfraga_svarad`, `milstolpe_nadd`, `fraga_rapporterad`. Aktivitetslogg: `test_completed` via `logUserActivity`. Adminens `admin_daily_metrics` och `/admin/tratt` ändrar inga definitioner. Grep-test i CI på att namnen skjuts från ramen.

### 8.2 Nya händelser, skjuts av ramen en gång, aldrig av typerna

| Händelse | När | Egenskaper |
|---|---|---|
| `test_start_viewed` | startskärmen renderad | `test_kind`, `lage`, `niva`, `format`, `fortsatt_tillganglig`, `sparrad` (none, quota, premium) |
| `test_session_started` | första uppgiften visad | + `session_id`, `antal`, `tid_budget_s`, `resumed` |
| `test_question_answered` | svaret sparat | + `index`, `elapsed_ms`, `via` (tap, keyboard), `vet_inte`, `ratt` (bara Träna) |
| `test_session_abandoned` | X bekräftat eller sidan lämnad med osparad session | + `index`, `besvarade`, `elapsed_ms` |
| `test_session_completed` | inlämning bekräftad av servern | + `besvarade`, `elapsed_ms`, `over_tid` |
| `test_submit_blocked` | "Lämna in" med obesvarade, dialogen visad | + `obesvarade` |
| `traning_installning_andrad` | kryssruta ändrad på Träna-startskärmen | `forklaring_efter_svar` |

`lage` är ett av `nivakoll`, `nivatest`, `trana`, `ovningsprov`, `iprov`, `personlighet`. Aldrig `correct` i mätlägen (facit finns inte i klienten). Händelserna går genom analytics-klientens kö så att inget faller bort före PostHog-init.

### 8.3 Baslinje och avläsning

Baslinjen är tabellen i saas-leads förslag avsnitt 0 (Supabase, 22 aug till 20 nov, ägarens konto och testkonton bortfiltrerade): matris grund 91 %, Nivåkollen matris 70 %, verbalt grund 63 %, Träna matris 83 %, numeriskt grund 33 % (11 av 27 utan ett svar), figurserier grund 92 %, verbalt expert 0 av 9, legacy `*-prov` 0 av 13, deduktivt, talserier, spatial, ordförråd grund 100 %. 114 konton gjorde en session, 18 % kom tillbaka en andra dag.

| Mätpunkt | Baslinje | Mål |
|---|---|---|
| Numeriskt grund, slutförda | 33 % | över 70 % |
| Verbalt grund, slutförda | 63 % | över 80 % |
| Nivåkollen (alla typer), slutförda | 70 % | över 85 % |
| Avbröt utan ett svar | 7 till 41 % per typ | under 5 % överallt |
| Matris, figurserier, deduktivt, steg2 grund (vaktpunkt) | 91 till 100 % | inte under 90 % |
| Betalvägg, klick per visning | 10 % totalt, 12 % dator, 7 % mobil | minst 10 % totalt, mobil i nivå med dator |
| Återkomst andra dagen bland testkonton | 18 % | 25 % |

Avläsning 14 dagar efter sista etappen och igen efter fyra veckor, aldrig tidigare. Sanningen om slutförande kommer ur Supabase (samma fråga som baslinjen), PostHog säger var i sessionen folk lämnar och tid per uppgift per enhet. Ny PostHog-dashboard "Testflödet" med tratten startskärm → startad → slutförd per `lage` och `test_kind`, byggd i sista etappen.

---

## 9. Betalväggar

### 9.1 Baslinjen att inte underskrida

PostHog 30 dagar till 2026-11-20: `betalvagg_visad` 199 visningar hos 33 personer, `paywall_cta_clicked` 20 hos 14 personer: 10 % per visning, 42 % per person. Dator 125 visningar, 15 klick (12 %). Mobil 72 visningar, 5 klick (7 %). Volymen är liten, så målet är "inte sämre" på minst 100 visningar efter sista etappen; under 8 % per visning på 100 visningar utreds, inget backas automatiskt.

### 9.2 Regeln

**Betalväggen bor på startskärmen, resultatsidan och i Tester-menyn, aldrig inne i en session.** Sessionen startar först när servern sagt ja (samma POST som i dag, 402 och 429), så ingen kan nå uppgift 7 och mötas av en vägg. Inne i sessionen finns ingen Premium-text, inga lås, ingen "Lås upp". Alla ytor använder `PaywallCard` med pris ur `PLANS` och `useKampanjPris`, så Black Week-priset följer med automatiskt.

| Yta | När | Kort | `plats` (behålls där ytan finns i dag) |
|---|---|---|---|
| Startskärm Träna | gratis från dag 1 | `PaywallCard` "Träna ingår i Premium", brödtext per typ, pris | `pass` (som `PassFlode` i dag) |
| Startskärm nivåtest avancerad och expert | gratis | `PaywallCard` | `testniva` (som `TestHubPage`) |
| Startskärm nivåtest grund, dagskvot slut | gratis efter dagens test | kvotkortet "Ditt gratis test i dag är gjort. Nästa i morgon." med Premium-knapp under | `testniva` |
| Startskärm Nivåkollen redan gjord | gratis | `PaywallCard` "Nivåkollen igen ingår i Premium" | `ommatning` |
| Startskärm övningsprov och I-provet | gratis | dagens `Startark`-vägg | `provlage` |
| Resultatets statusrad | gratis, alla lägen | köpknappen i statusraden (finns) | `testresultat` |
| Nivåkollens resultat, Nästa steg "Träna" | gratis dag 1+ | knappen leder till Träna-startskärmens vägg | `matning` på resultatet |
| Tester-menyn | gratis | lås och pris på låsta lägen, aldrig döda knappar | som i dag |

Gratisanvändaren ser alltid hela resultatet och hela genomgången (`genomgangGratis` ligger fast). Mobil: väggen står i det lyfta kortet med knappen i fotens position, aldrig under annat innehåll; det är den förändring som ska lyfta mobilens 7 %.

---

## 10. Nivåkoll för talserier, spatial förmåga och ordförråd

Vad som krävs, kontrollerat mot `src/lib/nivakoll/motor.server.ts`, `src/lib/nivakoll/niva.ts` och steg2-motorn:

- **Banker finns och räcker.** Talserier 174/171/171 uppgifter per nivå, spatial 196/195/186, ordförråd 197/205/155, alla med facit på servern och seedad blandning via `Steg2Motor.visa`, `bedom`, `genomga`, `grupp`, `budget`.
- **Kalibrering.** Samma skala 1 till 10 och samma räkning som matrisen: b = 1 + 9 × (1 − p), p ur `fraga_statistik` från 30 svar (verifiera att steg2-rutterna skriver dit med `test_kind`), annars bankens `p_prior` (finns i talserier och spatial), annars priorn för bankens svårighet (`svarighet.ts`). Ordförrådet saknar `p_prior` och går på svårighetspriorn tills banken har statistik; det är samma läge som deduktivt hade vid start.
- **Config.** `NivakollKind` utökas med `talserie`, `spatial`, `ordforrad`. `NIVAKOLL_TEST_TYPE`: `talserie-nivakoll`, `spatial-nivakoll`, `ordforrad-nivakoll`. `NIVAKOLL_URVAL`: talserie 3/3/3, spatial 3/3/3, ordförråd 4/4/4 (ordförrådets uppgifter tar 20 s, så tolv kostar fyra minuter och ger bättre precision). Provets tid per uppgift ur motorn: talserier 60 s, spatial per form (30 eller 45 s), ordförråd 20 s; `budget_s` i meta blir per uppgift där formen varierar.
- **Längd som text ur config:** "Nio uppgifter, cirka nio minuter" (talserier), "Nio uppgifter, cirka sju minuter" (spatial), "Tolv uppgifter, cirka fyra minuter" (ordförråd). Aldrig fast sträng.
- **Ingång.** `NIVAKOLL_FINNS` true för de tre; `nivakollHrefV4` ger `/dashboard/tester/pass?typ=nivakoll&kind=<typ>`; Tester-menyns "Mät dig", Nivåbandet på kortet, Hems Nästa steg (`B.omatt`), appens tvilling `src/lib/mobilapp/vyer.ts` och `UtvecklingVy.tsx`, Din utveckling (punkt med `kalla: nivakoll`). `omattMeta` slutar säga "Nivåkoll, 8 min" och räknar ur config.
- **Efter Nivåkollen.** `passNivaUrNiva` väljer grund eller avancerad för steg2-träningen (`STEG2_PASS_ANTAL` 6), `sedda.server` räknar de tre typernas uppgifter, `raknaNivakoll` grupperar via `motor.grupp`.
- **Gratisnivån.** Som de andra: en gång per typ gratis (`matningGratis`), ommätning i Premium, 402 med `featureRequiredBody` från samma route.
- **Mätning.** `nivamatning_startad` och `nivamatning_klar` med `test_kind`, plus ramens händelser.
- Det anonyma provet (`smakprov`) för de tre typerna ingår inte.

---

## 11. Risker och skydd

| Risk | Vad som kan gå sönder | Skydd |
|---|---|---|
| Sparning och återupptagning | Nivåtesten postar per svar utan kö; Nivåkoll och Träna skriver via `/api/traning/*` och byter URL till `/pass/<id>`; `[sessionId]` letar i upp till sex motorer | Ramen rör inga routes och inga tabellformat. Kontrakttest per motor snapshotar POST-kroppen före och efter. E2E mot riktig data före push. Vi har bränt oss på `key={pathname}` plus `replaceState` som skapade 161 sessioner. |
| Kvoter | Ett grundnivåtest om dagen räknar slutförda i `GRUND_KVOT_TEST_TYPER`; gratis Nivåkoll en gång per typ; 402 och 429 i POST | Sessionen skapas bara från startskärmen med samma POST. Inga nya `test_type` utom de tre Nivåkollerna. QA med gratis icke-adminkonto (admin passerar alla kvoter). "Fortsätt" hindrar omstarter för att slippa kvoten. |
| Serverstyrda tider | Övningsprov och I-prov: deadline på servern, 410 efter tid + 10 s | `useExamDeadline` oförändrad. Nivåtestens ring byter bara utseende; `timeSpent` skickas som i dag. Verbalt byter från 25 till 20 min och slutar auto-lämna in, det enda som ändras i tidtagningen. |
| Nivåberäkning | `nastaAdaptivaFraga`, `valjPass`, `slutfor_traningssession`, `test_nivapunkter`, kalibreringen | Rörs inte. Ramen renderar och skickar; motorn bestämmer. "Vet inte" bort ur Nivåkollen påverkar bara fyra typer med 6 sessioner på 90 dagar. |
| Appen Testklar | Proxyn skriver om `/dashboard/tester/*` till `/app/tester/*` via tvillingfiler; appen har egna flikvyer med egen copy | Inga nya rutter utom Nivåkollens tre `kind`-värden på befintlig route. Tvillingrutten öppnas i Chrome på Pixel 7 i varje etapp, emulatorn Pixel_8 i etapp 5. Appens copy rättas i etapp 0 samtidigt med webbens. |
| Publika prov och SEO | `/verktyg/rekryteringstester/prova` och uppgift 1 i tolv artiklar, avläsning 8 dec | Rörs inte i det här svepet. |
| Prestanda | Budget LCP under 1,0 s, CLS 0; verbalt och numeriskt målar skelett före första frågan i dag | Startskärm och första uppgift serverrenderade; verbalt och numeriskt får uppgifterna i startsvaret så bankerna lämnar klientbundeln. `npm run perf:inloggat` som grind per etapp. |
| Mätning | Admin och tratt läser `test_completed`, `pass_klart`, `nivamatning_klar` | Namn och egenskaper bevaras; grep-test i CI. |
| Black Week | Kampanjpriser på betalväggar, kassan, frysen | Inga ändringar i `src/lib/kampanj`, `src/app/api/stripe`, `src/components/kampanj`, `src/lib/plans`. `PaywallCard.kampanj.test` grön. Varje etapp klicktestar en betalvägg i ramen med kampanjkontexten (dagen satt till 24 nov i testet). Kampanjraden i dashboard-layouten ligger utanför ramen och döljs under sessionen av `data-flow-active`, som i dag. |
| Dubbel sanning | Gamla och nya komponenter i trädet under etapperna | Gamla komponenter används inte av någon route efter sin etapp, raderas i etapp 5. Backning per etapp är `git revert`. |
| Juridik | Villkor, policy, datalagring | Inga texter om datalagring, GDPR, policy eller villkor rörs. `profiles.test_installningar` är en gränssnittsinställning, ingen personuppgift. |
| Testdata | QA i produktion | Egna QA-konton, raderas per id efter varje etapp, aldrig tidsfönster eller svep. Räkna före delete. |

---

## 12. Byggetapper för ett svep

Allt byggs av Opus-agenter med strikt filägarskap efter den här planen; copy via `svensk-ux-copywriter`, scener via `art-director`; saas-lead granskar varje etapp mot planen före push. Etapperna pushas till main en i taget, i ordning, och ingen etapp pushas förrän dess acceptans är grön. Backning: `git revert` av etappens commitserie, kommandot antecknas i `docs/bygg-noter-testflode.md` vid varje push.

### Gemensam acceptans, gäller varje etapp

1. `tsc` rent, vitest grön för berörda filer under bygget, hela sviten grön och `npm run build` rent en gång före push.
2. Riktig webbläsare, dator 1400×900 och Pixel 7 412×915, som gratis icke-adminkonto och som Premium-konto, skärmdump per steg: startskärm, uppgift 1, efter svar, sista uppgiften, Lämna in-dialogen, resultat, genomgång uppgift 1, Avbryt-dialogen. Bilderna i scratchpad, aldrig i git. QA-konton raderas per id efteråt.
3. Alla svarsalternativ synliga utan scroll i utgångsläget på båda enheterna; skärmdumpen bevisar det.
4. LCP under 1,0 s på startskärmen och första uppgiften (Pixel 7-emulering, 3x CPU, LTE, median av tre), CLS 0 på alla berörda vyer, `npm run perf:inloggat` grön.
5. Inga talstreck och inget "pass" i användartext (grep över berörda copy-filer, undantag Dagspasset), inga lucide-ikoner i sessionen, aldrig Sparkles.
6. Händelserna i avsnitt 8 syns i PostHog live events (eller nätverksfliken) med rätt `lage` och `test_kind`; de gamla namnen skjuts oförändrade (grep-test).
7. Black Week: diffen rör inga filer i `src/lib/kampanj`, `src/app/api/stripe`, `src/components/kampanj`, `src/lib/plans`; `PaywallCard.kampanj.test` grön; skärmdump av en betalvägg i etappens yta med kampanjpriset.
8. Gratiskontot möter 402 och 429 på startskärmen, aldrig i sessionen.
9. Tvillingrutten under `/app/tester/...` för etappens typer öppnad i Chrome på Pixel 7.
10. Tangentbord: A till F, Enter, Esc provade på dator i minst ett läge per etapp.

### Etapp 0: de uppenbara felen (S, pushas först)

Omfattning: sanningsrättelser utan nya komponenter. (1) `src/lib/tester/steg2/copy.ts:39` "Träna talserieret" byts till `paketMedPris`. (2) "Nivåkoll, 8 min" på kort utan Nivåkoll (`src/lib/tester/v4/copy.ts:117`, `src/components/tester-v4/Nivaband.tsx:28`, `src/lib/mobilapp/vyer.ts:266`) följer `NIVAKOLL_FINNS`. (3) "Tolv uppgifter, cirka åtta minuter" (`v4/copy.ts:99`, `mobilapp/vyer.ts:232`, `UtvecklingVy.tsx:53`, `traning/pass-copy.ts:133`, `hem-copy.ts:71/102`, `utveckling/copy.ts:20-21`, `komigang.ts:320/395`) räknas ur config per typ. (4) `ovningsprovMatrisText` lovar inte längre ett formatval. (5) `VerbalTestSession.tsx:64` `TOTAL_TIME` 25 → 20 ur config; "Kan ej avgöras" → "Går inte att avgöra". (6) "✓ 0 / 15" → "0 av 15 besvarade", verbalt räknar rätt enhet. (7) Numeriskt: "Fråga 1 av 20 · Lätt" bort. (8) "Logiktest, grundnivå" → "Figurer och mönster, grundnivå", "Talserier, grund" → "grundnivå" via `src/lib/traning/rubrik.ts`. (9) 301 för `matrislogik-prov`, `verbal-resonemang-prov`, `numeriskt-test-prov` till `/dashboard/tester/ovningsprov/<typ>`. (10) `ConfirmDialog` vid X i numeriskt, verbalt expert, personlighet, Nivåkoll, Träna, övningsprov och I-prov, och vid Lämna in i övningsprov och verbalt expert. (11) Em-dash bort i personlighetens översikt, dess knappar får min-height 44 px. (12) Appens tvilling får samma rättelser.

Filer: de ovan, `hemvy.test.ts:158` och `milstolpar-form.test.ts:139` (väntar "8 min" i dag).

Acceptans utöver den gemensamma: skärmdump av Tester-menyn på mobil och dator, alla tre legacy-sluggar svarar 301, varje ny dialog klicktestad. Ingen avläsning, det är sanningsrättelser.

Pushas: en commit "fix(tester): sanningsrättelser i testflödet, etapp 0".

### Etapp 1: ramen, byggd på figurserier i alla lägen (L)

Omfattning: de gemensamma komponenterna och figurserier i nivåtest (grund, avancerad, expert), Nivåkollen, Träna och övningsprovet "figurer".

Komponenter: `src/components/session/SessionsRam.tsx` (huvud, stapel, fot, avbryt- och inlämningsdialog, tangentbord, skärmläsare, uppgiftsarket), `Svarskort.tsx` (rad, ruta, tre fasta), `Klocka.tsx` (ringen i tre lägen, ur dagens `Klocka`), `Startskarm.tsx` (ur `Startark`, lång och kort variant, "Fortsätt", kvot- och betalväggsvariant), `Forklaringen.tsx` (ur `Regelpanel`), `Lagesregler.ts` (de fyra flaggorna per läge), `useSessionSparning.ts` (ur `useRobustAnswerSaving`), `sessionHandelser.ts` (händelserna i 8.2). Tokens och `.text-fraga` i `globals.css`, `--font-sess-*` i rot-layouten och `testklar.css`, tre nya ikoner i `RumSymboler`, scenen för figurserier. `TestResultsPage` får varianterna per läge och nivåskalan. `FigurserieTestSession`, `NivakollFlode` (figurserie), `FigurPassFlode` och `OvningsprovFlode` (figurer) byter till ramen; gamla filer står kvar oanvända. Migrering `profiles.test_installningar` och `/api/traning/installningar`. Träna-startskärmen med kryssrutan.

Acceptans utöver den gemensamma: figurserier ser identiska ut i de fyra lägena (skärmdumpar sida vid sida), sidomenyn borta på dator, ringen räknar ned i nivåtestet och fortsätter över noll med koppar och plustid, Förklaringen i Träna med grönt och rött, alla fyra kryssrutekombinationer klicktestade, "Fortsätt testet" efter omladdning mitt i ett nivåtest, Nivåkollen utan "Vet inte", övningsprovets Lämna in med dialog, kontrakttest på POST-kropparna grönt, resultatets "Gå igenom" i alla fyra lägen.

Pushas: commitserie "feat(tester): sessionsramen, etapp 1 figurserier".

### Etapp 2: Ord och text och Siffror och tabeller, alla lägen (L)

Omfattning: nivåtest grund, avancerad och expert (inklusive `VerbalExpertSession` och `NumericalTestSession`), Nivåkollen, Träna (`VnPassFlode`) och övningsproven för de två typerna. Ett påstående i taget i verbalt nivåtest, arket grupperat per text, 20 minuter ur config, mjuk gräns. Underlaget i egen kolumn på dator och fäst överst på mobil (`VnUppgift`-mönstret). Uppgifterna levereras i startsvaret från servern så att bankerna lämnar klientbundeln. Diagram i `diagram-test`-skalan, höjd 240 i underlaget. Expertnivåerna får samma regler som övriga.

Filer: `VerbalTestSession`, `VerbalExpertSession`, `NumericalTestSession`, `verbal-shared`, `numerical-shared/QuestionDisplay`, `NivakollFlode` (verbal, numerisk), `VnPassFlode`, `VnUppgift`, `OvningsprovFlode` (verbal, numerisk), API-rutterna `verbalTestV1/V2`, `numericalTest*/session` (svaret bär uppgifterna, inga nya routes).

Acceptans utöver den gemensamma: svaren på y under 400 på dator i numeriskt (i dag 845), första påståendet synligt på Pixel 7 utan scroll i verbalt (i dag inte alls), publik JS i dashboard-trädet minskar (mät före och efter), verbalt expert slutförbart (0 av 9 i dag), diagrammen utan hårdkodad orange i båda skärmlägena.

Pushas: "feat(tester): sessionsramen, etapp 2 ord och text, siffror och tabeller".

### Etapp 3: Figurer och mönster och Deduktiv slutledning, alla lägen (L)

Omfattning: deduktivt först (nivåtest, Nivåkollen, Träna, övningsprov), sedan matris sist (nivåtest alla nivåer, Nivåkollen adaptiv, Träna adaptiv med kalibreringsfråga, riktat, logikens övningsprov med format, Uppvärmning). Matrisens mått 264/336, luckan fylls i ink med positiv ram, "Förklarande text av" och svårighetsprickarna bort, "Gör Nivåkollen först" som startskärmsvariant. Villkorskortet heter Villkor, 38 vh vid fem alternativ. Scenen för deduktivt.

Filer: `MatrixTestSession`, `logicV7` (bara styling), `DeduktivTestSession`, `DeduktivFraga`, `DeduktivLayout`, `PassFlode`, `PassFraga`, `GenomgangVy`, `DeduktivPassFlode`, `NivakollFlode` (deduktiv), `OvningsprovFlode` (deduktiv), `LogikProvFraga`, `Uppvarmning`, `MatningResultatVy`, `PassResultatVy`, `OmmatningResultatVy` (blir varianter).

Acceptans utöver den gemensamma: matrisens svar D till F synliga på Pixel 7 utan scroll (i dag under vecket), adaptiv Nivåkoll och Träna väntar på servern med spinner i knappen utan frusen skärm, kalibreringsfrågan oförändrad i POST-kroppen (kontrakttest), riktat pass och Uppvärmning klicktestade, vaktpunkten: matrisens slutförandegrad i Supabase följs dagligen första veckan efter push.

Pushas: "feat(tester): sessionsramen, etapp 3 figurer och mönster, deduktiv".

### Etapp 4: Talserier, spatial, ordförråd, I-provet och personlighetstestet (M)

Omfattning: steg2-typernas nivåtest och Träna (`Steg2TestSession`, `Steg2PassFlode`, `Uppgifter`), I-provet i ramen med mellanskärmen i kort mall och hård gräns per deltest, personlighetstestet i ramen (Likert som Svarskort, ett tryck går vidare, arket, gemensam dialog, framer-motion och gradienten bort). Scenerna för talserier, spatial och ordförråd. Talseriens Träna slutar byta hela vyn.

Filer: `Steg2TestSession`, `Steg2PassFlode`, `Uppgifter`, `IprovFlode`, `personalityTest/TestSessionView`, `LikertScale`, `ResultsView`, `Segmentstapel` (pensioneras), `Steg2ResultatVy`.

Acceptans utöver den gemensamma: I-provets alla sex deltester och resultatet klicktestade (nåddes inte i inventeringen), personlighetens 50 påståenden med arket på 44 px celler, `framer-motion` borta ur `src/components/personalityTest` (grep).

Pushas: "feat(tester): sessionsramen, etapp 4 talserier, spatial, ordförråd, I-provet, personlighet".

### Etapp 5: städning och Testklar (M)

Omfattning: radera `TestFlowShell`, `TestMeterRow`, `QuestionNavigation`, `PassShell` (ersatt), de sju gamla nivåtestkomponenterna, legacy `MatrisProvSession`, `VerbalProvSession`, `NumeriskProvSession` och deras `testConfig`-poster (301 står kvar), `logicV6/*`, `logicV4/AnswerOptions, QuestionGrid, TestHeader`, `verbalV1/*`, oanvända delar i `numerical-shared` och `verbal-shared`, de dubblerade resultatvyerna, `Tidsrad`. Testklar: emulatorn Pixel_8 genom alla åtta typer i Träna och nivåtest, haptik vid rätt och fel, Android-tillbaka = X. Uppdatera `docs/designsystem.md` med sessionsramens regler och `src/lib/mobilapp/vyer.ts` där ord ändrats.

Acceptans utöver den gemensamma: `npm run build` utan oanvända exporter i de raderade mapparna, radantalet i sessionskoden rapporteras före och efter (inventeringen räknade 8 900), ingen route importerar en raderad fil, `scripts/perf-inloggat.ts` på alla 38 routes med samma antal inom budget som före eller fler.

Pushas: "chore(tester): städning efter sessionsramen, etapp 5".

### Etapp 6: Nivåkoll för talserier, spatial förmåga och ordförråd (M)

Omfattning: avsnitt 10 i sin helhet. Motorn, config, de tre `test_type`, ingångarna på webben och i appen, Din utveckling, gratisnivån, mätningen. Startskärmens längdtext räknad ur config.

Filer: `src/lib/nivakoll/niva.ts`, `motor.server.ts`, `sedda.server.ts`, `src/lib/tester/v4/rutter.ts` (`NIVAKOLL_FINNS`, `omattMeta`), `niva-lage.ts` och `hamta.server.ts` (antal per typ), `sidkort.ts`, `modell.ts`, `NastaSteg.tsx`, `TypMenyPanel.tsx`, `src/lib/mobilapp/vyer.ts`, `UtvecklingVy.tsx`, `NivakollFlode` i ramen.

Acceptans utöver den gemensamma: tre Nivåkoller klicktestade till resultat på gratiskonto, nivån hamnar i `test_nivapunkter` med rätt `test_kind`, andra försöket samma dag ger resultatskärmen med raden om i morgon, andra dagen ger 402 på startskärmen, Träna efter Nivåkollen får rätt nivå (grund eller avancerad) i de tre typerna, "Nivåkoll, 8 min" finns inte längre någonstans (grep), appens meny säger samma som webben.

Pushas: "feat(tester): Nivåkollen för talserier, spatial och ordförråd, etapp 6".

### Etapp 7: betalväggsöversyn och mätkontroll (S till M)

Omfattning: alla ytor i tabellen 9.2 kontrollerade i ramen på gratiskonto dag 0, dag 1 och med slut dagskvot, på båda enheterna; väggen på mobil i det lyfta kortet med knappen i fotens position; `plats`-värdena enligt tabellen; `paywall_shown` med `price_shown: true`. PostHog-dashboard "Testflödet" med tratten per `lage` och `test_kind` och en insikt för `betalvagg_visad` till `paywall_cta_clicked` per `plats` och enhet. Kontroll i adminens Tratt att `test_completed` fortsätter räknas. Avläsningsdatum i `docs/rapporter/` (14 dagar och 4 veckor efter push).

Acceptans utöver den gemensamma: skärmdump av varje rad i 9.2 på Pixel 7 med kampanjpriset, ingen Premium-text inne i någon session (grep efter `PaywallCard`, "Premium" och "Lås upp" i `src/components/session`), dashboarden länkad i `docs/rapporter/posthog-dashboard-testflodet.md`.

Pushas: "feat(tester): betalväggar i sessionsramen och mätning, etapp 7".

### Efter etapp 7

Uppdatera tidslinjen i saas-leads definition och projektminnet med datum för varje push. Avläsning efter 14 dagar mot 8.3, igen efter fyra veckor. Avbrott i tidsplanen för Black Week-avläsningen 1 dec och 20 dec gäller fortfarande; de påverkas inte av etapperna eftersom kassan och kampanjen är orörda.

---

## 13. Enighet

Fylls i efter granskning av planen. Invändningar skrivs som förslag till ändring med motivering; står ingen invändning här gäller planen som den är.

### UX-designern

UX-designern: eniga. Granskad 2026-11-20. Planen håller alla mina avgörande ställningstaganden om interaktion och layout: en ram, sidomenyn borta, välj + Nästa överallt, de två kryssrutorna i Träna, uppgiftsarket från räknaren, ett påstående i taget, svaren utan scroll med samma mått som i förslaget, en resultatskärm, ordlistan. Det som avgjordes av saas-lead och art director (mjuk gräns i nivåtest, ingen klocka i Nivåkollen, ringen som enda klockform, "Vet inte" bara i Träna, grönt och rött efter facit) ligger inom deras mandat och ändrar inte gesten eller layouten.

Ändringar jag gjort i planen, alla för att en byggare inte ska behöva gissa:

1. **3, tabellen och 3.5:** Ord och text flyttad från Mellan till Bred på alla nivåer. Texten i 3.5 motsade tabellen ("Mellan 560 blir två spalter? Nej"), och Bred är det enda som ger texten egen kolumn på dator.
2. **2, flaggorna:** femte flaggan `gest: 'bekrafta' | 'ett_tryck'` tillagd. Personlighetens ett-tryck och Träna-inställningen var annars beteenden utan hem i ramen, och gesten skulle ha avgjorts per typ.
3. **1, foten:** "Vet inte"-knappen heter "Vet inte" när förklaringen är avstängd och försvinner när uppgiften är besvarad. Etiketten "visa förklaringen" skulle annars ljuga när förklaringen är avstängd.
4. **1, tangentbord:** med `ett_tryck` är tangenten svaret. Annars hade tangentbordet krävt Enter där trycket inte gör det.
5. **2, nivåtest:** ett bekräftat svar får ändras genom att gå tillbaka i lägen med fri navigering, på samma route som i dag. Tabellen sa "gå tillbaka: ja" utan att säga om svaret får ändras.
6. **2, personlighet:** foten har ‹ och en inaktiv "Nästa" som bara används efter att man gått tillbaka, "Lämna in" sist. Ett-tryck-läget hade annars ingen definierad fot.
7. **6, ordlistan:** raden "Vet inte" uppdaterad enligt punkt 3.

Ingen av ändringarna rör art directors avsnitt eller något beslut i beslutstabellen.

### Art director

Art director: eniga. Planen följer mitt förslag i färgroller (7.2), typskala (7.3), ikonografi (7.4), rörelse (7.5), klockans form (ringen) och scenerna (4.1). Jämkningarna som gick emot mig (Förklaringen under svaren i stället för ett ark från foten, radie 12, huvud 56 på dator, räknaren "3 / 15" kvar i huvudet, referensringen i Träna) är layout- och affärsbeslut som inte rubbar det visuella systemet, och jag står bakom dem. Fyra rättelser gjorda direkt i planen 2026-11-20:

1. **Avsnitt 1, Ramens spalt:** framstegsstapeln går alltid över hela ramens bredd; huvudets och fotens innehåll följer kolumnen. Planen sa båda, en byggare hade fått gissa.
2. **Avsnitt 3.1, tre fasta svar:** de är Svarskort utan bricka med samma tillstånd som raderna, bock och kryss 16 px före texten. Annars hade verbalt fått en egen grön och röd.
3. **Avsnitt 7.2, ringens utseende per läge:** ny text med färg, tal och beteende efter noll för gräns, referens och ingen (bågen full i koppar och "+1:23" efter noll, referensringen aldrig koppar, fast viewBox). Beslut 1a sa vad ringen gör, inte hur den ser ut.
4. **Avsnitt 7.5:** ingen vibration på webben; haptik bara i appen vid rätt och fel i Träna, som avsnitt 1 redan sa. De två styckena motsade varandra.

### Ändring efter enigheten

2026-11-20: kryssrutan "Ett tryck räcker som svar" är struken efter samråd med ägaren. Träna har bara "Förklaring efter varje svar", och gesten är tryck markerar, knappen bekräftar i alla lägen utom personlighetstestet. UX-designerns underskrift ovan nämner två kryssrutor; den gäller planen med den här ändringen.

### saas-lead

Planen är jämkad och godkänd av saas-lead 2026-11-20. Alla skiljelinjer är avgjorda enligt principen; inga öppna frågor till ägaren utom rapporten när allt är pushat.
