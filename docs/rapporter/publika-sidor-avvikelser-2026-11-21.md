# Publika sidor: vad som inte längre stämmer med produkten

Granskning 2026-11-21, efter ombyggnaden av CV-rummet (ny analys), Brevrummet och Jobbsöket. Ingenting är ändrat. Listan är underlag för en samlad rättning av alla publika sidor.

Varje rad: `fil:rad` | citat | vad som gäller nu, med kodbelägg | allvar.
Allvar: **FEL** (påståendet är osant), **FÖRÅLDRAT** (beskriver gammal vy men är inte direkt osant), **AVVÄGNING** (till exempel sökordet "ATS-poäng").

## Produktens sanning, belagd i koden

- **CV-analysen:** sju delar i dokumentordning, sammanlagt 100 poäng: Kontaktuppgifter 10, Personbeskrivning 15, Erfarenhet 35, Kompetenser 12, Utbildning 8, Språk 5, "Datum, ordning och längd" 15 (`src/lib/cv/poang/modell.ts:66-73`, `POANG_VERSION = 2` rad 36). Ingen del mäter branschnyckelord, kolumner eller filstruktur (`genomgang.ts:82-110`).
- **Namnet inloggat** är "Läsbarhetspoäng". Rubriken är "{kvar} poäng kvar till 100", kortet heter "Vägen till 100" (`src/app/dashboard/cv-analys/analysTexter.ts:14, 17, 86, 110`).
- **Gratisnivån** (läget vid granskningen): en analys per konto (`quotaService.ts:59, 301-324`). Alla ser poängen per del och vad som saknas i alla sju delar. Bara förslagstexterna är låsta, utom det tyngsta förslaget (`utlamning.ts:5-11`). Premium kör om utan tak. **Obs:** samma dag beslutades att poäng och brister visas för varje CV utan att en analys startas, och att det som räknas en gång per konto är "Hämta Jobbcoachens förslag". Skriv de publika texterna mot det läget.
- **Inskannade PDF:er** läses med tesseract på vår egen server, bara på svenska (`src/lib/cv-parser/ocr.ts:3-20`). Gäller bara den inloggade uppladdningen, inte mini-analysen på den publika sidan.
- **Maskning:** namn, e-post, telefon, gatuadress, postnummer, personnummer, födelsedatum och länkar maskas. Orten maskas inte (`src/lib/privacy/pii.ts:15-45`). Gäller analysen, omskrivningen, byggarens förslag, LinkedIn, matchningen och Jobbcoachens bilagor. Edge-funktionerna är driftsatta 2026-11-21.
- **CV-rummet:** flikarna Ditt CV, Mallar, Analys. 40 mallar, 2 gratis (Linne och Björk), 26 finns som Word (`src/lib/cv/mallar/katalog.ts:36-76, 152-155`). Word i en gratismall går att ladda ner gratis.
- **Brev:** samma 40 mallar, gratis Linne och Björk (`src/lib/letters/brevmall/katalog.ts:6-25`). Fem toner: Professionell, Entusiastisk, Kreativ, Självsäker, Balanserad. Auto och typsnittet Helvetica kräver Premium (`brevRegler.ts:31-35`).
- **Jobbsök:** flikarna Översikt, Matchade jobb, Sökta tjänster, Inför intervjun (`src/components/jobb3/kit/flikar.ts:23-26`). Matchade jobb visar senaste körningen och söker om först när användaren söker. Knappen heter "Byt CV", inte Aktivera.
- **Pris:** bara Jobbcoach Premium säljs, 149 kr i månaden (`src/lib/plans/plans.ts:181-194`).

## CV-analys

