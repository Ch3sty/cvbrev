# Byggbrief: publika sidor i Rummens material (2026-10-12)

Art director till Opus 5.5. Det här är slutprodukten av beslutet 2026-10-12: ägaren går på rekommendationen att publika sidor tar Rummens **material** (väggen, kopparn, provbladet, instrumenten som stillbilder) men inte dess **mekanik** (dörrnav, mörkt läge, rörelse, ring, serie, märken). Opus skissar en artefakt efter den här briefen; ägaren godkänner artefakten före bygge i kod. Ingen kod ändras av den här omgången.

Underlag, i prioritetsordning när något krockar: (1) den här briefen, (2) `docs/design/spec-rummen-2026-10-10.md` avsnitt 0, 3 och 4 (tokens och byggstenar), (3) `docs/designsystem.md` v3 i worktree `design/rummen-klar` (`.claude/worktrees/agent-a7eef925647d8c234/docs/designsystem.md`), (4) Tråden v2.1 (`docs/designsystem.md` på `main`) för det som rör publika sidor och inte sägs här, (5) `docs/design/tester-lyft-2026-10-11/riktning.md` för illustrationsstilen.

**Källor för copy.** Allt som rör paket, pris och gratisnivå läses ur worktree `design/rummen-klar` (våg 5 är byggd där: Jobbcoach Premium, 149 kr i månaden, inget annat säljs). Strängar som inte rör paket läses ur `main`. Står en sträng i båda och skiljer sig, gäller worktreet. Inga strängar hittas på: finns texten inte i koden eller i den här briefen, lämnas platsen tom med noten "copy saknas" i artefakten.

---

## 0. Vad som ligger fast

- **SEO-spärren.** h1, `<title>`, `description`, canonical, rubrikernas text och ordning i artikeln, alla interna länkar och schema rörs inte. Rubriker står i HTML, aldrig i SVG. Artikelbilder 1200×630 följer `reference_article_image_standard` och berörs inte.
- **Paketet.** Ett paket: Jobbcoach Premium, 149 kr i månaden (`SALD_PLAN = 'all_month'`). Fulla namnet en gång per yta, sedan "Premium". Knappen heter alltid `kopKnapp()` = "Köp Premium, 149 kr i månaden". Pris efter namnet, verbet Köp. Aldrig "Lås upp", aldrig "Hela paketet", "Träningspaketet", "Dagspasset", "Allt-månaden" (de säljs inte längre; spec-rummen 17.3).
- **Gratisnivån publikt** (spec-rummen 23.3): publika sidor nämner aldrig "en gång per dygn" eller "varje dag". Det som lovas är: fem frågor att prova utan konto, en nivåmätning med genomgång och ett första träningspass med konto. Testsidans strängar tas ur worktreet, där 23.3 redan är genomförd.
- **Kundcitat med namn** är borta från verktygssidorna (spec-rummen 23.4). Ritas inte.
- **Besökaren är inte inloggad.** Inget instrument visar riktig data. Alla instrument är stillbilder med fasta exempeltal, märkta med chipen "Exempel".
- **CDN-cache ett dygn.** Inget på sidan får bero på besökaren, klockan eller inloggning. Väggens innehåll är detsamma för alla.
- **LCP-budget publikt** (prestandabudgeten gäller även här): väggen är CSS-toning, inte bild; alla SVG:er är inline och små; inga nya typsnitt utöver Schibsted Grotesk och Inter som redan laddas; ingen JavaScript för att visa något som syns utan interaktion.
- **Logotypen** `#F97316` står kvar oförändrad, överallt.

---

## 1. Idén i tre meningar, och de tre besluten

Publika sidor är entrén till samma hus som inloggat: varje sida öppnar med en mörk vägg i det rum den leder in i, med rubriken och ett instrument som visar vad produkten gör, och under väggen ligger ett ljust golv med papper. Kopparn är den enda accenten och den enda knappen, före och efter inloggningen. Bilderna är provbladet och instrumenten, tecknade med samma hand som i Träningen, aldrig en scen bredvid ett instrument och aldrig en ikon i en ruta.

**Beslut 1: väggen som hero, en per sida.** Ersätter septemberlinjens InkPanel och hero-på-mark. Väggens kulör är rummet sidan leder in i: startsidan skog (Jobbsöket, kontoret där allt möts), `/priser` grafit (kontot och kassan), `/verktyg/rekryteringstester` indigo, artiklar i testklustret indigo. Ingen annan mörk yta på sidan: mediebevisen, paketet och slutkortet står på papper.

**Beslut 2: koppar ersätter orange, kopparknappen ersätter bläckknappen.** Även headerns "Skapa konto". Väggen säger var du är, det lyfta kortet vad du gör: kopparknappen sitter i det lyfta kortet som överlappar väggen, aldrig på själva väggen. Bytet mäts i bygget (registreringar före och efter, spec-rummen beslut 5), inte i artefakten.

**Beslut 3: provbladet och instrumenten är bildspråket, familjen byggs ut.** Testernas fem provblad återanvänds ordagrant. Fyra nya provblad ritas i samma stil för CV, personligt brev, matchning och Jobbcoachen, plus huset för prissidan och två matriser för artikelns exempel. PriserScener-familjen används inte på de fyra sidorna (den står kvar på sidor utanför den här omgången tills de ritas om). Testerna står först där verktygen räknas upp.

---

## 2. Tokens

Bara ljust läge publikt. Alla värden som CSS-variabler på `:root` i artefakten, rummets variabler på varje sidas yttersta element via `data-rum`. Hex aldrig i markup.

### 2.1 Gemensamt (ur `globals.css` i worktreet, `:root:has([data-rum])`)

| Variabel | Värde | Roll |
|---|---|---|
| `--koppar` | `#E07A2F` | Knapp, linje, punkt, fokusring. Aldrig text. |
| `--koppar-djup` | `#C4621F` | Knappens toning, mörka änden (toningen får inte gå mörkare) |
| `--koppar-text` | `#1A1206` | Text på kopparknappen (6,2:1) |
| `--koppar-ink` | `#A8491A` | Koppar som text på papper och golv (5,8:1 på papper) |
| `--koppar-ljus` | `#F4B98A` | All kopparfärgad text på väggen (6,6:1 mot vagg-2) |
| `--koppar-mjuk` | `#FBE3D0` | Mjuk yta i illustrationer på papper |
| `--ink-1` / `--ink-2` / `--ink-3` | `#1A1A1F` / `#4A4A55` / `#65656E` | Rubrik, brödtext, metadata |
| `--papper` / `--papper-2` | `#FFFFFF` / `#F4F3F0` | Kort, fält |
| `--kant` / `--kant-stark` | `#E3E1DC` / `#C9C6BF` | Hårlinje, upphöjd kant |
| `--positiv` / `--positiv-mjuk` | `#2F7D5B` / `#DCEFE5` | Bara ordet "Ingår" i tabellen, aldrig bockar |
| `--fel` | `#B3382E` | Används inte på de fyra sidorna |
| `--lyft` | `0 1px 2px rgba(20,20,40,.05), 0 10px 24px -14px rgba(20,20,40,.18)` | Det lyfta kortet, inget annat |
| `--svav` | `0 8px 24px rgba(28,25,23,.12), 0 1px 2px rgba(28,25,23,.08)` | Bara megameny och mobilmeny (ritas inte öppna) |
| `--vagg-kant` | `rgba(255,255,255,.12)` | Hårlinje och glasknappens kant på väggen |
| `--fokus` | `--koppar-ink` på golv och papper, `--koppar-ljus` på väggen | `outline: 2px solid; outline-offset: 2px` |

