# Jobbsöket omgång 1: beslut efter slutkontrollen, 2026-11-21

Ägaren 2026-11-21: besluten nedan fattas av saas-lead, SEO och UX tillsammans. Saas-lead fäller avgörandet där de inte är överens. Ägaren får rapporten.

Det som fortfarande bara ägaren avgör: nya priser, push till main, utskick av mejl, och texter om samtycke, datalagring, GDPR och villkor. Gruppen får föreslå i de frågorna men inte ändra.

## Underlag som gäller alla frågor

**Utgångsläget, mätt i produktionsdatabasen 2026-11-21 (ägar- och testkonton borträknade):**
- 109 nya konton de senaste 28 dagarna.
- 1 sökt tjänst loggad av ett riktigt konto, någonsin (10 augusti). Övriga 25 rader är testdata.
- 0 rader under Ska sökas, 0 uppföljningar, 0 sammanfattningar av matchningen från riktiga konton (funktionerna gick live i dag).
- 1 riktigt konto har kört jobbmatchningen de senaste 28 dagarna (2 sökningar). 21 konton har en körning sparad sedan tidigare.
- 3 synliga profiler i Bli upptäckt.

Slutsatsen av talen är min (Fable, sessionens samordnare): Jobbsöket är i praktiken oanvänt. Det som avgör omgångens värde är om någon hittar dit, inte om detaljerna är putsade.

**Läget i koden:** rättningarna av de kända felen ligger på grenen `fix/jobbsoket-slutkontroll` och är inte pushade. De publika sidorna rörs inte i den här omgången. Kartläggningen av dem (59 ställen) står i `docs/publika-sidor-jobbsoket-2026-11-21.md`.

**Black Week** går 23 till 29 november (99 kr första månaden), Cyber Monday 30 november (49 kr). Ägaren 2026-11-21: inget ska vänta på kampanjen, allt görs nu.

## Frågorna

Varje fråga har fakta och samordnarens rekommendation. Gruppen svarar per fråga.

### 1. Bli upptäckt och testresultaten
Skissen för Jobbsöket sa att testpoäng aldrig visas. Samtyckestexten säger "Verifierade testresultat med percentiler" (`src/app/dashboard/bli-upptackt/components/delas.ts:10`). Saas-lead beslutade 2026-11-15 att rekryterare aldrig ser andel rätt: placering ("topp X %") vid minst 25 testade, annars bara nivån. Kandidatens egen vy visar "X % rätt" när placering saknas (`VerifiedResultsCard.tsx:80`).
**Rekommendation:** samtyckestexten gäller och ändras inte. Regeln är "aldrig andel rätt utåt, placering ja", och skissens formulering betydde detsamma. Ingen åtgärd i koden.

### 2. Gratisnivån i matchningen är inte tät på servern
Sidans HTML och `/api/jobbmatchning/annons` håller gränsen på tre. Men `/api/jobbmatchning/pool` lämnar de 120 bästa annonserna till alla inloggade (för filter, "längre bort" och ändrad sökprofil), och edge-funktionen `match-jobs` svarar med hela körningen vid en ny sökning. Suddningen görs sedan i webbläsaren. Annonserna är Platsbankens och fritt tillgängliga; det som läcker är vår rangordning, och bara till den som läser nätverkstrafiken. Att täta på riktigt kräver att filter, rangordning och suddning flyttas till servern, vilket är ett eget bygge.
**Rekommendation:** täta inte nu. Gör det när matchningen ändå byggs om för nattkörningen (våg 2 i `docs/plan-jobbmatchning.md`). Med ett riktigt konto som matchat på 28 dagar skyddar spärren ingen intäkt i dag.

### 3. Black Week-priset på betalväggen för uppföljningsmejlet
Väggen använder samma `PaywallCard`, samma köpknapp och samma kampanjlogik som övriga väggar. Den är aldrig sedd under kampanj. Det går att se den nu på en lokal server med flyttad klocka.
**Rekommendation:** kampanjpriset ska synas där som på alla andra väggar. Kontrolleras i den lokala slutkörningen i både Black Week- och Cyber Monday-läge, tillsammans med väggen i Matchade jobb.

### 4. Prissidan och listorna över vad som ingår
Nytt gratis: Ska sökas, veckans mål, första uppföljningsutkastet. Nytt i Premium: fler uppföljningsutkast (30 per dygn). Redan Premium men inte utskrivet: rapportens utskrift, kopiering och radlistor. Premiumlistan (`HELA_PAKETET_RADER`) har fem rader, gratislistan slutar med "Tre matchade jobb och tio meddelanden till Jobbcoachen". Se punkt 2.1 till 2.8 i kartläggningen.
**Rekommendation:** en rad till i Premiumlistan för jobbsöket (uppföljningsmejlen och rapporten i samma rad) och en rad i gratislistan (Sökta tjänster med Ska sökas och veckans mål). Ordalydelsen skrivs i den publika omgången. Priset rörs inte.

### 5. Skärmbilden `public/Skärmbild 2025-09-26 220531.jpg`
En gammal bild av dashboarden med ett riktigt kontonamn. Nås publikt, används ingenstans.
**Rekommendation:** ta bort den nu, på grenen.

### 6. Kampanjmejlet "Ny funktion: Sökta tjänster"
`src/lib/email/campaign-sokta-tjanster.ts`. Lovar flödesdiagram, utskrift och "Helt gratis, för alla konton". Flödesdiagrammet finns inte längre, och utskriften är Premium.
**Rekommendation:** pensionera mejlet som det är. Ett nytt mejl om Jobbsöket är värt att skicka, eftersom funktionen är oanvänd, men först när de publika sidorna stämmer och efter Black Week-mejlen (23 och 30 november). Utskicket är ägarens.

