# Bygglogg, textändringarna push 1 och push 2

Publikt omgång 3, 2026-11-22. Byggt på grenen `design/publikt-omgang3` i `C:\Users\chris\cvbrev-publikt3`, som utgår från `5adfc7a1`. Beslutet är `docs/publikt-omgang3/textbeslut.md`, lydelserna där det står "enligt textforslag.md" är tagna ordagrant ur `docs/publikt-omgang3/textforslag.md`. Inget är pushat. Undantagsfilen för SEO-grinden är `scripts/seo-baslinje/publikt-omgang3-undantag.json`.

Tal läses ur samma konstanter som förut (`JOB_MATCHES_PER_RUN`, `FREE_TIER_JOB_LIMIT`, `TEMPLATE_COUNT`, `WORD_TEMPLATE_COUNT`, `FREE_TEMPLATE_COUNT`, `FREE_CV_EXPORTS`, `GRATIS_CHATTFRAGOR`, `GRATIS_PASTAENDEN`, `UPPFOLJNING_GRATIS_UTKAST`, `KOM_IGANG_LISTA.allt.length`, `paketKort()`/`prisPeriod()`). Delarnas namn och maxpoäng på /verktyg/cv-analys och i telefonen för CV-analysen läses ur poängmodellen (`KATEGORIER` och `ROLLER_SOM_RAKNAS` i `src/lib/cv/poang/modell.ts`).

## Viktigt före push: grenens bas

`origin/main` står på `5be891a2`, där `feat/jobbsoket-omgang2` redan är inslagen. Den här grenen utgår från `5adfc7a1` och har inte tagit in den, och `fix/brev-kvar` är varken i grenen eller i `origin/main`. Grenen behöver slås ihop med `origin/main` (och `fix/brev-kvar` när den är inne) innan push. Jag har inte rört arbetsträdet för att göra det.

## Push 1. Matchningen och Jobbcoachen

Commit: se slutrapporten (första commiten på grenen efter `5adfc7a1`).

### Införda (27 hela, 2 delvis)

| Post | Fil |
|---|---|
| FUN-1 | `src/app/(public)/funktioner/FunktionerSida.tsx` (FAQ-svaret) |
| GEM-10 | `src/components/pricing/paket-copy.ts` (Matchade jobb) |
| GEM-11 | `src/components/pricing/paket-copy.ts` (Jobbcoachen, B-19) |
| STA-4 | `src/components/publikt/start/Startsidan.tsx:274` |
| STA-5 | `Startsidan.tsx:303` |
| STA-6 | `Startsidan.tsx:86`, `:302`, `FunktionerSida.tsx:73` (B-19:s lydelse) |
| JM-1 | `src/app/(public)/verktyg/jobbmatchning/page.tsx` (:67, :101, :112-113, :171, :197, :222) |
| JM-2 | `jobbmatchning/components/jobbmatchning-faq-data.ts` (:19, :43, :47) |
| JM-3 | `jobbmatchning/page.tsx:319` |
| JM-4, delvis | `jobbmatchning/page.tsx:54`, `:93`, `:177`. FAQ-svaret är överhoppat, se nedan |
| JM-5 | `jobbmatchning/page.tsx:199` |
| JM-6 | `jobbmatchning/page.tsx:303-305` och ny rad i länklistan (Sökta tjänster, `/funktioner#sokta-tjanster`, objektet `sokta`) |
| JM-7 | `jobbmatchning/page.tsx:200` |
| JM-8 | `jobbmatchning/page.tsx:125` (HowTo-steg 3), `jobbmatchning-faq-data.ts:23` |
| JC-1 | `src/app/(public)/verktyg/jobbcoachen/page.tsx:174` |
| JC-2 | `jobbcoachen/page.tsx:52-53`, `:72-74`, `jobbcoachen/components/jobbcoachen-faq-data.ts:21-22`, `:45-46` |
| JC-3 | `jobbcoachen/components/JobbcoachenLiveDemo.tsx` (demo 1 och 3, inga källmärken där, SCB-etiketten borta, demo 2 orörd) |
| REK-3 | `src/components/artiklar/reklam/reklam-copy.ts:135` |
| ART-3 | `content/artiklar/jobbcoach-online.mdx:370` |
| ART-8 | `content/artiklar/vad-ar-en-jobbcoach.mdx:643` |
| ART-10 | `content/artiklar/ai-jobbmatchning.mdx:15`, `:51`, `:69`, `:97`, `:107` (B-22:s lydelse) |
| ART-11 | `ai-jobbmatchning.mdx:57` |
| ART-12 | `ai-jobbmatchning.mdx:89` |
| TEL-3 | `src/components/publikt/telefon/skarmar/SkarmMatchning.tsx` (kommentaren omskriven) |
| TEL-4, delvis | `skarmar/SkarmAktivera.tsx` (läget innan första sökningen; `DATAPUNKTER` exporteras som förut) |
| TEL-5 | `skarmar/SkarmCoach.tsx` |
| B5 (båda) | `jobbmatchning-faq-data.ts:39`, `jobbcoachen-faq-data.ts:50` |
| BU-1 | `src/app/(public)/verktyg/bli-upptackt/components/bli-upptackt-faq-data.ts:30` |
| BU-2 | `skarmar/SkarmBliUpptackt.tsx` (två styrkor) |