### 2.2 Rummen (ljust läge)

| Rum | `data-rum` | `--vagg` / `--vagg-2` / `--vagg-3` | `--vagg-ink` / `--vagg-mjuk` / `--vagg-svag` | `--golv` | `--ton` / `--ton-ink` | `--ljus` |
|---|---|---|---|---|---|---|
| Indigo (tester) | `tran` | `#1B2246` / `#2B3470` / `#121737` | `#F5F6FC` / `#AEB4DA` / `#6F78B0` | `#EBEDF6` | `#DFE3F6` / `#3B4790` | `#93A0EC` |
| Petrol (CV) | `cv` | `#113538` / `#1D4D51` / `#0B2628` | `#F1F8F7` / `#A3C9C8` / `#5C918F` | `#E6EFEF` | `#D7ECEA` / `#1E5F5F` | `#7FCFCA` |
| Plommon (brev) | `brev` | `#3A1930` / `#56284A` / `#280F22` | `#FBF3F8` / `#D6AFC8` / `#9C6A8C` | `#F2EAEE` | `#F0DCE8` / `#6E2B59` | `#E29DCB` |
| Skog (jobbsöket) | `jobb` | `#1B3324` / `#2A4C37` / `#112219` | `#F2F8F2` / `#A9C9B1` / `#6A9676` | `#E8EEE7` | `#DCEBDD` / `#245C37` | `#8FD3A0` |
| Grafit (konto, priser) | `neutral` | `#26262C` / `#36363E` / `#1A1A1F` | `#F5F4F7` / `#B9B8C2` / `#7C7B88` | `#ECEBE9` | `#E2E1E6` / `#3C3C46` | `#C9C8D2` |

Rum per sida: startsidan `jobb`, `/priser` `neutral`, `/verktyg/rekryteringstester` `tran`, artikeln `tran` på väggen men **golv grafit** (`#ECEBE9`): långa texter läses på neutralt underlag, rummets kulör bär väggen och tonen.

Kontrast som ska hålla (räknad i spec-rummen 3.5): vagg-ink på vagg 14,3:1, vagg-mjuk på vagg 7,6:1 (ner till 11 px), koppar på vagg 5,1:1 (bara linje och punkt), koppar-ljus på vagg-2 6,6:1, koppar-text på koppar 6,2:1, ink-3 på golv 4,9:1, ton-ink på ton 6,6:1.

### 2.3 Typografi

Två familjer, inga nya. Schibsted Grotesk (`--display`) bär h1, h2, stora tal och värdemeningar. Inter (`--body`) allt annat i 400, 500 och 600. Vikterna 700 och 800 finns bara i display.

| Roll | Mobil (400 px) | Dator (från 1024) | Vikt, spårning |
|---|---|---|---|
| h1 publikt | 32 / 35 | 60 / 60 | display 800, -0.025em, `text-wrap: balance`, max 16 ch |
| Rad under h1 (prissidan) | 18 / 24 | 20 / 28 | display 600 |
| h2 publikt | 28 / 32 | 40 / 44 | display 700, -0.025em |
| Kortnamn | 24 / 28 | 26 / 30 | display 700 |
| Värdemening | 18 / 24 | 18 / 24 | display 600 |
| Bevis-tal, stort tal | 28 / 30 | 32 / 34 | display 700, tabulära siffror |
| Eyebrow | 12 / 16 | 12 / 16 | Inter 600, versaler, 0.08em |
| Ingress | 16 / 27 | 18 / 29 | Inter 400, en fetad mening i 600 ink-1 |
| Brödtext | 15 / 24 | 15 / 24 | Inter 400, ink-2 (artikeln 17 / 29 på dator) |
| Kortrubrik, radrubrik | 16 / 22 | 16 / 22 | Inter 600 |
| Metadata | 13 / 18 | 13 / 18 | Inter 400, ink-3 |
| Knapp | 15 / 20 | 15 / 20 | Inter 600 |
| Axeltext i SVG | 11 | 11 | enda texten under 12 px, alltid med `aria-label` som läser ut talen |

På väggen är rubrik och tal `--vagg-ink`, ingress och metadata `--vagg-mjuk`, kopparfärgad text alltid `--koppar-ljus`.

### 2.4 Avstånd, radier, bredd

- Rutnät 4 / 8 / 12 / 16 / 24 / 32 / 48. Sektionsmellanrum 64 på mobil, 88 på dator. Inget annat.
- Innehållsbredd max 1200, sidmarginal 16 på mobil, 48 på dator. Väggen går ut i full bredd, innehållet i den följer samma mått.
- Väggen: toning `linear-gradient(168deg, var(--vagg-2), var(--vagg))`, ljuskant `box-shadow: inset 0 1px 0 rgba(255,255,255,.14)`, rundade **nedre** hörn 28 (20 på mobil), övre hörn raka. Padding 24 upptill och 56 nedtill på mobil, 48 och 84 på dator (så det lyfta kortet får plats att överlappa).
- Det lyfta kortet: papper, radie 16, `--lyft`, `margin-top: -30px`, padding 20 (24 på dator), max-bredd 760 när det står ensamt.
- Kort: papper, 1 px `--kant`, radie 16, padding 20 (24 dator). Kontroller och fält radie 12. Chips radie 8, höjd 28, 12/500.
- Knappar 48 px höga, radie 12, full bredd på mobil, auto på dator.
- Rader i lista: 56 px minsta höjd, hårlinje mellan, 12 px mellanrum i kort.

---

## 3. Gemensamma byggstenar och regler

Namnen följer `src/components/rum/` i worktreet så att bygget efter artefakten blir en mappning, inte en nyritning.

**Header (alla sidor).** 64 px på papper med hårlinje under. Logotyp (ruta `#F97316` med J, ordet Jobbcoach.ai i display 800 19 px). Fem val i Inter 15/500: Funktioner, Priser, Vad vi erbjuder (med chevron, öppnar megamenyn; ritas stängd), Artiklar, Om oss. Det aktiva valet i `--papper-2`. Höger: "Logga in" som textlänk, "Skapa konto" som **kopparknapp 40 px**. Mobil: logotyp, "Skapa konto" 36 px koppar, meny-ikon (`IkonMeny` ritas som tre streck 24 px, stroke 1,75). Megameny och mobilmeny ritas inte öppna.

**Vagg.** Sektionen överst. Innehåll: eyebrow (`--vagg-mjuk`, versaler), h1, ingress med fetad mening, bevis-tal i rad (display 28/700 i `--vagg-ink`, etikett 13 i `--vagg-mjuk`), och instrumentet eller provbladet. Dator: text vänster (max 60 %), instrument höger i egen kolumn. Mobil: instrument under texten, aldrig ovanpå. Chipen "Exempel" (12/500, `--vagg-mjuk` text, `--vagg-kant` kant) står i instrumentets övre högra hörn när instrumentet visar tal. Sekundär handling på väggen är en **glaslänk** (`KNAPP_GLAS`: vit 8 %, kant `--vagg-kant`, text `--vagg-ink`), aldrig koppar.

