# Byggnoter: Jobbsöket omgång 2

Spec: `docs/design/byggspec-jobbsoket-omgang2-2026-11-21.md`. Varje byggare skriver under sin egen rubrik.

## Byggare A

Del 1 (brickan i Kom igång), del 3 (annonsens fot på telefon), del 4 (hubben i Inför intervjun efter högsta betyg) och del 2:s enda ändring i `IntervjuHubb.tsx` ("Sätt tid" blir "Sätt tiden" i `intervjuKnapp`). Inget committat. Inga anrop mot databasen, inga migreringar.

### Del 1: brickan "Logga en tjänst du har sökt"

- `src/lib/onboarding/komigang.ts`: nyckeln `sokt_tjanst` i `BrickaKey`, i `KOM_IGANG_LISTA.gratis` på plats två och i de fem listorna i `KOM_IGANG_LISTA_GRATIS` enligt 1.3 (sju brickor var), `OMRADE_FOR_BRICKA.sokt_tjanst = 'jobb'`, fallet i `brickaText` och raden i `GRATIS_TEXT`, ordagrant ur 1.4. `soktaHref` importeras från `@/lib/jobbsok/adress`. Betalandes listor är orörda.
- `src/lib/onboarding/komigang-server.ts`: `applicationCount?` och `savedAdCount?` i `ProvadeUnderlag`, regeln i `harledProvade`, nyckeln i `KEYS`. `hamtaProvadeUnderlag` orörd.
- `src/lib/dashboard/getSummary.ts`: `applicationCount: apps.length` till `harledProvade`. Ingen ny fråga.
- Kvitteringen: `src/lib/applications/skapa.ts` (`void markeraBricka` efter lyckad insert, inte i `alreadyExists`), `src/app/api/jobbsok/ska-sokas/route.ts` (`await markeraBricka` efter insert och i båda `alreadyExists`-grenarna), `src/app/api/applications/backfill/route.ts` (`void` när `createdCount > 0`).
- `src/lib/email/lifecycle/templates/komigang.ts`: exakt fallet ur 1.6, inget annat.
- `src/components/illustrations/OnboardingScener.tsx`: `IlluBrickaSokt` ordagrant ur 1.5. `src/components/dashboard/KomIgangArk.tsx`: `BRICKA_IKON.sokt_tjanst`.
- `refresh()` ur `useDashboardData()`: i `SoktaVy.tsx` (`loggad`, efter `router.refresh()`) och i `MatchadeJobb.tsx` (efter lyckat svar i `handleSpara` och `handleMarkApplied`).

Egna beslut:
- I `handleSpara` anropas `refresh()` bara vid lyckat svar, inte när servern svarar 409 `redan_sokt`. Då finns redan en rad i `job_applications` och brickan är härledd sedan förut.
- `markeraBricka` i `skapa.ts` är `void` enligt specen. Summeringen räknar ändå raden i `job_applications`, så brickan bockas av vid `refresh()` även om nyckeln inte hunnit skrivas.

### Del 3: annonsens fot på telefon

- `src/components/jobb3/jobb/AnnonsVy.tsx`: `AnnonsFotMobil` byggd om enligt 3.2 och 3.3. Rad 1 "Skriv brev" (`StorKnapp`), rad 2 två `LitenKnapp storlek={48}` med ikon och text, i läget sökt en enda länk i full bredd. Telefonens texter i de exporterade `sparTextMobil` och `soktTextMobil`, länkarna i `FOT_SPARAD_HREF` (`/dashboard/sokta-tjanster?filter=ska-sokas&fran=annons-fot`) och `FOT_SOKT_HREF` (`/dashboard/sokta-tjanster?fran=annons-fot`). `sparText` och `soktText` står kvar för datorn, `AnnonsPanel` är orörd.
- `src/components/jobb3/kit/JobbVagg.tsx`: `FastFot` har egenskapen `rader` (klassen `rader` på `.j3-fot`). `MatchadeJobb.tsx` skickar `rader` där `AnnonsFotMobil` ritas.
- `src/app/jobb3.css`: de tre reglerna ur 3.4, direkt efter avsnittet "Fast fot på telefon".
- `IkonKnapp` borttagen ur `kit/delar.tsx` och `kit/index.ts`. Exemplet på visningssidan är ersatt av foten i fem lägen.
- `docs/bygg-noter-jobbsoket-kit.md`: raden om `IkonKnapp` och raden om `FastFot` rättade.