### 7. "Matchningen körs när du öppnar sidan"
Står på sju publika ställen, ett av dem i FAQPage-schemat på `/funktioner`. Sidan visar senaste körningen och söker om först på knappen. Den nattliga matchningen är inte igång (våg 2, inte beslutad). Annonserna hämtas tre gånger per dygn (kontrollerat: jobbet körs i den nya databasen, senast 2026-11-21 14.00).
**Rekommendation:** ändra texten, inte beteendet. En sökning vid varje sidöppning belastar databasen (körningen är 3,3 MB och ger redan tidsgränsfel) för en sida som nästan ingen öppnar.

### 8. `/funktioner` lägger jobbmatchningen under "Bara i Jobbcoach Premium"
Tre träffar och tio meddelanden till Jobbcoachen är gratis. Kortet i samma block säger "Gratis: tre träffar".
**Rekommendation:** rätta rubriken i den publika omgången. Hur blocket ska sälja är UX och säljs fråga.

### 9. Tolv dagar eller en vecka
Produkten föreslår uppföljning efter tolv dagars tystnad, även efter en genomförd intervju. `soka-jobb-via-mail.mdx` säger "efter ungefär en vecka" om en skickad ansökan. `uppfoljning-efter-intervju.mdx` säger en vecka eller 5 till 7 arbetsdagar efter en intervju. `personligt-brev-spontanansokan.mdx` säger en till två veckor.
**Rekommendation:** produkten behåller tolv dagar för en skickad ansökan, och artikeln om mejlansökan skrivs om till "en till två veckor". Efter en genomförd intervju är tolv dagar för länge mot vårt eget råd: gruppen bör avgöra om produkten ska påminna efter sju dagar i det läget.

### 10. Testdatan på QA-kontona
Två konton (ett gratis, ett Premium) med sökta tjänster, Ska sökas-rader, utkast och intervjuprov från bygget, plus det som klicktestet skapar i dag. Kontona ska ligga kvar.
**Rekommendation:** låt datan ligga tills rättningarna är pushade och omprövade i produktion. Städa sedan per id, och behåll en liten grunduppsättning för nästa omgång.

### 11. Avläsning
Ingen är bokad. Utgångsläget står överst.
**Rekommendation:** 5 december och 19 december (samma dagar som testflödets avläsningar). Mått: andel nya konton som loggar en sökt tjänst, rader sparade under Ska sökas, öppnade utkast, loggade uppföljningar, visningar och köp från betalväggen `uppfoljning`, konton som kör matchningen.

### 12. Delningssidan: vad mottagaren ser
Den publika delningssidan är omritad till samma tratt som Statistik. Tre saker blev annorlunda: (a) tratten visar antal tysta, bokade och genomförda intervjuer, som mottagaren inte såg förut, (b) brickorna har inga företagsbokstäver, inte ens när ägaren delar listan, (c) datumen i listan saknar årtal ("6 nov"), som i rummet.
**Rekommendation:** (a) behåll, det är samma bild som ägaren ser, (b) behåll, (c) skriv ut året på delningssidan, eftersom mottagaren ofta är en handläggare som läser den som underlag.

### 13. "12 rekryterare har sett din profil"
Talet på Översikt och på Bli upptäckt räknar visningar, avdubblade per rekryterare och dygn. Samma rekryterare tre dagar blir tre. Unika rekryterare går inte att räkna utan att hämta raderna eller lägga till en funktion i databasen.
**Rekommendation:** skriv "Din profil har visats 12 gånger" på båda ställena tills talet kan räknas rätt. Med 3 synliga profiler är det inte värt en migrering.

### 14. Notisen och veckobrevet säger inget om intervjulägena
Efter rättningen räknar notisen och veckobrevet tystnad som rummet, men bara för tjänster utan svar. Rummet visar också en kallelse utan tid och en genomförd intervju under "Följ upp". Texten "har inte hört av sig" passar inte en kallelse.
**Rekommendation:** låt det vara i den här omgången.

### 15. Startsidan säger att Jobbcoachen känner till dina matchningar och testresultat
Chatten får målroll, stad och bransch ur profilen och de dokument användaren själv bifogar. Samma sorts fråga som 7: ändra texten eller bygga det texten lovar.
**Rekommendation:** ändra texten i den publika omgången. Att ge Jobbcoachen läget i de sökta tjänsterna är en rimlig nästa funktion, men den hör inte hit.

### 16. Ordningen på det som återstår
De publika sidorna ska rättas i en egen omgång efter den här. Kartläggningen har 59 ställen.
**Rekommendation:** gruppen anger vilka fem till tio ställen som ska rättas först, med tanke på att funktionen är oanvänd och att Black Week börjar 23 november.

## Besked från SEO

Search Console, 90 dagar (21 augusti till 19 november), klick / visningar / snittposition:
`/artiklar/soka-jobb-via-mail` 21 / 2351 / 8,2. Startsidan 42 / 1457 / 27,2. `/artiklar/uppfoljning-efter-intervju` 7 / 1252 / 9,5. `/artiklar/ai-jobbmatchning` 4 / 1212 / 8,8 (800 visningar på "jobbmatch ai", position 6,2). `/verktyg/jobbmatchning` 15 / 962 / 12,7. `/funktioner` 0 / 262 / 60,5. `/artiklar/vad-ar-en-jobbcoach` 0 / 190 / 20. `/priser` 1 / 183. Sökningar på "aktivitetsrapport", "ansökningar", "sökta jobb" och "uppfölj" ger noll visningar på hela sajten.