### `src/app/(public)/verktyg/cv-analys/page.tsx`
- `:14-21`, `:158` | "Sex saker rekryteraren och systemet ser först" (Läsbarhet för rekryteringssystem, Struktur, Språk och grammatik, Nyckelord, Kvantifiering, Profil och styrkor) | Sju delar med andra namn, ingen mäter kolumner eller nyckelord | **FEL**
- `:52` (featureList i schemat), `:87` (HowTo steg 3), `:145` (talrutan "4 delar med förslag") | "förslag i fyra delar (personbeskrivning, roller, kompetenser, allmänna råd)" | Sju delar | **FEL**
- `:42`, `:52`, `:60`, `:85`, `:87` | "ATS-poäng från 0 till 100" | Heter läsbarhetspoäng inloggat | **AVVÄGNING**
- `:80`, `:138` | "Vi kontrollerar struktur, språk, nyckelord och kvantifiering" | Inga nyckelord mäts, siffror och verb räknas inom Erfarenhet | **FÖRÅLDRAT**
- `:73` | "Ladda upp ett befintligt CV som PDF" | Word går också, inskannad PDF läses inloggat | **FÖRÅLDRAT**
- `:171` | "Poängen och det tyngsta fyndet är gratis." | Gratis ser också poäng per del och vad som saknas i alla sju delar | **FÖRÅLDRAT**

### `src/app/(public)/verktyg/cv-analys/layout.tsx`
- `:9`, `:11`, `:21` | "ats-poäng", "CV-analys på 60 sekunder med ATS-poäng" | **AVVÄGNING**
- `:13` | "Du får en ATS-poäng plus konkreta förslag i fyra delar." | Sju delar | **FEL**
- `:7` (description) säger redan "läsbarhetspoäng" och stämmer.

### `src/app/(public)/verktyg/cv-analys/components/cv-analys-faq-data.ts` (blir också FAQPage-schema)
- `:19-20` | "Vad betyder ATS-poängen? ... struktur, läsbarhet, kompetenser och formatering" | Säger inget om de sju delarna | **AVVÄGNING**
- `:24` | "Förslagen kommer i fyra delar. Personbeskrivning ... Roller ... Kompetenser ... Allmänna råd" | Sju delar | **FEL**
- `:32` | "Du ser läsbarhetspoängen, hur många fynd vi hittade och det tyngsta fyndet i klartext med åtgärd. Vill du se alla fynd ... ingår det i Premium" | Gratis ser alla sju delarna med poäng och brister | **FEL** (gratis får mer än texten säger)
- `:16` | "kontrollerar struktur, språk, nyckelord och kvantifiering" | **FÖRÅLDRAT**

### `src/app/(public)/verktyg/cv-analys/components/CVAnalysMini.tsx`
- `:151` | "så får du en ATS-poäng och det viktigaste du bör ändra" | **AVVÄGNING**
- `:118-120` | "Skapa ett gratiskonto så kör vi en full analys ... det tyngsta fyndet i klartext med åtgärd" | **FÖRÅLDRAT**
- **Fynd, poängen skiljer:** modellen är densamma (version 2, `api/public/quick-score/route.ts:19, 118`), men inloggat fylls tomma kontaktfält från profilen och kontots e-post (`forslag.ts:315-326`, `kontakt.ts:37-39`). Samma CV kan få upp till 10 poäng mer inloggat. Ingen publik text lovar att poängen är densamma.
- **Fynd, annan sorts fynd:** "Det här bör du fixa först" och de låsta raderna kommer från en separat basanalys (`route.ts:117, 126-134`), inte från genomgången i sju delar | **FÖRÅLDRAT**
- **Fynd, beteende:** en inskannad PDF läses inte publikt. Besökaren får "Kunde inte analysera filen just nu. Försök igen om en stund." (`route.ts:136-141`), ett nytt försök som aldrig lyckas. Inloggat läses samma fil.

### `src/components/publikt/telefon/skarmar/SkarmCvAnalys.tsx`
- `:15-20`, `:41`, `:49`, `:61`, `:71` | Ritar "Förslag per del" i fyra delar, "Läsbart för systemen", "Tyngsta fyndet", knappen "Rätta och kör om" | Vyn har sju delar, "{kvar} poäng kvar till 100" och "Vägen till 100" | **FÖRÅLDRAT**. Skärmen visas på /verktyg/cv-analys, /funktioner (två gånger), /priser, startsidan (två gånger), exempelsidorna och artiklarnas reklamkort.