Avvikelser:
- CSS-regeln `.j3-liten.ikon` står kvar. Klassen används direkt (utan komponenten) i `sokta/Backfill.tsx` och `sokta/Rapport.tsx`. Specen säger att den ska stå om något annat använder den.
- Visningssidans fot ligger i en ny klientfil, `src/app/jobb3-kit/AnnonsFotDemo.tsx`. Kitsidan är en serverkomponent och kan inte skicka `onClick` till knapparna; foten måste ritas i en klientkomponent. Filen är ny och ingen annan byggare rör mappen (0.3). Foten döljs från 1280 px, som i appen.
- I läget "kunde inte spara" har vänster knapp kvar bokmärkesikonen (specen anger bara texten).

### Del 4: hubben efter högsta betyg

- `src/lib/intervju/nasta.ts`: `arHogstaBetyg` och `imorgonFraga` enligt 4.2.
- `src/app/dashboard/intervju/infor-intervjun-copy.ts`: `NASTA.lasIgen.ogonHogst`, `rubrikHogst`, `imorgon`.
- `src/components/jobb3/intervju/text.ts`: `HUBB.dagensDelar`.
- `src/components/jobb3/intervju/IntervjuHubb.tsx`: läget `arHogstaBetyg(data.handling)` ger ögonbrynet "Klart för i dag", rubriken "Högsta betyg på frågan om ...", texten med "Nästa prov öppnar i morgon." och sist morgondagens fråga när den är en annan än dagens. `nastaFraga` är delad: `banansNasta` (null i läget, så banan har ingen kopparring och dagens fråga ritas som klar och länkar till provet) och rutan, som visar `data.handling.prov` under "Dagens svar, del för del". Knappen "Läs återkopplingen igen" och raden bredvid är som förut. `valjHubbHandling` och `next_action_shown` är orörda.
- `intervjuKnapp`: "Sätt tid" är "Sätt tiden" (del 2).

### Tester

- `src/lib/onboarding/__tests__/komigang.test.ts`: 30 gröna.
- `src/components/registrering/__tests__/villkor.test.tsx`: 12 gröna.
- `src/components/jobb3/jobb/__tests__/annonsFot.test.tsx` (ny): 9 gröna.
- `src/lib/intervju/__tests__/nasta.test.ts`: 25 gröna.
- `src/app/dashboard/intervju/__tests__/infor-intervjun-copy.test.ts`: 5 gröna.
- `npx tsc --noEmit`: inga fel i A:s filer. Vid körningen (20:27) fanns fel i `src/components/jobb3/oversikt/__tests__/oversikt.test.ts` (C, `kalladDag` saknas i en testrad) och `src/lib/jobbsok/__tests__/intervjulagen.test.ts` (B), båda pågående arbete.

### Ses i webbläsare (inte prövat)

- Del 1, 412 x 915: nytt gratiskonto utan val med ifylld profil ser "1 av 6 provade. Nästa: logga en sökt tjänst." på `/dashboard`. 1440: "Kom igång, 1 av 6 provade" längst ned i sidomenyn. Arket: brickan på plats två (utan val), först under "Gratis i de andra delarna" (valet tester), minst 64 px, ingen klippning i 360. Trycket öppnar `/dashboard/sokta-tjanster?logga=1&fran=komigang` med arket på "Jag har sökt". Efter "Jag har sökt" och efter "Jag ska söka": brickan avbockad med "Finns under Sökta tjänster" utan omladdning, i båda bredderna. Premiumkonto: 12 brickor som förut.
- Del 3, `/jobb3-kit` (bara under utveckling) och en annons i Matchade jobb, i 360, 412 och 768, ljust och mörkt: text på alla tre handlingar i alla lägen, "Försök igen" bredvid "Markera som sökt" klipps inte i 360 (det är trångt: cirka 325 av 328 px), knapparna 48 px, fokusramen syns, "Sparad" öppnar Ska sökas med `fran=annons-fot`, "Loggad som sökt. Visa listan" öppnar listan, sista stycket och "Ansök hos ..." syns ovanför foten. 1440: ingen fot, annonsens knappar som förut. Kom igång-brickan bockas av efter Spara och Markera som sökt.
- Del 4, gratiskonto efter dagens prov med 5 av 5 på "Ett problem du löste", 412 x 915 och 1440: "Klart för i dag", "Högsta betyg på frågan om ett problem du löste", inget "Skriv om" på sidan, texten slutar med morgondagens fråga, ingen kopparring i banan, de fyra brickorna säger "Fanns med", väggens knapp öppnar det bedömda svaret. Ett prov med 3 av 5 och kvoten slut ser ut som förut.