- **1, 2, 3, 6, 10, 13, 14:** ingen SEO-fråga. **12:** ingen SEO-fråga så länge sidan har noindex.
- **4:** håller med. Raderna ska ha sökbara ord ("uppföljningsmejl", "rapport till Arbetsförmedlingen"), och FAQ-svaret på `/priser` (2.4) rättas samtidigt så att schemat och listan säger samma sak.
- **5:** håller med. Adressen ska ge 404 eller 410, ingen omdirigering. Ligger bilden i Search Console begärs borttagning där (ägarens konto).
- **7:** håller med, texten ändras. Schemat motsäger inte sin sida, så det ger inget straff, men påståendet är maskinläsbart och citeras av AI-svar. Alla sju ställen rättas i samma push, annars säger sajten emot sig själv. Förslag som håller också när nattkörningen kommer: "Annonserna hämtas tre gånger per dygn. Du söker om med ett tryck när du vill se de senaste."
- **8:** håller med. Konverteringsfråga, sidan har ingen söktrafik.
- **9:** håller med för skickad ansökan, men **produkten bör ändras efter intervju, inte artikeln**: sju dagar efter en genomförd intervju, tolv dagar för en skickad ansökan. `uppfoljning-efter-intervju` har rådet på sex ställen, två av dem i strukturerad data, och det är branschens vanliga råd. `soka-jobb-via-mail` kan riskfritt ändras till "en till två veckor" (rad 21, 160, 162). Uppföljningsmejlet nämns i artiklarna med en mening och en länk i ett befintligt stycke, inte i FAQ eller HowTo.
- **11:** håller med. Lägg till visningar och position för `/verktyg/jobbmatchning` och `/artiklar/ai-jobbmatchning`, före och fyra veckor efter.
- **15:** håller med. Startsidan har flest klick av de berörda sidorna och är där Black Week-trafiken landar.
- **16:** ordna efter sökexponering, strukturerad data först. Före Black Week: (1) 1.9, 1.21, 3.4 på `/verktyg/jobbmatchning` (FAQPage och HowTo-steget om aktivering), (2) 1.8, 1.7, 1.20 på samma sida, (3) 1.22 och 1.10 i `ai-jobbmatchning`, (4) 1.4, (5) 1.15 och 1.6 på startsidan, (6) 1.5, (7) 1.11 och 1.12, (8) 1.13, (9) 1.25 när fråga 9 är avgjord. Resten kan vänta. Titlar, H2 och slugs rörs inte, `dateModified` uppdateras, SEO-diffen är grind.
- **Det samordnaren missat:** Sökta tjänster har ingen publik sida. En sida om aktivitetsrapporten till Arbetsförmedlingen och att hålla ordning på ansökningar är det största som saknas för "fler användare".

## Besked från UX

Byggt på kodläsning, inget sett som bild.

**Var vägen in i Jobbsöket tappas:**
1. Registreringens fem val landar i var sitt verktyg, aldrig på Översikt eller i Sökta tjänster (`src/components/registrering/intent.ts`).
2. Kom igång har ingen bricka för en sökt tjänst eller en sparad annons (`src/lib/onboarding/komigang.ts`). Spåret slutar när matchningen är körd.
3. Översikt i nolläget: utan CV är allt ställt på "Ladda upp ditt CV" och "Har du redan sökt jobb?" ligger under tre stegkort. Med CV men utan rader säger Att göra nu "Sök tre tjänster till" och knappen går till Matchade jobb. Glasknappen "Logga sökt tjänst" i väggen är dold under 1280 px (`jobb3.css:158`).
4. På telefon är Spara till Ska sökas och Markera som sökt ikonknappar utan text (`AnnonsFotMobil` i `jobb3/jobb/AnnonsVy.tsx`).

**Tre ändringar, i den ordning UX tror ger flest första rader:**
- **A. Fråga efter tjänsten i testerna och inför intervjun** ("Vilken tjänst gäller provet?", "När är intervjun?"), frivilligt och aldrig före Nivåkollen. Kräver skiss, och en ny händelsetyp "kallad till test" vore en migrering.
- **B. En bricka i Kom igång för första raden**, kvitterad när en rad skapas i `job_applications` eller `job_saved_ads`. Liten ändring. Titelförslag: "Logga en tjänst du har sökt".
- **C. Rätta nolläget och ge handlingarna text på telefon.** "Har du redan sökt ett jobb? Logga det" i väggen i nolläget, "Sök din första tjänst" med två vägar i stället för "Sök tre tjänster till", knappar med text i annonsens fot på telefon, och en rad i CV-rummet efter nedladdning. Små ändringar som ska ses i 412.

**Per fråga:**
- **1, 3, 4, 6, 7, 8, 13, 15:** håller med. **2, 5, 10:** ingen UX-fråga.
- **3:** se väggen i 412 också, kampanjpriset får inte tränga undan "Jag har redan skickat det".
- **6:** det nya mejlet bör ha en enda handling: "Logga den tjänst du sökte senast" med länk till arket.
- **9:** tolv dagar för en skickad ansökan. Sju dagar efter en genomförd intervju, **men bara tillsammans med egen text och eget utkast för det läget**. I dag säger både väggen och utkastet "Du sökte ... och har inte hört något", också efter en intervju. Större nästa steg: fältet "Sa de när du får besked?" när intervjun loggas som genomförd (kräver troligen en kolumn).
- **11:** håller med. Två mått till: hur många nya konton som öppnar Översikt eller Sökta tjänster, och varifrån första raden skapades. Den 5 december läses som antal, inte andelar.
- **12:** håller med på alla tre. Tillägg: rutan där länken skapas ska säga vad mottagaren ser, och sidan ska visa dagen läget gäller ("Läget den 21 november 2026").
- **13:** "Din profil har visats 12 gånger", "en gång" vid ett.
- **14:** notisen och veckobrevet kan vänta, **men rummet har samma fel**: en kallelse utan tid blir "Följ upp X, har inte hört något" med utkastet för en obesvarad ansökan, till en arbetsgivare som redan kallat. Rätta de två intervjulägena i rummet tillsammans med fråga 9.
- **16:** först (1) 2.2 och 2.14, gratislistan och registreringens val, (2) 1.20, 1.21, 3.3, 3.4, (3) 1.5 och 1.7, (4) 1.6 och 1.4, (5) 1.15, (6) 1.13, (7) 2.1 och 2.3, (8) 1.14, (9) 2.9 till 2.11, (10) 1.16. Telefonskärmarna: `SkarmBana` står kvar (rita inte om hjälten under Black Week), `SkarmMatchning` ritas om först, `SkarmAktivera` rättas nu som text i samma ram, `SkarmCoach` får en textändring.