`updated` är 2026-11-22 i `jobbcoach-online`, `vad-ar-en-jobbcoach` och `ai-jobbmatchning`.

### Överhoppat i push 1

- **JM-4, FAQ-svaret i `jobbmatchning-faq-data.ts:35`.** Beslutet säger att FAQ-svaret ska säga "borttagen", aldrig "tillsatta" (B-24), men lydelsen i textforslag.md slutar "så du slipper söka jobb som redan är tillsatta". Lydelsen och beslutet säger emot varandra, så svaret står som i dag. Rätt lydelse behövs från saas-lead.
- **TEL-4, delvis.** Telefonen är en stillbild och visar läget innan sökningen. Texten "medan sökningen går" ("Vi läser Arbetsförmedlingens annonser", "Det brukar ta 20 sekunder ...") har ingen yta i en stillbild och är inte ritad.

## Push 2. Gratisnivån, Premium och CV-analysen

Commit: se slutrapporten (andra commiten).

### Införda (72 hela, 6 delvis)

| Post | Fil |
|---|---|
| B1 | `src/app/(public)/verktyg/cv-analys/page.tsx` (H1, etiketten "Gratis för varje CV", `totalTime` struken), `cv-analys/opengraph-image.tsx` (titel och alt) |
| B2 | `cv-analys/page.tsx` (skrivtipset, rubriken står) |
| CVA-1 | `cv-analys/page.tsx` (H2, ingressen, sju delar med poäng som bricka, raden under listan). Brickan och raden kräver två små fält i `src/components/publikt/VerktygsMall.tsx` (`bricka` per rad, utanför h3, och `not` under kontrollens kort) |
| CVA-2, delvis | `cv-analys/page.tsx` (featureList, HowTo-steg 3, löftesraden), `cv-analys-faq-data.ts:23-24`. OG-beskrivningen är överhoppad, se nedan |
| CVA-3 | `cv-analys/layout.tsx` (keywords, OG- och twitter-titel), `page.tsx` (WebApplication- och HowTo-beskrivning), `cv-analys-faq-data.ts:19-20`, `CVAnalysMini.tsx:151` |
| CVA-4 | `page.tsx` (HowTo-steg 2, hjältens ingress och fetstil), `layout.tsx` (twitter-beskrivning, 124 tecken) |
| CVA-5 | `layout.tsx` (metabeskrivning, 152 tecken), `page.tsx` (offer, slutblocket), `cv-analys-faq-data.ts` (SEO:s fråga, priset ur `paketKort()`/`prisPeriod()`) |
| CVA-6 | `cv-analys-faq-data.ts` (SEO:s fråga) |
| CVA-7 | `cv-analys-faq-data.ts:15-16` |
| CVA-8 | `page.tsx` (HowTo-steg 1) |
| CVA-9 | `page.tsx` (HowTo-steg 4), `cv-analys-faq-data.ts:43-44` (40, 26, två och en ur konstanterna) |
| CVA-10 | `cv-analys-faq-data.ts:27-28` och ny fråga före säkerhetsfrågan. Säkerhetssvaret står ordagrant |
| CVA-11 | `cv-analys/components/CVAnalysMini.tsx` |
| CVA-12 | `CVAnalysMini.tsx` (rubriken, raden när inget hittats, fast lista "I kontot ser du") |
| GEM-1, GEM-2, GEM-3 | `src/lib/plans/gratis-copy.ts` (listan sex rader med B4, meningarna, FAQ-svaret), `src/lib/plans/__tests__/gratis-copy.test.ts` |
| GEM-5, delvis | `linkedin-optimering/page.tsx:208`, `linkedin-optimering-faq-data.ts:47`, `skapa-cv/page.tsx:233`, `reklam-copy.ts:77`, `:223`. Stället i `plans.ts` är överhoppat med GEM-4 |
| GEM-6 | `src/lib/plans/plans.ts:169`, `:184`, `:199`, `src/app/(public)/priser/page.tsx:105` (54 tecken) |
| GEM-7 | `paket-copy.ts` (CV-analysens kort: sub, text, steg, scenAlt) |
| GEM-8 | `paket-copy.ts` (brevkortets sub) |
| GEM-9 | `paket-copy.ts` (brevkortets text och sista steg) |
| GEM-13 | `paket-copy.ts` (`GUIDE.listor.allt`: etiketten ur `KOM_IGANG_LISTA.allt.length`, tolv steg), test i `paket-copy.test.ts` |
| PRI-1 | `src/app/(public)/priser/components/priser-data.ts` (två rader) |
| PRI-2 | `priser/page.tsx` (CV-stationens steg) |
| PRI-3 | `priser/page.tsx` |
| PRI-4 | `priser/page.tsx` |
| PRI-5 | `priser-data.ts` (Word-antalet ur `WORD_TEMPLATE_COUNT`) |
| PRI-6 | `priser-data.ts` |
| PRI-7 | `priser-data.ts` (gruppen Jobbsöket, sex rader; gruppnamnet är en `th`, ingen rubrik, så ingen rad i `RUBRIK_BYTT`) |
| PRI-8 | `priser-data.ts` (FAQ-svaret) |
| PRI-9 | `priser-data.ts` (152 tecken, kommentaren rättad) |
| PRI-10 | `priser/page.tsx` (plattan 7 ur poängmodellen, ny platta 1 ur `UPPFOLJNING_GRATIS_UTKAST`) |
| PRI-11 | `priser-data.ts` |
| FUN-2 | `FunktionerSida.tsx` (FAQ-svaret) |
| FUN-3 | `FunktionerSida.tsx` (etiketten och ingressen) |
| FUN-4 | `FunktionerSida.tsx` (rutan Sökta tjänster, ankaret står) |
| FUN-5 | `FunktionerSida.tsx:175` |
| FUN-6 | `FunktionerSida.tsx:67` |
| FUN-7 | `FunktionerSida.tsx:68`, `:209`, `src/components/registrering/registrering-copy.ts:41` |
| FUN-8 | `FunktionerSida.tsx:212` |
| FUN-9 | `FunktionerSida.tsx:64` |
| FUN-10, delvis | `FunktionerSida.tsx` (ankaret Sökta tjänster), `funktioner/page.tsx:25` (twitter, 145 tecken). OG-beskrivningen är överhoppad, se nedan |
| FUN-11 | `FunktionerSida.tsx:118` |
| STA-1, STA-2, STA-3, STA-7, STA-8 | `Startsidan.tsx` |
| B3 | `Startsidan.tsx:98`, `:156` (talet ur `ANTAL_TESTTYPER`), `:231`, `:271`, `:305` |
| B4, delvis | `Startsidan.tsx:228`, rad 1 i `GRATIS_LISTA`. `GRATIS_TESTRAD` är inte ändrad, se nedan |
| BRV-1, delvis | `personligt-brev/components/brev-faq-data.ts:19`, `personligt-brev/page.tsx:364`. Twitter-beskrivningen är överhoppad, se nedan |
| BRV-2 | `personligt-brev/page.tsx:247` (bara ingressen) |
| SCV-1 | `skapa-cv/page.tsx:47`, `skapa-cv-faq-data.ts:57` |
| SCV-2 | `skapa-cv-faq-data.ts:39` |
| EX-1 | `exempel/components/galleri-faq.ts:37`, `ExempelCTABand.tsx:45` |
| REG-1 | `registrering-copy.ts:354` |
| REG-2 | `registrering-copy.ts:195`, `:197`, `:218` |
| REG-3 | `registrering-copy.ts:57`, `:258`, Premiumraderna, gratislistan |
| REG-4 | `registrering-copy.ts:53`, `:246`, `:254` (kräver grenen, se nedan) |
| REK-1 | `reklam-copy.ts:81`, `:84` |
| REK-2 | `reklam-copy.ts:88`, `:91`, `:225` |
| REK-4 | `reklam-copy.ts` (`CV_RAD`, sex rader i slutkortet allt) |
| ART-1, ART-2, ART-4, ART-5, ART-6 | `content/artiklar/jobbcoach-online.mdx` (tabellen är JSX med sju rader, FAQ-svaret ändrat både i frontmatter och synligt) |
| ART-7, ART-9 | `content/artiklar/vad-ar-en-jobbcoach.mdx` |
| ART-13 | `content/artiklar/din-digitala-jobbcoach.mdx` |
| ART-14 | alla fjorton meningar: `ats-vanligt-cv`, `cv-exempel-yrken`, `cv-och-personligt-brev` (:17 och :203), `cv-profil-sammanfattning`, `datorkunskaper-cv`, `fardigheter-cv-exempel`, `fardigheter-kompetenser-cv`, `hur-skriver-man-cv`, `nyckelord-i-cv`, `personligt-brev-kompetenser-egenskaper` (två), `skriva-cv-guide`, `vanliga-cv-misstag`, `hur-ska-ett-cv-se-ut`. Länkarna står kvar som i dag |
| ART-15 | `skriva-cv-guide.mdx:17`, `:233` |
| ART-16 | `bra-cv-guide.mdx:395`, `hur-ska-ett-cv-se-ut.mdx:293`, `:371`, `cv-pa-engelska-resume.mdx:536`, `cv-och-personligt-brev.mdx:190` |
| ART-19 | `personligt-brev-mall-gratis.mdx:29`, `:343` |
| TEL-1 | `skarmar/SkarmCvAnalys.tsx` (copys tal 93, +5, +2; delarnas namn och maxpoäng ur poängmodellen; den kompakta varianten med två delar och "Fem delar är klara") |
| TEL-6 | `skarmar/SkarmMatris.tsx` |
| INF-4 | `src/app/(public)/om-oss/OmOssSida.tsx:34` |
| AUTH-1 | `src/app/auth/forgot-password/page.tsx:9` (siffrorna på rad 15-18 orörda) |
| B6, delvis | `registrering-copy.ts:431`, `src/lib/onboarding/komigang.ts` (`cv_upp` för tester, `analys_gratis` i gratistexterna, `brev` i gratistexterna), `src/lib/onboarding/paket-rader.ts:160`, `src/components/paywall/paywall-copy.ts:113`, `:323` (resten av meningen säger förslag och står), `paket-copy.ts:631`. Raden för `analys` är överhoppad, se nedan |

