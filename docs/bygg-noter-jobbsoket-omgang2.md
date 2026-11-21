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

## Byggare D1 (9 A, När är intervjun?)

Del 9 A ur byggspecen: frågan "När är intervjun?" i sektionen Intervjuer på gång i Inför intervjun. Inget committat. Inga anrop mot databasen, inga migreringar, inga AI-anrop.

### Vad som byggdes

- `src/components/jobb3/intervju/IntervjuFraga.tsx` (ny klientö): det öppna kortet (`TomtLage` med `IkonKalender`, `LitenKnapp` "Lägg in intervjun" och `TextLank` "Ingen intervju bokad än" i `.j3c-tomt-tva`) och raden (`Kort` med `.j3c-ihop`, ikonen i `j3-sido-ik`, "Lägg in"), båda alltid i HTML:en i `.j3c-fraga-oppen` och `.j3c-fraga-ihop`. Arket (`Ark bredd={520}`): Dag och Tid i bredd (`.j3c-tva`), Plats, gruppetiketten "Vilken tjänst gäller intervjun?", sedan valen (`ValKnapp form="rad"` med brickan, sist "En annan tjänst", inget förvalt, fem först och "Visa alla") eller Tjänst, Arbetsgivare och Datum sökt (tomt, obligatoriskt, `max` i dag, hjälptexten ur 9.4). Felraderna i 9.4 ordagrant via `fel` på `Falt` (koppar), felraden för valet under valen; fokus till första fältet med fel. Spara enligt 9.5: anrop 1 bara för ny tjänst, id:t hålls i öns läge tills arket stängs, anrop 2 med `fran: 'intervju-hubb'`; efter båda: arket stängs, `router.refresh()`, `refresh()` ur `useDashboardData()`, nyckeln och attributet bort, aktiviteten för en ny tjänst, kvittensen `p.j3-under[role=status]` med länken "Öppna tjänsten" (`tjanstHref(id, 'forbered', 'intervju-hubb')`). `tjanstfraga_val` med `oppnad` när arket öppnas och `hoppad` vid "Ingen intervju bokad än". Den rena valideringen är exporterad (`valideraIntervjuFraga`).
- `src/components/jobb3/intervju/IntervjuHubb.tsx`: sektionen ritas alltid; underraden bara när listan har rader; ön direkt under `SektionsHuvud`; skriptet ur 9.3 (`IHOP_SKRIPT`) direkt före sektionen när listan är tom; ny valfri prop `valbara`. "Dina intervjuprov" har alltid avståndet uppåt.
- `src/components/jobb3/intervju/text.ts`: `HUBB.fraga` med alla strängar ur 9.2, 9.4 och 9.5.
- `src/app/jobb3-c.css`: `.j3c-tomt-tva`, `.j3c-ihop`, `.j3c-ihop-text`, `.j3c-tva` med skissens värden, de tre reglerna för `data-intervjufraga` ur 9.3, och `.j3c-visa-alla` (44 px för "Visa alla").
- `src/lib/jobbsok/intervju.ts`: `valbaraForIntervju` och typen `ValbarForIntervju`. `src/lib/jobbsok/server.ts`: `hamtaIntervjuHubb` (en läsning, `lasAnsokningar`); `hamtaIntervjuerPaGang` orörd.
- `src/app/dashboard/intervju/page.tsx`: `hamtaIntervjuHubb` i samma `Promise.all`, `valbara` till hubben, `intervjufraga` till `InforIntervjunClient`, som skickar den på `interview_hub_viewed`.
- `src/app/api/applications/[id]/events/route.ts`: `fran === 'intervju-hubb'` ger källan `'intervju-hubb'` till `matIntervjutid`. `src/lib/jobbsok/intervjuServer.ts`: `IntervjuKalla` har `'intervju-hubb'`.
- `src/lib/jobbsok/adress.ts`: `tjanstHref(id, fokus, fran?)`.
- `src/lib/analytics/events.ts`: `interview_hub_viewed.intervjufraga?`, `intervjutid_satt.kalla` med `'intervju-hubb'`, och `tjanstfraga_val` med båda platserna (`'test-hem' | 'intervju-hubb'`), så att D2 använder samma rad.