**Det samordnaren missat:**
- Delningslänken med lista är öppen för gratiskonton och ger samma rader som rapportens låsta radlistor: en väg runt betalväggen. Ska listan i länken vara Premium?
- `SkarmCoach` skriver ut ett lönespann (48 000 till 56 000 kr) på sju publika ytor, mot regeln att lön aldrig skrivs ut.

## Tillägg från samordnaren efter beskeden

- Registreringens val bland de 109 nya kontona (`profiles.onboarding_intent`): 93 utan val, 9 CV, 4 jobb, 2 tester, 1 brev. De flesta nya konton har alltså inget val sparat, så var de landar efter registreringen styrs inte av valet.
- Annonshämtningen är kontrollerad: jobbet körs tre gånger per dygn i produktionsdatabasen.
- UX:s ändringar B och C och intervjulägenas egna texter (fråga 9 och 14) är inte byggda. A kräver skiss.

## Beslut

Fattade av saas-lead 2026-11-21, efter beskeden från SEO och UX och egen kontroll i koden på grenen `fix/jobbsoket-slutkontroll`.

Märkningen på varje beslut: **görs nu i den här sessionen**, **går till den publika omgången**, **kräver skiss**, **kräver ägarens ja**, **ingen åtgärd**. Jag har lagt till en sjätte, **egen omgång (Jobbsöket omgång 2)**, för kod som är beslutad men inte ryms i dag. Omgång 2 startar direkt efter dagens push och går parallellt med den publika omgången, eftersom de rör olika filer.

### 1. Vad omgången visade

Jobbsöket är byggt men ingen kommer dit. Av 109 nya konton på 28 dagar har inget loggat en sökt tjänst; den enda riktiga raden någonsin är från 10 augusti. Jag läste av var de inloggade faktiskt är (PostHog, 28 dagar, ägar- och testkonton borträknade): 70 personer i testerna med 856 sidvisningar, 31 på Översikt med 51, 6 i Matchade jobb och 2 i Sökta tjänster. Användarna är alltså i testerna, och Översikt, sidan där Jobbsöket börjar, har färre än hälften så många besökare. Det styr besluten nedan på fyra sätt. Dagens rättningar ska ut i dag, små och kontrollerade. De publika sidorna ska säga sant innan Black Week börjar måndag 23 november, eftersom det är dit trafiken kommer. Nästa bygge i Jobbsöket är vägar in, inte funktioner, och den viktigaste vägen går genom testerna. Och det finns en stoppregel: har färre än 5 konton loggat en första rad den 19 december byggs inget mer i Jobbsöket utöver rättningar förrän ny data finns, och tiden går till testerna.

### 2. Beslut per fråga

**1. Bli upptäckt och testresultaten.** Samtyckestexten gäller och rörs inte, regeln är "aldrig andel rätt utåt, placering ja". Skäl: skissen och beslutet 2026-11-15 säger samma sak, och kandidatens egen vy får visa det egna resultatet. Nästa steg: inget. **Ingen åtgärd.**

**2. Gratisnivån i matchningen är inte tät på servern.** Tätas inte nu, utan när matchningen byggs om för nattkörningen. Skäl: det som läcker är vår rangordning av fritt tillgängliga annonser, bara till den som läser nätverkstrafiken, och 6 personer har öppnat Matchade jobb på 28 dagar; ett eget serverbygge skyddar ingen intäkt i dag. Omprövas tidigare om betalväggen `jobbtraffar` visas för fler än 30 konton under en 28-dagarsperiod. **Ingen åtgärd.**

**3. Black Week-priset på betalväggarna i Jobbsöket.** Kampanjpriset ska synas på väggen för uppföljningsmejlet, i Matchade jobb och i rapporten, precis som på övriga väggar, och det kontrolleras i dag i båda kampanjlägena och i båda bredderna. UX:s tillägg gäller: priset får inte tränga undan "Jag har redan skickat det" i telefon. Nästa steg: punkt 8 i listan nedan; ett fel som hittas rättas i dag. **Görs nu i den här sessionen.**

**4. Prissidan och listorna över vad som ingår.** En rad till i Premiumlistan och en i gratislistan, och FAQ-svaret och jämförelsetabellen på `/priser` rättas i samma push så att listan, tabellen och schemat säger samma sak (SEO:s krav). Priset rörs inte. Fakta som raderna ska bära: i Premium uppföljningsmejl till varje sökt tjänst och månadsrapporten till Arbetsförmedlingen att skriva ut eller kopiera; gratis Sökta tjänster med Ska sökas, veckans mål och det första uppföljningsmejlet. Orden "uppföljningsmejl" och "rapport till Arbetsförmedlingen" ska stå med. Vi skriver aldrig att rapporten skickas till Arbetsförmedlingen, användaren lämnar in den själv. Nästa steg: copywritern skriver raderna, en byggagent lägger in dem (kartläggningens 2.1 till 2.4 och 2.14). **Går till den publika omgången.**

**5. Skärmbilden i `public/`.** Tas bort i dag. Skäl: en bild med ett riktigt kontonamn ligger öppet på nätet. Adressen ska ge 404, ingen omdirigering (SEO). Nästa steg: punkt 1 nedan; ägaren begär borttagning i Search Console efter driftsättningen. **Görs nu i den här sessionen.**