`updated` är 2026-11-22 i alla tjugo artiklar som rörs i push 2.

Tester som låste de gamla strängarna och nu har den nya lydelsen: `src/lib/plans/__tests__/gratis-copy.test.ts`, `src/components/pricing/__tests__/paket-copy.test.ts` (förklaringsraden, metabeskrivningen 152, gratismeningen, grundnivån, ny vakt för Kom igång-listan), `src/lib/plans/__tests__/paketnamn.test.ts`, `src/components/paywall/__tests__/paywall-copy.render.test.tsx`.

### Överhoppat i push 2

- **GEM-4 (och GEM-5:s ställe i `plans.ts`).** `HELA_PAKETET_RADER` läses via `PLAN_BY_KEY.all_month.highlights` också av mejlmallen `src/lib/email/lifecycle/templates/conversion.ts` (kvotväggsmejlet), som beslutet inte räknar med. Mejlmallar rörs inte, så listan står som i dag på /priser, startsidan, listslutkortet och Product-schemat. Ägaren eller saas-lead behöver säga om mejlet får följa med, eller om listan ska delas i två.
- **GEM-12.** Beslutet räknar med att två nya kort i `paket-copy.ts` syns på /priser och /funktioner av sig själva. Det gör de inte: båda sidorna slår upp korten per id (`funktion('...')`, `kort('...')`) och ritar varje station för hand med en egen telefon, och `FunktionKort.scen` har ingen scen för Sökta tjänster eller Inför intervjun. Korten kräver en plats i layouten, vilket textforslag.md själv säger att formspåret avgör. Inget är ändrat.
- **CVA-2, OG-beskrivningen (`cv-analys/layout.tsx:13`).** 165 tecken, över 158. Den gamla står kvar (den säger fortfarande "ATS-poäng", "fyra delar" och "En analys gratis per konto").
- **FUN-10, OG-beskrivningen (`funktioner/page.tsx:17`).** 159 tecken, över 158. Den gamla står kvar ("Åtta verktyg").
- **BRV-1, twitter-beskrivningen (`personligt-brev/layout.tsx:25`).** 169 tecken, över 158. Den gamla står kvar.
- **B4, `GRATIS_TESTRAD`.** Strängen läses av mejlmallen `src/lib/email/lifecycle/templates/campaign-gratisniva.ts`. Den står kvar med "fråga" för mejlets skull, och rad 1 i `GRATIS_LISTA` är nu en egen sträng med "uppgift". Kommentaren i `gratis-copy.ts` säger varför.
- **B6, raden `komigang.ts`, `analys` ("main :231 och grenens text 'Poäng, fynd, nyckelord'").** Citatet pekar på två olika rader: på `5adfc7a1` är rad 231 `analys_gratis` i `brickaText` ("Poängen och tyngsta fyndet"), medan `analys` med texten "Poäng, fynd, nyckelord" står på rad 218. Jag gissar inte vilken som avses. Båda står som i dag.

