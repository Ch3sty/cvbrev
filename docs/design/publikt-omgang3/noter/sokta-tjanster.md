# Not: /verktyg/sokta-tjanster (ny sida)

Skiss: `sidor/sokta-tjanster.html`, rum `jobb`. Bilder: `bilder/sokta-tjanster-375|412|1440-NN.png`. Sidan finns inte i dag (beslut 19). Den är ritad på verktygssidornas mall: hjälte, första handling, Så fungerar det, innehållssektioner, Premium, frågor.

## Sidans delar, i ordning

1. **Hjälten.** Spåret (`delar/stig.html`) i stor skala med veckans mål under. Tre brickor: 0 kr, 12 tysta dagar, 1 blad per månad.
2. **Lyftet: Logga en tjänst du har sökt.** Arket som det ser ut i kontot (växeln Jag har sökt / Jag ska söka, Tjänst, Arbetsgivare, Datum sökt, Hur sökte du?). Arkets knapp är sidans kopparknapp och går till registreringen.
3. **Så fungerar det.** Fyra steg som väg, varje steg med en liten bild av brickan.
4. **Från Ska sökas till erbjudande.** De fyra facken ur Sökta tjänster (Ska sökas, Sökt, Intervju, Erbjudande) med brickor, och alla händelser som går att logga som en rad etiketter.
5. **Spara annonsen med sista ansökningsdag.** Två sparade annonser som de riktiga korten (Skriv brev, Markera som sökt, Ta bort). Under: veckans mål som bild, 2 av 3.
6. **Se var ansökningarna tar stopp.** Tratten Sökta, Fått svar, Intervju, Erbjudande med brickor och "5 av 8" mellan leden. Tre kort under: Aktivitet per vecka, Hur du sökte, Svar per CV.
7. **Uppföljningsmejlet.** Utkastet som ett riktigt mejl (Till, Ämne, mallens text, Öppna i e-post, Kopiera mejlet, Skriv om kortare, Skickade du mejlet?) och de tre raderna Vad som händer sedan.
8. **Intervjun hör till tjänsten du sökte.** Tjänstens kort med dag och tid, Förbered intervjun med tre av de sju frågorna och betyg, och frågan Hur gick intervjun?
9. **Månadsrapporten.** Rapportbladet som det skrivs ut (tre avsnitt, fyra tal, foten), månadsväljaren och de tre sätten att ta ut den, med gratis och Premium utmärkt.
10. **Gratis och Premium.** Två listor sida vid sida på Premium-ön.
11. **Länkar vidare**, Rekryteringstester först.
12. **Frågor om Sökta tjänster**, nio frågor.

## Förslag till SEO (sökord och disposition)

Sökord att pröva: sökta jobb, hålla koll på jobbansökningar, ansökningslogg, lista över sökta jobb, aktivitetsrapport, aktivitetsrapport Arbetsförmedlingen underlag, uppföljningsmejl ansökan, följa upp jobbansökan, sista ansökningsdag. Sajten har noll visningar på "aktivitetsrapport", "sökta jobb" och "ansökningar" i dag.

- **title** (54 tecken): `Håll koll på sökta jobb och ansökningar | Jobbcoach.ai`. Alternativ: `Sökta jobb: logg, uppföljning och aktivitetsrapport`.
- **description** (133 tecken): `Logga varje sökt jobb, se när det är dags att följa upp och få underlaget till aktivitetsrapporten ifyllt. Gratis för alla med konto.`
- **H1:** Håll koll på varje jobb du har sökt
- **H2, i ordning:** Logga en tjänst du har sökt · Så fungerar det · Från Ska sökas till erbjudande · Spara annonsen med sista ansökningsdag · Se var ansökningarna tar stopp · Tyst i tolv dagar? Utkastet är redan skrivet. · Intervjun hör till tjänsten du sökte · Underlaget till din aktivitetsrapport, redan ifyllt · Gratis att logga. Premium när du vill ta ut mer. · Resten av jobbsöket ligger ett tryck bort · Frågor om Sökta tjänster
- **H3:** de fyra stegen, Veckans mål håller farten uppe, Aktivitet per vecka, Hur du sökte, Svar per CV.
- **Schema:** WebApplication (gratis, 0 kr), HowTo (de fyra stegen, ordagrant som på sidan), FAQPage (de nio frågorna; två svar är inte skrivna, se nedan). BreadcrumbList Hem, Verktyg, Sökta tjänster.
- **Länkar in:** menyn och foten (finns redan i `delar/mega.html` och `delar/fot.html`), startsidans ö Sökta tjänster, `/funktioner`, `/verktyg/jobbmatchning` (Från träff till ansökan), `/verktyg/jobbcoachen`, artiklarna `soka-jobb-via-mail` och `uppfoljning-efter-intervju`. Sajtkartan.
- Artikeln om aktivitetsrapporten (beslut 19) länkas härifrån när den finns. Rutan står inte i skissen.

## Kräver källa (Arbetsförmedlingens regler)

Skissen påstår ingenting om reglerna. Det här måste källverifieras innan det skrivs:

- Vad en aktivitetsrapport ska innehålla. Frågan "Vad ska stå i en aktivitetsrapport?" står i frågorna, svaret är en platshållare.
- När rapporten ska lämnas in. Produkten räknar med den 1 till den 14 i månaden efter (`src/lib/applications/afReport.ts`) och visar en nedräkning till "sista inlämningsdag". Nedräkningen är därför inte ritad. Håller regeln mot källan är den värd en plats bredvid månadsväljaren.
- Att bladets tre avsnitt (sökta annonserade jobb, intresseanmälningar och spontanansökningar, intervjuer och provjobb) motsvarar Arbetsförmedlingens egna rubriker. Skissen säger bara "underlag".
- Vem som är skyldig att rapportera, och vad som händer om man missar. Står inte i skissen och bör inte stå där utan källa.
- Raden "ingen där ser ditt konto" är vårt eget påstående om produkten, inte en regel. Den hör ändå till punkten nedan om datalagring.

## Kräver beslut

1. **Frågan "Vem kan se mina sökta tjänster?"** är en text om datalagring. Svaret är en platshållare och skrivs med ägaren. Samma sak gäller raden "ingen där ser ditt konto" i rapportavsnittet: stryk den om ägaren inte vill ha den.
2. **Tolv dagar som säljargument.** H2 och hjälten bygger på talet. Ändras gränsen i produkten måste sidan följa med. Sju dagar efter intervju står i löptext och i en fråga (omgång 2 räknas som live).
3. **Exempelföretagen** är påhittade (Dalvik Anläggning, Polhem Ombyggnad, Isberg Logistik med flera), som i CV-arket. Träffdelen på startsidan använder riktiga namn (Sweco, Trafikverket). Välj en linje.
4. **"Börja gratis"** som knapp på Premium-ön: sidan säljer in en gratisfunktion, så kopparknappen går till registreringen och länken till priserna. Vill sälj ha köpknappen där får den byta plats med länken.
5. **Telefonskärm för artikelreklamen** (beslut 19, "kräver skiss"): de fyra facken i avsnitt 4 är skärmen. De ryms på 375 px som två gånger två.

## Belägg i koden (grenen `feat/jobbsoket-omgang2`)

- Tolv dagar: `src/lib/applications/status.ts` (`NO_RESPONSE_NUDGE_DAYS`). Sju dagar efter intervju: byggspecen för omgång 2, avsnitt 2.
- Mejlets text och ämnesrad: `uppfoljningsmall` i `src/lib/jobbsok/uppfoljning.ts`. Knapparna: `src/components/jobb3/sokta/Uppfoljning.tsx`.
- Första utkastet gratis, sedan Premium: `uppfoljningSparr`, betalväggen `uppfoljning` i `paywall-copy.ts`.
- Rapportbladet, uttagen och delningslänken: `src/components/jobb3/sokta/Rapport.tsx`. Listan i länken är Premium (beslut 17).
- Tratten: `TrattBild.tsx`. Statistikens tre kort: `Statistik.tsx`.
- Ska sökas och "Sista dag onsdag 25 nov, 3 dagar kvar": `sistaDagText` i `src/lib/jobbsok/bana.ts`, korten i `Lista.tsx`.
- Händelserna: `STATUS_META` i `status.ts`. Arkets fält: `LoggaArk.tsx`. Veckans mål 1 till 10, förval 3: `profiles.weekly_application_goal`.
- De sju frågorna och betygen: `TjanstVy.tsx`, blocket Förbered intervjun. Svaren på Hur gick intervjun? ("Den är genomförd", "Den blev flyttad", "Den blev inställd"): `SmaArk.tsx`.
- "Har du skrivit personliga brev här tidigare föreslår vi att lägga in dem": `Backfill.tsx`.

## Filer bygget rör

- Ny: `src/app/(public)/verktyg/sokta-tjanster/page.tsx`, `layout.tsx` (metadata), `components/sokta-tjanster-faq-data.ts`, `opengraph-image.tsx`.
- `src/app/sitemap.ts`, menyn och foten (publika), `Startsidan.tsx` (knappen "Så fungerar Sökta tjänster" får ett mål), `FunktionerSida.tsx`.
- Nya publika komponenter för brickan, facken, tratten, mejlet och rapportbladet. De bör byggas en gång och delas med `/verktyg/jobbmatchning` och startsidan.

## Förslag till grunden

- **`delar/stig.html` i telefon.** På 375 px hamnar första etikettens underrad utanför kanten och "Erbjudande" under PO-brickan (syns i `bilder/start-375-06.png`). Min sida rättar det med egna regler (`.sparvy`). Rätta i delen: första etiketten vänsterställd, "Erbjudande" ovanför flaggan.
- **Spårets tal.** Delen säger "3 väntar på svar" men har två brickor vid Sökt.
- **Brickan (`.br`), facken (`.fack`) och tratten (`.tratt`)** bör ligga i `kit.css`. De behövs på startsidan, `/funktioner` och jobbmatchningen.
- **`.veckomal`** finns bara i startsidans egen CSS. Jag har en egen kopia (`.malrad`).
- **Ringen och träffkortet** ligger i `delar/jobbmatchning-skarm.html` (se noten för jobbmatchningen).