### `src/components/pricing/paket-copy.ts` (kortet "cv-analys", läses av /funktioner och /priser)
- `:195` | "Gratis: poängen och det tyngsta fyndet." | **FÖRÅLDRAT**
- `:196` | "förslagen i fyra delar: personbeskrivning, roller, kompetenser och allmänna råd ..." | **FEL**
- `:200` | "Nyckelorden rekryteringssystem (ATS) letar efter i din bransch." | Poängen mäter inga nyckelord | **FÖRÅLDRAT**

### `src/app/(public)/funktioner/FunktionerSida.tsx`
- `:64` | "Poäng per område och varje fynd med åtgärd." | Går att behålla om "område" betyder del, åtgärdstexterna är Premium | **AVVÄGNING**
- `:93` (FAQ och FAQPage) | "en CV-analys med poäng och det tyngsta fyndet" | **FÖRÅLDRAT**

### `src/components/publikt/start/Startsidan.tsx`
- `:256` | "Inom en minut får du poäng 1 till 10 på tydlighet och struktur, innehåll, resultat och nyckelord" | En poäng av 100 i sju delar | **FEL** (det tydligaste felet på sajten)
- `:252-253` | "Poäng per område, varje fynd med åtgärd och nyckelorden rekryteringssystemen letar efter." | **FÖRÅLDRAT**
- `:258` | "Poängen och tyngsta fyndet gratis" | **FÖRÅLDRAT**

### Gemensam gratiskälla: `src/lib/plans/gratis-copy.ts`
- `:54`, `:65`, `:82`, `:105` | "En CV-analys med poängen och det tyngsta fyndet" | **FÖRÅLDRAT**. Läses av /priser, startsidans FAQ, GratisKortet och registreringen.
- Samma påstående: `src/app/(public)/priser/components/priser-data.ts:133` (och sub "poäng, fynd, nyckelord" `:132`), `src/components/artiklar/reklam/reklam-copy.ts:81`, `src/components/registrering/registrering-copy.ts:354, 431`.
- Samma påstående i mejl och inloggat (inte publika sidor): `campaign-gratisniva.ts:49`, `onboarding/komigang.ts:208, 231, 398`, `onboarding/paket-rader.ts:160`, `paywall-copy.ts:113, 158, 321`. Inloggat finns ATS-ord kvar i `CVAnalysisIntro.tsx:25, 41`.

### Artiklar (`content/artiklar/`)
**`jobbcoach-online.mdx`**
- `:13`, `:184`, `:568`, `:957` | "ger förslag inom sex kategorier" | **FEL**
- `:193`, `:289-333` (tabellen "De sex kategorier vi ger förslag inom") | **FEL**
- `:840` | "Med Premium ser du alla fynd i alla sex kategorier" | **FEL**
- `:89`, `:214`, `:398`, `:834-836`, `:914` | "visar poängen och det tyngsta fyndet" | **FÖRÅLDRAT**
- `:13`, `:153`, `:957` | "bedömer ditt CV mot struktur, språk, nyckelord och kvantifiering" | **FÖRÅLDRAT**
- `:48` | "Ger en poäng från 0 till 100 för hur väl struktur och nyckelord ..." | **FÖRÅLDRAT**
- `:351-352` (resultatexemplet "Kritiskt problem: Nyckelord") | **FÖRÅLDRAT**
- `:231` | "Välj en av sex mallar (fyra är gratis, alla sex ingår i Premium)" | 40 mallar, 2 gratis | **FEL**
- `:259` | "de två mallarna utöver gratismallarna" | 38 Premiummallar | **FEL**
- `:370` | "matchningen görs när du öppnar sidan" | **FEL**
- `:21`, `:1021` | "CV-analysen läser både svenska och engelska CV" | Stämmer för textfiler, bildläsningen är bara svensk | **AVVÄGNING**