### Sökningen efter push 2 ("tyngsta fyndet", "en analys per konto", "hela analysen")

Träffar i användarsträngar utanför tabellen i Del 2 avsnitt 18, inte rättade:
- `src/lib/onboarding/komigang.ts:231`: `analys_gratis` i `brickaText`, "Poängen och tyngsta fyndet" (se B6 ovan).
- `src/lib/onboarding/paket-rader.ts:159`: Premiumgrenen, "Hela analysen, alla fynd och poängen".
- `src/app/forhandsvisning-publikt/page.tsx:162`: "poängen och det tyngsta fyndet" (beslutet: rörs inte, 404 i produktion).
- `src/app/dashboard/intervju/infor-intervjun-copy.ts:118` ("Hela analysen") och `src/components/tests/shared/PersonalityProfileCard.tsx:61` ("Se hela analysen") gäller intervju- och personlighetsanalysen, inte CV-analysen.

Närliggande, med "hela CV-analysen" i stället för "hela analysen" (utanför sökorden, inte rättade): `src/components/paywall/paywall-copy.ts:184`, `:301`, `:340`, `:350`, `:422`, `src/components/pricing/paket-copy.ts:526`, `:578`, `src/components/brev3/kit/BrevSparr.tsx:83`, `:93`, `src/components/cv/rum3/texter.ts:293`, `src/lib/ai/analytics/recommendation-engine.ts:221`, `src/lib/onboarding/komigang.ts:547`, `:577`, `:579`, och `komigang.ts:218` ("Poäng, fynd, nyckelord") och `:550` (mejltext, "Poäng, fynd, nyckelord").

