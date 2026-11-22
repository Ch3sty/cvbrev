# Byggnoter: de tre artiklarna 2026-11

Byggt 2026-11-22 på `design/publikt-omgang3` (från `e87b3b32`), efter byggordern A till L i `seo-slutgranskning.md`. Ingen push. Artiklarnas text är orörd i bygget; ändringarna i befintliga artiklar är bara de meningar som listan i A anger.

**Datum:** `date` och `updated` i de två nya artiklarna och `updated` i `rotation-test-guide` är 2026-11-22. Sker pushen en annan dag ska de tre fälten ändras till pushdagen (frontmatter, inget annat), och undantagsfilernas `datum` får stå.

## Källorna och arbetsgivarnamnen (läst 2026-11-22)

**Arbetsförmedlingens sidor, lästa om i dag** (A: Aktivitetsrapportera, C: Villkor när du har ersättning från a-kassan, båda 200; sidan om sjukdom och sidan om villkor i program 200; den gamla adressen Om du behöver styrka sökta jobb svarar 301 till C). Alla 35 raderna i briefens faktatabell stämmer mot sidorna. Inget har ändrats sedan SEO läste dem, så artikeln stoppas inte. Nyanser som artikeln redan hanterar rätt:

- Innehållslistan i A har inte praktik och arbetsträning; de står under vem som ska rapportera. Artikelns H3 och stycke säger precis så.
- Blankettnumret Af 00331 står i blankettens filnamn på A, inte i löptexten. Numret stämmer.
- Telefon är en väg för den som inte kan fylla i eller lämna in blanketten. Artikeln skriver så.
- A har ett stavfel ("senaste den 14:e"). Artikeln citerar inte meningen.
- "Kontakta oss så ändrar vi uppgifterna" och "Skriv ut dig på Mina sidor" står som två meningar på A; artikeln återger båda.

**Arbetsgivarnamnen.** Sökta ordagrant på allabolag.se (`/what/<namn>` och sökningen), proff.se (samma data som allabolag) och i en webbsökning med citattecken. Bolagsverkets e-tjänst och merinfo.se gick inte att fråga maskinellt.

| Namn | Träff | Närmaste |
|---|---|---|
| Hasselgläntans Redovisning | ingen | ingen nära |
| Tallmons Åkeri | ingen | bostadsrättsföreningar och föreningar med namnet Tallmon, inget åkeri |
| Björkvallens Bostäder | ingen | Björkvallen sport och fastigheter AB (annat namn) |
| Älgmyra Bygg | ingen | ingen nära |
| Strandlyckans Tandvård | ingen | Strandlyckans stugby, café och föreningar, ingen tandvård |

Inget namn byttes.

## Punkt för punkt