**`vad-ar-en-jobbcoach.mdx`**
- `:21`, `:23`, `:203`, `:587`, `:819`, `:869`, `:886` | "Gratis får du en poäng från 0 till 100 och det tyngsta fyndet" | **FÖRÅLDRAT**
- `:203`, `:557`, `:579` | "förbättringsförslag för struktur, språk, nyckelord, mätbara resultat och profiltext" | **FÖRÅLDRAT**
- `:643` | "när du öppnar sidan matchar vi din profil" | **FEL**
- `:636`, `:639` om mallarna stämmer.

**Fler artiklar**
- Gratisnivån som "poäng och tyngsta fyndet" (**FÖRÅLDRAT**), 4 filer: `din-digitala-jobbcoach.mdx:175`, `bra-cv-guide.mdx:395`, `hur-ska-ett-cv-se-ut.mdx:293, 371`, `cv-pa-engelska-resume.mdx:536`.
- Analysen som en kontroll av nyckelord eller branschord (**FÖRÅLDRAT**, tolkningsfråga eftersom kompetensförslag finns), 14 filer: `ats-vanligt-cv:156`, `bra-cv-guide:395`, `cv-exempel-yrken:254`, `cv-och-personligt-brev:17, 203`, `cv-profil-sammanfattning:363`, `datorkunskaper-cv:97`, `fardigheter-cv-exempel:621`, `fardigheter-kompetenser-cv:207`, `hur-skriver-man-cv:256`, `nyckelord-i-cv:129`, `personligt-brev-kompetenser-egenskaper:108, 246`, `skriva-cv-guide:199`, `vanliga-cv-misstag:227`.
- "ATS-poäng" som namn: `skriva-cv-guide.mdx:17, 233` | **AVVÄGNING**
- Övriga cirka 35 artiklar nämner analysen bara som länk eller i allmänna ordalag, och det stämmer.

## CV-rummet och mallar
- `src/app/(public)/funktioner/FunktionerSida.tsx:225-231` | MallMiniatyr "executive", "modern", "classic" i avsnittet "Skapa CV och CV-mallar" | Miniatyrerna ritar de gamla brevmallarna (`MallMiniatyr.tsx:1-5, 20-40`) | **FÖRÅLDRAT**
- `FunktionerSida.tsx:209` | "Ladda ner som PDF" | Word finns för 26 mallar | **FÖRÅLDRAT**
- `priser-data.ts:137-139` | CV-nedladdning "som PDF" | **FÖRÅLDRAT**
- `SkarmMallar.tsx` och `SkarmSkapaCv.tsx` läser den nya katalogen och stämmer.

## Brev
### `src/app/(public)/verktyg/personligt-brev/`
- `layout.tsx:7, 14, 24` | "Sju mallar, fem toner" | 40 mallar | **FEL**
- `page.tsx:44-56, 199, 264, 267` | De sju gamla mallarna, "{MALLANTAL} mallar", "{GRATISMALLAR} av dem är gratis" (ger 7 och 3) | 40 mallar, 2 gratis | **FEL**
- `page.tsx:100, 110, 145` | "Sju mallar", "7 brevmallar" (även i schemat) | **FEL**
- `page.tsx:113-153` (HowTo "Fyra steg ... välj mall och ton") | Skriv brev är en skärm, mallen väljs i "Byt mall" eller efteråt på Mallar | **FÖRÅLDRAT**
- `page.tsx:199, 348-355, 388`, `brev-faq-data.ts:14` | "PDF och Word" utan förbehåll | Word för 26 av 40 mallar | **AVVÄGNING**
- `components/brev-faq-data.ts:30` | "Klassisk eller Minimalist ... Modern eller Kreativ ... Executive eller Traditionell" | Mallarna finns inte | **FEL**
- `components/brev-faq-data.ts:34` | "de sju mallarna" | **FEL**
- `components/brev-faq-data.ts:18` | "Allt du skrivit ligger kvar att läsa och kopiera" | Gratis kan dessutom ändra de två senaste | **FÖRÅLDRAT**