## Byggare B

Del 2 på motorns och serverns sida: kontraktet (2.2), servern (2.5), utkastet efter intervju eller provjobb (2.6), notisen och veckobrevet (2.7). Inget committat. Inga anrop mot databasen, inga migreringar, inga AI-anrop, inga mejl.

### Kontraktet (2.2)

- `typer.ts`: `UppfoljningsTyp`, `INTERVJU_BESKED_DAGAR` (7), `KALLELSE_UTAN_TID_DAGAR` (2), `IntervjuInfo.kalladDag`, `TjanstLage.foljUppTyp` och `.tystGrans`; `tyst`, `tystSedan` och `harUtkast` räknas nu per sort. `AttGoraTyp` har `satt_intervjutid`.
- `utkastTyp.ts` (ny, exporteras från `index.ts`): `AMNE_START`, `utkastTyp(subject)`, `utkastGaller(u, typ)`.
- `lage.ts`: `foljUppTyp`, `tystGransFor`, `kanBliTyst` (nu `foljUppTyp !== null`, spärrens kommentar omskriven), `nastaPaminnelse(skickad, typ = 'ansokan')`, `skaSattaTiden`. `intervjuInfo` sätter `kalladDag` i alla lägen.
- `intervju.ts`: `beskedText`, `intervjuText` med de två nya grenarna. Tillägg utöver specen: `momentOrd(t)` (`{ stor: 'Intervjun' | 'Provjobbet', liten }`) och `momentDag(t)` (intervjudagen, annars senaste aktivitet), så att C:s texter har samma `M`, `m` och `D` som motorns.
- `lista.ts`: `foljUppText`, `soktaVagg` med "har inte gett besked på N dagar". `bana.ts`: tyst bricka vid Intervju får etiketten "tyst N dagar". `attGora.ts`: `folj_upp` efter intervju eller provjobb och `satt_intervjutid` med texterna, väggarna och ordningen i 2.3. Texterna för en obesvarad ansökan är orörda.
- `tystnad.ts`: `Tystnad.typ` och `.momentDag`. `server.ts`: `UppfoljningLage.typ` och `.grans`.
- `uppfoljning.ts`: `UppfoljningUnderlag.typ` och `.momentDag`, `underlagForModellen` för intervju och provjobb, `mallAmne` med valfri `typ` (byggd på `AMNE_START`), reservmallen ur tabellerna i 2.6, `uppfoljningSparr` med `typ` och `subject`.

### Servern (2.5)

- `src/app/api/jobbsok/uppfoljning/[id]/route.ts`: GET och POST läser händelserna parallellt med uppföljningarna och räknar `typ` med `intervjuInfo` och `foljUppTyp`. POST: 409 `inget_att_folja_upp` när `typ` är null; ett utkast som gäller öppnas som det är; spärren med sorten; `ateranvand` väljer förra raden bland rader av samma sort; en oskickad rad utan text eller av fel sort skrivs över på plats med `subject`, `body` och `rewrites: 0`, annars insert. GET ger `typ`, `grans` och bara ett utkast som gäller. Svaren på POST har också `typ`.
- `.../skickad/route.ts`: `typ` räknas ur händelserna som redan lästes. Ett oskickat utkast markeras bara när det gäller, annars skapas en rad utan text. `nastaPaminnelse(indata.datum, typ)`.
- `src/lib/jobbsok/server.ts` (`hamtaSoktTjanst`): `utkast` bara när det gäller, kontots utkast läser `subject`, spärren får `typ`, `nastaPaminnelse` får `typ`, `uppfoljning` får `typ` och `grans`. Inga nya frågor.
- `uppfoljningServer.ts`: `lasUnderlag` har en femte, valfri parameter `{ typ, momentDag }` (förval `ansokan`), så att `/kortare` (inte min fil) fungerar orörd.
- `src/lib/analytics/events.ts`: valfri `typ` på `uppfoljning_utkast_oppnat`, `uppfoljning_sparr` och `uppfoljning_loggad`.

### Utkastet (2.6)