**LyftKort.** Det första elementet under väggen, överlappar 30 px. Bär sidans primära handling: eyebrow (`--koppar-ink`, versaler, valfri), rubrik 20/700 display, text 15/24 ink-2, kopparknapp (`KNAPP_PRIMAR`: toning `linear-gradient(180deg, var(--koppar), var(--koppar-djup))`, text `--koppar-text`), sekundär som textlänk (`LANK`: ink-1, understruken med `--kant-stark`), fot i metadata under hårlinje. På dator får kortet en bild till höger (provblad 160×120) när det finns en.

**Kort, Rader, Chip, SektRubrik.** Som spec-rummen 4.4. Listor i kort har bock i `IkonCheck` 20 px ink-1 (aldrig koppar, aldrig grön). Radrubrik 16/600, meta 13 ink-3, höger `IkonChev` 24 ink-3.

**Regler som gäller alla fyra sidor**
1. En vägg per sida, alltid överst. Ingen annan fylld mörk yta.
2. Exakt en kopparknapp inom varje skärmhöjd på 400 px. Väggens handling bor i det lyfta kortet. Allt sekundärt är textlänk, kantknapp (`KNAPP_SEKUNDAR`: papper, kant `--kant-stark`) eller glaslänk.
3. Koppar är linje, punkt och knapp. Som text bara `--koppar-ink` i eyebrows på det lyfta kortet och i prisraden, och `--koppar-ljus` i instrumentets tal på väggen. Aldrig kant, aldrig bakgrund, aldrig bock, aldrig dekor.
4. Rytm: två sektioner i följd har aldrig samma form. Vägg, lyft kort, rader på golv, kort, lista, papper, FAQ. Högst tre kort i samma vikt i följd; det fjärde byter form.
5. Instrumentet är bilden. En sida har aldrig ett instrument och en scen bredvid varandra. Provbladet står alltid på papper (kort) eller på väggen med `--vagg-ink` som kontur, aldrig på golvet utan kort.
6. Ett tal står aldrig ensamt: bevis-tal har en etikett, instrument har en rad under som säger vad de visar.
7. Ingen rörelse i artefakten. Inga `<animate>`, inga CSS-animationer, inga övergångar utom hover på länkars understrykning (120 ms).
8. Serverrenderat i bygget: allt som syns utan interaktion ska gå att rendera som HTML. Artefakten bevisar det genom att inte behöva JavaScript för något utom fliknavigeringen och `details`.

**Footer (alla sidor).** På golvet, hårlinje upptill. Fyra kolumner: Jobbcoach.ai med texten "CV, personligt brev, tester och matchning för svensk arbetsmarknad. Byggt i Sverige, med svenska källor." och länkarna ur `FORETAG`; kolumnerna "Skriv och förbättra", "Hitta och träna" (Hitta jobb plus Träna) och "Läs" ur `src/components/landing/nav-data.ts`. Bottenrad: © 2026 Jobbcoach.ai · Integritetspolicy · Användarvillkor · Cookies, och "Byggt i Sverige". Inga ikoner, ingen glöd.

---

## 4. Sektionsföljd per sida

Koderna (S1, P1 …) används i artefaktens kommentarer och i granskningen.

### 4.1 Startsidan `/` (rum `jobb`, skog)

`<title>` och `description` ur `src/app/layout.tsx` rad 39 till 40, oförändrade: "Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester" / "Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige." Alla strängar nedan ur `src/components/landing/start/StartSida.tsx` i worktreet om inget annat sägs.

| Kod | Sektion | Form | Innehåll |
|---|---|---|---|
| S1 | Väggen | vägg, skog | Eyebrow "Bekräftat av SVT, SR, DN och Kollega". h1 "Därför får du inte svar på dina ansökningar" (oförändrad). Ingressen ordagrant ur `StartHero`, med den fetade meningen "Är ditt CV inte optimerat når det aldrig en människa." Bevis: "1 brev" / "om dagen, gratis" och "60 sek" / "till första CV-poängen" (kontoräknaren utelämnas: den är levande data). Glaslänk "Se hur det fungerar" till `#sa-jobbar-vi`. Instrument: **Spåret** (avsnitt 5.3) med tre exempelrader, chip "Exempel". |
| S2 | Lyft kort | LyftKort | Rubrik "Skapa konto gratis" som rubrik och knapp: kopparknapp "Skapa konto gratis" (`data-cta="hero-primary"`, `/register`). Text: `GRATIS_RAD` ur `priser-data.ts` i worktreet ("4 mallar, en CV-analys, ett personligt brev och en nivåmätning i testerna ingår utan att betala.", mallantalet ur `FREE_TEMPLATE_COUNT`). Fot: "Inget kort. Säg upp kontot när du vill." (ny rad, får bytas av copywritern). |
| S3 | Så jobbar vi | kort på golv, `id="sa-jobbar-vi"` | Eyebrow "Så jobbar vi", h2 "Vi matchar din erfarenhet mot tjänstens krav", texten ur `StartMatchning`. Textlänk "Skriv ett brev gratis" till `/skapa-brev/start` och metaraden "Ett brev om dagen utan att betala". Bild höger: **illu-brev-blad** (nytt, 5.2). |
| S4 | Tre verktyg | tre dörrkort | h2 "Tre verktyg som gör ansökan starkare" (oförändrad). Ordningen byts: **Rekryteringstester först och dubbelt så bred på dator** (spänner två kolumner), sedan CV-analys och Jobbmatchning. Varje dörrkort: övre delen en liten vägg i rummets kulör (indigo, petrol, skog; höjd 140 på mobil, 180 i det breda kortet) med provbladet i `--vagg-ink`-kontur, nedre delen papper med `Dorr*`-ikonen 24 och rummets namn som eyebrow, kortnamnet i display 24/700, värdemeningen och texten ur `VERKTYG`, textlänk "Så fungerar det". Bilder: illu-matris (tester), illu-cv-blad (CV-analys), illu-matchning (Jobbmatchning). Det breda testkortet visar dessutom **illu-provlage** bredvid illu-matris på dator (två provblad på samma vägg, 24 px mellanrum). |
| S5 | Mediebevisen | rader på golv | h2 "Robotarna har redan läst ditt CV." och texten ur `StartMedia` (`text`). Fyra rader ur `MEDIER`: källa som eyebrow i ink-3 (180 px kolumn på dator), rubrik i display 19/700 ink-1, text 14 ink-2, extern länk. Hårlinjer, ingen fylld yta. Textlänk sist: "Så hjälper vi dig komma förbi" till `/priser`. |
| S6 | Resten av jobbsöket | lista | h2 "Och resten av jobbsöket", de sju raderna ur `MER` som i dag (namn 16/600, text 14). |
| S7 | Premium | kort på papper, kant `--kant-stark` | Samma anatomi som P2 nedan (listan "Allt i Premium", prisrad, kopparknapp `kopKnapp()`, fotnot). En kopparknapp, långt från S2. |
| S8 | Frågorna | `details` på golv, två kolumner på dator | h2 "Svaren på det du undrar", `START_FAQ` ur worktreet (svaret på "Vad kostar det" nämner Premium, inte paketen). Första öppen. Rad sist: "Fler frågor om paketen? Se priserna". |