| Punkt | Commit | Vad som byggdes |
|---|---|---|
| G | `c6d1201d` | `EXEMPEL_AVSANDARE` läser namn, titel, telefon, e-post och ort ur `SHOWCASE_CV` (073-456 78 90, erik.lindberg@email.se). `brevmallar-miniatyrer.ts` fick flaggan `--alla`; alla 40 brevbilder omritade. Granskat i bild: Linne, Kalksten, Kolumn och Mörkrum har samma namn, titel, telefon, e-post och ort i CV och brev. Brevmotorns, brevruttens och visarens tester gröna (201). |
| H | `17bac131`, `2cf81e6b`, `2b9cb33f` | `CvOchBrevPar` (server) och `CvOchBrevParVal` (klientö), `cv-och-brev-par.css`. Ett kort i brevets färg: namnraden (namn, Gratis eller Premium, PDF · Word), arken på brevrummets vägg sida vid sida med etiketterna CV och Personligt brev, lätt lutade, med klack; ett byte tonar in när båda bilderna laddat (det gamla paret ligger nedtonat med en kopparlinje under). Mallraden: åtta CV-miniatyrer, i telefonen en egen rullande rad med scroll-snap (64 px). Svep och, i brett läge, kantpilar (44 px). Knappen "Skriv brevet i {mall}" (koppar, pil) och länken "Bygg CV:t i {mall}", raden om fotoplatsen för mallar med foto (reserverad höjd), fotraden ur `BREV_GRATIS_NAMN` och `paketKort()`, "Se alla mallar". Händelserna med `typ: 'par'` och `mal`. |
| I | `8d0117b0` | `JOBB_KORT_SLUGAR` och ny `JOBB_SKAL_SLUGAR` (bara aktivitetsrapporten): hjälteknapp, klistrad mobilknapp och nytt `SidoJobbKort` till Sökta tjänster, Jobbsökets kort som slutkort, inget gratiskort. `injectClusterCta` hoppar över artiklar med `<CvOchBrevPar` eller `<LoggaSoktJobb`. |
| J | `0f5d8fbd` | `LoggaSoktJobb` (aside) runt `LoggaArkPublik`, fält och text orörda. `sample_completed` med `kind: 'sokt'`, `surface` och `slug` på artikeln och verktygssidan. |
| K | `2975c6ca` | `ManadsbladArtikel`, serverkomponent, antalen 4, 1, 1 och "5 sökta jobb och 1 intervju"; ett test läser tabellen i MDX och fäller om de skiljer sig. |
| L | `4f91c165` | `hjalteKnapp(cluster, verktyg, provTyp)` och `artikelProvTyp(mdx)`. |
| A, B | `175314b6`, `409bfee9`, och commiten med de här noterna | Åtta meningar enligt listan (sju sidor). Undantagsfilerna `spatial-formaga-2026-11-22`, `artiklar-2026-11-lankar-in` (LD_UNDANTAG per rörd artikel, plus LANK_BORTA och RUBRIK_BORTA för Läs vidare och artikellistan) och `hjalteknapp-provtyp-2026-11-22` (fem rader). |
| C | i H, J och K | Märkningen kontrollerad i test och i HTML: inga h1 till h6, rätt `aria-label`, alt-texter, `alt=""` på miniatyrer, bara `mall=linne` i HTML, ingen `priority`, inga iframes. |
| D | `9ae8d151` | Två bilder, se avvikelse 3. |
| Artiklarna | `409bfee9` | Tre MDX-filer, brieferna och SEO:s slutgranskning committade. |
| Escape i toppraden | `a257b867` | `useStangMeny`: klick utanför och Escape stänger klockan, meddelanderutan och profilmenyn, fokus tillbaka till knappen vid Escape. Test på hooken och på klockan. |
| QA live 5, punkt 1 och 2 | `961e9a16`, `e4ea288f` | Raderingsarket: länken "Så hanterar vi dina uppgifter" inline-block med 13 px luft och lika mycket negativ marginal (44 px, raden står still). Valen i ett rutnät två om tre, lika höga. |
| QA live 5, punkt 3 | `1dd4b462` | `recruiterView.ts` formar längden ur nytt internt fält `durationMonths`: hela år nedåt, "Under 1 år", summan stannar vid `yearsOfExperience`. |
| QA live 5, punkt 4 | `c80a78b1` | `profilRad` i `ProfileSections.tsx`: när namnet syns står ingen profiletikett under det. |

## Avvikelser från byggordern, med skäl

1. **J, formulärets `action`.** Ett formulär som skickas med GET ersätter frågesträngen i `action`, så `action={SOKT_KONTO_HREF}` hade landat på `/register` utan redirect. Formuläret har därför `action="/register"` och redirect som dolt fält; utan JavaScript blir adressen `/register?lage=sokt&redirect=...`, samma mål som `SOKT_KONTO_HREF` (testat i vitest). Radioknapparna för läget har `name` (annars är de ingen grupp); textfälten har inget.
2. **J, datumfältet** är förifyllt med dagens datum, som på verktygssidan i dag. Byggordern säger att arkets fält inte ändras, och datumet pekar inte ut någon. Tjänst och arbetsgivare är tomma.
3. **D, bilden till samma mall** visar namnet och titeln ur CVExample-rutan men inte kontaktraden: i standardens parkort ryms inte "erik.lindberg@email.se · 073-456 78 90 · Stockholm" i 28 px. Kortet till vänster säger "Samma telefonnummer och samma e-postadress" ordagrant ur artikeln. `mall.mjs` fick varianten `rader` (aktivitetsrapportens tre rader ur tabellen) och en valfri liten etikett per dokument i `par`; inga befintliga bilder ändras. Bilderna: 55 kB och 45 kB, 1536 x 1024, valideringen utan fel.
4. **H, kantpilarna** finns bara i brett läge. I 412 och 375 täckte de arkens mitt; där byter svepet och mallraden.
5. **A, "efter stycket"** i saga-upp-sig och personligt-brev-layout: meningen står sist i stycket, inte som eget stycke. Samma ord, samma plats i avsnittet.
6. **QA punkt 3:** "Under 1 år" med versal, som den gamla raden "Under ett år". **QA punkt 4:** region och "aktiv i poolen sedan" står kvar efter yrkesrollen när de finns; i QA-fallet blir raden bara "Projektledare".
7. **Koppar:** i 1440 syns visarens kopparknapp samtidigt som sidokortets kopparknapp, som alla artiklars inline-kort gör i dag.