- `src/lib/openai/uppfoljningsmejl.ts`: `systemEfterMoment(sprak, typ)` med texterna ur 2.6 (70 skrivs som `UPPFOLJNING_MAX_ORD - 20`), `instruktionFor(u)` väljer efter `u.typ`, och `skrivUppfoljningsmejl` använder den. Samma modell, schema, temperatur, tidsgräns och validering. Inga exempel på platshållare utöver förbudet ("inga platshållare som [NAMN]", som i specen och i dagens instruktion).
- "Skriv om kortare": intervjuutkastets form går genom `delaUppMejl` och `forberedKortning` (hälsning och avslut ordagrant, ett telefonnummer i texten blir `[TELEFON 1]`). Prövat på båda språken.

### Notisen och veckobrevet (2.7): KRÄVER ÄGARENS JA FÖRE PUSH

Allt för 2.7 ligger i fyra filer och inget annat beror på dem: `src/lib/notifications/followUp.ts`, `src/lib/notifications/__tests__/followUp.test.ts`, `src/lib/email/lifecycle/templates/weekly-digest.ts`, `src/lib/email/lifecycle/__tests__/weekly-digest.test.ts`. Prövat: med de fyra filerna återställda till HEAD går deras gamla tester gröna mot den nya motorn (båda hoppar över tjänster med svar innan de frågar motorn), så de kan lämnas utanför en push.

- Notisen: frågan läser också `interview_completed` och `trial_work_completed`, gränsen i frågan är `INTERVJU_BESKED_DAGAR`. `followUpCandidates` låter motorn avgöra för rader med historik (avslutade och erbjudanden bort som förut), kandidaten har `typ` och `momentDag`, reservläget tar bara tjänster utan svar. `notisText(k)` ger titel och text per sort. `metadata.efter`.
- Veckobrevet: `WeeklyDigestData.besked` (dagen lagras som `YYYY-MM-DD` och skrivs med `langDag`), `beskedNote` före det oförändrade stycket, `digestPreheader`. `shouldSend`, ämnesraden, sifferraden och veckans mening är orörda.

### Egna beslut och avvikelser

1. `PUT` på uppföljningsrutten: ett nytt ämne som skulle byta utkastets sort (till exempel ett intervjuutkast vars ämne inte längre börjar "Tack för intervjun") sparas inte, det gamla ämnet står kvar. Specen säger att PUT inte ändras, men eftersom sorten bor i ämnesraden skulle ett ändrat ämne annars få utkastet att försvinna. Vyn skickar i dag alltid det befintliga ämnet, så inget märks.
2. `skickad`: en oskickad rad utan text (från en äldre klient) markeras som förut, inte bara ett utkast som gäller. Annars skulle raden bli liggande oskickad.
3. Ett utkast som skrivs över på plats behåller sin `created_at`, så det räknas inte på nytt i Premiums tak på 30 per dygn. Det gäller bara Premium som byter sort på samma tjänst.
4. `momentOrd` och `momentDag` i `intervju.ts` är tillägg till kontraktet.
5. Notisen: saknas intervjudagen (ska inte hända) används dagen ur `status_updated_at`, sedan `created_at`.

### Inte prövat

- AI-vägen: instruktionen är prövad som text i vitest (de förbjudna fraserna på båda språken, orden per sort, inga märken utöver förbudet), aldrig mot modellen. Reservmallen är prövad ordagrant. Första riktiga intervjuutkastet bör läsas: ämnet, att dagen stämmer, att inget påstås om hur intervjun gick.
- Rutterna mot databasen: inte körda. Överskrivningen på plats av ett utkast av fel sort och 409 `inget_att_folja_upp` ska ses med QA-kontona.

### Ses i webbläsare

Testraderna (a) till (d) i 2.9. Särskilt: (a) får ett utkast vars ämne börjar "Tack för intervjun" och nämner den 10 november; efter "Ja, det är skickat" säger raden sju dagar. (d) visar inget Följ upp-block och Att göra nu säger inte "Öppna utkastet"; i nätverksfliken ger POST mot uppföljningsrutten 409. Gratiskontot med använt ansökningsutkast får 402 för (a). En obesvarad ansökan på tolv dagar låter som förut.

### Vitest

`src/lib/jobbsok/__tests__/intervjulagen.test.ts` (34, ny), `motor.test.ts` (43, fallet om spärren omskrivet till de nya lägena), `klicktest-2026-11-21`, `uppfoljningKortare`, `uppfoljningMarken`, `datum` gröna. 2.7: `followUp.test.ts` (18), `weekly-digest.test.ts` (13).

## Byggare C