### Egna beslut och avvikelser

1. Aktiviteten: specen säger `logActivity` ur `@/lib/activity-logger`, men den filen har bara `logUserActivity(userId, ...)`. Ön använder `logActivity` ur `useNotification()` (samma funktion utan toast, användaren läses ur kontexten), med `{ applicationId, channel: 'ad', fran: 'intervju-hubb' }` och samma beskrivning som Sökta tjänster.
2. Faller anrop 1 visas alltid "Det gick inte att spara just nu. Försök igen.", inte serverns text (som vid 500 kan vara databasens engelska meddelande).
3. Stängs arket efter att anrop 1 lyckats och anrop 2 fallit körs `router.refresh()`, så att den skapade tjänsten syns bland valen nästa gång i stället för att skapas igen.
4. `TomtLage` tar ingen klass för handlingen, så `.j3c-tomt-tva` ligger på en `div` inuti `.j3-tomt-handling`. Att handlingen inte krymper på dator sätts med `.j3-tomt-handling:has(> .j3c-tomt-tva)`. Kitet är orört.
5. Fokus efter "Ingen intervju bokad än" hittas via en `span` runt knappen (kitets knappar tar ingen ref).
6. Ön sätter eller tar bort attributet vid varje montering, också när listan har rader (ofarligt, korten ritas inte då).
7. `.j3c-visa-alla` är en klass utöver de fyra i 9.2, bara för 44 px tryckyta på "Visa alla".

### Tester

- `src/components/jobb3/intervju/__tests__/IntervjuFraga.test.tsx` (ny): 16 gröna (kortet och raden med texterna, Hoppa över med nyckel, attribut och fokus, monteringen, fältordningen utan och med valbara, "Visa alla", foten och att "räknar ner hit" inte finns, varje felrad ordagrant utan anrop, två anrop i ordning med `fran`, ett anrop för vald tjänst, anrop 2 faller och nästa tryck gör bara anrop 2, anrop 1 faller).
- `src/lib/jobbsok/__tests__/intervjulagen.test.ts`: `valbaraForIntervju`, 36 gröna.
- `src/lib/jobbsok/__tests__/motor.test.ts`: `tjanstHref('x', 'forbered', 'intervju-hubb')`, 43 gröna.
- `npx tsc --noEmit` (efter två minneskontroller under 3 GB, sedan 4,9 GB ledigt): inga fel alls på grenen vid körningen, D2:s pågående arbete inräknat.

### Ses i webbläsare (inte prövat), 412 x 915 och 1440, ljust och mörkt, konto utan intervju på gång

- Sektionen "Intervjuer på gång" ovanför "Dina intervjuprov", utan underrad, med kortet "När är intervjun?". Enda kopparknappen är väggens. 1440: knappen över länken till höger i kortet (skissens 16). 412: knappen och länken i rad under texten (skissens 11).
- "Ingen intervju bokad än" ger raden (skissens 15) och fokus på "Lägg in". Ladda om: raden direkt, kortet blinkar inte fram, inget under flyttar sig; CLS 0 i `scripts/perf-inloggat.ts` med och utan nyckeln. Klientnavigering till sidan och tillbaka: samma läge.
- Arket utan sökta tjänster (skissens 12, men Datum sökt tomt med den nya hjälptexten och foten "Vi räknar ner till intervjun ..."): Dag, Tid, Plats, gruppetiketten, Tjänst, Arbetsgivare, Datum sökt. Med sökta tjänster (skissens 14, men Dag, Tid, Plats först): valen med brickor, inget valt; "En annan tjänst" fäller ut de tre fälten. Inget tangentbord fälls upp när arket öppnas på telefon.
- Spara med tomt Datum sökt: felraden i koppar, fokus till fältet, inget i nätverksfliken.
- Spara ny tjänst: två POST i nätverksfliken, väggen räknar ner, raden med "Förbered intervjun", kvittensen under rubriken (skissens 13), "Öppna tjänsten" öppnar tjänsten på Förbered med `fran=intervju-hubb`, tjänsten under Sökta tjänster som kallad med rätt sökdatum; Kom igång-brickan avbockad utan omladdning. Vald befintlig tjänst: en POST, ingen ny rad i `job_applications`.
- 360 px: ingen text klipps i kortet, raden eller arket (Dag och Tid i bredd). Tryckytor minst 44 px ("Ingen intervju bokad än" och "Visa alla"). Esc och krysset stänger arket, fokus tillbaka till knappen som öppnade det.