### 4.2 `/priser` (rum `neutral`, grafit)

`<title>` och `description` ur `PRISER_META` i `src/app/(public)/priser/components/priser-data.ts` (worktreet): "Priser: Jobbcoach Premium, 149 kr i månaden | Jobbcoach.ai" / "Jobbcoach Premium kostar 149 kr i månaden. CV-analys, personliga brev, rekryteringstester, jobbmatchning och Jobbcoachen ingår. Säg upp när du vill." Copy ur `src/components/pricing/paket-copy.ts` och `priser-data.ts` i worktreet. Schema (Product med AggregateOffer, FAQPage) rörs inte.

| Kod | Sektion | Form | Innehåll |
|---|---|---|---|
| P1 | Väggen | vägg, grafit | Eyebrow `HERO.eyebrow` "Priser". h1 `HERO.h1` "Jobbcoach Premium, 149 kr i månaden" (fulla namnet, enda gången på sidan). Rad under i display 18/600 `--vagg-ink`: `HERO.rad` = `PLANS.all_month.beskrivning` "CV, personliga brev, tester, jobbmatchning och Jobbcoachen". Ingress `HERO.ingress` "Allt är öppet från första minuten. Ingen bindningstid, du säger upp med ett klick." Instrument: **Huset** (nytt, 5.2), inget "Exempel"-chip (inga tal). |
| P2 | Premiumkortet | LyftKort, max-bredd 1200 (två kolumner på dator) | h2 `PAKET_KORT.allt.listEtikett` "Allt i Premium", listan `PAKET_KORT.allt.ingar` (fem rader ur `HELA_PAKETET_RADER`, bock i ink-1). Höger kolumn (hårlinje till vänster på dator, ovanför på mobil): prisrad `prisrad` "149 kr i månaden, säg upp när du vill.", kopparknapp `kopKnapp()`, fotnot "Kortbetalning via Stripe. Kvitto på mejl." Under kortet på mobil: ankarraden `VALJARE.ankare` (Gratisnivån · Så fungerar det · Så guidar vi dig). |
| P3 | Gratisraden | streckad rad på papper | `GRATIS.rubrik` "Vill du se först?" i fet, `GRATIS.delar` med de fetade delarna, kantknapp `GRATIS.knapp` "Skapa konto gratis". Vänster: illu-provlage i 96 px bredd (ersätter `IlluScenGratis`). |
| P4 | Funktionerna | fem kort, det första brett | h2 `FUNKTIONER.h2`, ingress `FUNKTIONER.ingress`. Ordningen: **Rekryteringstester först och brett**, sedan CV-analysen, Personliga brev, Matchade jobb, Jobbcoachen. Varje kort: provbladet vänster (160×120 på dator, 96 högt över texten på mobil), rubrik display 22/700, `sub` ("Ingår i Premium. Gratis: …") i meta, text, stegen som numrerad lista med display-siffror, textlänk där `lank` finns. Bilder: illu-provlage (tester, bredvid illu-matris i det breda kortet), illu-cv-blad, illu-brev-blad, illu-matchning, illu-coach. |
| P5 | Hjälpredan | kort, två kolumner | h2 `GUIDE.h2`, ingress, etikett "11 steg", de elva stegen med numrerade rundlar (första fylld ink-1, resten kant). |
| P6 | Förtroende | tre kort | `FORTROENDE` med ikonerna `IkonPrisKlick`, `IkonPrisLas`, `IkonPrisKr` ur `PriserScener.tsx` ordagrant (40 px, ink-1). |
| P7 | Rad för rad | tabell i kort | h2 `JAMFORELSE_RUBRIK` "Vad som ingår, rad för rad". `COMPARISON` som riktig `<table>` (tre grupper, kolumner Funktion / Gratis / Premium), ord i cellerna ("Alla 41", "Utan tak", "Ingår inte"), aldrig prickar eller bockar. `ja` i ink-1 600, `g` i ink-3, "Ingår inte" i ink-3. Grupprubriker som rader i `--papper-2`. På mobil scrollar tabellen i sitt kort, sidan aldrig. |
| P8 | Frågorna | `details`, två kolumner | h2 `PRISER_FAQ_RUBRIK` "Fler frågor om priset?", `PRISER_FAQ_ITEMS`, första öppen. |

### 4.3 `/verktyg/rekryteringstester` (rum `tran`, indigo)

`<title>` och `description` ur `src/app/(public)/verktyg/rekryteringstester/layout.tsx` (oförändrade sedan `main`): "Rekryteringstester: träna inför urvalet | Jobbcoach.ai" / "Träna på matrislogik, verbalt och numeriskt resonemang i samma format som SHL, Cut-e och Assessio använder. Grundnivån är gratis, ingen kortuppgift." Alla strängar ur `page.tsx` **i worktreet** (där 23.3 är genomförd) och FAQ ur `components/rekryteringstester-faq-data.ts`. Schema (WebApplication, HowTo, FAQPage) rörs inte. Brödsmulor Hem / Verktyg / Rekryteringstester står på väggen i `--vagg-mjuk`.