Del 2:s vyer (intervjulägena) mot B:s kontrakt i 2.2. Inget committat. Inga anrop mot databasen, inga migreringar, inga AI-anrop.

### Vad som byggdes

- `src/components/jobb3/sokta/TjanstVy.tsx`
  - 2.4: `grund` blir `folj-upp` bara när `t.foljUppTyp !== null && (tyst || u.utkast || uppfoljdIdag)`, `onskat` bara när `fokus === 'folj-upp' && !t.avslutad && t.foljUppTyp !== null`.
  - Läge 1: panelens rubrik "Fråga `företaget` om besked" och underraden "Ett kort mejl som tackar för `m` ...", väggens ingress på dator efter sju dagar ("`M` var `veckodag` `D` och du har inte fått besked. ...") och före sju dagar ("`M` var `veckodag` `D`. Har du inte fått besked den `langDag(t.tystSedan)` säger vi till."), väntande raden i Händelser "Inget besked på `N` dagar. ...". Ögonbrynet "Tyst i `N` dagar" som förut. Texterna för en obesvarad ansökan är orörda.
  - Läge 2: `tidLank` säger "Sätt tiden". Nytt block överst i panelen i läget `utan_tid` (före Förbered intervjun): `TonYta` med `j3-h3`, `j3-text` och två `LitenKnapp storlek={48}` ("Sätt tiden" med kalenderikon öppnar `IntervjuTidArk`, "Intervjun har redan varit" `variant="streckad"` öppnar `HandelseArk` med `interview_completed`). Under 1280 px alltid, från 1280 px först när `skaSattaTiden` (klassen `xl:hidden` annars). Texterna före och efter två dagar enligt tabellen. Väggens ingress efter två dagar: "Du blev kallad till intervju den `K`. ...".
- `src/components/jobb3/sokta/Uppfoljning.tsx`: sorten ur `start.typ` och gränsen ur `start.grans`. Raden medan utkastet skrivs, raden "Till" och raden 3 i "Vad som händer sedan" per sort (tabellen `SORT_TEXT`), raden 2 "Ingen ny påminnelse på `tolv`/`sju` dagar." och datumet `plusDagar(idag, start.grans)`. Reservdatumet efter "Ja, det är skickat" (om servern inte skickar `nastaPaminnelse`) räknas med `nastaPaminnelse(idag, typ)`. Övrigt orört, också rättningen från i går: hämtningen körs bara vid monteringen.
- `src/components/jobb3/sokta/Lista.tsx`: i gruppen Följ upp har en rad efter intervju eller provjobb texten `beskedText(t)` och knapparna "Fråga om besked" (dator) och "Fråga om besked med ett kort mejl" (telefon); brickorna "Tyst i `N` dagar"/"Tyst `N` dagar" som förut. Gruppens underrad är `foljUppText(g.folj_upp)`. Knappen vid kallelse utan tid heter "Sätt tiden". I `ListaVagg` ritas facket Intervju som facket Sökt när `b.tyst` (tonen `tyst`, taggen utan "tyst "). "Ta bort" och "Markera som sökt" på aktiva rader står kvar.
- `src/components/jobb3/oversikt/oversikt.ts`: `goraMobil` för `folj_upp` efter intervju eller provjobb ("`M` var den `D`.", med utkast "Utkastet till mejlet är skrivet.") och nytt fall `satt_intervjutid` (rubrik "Sätt tiden för intervjun", text "`Företaget`. Kallad `kortDag(kalladDag)`."). `tjanstRad` har en gren före den vanliga `vantar_besked`: när `t.tyst` i intervjusteget `beskedText(t)`, telefon "`Tjänsten`. `M` var den `D`.", `steg: { steg: 3, tyst: true }`, status `folj-upp`.
- `src/components/paywall/paywall-copy.ts`: bara brödtexten i varianten `uppfoljning`, ordagrant ur 2.5 med `PREMIUM`. Rubrik, knappar, pris och kampanj orörda.

### Egna beslut och avvikelser