## Grindarna

- `npx tsc --noEmit`: utan fel.
- Hela vitest: 5 094 godkända och 1 fel (mallsystemets aliastest läste "?mall=-adresser" i en kommentar), rättat i `2cf81e6b`; filen grön därefter.
- `next build --webpack`: grönt, två gånger (andra efter kantpilarna).
- **SEO-grinden på hela sajten** (498 sidor, `publikt-omgang3-sidor.txt`, mot `publikt-omgang3-efter-live-3.json`): före undantagen Fel 81, efter Fel 2. De två är ogImage på `/verktyg/bli-upptackt` och `/verktyg/personlighetstest` (tom i live, verktygens bild lokalt). Sidorna är orörda i bygget, live svarar fortfarande tomt, och det förra lokala bygget (`publikt-omgang3-diff.md`) fällde på exakt samma två rader: en skillnad mellan det lokala webpack-bygget och Vercel, inte ett fel i grenen. Ingen undantagsrad skriven för dem. Rapport: `docs/qa/seo-diff/artiklar-2026-11-diff.md`.
  - LANK_BORTA för den enkla prova-adressen på exakt de fem sidor SEO väntade: cubiks-logiks-test, ordforstaelse-test, talserier, i-prov och stanine-testresultat. Alla fem länkar fortfarande till `/verktyg/rekryteringstester` (saas-leads villkor). Matrisartiklarna oförändrade.
  - 136 LANK_BORTA och 4 RUBRIK_BORTA: Läs vidare-korten och artikellistan (`/artiklar`, `/artiklar?page=2`), där de två nya artiklarna tränger undan äldre kort.
  - De sju rörda sidorna: bara ny länk och några ord fler, rubriker och FAQ orörda.
  - rotation-test-guide: H1, meta, de tre nya rubrikerna, FAQ 7 och JSON-LD inom undantagen.
- **De två nya sidorna** (`artiklar-2026-11-nya.json`): 200, `index, follow`, canonical till egen adress, title och description ordagrant som brieferna, en h1, H2 och H3 i briefernas ordning, sex FAQ synliga och i FAQPage, typerna BlogPosting, BreadcrumbList, FAQPage och HowTo, författarporträttet och därefter artikelbilden först bland bilderna (visarens bilder efter), båda i `/sitemap.xml`.
- **Prestanda** (`perf-publikt.ts`, Pixel 7, strypt): rotation-test-guide LCP 728 ms, aktivitetsrapporten 648 ms, samma mall 768 ms, CLS 0 på alla tre.

## Webbläsaren (next start, Chrome, 1440, 412 och 375)

- **Samma mall:** artikelbilden i hjälten, visaren direkt efter snabbsvaret, inget inline-kort. Linne först; Kalksten och Mörkrum byter båda arken, knappen (`/skapa-brev/start?mall=kalksten`), länken (`/cv-mallar/prova?mall=kalksten`), raden om fotoplatsen och den valda miniatyren. Fotraden ordagrant. Minsta tryckyta 44 px. Knappen för Kalksten öppnar startflödet med "Använd mallen Kalksten" (1440 och 412). Ingen sidledsrullning i någon bredd.
- **Aktivitetsrapporten:** alla reklammål på sidan är `/verktyg/sokta-tjanster` (hjälteknappen "Håll koll på sökta jobb", sidokortet, slutkortet, mobilknappen i 412 och 375); ingen `/cv-mallar`, inget gratiskort, inget inline-kort, inga dubbla id. Bladet: Oktober 2026, 4, 1 och 1, sex grå streck, "Raderna ingår i Premium" tre gånger, uttagen med märkningen. Arket ifyllt och skickat: landar på `/register?redirect=%2Fdashboard%2Fsokta-tjanster%3Flogga%3D1`, tjänst och arbetsgivare bara i webbläsarens lagring (`jc_sokt_prova`), aldrig i adressen.
- **Spatial förmåga:** hjälteknappen "Prova fem uppgifter gratis" till `/verktyg/rekryteringstester/prova?typ=spatial`; provet gjort till slut i 412 (fem uppgifter, resultatet med genomgången).
- **Befintliga artiklars reklam:** reklammålen i logiska-tester, skriva-personligt-brev-guide, hur-ska-ett-cv-se-ut, styrkor-svagheter-intervju, saga-upp-sig och soka-jobb-via-mail är identiska lokalt och live. `audit-cta-clusters.ts`: enda skillnaden är den nya raden för aktivitetsrapporten (generic).
- **Länkarna in:** alla åtta står där de ska.
- `pageerror` och svar över 500: inga.