## Byggare D2 (9 B, kortet på testernas Hem och Kallad till test)

Inget committat. Inga anrop mot databasen, migreringen är bara en fil och är **inte körd**. Inga AI-anrop.

### Migreringen

`supabase/migrations/20261122120000_kallad_till_test.sql`, ordagrant enligt 9.11. Den byter, i en transaktion, de två villkoren `job_application_events_event_type_check` och `job_applications_current_status_check` (drop if exists, add) mot samma listor med `'test_invited'` som tionde värde, mellan `rejected` och `interview_invited`. Ingen kolumn, funktion eller rad ändras; filen går att köra flera gånger. Backas med rollbacken överst i filen (samma två villkor utan `test_invited`), först när ingen rad har `test_invited` och koden som skriver typen är backad.

**Före migreringen** nekar villkoret varje insert med `test_invited`:
- Testvägen: `skapaSoktTjanst` gör ett försök till, loggar felet en gång ("Fel vid skapande av händelsen kallad till test") och svarar med `current_status: 'applied'`. Tjänsten sparas som sökt och kvittensen visar varianten "`Företaget` ligger nu under Sökt". Ingen trasig sida, men kryssrutan blir utan verkan.
- "Kallad till test" för hand (snabbvalen och Annat): rutten svarar 500 och arket visar "Kunde inte spara händelsen" i sin felrad. Arket står kvar.
- Allt annat (läsning, listor, kortet på Hem) fungerar likadant före och efter migreringen.

### Händelsetypen i koden (9.12)

- `src/lib/applications/status.ts`: `ApplicationEventType` (mellan `rejected` och `interview_invited`), `STATUS_META.test_invited` ("Kallad till test", samma klasser som `interview_invited`), först i `LOGGABLE_EVENT_TYPES`.
- `src/app/api/applications/[id]/events/route.ts`: `VALID_EVENT_TYPES`, på en egen rad sist i listan. Ingen omgång, ingen tid; kontrollen mot sökdagen gäller som för andra typer.
- `src/components/jobb3/sokta/SmaArk.tsx`: `VAL` får `test_invited` först med `IkonRutnat`; datumfältet heter "Dagen du blev kallad" också för typen.
- `src/components/jobb3/sokta/TjanstVy.tsx`: snabbvalen vid Sökt är "Kallad till test", "Kallad till intervju", "Fick avslag", och "Kallad till test" döljs när tjänsten redan står så. Ögonbrynet "Kallad till test", väggens ingress (dator) ordagrant ur 9.13, den väntande raden "Besked efter testet". Följ upp visas aldrig eftersom `foljUppTyp` är null (befintlig spärr, också med `?steg=folj-upp`).
- `src/lib/jobbsok/bana.ts`: `SVAR_TYPER`.
- `src/lib/jobbsok/lage.ts`: `foljUppTyp` ger null för `test_invited` före raden som ger `'ansokan'`; ny `kalladTillTestDag` och fältet `kalladTillTest` i `tjanstLage`.
- `src/lib/jobbsok/typer.ts`: `TjanstLage.kalladTillTest`, `TEST_UPPDATERA_DAGAR = 14`, `AttGoraTyp` `uppdatera_test`.
- `src/lib/jobbsok/attGora.ts`: kandidaten `uppdatera_test`, `PRIORITET` efter `satt_intervjutid`, väggen när den står först, `vaggUtanHandling` när alla vid Sökt är kallade till test.
- `src/lib/jobbsok/lista.ts`: `testRadText(t, mobil?)`, `vantarSvarText(rader)` och konstanterna `VANTAR_SVAR_TEXT`, `VANTAR_TEST_TEXT`.
- `src/components/jobb3/sokta/Lista.tsx`: egen rad i Väntar svar (text, telefonrad, brickan "Kallad till test", knappen Uppdatera), gruppens underrad ur `vantarSvarText`.
- `src/components/jobb3/sokta/text.ts`: `fyrsteg` ger steg 2.
- `src/components/jobb3/oversikt/oversikt.ts`: `tjanstRad` och `goraMobil` för `uppdatera_test`.
- `src/app/dela/sokta-tjanster/[token]/page.tsx`: `radLage` får fallet ur 9.12.
- `src/lib/dashboard/getSummary.ts`: `silent` är falskt för `test_invited`.
- Orörda enligt tabellen: `statistik.ts`, `handelser.ts`, `coach.ts`, `tystnad.ts`, `intervju.ts`, rapporten, `followUp.ts`, `weekly-digest.ts`, `useApplicationsSummary.ts`, `rum/jobbsok.ts`.