**6. Kampanjmejlet "Ny funktion: Sökta tjänster".** Pensioneras, och inte bara i ord: adminrutten kan i dag skicka det gamla mejlet till alla som inte fått det, med påståenden som inte längre är sanna ("Helt gratis, för alla konton", flödesdiagrammet). Rutten stängs i dag. Ett nytt mejl skrivs nu, med en enda handling enligt UX: "Logga den tjänst du sökte senast". Här går jag delvis emot "inget väntar på kampanjen": texten och testutskicket är klara senast 24 november, men jag föreslår utskick onsdag 2 december, eftersom mejlen 23 och 30 november bär intäkten och ett tredje mejl emellan sänker öppningarna på dem. Ägaren väljer dag. **Görs nu i den här sessionen** (stängningen), **kräver ägarens ja** (det nya utskicket).

**7. "Matchningen körs när du öppnar sidan".** Texten ändras, beteendet står kvar. Skäl: en sökning vid varje sidöppning lastar databasen för en sida som sex personer öppnat. Alla sju ställen ändras i samma push, annars säger sajten emot sig själv (SEO). Fakta att skriva utifrån: annonserna hämtas tre gånger per dygn, och användaren söker om med ett tryck. Formuleringen ska hålla också den dag nattkörningen kommer. **Går till den publika omgången.**

**8. `/funktioner` lägger jobbmatchningen under "Bara i Jobbcoach Premium".** Rubriken rättas så att den är sann: blocket handlar om det som blir mer med Premium, och varje kort säger vad som är gratis och vad Premium lägger till. Ingen omritning, bara text. **Går till den publika omgången.**

**9. Tolv dagar eller en vecka.** Tolv dagar gäller för en skickad ansökan. Efter en genomförd intervju ska produkten påminna efter sju dagar, och där gäller SEO:s och UX:s linje: produkten ändras, inte artikeln, och bara tillsammans med egen text och eget utkast för läget. Det bygget rör utkastets AI-instruktion, mallen, väggen, notisen och veckobrevet och ryms inte i dag; inget riktigt konto står i läget. I dag görs i stället en spärr (se 14). Artikeln `soka-jobb-via-mail` ändras till "en till två veckor" och får en mening med länk till uppföljningsmejlet. `uppfoljning-efter-intervju` rörs inte förrän omgång 2 är live, eftersom produkten i dag inte skriver något utkast för det läget. UX:s fält "Sa de när du får besked?" väntar: det kräver skiss och en kolumn. **Egen omgång (Jobbsöket omgång 2)** för sju dagar med egen text och eget utkast, **går till den publika omgången** för artikeln.

**10. Testdatan på QA-kontona.** Ligger kvar tills rättningarna är pushade och omprövade i produktion. Sedan städar samordnaren per id, räknar före radering och behåller en liten grunduppsättning. **Ingen åtgärd** i dag.

**11. Avläsning.** 5 december och 19 december, med SEO:s och UX:s tillägg. Se avsnitt 5. **Görs nu i den här sessionen** för den lilla märkningen av länkarna (punkt 6 nedan), resten är avläsning.

**12. Delningssidan.** (a) Tratten med tysta, bokade och genomförda intervjuer står kvar. (b) Brickorna i tratten är utan bokstäver. (c) Året skrivs ut på delningssidan. UX:s två tillägg gäller: sidan säger vilken dag läget gäller, och rutan där länken skapas säger vad mottagaren ser. Skäl: mottagaren är ofta en handläggare som läser sidan som underlag. **Görs nu i den här sessionen.**

**13. "12 rekryterare har sett din profil".** Skrivs om till visningar på alla ställen, "en gång" vid ett. Skäl: talet räknar visningar per rekryterare och dygn, inte unika rekryterare, och med tre synliga profiler är en migrering inte värd det. **Görs nu i den här sessionen.**

**14. Intervjulägena i rummet, notisen och veckobrevet.** Här går jag emot samordnarens "låt det vara" och med UX: rummet säger i dag "har inte hört något" och erbjuder utkastet för en obesvarad ansökan till en arbetsgivare som redan har kallat eller intervjuat. I dag införs en spärr: en tjänst i intervjusteget blir inte tyst och hamnar inte under Följ upp. Då säger rummet, notisen och veckobrevet samma sak, och inget falskt skrivs. En kallelse utan tid står kvar med "Sätt tiden när du vet den", en genomförd intervju står som väntar besked. De egna texterna, det egna utkastet och sju dagar byggs i omgång 2. Där gäller också: en kallelse utan tid får handlingen "Sätt tiden", aldrig ett uppföljningsmejl. **Görs nu i den här sessionen** (spärren), **egen omgång (Jobbsöket omgång 2)** (resten).

**15. Startsidan säger att Jobbcoachen känner till dina matchningar och testresultat.** Texten ändras till det som är sant: Jobbcoachen utgår från målroll, ort och bransch i profilen och de dokument användaren själv delar i samtalet, och föreslår frågor utifrån läget i de sökta tjänsterna. Samma rättning i reklamkortet, på `/verktyg/jobbcoachen` och i Kom igång-mejlet (1.16 till 1.18). Ingen ny funktion byggs. **Går till den publika omgången.**

**16. Ordningen på de publika sidorna.** Jag jämkar så här: UX har rätt i att listorna på startsidan, `/priser` och i registreringen kommer först, eftersom det är där Black Week-trafiken landar och beslutar. SEO har rätt i att allt som står i strukturerad data och alla sju "när du öppnar sidan" måste gå i samma push. Ordningen står i avsnitt 4. **Går till den publika omgången.**

**17. Delningslänken med lista för gratiskonton (UX).** Listan i länken blir Premium; gratiskonton delar en länk med antalen. Skäl: listan ger samma rader som rapportens låsta radlistor och går att skriva ut från webbläsaren, alltså en väg runt väggen, och regeln är "gratis att skapa, betalt att ta ut". Länken med antalen står kvar gratis och bär fortfarande vårt namn hos mottagaren. Länkar som redan finns löper ut inom 30 dagar och rörs inte. **Görs nu i den här sessionen**, sist i listan; är tiden slut flyttas just den punkten till omgång 2.