### Övrigt om brev
- `src/components/pricing/paket-copy.ts:214` | "Välj ton: saklig, personlig eller vi väljer åt dig." | Fem toner med andra namn, auto kräver Premium | **FEL**
- `paket-copy.ts:211, 216` | "Redigera, ladda ner som PDF" | Word också | **AVVÄGNING**
- `src/components/publikt/telefon/skarmar/SkarmBrev.tsx:15` | "Ton: saklig." | **FEL** (liten)
- `FunktionerSida.tsx:172` | "Gratis: första brevet, sedan ett i veckan, att läsa och kopiera." | **FÖRÅLDRAT**
- `priser-data.ts:145-146` | "läsa, inte ladda ner" / "nedladdning som PDF" | **FÖRÅLDRAT**
- `reklam-copy.ts:88, 91` | "att läsa på skärmen" / "som PDF" | **FÖRÅLDRAT**
- `src/components/publikt/innehall/exempel/ExempelMall.tsx:114, 147` | "Sju mallar", "Mallen Klassisk" | Stämmer med exempelvisningen tills den byggs om | **FÖRÅLDRAT**
- Artiklar: `jobbcoach-online.mdx:231, 259`, `personligt-brev-mall-word.mdx:448` "en av sex brevmallar" | **FEL**. `fardiga-personliga-brev.mdx:245` "läsa, redigera och kopiera texten gratis" | **FEL** (halvt)
- `src/components/artiklar/MallVisningar.tsx:71` "Samma brev i sex mallar. Fyra är gratis." | Fel i sak men används inte i någon artikel i dag.

## Jobbsök
- "Matchningen körs när du öppnar sidan" | Senaste körningen visas, ny sökning på knappen (`dashboard/jobbmatchning/page.tsx:14-16, 67-74`) | **FEL** på: `FunktionerSida.tsx:85`, `paket-copy.ts:245`, `Startsidan.tsx:274`, `verktyg/jobbmatchning/page.tsx:319`, `jobbcoach-online.mdx:370`, `vad-ar-en-jobbcoach.mdx:643`, `ai-jobbmatchning.mdx:57`.
- `verktyg/jobbmatchning/page.tsx:105-112` (HowTo "Aktivera ditt CV"), `:198`, `:319`, `SkarmAktivera.tsx` | Vyn har "Byt CV"/"Välj CV" | **FÖRÅLDRAT**. Samma ord i `ai-jobbmatchning.mdx:15, 51, 69, 97, 107`.
- `FunktionerSida.tsx:241-248` | "Bara i Jobbcoach Premium ... Jobbmatchning" | Tre träffar är gratis | **FEL** (äldre fel)
- `FunktionerSida.tsx:341-342` | "ett personligt brev från en träff hamnar där av sig självt" | Hamnar i Sökta tjänster när användaren markerar det som sökt | **FEL**
- `Startsidan.tsx:99-105`, `FunktionerSida.tsx:50-58` | Sökta tjänster bara som länkrad, Inför intervjun saknas | **FÖRÅLDRAT**
- `SkarmBana.tsx:27-29` (startsidans hjälte, även om-oss) | "Mitt jobbsök", "Vägen till intervjun", "tre av fem steg klara", "Nivåkollen klar" | Flikarna heter annat, och Nivåkollen ska inte stå i reklam | **FÖRÅLDRAT**
- `src/app/dela/sokta-tjanster/[token]/page.tsx:13, 124, 131` | Ritar "Flödesdiagram" och de gamla staplarna | Rummet använder tratten | **FÖRÅLDRAT** (publik delningssida)
- `src/lib/email/campaign-sokta-tjanster.ts:75, 97` (mejl) | "ett flödesdiagram över hela resan", "Helt gratis, för alla konton" | **FEL** enligt jobbsökets överlämning, Premiumgränsen är inte prövad i den här granskningen.
- Luckor, inga osanna påståenden: Ska sökas, veckans mål och uppföljningsmejlet saknas i `priser-data.ts:156-178, 194`, `plans.ts:93-99`, `gratis-copy.ts:51-57`, jobbcoachens sida och `registrering-copy.ts`.