| Kod | Sektion | Form | Innehåll |
|---|---|---|---|
| T1 | Väggen | vägg, indigo | Brödsmulor. Eyebrow "Rekryteringstester · kom förberedd till provet". h1 "Träna på rekryteringstester innan arbetsgivaren testar dig" (oförändrad). Ingress och fetad mening ordagrant ur `page.tsx`. Bevis ur `loften` i worktreet: "1 mätning" / "och första passet gratis med konto", "20 min" / "per pass", "5 frågor" / "att prova utan konto". Glaslänk "Se alla tester" till `#testtyper`. Instrument: **Kurvan** (5.3) med exempeldata och chip "Exempel", under den raden "Nivån per dag, ommätningar som tyngre punkter, provdagen som linje." |
| T2 | Lyft kort | LyftKort, `id="prova"` | Ur `RekryteringstesterProvaKort.tsx`: rubrik "Gör ett prov direkt, utan konto", text "Du behöver inte registrera dig för att se var du står. Fem frågor tar ett par minuter.", de tre punkterna ur `PUNKTER` som rader, kopparknapp "Prova fem frågor" med `IkonPil` (ersätter lucides ArrowRight), `data-cta="rekryteringstester-prova"`, länk `/verktyg/rekryteringstester/prova`. Bild höger: illu-matris. |
| T3 | Så fungerar det | numrerade rader på golv, `id="sa-funkar-det"` | h2 "Så fungerar det", ingress och de fyra raderna ur `STEG`, siffror i display 32/800. Textlänk "Starta gratis test" till `/register?borja=tester`. |
| T4 | Tre testtyper | tre kort, `id="testtyper"` | Eyebrow "Kognitiva tester", h2 "Tre testtyper, alla gratis att börja", ingressen ur worktreet (nämner Premium, inte Träningspaketet; nämner inte dygn). Korten: illu-matris, illu-verbalt, illu-numeriskt över texten ur `TESTTYPER`. Textlänk "Starta gratis test". |
| T5 | Personlighetsprofil | kort med lista | Eyebrow "Personlighetsprofil", h2 "Ta reda på vad rekryteraren ser i dig", ingressen ur worktreet, de fem raderna ur `BIG_FIVE` som rader med radrubrik och text, illu-personlighet till höger på dator. Textlänk "Gör personlighetsprovet, tjugo påståenden utan konto" till `/verktyg/personlighetstest`. |
| T6 | Vad du tränar på | lista i två kolumner på golv | Eyebrow "Vad du tränar på", h2 "Sex färdigheter som avgör testet", ingress, de sex raderna ur `FARDIGHETER`. |
| T7 | Vad som ingår | tre rader i kort | Eyebrow "Vad som ingår", h2 "Träning som syns på resultatet", `INGAR` ur worktreet (tre rader: "Gratis att prova", "Rapport efter varje pass", "Premium tar bort taket"). |
| T8 | Inför testdagen | rader på golv, `id="forbered-dig"` | Eyebrow "Inför testdagen", h2 "Så förbereder du dig inför ett rekryteringstest", ingressen (TRR och Ingenjören) och de sex raderna ur `FORBEREDELSE`. På dator står **illu-scen-vagen** (240×180) i egen kolumn till höger, på papper. |
| T9 | Guider | rader, `id="guider"` | Eyebrow "Fördjupning", h2 "Guider per testtyp", ingress, de nio raderna ur `GUIDER` med länkarna ordagrant (intern länkkraft). Symbol 48 till vänster på varje rad: `SymMatris` för logik, matris, rotation, deduktiva, Alva; `SymSiffror` för numeriska; `SymOrd` för verbala; `SymPerson` för personlighet och MAP. |
| T10 | Slutet | kort på papper | Ur `slut` i worktreet: eyebrow `paketMedPris(SALD_PLAN)` "Jobbcoach Premium, 149 kr i månaden" i koppar-ink, h2 "Träna nu. Kom förberedd sen.", texten, kopparknapp "Starta gratis test", textlänk "Se hur det fungerar". **Inget citat** (23.4). |
| T11 | Frågorna | `details`, två kolumner | h2 "Vanliga frågor om rekryteringstester", ingressen "Hittar du inte svaret? Hör av dig." med mejllänken, de åtta frågorna ur FAQ-filen. |

### 4.4 Artikeln `/artiklar/alva-labs-logiktest` (vägg `tran`, golv grafit)

Vald för att den är testklustrets senaste, bygger på leverantörens egna hjälpsidor och har tre exempeluppgifter i ord som provbladet kan rita. Källa: `content/artiklar/alva-labs-logiktest.mdx`. `<title>` = `seoTitle` "Alva Labs logiktest: format, resultat och öva gratis", `description` ur frontmatter (oförändrad), h1 = `title` "Alva Labs logiktest: så fungerar testet, så läser du resultatet och så övar du". Alla h2 ordagrant och i samma ordning, med samma id som `page.tsx` genererar (gemener, å och ä till a, ö till o, bindestreck). Brödtexten ordagrant, hela artikeln (2 869 ord, lästid 15 min enligt `Math.ceil(ord / 200)`). Ramen följer `src/components/artiklar/ArtikelRam.tsx`; reklamcopy ur `src/components/artiklar/reklam/reklam-copy.ts` i worktreet.

| Kod | Sektion | Form | Innehåll |
|---|---|---|---|
| A1 | Väggen | vägg, indigo, lägre (padding 24 / 40) | Brödsmulor Hem / Artiklar / artikelns titel. Eyebrow "Rekryteringstester" (klustret `test`). h1. Ingressen = `description`. Författarraden: bild 40 px (rund, `--papper-2` som platshållare med initialer, ingen extern bild), "Teamet på jobbcoach.ai" som h3 14/600, raden med titel ur `src/lib/authors.ts` · "Granskad av HR-experter" · "23 september 2026" · "15 min läsning", allt i `--vagg-mjuk`. Instrument: **Skalan 1 till 10** (5.2, illu-skala-1-10) till höger på dator, under på mobil, chip "Exempel". |
| A2 | Artikelbilden | platshållare i brödtextens bredd | Ruta i 1200×630-proportion på `--papper-2` med kant, texten "Artikelbild, webp i produktion: /images/artiklar/alva-labs-logiktest.webp" i meta. Ingen extern bild i artefakten. |
| A3 | Snabbsvar | kort på papper | Rubriken "Snabbsvar: hur fungerar Alva Labs logiktest?" som `<p>` i display 18/700 (inte h2, den står inte i rubrikträdet i dag heller som riktig h2 utanför MDX-komponenterna? Den står som h2 i MDX; behåll h2 med samma text, men stilen är kortets), texten ordagrant. Ersätter dagens `bg-slate-50`. |
| A4 | Brödtexten | tvåkolumnsram från 1024: text max 720, sidokolumn 320 | Alla h2 och stycken ordagrant. Länkar understrukna med `--kant-stark`. Under h2 "Tre exempeluppgifter, och hur du löser dem" ritas de tre exemplen som **tre kort med varsitt provblad**: exempel 1 = illu-matris ordagrant (latinsk kvadrat, lösningen kvadrat, kopparn på rätt svar), exempel 2 = illu-matris-tva-regler (nytt), exempel 3 = illu-matris-sammanslagning (nytt). Texten för varje exempel står ordagrant bredvid bilden. Under h2 "Så läser du resultatet: skalan 1 till 10" står illu-skala-1-10 en gång till i brödtextens bredd med raden "5 och 6 är de vanligaste resultaten. Över 9 och under 2 är ovanliga." |
| A5 | Inline-kortet | kort på papper, efter h2 "Kan man öva på Alvas logiktest gratis?" | `INLINE.test`: rubrik "Öva på frågorna innan de räknas" som `<p>` (inte rubrikelement), texten, kopparknapp "Gör ett övningstest" till `/verktyg/rekryteringstester`, paketraden i meta. Bild: illu-provlage. |
| A6 | Slutkortet | kort på papper, kant `--kant-stark`, efter sista stycket | `SLUT.test`: etikett "Jobbcoach Premium" som eyebrow i koppar-ink, rubrik "Alla nivåer. Klockan på." som `<p>` display 22/700, de fyra raderna med bock i ink-1, kopparknapp `kopKnapp()`, gratisraden i meta. En kopparknapp per skärmhöjd: A5 och A6 ligger mer än en skärm isär. |
| A7 | Frågorna | `details` | De sex frågorna ur frontmatterns `faq`, h2 "Vanliga frågor" enligt `FAQContainer`:s nuvarande rubrik (läs komponenten; saknas rubriken, ingen h2). |
| A8 | Ämnena | chips | Taggarna ur frontmatter som chips (`--papper-2`, 12/500), länk till `/artiklar?tag=`. |
| A9 | Sidokolumnen (dator, klistrad) | | "Innehåll" som eyebrow, innehållsförteckningen med alla h2, aktiv rad med 3 px kopparlinje till vänster (`inset 3px 0 0 var(--koppar)`), i artefakten är första raden aktiv. Paketkortet `SIDO.test`: etikett "Jobbcoach Premium", rubrik "Träna med klockan på innan kallelsen kommer", text, belopp "149 kr" i display 32/700, under "i månaden, ingen bindningstid", kopparknapp `kopKnapp()`, gratisraden. (Sidokolumnens knapp och A5 syns samtidigt på dator; sidokolumnen är undantaget från regel 2, som gäller 400 px.) Sedan "Relaterade artiklar" (tre rader: matrislogik-test-guide, logiska-tester, deduktivt-induktivt-test med titlar ur respektive frontmatter), "Verktyg" (de fem länkarna ur `VERKTYG` i ArtikelRam) och "Mest lästa" (`MEST_LASTA`). På mobil står relaterade, verktyg och mest lästa efter artikeln, utan innehållsförteckning och paketkort. |
| A10 | Klistrad knapp (mobil) | 400 px | Under bottenkanten: papper, hårlinje upptill, kopparknapp "Gör ett övningstest" 48 px, safe area. Visas i artefakten som fast element i mobilvyn. |