**18. Lönespannet i telefonen `SkarmCoach` (UX).** Exemplet byts mot ett utan kronor och utan "med din bakgrund från NCC": en fråga om uppföljning eller intervju utifrån läget i de sökta tjänsterna, och underraden får inte påstå att svaren bygger på CV:t. Skäl: en påhittad lönesiffra utan källa på sju publika ytor, och samma osanna påstående om CV:t som i fråga 15. Görs som textändring i samma ram, i samma push som 15. **Går till den publika omgången.**

**19. Publik sida för Sökta tjänster (SEO).** Ja. Sökta tjänster är det enda verktyget utan egen sida, och sajten har noll visningar på "aktivitetsrapport", "sökta jobb" och "ansökningar". Sidan byggs på verktygssidornas mall, läggs i sajtkartan och får en artikel om aktivitetsrapporten i innehållsplanen. Den kommer sist i den publika omgången, efter rättningarna, och allt som sägs om Arbetsförmedlingens regler källverifieras. SEO väljer sökord, copywritern skriver, telefonskärmen ritas av art director. **Går till den publika omgången**, telefonskärmen **kräver skiss**.

**20. UX:s ändring A, fråga efter tjänsten i testerna och inför intervjun.** Ja, och det är den viktigaste vägen in, eftersom 70 personer var i testerna på 28 dagar mot 31 på Översikt. Villkor från mig: aldrig före Nivåkollen, aldrig som primär handling på en testskärm och aldrig på en skärm som bär en betalvägg. Första versionen byggs utan migrering: frågan leder till loggningen med tjänsten förifylld. Händelsetypen "kallad till test" väntar. Mobile-ux-designer ritar, art director godkänner, sedan bygge i omgång 2. **Kräver skiss.**

**21. UX:s ändring B, en bricka i Kom igång.** Byggs, men inte i dag. Skäl: den rör nio filer, bland dem sammanfattningen som varje inloggad sida läser och Kom igång-mejlet till betalande, och raden visar bara nästa steg, så en bricka sist i listan syns för få. I omgång 2 läggs brickan "Logga en tjänst du har sökt" in i gratislistorna, tidigt, och kvitteras på servern när en rad skapas i `job_applications` eller `job_saved_ads`. Betalandes lista väntar på mejltexten. **Egen omgång (Jobbsöket omgång 2)**, mejlet till betalande **kräver ägarens ja**.

**22. UX:s ändring C, nolläget och telefonen.** Delas. Länken i väggen i nolläget och "Sök din första tjänst" med två vägar byggs i dag: två filer, och det är sidan dit 31 personer faktiskt kom. Text på knapparna i annonsens fot i telefon väntar till omgång 2, eftersom den ändrar en fast fot som ska ses och godkännas i 412 px och Matchade jobb har sex besökare. Raden i CV-rummet efter nedladdning väntar också: CV-rummet har ett eget släpp som en annan session äger. **Görs nu i den här sessionen** (nolläget), **egen omgång (Jobbsöket omgång 2)** (foten och CV-rummet).

### 3. Görs nu i den här sessionen

Allt på grenen `fix/jobbsoket-slutkontroll` i `C:\Users\chris\cvbrev-jobbsok`. Inga publika sidor, inga migreringar, inga utskick. Byggs av en Opus-agent i den här ordningen. Under arbetet körs bara typkontroll och berörda tester; bygge, hela testsviten, klicktest och prestanda körs en gång i punkt 9.

1. **Ta bort skärmbilden.** Öppna först `public/Skärmbild 2025-09-26 220531.jpg` och anteckna i byggnoterna om namnet på bilden är ägarens eget eller någon annans (skriv inte ut namnet). Ta sedan bort filen med `git rm`. Klart när filen är borta ur `public/`, ingen fil i `src` eller `content` hänvisar till den och adressen ger 404 på den lokala servern.

2. **Stäng det gamla kampanjmejlet.** I `src/app/api/admin/email/campaign/route.ts` svarar POST i båda lägena (`test` och `send`) med status 410 och texten "Mejlet är pensionerat 2026-11-21. Texten stämmer inte längre med produkten." GET lämnas orörd så att statistiken finns kvar. `src/lib/email/campaign-sokta-tjanster.ts` får en kommentar överst om att mejlet är pensionerat och varför. Klart när ett POST ger 410 och inget mejl skickas.

3. **Profilvisningarna.** Fyra ställen och ett test:
   - `src/components/jobb3/oversikt/oversikt.ts`, `bliUpptacktRad`: "Din profil har visats en gång." vid 1, annars "Din profil har visats 12 gånger." Testet i `__tests__/oversikt.test.ts` rättas till de nya strängarna.
   - `src/lib/rum/copy.ts`, `BLI_UPPTACKT.tittat`: "Den har visats en gång." och "Den har visats 12 gånger."
   - `src/app/dashboard/bli-upptackt/BliUpptacktClient.tsx`, det stora talet: talet står kvar, texten bredvid blir "visning av profilen" vid 1 och "visningar av profilen" annars, med "av profilen" i fetstil som i dag.
   - `src/app/dashboard/bli-upptackt/components/ProfileStrengthCard.tsx`: "Din profil har visats 12 gånger den här veckan" och "Din profil har visats 12 gånger", "en gång" vid 1. Raden "Du ser antalet, aldrig vem." står kvar.
   - Visningssidan `src/app/jobb3-kit/page.tsx` får samma ordalydelse i sitt exempel.
   Klart när ingen sträng i `src` säger att ett antal rekryterare har sett profilen. Mejlet `recruiter-interest.ts` rörs inte, där är det en namngiven arbetsgivare.