Kvar i artiklarna, utanför posterna: `jobbcoach-online.mdx` har fortfarande "fynd" på flera ställen som inga poster täcker (rad 17, 28, 136, 140, 496-521, 998) och "köra analysen" på rad 984.

## Kräver att en gren är inne före push

- **REG-4** (`registrering-copy.ts:53`, `:246`, `:254`): "lägger du in tiden, så säger vi till när det är dags att förbereda dig", "har du en intervju bokad står den under Intervjuer på gång" och "Intervjuer på gång, med tid och plats". Att lägga in intervjuns tid ("När är intervjun?") finns bara på `feat/jobbsoket-omgang2` (inne i `origin/main` på `5be891a2`, inte i den här grenens bas).
- **ART-9, rad 655** i `vad-ar-en-jobbcoach.mdx` ("ser dina intervjuer på gång"): rubriken "Intervjuer på gång" finns i basen, men listan med tid och plats kommer med `feat/jobbsoket-omgang2`. Kontrollera efter sammanslagningen.

Inget annat jag har fört in bygger på `fix/brev-kvar`: "de två senaste går att ändra", Markera som sökt, Ska sökas, veckans mål och uppföljningsmejlet efter tolv dagar finns redan i basen.

## SEO-grinden

`scripts/seo-baslinje/publikt-omgang3-undantag.json` har:
- `RUBRIK_BYTT`: JM-1 (H3 och HowTo-steg 1), CVA-1 (H2 och sex H3-par; den sjunde H3, "Datum, ordning och längd", är ny), CVA-4, CVA-3, CVA-9 (HowTo-rubrikerna), CVA-5 (slutblockets H2), FUN-7, FUN-8.
- `H1_BYTT`: /verktyg/cv-analys (B1).
- `META_BYTT`: description på /verktyg/cv-analys och /priser.
- `FAQ_BYTT`: tre frågor på /verktyg/cv-analys (CVA-3, CVA-5, CVA-6).
- `LD_UNDANTAG`: /verktyg/jobbmatchning, /verktyg/jobbcoachen, /funktioner, /verktyg/bli-upptackt, /verktyg/cv-analys, `/` (Organization+WebSite+FAQPage), /priser (Product och FAQPage), /verktyg/linkedin-optimering, /verktyg/personligt-brev, /verktyg/skapa-cv, /cv-exempel och alla rörda artiklar (BlogPosting, plus FAQPage där ett FAQ-svar ändrats).