## Priser och gratisnivå
- `priser-data.ts:131-134` | CV-analys gratis "Poäng och tyngsta fyndet, en gång", sub "poäng, fynd, nyckelord" | **FÖRÅLDRAT**
- Priset 149 kr i månaden och Premiumlistan stämmer.

## Juridik (bara var texten står, ägaren hanterar den)
- `src/app/(public)/integritetspolicy/page.tsx:127` | "När du låter oss skriva om CV:t, matcha jobb, optimera LinkedIn-profilen eller bifogar CV:t till Jobbcoachen skickas texten utan den maskeringen, och en inskannad PDF utan textlager läses av med samma tjänst innan något kan maskas." | **Avviker från koden.** Maskningen gäller nu även omskrivningen, matchningen, LinkedIn och bilagorna, och inskannade PDF:er läses på vår egen server.
- `integritetspolicy/page.tsx:127, 157` | Räknar upp namn, e-post, telefon, personnummer, gatuadress och postnummer | Koden maskar även födelsedatum och länkar. Texten säger mindre än koden gör men är inte osann.
- `src/app/(public)/anvandarvillkor/page.tsx:138` | Maskning "för personliga brev och CV-analysen" | Snävare än koden men fortfarande sann.

## Produktfacit (minnesfilen `project_faktagranskning_2026_11.md`)
Rader som själva är inaktuella:
- "CV-export endast PDF (ingen Word)" | Word är live för 26 mallar | **FEL i facit**
- "41 mallar, 3 gratis" | 40 mallar, 2 gratis | **FEL i facit**
- "jobbmatchning körs när sidan öppnas" | **FEL i facit**
- "CV-analysen läser BARA CV:t, gratis 1 per konto" | Stämmer, men sju delar, läsbarhetspoäng, vad gratis ser och inskannade PDF:er saknas | **FÖRÅLDRAT**
- Sökta tjänster, Ska sökas, veckans mål, uppföljningsmejlet och fliknamnen i Jobbsök saknas.

## SEO-regler för rättningen (beslutade 2026-11-21)
1. Ordning: `/verktyg/cv-analys` (layout, page, FAQ-data, mini, OG-bild), sedan `/priser` och `/funktioner` så att gratislöftet är detsamma överallt, sist startsidan och artiklarna med `jobbcoach-online.mdx` och `vad-ar-en-jobbcoach.mdx` först.
2. URL:er, canonical och artikelslugs ligger fast.
3. Schematyperna WebApplication, HowTo och FAQPage behålls, bara innehållet ändras. HowTo-steg och FAQ-frågor ska stämma ordagrant med det som syns på sidan.
4. "CV-analys" först i metatiteln inom 60 tecken, beskrivning 110 till 158 tecken.
5. "Läsbarhetspoäng" är namnet i H1, rubriker och schemats name. "ATS" står en gång i metatitel eller beskrivning och en gång i brödtexten som förklaring, till exempel "läsbarhetspoäng för rekryteringssystem (ATS)". Aldrig ett påstående om att poängen kommer från ett ATS-system.
6. Inskannade PDF:er: en mening i uppladdningssteget och en FAQ-fråga, med att bildläsningen bara läser svenska.
7. SEO-diff före och efter (`docs/qa/seo-diff`) som grind innan något går live.

## Täckning
- Lästa i sin helhet: verktyg/cv-analys (alla filer), quick-score-rutten, funktioner, priser-data, paket-copy, gratis-copy, plans, Startsidan, telefonskärmarna SkarmCvAnalys, SkarmBana, SkarmMallar, SkarmBrev, SkarmSkapaCv.
- Delvis: verktyg/personligt-brev, verktyg/jobbmatchning, `jobbcoach-online.mdx`, reklam-copy, juridiska sidorna (raderna om maskning).
- Bara sökta: övriga artiklar, `vad-ar-en-jobbcoach.mdx` (alla träffrader), övriga verktygssidor.
- Inte granskat: hjälpcentret, /verktyg/bli-upptackt, /om-oss utöver SkarmBana, /verktyg/rekryteringstester, appbutikens texter, sitemap-beskrivningar, artiklarna i sin helhet utöver jobbcoach-online.