### Kortet, arket, servern och kvittensen (9.14 till 9.17)

- `src/lib/tester/v4/tjanstfraga.ts` (ny): `tjanstfraga`, `tjanstfragaNyckel`, `arHoppad`, `TJANSTFRAGA_NYCKEL`. Grinden i 9.14:s ordning, appen först.
- `src/lib/tester/v4/typer.ts`, `modell.ts`, `hamta.server.ts`: `tjanstfraga?: { harNivakoll, harSoktTjanst }` ur `nivapunkter` och `summering.sidomeny.ansokningar`, båda redan lästa i samma `Promise.all`. Ingen ny fråga mot databasen.
- `src/app/dashboard/tester/HemSida.tsx` (ny, `TesterHemSida`); `src/app/dashboard/tester/page.tsx` ritar den, `src/app/app/tester/page.tsx` ritar den med `iAppen`. `HemVy` och `HemGolv` tar `iAppen`.
- `src/components/tester-v4/hem/TjanstFraga.tsx` (ny klientö): ritar ingenting förrän `localStorage` är läst. Hopfällt och utfällt läge med texterna i 9.15, fokus till rubriken vid utfällning, fel i koppar med `aria-invalid`, Fortsätt skriver nyckeln och går till `soktaHref({ logga: 'sokt', tjanst, arbetsgivare, fran })`, Hoppa över skriver nyckeln och flyttar fokus till nästa element. Ett första datum på samma prov skriver om den sparade nyckeln.
- `src/components/tester-v4/omgang3/HemGolv.tsx`: kortet efter `<Vagen>`, före `<GratisRad>`, aldrig i grenen `ny`.
- `src/app/globals.css`: klasserna ur skissens avsnitt 4, sist i avsnittet Golvet (före "Tester: planpanelen"). `.t3-fraga-ik` i `var(--ton)` och `var(--ton-ink)`, ingen `.t3-fraga-not`. Tillägg: `.t3-fraga-text h2:focus { outline: none; }`, eftersom rubriken får fokus programmatiskt.
- `src/lib/jobbsok/adress.ts`: `soktaHref` får `tjanst` och `arbetsgivare` efter `logga`, före `manad` och `fran`.
- `src/app/dashboard/sokta-tjanster/page.tsx`: `forifylltUr` läser `fran` (högst 40 tecken); `LoggaForifyllt.fran`.
- `src/components/jobb3/sokta/LoggaArk.tsx`: testvägen (`fran` är `test-hem` eller `test-hem-plan`, inte redigering, inte från Ska sökas), i läget "Jag har sökt": Datum sökt tomt och obligatoriskt med hjälptexten och felraden ur 9.4 (samordnarens beslut 2), kryssrutan "Arbetsgivaren har kallat mig till test" med förval efter `fran` (samordnarens beslut 1), raden under knappen efter rutan. Anropet bär `fran` och, när rutan är kryssad, `kallad_till_test: true`.
- `src/lib/applications/skapa.ts`: `arKalladTillTest` och, efter `applied`, en egen insert av `test_invited` (dagens svenska datum) med ett försök till. Svaret bär `test_invited` eller `applied`. Skrivs inte om `applied` föll.
- `src/components/jobb3/sokta/SoktaVy.tsx`: läser `fran` en gång vid montering. På testvägen ingen toast, men `logActivity('application_logged', ..., { applicationId, channel, fran })` och kvittensen (`TestvagKvittens`, kitets `Notis` med `role="status"`) överst i panelen. Utanför testvägen toasten som förut, med `fran` i aktivitetens uppgifter när adressen bar en.
- `src/components/jobb3/kit/Data.tsx`: `Notis` får `handling` (under texten) och `role`.
- `src/components/jobb3/sokta/Lista.tsx`: `ListaGolv` tar `kvittens` och ritar den överst i panelen, före växeln.
- `src/lib/analytics/events.ts`: `hem_visad.tjanstfraga?` (D1 hade redan lagt in `tjanstfraga_val`). `src/components/tester-v4/hem/HemMatning.tsx`: `HemVisad` tar `tjanstfragaNyckel` och räknar `tjanstfraga` i sin effekt; utelämnad nyckel ger ingen egenskap, så att de gamla testerna står.