- Följ upp stod förut kvar för gott när blocket väl hade visats (`foljUppVisad`), också efter ett loggat avslag. Nu står det kvar bara så länge tjänsten har en sort att följa upp. Bekräftelsen och Ångra efter "Ja, det är skickat" står kvar som förut (sorten ändras inte av en uppföljning). Loggar användaren en kallelse, ett avslag eller ett erbjudande medan blocket syns försvinner det; det följer 2.4 och 2.8.
- Väggens ingress före sju dagar: direkt efter "Ja, det är skickat" (innan serverdatan är tillbaka) räknas dagen med `nastaPaminnelse(lokalUppf.sent_at, t.foljUppTyp)` i stället för det gamla `t.tystSedan`, så att den inte visar ett passerat datum.
- "Tolv" skrivs med en liten hjälpfunktion i `Uppfoljning.tsx` (`ordtal` räcker till tio). Andra gränser än 7 och 12 skulle skrivas som siffror.
- `goraMobil` för `satt_intervjutid` utan `kalladDag` (ska inte hända, `skaSattaTiden` kräver den) ger bara "`Företaget`.".
- Ögonbrynet för en genomförd tjänst som inte är tyst säger "Intervju genomförd" också för provjobb, som i dag. Specen nämner det inte.

### Vad som saknades i kontraktet

Inget. `momentOrd` och `momentDag` täckte `M`, `m` och `D`. `UppfoljningLage.typ` och `.grans` fanns.

### Tester

- `src/components/jobb3/oversikt/__tests__/oversikt.test.ts`: `kalladDag: null` i fixturen, fixturen har `foljUppTyp` och `tystGrans`. Nya fall: `tjanstRad` för tyst genomförd intervju (text, telefonrad, `steg` med `tyst`, status, länk till `folj-upp`, inget "har inte hört") och provjobb, genomförd intervju före sju dagar som förut, `goraMobil` för `folj_upp` efter intervju och provjobb med och utan utkast, och för `satt_intervjutid`. 21 gröna.
- `src/components/paywall/__tests__/paywall-copy.render.test.tsx`: den nya brödtexten ordagrant och att "på en annan tjänst" inte står någonstans. 20 gröna.
- `npx tsc --noEmit` (efter tre minneskontroller, 4,3 GB ledigt): inga fel alls på grenen vid körningen.

### Ses i webbläsare (inte prövat), 412 x 915 och 1440

- Genomförd intervju som väntat sju dagar (testrad a): Sökta tjänster, gruppen Följ upp med underraden "Minst sju dagar utan besked. ...", raden "Intervjun var den 10 november. Fråga när du kan vänta besked.", knappen "Fråga om besked" (1440) och "Fråga om besked med ett kort mejl" (412), brickan i facket Intervju i koppar med taggen "`N` dagar". Översikt: raden med samma text, telefonraden "`Tjänsten`. Intervjun var den 10 november.", kortet i Att göra nu på telefon "Intervjun var den 10 november.". Tjänstens sida: ögonbrynet "Tyst i `N` dagar", ingressen (1440), panelen "Fråga `företaget` om besked", raden medan utkastet skrivs, raden "Till", "Vad som händer sedan" säger sju dagar och dagens datum plus sju. Efter "Ja, det är skickat": "Följde upp i dag", datumet sju dagar fram, Ångra fungerar, inget nytt utkast skrivs. Före sju dagar: ingressen "Har du inte fått besked den ... säger vi till." och inget block.
- Provjobb (c): samma som ovan med "Provjobbet", "provjobbet" och raden "Till" om provjobbet.
- Kallelse utan tid efter två dagar (b): listan under Intervju på gång, knappen "Sätt tiden", aldrig under Följ upp. Översikt-kortet på telefon "Sätt tiden för intervjun", "`Företaget`. Kallad 12 nov.". Tjänstens sida: blocket överst i panelen i båda bredderna med "Sätt tiden för intervjun" och "Du blev kallad den 12 november. ...", knapparna minst 48 px och ingen text klippt i 360; "Sätt tiden" öppnar arket för intervjutid, "Intervjun har redan varit" öppnar händelsearket på "Intervju genomförd". Före två dagar: blocket bara under 1280 px med "Ingen tid satt för intervjun", på 1440 väggens gamla ingress och länken "Sätt tiden".
- Gammalt utkast av fel sort (d): inget Följ upp-block på tjänstens sida, med och utan `?steg=folj-upp`; panelen visar blocket "Sätt tiden" och Förbered intervjun.
- Gratiskonto med använt utkast på en ansökan, tjänst (a): betalväggen med "Ditt gratis utkast är använt. Med Premium skriver vi ett utkast varje gång ...", och "Jag har redan skickat det" syns och går att trycka på.
- En obesvarad ansökan (tolv dagar) ser ut och låter som före bygget, på alla tre ytorna.