---

## 5. SVG-förteckning

Allt är inline-SVG utan hårdkodat vitt eller svart, konturer i `currentColor`, ytor i `var(--illu-fill)`, dämpad kontur i `var(--illu-dim)`, mjuk yta i `var(--illu-mjuk)`, kopparn i `var(--illu-accent)`. På papper: `--illu-fill` = papper, `--illu-dim` = ink-3, `--illu-mjuk` = ton, kontur ink-1. På väggen: kontur `--vagg-ink`, `--illu-fill` = `--vagg-2`, `--illu-dim` = `--vagg-svag`, `--illu-mjuk` = vit 18 %. Kopparn `#E07A2F` är densamma överallt. Samma SVG byter aldrig, underlaget byter variablerna.

Alla symboler ligger i ett `<svg hidden>` med `<symbol id="…">` först i artefaktens body och används med `<use href="#…">`, så att varje motiv finns en gång i filen. Gradient-id prefixas per instans så två kurvor inte delar id.

**Kopparregeln för alla bilder:** exakt en kopparyta per bild, och den är svaret, träffen, punkten där du är. Aldrig två, aldrig koppar som kontur runt hela bilden, aldrig som bakgrund. Instrumenten får dessutom kopparlinjen (kurvan, spåret) och den enda toningen i huset, `#g-yta` (koppar 0,38 till 0 under kurvan) och `#g-lyster` (r 14 bakom dagens punkt).

### 5.1 Återanvänds ordagrant

| Källa | Symbol | Storlek | Var |
|---|---|---|---|
| `docs/design/tester-lyft-2026-10-11/illustrationer/illu-matris.svg` | `illu-matris` | 160×120, stroke 3, radie 8 | S4 (testdörren), T2, T4, A4 exempel 1 |
| `…/illu-verbalt.svg` | `illu-verbalt` | 160×120 | T4 |
| `…/illu-numeriskt.svg` | `illu-numeriskt` | 160×120 | T4 |
| `…/illu-personlighet.svg` | `illu-personlighet` | 160×120 | T5 |
| `…/illu-provlage.svg` | `illu-provlage` | 160×120 | S4 (testdörren, dator), P3, P4 (testkortet), A5 |
| `…/illu-scen-vagen.svg` | `illu-scen-vagen` | 240×180, stroke 6 | T8, bara dator |
| `src/components/illustrations/RumSymboler.tsx` (worktreet) | `SymMatris`, `SymSiffror`, `SymOrd`, `SymPerson` | 48, stroke 2 | T9 (guiderna) |
| samma | `DorrTran`, `DorrCv`, `DorrJobb` | 24, stroke 1,75 | S4 (dörrkortens eyebrow) |
| samma | `IkonChev`, `IkonPil`, `IkonCheck`, `IkonInfo` | 24 | Rader, knappar, listbockar |
| samma | `Gradienter` (`#g-koppar-h`, `#g-yta`, `#g-lyster`) | defs | Kurvan, spåret |
| `src/components/illustrations/PriserScener.tsx` | `IkonPrisKlick`, `IkonPrisLas`, `IkonPrisKr` | 40 | P6 |

Används **inte** på de fyra sidorna: `IlluScen*` ur PriserScener och TradenScener (de står kvar på sidor utanför omgången), `MarkeMatning`/`MarkeVecka`/`MarkeNiva`/`MarkeGeneral`/`MarkeProv` (märken belönar data besökaren inte har), `illu-tomt-utveckling`, `marke-grund/avancerad/expert`, `SymPlan`, `SymVetInte`, `IlluKlusterTest` och alla lucide-ikoner (`ArrowRight` i provkortet byts mot `IkonPil`; `Menu`, `X`, `ChevronDown` i headern byts mot egna 24-px-streck i samma stil).

### 5.2 Ritas nytt, provbladsstil

Stilregeln är `riktning.md` ordagrant: viewBox 160×120, stroke 3, `stroke-linecap="round"`, `stroke-linejoin="round"`, rundade hörn 8 (aldrig skarpa, aldrig helt runda), allt på ett 8-pixelsrutnät, platta fyllningar, ingen gradient, ingen skugga, ingen bakgrundscirkel, ingen platta bakom, inga människor, ansikten, händer, hjärnor, glödlampor, raketer, trofér, medaljer, kugghjul, måltavlor, ingen text (siffror får antydas som korta streck), djup med överlapp och en dämpad kontur bakom en stark. Samma SVG fungerar på papper och vägg.