## Testkontot (en gång, sist)

`qa-art11-ade45aff@jobbcoach-qa.test`, Pixel 7: arket i artikeln ifyllt, registrering, välkomstsidan hämtade utkastet och landade i `/dashboard/sokta-tjanster`, där jobbet stod (en rad i `job_applications`: Ekonomiassistent, Hasselgläntans Redovisning, annons); utkastet borttaget ur webbläsaren. Raderingsarket i samma konto: länken 44 px hög i 412 och 1440, valen i tre rader och två kolumner, alla 58 px höga, ingen sidledsrullning. Inga AI-anrop.

Städning: räknat före (auth.users 1, profiles 1, job_applications 1, user_activities 9, email_schedule 2, email_confirmations 1, sessions 1, identities 1). Raderat med produktens egen radering (`/api/konto/radera`, 200). Efteråt 0 på kontots id i alla tabeller och 0 i auth på adressen. Kvar: en rad i `posthog_raderingar` med kontots id (produktens kö för radering i PostHog, ingen e-post). Min delete av den raden nekades av behörigheten; den tas bort av den som har behörighet: `delete from public.posthog_raderingar where distinct_id::text = 'f04d5d30-92c0-42c7-9e43-3cfc112ddcaf'`. `public_rate_limits` orörd; ett publikt prov gjordes en gång från den lokala servern.

## Det som inte gick att kontrollera

- Bolagsverkets register och merinfo.se maskinellt (allabolag och proff sökta).
- Bli upptäckt punkt 3 och 4 i webbläsaren: kräver en godkänd rekryterare och en kandidat, så de är kontrollerade i enhetstest mot `toRecruiterDetail` och `profilRad`.
- Meddelanderutan i toppraden i webbläsaren (visas bara för synliga kandidater): enhetstest på den gemensamma hooken.
- Att artikelns LCP är oförändrad mot före: de nya sidorna har inget före; mätningen ligger inom budget.

## Avläsningar

| Datum (vid push 24 nov) | Vem | Vad |
|---|---|---|
| 1 dec (P + 7) | SEO | URL-inspektion av de två nya: indexerade, Googles kanoniska adress lika med vår |
| 8 dec (P + 14) | SEO | rotation-test-guide: visningar per dag, "spatial förmåga", "vad är spatial förmåga", "hög spatial förmåga" |
| 8 dec (P + 14) | saas-lead | att händelserna kommer in: `mallvisning_visad` typ par, `sample_completed` kind sokt, hjälteknappen med `?typ=spatial` |
| 22 dec (P + 28) | SEO | rotation-test-guide mot 23 okt till 9 nov; aktivitetsrapporten; samma mall och kannibalisering mot cv-och-personligt-brev och personligt-brev-mall-gratis |
| 22 dec (P + 28) | saas-lead | provstarter per visning (spatial), andel som skickar arket (gräns 3 procent efter 100 visningar), klick i visaren (gräns 5 procent efter 100 visningar) |
| 12 jan | båda | 90 dagar, intäkt per landningssida, beslut om visaren i cv-och-personligt-brev och om hjälteknappen |
| december, mallomgången | byggaren | "26" i FAQ 6 (frontmatter och FAQItem), "40" och "i dag som PDF men inte som Word" i samma mall |
| dagen efter push | SEO | första avtrycket av de två nya sidorna mot live |

Datumen räknas från pushdagen; sker pushen inte 24 november flyttas de lika mycket.