Teckenantal, räknade: metabeskrivningen på /verktyg/cv-analys 152, på /priser 152, twitter på /verktyg/cv-analys 124, twitter på /funktioner 145, OG- och twitter-titeln på /verktyg/cv-analys 51, förklaringsraden i `plans.ts` 54. Inga titlar (title) är ändrade.

## Kontroller

Körda:
- `node C:\Users\chris\cvbrev\scripts\arbetsyta.mjs`, tre gånger: 3,6 GB ledigt vid start, sedan 0,4, 2,1 och 2,0 GB ledigt.
- Varje ersättning gick genom ett skript som bara skriver om gamla texten finns exakt så många gånger som väntat (oftast en), så att inget citat har gissats.
- Sökning efter tankstreck i alla tillagda rader: inga. AUTH-1 tog bort det enda i en rörd fil.
- Sökning i testfilerna efter de gamla strängarna; de träffade testerna är uppdaterade (lista ovan).
- Genomläsning av importerna i de ändrade filerna (inga borttagna konstanter som fortfarande används, `CV_ANALYSIS_LIMIT` borta ur två filer där den inte längre läses).

Inte körda:
- `npx tsc --noEmit` och vitest: under 3 GB ledigt minne när de skulle köras (2,1 och 2,0 GB), så enligt uppdraget kördes ingetdera. Berörda testfiler att köra när minnet räcker: `src/lib/plans/__tests__/gratis-copy.test.ts`, `src/lib/plans/__tests__/paketnamn.test.ts`, `src/components/pricing/__tests__/paket-copy.test.ts`, `src/components/artiklar/reklam/__tests__/reklam-copy.test.ts`, `src/components/paywall/__tests__/paywall-copy.render.test.tsx`, `src/components/registrering/__tests__/register-flode.test.tsx`, `src/components/publikt/__tests__/registrering-prov-kontrakt.test.tsx`.
- Dev-server, `next build`, webbläsare, skärmdumpar och SEO-diffen: inte tillåtna på datorn i dag. Telefonskärmarna TEL-1, TEL-3, TEL-4, TEL-5 och TEL-6 är omritade utan att ha setts i en webbläsare; de använder skärmarnas befintliga klasser men kan behöva justeras i höjd och radbrytning. Ordantalet på startsidan, /verktyg/cv-analys, /verktyg/jobbmatchning och reklamkorten (SEO:s "trångt") är inte mätt.
- Inga anrop mot produktionen eller databasen.