| Symbol | viewBox | Vad den säger | Innehåll | Kopparytan | Var |
|---|---|---|---|---|---|
| `illu-cv-blad` | 160×120 | Så här läser vi ditt CV, och det får en poäng | Ett CV-ark (radie 8) med ett rubrikstreck och tre radgrupper om två till tre streck i dämpad kontur, första radgruppen i stark kontur. Uppe till höger en poängring (r 18, spår i dämpad kontur) som överlappar arkets kant. | Ringens fyllda båge, cirka tre fjärdedelar | S4, P4 |
| `illu-brev-blad` | 160×120 | Brevet svarar på annonsen | Annonsen till vänster (blad i dämpad kontur, fyra rader, en rad på mjuk yta). Brevet till höger, lutat 6 grader, stark kontur, fem rader. En tunn linje från annonsens markerade rad till brevets tredje rad. | Brevets tredje rad (det stycke som svarar på kravet) | S3, P4 |
| `illu-matchning` | 160×120 | Jobben du annars hade missat, med skälen | Tre annonskort i rad (48×64, radie 8), de yttre i dämpad kontur, det mittersta i stark kontur och något högre. Under det mittersta tre små cirklar i rad (skälen). | Den första av de tre cirklarna | S4, P4 |
| `illu-coach` | 160×120 | Fråga, och få ett svar som utgår från dig | Uppe till vänster en frågerad: två korta streck i stark kontur med en liten rundad ram. Under och till höger ett svarsblad (radie 8) med fyra rader i dämpad kontur. | En kort markör vid svarsbladets första rad (den rad som svarar) | P4 |
| `illu-huset` | 240×180, stroke 6 | Premium är hela huset | Fyra väggar i rad (var 48 bred, 120 hög, rundade nedre hörn 12), fyllda platt med rummens kulörer indigo `#1B2246`, petrol `#113538`, plommon `#3A1930`, skog `#1B3324`, kontur `currentColor`. Golvet som en linje under. **Undantaget från regeln om bara ink och koppar:** huset är det enda motivet med rummens fyra kulörer, och det används bara på prissidans vägg (grafit) där kulörerna läses som dörrar. | En vågrät kopparlinje genom alla fyra väggarna på samma höjd, som slutar i en punkt i det fjärde rummet | P1 |
| `illu-matris-tva-regler` | 160×120 | Två regler samtidigt: antal och vridning | 3×3 som i illu-matris. Antalet prickar ökar med en per kolumn (1, 2, 3), figuren (en liten pil eller triangel) vrids ett kvarts varv medurs per rad. Nionde rutan tom med streckad ram. Tre svarsalternativ till höger: ett med rätt antal men fel vridning, ett med rätt vridning men fel antal, ett rätt. | Det rätta svaret | A4 exempel 2 |
| `illu-matris-sammanslagning` | 160×120 | Lägg ihop och stryk det gemensamma | Tre rutor i en rad (den enda raden som ritas, större, 40×40 var): första rutan tre linjer, andra rutan tre linjer varav en gemensam, tredje rutan de fyra linjer som bara finns i en av dem. Under: samma rad med tredje rutan tom och streckad, och två svarsalternativ. | Det rätta svaret | A4 exempel 3 |
| `illu-skala-1-10` | 380×80 (instrument, stroke 2,5) | Alvas skala 1 till 10, där 5 och 6 är vanligast | En skala med tio ticks (1, 5 och 10 större), en flack normalfördelning i dämpad streckad kontur ovanför, bandet mellan 5 och 6 på mjuk yta. Axeltext 1, 5, 10 i 11 px med `aria-label` som läser ut hela meningen. | Ticks 5 och 6 i koppar (räknas som en yta: de bär samma betydelse) | A1 (vägg), A4 |

### 5.3 Instrument som stillbilder

Ritas efter geometrireglerna i spec-rummen 4.4 och komponenterna i worktreets `src/components/rum/` (`Spar.tsx`, `Kurva.tsx` via `traning/`), med fasta exempeltal. Två viewBoxar per instrument så att axeltexten renderar 11 px på både 400 och 1200 (aldrig skalad text).

| Instrument | viewBox | Exempeldata | Regler | Var |
|---|---|---|---|---|
| **Kurvan** | 380×150 mobil, 840×170 dator | Ur `granskning-rummen-2026-10-10.md` avsnitt 5, kontrollräknad: mätning 6 okt 5,0; pass 7, 8, 9 okt 5,2, 5,1, 5,4; 10 okt 5,6; 12 okt 5,7; ommätning 13 okt 5,8; pass 14 till 19 okt stigande till 6,2; ommätning 20 okt 6,3; generalrepetition 22 och 23 okt; prov 24 okt; vilodagar 11 och 18 okt; sikte 6,5. Inga nivåer över 7,5. | y-axel tre heltal (5, 6, 7), 22 px per nivå mobil, 25 dator. Siktebandet från 6 okt, 6 px, `--ljus` på 10 %, streckad linje ovanpå. Ytan under linjen `#g-yta`. Mätning och ommätning r 5,5 med `stroke: koppar-ljus 2,5`, pass r 3,5, generalrepetition kvadrat 8×8, senaste punkten r 4,5 med `#g-lyster`. Linjen bryts vid vilodagar (separata `<path>`). Planraden längst ner (y 132): gjorda fyllda r 3, kommande ihåliga i `--vagg-svag`. Provlinjen lodrät i `--vagg-mjuk` 1,5 med "Prov" ovanför. Axeln i HTML under SVG:n (11 px): "6 okt", "i dag" i koppar-ljus vid 10 okt, "17 okt", "24 okt". Tal på väggen i `--koppar-ljus`: "Nu 5,6", "Sikte 6,5". | T1 |
| **Spåret** | 380×130 mobil, 420×130 dator (tre rader om 40) | Tre sökta tjänster utan företagsnamn: "UX-skribent, Stockholm" på station Intervju; "Projektledare, Göteborg" på Svar, "svar 8 okt, väntar"; "Kommunikatör, Malmö" på Sökt, tyst i 16 dagar. | Fyra stationer Sökt, Svar, Intervju, Erbjudande som rubrikrad 11 px. Per rad: spår i `--vagg-svag`, kopparlinje fram till aktuell station, aktuell punkt r 6,5 med lyster, passerade stationer fyllda r 4 i `--vagg-mjuk`, kommande ihåliga, tyst tjänst som ihålig kopparring r 6,5. Etikett under aktuell punkt i 11 px. Namnen i 13 px `--vagg-ink` till vänster. | S1 |

Inga andra instrument publikt. Nivåskalan med "du", dagsringen, veckoraden, poängringen (utom som del av illu-cv-blad) och märkena förutsätter en person och ritas inte.

---

## 6. Anti-listan

Ger noll träffar i artefakten (grep-bar där det går):

- Tankstreck (U+2014) och halvlångt streck som tankstreck. Kommatecken, punkt eller kolon i stället.
- `Sparkles`, gnistor, stjärnor, konfetti, emoji, maskot.
- Glow, blur, `filter: drop-shadow`, bakgrundscirklar, gradientcirklar, färgade plattor bakom ikoner, ikoner i rundade rutor på rad, prickmönster, vågdelare.
- Gradient på text, bakom ikoner eller som knappfärg utöver `KNAPP_PRIMAR`:s toning. Toningar finns bara på väggen, under kurvan, i kopparknappen och i `#g-lyster`.
- Skuggor utöver `--lyft` på det lyfta kortet. Inga `box-shadow` på vanliga kort.
- Fyra likadana kort i följd. Samma form i två sektioner i rad.
- Två kopparknappar inom samma skärmhöjd på 400 px. Koppar som kant, bock, bakgrund eller dekor. Koppar som text på väggen (bara `--koppar-ljus`).
- Två illustrationsspråk på samma sida: inga `IlluScen*` tillsammans med provblad.
- Data som text: "Bäst 93 %, 14 av 15 · 20 försök" i löptext. Huvudtal med etikett eller instrument, resten i detaljvy.
- Människor, ansikten, händer, hjärnor, glödlampor, raketer, trofér, medaljer, kugghjul, måltavlor i SVG. Text i SVG utöver axlar i 11 px.
- `<animate>`, CSS-animationer, `transition` utöver understrykning på hover.
- Hårdkodat `#fff`, `#000`, `white`, `black` i SVG. Hex i markup: bara variabler.
- Engelska gränssnittsord: Dashboard, Premium-features, Upgrade, Pricing, Sign up, Login, Cover letter (utom i artikeltitlar som rankar), Streak, Badge, Score, Level. "Logga in", "Skapa konto", "Köp", "Priser".
- "Lås upp", "gratis för alltid", "en gång per dygn", "varje dag" om gratisnivån, "Träningspaketet", "Hela paketet", "Dagspasset", "Allt-månaden", "149:-", "149 kr/mån", "per månad".
- Leverantörslogotyper. Alltid "samma format som", aldrig "samma test". Kundcitat med namn.
- Mörkt läge publikt (ingen `prefers-color-scheme`-växling av tokens; väggen är mörk i sig).
- Externa bilder, `<img src="http…">`, bitmappar, `data:`-bilder.
- `rounded-3xl`-radier (över 24), `font-bold` utanför display, text under 12 px utanför SVG-axlar, träffytor under 44 px.
- Rubriker i SVG. En h1 per sida. Reklamkortens rubriker som h2 eller h3.