### Egna beslut och avvikelser

1. Datum sökt på testvägen är tomt och obligatoriskt (samordnarens beslut 2) i stället för 9.16:s förifyllda datum och hjälprad. Text och fel som i 9.4.
2. Motorns tester ligger i en ny fil, `src/lib/jobbsok/__tests__/kalladTillTest.test.ts`, inte i `intervjulagen.test.ts` och `motor.test.ts` som D1 ändrar samtidigt. Samma fall som 9.19 räknar upp, plus `soktaHref`.
3. `testRadText(t, mobil = false)`: telefonens rad ("Kallad till test `d`") ur samma funktion med en flagga.
4. `kalladTillTest` faller tillbaka på dagen i `status_updated_at` när tjänsten läses utan händelser (`sattIhopHistorik(..., [])` i två laddare). Annars null.
5. `TestvagKvittens`, `testvagKvittensText` och `TILLBAKA_TILL_TESTERNA` är exporterade ur `SoktaVy.tsx` för testet.
6. Felraderna i kortet står utanför `<label>`, kopplade med `aria-describedby`, så att fältens namn bara är "Tjänst" och "Arbetsgivare" (skissen hade raden inne i etiketten).
7. Vid fel i båda fälten får det första fältet fokus. Specen säger bara att fältet markeras.

### Ses i webbläsare (inte prövat), per läge i 9.18

Kräver att migreringen är körd. Konto: gratis, en slutförd Nivåkoll, dagens grundnivåtest kvar, ingen sökt tjänst.
- Hopfällt, 412 x 915 och 1440, ljust och mörkt i 412: kortet under Vägen till provet, före Nederst; "Starta dagens test" sidans enda kopparknapp; ikonen i rummets ton (indigo i ljust), inte grönt. Kortet ska ligga nedanför första skärmen i båda bredderna. Mät Hem med `scripts/perf-inloggat.ts` med kortet synligt: CLS 0, LCP inom budgeten. Visar mätningen ett skifte gäller lösningen i 9.3.
- Utan plan: "Vilken tjänst övar du inför?"; passerat provdatum: "Vilken tjänst gällde provet?".
- Inget kort: före första Nivåkollen, med påbörjad Nivåkoll utan nivå, med Gratisraden på sidan, med lås på väggens knapp, med en sökt tjänst, efter Hoppa över (också efter omladdning), och aldrig på `/app/tester`.
- Utfällt (412 ljust och mörkt, 1440): "Lägg in tjänsten" fäller ut två fält, inget tangentbord fälls upp på telefonen, fälten 52 px, Fortsätt mörk. 1440: fälten i bredd med Fortsätt och Avbryt.
- Felläge (412 ljust och mörkt): Fortsätt med tom tjänst ger felraden i koppar och kopparkant, aldrig rött.
- Byt prov i planen: kortet tillbaka. Lägg in ett första datum på samma prov: inte tillbaka.
- Vägen: Fortsätt öppnar `/dashboard/sokta-tjanster?logga=1&tjanst=Ekonomiassistent&arbetsgivare=Norrmejerier&fran=test-hem-plan` med arket öppet, fälten ifyllda, Datum sökt tomt med hjälptexten, kryssrutan ikryssad (tom med `fran=test-hem`). Logga utan datum: felraden. Med datum och ruta: kvittensen "Norrmejerier står nu som kallad till test" överst i panelen, tjänsten under Väntar svar med brickan "Kallad till test", aldrig under Följ upp (också med ett sökdatum 30 dagar bakåt). "Tillbaka till testerna" går till Hem, där kortet är borta.
- Tjänstens sida: ögonbrynet "Kallad till test", banan på Svar, inget Följ upp-block, inte heller med `?steg=folj-upp`; ingressen på 1440.
- "Kallad till test" för hand på en befintlig tjänst, från snabbvalen och från Annat. Delningssidan visar "Kallad till test"; rapporten listar tjänsten bland sökta jobb.
- Översikt dag 14 efter kallelsen: kortet "Vad hände efter testet hos ...?" (telefon "Vad hände efter testet?").