4. **Delningssidan och rutan.**
   - `src/app/dela/sokta-tjanster/[token]/page.tsx`: radens datum med år, `langDagMedAr`, alltså "Sökt 6 november 2026". Väggen får en ingress under rubriken: "Läget den 21 november 2026." med dagens datum i svensk tid (`langDagMedAr(idagSv())`).
   - `src/components/jobb3/sokta/Rapport.tsx`, rutan "Dela med en länk": "Den som får länken ser hur många tjänster du har sökt och hur långt de har kommit, utan att logga in. Länken gäller i 30 dagar." Kryssrutans text: "Visa också listan med företag, tjänst och datum. Annars visas bara antalen."
   Klart när delningssidan i 412 och 1440 px visar dagens datum under namnet och året på varje rad.

5. **Spärren för intervjusteget.** I `src/lib/jobbsok/lage.ts`, `kanBliTyst`: en tjänst vars status är kallad till intervju, genomförd intervju eller genomfört provjobb (`INTERVJU_STATUS`) blir aldrig tyst. Kommentaren över funktionen säger att spärren gäller tills intervjulägena har egna texter och eget utkast (omgång 2). Testet "en kallelse med tid blir aldrig tyst; utan tid kan den bli det" i `__tests__/motor.test.ts` skrivs om: en kallelse utan tid och en genomförd intervju för 20 dagar sedan är inte tysta. Ingen text ändras. Klart när en sökt tjänst med en kallelse utan tid, 20 dagar gammal, inte står under Följ upp på Översikt, i listan eller på tjänstens sida, och testerna för notisen och veckobrevet fortfarande går igenom.

6. **Nolläget på Översikt.**
   - `src/lib/jobbsok/adress.ts`: `soktaHref` får ett valfritt fält `fran` som sätts som parametern `fran` i adressen. Tolkningen av adressen ändras inte, okända parametrar ignoreras redan.
   - `src/components/jobb3/oversikt/OversiktVy.tsx`, `NyVy` (utan CV): i väggens `Chips`, under "Har du inget CV? Bygg ett här", en textlänk till: "Har du redan sökt en tjänst? Logga den", till `soktaHref({ logga: 'sokt', fran: 'oversikt-ny' })`.
   - `src/lib/jobbsok/attGora.ts`, `sokEnTill`: när kontot varken har sökta tjänster eller rader under Ska sökas blir rubriken "Sök din första tjänst". Texten utan bästa träff blir "Matchade jobb har annonser som passar ditt CV. Har du redan sökt en tjänst loggar du den med företag, tjänst och datum." Texten med bästa träff och knappen ändras inte.
   - `OversiktVy.tsx`, `MainVy`: i samma läge (inga sökta tjänster, inga rader under Ska sökas) visas under väggens knapp, i alla bredder, textlänken "Har du redan sökt en tjänst? Logga den" till `soktaHref({ logga: 'sokt', fran: 'oversikt-forsta' })`.
   - Ett nytt test i `motor.test.ts`: med CV och utan rader är första handlingens rubrik "Sök din första tjänst".
   Klart när båda lägena i 412 x 915 och 1440 px visar länken inne i väggen utan att något täcks eller klipps, tryckytan är minst 44 px, trycket öppnar arket för att logga en sökt tjänst och adressen bär `fran`. Räcker inte väggens höjd i telefon höjs den bara i det läget.

7. **Listan i delningslänken blir Premium.** I `src/app/api/applications/share/route.ts`, POST: `show_company_names` blir sann bara när anropet ber om det och kontot har Premium, med samma kontroll som `src/app/api/applications/report/route.ts` använder. I `Rapport.tsx`: för ett gratiskonto (`last`) ersätts kryssrutan av raden "Listan med företag, tjänst och datum ingår i Premium. Länken visar antalen." Ingen andra betalvägg i vyn, väggen för rapporten står redan i samma spalt. Länkar som redan finns rörs inte. Klart när ett gratiskonto får en länk utan lista också när anropet ber om listan, och ett Premiumkonto får listan som förut. Om tiden inte räcker är det den här punkten, och bara den, som flyttas till omgång 2.

8. **Betalväggarna i kampanjläge.** På den lokala servern med flyttad klocka, i Black Week-läge (99 kr första månaden) och Cyber Monday-läge (49 kr), med ett gratiskonto som aldrig haft Premium, i 412 x 915 och 1440 px: väggen för uppföljningsmejlet (gratisutkastet använt på en annan tjänst), väggen i Matchade jobb och väggen i rapporten. Klart när kampanjpriset står i knappen och på prisraden på alla tre, och "Jag har redan skickat det" syns och går att trycka på i telefon utan att väggen täcker den. Ett fel här rättas i dag och skrivs i byggnoterna.

9. **Slutkontroll, en gång.** Typkontroll, hela testsviten, bygge, klicktest i riktig webbläsare i 1440 px och Pixel 7 av det som ändrats i punkt 1 till 8 plus det som återstod från slutkontrollen (c till j i byggnoterna), och prestandamätningen en gång. En agent åt gången mot produktionsdatabasen. Resultatet skrivs i `docs/bygg-noter-jobbsoket.md`.

**Byggs inte i dag, utan i Jobbsöket omgång 2:** brickan i Kom igång (21), text på knapparna i annonsens fot i telefon och raden i CV-rummet (22), intervjulägenas egna texter, eget utkast och sju dagar, med notisen och veckobrevet (9 och 14), och UX:s ändring A när skissen är godkänd (20).

### 4. Beställningen till den publika omgången

Numren är kartläggningens. Titlar, H2 och slugs rörs inte, `dateModified` uppdateras, SEO-diffen är grind, och sidorna revalideras efter driftsättningen eftersom de annars ligger cachade i ett dygn. Text skrivs av copywritern, bygget görs av Opus-agenter. Punkt 1 till 4 ska vara live före måndag 23 november.