---

## 7. Artefaktkrav

- **En HTML-fil**, `docs/design/publikt-2026-10-12.html`, publicerad som artefakt. Inbäddad CSS, inbäddade SVG-symboler, ingen extern resurs utom Google Fonts: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600&display=swap">`. Inga externa bilder, inga bibliotek.
- **Fyra sidor med fliknavigering** överst (en smal rad på `--papper-2` ovanför headern, tydligt märkt "Artefakt" så den inte läses som del av designen): Startsidan, Priser, Rekryteringstester, Artikeln. Flikarna byter synlig sida (JavaScript, med hash i adressen så varje sida går att länka), och alla fyra sidor finns i HTML:en från början. Utan JavaScript visas alla fyra efter varandra.
- **Två bredder ska hålla:** 400 px (Pixel 7 i porträtt, 412 fungerar då) och 1280 px. 16 px sidmarginal på mobil, ingen horisontell sidscroll, tabellen scrollar i sitt kort. Breakpoints: 640 (knappar auto-bredd, två kolumner i FAQ), 1024 (två kolumner på väggen, sidokolumn i artikeln, dörrkortens rutnät).
- **Bara ljust läge**, men `body` har explicit `background: var(--golv)` och `color: var(--ink-1)`, och varje sidas yttersta element sätter sitt `data-rum` och sina rumsvariabler. `color-scheme: light`. Ingen `prefers-color-scheme`-regel som byter tokens (artefaktens tema får inte göra väggen till golv).
- **Riktig copy ordagrant** ur källorna i avsnitt 4. Inga "Lorem", inga påhittade tal. Exempeltal bara i instrumenten, och då med chipen "Exempel". Mallantalet ur `FREE_TEMPLATE_COUNT` och `TEMPLATE_COUNT` (läs värdena i `src/lib/cv/template-antal.ts`).
- **Semantik:** en synlig h1 per sida, h2 för sektioner, `details`/`summary` för frågorna, riktig `<table>` med `<caption>` och `<th scope>` för jämförelsen, `nav` med `aria-label` för brödsmulor och innehållsförteckning, `aria-hidden` på dekorativa SVG:er, `role="img"` och `aria-label` på instrumenten med talen utskrivna, synlig fokusring på allt som går att trycka på.
- **Storlek:** under 1 MB. Symbolerna en gång, `<use>` överallt.
- **Tillgänglighet:** kontrast enligt 2.2, träffytor 44 px (48 i header och klistrad knapp), minsta text 12 px utanför SVG-axlar.
- **Granskningskommentarer i HTML:** varje sektion inleds med `<!-- S4 Tre verktyg: dörrkort, källa StartSida.tsx VERKTYG -->` så att granskningen kan peka på kod.
- Skisserna är **statiska**: inga hovertillstånd behöver ritas utöver understrykning, inga öppna menyer, inga formulär som skickar.

---

## 8. Granskningschecklista (art-director granskar artefakten mot den här)

1. Fyra sidor, rätt rum per sida (skog, grafit, indigo, indigo med grafitgolv), rätt väggtokens hex för hex.
2. h1, `<title>` och `description` ordagrant lika källan på alla fyra sidor; artikelns alla h2 i samma ordning och med samma id som i produktion.
3. En vägg per sida, alltid överst, med toning 168 grader, ljuskant och rundade nedre hörn. Ingen annan mörk yta.
4. Det lyfta kortet överlappar väggen 30 px och bär sidans kopparknapp. Väggen har ingen kopparknapp.
5. Kopparknappar: aldrig två inom en skärmhöjd på 400 px (sidokolumnen på dator undantagen). Text på knappen `#1A1206`. Toningen går inte mörkare än `#C4621F`.
6. Koppar som text: bara `--koppar-ink` på papper och `--koppar-ljus` på väggen. Grep `#E07A2F` i `color:` ger noll.
7. Bockar i listor är ink-1, aldrig koppar, aldrig grön. Tabellen har ord, inte prickar.
8. Provbladen ur `tester-lyft-2026-10-11/illustrationer` är inlagda ordagrant (diffa `<symbol>`-innehållet mot källfilerna). De nya åtta motiven följer riktningen: stroke 3, radie 8, åttapixelsrutnät, en kopparyta, ingen text, inga metaforer, ingen platta.
9. Huset är det enda motivet med rummens fyra kulörer, och det står bara på prissidans vägg.
10. Kurvan och spåret följer geometrireglerna (radier på punkter, siktebandet från 6 okt, planraden, provlinjen, axeltext i HTML eller 11 px med aria-label), exempeltalen stämmer med listan i 5.3, inga nivåer över 7,5, chipen "Exempel" finns.
11. Inga `IlluScen*`, inga märken, inga lucide-ikoner, ingen `IlluKlusterTest`.
12. Testerna står först i S4 (brett kort) och i P4 (brett kort).
13. Paketet: "Jobbcoach Premium" en gång per sida, "Premium" därefter, knappen "Köp Premium, 149 kr i månaden", inga gamla paketnamn, inget "per dygn", inget citat med namn.
14. Rytm: ingen form två gånger i rad, högst tre kort i samma vikt i följd, bevis-tal med etikett, instrument med rad under.
15. Artefakten: 400 och 1280 utan horisontell scroll, `body` med explicit bakgrund, bara Google Fonts externt, under 1 MB, en h1 per sida, `details`/`summary`, riktig `<table>`, aria-label på instrumenten, synlig fokusring.
16. Anti-listan: grep på tankstreck, `Sparkles`, `blur`, `drop-shadow`, `animate`, `transition` (utom text-decoration), `#fff`, `#000`, `Lås upp`, `dygn`, `Träningspaketet`, `Hela paketet`, `Dagspasset`, `/mån`, `149:-` ger noll träffar.
17. Prestanda i bygget (inte artefakten, men artefakten får inte göra det omöjligt): väggen är CSS, inga bilder i kritisk väg, inga nya typsnitt, allt renderbart utan JavaScript.

När artefakten är godkänd av ägaren byggs sidorna i kod i den här ordningen: `/verktyg/rekryteringstester` och `/priser` först (alla tre köpen gick den vägen, spec-rummen 17), sedan startsidan, sist artikelramen. Varje steg med SEO-diff som grind, mätning av knappbytet, skärmdumpar i `docs/qa/publikt/` på Pixel 7 och 1280, och perf-mätning mot publika budgeten.

Version 1.0, 2026-10-12, art-director.