### Vitest

- `src/lib/tester/v4/__tests__/tjanstfraga.test.ts` (ny): 18 gröna.
- `src/components/tester-v4/hem/__tests__/HemVy.test.tsx`: 36 gröna (14 nya).
- `src/app/app/tester/__tests__/page.test.tsx` (ny): 1 grön.
- `src/lib/applications/__tests__/skapa.test.ts` (ny): 6 gröna.
- `src/components/jobb3/sokta/__tests__/testvag.test.tsx` (ny): 11 gröna.
- `src/lib/jobbsok/__tests__/kalladTillTest.test.ts` (ny): 17 gröna.
- `src/lib/notifications/__tests__/followUp.test.ts`: 20 gröna (2 nya). `src/lib/email/lifecycle/__tests__/weekly-digest.test.ts`: 15 gröna (1 nytt). `src/components/jobb3/oversikt/__tests__/oversikt.test.ts`: 23 gröna (2 nya).
- Körda utan ändring: `HemMatning.test.tsx` 7, `motor.test.ts` 43, `intervjulagen.test.ts` 36, alla gröna.
- `npx tsc --noEmit` (6,2 GB ledigt): inga fel på grenen.

## Samordnarens noter

- **Datum.** Hela omgång 2 byggdes 2026-11-21 (kväll). Några commit-meddelanden på grenen och migreringens filnamn (`20261122120000_kallad_till_test.sql`) säger 22 november. Det är fel dag, skrivet av samordnaren av misstag. Migreringen kördes i produktion 2026-11-21 cirka 23.00 svensk tid, med ägarens ja. Filnamnet ändras inte, eftersom det bara styr ordningen.
- **Slutkontrollen avbröts 2026-11-21 cirka 23.05.** Produktionens Supabase-gateway slutade svara 22.35. Loggen visade att två sessioner samtidigt körde testflöden genom lokala servrar mot produktionsdatabasen; den här sessionens klicktest gjorde en Nivåkoll för att få fram kortet på testernas Hem och stod för 915 läsningar av `profiles` på tio minuter. Server och webbläsare stängdes direkt. Regeln framåt står i minnet: inga provflöden i klicktest mot produktion.
- **Det slutkontrollen hann med:** hela testsviten (360 filer gröna, 3 överhoppade; 4 589 test gröna, 13 överhoppade), bygget med webpack (första försöket föll på minnet, det andra gick igenom), kortet på testernas Hem i 412 och 1440, ljust och mörkt, i hopfällt, utfällt och felläge, och brickan i Kom igång på plats två för ett konto utan val. Bilderna ligger utanför git.
- **Inte prövat i webbläsare:** arket på testvägen och kvittensen, statusen Kallad till test i listan och på tjänstens sida, "När är intervjun?", intervjulägena med det nya utkastet (aldrig kört mot modellen), annonsens fot på telefon, träffantalet efter sökning och omladdning, och prestandan med CLS på testernas Hem och i hubben.