1. **Listorna:** 2.2 och 2.14 (gratislistan och registreringens val), 2.1 (Premiumlistan), 2.4 (FAQ-svaret på `/priser`) och 2.3 (jämförelsetabellen), i en push. Fakta enligt beslut 4.
2. **Matchningen, i en enda push:** alla sju "när du öppnar sidan" (1.4, 1.5, 1.6, 1.7, 1.10, 1.11, 1.12), "inom timmar" och "daglig uppdatering" (1.8, 1.9) och aktiveringen (1.20, 1.21, 1.22, 3.4, samt 3.3 som text i samma ram). Strukturerad data först i granskningen: FAQPage och HowTo på `/verktyg/jobbmatchning`, FAQPage på `/funktioner`.
3. **Jobbcoachen:** 1.15 på startsidan, 3.5 (`SkarmCoach`: underraden och exemplet utan lönespann), 1.17, 1.18 och 1.16.
4. **`/funktioner`:** 1.13 (rubriken över blocket) och 1.14.
5. **Artikeln om mejlansökan:** 1.25, "en till två veckor" på rad 21, 160 och 162, med en mening och en länk till uppföljningsmejlet i ett befintligt stycke, inte i FAQ eller HowTo.
6. **Resten av det som saknas:** 2.9 till 2.11, 2.5 till 2.7, 2.12, 2.13, 2.15, 2.19 till 2.26, 1.19 och 1.26.
7. **Telefonskärmarna:** 3.2 (`SkarmMatchning`) ritas om efter skiss av art director. 3.1 (`SkarmBana`) står kvar tills Black Week är över.
8. **Efter Jobbsöket omgång 2:** 1.24 och 2.27 för `uppfoljning-efter-intervju`, när produkten har sju dagar och ett eget utkast för läget. 2.8 och 2.16 följer brickan i Kom igång.
9. **Ny sida för Sökta tjänster** enligt beslut 19, med artikeln om aktivitetsrapporten i innehållsplanen.

Redan rättat på grenen: 1.1, 1.23 och 2.17. Utgår: 1.2 och 1.3 (mejlet pensioneras) och 2.18 (engångsmejl som redan är skickat). 3.6 tas bort i dag.

### 5. Avläsningen

Saas-lead läser av lördag 5 december och lördag 19 december, i veckorapporterna för vecka 49 och 51. SEO läser av Search Console fyra veckor efter att den publika omgångens punkt 2 gått live. Den 5 december läses allt som antal, inte andelar. Läsningarna mot databasen är enstaka räkningar, ingen last.

| Mått | Utgångsläge 2026-11-21 | Källa |
|---|---|---|
| Konton som loggat en första sökt tjänst eller sparat en rad under Ska sökas | 0 av 109 nya konton på 28 dagar | Supabase |
| Varifrån första raden kom | ingen mätning före i dag | sidvisningar med `fran` i adressen, `ska_sokas_sparad` |
| Personer på Översikt, i Sökta tjänster och i Matchade jobb | 31, 2 och 6 på 28 dagar (testerna 70) | PostHog |
| Öppnade utkast och loggade uppföljningar | 0 | `uppfoljning_utkast_oppnat`, `uppfoljning_loggad` |
| Visningar, klick och köp från väggarna `uppfoljning`, `af-rapport` och `jobbtraffar` | inga | `paywall_shown`, `paywall_cta_clicked`, Stripe |
| Konton som kör matchningen | 1 på 28 dagar | `match_search_run` |
| `/verktyg/jobbmatchning` | 15 klick, 962 visningar, position 12,7 på 90 dagar | Search Console |
| `/artiklar/ai-jobbmatchning` | 4 klick, 1 212 visningar, position 8,8 på 90 dagar | Search Console |

Mål den 19 december: minst 10 konton med en första rad. Stoppregeln: färre än 5, och inget mer byggs i Jobbsöket utöver rättningar förrän ny data finns. Dagen då det nya mejlet går ut antecknas i tidslinjen, eftersom det flyttar talen.

### 6. Till ägaren

Det här kräver ditt ja. Mitt förslag står efter varje punkt.

1. **Push av grenen `fix/jobbsoket-slutkontroll` till main** när punkt 9 är grön. Förslag: ja, i dag. Då går söndagens veckobrev (22 november 08.00) ut med den rättade räkningen av tystnad och den rättade länken.
2. **Push av den publika omgångens punkt 1 till 4 före måndag 23 november.** Förslag: ja, med SEO-diffen som grind.
3. **Nytt mejl om Jobbsöket till befintliga konton,** med en enda handling: logga den tjänst du sökte senast. Texten och ett testutskick till dig är klara senast 24 november. Förslag: utskick onsdag 2 december, efter kampanjmejlen. Vill du inte vänta är onsdag 25 november alternativet.
4. **Skärmbilden:** begär borttagning av adressen i Search Console efter driftsättningen, det tar en minut i ditt konto. Visar byggnoterna att namnet på bilden är en kunds och inte ditt eget är bedömningen av det din.
5. **Rättningar i texter som går ut av sig själva:** Kom igång-mejlet om Jobbcoachen (1.16) i den publika omgången, och i omgång 2 notisens och veckobrevets ord om intervjulägena samt ett nytt Kom igång-mejl till betalande för brickan "Logga en tjänst du har sökt". Förslag: ja till rättningarna; det nya mejlet får du se innan det slås på.
6. **Senare, inte nu:** fältet "Sa de när du får besked?" och händelsetypen "kallad till test" kräver var sin migrering. De kommer med skiss och förslag när omgång 2 visat att vägarna in används.

Ingen ändring föreslås i samtyckestexten i Bli upptäckt, i priserna eller i texter om datalagring och villkor.