## Efter klicktestet (2026-11-21 natt)

Klicktestet (`docs/qa/jobbsoket-omgang2-2026-11-21.md`) hittade tre fel. Rättade samma natt, inte committade.

### Fel 1: listan tom efter sparandet på testvägen

- **Orsak.** Arket anropar `onKlar` och direkt efter `onClose`. `loggad` i `SoktaVy.tsx` begärde `router.refresh()`, och `stangLogga` rensade sedan `?logga=1&tjanst=…` med `window.history.replaceState`. Next 16 lappar `replaceState` så att anropet blir en `ACTION_RESTORE` i routerns kö, och en restore markerar den pågående åtgärden som kastad (`app-router-instance.js`, `dispatchAction`). Uppdateringen hämtades men lades aldrig in, så listan, väggen och räknarna stod kvar på det gamla. Sidomenyn läses ur `DashboardDataContext` med en egen hämtning och påverkades inte. Det gällde varje loggning som började med `?logga=1` i adressen, inte bara testvägen; loggning från knappen har ingen `logga` i adressen och rensar aldrig, därför fungerade den. Kvittensens läge hindrade inte omritningen.
- **Rättning.** `rensaAdress()` i `SoktaVy.tsx` rensar adressen och anropas i `loggad` före `router.refresh()`. Den läser `window.location.search` i stället för `adress`, så när arket sedan stänger sig och `stangLogga` anropar den igen gör den ingenting, och ingen ny restore kastar uppdateringen.
- **Test.** `src/components/jobb3/sokta/__tests__/testvag-uppdatering.test.tsx` (ny, 2 gröna): på testvägen rensas adressen en gång, före uppdateringen, uppdateringen och summeringen begärs, och kvittensen står kvar. Utan `logga` i adressen rörs den inte. Testet föll mot den gamla ordningen.

### Fel 2: valet av tjänst i "När är intervjun?" klipptes

- **Orsak.** `ValRad` lägger valen i en flexrad med `flex: 1`, och `ValKnapp form="rad"` klipper texten på en rad (`white-space: nowrap`, ellips). Med en tjänst och "En annan tjänst" blev det två kolumner, och "Företaget, tjänsten" klipptes före titeln.
- **Rättning.** `IntervjuFraga.tsx`: valen ligger i `div.j3c-tjanstval`, och varje val visar titeln (`j3c-tjanstval-titel`) som huvudtext och arbetsgivaren (`j3c-tjanstval-ag`) under, med ett dolt kommatecken så att skärmläsaren läser "Ekonomiassistent, Umeå Energi". `jobb3-c.css`: valen står i en kolumn i full bredd, minst 56 px höga, texten bryts och klipps först efter två rader per del. Vald rad har kitets valda läge (`.j3-val.rad[aria-pressed="true"]`). Kitet är orört.
- **Test.** `IntervjuFraga.test.tsx`: titeln och arbetsgivaren läses ur varje val, och valen ligger i `.j3c-tjanstval`. 16 gröna.

### Fel 3: annonsens fot på telefon låg inte fast

- **Orsak.** `FastFot` låg i en egen `div.mt-6` i `MatchadeJobb.tsx`. `position: sticky` fäster inom sin förälder, och föräldern var exakt lika hög som foten, så foten kunde aldrig flytta sig. Så har det varit sedan omgång 1.
- **Rättning.** Foten ligger direkt i golvets inre ram (`j3-golv-inre`), som rymmer hela annonsen, med en tom `h-6` före i stället för marginalen. Foten tar sin egen höjd i flödet, så vid annonsens slut står den efter sista raden och täcker inget. Dold träff, betalväggen och listan har ingen `FastFot` och är oförändrade. Från 1280 px döljer `.j3-fot` sig som förut.
- **Test.** `annonsFot.test.tsx` oförändrad, 9 gröna. Sticky går inte att pröva i jsdom; se webbläsarprovet i QA-filen.

`npx tsc --noEmit`: inga fel. `testvag.test.tsx`: 11 gröna.
