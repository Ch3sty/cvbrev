# Nytt innehåll, publikt omgång 3

Godkänd text för allt som är nytt i ombyggnaden av de publika sidorna. Skriven 2026-11-22 av copy, inom SEO:s besked (`seo-besked-skisser.md`) och textbeslutet (`textbeslut.md`). Filen fylls på sida för sida under bygget och är läsbar hela tiden.

## Innehåll

1. `sokta-tjanster`: den nya sidan, komplett.
2. Befintliga sidor, i noternas ordning: `bli-upptackt`, `brev-artikel`, `brev-exempel`, `brev-exempelnav`, `cv-analys`, `cv-mallar`, `funktioner`, `inloggning`, `jobbcoachen`, `jobbmatchning`, `linkedin`, `meny`, `om-oss`, `personlighetstest`, `personligt-brev`, `priser`, `registrering`, `rekryteringstester`, `skapa-brev-start`, `skapa-cv`, `start`.
3. `nya-funktioner`: en kort och en lång beskrivning per funktion.
4. `artikelreklam`: reklamkorten i artiklarna.
5. Stämmer inte, SEO-lydelser och mått, och det som är ägarens.

Sök på `## <namn>` för att hitta en sida.

## Så läser byggaren filen

- **En sektion per skiss**, med skissens namn som rubrik (`sokta-tjanster`, `start`, `funktioner` och så vidare). Först den nya sidan, sedan befintliga sidor i noternas ordning, sedan de nya funktionerna och sist reklamkorten i artiklarna.
- **Varje rad:** platsen i skissen (klass eller sektion), lydelsen färdig att klistra in, och en not där något behöver sägas. Lydelsen står i kolumnen Lydelse utan citattecken runt. Ett lodstreck i en lydelse skrivs `\|` i tabellen och ska vara ett vanligt lodstreck i koden.
- **Bara det som är nytt står här.** Text som redan finns på sidan står kvar ordagrant (BYGGBRIEF, Texten punkt 1). Det som var osant står i `textbeslut.md`. Hittar du ett nytt block i skissen som saknas här: följ BYGGBRIEF punkt 2, tredje fallet, och lista det i din logg.
- **SEO:** där SEO har gett en lydelse står den ordagrant och är märkt "SEO". Den får inte filas på.
- **Tal** skrivs ut som de är i dag, med konstanten inom klammer efter, till exempel "tolv (`NO_RESPONSE_NUDGE_DAYS`)". Läs alltid talet ur konstanten. Priset läses ur `PLANS` (`src/lib/plans/plans.ts`), i dag 149 kr i månaden, och står alltid efter namnet: "Jobbcoach Premium, 149 kr i månaden".
- **Exempel** (Sara Lindström, arbetsgivare, datum, poäng, matchgrad) är märkta "Exempel" i lydelsen eller i noten. De står i bilder med `aria-label` eller `aria-hidden` och får aldrig framstå som verkliga utfall.
- **Juridik:** frågor om datalagring, GDPR, policy och villkor är märkta "ägarens, skrivs inte". Blocket byggs inte förrän ägaren har gett texten.

## Mått som texten är skriven efter (375 px)

| Plats | Gräns |
|---|---|
| Knapp | cirka 24 tecken |
| Talbrickans förklaring | cirka 28 tecken |
| Etikett över rubriken | cirka 40 tecken |
| Title | högst 60 tecken |
| Description | 110 till 158 tecken |

Står "ryms inte" i en not har lydelsen en kortare ersättare bredvid, med sökordet kvar.

## Ord som gäller överallt

Personliga brev. Jobbcoachen. Jobbcoach Premium, med priset efter namnet. Sökt tjänst, Sökta tjänster, Ska sökas, Matchade jobb, Inför intervjun, Översikt. Läsbarhetspoäng. Uppgift, aldrig fråga, i testerna. Grundnivå, avancerad nivå, expertnivå. Aldrig "spår", aldrig lönebelopp, aldrig tankstreck, inga emoji.

---

## sokta-tjanster

Ny sida, `/verktyg/sokta-tjanster`. Skiss `sidor/sokta-tjanster.html`, not `noter/sokta-tjanster.md`. Dispositionen är SEO:s (beskedet, avsnittet Den nya sidan). Allt på sidan är nytt, så hela texten står här. Ordmängd i `main`: cirka 1 500 ord löptext med FAQ, och drygt 2 000 med exemplen i bilderna. Det är över SEO:s bedömning på 900 till 1 100, eftersom dispositionen har elva H2 och åtta frågor. Inget är utfyllnad; se listan Stämmer inte.

### Metadata och schema

| Plats | Lydelse | Not |
|---|---|---|
| `title` | Sökta jobb: håll koll på dina ansökningar \| Jobbcoach.ai | SEO, ordagrant. 56 tecken. |
| `description` | Logga sökta jobb, se var ansökningarna står och få ett utkast till uppföljningsmejl efter tolv tysta dagar. Med underlag till aktivitetsrapporten. | SEO, ordagrant. 146 tecken. "tolv" ur `NO_RESPONSE_NUDGE_DAYS`. |
| OG och twitter, titel | Sökta jobb: håll koll på dina ansökningar | 41 tecken. |
| OG-bildens rad (`opengraph-image.tsx`) | Håll koll på varje jobb du har sökt | Samma som H1. |
| Brödsmulor (`.brod`, BreadcrumbList) | Hem / Verktyg / Sökta tjänster | SEO. |
| WebApplication `name` | Jobbcoach.ai Sökta tjänster | SEO. `offers` pris 0 SEK. |
| WebApplication `description` | Samma som `description` ovan. | |
| WebApplication `featureList` | Logga sökta jobb med tjänst, arbetsgivare och datum · Ska sökas med sista ansökningsdag · Veckans mål · Statistik från sökt till erbjudande · Utkast till uppföljningsmejl efter tolv tysta dagar · Månadsrapport som underlag till aktivitetsrapporten | Sex rader, en per punkt. Alla står på sidan. |
| HowTo `name` | Så håller du koll på dina sökta jobb | Stegen nedan, ordagrant. Ingen `totalTime`. |

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Sökta tjänster | SEO. 14 tecken. Skissens tillägg "gratis för alla med konto" står inte här: "0 kr" bär det i första talbrickan. |
| `h1.h1` | Håll koll på varje jobb du har sökt | SEO, ordagrant, utan punkt. |
| `.varde` | Spara annonsen du ska söka, logga jobbet du har sökt och se när det är dags att höra av sig. Dagarna räknar vi åt dig. **Efter tolv tysta dagar föreslår vi ett uppföljningsmejl och skriver utkastet.** | Fetstilen som i skissen (`<b>`). "tolv" ur `NO_RESPONSE_NUDGE_DAYS`. Skissens "ligger ett utkast klart" står inte: utkastet skrivs när man öppnar det. |
| `.knapp` (primär) | Börja logga gratis | 18 tecken. Till `/register`. Skissens "Logga din första sökta tjänst" är 29 tecken och ryms inte på 375 px. |
| `.lank` | Så fungerar det | Ankare till stegen. |
| `.bricka` 1 | **0 kr** för lista och statistik | 23 tecken. |
| `.bricka` 2 | **12** tysta dagar, sedan utkastet | 27 tecken. Talet ur `NO_RESPONSE_NUDGE_DAYS`. |
| `.bricka` 3 | **1 blad** per månad, som underlag | 23 tecken. |
| `.malrad` (under bilden) | Veckans mål: 2 av 3 sökta | Exempel. |
| Bildens `aria-label` (`.sparvy`) | Exempel: Saras sökta tjänster, från Ska sökas till Erbjudande. En har varit tyst i tolv dagar och en intervju är bokad. | Inga rubriker i bilden. |

### Första handlingen (`.lyft`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Börja här | Skissens "Tar en minut" står inte: ingen har mätt tiden. |
| `h2.h2` | Logga ett jobb du har sökt | SEO, ordagrant. Skissen hade "en tjänst". |
| `.varde` | Tjänst, arbetsgivare och datum räcker. Sedan behöver du inget kalkylark över dina sökta jobb. Har du inte sökt än väljer du Jag ska söka och lägger till sista ansökningsdag. | "kalkylark" står med för dem som för listan själva (seo-krav, Sökord). |
| `.bockar` 1 | Varje sökt tjänst får en bricka som följer med från Sökt till Erbjudande. | |
| `.bockar` 2 | Vi räknar dagarna sedan du senast hörde något. Tystnaden loggar du aldrig själv. | |
| `.bockar` 3 | Det du loggar samlas månad för månad, som underlag till din aktivitetsrapport. | |
| `.liten` | Kommer du från Matchade jobb är tjänsten, arbetsgivaren och sista ansökningsdag redan ifyllda. | |
| Arket, `aria-label` | Exempel: arket där du loggar en sökt tjänst | |
| Arket, rubrik (`.arkrubrik`, stycke) | Logga sökt tjänst | Som i kontot (`LoggaArk.tsx`). Ingen h-tagg. |
| Arket, fält | Har du sökt eller ska du söka? · Jag har sökt · Jag ska söka · Tjänst · Arbetsgivare · Datum sökt · Hur sökte du? | Etiketterna ordagrant som i kontot. |
| Arket, exempelvärden | Projektledare · Dalvik Anläggning · 10 november 2026 · Annons | Exempel. Kanalens val heter Annons, Spontan och Via kontakt i arket, inte "Svar på annons". |
| Arket, knapp | Logga sökt tjänst | 17 tecken. Som i kontot. Till `/register`. |

### Så fungerar det (`.vagsteg`, HowTo)

| Plats | Lydelse | Not |
|---|---|---|
| `h2.h2` | Så fungerar det | SEO. Skissens `.ey` med samma ord stryks, den upprepar rubriken. |
| `.varde` | Fyra steg, från sparad annons till månadens underlag. | |
| Steg 1, `h3` | Spara annonsen du ska söka | SEO. |
| Steg 1, text | Lägg den under Ska sökas med sista ansökningsdag. Från en träff i Matchade jobb sparar du med ett tryck. | |
| Steg 2, `h3` | Logga när du har sökt | SEO. |
| Steg 2, text | Markera annonsen som sökt, eller logga ett jobb du har sökt på egen hand. Brickan flyttar till Sökt. | |
| Steg 3, `h3` | Uppdatera när något händer | SEO. |
| Steg 3, text | Kallad till test, kallad till intervju, erbjudande eller avslag. Varje händelse hamnar på tjänsten med sitt datum. | |
| Steg 4, `h3` | Följ upp och ta ut månaden | SEO. |
| Steg 4, text | Efter tolv tysta dagar föreslår vi ett uppföljningsmejl. Vid månadens slut står det du har sökt samlat på ett blad. | "tolv" ur konstanten. |
| Stegbildernas småtexter (`aria-hidden`) | Sista dag onsdag · Sökt 22 nov · Kallad till test · Intervju · Erbjudande · tyst i 12 dagar | Exempel. |

HowTo-stegen i JSON-LD är rubrik och text ovan, ordagrant.

### Läget (`article.o`, de fyra facken)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Läget i ett ögonkast | Skissens "Läget i en blick" är inte svenska. |
| `h2.h2` | Från Ska sökas till erbjudande | SEO, ordagrant. |
| `.varde` | Varje sökt tjänst är en bricka med arbetsgivarens två första bokstäver. Du ser var den står, vilken som har varit tyst för länge och vilken intervju som kommer härnäst. | |
| Facken (`.fack b`, stycken) | Ska sökas · Sökt · Intervju · Erbjudande | Som i kontot (`Lista.tsx`). Inga rubriker. |
| Fackens underrader (`small`) | Närmast: onsdag · Väntar svar · Bokad tisdag · Hit ska en bricka | Exempel. "Väntar svar" som i kontot. |
| Brickornas märken (`em`) | 12 dagar · tis 10.00 | Exempel. |
| `.fack`, `aria-label` | Exempel: en annons under Ska sökas, tre sökta tjänster varav en har varit tyst i tolv dagar, en intervju på tisdag och inget erbjudande än | |
| `.statusar`, `aria-label` | Händelser du kan logga på en sökt tjänst | |
| `.statusar` | Sökt · Kallad till test · Kallad till intervju · Intervju genomförd · Provjobbat · Erbjudande · Tackade ja · Tackade nej · Avslag | Läs etiketterna ur `STATUS_META`. |
| `.liten` | Ett avslag räknas som ett svar och flyttar tjänsten till Avslutade, längst ned. Den ligger kvar i din historik. | Skissens "försvinner aldrig" står inte: man kan ta bort en tjänst själv. |

### Ska sökas (`.sekt-ton`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Ska sökas | |
| `h2.h2` | Spara annonsen med sista ansökningsdag | SEO, ordagrant. |
| `.varde` | Hittar du en annons på måndagen men hinner skriva först på torsdagen? Lägg den under Ska sökas. Den står kvar med sin sista ansökningsdag, och när dagen närmar sig lyfter vi fram den. | |
| Andra stycket | En sparad annons räknas inte som sökt förrän du har sökt. Från raden skriver du det personliga brevet, och när ansökan är skickad markerar du den som sökt. | |
| `.chip-gratis` | Gratis för alla med konto | 25 tecken. |
| Exemplets `aria-label` | Exempel: två sparade annonser under Ska sökas | |
| Kort 1 | Projektledare, logistik · Isberg Logistik, Göteborg · Sista dag onsdag 25 nov, 3 dagar kvar | Exempel. Datumraden i formen från `sistaDagText`. |
| Kort 2 | Byggprojektledare · Nordhaga Bygg, Mölndal · Sista dag torsdag 3 dec, 11 dagar kvar | Exempel. |
| Kortens handlingar | Skriv brev · Markera som sökt · Ta bort | Som i kontot. Inga länkar, det är en bild. |
| `.malbild`, `aria-label` | Exempel: veckans mål, två av tre sökta | |
| `.malbild b` | 2 av 3 · sökta den här veckan | Exempel. |
| `h3.h3` | Veckans mål håller farten uppe | SEO, ordagrant. |
| Text under `h3` | Förvalet är tre sökta tjänster i veckan. Du ändrar det själv, från en till tio, och veckan börjar om varje måndag. Fattas en ansökan visar vi vägen till annonser som passar ditt CV. | Talen ur `VECKANS_MAL_FORVAL`, `VECKANS_MAL_MIN`, `VECKANS_MAL_MAX`. |

### Statistiken (`.sekt-papper`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Statistik | Flikens namn i kontot. |
| `h2.h2` | Se var ansökningarna tar stopp | SEO, ordagrant. |
| `.varde` | Får du inga svar alls, eller tar det stopp efter intervjun? Statistiken ritar vägen från sökt till erbjudande, med en bricka per tjänst. | |
| `.chip-gratis` | Gratis för alla med konto | |
| Trattens led (`.led b`, stycken) | Sökta · Fått svar · Intervju · Erbjudande | Inga rubriker. |
| Ledens underrader | Sedan 14 oktober · 2 kallelser, 3 avslag · 1 genomförd, 1 bokad · Inget än | Exempel. |
| Mellan leden (`.mellan`) | 5 av 8 · 2 av 5 · väntar | Exempel. Formen som i kontot (`TrattBild.tsx`). |
| `.tratt`, `aria-label` | Exempel: åtta sökta jobb. Fem har fått svar. Två har lett till intervju. Inget erbjudande än. | |
| `h3` 1 | Aktivitet per vecka | SEO. Som i kontot. |
| Text 1 | Hur många jobb du har sökt, vecka för vecka eller månad för månad. | |
| Bild 1, `aria-label` | Exempel: sökta jobb per vecka under sex veckor | |
| `h3` 2 | Hur du sökte | SEO. Som i kontot. |
| Text 2 | Svar på annons, spontanansökan eller via kontakt. Du ser hur dina ansökningar fördelar sig. | Skissens "vilken väg som ger svar" står inte: kortet visar antal per väg, inte svar per väg. |
| Bild 2, förklaring | 5 annons · 2 spontana · 1 via kontakt | Exempel. `aria-label`: Exempel: fem på annons, två spontana, en via kontakt |
| `h3` 3 | Svar per CV | SEO. Som i kontot. |
| Text 3 | Skickar du olika CV:n ser du hur många av de sökta tjänsterna med varje CV som har fått svar. | |
| Bild 3, rader | CV, projektledning 4 av 5 · CV, logistik 1 av 3 | Exempel. |

### Uppföljningsmejlet (`article.o.vand`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Följ upp | Lägets namn i kontot. Skissens "Uppföljningsmejlet" upprepar rubriken. |
| `h2.h2` | Uppföljningsmejlet efter tolv tysta dagar | SEO, ordagrant. Skissens rubrik står inte. "tolv" ur konstanten. |
| `.varde` | Att påminna om en ansökan tar emot, så det blir sällan av. **Vi skriver utkastet utifrån din ansökan, och du ändrar det du vill direkt i texten.** | Skissens "De flesta ansökningar får aldrig en påminnelse" står inte, det finns inget belägg. |
| `.sedan` 1 | **Du skickar från din egen e-post.** Utkastet öppnas i ditt mejlprogram, eller så kopierar du texten. Vi skickar aldrig något åt dig. | |
| `.sedan` 2 | **Påminnelsen flyttas fram.** Tjänsten lämnar Följ upp, och ingen ny påminnelse kommer på tolv dagar. | Som i kontot (`Uppfoljning.tsx`). |
| `.sedan` 3 | **Är det fortfarande tyst säger vi till.** Då väljer du själv om du vill fråga en gång till. | |
| Stycket efter listan | Har du varit på intervju frågar mejlet i stället om besked, och då räcker sju dagar utan svar. Vill du skriva själv finns råden i artiklarna om att [söka jobb via mejl](/artiklar/soka-jobb-via-mail) och om [uppföljning efter intervju](/artiklar/uppfoljning-efter-intervju). | "sju" ur `INTERVJU_BESKED_DAGAR`. De två länkarna är SEO:s krav på länkar ut. |
| `.chip-vagg` | Första utkastet gratis | 22 tecken. `UPPFOLJNING_GRATIS_UTKAST`. |
| `.chip-premium` | Fler utkast i Premium | 21 tecken. |
| Mejlet, `aria-label` | Exempel: utkast till uppföljningsmejl | |
| Mejlet, Till | Mottagarens adress, står oftast under Kontakt i annonsen | Platshållare. |
| Mejlet, Ämne | Min ansökan till tjänsten som projektledare | Exempel. |
| Mejlet, text | Hej, / Jag sökte tjänsten som projektledare hos er den 10 november och undrar hur långt ni har kommit i rekryteringen. / Jag är fortfarande intresserad. Det jag gör i dag, projektledning, budgetansvar och upphandling, ligger nära det ni beskriver i annonsen. / Hör gärna av er om ni vill ha något mer från mig. Jag svarar på det här mejlet eller i telefon. / Vänliga hälsningar / Sara Lindström | Exempel. Ordagrant mallens text (`uppfoljningsmall` i `src/lib/jobbsok/uppfoljning.ts`). Snedstreck är styckebrytning. |
| Mejlets knappar | Öppna i e-post · Kopiera mejlet · Skriv om kortare | Som i kontot. Bild, inga länkar. |
| Mejlets fråga | Skickade du mejlet? · Ja, det är skickat | Som i kontot. |

### Intervjun (`.tva` med `.ivkort`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Inför intervjun | Flikens namn. |
| `h2.h2` | Intervjun hör till tjänsten du sökte | SEO, ordagrant. |
| `.varde` | När du blir kallad sätter du dag, tid och plats på den sökta tjänsten. Sedan vet vi vad du förbereder dig för. | |
| Andra stycket | Frågorna du övar på hör ihop med just den tjänsten, och annonsens krav ligger bredvid. Efter intervjun frågar vi hur det gick. Har du inte fått besked på sju dagar föreslår vi ett kort mejl som tackar för intervjun och frågar när du kan vänta det. | "sju" ur `INTERVJU_BESKED_DAGAR`. |
| `.chip-gratis` | Ett intervjuprov om dagen gratis | 32 tecken, ryms som chip. |
| `.chip-premium` | Utan dagsgräns i Premium | |
| Kortet, `aria-label` | Exempel: en sökt tjänst med bokad intervju | |
| Kortets topp | tis 24 · Intervju tisdag 10.00 · Projektledare, Polhem Ombyggnad, Göteborg | Exempel. Kommatecken i stället för skissens mittpunkt. |
| Kortets text | **Förbered intervjun på tisdag.** Två av de sju vanligaste frågorna är övade. Börja med den du fick lägst betyg på. | Exempel. "Förbered intervjun" som i kontot. |
| Frågerader | Ett problem du löste, betyg 3 av 5, Lägst betyg hittills. Öva på den här först. · Berätta om dig själv, betyg 4 av 5 · Varför vill du ha jobbet?, Inte övad | Exempel. Betygens `aria-label`: Betyg 3 av 5, Betyg 4 av 5. |
| `.hurgick` | **Hur gick intervjun?** Dagen efter frågar vi. Svara med ett tryck, så hamnar det rätt bland händelserna. | "Hur gick intervjun?" är ett stycke, ingen rubrik. |
| `.hurgick`, svar | Den är genomförd · Den blev flyttad · Den blev inställd | Som i kontot (`SmaArk.tsx`). |

### Månadsrapporten (`.sekt-ton` med `.blad`)

Allt om Arbetsförmedlingens regler här och i FAQ-fråga 4 kommer ur `seo-krav.md`, tabellen över påståenden, och bär källan med datumet då den lästes. Kontrollera källan igen på byggdagen. Skriv aldrig att rapporten godkänns, har rätt format eller skickas av oss.

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Månadsrapporten | |
| `h2.h2` | Underlag till din aktivitetsrapport | SEO, ordagrant. Skissens "redan ifyllt" står inte. |
| `.varde` | Lämnar du aktivitetsrapport till Arbetsförmedlingen? Det du har loggat under månaden står samlat på ett blad: sökta annonserade jobb, intresseanmälningar och spontanansökningar, intervjuer och provjobb, med datum. | |
| Andra stycket | **Du lämnar in rapporten själv.** Vi skickar ingenting till Arbetsförmedlingen. | Skissens "och ingen där ser ditt konto": ägarens, skrivs inte. |
| Regelrutan (nytt stycke under, `.liten` eller `.kort-ton`) | Enligt Arbetsförmedlingen lämnar du aktivitetsrapporten mellan den 1:a och den 14:e varje månad, och den gäller månaden innan. Alla jobb du har sökt ska med, annonserade eller inte. Du lämnar den på Mina sidor, med blankett eller per telefon, och sparar underlag som visar att du har sökt jobben i minst tre månader. Källa: [Aktivitetsrapportera, arbetsformedlingen.se](https://arbetsformedlingen.se/for-arbetssokande/arbetslos---vad-hander-nu/aktivitetsrapportera), läst 22 november 2026. | Finns inte i skissen. SEO kräver källan namngiven och datumet. Byt datumet om källan läses om. |
| Gratis och Premium (ny rad under uttagen) | På gratisnivån ser du antalen per månad. Raderna, utskriften och kopieringen ingår i Jobbcoach Premium, 149 kr i månaden. | Priset ur `PLANS`. |
| Månadsväljaren (`.manval`) | November 2026, 6 sökta jobb, 1 intervju · Oktober 2026, 2 sökta jobb | Exempel. |
| `.uttag` 1 | Skriv ut eller spara som PDF · Premium · Bladet som det ser ut här bredvid. | |
| `.uttag` 2 | Kopiera som text · Premium · Rad för rad, att klistra in där du rapporterar. | |
| `.uttag` 3 | Dela med en länk · Antalen gratis · Länken gäller i 30 dagar. Listan med företag, tjänst och datum ingår i Premium. | 30 ur `APPLICATION_SHARE_TTL_DAYS`. |
| Bladet, `aria-label` | Exempel: månadsrapporten för november | |
| Bladet, namn (stycke, inte `h3`) | Sara Lindström | SEO: ingen rubrik. |
| Bladet, period | November 2026, 6 sökta jobb och 1 intervju under perioden | Exempel. |
| Bladets avsnitt (stycken, inte `h4`) | 1. Sökta annonserade jobb · 2. Intresseanmälningar och spontanansökningar · 3. Intervjuer och provjobb | Som i kontot (`Rapport.tsx`). |
| Bladets rader | Som skissen: fem annonserade, en spontanansökan, en intervju. | Exempel. Påhittade arbetsgivare, ingen verklig. |
| Bladets tal | 8 Sökta totalt · 5 Fått svar · 2 Intervjuer · 0 Erbjudanden | Exempel. Talen gäller hela sökandet (sex i november, två i oktober) och stämmer med tratten högre upp. Etiketterna som i kontot. |
| Bladets fot | Genererad via jobbcoach.ai, 22 november 2026 | Exempel. |

### Gratis och Premium (`.premium`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Gratis och Premium | |
| `h2.h2` | Gratis att logga. Premium när du vill ta ut mer. | SEO, ordagrant. |
| Ingress | Allt du lägger in är gratis och ligger kvar. Premium lägger till det vi skriver och sammanställer åt dig. | |
| `h3` (`.gratiskort`) | Gratis för alla med konto | SEO. Hela raden är rubriken, inget chip i den. |
| Gratislistan (`.bockar`) | Logga så många sökta tjänster du vill · Listan, läget och statistiken, från sökt till erbjudande · Ska sökas med sista ansökningsdag · Veckans mål · Det första utkastet till ett uppföljningsmejl · Månadsrapportens antal, och en delningslänk som visar dem · Ett intervjuprov med bedömning om dagen | Sju rader. |
| Rad under gratislistan | Inget kort behövs. Du skapar kontot med din e-postadress. | |
| `h3` (`.premkort`) | Jobbcoach Premium | SEO. |
| `.pris` | 149 kr i månaden | Ur `PLANS`. Inga kampanjord här. |
| Rad under priset | Säg upp när du vill. | |
| Premiumlistan (`.bockar`) | Utkast till uppföljningsmejl till varje sökt tjänst, efter en ansökan eller en intervju · Månadsrapporten med alla rader, att skriva ut eller kopiera · Delningslänk med listan över företag, tjänst och datum · Intervjuprovet utan dagsgräns · Matchade jobb med de 25 bästa träffarna, och Jobbcoachen så mycket du vill | Fem rader. 25 ur `JOB_MATCHES_PER_RUN`. Inget tak skrivs ut (textbeslut B-13). |
| `.knapp` | Börja gratis | 12 tecken. Till `/register`. |
| `.lank` | Se allt i Premium | Till `/priser`. |

### Länkar vidare (`.rutnat.r3` med `.lankbricka`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Före och efter ansökan | |
| `h2.h2` | Resten av jobbsöket ligger ett tryck bort | SEO, ordagrant. |
| Bricka 1, `/verktyg/rekryteringstester` | **Rekryteringstester** Kallad till test? Träna på samma sorts uppgifter först. | Först, enligt SEO. Ankartexten är det fetade. |
| Bricka 2, `/verktyg/jobbmatchning` | **Jobbmatchning** Annonser som passar ditt CV, att spara till Ska sökas. | |
| Bricka 3, `/verktyg/personligt-brev` | **Personligt brev** Skrivet mot annonsen du sparade, utifrån ditt CV. | |
| Bricka 4, `/verktyg/jobbcoachen` | **Jobbcoachen** Föreslår frågor utifrån läget i dina sökta tjänster. | |
| Bricka 5, `/artiklar/soka-jobb-via-mail` | **Söka jobb via mejl** Artikel: så skriver du ansökan och påminnelsen. | |
| Bricka 6, `/artiklar/uppfoljning-efter-intervju` | **Uppföljning efter intervju** Artikel: när och hur du frågar om besked. | |

### Frågorna (`.faq`, FAQPage)

Åtta frågor, synliga och i FAQPage ordagrant lika. Frågorna är SEO:s. Skissens nionde fråga, "Vem kan se mina sökta tjänster?": ägarens, skrivs inte, och byggs inte.

| Plats | Lydelse | Not |
|---|---|---|
| `h2.h2` | Frågor om Sökta tjänster | SEO. |
| `.varde` | Hittar du inte svaret? Mejla support@jobbcoach.ai. | Adressen som `mailto:`-länk. |
| Fråga 1 | Kostar det något att logga sökta jobb? | |
| Svar 1 | Nej. Att logga sökta jobb, spara annonser under Ska sökas, sätta veckans mål och se statistiken är gratis för alla med konto, och du behöver inte lämna några kortuppgifter. Det första utkastet till ett uppföljningsmejl är också gratis. Fler utkast och månadsrapporten med alla rader ingår i Jobbcoach Premium, 149 kr i månaden. | Priset ur `PLANS`. |
| Fråga 2 | Skickar ni uppföljningsmejlet åt mig? | |
| Svar 2 | Nej. Vi skriver ett utkast, och du öppnar det i din egen e-post eller kopierar texten. Du ändrar det du vill och skickar själv, från din egen adress. Vi skickar aldrig något till en arbetsgivare. | |
| Fråga 3 | Skickar ni min aktivitetsrapport till Arbetsförmedlingen? | |
| Svar 3 | Nej. Månadsrapporten är ditt eget underlag. Du lämnar in aktivitetsrapporten själv, på Mina sidor eller på något av de andra sätt Arbetsförmedlingen anger. Vi skickar ingenting dit. | |
| Fråga 4 | Vad ska stå i en aktivitetsrapport? | |
| Svar 4 | Enligt Arbetsförmedlingen ska alla jobb du har sökt under månaden stå med, annonserade eller inte, och även intervjuer du har varit på. Du lämnar rapporten mellan den 1:a och den 14:e varje månad, och den gäller månaden innan. Den lämnas på Mina sidor, med blankett eller per telefon, och du sparar underlag som visar att du har sökt jobben i minst tre månader. Vår månadsrapport har tjänst, arbetsgivare och datum för varje sökt jobb. Vad som gäller i ditt fall står hos Arbetsförmedlingen, på sidan Aktivitetsrapportera (läst 22 november 2026). | "Aktivitetsrapportera" länkas till Arbetsförmedlingens sida. Vi säger vad vår lista har, aldrig att Arbetsförmedlingen kräver just de uppgifterna. |
| Fråga 5 | Varför föreslår ni uppföljning efter just tolv dagar? | |
| Svar 5 | Det är vår egen gräns, ingen regel. Tolv dagar är långt nog för att arbetsgivaren ska ha hunnit läsa, och kort nog för att rekryteringen oftast fortfarande pågår. Efter en intervju föreslår vi mejlet redan efter sju dagar utan besked. Du kan alltid höra av dig tidigare på egen hand. | Talen ur `NO_RESPONSE_NUDGE_DAYS` och `INTERVJU_BESKED_DAGAR`. |
| Fråga 6 | Måste jag hitta jobben genom er jobbmatchning? | |
| Svar 6 | Nej. Du loggar vilket jobb som helst med tjänst, arbetsgivare och datum, också spontanansökningar och jobb du har fått höra om genom en kontakt. Kommer du från en träff i Matchade jobb är uppgifterna redan ifyllda. | |
| Fråga 7 | Kan jag lägga in jobb jag sökte innan jag skapade kontot? | |
| Svar 7 | Ja. Du väljer själv datumet när du loggar, så äldre ansökningar hamnar i rätt månad. Har du skrivit personliga brev hos oss tidigare föreslår vi att lägga in dem som sökta tjänster, med ett tryck. | |
| Fråga 8 | Hur hänger intervjun ihop med den sökta tjänsten? | |
| Svar 8 | När du loggar att du är kallad sätter du dag, tid och plats på tjänsten. Den står då under Inför intervjun, med frågorna du har övat på och annonsens krav bredvid. Dagen efter intervjun frågar vi hur det gick. | |

### Slutblocket (`.knapprad` efter frågorna) och telefonens fasta rad

| Plats | Lydelse | Not |
|---|---|---|
| `.knapp` | Börja logga gratis | 18 tecken. Samma som i hjälten. Till `/register`. |
| `.lank` | Se priserna | Till `/priser`. |
| Fasta knappraden i telefonen, om sidan får en som de andra verktygssidorna | Börja logga gratis | |

### UX-kontrollen, den här sidan

- **En primär handling:** kopparknappen leder alltid till registreringen. Den heter "Börja logga gratis" i hjälten och i slutet, "Logga sökt tjänst" på arket (arkets eget namn i kontot) och "Börja gratis" på Premiumytan. Tre lydelser, ett mål. På dator syns hjältens knapp och arkets knapp samtidigt: låt arkets vara kopparknappen och gör hjältens till `.knapp-vit` om två kopparknappar hamnar på samma skärmyta.
- **Namnen** stämmer med kontot: Sökta tjänster, Ska sökas, Sökt, Väntar svar, Följ upp, Intervju, Erbjudande, Avslutade, Statistik, Aktivitet per vecka, Hur du sökte, Svar per CV, Förbered intervjun, Hur gick intervjun?, Veckans mål.
- **Sökordet:** "sökta jobb" står i title, description, hjälten, lyftet, steg 2, statistiken, rapporten och fyra FAQ-svar. "Sökta tjänster" står där produkten nämns vid namn.

---

## bli-upptackt

`/verktyg/bli-upptackt`. Skiss `sidor/bli-upptackt.html`, not `noter/bli-upptackt.md`. Ingen rubrik och ingen löptext byts: H1, åtta H2, sexton H3, all löptext, de sju frågorna och etiketten "Bli upptäckt, tidig åtkomst" står kvar ordagrant. Texterna om vad som visas och döljs ligger nära samtycket och rörs inte. Enda textbytet är FAQ-svaret om lön, textbeslut BU-1. Nytt är orden i bilderna, och de står här. Arbetsgivaren och "percentiler": ägarens, skrivs inte (SEO: NEJ).

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h1`, `.varde`, knapparna, tre brickor | Står kvar ordagrant. | Brickorna: Anonym, tills du tackar ja · 4, steg och du styr i varje · 1, klick för att sluta synas. |
| Reglaget över kortet | Synlig för rekryterare | Står i dag i telefonen. |
| Kandidatkortet, `aria-label` | Exempel: så ser en rekryterare Saras profil, utan namn | Inga rubriker i kortet. |
| Kortets huvud (stycke) | Projektledare · Västra Götaland · Anonym | Exempel. Rollen som rubrik, aldrig "Kandidat 4 812". |
| Kortets erfarenhetsrad | 8 års erfarenhet. Senast: Projektledare (5 år). Civilingenjör | Exempel. Punkter i stället för skissens mittpunkter. |
| Kortets märken | Matrislogik, topp 15 % · Strukturerad · Lugn under press | Exempel. Ett test och två styrkor, aldrig tre (textbeslut BU-2). Placering, aldrig andel rätt. |
| Kortets kompetenser | projektledning · LOU · budgetansvar · AMA | Exempel. |
| Kortets fot | 3 månader, hybrid, heltid, B-körkort | Exempel. |
| Förfrågan, `aria-label` | Exempel: en kontaktförfrågan från en rekryterare | |
| Förfrågan, etikett | Kontaktförfrågan | Sidans eget ord. |
| Förfrågan, rubrik (stycke) | En rekryterare vill prata med dig | Ny. |
| Förfrågan, text | Tackar du ja delas ditt namn och dina kontaktuppgifter. Annars händer ingenting. | Ny. Säger samma sak som H3 "Du är anonym tills du säger ja". |
| Förfrågan, svar | Tacka ja · Nej tack | Bild, inga knappar. |

### Så fungerar det och Rätt synlighet (stegens och kortens bilder)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` över "Så fungerar det" | Stryks. | Upprepar rubriken. |
| Steg 1, bild (`aria-hidden`) | Projektledare · 8 år · LOU · budgetansvar | Exempel. |
| Steg 2, bild (`aria-hidden`) | Matrislogik, topp 15 % · Frivilligt | Exempel. |
| Steg 3, bild (`aria-hidden`) | Synlig för rekryterare | Reglaget. |
| Steg 4, bild (`aria-hidden`) | Tacka ja · Nej tack | |
| `.knapp-vit` under stegen | Skapa min profil | Står som i dag. |
| `.ey` över "Rätt synlighet, inte mer synlighet" | Därför fungerar det | Som i dag om den finns, annars ny. 19 tecken. |
| Kortet "Bevis, inte påståenden", bild (`aria-hidden`) | Matrislogik, topp 15 % · Numeriskt, topp 30 % | Exempel. |

### Arbetsstilen (`.o` i indigo)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Frivilligt personlighetstest | Som i dag om den finns, annars ny. 28 tecken. |
| `h2`, texterna, de tre "Så ..."-rubrikerna | Står kvar ordagrant. | |
| Papperet, `aria-label` | Exempel: arbetsstilen i ord | |
| Raden med kunskapstester (`aria-hidden`) | Matrislogik, topp 10 % · Verbalt, topp 25 % · Numeriskt, topp 30 % | Exempel. I löptext heter testerna Matrislogik, Verbalt resonemang och Numeriskt resonemang. |

### Full kontroll (`.vagen4`, nytt)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, ingressen, fyra `h3` med text | Står kvar ordagrant. | Samtyckesnära. Rörs inte. |
| Vägen, `aria-label` | Vägen från anonym profil till kontakt: anonym profil, kontaktförfrågan, du väljer, och först efter ditt ja delas namn och kontaktuppgifter | |
| Led 1 | **Anonym profil** Roll, kompetenser, villkor och testresultat. Inget namn. | Ny. Samma uppräkning som H3-texten under, kortad. |
| Led 2 | **Kontaktförfrågan** En rekryterare vars sökning matchar hör av sig. | Ny. |
| Led 3 | **Du väljer** Tacka ja eller nej. Säger du nej händer ingenting. | Ny. |
| Led 4 | **Först efter ditt ja** Namn och kontaktuppgifter delas, och ni chattar här på jobbcoach.ai. | Ny. Skissens "chattar i appen" står inte: publikt finns ingen app. |

### Matchningen (`.mote`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, ingressen, raden under valen | Står kvar ordagrant. | Ordet "nedan" i ingressen får strykas, sökningarna står bredvid. |
| Valen, `aria-label` | Välj en sökning | Som i dag. |
| Valen | Bygg, Västra Götaland · Annan region · Högre testkrav · Annan arbetsstil | Första valet byter exempel från "Ekonomi, Stockholm". De tre andra som i dag. |
| Mötet, `aria-label` | Exempel: en rekryterares sökning jämförd med Saras profil | |
| Mötets huvud | Din profil · Rekryterarens sökning | Som i dag. |
| Rad 1 | Yrkesroll, Projektledare · Söker roll, Projektledare | Exempel. |
| Rad 2 | Region, Västra Götaland · I region, Västra Götaland | Exempel. |
| Rad 3 | Test, Matrislogik, topp 15 % · Test, minst topp 20 % | Exempel. |
| Rad 4 | Kompetens, LOU och budgetansvar · Kompetens, LOU | Exempel. |
| Rad 5 | Arbetsstil, Strukturerad · Arbetsstil, Strukturerad | Exempel. |
| Svaret | **Full träff. Din profil syns för den här rekryteraren.** 5 av 5 stämmer. | Första meningen som i dag. |
| Andra exemplet | **Annan region: 4 av 5 stämmer.** Den här sökningen hittar dig inte. | Ny. |

### Kandidatkortet i full storlek (`article.o`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2` | Står kvar ordagrant. | "Exempelprofil". |
| `.varde` | Rekryteraren ser din yrkesroll, region, kompetenser, dina testresultat och din arbetsstil. | Första meningen i dagens stycke, ordagrant. |
| Lista 1, rubrik (stycke) | Syns på kortet | Ny. |
| Lista 1, rader | Yrkesroll, region och erfarenhet · Kompetenser ur ditt CV · Testresultat med nivå och placering · Dina två främsta styrkor och din arbetsstil i ord, om du har valt det · Tillträde, arbetsplats och omfattning | Ny. Samma saker som H3-texten "Du är anonym tills du säger ja", inget mer. |
| Lista 2, rubrik (stycke) | Syns inte | Ny. |
| Lista 2, rader | Ditt namn och ditt foto · Dina kontaktuppgifter · Ditt CV-dokument · Ditt lönespann · Vilket företag du jobbar på i dag | De sex sakerna ur dagens andra mening, i samma ordning och med samma ord. Lägg inte till något. |
| Kortet, `aria-label` | Exempel: kandidatkortet som en rekryterare ser det | |
| Kortets egna ord | Projektledare som håller ihop upphandling och tidplan. Trivs bäst där många ska dra åt samma håll. | Exempel. SEO: märks "Exempel". |
| Kortets märken | Matrislogik, topp 15 % · Numeriskt, topp 30 % · Strukturerad · Lugn under press | Exempel. Två styrkor. |
| Kortets arbetsstil | Improviserar och anpassar, Planerar och strukturerar · Får energi av eget fokusarbete, Får energi av samarbete i grupp · Trivs när processer är tydliga och kvalitet hinner göras rätt. | De två sista står i dag. Första paret ur kontots etiketter; finns det inte där stryks det. |
| Kortets kompetenser och fot | projektledning · LOU · budgetansvar · AMA · tidplan · 3 månader, hybrid, heltid, B-körkort | Exempel. |

### Slutblocket (`.slut`) och frågorna

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, texten, knappen | Står kvar ordagrant. | "Gratis, utan kortuppgift", "Skapa min profil". |
| `.lank` | Se hur det fungerar | Ankare till stegen. |
| Bilden (`aria-hidden`) | Synlig för rekryterare · Av, med ett klick · 0 kr, ingen kortuppgift | Ny. |
| Frågorna | Sju frågor och svar står kvar ordagrant, utom svaret om lön: textbeslut BU-1. | |
| `.knapp` efter frågorna | Skapa min profil | |

### UX-kontrollen, den här sidan

- **En primär handling:** "Skapa min profil", till registreringen, på alla fyra ställen. Under stegen är den vit.
- **Lön:** inget belopp och inget spann visas någonstans. Lönespannet står bara i listan Syns inte.
- **Två styrkor** i alla bilder, som texten säger. Testresultat alltid som placering.
- **Samtycke och vad som delas:** inga nya påståenden. Varje ny rad säger samma sak som en mening som redan står på sidan.

---

## brev-artikel

Mallvisaren i artiklarna (22 artiklar har den) och reklamrutan för personliga brev i samma spalt. Skiss `sidor/brev-artikel.html`, not `noter/brev-artikel.md`. Artikelns text, rubriker, frågor och länkar rörs inte, och ingen mdx-fil ändras. Visaren har inga rubriker. Nästan allt nedan står redan i dag: det nya är en länk och bildens ord i reklamrutan.

### Visaren i spalten (`.mv`, `data-mv-kontext="artikel"`)

| Plats | Lydelse | Not |
|---|---|---|
| Etiketten överst (`.mv-kick`, stycke) | Samma brev i fem mallar | Står kvar (`VISARE_TEXT.kick`). |
| Miniatyrraden, `aria-label` | Välj mall | Står kvar. Varje miniatyr: Mallen Linne, och så vidare. Raden står över arket på telefon. |
| Arket, `aria-label` | Personligt brev för säljare i mallen Linne | Står kvar (`arkTitel`). Yrket ur artikelns exempel. |
| Namnraden (`.mv-namnrad`, stycke) | **Linne.** Gratis, även som Word. | Står kvar, ur katalogen. |
| Textlänken (`.mv-lank`) | Skriv ditt eget brev | Står kvar. Ingen fylld knapp i artiklarna. Länken får `?mall=<vald mall>` om startflödet tar emot mallen (SEO: JA). |
| Fotraden (`.mv-fot`) | Det här är fem av 40 mallar. Med ett konto provar du alla med ditt eget brev. | Står kvar ordagrant. |
| Ny länk efter fotraden | Se alla 40 brevmallar | SEO, ordagrant. Till `/verktyg/personligt-brev`, inte `/cv-mallar`. Talet ur `BREV_MALL_ANTAL`. Skissens "Se alla 40 mallar" står inte. 22 tecken, på egen rad på telefon. |

### Läs brevet som text (`details.mv-text`)

| Plats | Lydelse | Not |
|---|---|---|
| `summary` | Läs brevet som text | Står kvar (`lasSomText`). Utfälld från start, som i dag (SEO). Ingen rubrik. |
| Huvudraden | **Marcus Lindqvist** till Telia Sverige AB / Ansökan: Account Manager B2B | Står kvar, ur artikelns exempeldata. Formen "namn till företag" och "Ansökan: roll" som i dag. |
| Brevets text | Står kvar ord för ord, i HTML från start. | Artikelns data. Tal och procenttecken i brevet rörs inte. |

De tre artiklarna som visar motorns exempelbrev har ingen "Läs brevet som text". I övrigt är visaren densamma.

### Reklamrutan för personliga brev (`aside.reklam`)

Rutans ord hör till reklamkorten och står i sektionen `artikelreklam`. Här står bara det som gäller formen i den här skissen.

| Plats | Lydelse | Not |
|---|---|---|
| `aria-label` | Samma som rubriken, som i dag. | Skissens "Personliga brev hos Jobbcoach" står inte: koden sätter redan rubriken som namn. |
| `.ey` | Personliga brev | Står kvar. |
| Rubriken (`p.rub`, aldrig h-tagg) | Skriv det personliga brevet på annonsen, inte på mallen | Står kvar (SEO: rubriken är ett stycke). |
| Texten | Textbeslut REK-2. | Skissen har dagens mening "att läsa på skärmen, gratis". Den gäller inte. |
| `.knapp` | Skriv mitt personliga brev | Står kvar. 26 tecken, två över måttet: ryms på en rad i kortet på 375 px. Till `/skapa-brev/start` utan parameter, så att artikeln har kvar den länken (SEO). |
| Paketraden (`.paket`) | Textbeslut REK-2: "som PDF eller Word". | Skissen har "som PDF". Den gäller inte. |
| Bildens ark (`aria-hidden`) | Sara Lindström · Ansökan: projektledare · När ni söker en projektledare som håller ihop upphandling och tidplan känner jag igen mina senaste tre år, där jag ledde en ombyggnad inom budget på 42 miljoner. · Ni skriver att rollen kräver vana vid offentlig upphandling enligt LOU. Jag har drivit fyra sådana. | Nytt, exempel. Samma brev som på verktygssidan. Inga rubriker i arket. |
| Bildens märke (`.chip`) | 3 av 4 krav har fått svar | Nytt, exempel. 25 tecken. Formen som i kontot. |

### UX-kontrollen, den här sidan

- **Primär handling:** reklamrutans kopparknapp är artikelns enda fyllda knapp i den här delen. Visaren har en textlänk, så de två tävlar inte.
- **Två länkar till startflödet:** reklamrutans utan parameter och visarens med mallen. Båda leder till samma flöde, och det är avsikten.
- **Telefon:** brevet på arket går inte att läsa på 375 px och ska inte behöva det. "Läs brevet som text" är utfälld, och där står brevet i läsbar storlek.
- **Namnen:** Välj mall, mallarnas namn och nivåraderna är samma som på exempelsidorna och i kontot.

---

## brev-exempel

`/personligt-brev-exempel/[yrke]`, 89 sidor. Skiss `sidor/brev-exempel.html` (projektledare), not `noter/brev-exempel.md`. Nästan allt här är ny form runt gammal text. Brevets text, H1, alla H2 och H3, punkterna, tipsen, skrivguiden, de sex frågorna, title och description står kvar ordagrant på alla 89 sidor. Det nya är få rader, och de står här. Samma rader gäller `/cv-exempel/[yrke]` där mallen delas, med CV-sidans egna ord kvar.

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h1.h1`, `.varde`, `.lank`, de tre märkena | Står kvar ordagrant. | Märkenas tal ur `BREV_MALL_ANTAL`. |
| `.knapp` (primär) | Använd som mall | Står kvar. Länken ska vara exakt `/skapa-brev/start?yrke=<yrke>`, utan `&mall=` (SEO). |
| Bilden (`.exbild`) | `aria-hidden`. Lapparna är rubrikerna ur yrkets egna punkter, inga nya ord. | Bara i brett läge. På telefon kommer brevet direkt. |

### Papperet och kommentarerna (`.exrad`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2.h2`, `.varde` | Står kvar ordagrant. | SEO: NEJ till att byta "Komplett exempel på 60 sek". Rubriken står på alla 89. |
| Brevet (`.expapper`) | Står kvar ord för ord, serverrenderat. | Bara sättningen är ny. Namnet är ett stycke. |
| Siffrorna vid styckena, `aria-label` | Not 1 | Står kvar, mönstret gäller alla. Saknar yrket ankare ritas kommentarerna utan siffror (SEO). |
| Knappen under brevet | Byt mall | Står kvar. De fem miniatyrerna i knappen har tomt `alt`. |
| Märkena under brevet | Exempelbrev · En A4 · Cirka 330 ord | Står kvar. Ordtalet räknas som i dag. |
| Kommentarernas rubrik och `aria-label` | Rekryterarens kommentarer | Står kvar. Stycke, ingen h-tagg. |
| Kommentarskortet | Ditt brev på din annons · Klistra in annonsen, så skriver vi ett utkast utifrån ditt CV. · Använd som mall | Står kvar. Länken exakt `/skapa-brev/start?yrke=<yrke>` (SEO). |

### Öppet läge, visaren (`.mv`)

| Plats | Lydelse | Not |
|---|---|---|
| Tillbakaknappen | Visa exemplet igen | Står kvar. |
| Miniatyrraden, `aria-label` | Välj mall | Står kvar. Varje miniatyr: Mallen Linne, och så vidare. |
| Arket, `aria-label` | Personligt brev för projektledare i mallen Linne | Står kvar (`arkTitel`). |
| Namnraden (`.mv-namnrad`, stycke) | **Linne.** Gratis, även som Word. | Står kvar, läses ur katalogen. |
| `.knapp` i sockeln | Använd som mall | Ny lydelse, 15 tecken. Till `/skapa-brev/start?yrke=<yrke>&mall=<vald mall>`. Gäller bara om startflödet tar emot mallen (BYGGBRIEF beslut 6). Annars står dagens "Skriv ditt eget brev". |
| Fotraden (`.mv-fot`) | Det här är fem av 40 mallar. Med ett konto provar du alla med ditt eget brev. | Står kvar ordagrant. Talen ur `fotrad()`. |
| Ny länk efter fotraden | Se alla 40 brevmallar | SEO, ordagrant. Till `/verktyg/personligt-brev`, inte `/cv-mallar`. Talet ur `BREV_MALL_ANTAL`. Skissens "Se alla 40 mallar" står inte. |
| Kommentarskortets länk när visaren är öppen | Skriv brevet på din annons | Står kvar (`skrivPaAnnons`). |

### Det här gör brevet starkt och Tips (`.varfor`, `.tips`)

| Plats | Lydelse | Not |
|---|---|---|
| Etiketter, rubriker, ingresser, punkter och tips | Står kvar ordagrant. | |
| Kortens siffror | Samma siffror som vid kommentarerna och på papperet. | Inga nya ord. |
| Exempelmeningen i ett tips, i egen ruta | Ingen ny text och ingen etikett på rutan. | SEO: bara om alla ord står kvar. Passar regeln inte ett yrke står texten som stycke. |

### Skrivguiden (`.guide`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2.h2`, de tre styckena | Står kvar ordagrant. | |
| Bildens etikett (`.delar .ey`) | Brevets tre stycken | Ny bild, `aria-hidden`. Skissen säger "Brevets tre delar" med Inledningen, Huvuddelen, Avslutningen. Här står samma namn som på `/verktyg/personligt-brev`, så att brevet inte har två uppsättningar ord. |
| Del 1 | **Öppningen** Visa att du läst annonsen, med deras egna ord. | Samma rad som på verktygssidan. |
| Del 2 | **Mitten** Varför just du, med en siffra per påstående. | |
| Del 3 | **Avslutet** Ett tydligt nästa steg, inte ett tack. | |

### Frågorna (`.faq`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, de sex frågorna och svaren | Står kvar ordagrant. | H2 "personligt brev för projektledare" får stor bokstav med CSS (`text-transform` på första bokstaven). Texten i HTML rörs inte (SEO). |

### Skapa hela ansökan (`.ansokan`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2.h2`, `.varde`, de två kortens `h3`, texter och länkar, raden under | Står kvar ordagrant. | |
| Märket på brevkortet | Du är här | Står kvar. |
| Nytt märke på CV-kortet | Samma person | 12 tecken. Skissens "Samma person, samma mall" står inte: ingen har kontrollerat att CV-exemplet visas i samma mall på alla 89 sidor. |
| Kortens miniatyrer | Tomt `alt`. | Dekor. Kortets `h3` och länkrad bär innehållet. |

### Fler exempel (`.yrken`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2.h2`, `.varde`, kortens bransch, yrke och länkrad | Står kvar ordagrant. | Talet i ingressen ur `BREV_GALLERI.length`. |
| Kortens brevminiatyr | Tomt `alt`. | En gemensam Linne-miniatyr (SEO). |

### Slutet (`.o`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2.h2`, knappen, raden under | Står kvar ordagrant. | Knappen "Skriv personligt brev som projektledare" är 39 tecken och bryts på två rader på 375 px, som i dag. |
| `.varde` | Ladda upp ditt CV, klistra in jobbannonsen och välj mall, så är det klart på några minuter. Skräddarsytt för projektledare och optimerat för rekryteringssystem. | SEO: JA. Bara "en minut" blir "några minuter". Yrket ur datan. Gäller alla 89 sidor och CV-exemplens slut om meningen delas. |
| Bilden, `aria-label` | Exempel: en annons och det personliga brevet som svarar på dess krav | Ny bild (`delar/brevpar.html`). Inga rubriker i arket. |
| Bildens annonslapp | Projektledare, Sweco · Offentlig upphandling, LOU · Budgetansvar · Tidplan och uppföljning · PMP-certifiering | Exempel. Samma för alla yrken. Det fjärde kravet är märkt som obesvarat. |
| Bildens bricka (`.svav`) | **3 av 4** krav har fått svar | Exempel. |

### UX-kontrollen, den här sidan

- **Primär handling:** "Använd som mall" heter knappen i hjälten, i kommentarskortet och i visaren. När visaren är öppen är dess knapp den fyllda och kommentarskortets blir textlänken "Skriv brevet på din annons". En kopparknapp per skärmyta håller i båda lägena.
- **Namnen:** Byt mall, Välj mall och mallarnas namn är samma som i kontots Mallar. "Brevets tre stycken" med Öppningen, Mitten och Avslutet är samma ord som på verktygssidan.
- **Telefon:** inga nya texter är längre än sin plats. Länken "Se alla 40 brevmallar" står på egen rad efter fotraden, 22 tecken.
- **Det som inte skrivs:** H2 "Komplett exempel på 60 sek" och descriptionens "Skriv ditt brev på 2 minuter" står (SEO: NEJ). Miniatyrerna visar Erik Lindberg som i dag.

---

## brev-exempelnav

`/personligt-brev-exempel` och de tio kategorisidorna under `/personligt-brev-exempel/kategori/`. Skiss `sidor/brev-exempelnav.html`, not `noter/brev-exempelnav.md`. H1, de fem H2, alla 89 H3 med sina rader, guidens fyra H3, de nio frågorna, title och description står kvar ordagrant. `/cv-exempel` delar komponent och följer med i petrol, med sina egna ord kvar. Här står bara det som är nytt, och de två svar som SEO har sagt ja till att ändra.

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| Brödsmulor, `.ey`, `h1.h1`, `.varde` | Står kvar ordagrant. | Talet 89 ur datan som i dag (SEO). |
| Sökfältets platshållare | Sök ditt yrke, till exempel lärare | Står kvar. Fältets `aria-label` "Sök yrke" står kvar. |
| `.knapp` (primär) | Hitta exemplet | Står kvar. 14 tecken. |
| Situationsraden | Din situation · Student · Utan erfarenhet · Karriärbyte · Chef | Står kvar, samma fyra länkar. `aria-label`: Välj efter situation. |
| Bilden (`.brevbunt`) | `aria-hidden`, miniatyrerna med tomt `alt`. | |
| Bildens yrkeslappar | Undersköterska · Lärare · Projektledare | Nya, i den dolda bilden. Yrken som finns bland de 89. |
| Bildens bricka (`.svav`) | **89** yrken, ett färdigt brev var | Ny. 26 tecken. Talet ur datan. |

### Branscherna (`.lyft`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Välj bransch | Ny etikett. 12 tecken. |
| Rubrikrad (`p`, inte h-tagg) | Tio branscher. Hitta den som är din. | Ny. Stycke med rubrikstil, så att rubrikträdet står orört. "Tio" räknas ur katalogen. |
| `nav`, `aria-label` | Filtrera efter bransch | Står kvar. |
| Första brickan | **89** Alla yrken | Står kvar ("Alla yrken 89"). Talet ur datan. |
| Första brickans underrad (`small`) | Hela listan står här nedanför | Ny. |
| De tio branschbrickorna | Butik, restaurang och service · Vård och omsorg · Ekonomi och HR · Utbildning och pedagogik · Administration och offentlig sektor · IT och utveckling · Lager, logistik och transport · Teknik och industri · Hantverk, bygg och fastighet · Student och första jobbet | Namnen står kvar ordagrant, samma tio länkar (SEO). Antalen ur datan, största först. |

### De 89 korten (`.yrken`) och CV-ön (`.cvrad`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Alla exempel | Ny etikett. 12 tecken. |
| `h2.h2`, `.varde`, kortens bransch, yrke (`h3`), rad och länkrad | Står kvar ordagrant, i dagens ordning. | |
| Kortens brevminiatyr | Tomt `alt`. | SEO: en gemensam Linne-miniatyr, dekor. Inte 89 olika bilder. |
| Tomt sökresultat | Inga yrken matchar sökningen. Prova ett närliggande yrke eller välj en bransch ovan. | Står kvar. |
| CV-ön: `h2`, text, knapp | Står kvar ordagrant. | "Behöver du även CV?", "Bläddra CV-exempel". Talet ur datan. Miniatyren `aria-hidden`. |

### Guiden (`.guide`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2.h2`, `.varde`, de tre första svaren, raden "Redo att börja?" | Står kvar ordagrant. | |
| Bildens etikett (`.jamfor .ey`) | Mall och exempel | Ny. |
| Bildtext 1 (`figcaption`) | **Mallen** En tom struktur. Du fyller den själv. | Ny. |
| Bildtext 2 | **Exemplet** Samma struktur, ifylld för ett yrke. | Ny. Bilden har tomt `alt`, bildtexten bär innehållet. |
| Den tomma mallens tre fält | Inledning · Huvuddel · Avslutning | Ny, `aria-hidden`. Orden finns i guidens tredje svar. |
| Märken i andra svaret (`.tredelar`) | 1 Inledningen · 2 Kopplingen till annonsens krav · 3 Avslutningen | Nya märken. Samma ord som i stycket över. |
| Fjärde svaret, `h3` | Är mallar för personligt brev gratis? Kan jag ladda ner dem? | Står kvar (SEO). Raderna nedan gäller brevnavet. `MallarGuideSection.tsx` delas med `/cv-exempel`, vars svar inte ändras här. |
| Fjärde svaret, stycke 1 | Alla 89 exempel är gratis att läsa och använda som mall för ditt eget brev. Du behöver inget konto för det, och vi tar inte betalt för innehållet. | SEO: skissens lydelse med orden gratis, mall och ladda ner kvar i svaret. Skissens första stycke saknade "mall", därför "använda som mall". Talet ur datan. |
| Fjärde svaret, nivåraderna (`.nivaer`) | Gratis: Läsa alla 89 exempel, utan konto · Gratis: Skriva ditt första brev och kopiera texten · Premium: Ladda ner brevet som PDF eller Word | Nya rader. Märkena heter Gratis och Premium. |
| Fjärde svaret, stycke 2 | Vill du ladda ner ditt eget brev som fil skriver du det i [vårt brevverktyg](/verktyg/personligt-brev). Första brevet är gratis, sedan ett var sjunde dag, och texten kopierar du fritt. Att ladda ner brevet som PDF eller Word ingår i Premium. | Ny lydelse. Länken och ankartexten "vårt brevverktyg" står kvar som i dag. Dagens "ladda ner det som färdig PDF. Det är gratis att börja" lästes som att nedladdningen var gratis. |
| Fjärde svaret, stycke 3 | Står kvar ordagrant. | "Om du hellre vill jobba i Word direkt ... Garamond eller Calibri ..." (SEO). Skissens "från ett exempel" står inte, dagens "från en mall" står. |

### Frågorna (`.faq`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2.h2`, `.varde`, de nio frågorna, åtta av svaren | Står kvar ordagrant. | De tre länkarna i svaren står kvar. |
| Svaret på "Kan jag använda samma personliga brev för flera jobb?", sista meningen | Det tar bara några minuter extra, och rekryteraren ser att brevet gäller just den tjänsten. | SEO, ordagrant. Ersätter "Det tar bara några minuter extra och dubblar dina chanser." Samma mening i FAQPage (`LD_UNDANTAG`). |

### Slutet (`.o.slut`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Skriv ditt eget | Ny etikett. 15 tecken. |
| `h2.h2`, `.varde`, de två länkarna | Står kvar ordagrant. | "Klar att skriva ditt eget brev?", "Skapa brev gratis" (17 tecken), "Tillbaka till hubben". |
| Ny rad under knapparna (`.liten`) | Första personliga brevet är gratis, sedan ett var sjunde dag. | Ny. |
| Bilden | `aria-hidden`, tomt `alt`. | |

### Kategorisidorna (`/personligt-brev-exempel/kategori/[kategori]` och `/cv-exempel/kategori/[kategori]`)

Sidorna får navets form (BYGGBRIEF beslut 7). H1 "Personligt brev-exempel för {bransch}", H2 "{n} yrken inom {bransch}", H2 "Behöver du även CV?", H2 "Hittade du inte ditt yrke?", deras texter, länkarna och schemat står kvar ordagrant.

| Plats | Lydelse | Not |
|---|---|---|
| Lyftkortet, `.ey` | Välj bransch | Samma som i navet. Den egna branschen är den mörka brickan. |
| Lyftkortet, rubrikrad (`p`) | Tio branscher. Hitta den som är din. | Samma som i navet. |
| Brickan "Alla yrken", underrad | Tillbaka till hela listan | Ny. Länken går till navet. I navet står "Hela listan står här nedanför". |
| Yrkeskorten | Bransch, yrke (`h3`), rad och länkrad ur navet. | Raden är ny här, kategorisidan har bara yrkesnamnet i dag. Orden finns redan i datan, inga nya skrivs. |
| Vårdens ingress, talet | för 17 yrken inom vård, omsorg och socialt arbete | SEO: talet ur datan i stället för "20+". Resten av ingressen står ordagrant. Gäller också `/cv-exempel/kategori/vard`, som läser samma text: räkna branschens yrken i den typ sidan visar. |

### UX-kontrollen, den här sidan

- **Primär handling:** sökfältet med "Hitta exemplet" är hjältens enda kopparknapp. Branschbrickorna och situationsraden är länkar utan knappform. I slutet är "Skapa brev gratis" kopparknappen, och CV-öns knapp är vit.
- **Dolt innehåll:** sökfältet och branschvalet döljer kort som redan står i HTML:en. Inga kort ritas av skriptet (SEO, villkor 3).
- **Mått:** de nya etiketterna är högst 15 tecken. Branschnamnet "Administration och offentlig sektor" är 35 tecken och är sidans längsta bricka: kontrollera att det bryts på två rader och inte sticker ut på 375 px.
- **Ord att se över, men inte ändra nu:** "Tillbaka till hubben" och "hub-sidan" är våra interna ord. De står kvar eftersom texten finns i dag. Föreslås till textspåret: "Alla exempel".

---

## cv-analys

`/verktyg/cv-analys`. Skiss `sidor/cv-analys.html`, not `noter/cv-analys.md`. Nästan all text på sidan är redan bestämd i `textbeslut.md` (CVA-1 till CVA-12, B1, B2) och står i koden sedan `408efd94`: H1, etiketten, ingressen, de fyra stegen, de sju delarnas texter, de nio frågorna med svar, slutblockets rubrik och text, mini-analysens rader. Den texten gäller ordagrant, också där skissen har en kortare variant. Här står bara det som återstår.

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.chip-vagg` över rubriken | Gratis för varje CV | Textbeslut B-1. Står utanför `h1`. |
| `h1`, med `.over` | CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del | SEO: elementets text ska vara exakt den här, med kolon, i DOM:en. Första ledet "CV-analys med läsbarhetspoäng:" får ligga i `.over` och formas med CSS. Kolonet får döljas visuellt, aldrig med `aria-hidden`. |
| `.varde` | Som i dag: ingressen och den feta meningen. | Skissens tillägg "Poängen och genomgången är gratis för varje CV." står inte i ingressen. Chipet och tredje talbrickan säger det. |
| `.knapp` | Analysera mitt CV | Står kvar. 17 tecken. Till `#mini-analys`. |
| `.lank` | Så fungerar det | Står kvar. Skissens "Så räknas poängen" används inte. |
| Talbrickorna | Som i dag: 7 delar i genomgången, 100 poäng att nå, 0 kr för poängen, varje CV. | Sjuan ur poängmodellen. |
| Arket, `aria-label` | Exempel: Saras CV med genomgångens sju delar utmärkta. Läsbarhetspoängen är 93 av 100. | Bilden bär `role="img"`. Namnet Sara Lindström på arket är ett stycke. |
| `.chip.kvar` | 7 poäng kvar till 100 | Exempel. Rubrikens form i kontot. |
| `.svav.poang` | 93 · av 100 i dag | Exempel. Talen räknas med `poangForRad` på Saras exempel-CV om det går, annars 93 (textbeslut TEL-1). |
| `.svav.fynd` | Erfarenhet · 30 av 35 · Flera punkter börjar inte med vad du gjorde. Jobbcoachen föreslår nya. | Exempel. Erfarenhet tappar på punkternas verb, aldrig på saknade siffror (textbeslut Del 4 punkt 2). |

### Prova utan konto (`.lyft`)

Mini-analysens egna texter (rubrik, stycke, knappen "Välj din CV-fil", resultatet med "Det viktigaste att ändra först" och "I kontot ser du", rutan "Se hela genomgången, del för del") står kvar ordagrant.

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Prova utan konto | Ny. |
| `.slapp-yta`, rad över knappen | Släpp din CV-fil här | Ny. Bara om ytan tar emot en släppt fil. Annars står knappen ensam. |
| `.liten` under knappen | PDF, Word eller ren text. Högst 5 MB. | Ny. Stämmer med `ACCEPT` och `MAX_FILE_BYTES`. |
| Högerspalten, `.ey` | Det här får du se | Ny. Stycke, ingen rubrik. |
| `.slapp-far` 1 | **Din läsbarhetspoäng av 100** Varje poäng går att peka på i ditt CV. | Ny. |
| `.slapp-far` 2 | **Det viktigaste att ändra först** En sak, i klartext. | Ny. Skissens "Delen där du tappar mest" får inte stå (textbeslut B-2): provet lämnar inte ut delen. |
| `.slapp-far` 3 | **Hela genomgången i ett gratiskonto** Alla sju delar, för varje CV du sparar. | Ny. |
| `.liten` sist | Är din PDF inskannad? Skapa ett gratiskonto, så läser vi av bilden. Bildläsningen läser svenska. | Ny. SEO: ja. |

### Så fungerar det (`.vagsteg`)

Rubrik, ingress, de fyra H3 och stegens texter står som i koden (HowTo ordagrant). Skissens `.ey` med samma ord som rubriken stryks. Inget nytt.

### Sju delar som ger din läsbarhetspoäng (`.hundra`, `.delar`)

Rubrik, ingress, de sju H3 med maxpoäng och texter, och noten under står som i koden. Ingressen får inte tillägget "med Saras CV som exempel" (textbeslut CVA-1). Stapeln och exempelraderna är nya.

| Plats | Lydelse | Not |
|---|---|---|
| `.hundra`, `aria-label` | Så fördelas de hundra poängen: Kontaktuppgifter 10, Personbeskrivning 15, Erfarenhet 35, Kompetenser 12, Utbildning 8, Språk 5, Datum, ordning och längd 15 | Namn och tal ur poängmodellen (`KATEGORIER`). |
| Rad under stapeln (`.liten`) | Exempel: Saras CV har 93 av 100. Hon tappar fem poäng i Erfarenhet och två i Språk. | Ny. Förklarar de två kopparfärgade bitarna. |
| Erfarenhet, tillägg sist i kortet | Exempel: Sara har 30 av 35. Flera punkter börjar inte med vad hon gjorde. | Ny. Läggs efter delens text, som egen rad. |
| Språk, tillägg sist i kortet | Exempel: Sara har 3 av 5. Nivån saknas på ett av språken. | Ny. |
| Maxpoängen i varje rad (`.max`) | 10 poäng · 15 poäng · 35 poäng · 12 poäng · 8 poäng · 5 poäng · 15 poäng | Som i dag, ur modellen. |

### Vägen till 100 poäng (`.vagen`), ny sektion

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Gratis och Premium | |
| `h2.h2` | Vägen till 100 poäng | SEO, ordagrant. |
| `.varde` | **Poängen och genomgången är gratis.** Jobbcoachens förslag tar dig en bit på vägen, resten fyller du i själv. | Skissens "Förslagen gör jobbet åt dig" lovar för mycket: en språknivå eller en siffra kan ingen skriva åt dig. |
| `.tillhundra`, `aria-label` | Exempel: 93 poäng i dag. Jobbcoachens förslag ger 5 till, och 2 fyller Sara i själv. | |
| `.forklaring` | I dag 93 · Jobbcoachens förslag +5 · Du själv +2 | Exempel. Orden som i kontot. |
| `.liten` | Varje CV har sin egen väg till 100. Du ser alltid hur många poäng som återstår och i vilken del de sitter. | |
| Kort 1, `h3` | Gratis för varje CV | Hela raden är rubriken, inget chip i den. |
| Kort 1, `.bockar` | Läsbarhetspoängen · Vad som saknas i alla sju delar · Jobbcoachens förslag en gång per konto, med det tyngsta förslaget öppet | |
| Kort 2, `h3` | Jobbcoach Premium | |
| Kort 2, chip bredvid rubriken | 149 kr i månaden | Ur `PLANS`. Utanför `h3`. Inga kampanjord. |
| Kort 2, `.bockar` | Alla förslag från Jobbcoachen · Nya förslag när du har ändrat i CV:t · Ersätt ditt nuvarande CV med ett tryck | |

### Skrivtipsen (`.rutnat.r3`)

De fem H3 och deras texter står kvar ordagrant. Före och efter läggs till under texten, som en egen ruta (`.fore`). Etiketterna "Före" och "Efter" står synliga eller som dold text för skärmläsare.

| Plats | Lydelse | Not |
|---|---|---|
| Tips 1, `.fore` | Före: Duktig på försäljning · Efter: Ökade omsättningen 40 procent på 8 månader | Exempel. Samma exempel som i tipsets text. |
| Tips 2, `.fore` | Före: Ansvarig för införandet · Efter: Ledde införandet för 40 handläggare | Exempel. |
| Tips 3, `.fore` | Annonsen skriver budgetansvar · Före: Hade hand om ekonomin · Efter: Budgetansvar för avdelningen | Exempel. Skissen har inget här. Får utgå om kortet blir för högt. |
| Tips 4 och 5 | Ingen ruta. | Rådet går inte att visa som före och efter. |
| Sjätte kortet (`.kort-ton`), `h3` | Se hur andra har gjort | Nytt kort. |
| Sjätte kortet, text | CV-exempel för 89 yrken, skrivna för svenska rekryterare. | Talet ur exempeldatan, inte för hand. |
| Sjätte kortet, `.lank` | Se CV-exempel | Ny länk till `/exempel`. Slutblockets länk "Se CV-exempel först" står kvar. |

### Premium (`.premium`)

Etiketten (namnet med priset), rubriken "Alla förslag, och nya när du har ändrat.", texten och de två knapparna står som i koden.

| Plats | Lydelse | Not |
|---|---|---|
| `.pris` | 149 kr · i månaden, säg upp när du vill | Ur `PLANS`. |
| `.bockar` 1 | Alla förslag, och nya efter varje ändring | Ny. |
| `.bockar` 2 | 40 CV-mallar, 26 av dem också som Word | Ny. Talen ur `TEMPLATE_COUNT` och `WORD_TEMPLATE_COUNT`. |
| `.bockar` 3 | Rekryteringstester, personliga brev, Jobbsöket och Jobbcoachen | Ny. Skissens "jobbmatchning" byts mot Jobbsöket (textbeslut B-8). |

### Frågorna (`.faq`)

De nio frågorna och svaren står som i koden, i kodens ordning. Skissens kortare svar gäller inte. Svaret på "Är mitt CV säkert hos er?": ägarens, skrivs inte, står ordagrant som i dag.

| Plats | Lydelse | Not |
|---|---|---|
| Knappen efter frågorna | Analysera mitt CV | Står kvar. |

### UX-kontrollen, den här sidan

- **En primär handling:** "Analysera mitt CV" leder alltid till uppladdningen på sidan. I lyftet är "Välj din CV-fil" kopparknappen, och den är sidans första handling.
- **Namnen** stämmer med kontot: läsbarhetspoäng, "N poäng kvar till 100", Jobbcoachens förslag, Du själv, Ersätt mitt nuvarande CV. Aldrig ATS-poäng, aldrig "kör om analysen", aldrig "samma CV ger alltid samma poäng".
- **Exemplet** är ett och samma på hela sidan: Sara har 93, tappar 5 i Erfarenhet och 2 i Språk. Räknas talen om med `poangForRad` ska alla sex ställen följa med (hjälten, stapeln, de två exempelraderna, Vägen till 100).
- **En nedladdning är gratis** (`FREE_CV_EXPORTS`). Ingen ny rad på sidan säger att nedladdning kräver Premium.

---

## cv-mallar

`/cv-mallar` med stilsidorna (`/cv-mallar/word`, `/cv-mallar/foto`, `/cv-mallar/enkla`). Skiss `sidor/cv-mallar.html` med delarna `cv-mallar-yrken`, `cv-mallar-alla`, `cv-mallar-word` och `cv-mallar-faq`, not `noter/cv-mallar.md`. Sidan har den hårda regeln (`HARD_SIDOR`): H1, de elva H2, alla H3 (74 yrken, 26 Word-mallar, fyra steg, åtta fördelar, fyra i guiden), all löptext, de 21 frågorna och varje länk står kvar ordagrant. En enda mening byts, i steg 2. Allt annat här är nya etiketter, märken, tal och knappar runt den text som redan finns.

Alla tal på sidan läses ur datan: `TEMPLATE_COUNT`, `FREE_TEMPLATE_COUNT`, `PREMIUM_TEMPLATE_COUNT`, `WORD_TEMPLATE_COUNT`, antalen per form och stil ur `src/lib/cv/mallval/katalog.ts` och `src/lib/seo/cv-kluster.ts`, yrkena och grupperna ur `yrkesmall-data.ts`, exemplen ur exempeldatan. Talen nedan är dagens.

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h1`, `.varde` | Som i dag. | Länkarna Linne och Björk i ingressen står kvar. |
| `.knapp` | Ladda upp ditt CV | 17 tecken. Ny knapp, ankare till mallväljaren i lyftet. |
| `.lank` | Se alla 40 mallar | Ny länk, ankare till "Alla våra CV-mallar". |
| `.bricka` 1 | **40** mallar, i fyra färger var | 27 tecken. |
| `.bricka` 2 | **2** gratis: Linne och Björk | 23 tecken. |
| `.bricka` 3 | **26** finns som Word | 14 tecken. |
| `.bricka` 4 | **15** har plats för foto | 19 tecken. |
| `.mallvagg`, `aria-label` | Åtta av de 40 CV-mallarna | Miniatyrerna har tomt `alt`, etiketten bär bilden. |
| Chip på Linne och Björk | Gratis | |

### Mallväljaren (`.lyft`)

Väljarens egna texter står kvar som i dag: Ladda upp ditt CV, Dra hit ditt CV, Välj fil, "PDF eller Word, högst 5 MB.", "eller skriv ditt namn och börja från början", Ditt namn, Din titel, Föreslagna för dig, Visa alla 40 mallar, Ladda ner PDF, och de fyra situationerna (Student, Utan erfarenhet, Karriärbyte, Chef) med sina länkar.

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Se ditt eget CV i mallarna | Ny. |
| Rubrikraden (stycke, ingen `h2`) | Ladda upp ditt CV | Står kvar. Ingen ny rubrik i lyftet. |
| Raden före situationerna | Börja från din situation | Står kvar. |
| `.visare`, `aria-label` | Exempel: Saras CV i mallen Linne, med valen för typsnitt, färg, ordning och format | |
| Mallens namn i visaren (stycke, inte `h4`) | Linne · Gratis | SEO: inga rubriker i instrumenten. |

### CV-mallar för ditt yrke (grupperna, `#yrken`)

Rubrik, ingress och de 74 yrkenas H3, texter, "Gratis eller i Premium" och "Se mall" står kvar. Alla 74 kort finns i serverns HTML från början och döljs med CSS eller `details` (SEO). Sektionen får ankaret `yrken`, som menyn länkar till.

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | 74 yrken i tio grupper | Ny. Båda talen räknas ur `yrkesmall-data.ts`. |
| `.sokfalt`, platshållare och `aria-label` | Sök ditt yrke | Ny. Fältet döljer kort, det ritar inga nya. |
| Sökfältet, när inget yrke matchar | Vi hittar inget yrke som heter så. Alla mallar passar alla yrken, så välj en mall längre ned. | Ny. Finns inte i skissen, behövs för det tomma läget. |
| Gruppernas namn (stycken, inga rubriker) | Vård · Utbildning · Student · Service · Ekonomi · Logistik · Hantverk · Tech · Teknik · Offentlig sektor | Kategorierna som de heter i datan. |
| Chipet bredvid gruppnamnet | 15 yrken | Antalet räknas. Med ett yrke skrivs "1 yrke", inte "1 yrken" som i skissen (Hantverk). |
| Knappen under en grupp | Visa alla 15 i Vård | Ny. 19 till 30 tecken beroende på grupp. Den längsta, "Visa alla 7 i Offentlig sektor", ryms inte i en knapp på 24 tecken: låt knappen fylla bredden på 375 px. |
| Samma knapp, utfälld | Visa färre | Ny. Finns inte i skissen. |

### Alla våra CV-mallar (`.filter`, `.mallnat`, Premiumremsan)

Rubrik, båda styckena med länkarna Linne och Björk, och de 40 mallkorten med sina länkar står kvar. Alla 40 kort finns i HTML:en, filtret döljer bara.

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Hela utbudet | Ny. |
| `.filter`, `aria-label` | Filtrera mallarna | Ny. |
| Filterchipsen | Alla 40 · Gratis 2 · Word 26 · Foto 15 · En spalt 17 · Sidospalt 5 · Rubriker i marginalen 4 · Konstnärlig 14 | Nya. Samma namn som filtret under Mallar i kontot. Antalen räknas. |
| Mallkortet | PDF och W · namnet · Gratis eller Premium · stilraden | Formatmärket, namnet och chipet står som i dag. Stilraden ("Klassisk och luftig", "Centrerad, med foto") läses ur katalogen. |
| Miniatyrens `alt` | CV-mallen Linne | Mallens namn efter "CV-mallen". |
| Premiumremsan, `.ey` | Jobbcoach Premium, 149 kr i månaden | Ur `PLANS`. |
| Premiumremsan, fet rad (stycke, ingen rubrik) | 38 mallar till ingår i Premium, med PDF i alla och Word i 26 av de 40. | SEO, ordagrant. Talen ur konstanterna. Skissens rad "och Word i alla 26 Word-mallar" gäller inte. |
| Premiumremsan, text | Du ser ditt CV i varje mall innan du bestämmer dig. | SEO, ordagrant. |
| Premiumremsan, villkorad mening | Du betalar först när du laddar ner en Premiummall. | Står bara om betalväggen faktiskt sitter vid nedladdningen i mallväljaren. Byggaren kontrollerar. Annars stryks den. |
| `.pris` | 149 kr · i månaden | |
| `.knapp` | Se vad som ingår | 16 tecken. Till `/priser`. |

### CV-mallar för Word (`.word-o`, `.wordnat`)

Rubrik, hela ingressen, de 26 H3 med texter och länken "Alla Word-mallar" står kvar. Alla 26 kort finns i HTML:en.

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Word | Står kvar. |
| `.docx`, bildens ord | .docx · 26 · mallar som Word-fil. Linne och Björk utan att betala något. | Ny. Talet ur `WORD_TEMPLATE_COUNT`. |
| Chip på Linne och Björk | Gratis som Word | Ny. Står bredvid rubriken, utanför `h3`, så att rubrikens text är "Linne" och "Björk" som i dag. |
| Knappen under korten på telefon | Visa alla 26 Word-mallar | 24 tecken. Ny. |
| Samma knapp, utfälld | Visa färre | Ny. |

### Så fungerar det (`.vagsteg`, HowTo)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, `.varde`, steg 1, 3 och 4, knappen "Bygg ditt CV nu" | Som i dag. | |
| Steg 2, `h3` | Fyll i dina uppgifter | Står kvar. |
| Steg 2, första meningen | Du skriver direkt på arket, avsnitt för avsnitt. | SEO, ordagrant. Ersätter "Formuläret leder dig genom varje avsnitt." Resten av stegets text står kvar. HowTo följer med (`LD_UNDANTAG`). |
| Stegens bilder | Tre mallar · arket med ett öppet avsnitt · samma CV i tre mallar · PDF och Word | `aria-hidden`. |

### Mer än en snygg layout (`.atta`)

De åtta H3 och texterna står kvar ordagrant. Bilderna är nya och `aria-hidden`, så deras ord räknas inte.

| Plats | Lydelse | Not |
|---|---|---|
| Byggda för rekryteringssystem, bild | 40 av 40 · lästes rätt | Samma sak som kortets mening "kom ut rätt i alla 40". Talet ur `TEMPLATE_COUNT`. Meningen i texten står kvar. |
| PDF, och Word i utvalda mallar, bild | PDF + Word · Word i 26 mallar | |
| Profilbild där det passar, bild | 15 | Antalet mallar med fotoplats. |
| LinkedIn synligt i sidhuvudet, bild | linkedin.com/in/sara-lindstrom | Exempel. |
| Redigera när du vill, bild | Sparat · i ditt konto | |

### Guiden, gratisavsnittet och PDF eller Word

All löptext, etiketterna (ATS-säkerhet, Branschmatchning, Erfarenhetsnivå, Mall eller exempel, Gratis, Filformat), de fyra H3, de tre mallslagen vi avråder från och varje länk står kvar ordagrant.

| Plats | Lydelse | Not |
|---|---|---|
| Guidens fyra bilder (`.abild`) | Arbetslivserfarenhet, Utbildning, Kompetenser, läses i rätt ordning · Klinisk erfarenhet, Pedagogisk erfarenhet, Behörigheter och körkort, tolv uppsättningar · Student, Mitt i karriären, Senior · Exemplet ger formuleringarna, mallen ger formen | `aria-hidden`. Orden står redan i löptexten bredvid. |
| De tre avrådda mallslagen, bilder | Tre små ark med felet utmärkt. | `aria-hidden`. Rubrikorden Textrutor, Tabeller för layout och Text i sidhuvudet står kvar som fet text. |
| Plattan "Hos oss är Linne och Björk gratis", miniatyrer | `alt`: CV-mallen Linne · CV-mallen Björk | |
| PDF, chip | Förvalet | Ny. |
| Word, chip | När annonsen ber om det | Ny. 23 tecken. |
| De stora orden PDF och Word | PDF · Word | Stycken, inga rubriker. |
| Filnamnsbilden | Dokument1.pdf · Anna-Andersson-CV.pdf | `aria-hidden`. Namnen står i stycket bredvid. |

### Mallar efter stil (`.stil3`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Efter stil | Ny. |
| Kortens tal | 26 · 15 · 17 | Nya stora tal över "CV-mallar i Word", "CV-mallar med bild" och "Enkla CV-mallar". Samma tal som i raden under, ur `cv-kluster.ts`. |
| Kortens namn, rad och "Se mallarna" | Som i dag. | Ankartexterna till de tre stilsidorna står kvar. |

### Frågorna och slutplattan

De 21 frågorna med svar står kvar ordagrant.

| Plats | Lydelse | Not |
|---|---|---|
| Slutplattan, `.ey` | CV-exempel | Ny. |
| Slutplattan, `h2`, text och knapp | Som i dag: "Letar du efter ett färdigt CV-exempel i stället?", texten med 89 och "Se CV-exempel". | Talet 89 ur exempeldatan (SEO). |
| `.bricka` 1 | **89** färdiga CV-exempel | 20 tecken. Ur datan. |
| `.bricka` 2 | **74** yrken med egen mallsida | 24 tecken. Ur `yrkesmall-data.ts`. |

### Stilsidorna (`StilSida.tsx`)

Samma mallkort, samma chip och samma `alt` som ovan. Ingen ny text. Rubriker, ingresser och frågor på de tre sidorna står kvar ordagrant.

### UX-kontrollen, den här sidan

- **En primär handling:** i hjälten och lyftet är det uppladdningen ("Ladda upp ditt CV", "Välj fil"). "Ladda ner PDF" i visaren är väljarens egen knapp och får vara koppar bara inne i visaren. Längre ned är kopparknappen "Bygg ditt CV nu" efter stegen och "Se CV-exempel" i slutplattan.
- **Dolt innehåll:** "Visa alla" öppnar kort som redan finns i sidan. Knappen säger hur många och i vilken grupp, och byter till "Visa färre".
- **Namnen** på filtren är kontots: Gratis, Word, Foto, En spalt, Sidospalt, Rubriker i marginalen, Konstnärlig.
- **Miniatyrerna visar Erik Lindberg**, arket i väljaren visar Sara. Det står som det är (SEO: miniatyrerna ändras inte). Ingen text på sidan nämner någon av dem vid namn utanför bilderna.
- **Gratis** betyder här två mallar och en nedladdning per konto, som PDF eller Word. Ingen ny rad säger "gratis nedladdning" utan den gränsen.

---

## funktioner

`/funktioner`. Skiss `sidor/funktioner.html`, not `noter/funktioner.md`. H1, alla H2, de fyra H3 under CV-avsnittet, de fem frågorna, alla länkar och de åtta ankarna står kvar. Löptexten per funktion läses ur `FUNKTIONER` i `paket-copy.ts` som i dag, med textbeslutets lydelser (GEM-7 till GEM-12, FUN-1 till FUN-11). Här står det som är nytt: hjältens fyra dörrar, raderna Gratis och Premium, de två korten i testblocket, mallväggen, avsnittet Sökta tjänster, korten Inför intervjun och Bli upptäckt, den tolfte brickan och Premiumytan.

### Hjälten (`.vagg.hjalte`, `.dorrar`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h1`, `.varde`, knappraden | Står kvar ordagrant som i koden. | Textbeslut FUN-11: "Byggt för svensk arbetsmarknad och för hur en rekryterare läser." Skissens "Det mesta provar du gratis." står inte. |
| `.dorrar`, `aria-label` | Funktionerna på sidan | Står kvar. |
| Dörr 1, namn (`.dr-namn`, stycke) | Rekryteringstester | Först och bredast. |
| Dörr 1, rad (`.dr-sak`) | Åtta testtyper i tre nivåer. Grundnivån är gratis. | Talet ur `TESTTYPER`. |
| Dörr 1, ankare | Rekryteringstester · Personlighetstestet | Båda till `#tester`. "Personlighetstestet" är nytt. |
| Dörr 2, namn | Personliga brev | |
| Dörr 2, rad | Skrivna mot kraven i annonsen. | |
| Dörr 2, ankare | Personligt brev | Till `#brev`. Ankartexten som i dag. |
| Dörr 3, namn | CV | |
| Dörr 3, rad | Läsbarhetspoäng av 100, och 40 mallar. | 40 ur `TEMPLATE_COUNT`. |
| Dörr 3, ankare | CV-analys · Skapa CV och mallar · LinkedIn-profilen | Till `#cv-analys`, `#cv-skapa-mallar`, `#linkedin`. Som i dag. |
| Dörr 3, bild | **93** av 100 | Exempel, `aria-hidden`. |
| Dörr 4, namn | Jobbsöket | |
| Dörr 4, rad | Annonserna som passar dig, och koll på varje sökt tjänst. | |
| Dörr 4, ankare | Jobbmatchning · Sökta tjänster · Jobbcoachen | Till `#jobbmatchning`, `#sokta-tjanster`, `#jobbcoachen`. Märket Nyhet står bredvid länken, inte i ankartexten. |

### Raden Gratis och Premium (`.niv`), alla avsnitt

Dagens rad "Ingår i Premium. Gratis: ..." delas i två rader med chip, gratis först. Gratisraden är dagens ord, Premiumraden är ny. Chipen heter Gratis och Premium.

| Plats | Lydelse | Not |
|---|---|---|
| Rekryteringstester, Gratis | Grundnivån i alla åtta testtyperna, ett test om dagen, med genomgång. Personlighetstestet med 50 påståenden. | Första meningen ur `GRUNDNIVAN_ALLA_DAG`. 50 ur `GRATIS_PASTAENDEN`. |
| Rekryteringstester, Premium | Avancerad nivå och expertnivå, övningsprov mot klockan, det fördjupade personlighetstestet och hela din testhistorik. | Ny. |
| Personliga brev, Gratis | Första brevet, sedan ett i veckan, att läsa och kopiera. De två senaste går att ändra. Nedladdning ingår inte. | Textbeslut FUN-5. Skissens kortare rad gäller inte. |
| Personliga brev, Premium | Personliga brev utan tak, alla 40 mallar, nedladdning som PDF eller Word och tonen vald åt dig efter annonsen. | Ny. 40 ur `BREV_MALL_ANTAL`. |
| CV-analysen, Gratis | Läsbarhetspoängen och genomgången i sju delar, för varje CV. | Textbeslut GEM-7. |
| CV-analysen, Premium | Alla Jobbcoachens förslag, nya förslag när du har ändrat och Ersätt mitt nuvarande CV. | Ny. "Ersätt mitt nuvarande CV" är knappens namn i kontot. |
| Matchade jobb, Gratis | Tre träffar, med skälen utskrivna. | Talet ur `FREE_TIER_JOB_LIMIT`. |
| Matchade jobb, Premium | De 25 bästa träffarna, med skälen utskrivna. | Ny. 25 ur `JOB_MATCHES_PER_RUN`. |
| Sökta tjänster, Gratis | Gratis för alla med konto. | Copys GEM-12, första ledet. |
| Sökta tjänster, Premium | Uppföljningsmejl till varje sökt tjänst och rapporten att skriva ut. | Copys GEM-12, andra ledet. |
| Jobbcoachen, Gratis | Tio meddelanden. | Talet ur `GRATIS_CHATTFRAGOR`. |
| Jobbcoachen, Premium | Fråga så mycket du vill. | Ny. |

### Rekryteringstester (`#tester`, `article.o`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Inför urvalstestet | Samma etikett som på startsidan. |
| `h2`, texten, stegen, knappen, länken till personlighetstestet | Står kvar ordagrant som i koden. | Stegen ur `FUNKTIONER`. Länktexten "Gör personlighetstestet utan konto" står kvar, inte skissens "Personlighetstestet, 20 påståenden utan konto". |
| Testramen, `aria-label` | Exempel: en uppgift i matrislogik som den ser ut i testet | Uppgiften ur banken. |
| Kort 1, `.ey` | Det här ingår | |
| Kort 1, `h3` | Åtta testtyper, tre nivåer | SEO har sagt ja. Talet ur `TESTTYPER`. |
| Kort 1, typerna | Matrislogik · Figurserier · Deduktiv slutledning · Verbalt resonemang · Numeriskt resonemang · Talserier · Spatial förmåga · Ordförråd | De publika namnen, de är sökorden. |
| Kort 1, trappan | Gratis: Grundnivå, ett test om dagen · Premium: Avancerad nivå, träna så ofta du vill · Premium: Expertnivå, och övningsprov mot klockan | |
| Trappan, `aria-label` | Tre nivåer: grundnivån är gratis, avancerad nivå och expertnivå ingår i Premium | |
| Kort 2, `.ey` | Efter testet | |
| Kort 2, `h3` | Resultatet, uppgift för uppgift | SEO har sagt ja. |
| Kort 2, ny rad under `h3` | Du ser varje uppgift med rätt svar, regeln bakom och var du gick fel. | Ny. Finns inte i skissen, som bara har bilden. |
| Kort 2, huvudtal | **12** av 15 rätt på grundnivån | Exempel. |
| Kort 2, listans `aria-label` | Exempel: uppgiftslistan med tolv rätt och tre fel | |
| Kort 2, förklaringen | Uppgift 9, förklaringen: hämtas ur samma bankuppgift som visas i testramen. | Skissens förklaring är påhittad. Går den inte att hämta: visa listan utan förklaringsruta. |

### Personliga brev (`#brev`, `article.o.vand`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, texten, stegen, knapp och länk | Står kvar ordagrant som i koden. | Sista steget enligt textbeslut GEM-9: "Redigera, ladda ner som PDF eller Word, skicka." Skissens "välj mall och skicka. Nedladdning ingår i Premium." gäller inte. |
| Tonraden (`.toner`), `aria-label` | Fem toner | |
| Tonraden | Professionell · Entusiastisk · Kreativ · Självsäker · Balanserad | Ny rad. Namnen som i kontot. |
| Brevparet, `aria-label` | Exempel: en annons och det personliga brevet som svarar på dess krav | Samma bild som på startsidan. |
| Svävande bricka | **3 av 4** krav har fått svar | Exempel. |

### CV-analysen (`#cv-analys`, `article.o`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, texten, stegen, knapp och länk | Står kvar ordagrant som i koden. | Textbeslut GEM-7. |
| Stapeln (`.sju`), `aria-label` | Sju delar: Kontaktuppgifter 10, Personbeskrivning 15, Erfarenhet 35, Kompetenser 12, Utbildning 8, Språk 5, Datum, ordning och längd 15 | Talen ur poängmodellen. |
| Rad under stapeln (`.sju-text`) | Sju delar, hundra poäng. I exemplet tappar Sara sju poäng, i två delar. | Exempel. |
| Svävande bricka | **93** av 100 i dag | Exempel. |
| CV-arket, `aria-label` | Exempel: Sara Lindströms CV med analysens sju delar utmärkta | |

### Skapa CV och mallarna (`#cv-skapa-mallar`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, de fyra H3 med text, knapp och länk | Står kvar ordagrant som i koden. | H3 enligt textbeslut FUN-7 och FUN-8: "Skriv CV:t direkt på arket", "Ladda ner som PDF eller Word". Skissen har de gamla rubrikerna. |
| Kort 2, tillägg sist i texten | Linne och Björk är gratis. | Ny mening. Namnen ur katalogen. |
| Kort 3, tillägg sist i texten | 15 av mallarna har plats för foto. | Ny mening. Talet ur katalogen. |
| Mallväggen, `aria-label` | Åtta av de 40 CV-mallarna | 40 ur `TEMPLATE_COUNT`. |
| Mallväggen, huvudtal | **40** mallar för CV och personliga brev | |
| Miniatyrernas `alt` | CV-mallen Linne · CV-mallen Björk · CV-mallen Koppar · CV-mallen Ritning · CV-mallen Kalksten · CV-mallen Terrakotta · CV-mallen Tidning · CV-mallen Siluett | Namnen ur katalogen. |
| Miniatyrernas bildtext | Mallens namn. Linne och Björk får märket Gratis. | |
| `.bricka` 1 | **2** gratis: Linne och Björk | 24 tecken. Ur `FREE_TEMPLATE_COUNT`. |
| `.bricka` 2 | **26** finns som Word | Ur `WORD_TEMPLATE_COUNT`. |
| `.bricka` 3 | **15** har plats för foto | Ur katalogen. |

### Jobbsöket (`#jobbsoket`, skog)

| Plats | Lydelse | Not |
|---|---|---|
| Etikett över H2 | Mer i Jobbcoach Premium, 149 kr i månaden | Textbeslut FUN-3, som SEO pekar på. Skissens "Jobbsöket" gäller inte. Priset ur `PLANS`. 39 tecken. |
| `h2` och ingressen | Står kvar ordagrant som i koden. | Textbeslut FUN-3. |
| Matchade jobb: `h2`, text, länk | Står kvar ordagrant. | "Så fungerar jobbmatchningen". |
| Träffen, `aria-label` | Exempel: två träffar i Matchade jobb | Matchgraden märks Exempel. |
| Sökta tjänster, `h2` (`#sokta-tjanster`) | Sökta tjänster | Ny H2, SEO har sagt ja. Ankaret flyttar hit från kortet under Alla verktyg. |
| Sökta tjänster, text | Den som söker många jobb tappar lätt bort vem som har svarat. Här sparar du annonsen du ska söka, med sista ansökningsdag, loggar den du har sökt och följer varje tjänst från Sökt till Erbjudande. Veckans mål håller takten uppe. Efter tolv tysta dagar föreslår vi ett uppföljningsmejl och skriver utkastet, som öppnas i din egen e-post. Vi skickar aldrig något åt dig. Månadens sökta jobb står sammanställda som underlag till aktivitetsrapporten hos Arbetsförmedlingen, och den lämnar du in själv. | Copys GEM-12, ordagrant. Läses ur det nya kortet i `FUNKTIONER`. "tolv" ur `NO_RESPONSE_NUDGE_DAYS`. |
| Sökta tjänster, `.veckomal` | Veckans mål: 2 av 3 sökta | Exempel. |
| Sökta tjänster, länk (`.knapp-vit`) | Så fungerar Sökta tjänster | SEO:s ankartext, ordagrant. 26 tecken, ryms utan ikon. Till `/verktyg/sokta-tjanster`. |
| Sökta tjänster, bildens `aria-label` | Sökta tjänster, från Ska sökas till Erbjudande | Copys bildtext i GEM-12, med "Exempel:" först om bilden visar Saras tjänster. |
| Jobbcoachen: `h2`, text, länk | Står kvar ordagrant. | Textbeslut GEM-11. "Så fungerar Jobbcoachen". |
| Samtalet | Samma exempel som på startsidan (sektionen start, Jobbcoachen). | Utan källmärke och utan belopp. |
| Kortet Inför intervjun, namn | Inför intervjun | Ny H3 om korten får rubriker, annars fet rad. Kortet är ingen länk: funktionen har ingen publik sida. |
| Kortet Inför intervjun, rad | Gratis: ett intervjuprov om dagen. Premium: utan dagsgräns. | Copys GEM-12, i den vända formen. |
| Kortet Inför intervjun, text | Svara på en intervjufråga och få återkoppling som från en rekryterare: vad som hördes, och vad som saknades. När du är kallad skriver du in när intervjun är, så står den under Intervjuer på gång med förberedelserna bredvid. Efteråt frågar vi hur det gick, och hör du inget på sju dagar påminner vi om att fråga efter besked. | Copys GEM-12, ordagrant. "sju" ur `INTERVJU_BESKED_DAGAR`. |
| Kortet Bli upptäckt, namn | Bli upptäckt | Länk till `/verktyg/bli-upptackt`. |
| Kortet Bli upptäckt, text | Låt rekryterare hitta dig. Du är anonym tills du själv tackar ja. | Ny. |

### LinkedIn (`#linkedin`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, texten, raden om Premium, knappen | Står kvar ordagrant. | |
| Kortet, `aria-label` | Exempel: rubriken på Saras LinkedIn-profil före och efter | |
| Kortets topp | Sara Lindström · Göteborg | Stycken, inga rubriker. |
| Före | Rubriken i dag: Projektledare på Nordanvind Energi. Hittas på: Nordanvind Energi | Exempel. Samma arbetsgivare som på CV-arket. |
| Efter | Rubriken efter omskrivningen: Projektledare bygg, offentlig upphandling enligt LOU, budgetansvar 40 miljoner. Hittas på: projektledare bygg, LOU, budgetansvar. Saknas: BAS-P | Exempel. Rubriken är dagens. |
| Rad under | Sammanfattningen skrivs om på samma sätt. Det som saknas hämtas ur annonserna i din bransch. | Dagens två rader, hopskrivna. |

### Alla verktyg, samlade (`#alla-verktyg`, tolv brickor)

| Plats | Lydelse | Not |
|---|---|---|
| `h2` och de elva brickorna | Står kvar ordagrant som i koden (`ALLA`), med tre byten nedan. | |
| Personlighetstest | Femfaktormodellen (Big Five): profilen rekryteraren jämför med, och frågorna du lär få. | SEO har sagt ja. "Big Five" står kvar. |
| Jobbmatchning | Din kompetens mot annonserna i Platsbanken, med skälen. | "alla annonser" blir "annonserna". |
| Bli upptäckt | Rekryterare hittar dig, anonymt tills du själv tackar ja. | SEO har sagt ja. |
| Ny bricka: Sökta tjänster | **Sökta tjänster** Håll koll på var varje ansökan står: sökt, svar, intervju, erbjudande. Gratis för alla med konto. | Första meningen är dagens, ordagrant (textbeslut FUN-4). Ankartexten är "Sökta tjänster". Till `/verktyg/sokta-tjanster`. Märket Nyhet står utanför länktexten och tas bort 2027-01-12. Står mellan Jobbmatchning och Bli upptäckt. |

### Premiumytan (`.premium`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Jobbcoach Premium | |
| Rubrikraden (`p.h2`, stycke) | Alla verktyg, alla nivåer, alla mallar. | Ingen H2. "Allt på den här sidan, utan tak." står inte (textbeslut Del 4 punkt 6). |
| `.pris` | 149 kr i månaden, säg upp när du vill | Ur `PLANS`. |
| `.knapp` | Se vad som ingår | Står kvar. Till `/priser`. |
| `.bockar` | Läses ur `HELA_PAKETET_RADER`. | Textbeslut GEM-4, sex rader. |

### Frågorna och slutet

Står kvar ordagrant: H2 "Vanliga frågor", de fem frågorna med svar enligt textbeslut FUN-1 och FUN-2 (svaret om säkerhet är ägarens, skrivs inte), knappen "Skapa konto gratis" och den fasta knappraden i telefonen.

### UX-kontrollen, den här sidan

- **En primär handling per skärmyta:** kopparknappen står i hjälten, i CV-avsnittet (Skapa CV), på Premiumytan och i slutet. Avsnitten har vita knappar med "Så fungerar det".
- **Namnen** stämmer med kontot: Matchade jobb, Sökta tjänster, Ska sökas, Inför intervjun, Intervjuer på gång, Jobbcoachen, Bli upptäckt, Ersätt mitt nuvarande CV.
- **Ryms:** etiketten "Mer i Jobbcoach Premium, 149 kr i månaden" är 39 tecken, på gränsen. Knapparna "Så fungerar Sökta tjänster" (26) och "Så fungerar jobbmatchningen" (27) är över riktmärket. Den andra finns redan i dag som länk. Bryter någon av dem på 375 px blir den textlänk med samma ankartext.
- **Dörrarna i hjälten** har nio ankare. På 375 px ska varje ankare vara minst 44 px högt, och Nyhet-märket får inte tvinga Sökta tjänster till två rader.

---

## inloggning

`/login` och `/auth/forgot-password`. Skiss `sidor/inloggning.html`, not `noter/inloggning.md`. H1 "Logga in", titeln, raden under rubriken, Google-knappen, fälten, länken "Glömt lösenordet?", knappen och "Har du inget konto? Skapa konto" står ordagrant. Beskeden läses ur `LOGIN` i `registrering-copy.ts` som i dag. Nytt är panelen bredvid kortet och en platshållare.

### Toppraden (`.topp`)

| Plats | Lydelse | Not |
|---|---|---|
| Frågan och länken | Har du inget konto? · Skapa konto | Står kvar. |

### Panelen bredvid kortet (`.tillbaka`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Ditt konto | Ny. |
| Rubrikrad (`p.h2`, stycke) | Allt ligger kvar där du lämnade det | Ny, SEO har sagt ja. Ingen H2: sidan har bara sin H1. |
| Block 1 | **Rekryteringstester** Dina resultat och din utveckling | "Din utveckling" heter vyn i kontot. |
| Block 2 | **CV** Dina CV och läsbarhetspoängen | Skissens "poängen i analysen" blir poängens namn. |
| Block 3 | **Personliga brev** Alla brev du har skrivit | |
| Block 4 | **Jobbsöket** Dina sökta tjänster och matchade jobb | |

Skissen har `aria-hidden` på de fyra blocken. De är text, inte dekor: ta bort `aria-hidden`, så läses de upp och räknas som ord på en sida som bara har 21.

### Beskeden i kortet (`.rad`)

| Plats | Lydelse | Not |
|---|---|---|
| Grön rad | Din e-post är bekräftad. Logga in nedan. | Står kvar. |
| Felrad (`role="alert"`) | **Inloggningen gick inte igenom** Fel e-postadress eller lösenord. | Står kvar. |

### Glömt lösenordet? (`/auth/forgot-password`)

| Plats | Lydelse | Not |
|---|---|---|
| Rubrik, underrad, fält, knapp, länkar, läget Mejl skickat | Står kvar ordagrant. | "Återställ lösenord", "Vi skickar en länk till din e-post", "Skicka återställningslänk", "Kom du ihåg ditt lösenord? Logga in", "Klart, kolla din inkorg", "Mejl skickat", "Tillbaka till inloggning". |
| Platshållaren i fältet | namn@exempel.se | Ersätter "din.email@example.com". Samma som i inloggningen. |
| Citaten | Första citatet enligt textbeslut AUTH-1. De två andra står kvar. | Skissen stryker dem. SEO: strykningen väntar på ägaren. |
| Talen "100% krypterat", "24 h" med flera | Ägarens, skrivs inte. Står kvar tills han har svarat. | Textbeslut B-30. Bygg kortet så att raden med tal går att ta bort utan att formen faller. |

### UX-kontrollen, den här sidan

- **En primär handling:** Logga in i kortet. Google-knappen är vit, och i läget Mejl skickat är "Tillbaka till inloggning" vit eftersom inget återstår att göra.
- **Namnen** i panelen är kontots: Rekryteringstester, CV, Personliga brev, Jobbsöket.
- **Telefonen:** kortet först, panelen under. Felraden står högst upp i kortet, före fälten, och är röd bara här: rött är ett fel, aldrig en dels färg.

---

## jobbcoachen

`/verktyg/jobbcoachen`. Skiss `sidor/jobbcoachen.html`, not `noter/jobbcoachen.md`. H1, de fem H2, de sexton H3, löptexten i stegen, områdena och källorna och de åtta frågorna med svar står kvar ordagrant som i koden (textbeslut JC-1, JC-2, B5). Nytt: samtalet i hjälten, det stilla svaret i lyftet, blocket om frågor utifrån läget, kvoten som bild och småtexterna i bilderna. Skissens nionde fråga byggs inte.

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Jobbcoachen, svar med källor | 28 tecken. I dag "svar med källa". Flertal, som i kontot. |
| `h1`, `.varde`, knapparna | Står kvar ordagrant. | "Fråga gratis" och "Så fungerar det". |
| `.bricka` 1 | **10 meddelanden** gratis per konto | Står som i dag. Talet ur `FREE_CHAT_MESSAGES_PER_ACCOUNT`. |
| `.bricka` 2 | **Källor** du kan kolla själv | 18 tecken. Ersätter "Källa till varje svar", som är osant (textbeslut B-19). |
| `.bricka` 3 | **6** svenska källor bakom svaren | 27 tecken. Ersätter "Sekunder till första svaret", som ingen har mätt. Talet är antalet källkort på sidan. |
| Samtalet, `aria-label` | Exempel: ett samtal med Jobbcoachen om att följa upp en ansökan | Inga rubriker i bilden. |
| Samtalets topp (stycke) | Jobbcoachen · Kan svensk arbetsmarknad | Skissens "Svarar med svenska källor" står inte: exemplet har inga källmärken. |
| Frågan (`.du`) | Vad skriver jag i ett uppföljningsmejl? | SEO och textbeslut JC-3, ordagrant. Det är också ett av kontots egna förslag (`coach.ts`). |
| Svaret (`.jc`) | Håll det kort. Säg vilken tjänst det gäller, att du fortfarande är intresserad och fråga när de räknar med att ge besked. Tre till fyra meningar räcker. Vill du att vi skriver ett utkast tillsammans? | SEO och textbeslut JC-3, ordagrant. Inga källmärken, inga källor under. Skissens svar med Arbetsförmedlingen och Unionen byggs inte. |
| Skrivfältet (`aria-hidden`) | Fråga vad du vill veta om jobb, lön, intervju eller arbetsrätt | Platshållaren i kontot. Kortas med tre punkter om den inte ryms; skriv inte en annan. |
| Kortet bredvid, `aria-label` | Exempel: frågor som Jobbcoachen föreslår utifrån läget i dina sökta tjänster | |
| Kortets rubrik (stycke) | Frågor utifrån ditt läge | Som i kontot. Ingen h-tagg. |
| Kortets underrad | Hämtade ur dina sökta tjänster. | Som i kontot. |
| Kortets rader | DA, Vad skriver jag i ett uppföljningsmejl? · PO, Vad frågar jag arbetsgivaren på intervjun? | Ordagrant ur `coach.ts`. Brickornas bokstäver är exempel. |

### Lyftet (`.lyft`, i dag den rullande demon)

Ett svar som står stilla. SEO: demo 2 i `JobbcoachenLiveDemo.tsx` står, den stämmer med 11 § LAS. Skissens exempel ("Hur lång uppsägningstid har jag?", "Lagen ger dig minst en månad") byggs inte.

| Plats | Lydelse | Not |
|---|---|---|
| Bilden, `aria-label` | Exempel: ett svar från Jobbcoachen med två källor | |
| Frågan | Min chef sa upp mig idag, vad har jag för rättigheter? | Ordagrant ur koden, demo 2. |
| Svaret | Tråkigt att höra. Enligt LAS måste arbetsgivaren ha saklig grund och uppsägningen gäller skriftligt (Källa 1). Uppsägningstiden är minst 1 månad om du jobbat under 2 år, och upp till 6 månader om du varit där 10+ år (Källa 2). Vill du att vi går igenom vad du bör begära innan du skriver under något? | Ordagrant ur koden, demo 2. Rörs inte. |
| Källorna | Källor · 1 LAS § 7 och § 11 · 2 Unionen Uppsägning | Ordagrant ur koden. |
| `.ey` | Prova själv | Ny. |
| Rubriken (stycke med `.h2`, ingen h-tagg) | Du ser var svaret kommer ifrån | Skissens "Varje svar visar var det kommer ifrån" står inte: källor visas när svaret bygger på kunskapsbasen (B-19). |
| Del 1 | **Ett kort svar i klartext** Några meningar, inte en rapport. Jobbcoachen frågar tillbaka när svaret beror på din situation. | Ny. |
| Del 2 | **Källan står i texten** Bygger svaret på kunskapsbasen är källan märkt i texten, så du ser vad som kommer ur lag, statistik eller avtal. | Ny. |
| Del 3 | **Källorna går att öppna** Under svaret ligger källorna som länkar. Du kan läsa själv innan du lutar dig mot svaret. | Ny. |
| `.knapp` | Skapa konto och fråga | 21 tecken. Till `/register`. Skissens "Skapa konto och fråga själv" är 27 tecken och ryms inte. |
| `.liten` bredvid knappen | Tio meddelanden gratis, utan kortuppgift | Talet ur `FREE_CHAT_MESSAGES_PER_ACCOUNT`. |

### Så fungerar det (`.vagsteg`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Stryks. | Upprepar rubriken. |
| `h2`, ingressen, fyra `h3` med text, knappen under | Står kvar ordagrant. | Knappen "Fråga Jobbcoachen gratis" är vit här. |
| Steg 1, bild (`aria-hidden`) | Hur svarar jag på frågan om svagheter? | Sidans egen exempelfråga. |
| Steg 2, bild (`aria-hidden`) | AF · SCB · Fack · FK · CSN · SKV | Monogram för de sex källorna. |
| Steg 3, bild (`aria-hidden`) | Enligt LAS måste arbetsgivaren ha saklig grund (Källa 1). · 1 LAS § 7 och § 11 | Ur demo 2. Skissens "Lagen ger dig minst en månad" står inte. |
| Steg 4, bild (`aria-hidden`) | Kan du säga det kortare? · Ja. Samma svar på två rader. | Skissens bubblor om sex års anställning påstår något om lag och står inte. |

### Frågor utifrån läget (`article.o` under stegen, nytt)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | När du inte vet vad du ska fråga | Ny. 32 tecken. |
| `h3` (satt som `.h2`) | Jobbcoachen föreslår frågor utifrån ditt läge | SEO: ny H3, ja. |
| `.varde` | Loggar du dina jobb under [Sökta tjänster](/verktyg/sokta-tjanster) ligger frågorna redan framme: en ansökan som har varit tyst, en intervju som närmar sig, ett avslag du vill ha återkoppling på. | Länken är SEO:s länk in till den nya sidan, ankartexten "Sökta tjänster". |
| Andra stycket | Du trycker på en fråga, så står den i fältet. Den skickas först när du själv vill. | |
| Ruta 1, rubrik (stycke) | Det här utgår svaren från | |
| Ruta 1, rader | Din målroll, ort och bransch ur profilen · CV och personliga brev som du själv delar i samtalet · Det ni redan har sagt i samtalet | Produktfacit i BRIEF och textbeslut GEM-11. |
| Ruta 2, rubrik (stycke) | Det här läser Jobbcoachen inte | SEO: raden får stå, den beskriver produkten och inte lagringen. |
| Ruta 2, rader | Dina matchade jobb · Dina testresultat · Dokument du inte har delat | Lägg inte till något om lagring eller vem som ser vad: ägarens, skrivs inte. |
| Bilden, `aria-label` | Exempel: fyra frågor som Jobbcoachen föreslår utifrån läget i de sökta tjänsterna | |
| Bildens rubrik (stycke) | Frågor utifrån ditt läge | Som i kontot. |
| Bildens underrad | Hämtade ur dina sökta tjänster. Tryck på en, så står den i fältet. | Ordagrant ur kontot. |
| Bildens rader | Hur svarar jag på lönefrågan hos Polhem Ombyggnad? · Vad skriver jag i ett uppföljningsmejl? · Vad frågar jag arbetsgivaren på intervjun? · Hur länge är det rimligt att vänta på besked? | Ordagrant formerna i `coach.ts`. Polhem Ombyggnad är en påhittad arbetsgivare. Inget belopp. |

### Sex områden och källorna

| Plats | Lydelse | Not |
|---|---|---|
| Sex områden: `.ey`, `h2`, ingress, sex `h3` med text | Står kvar ordagrant. | Exempelfrågorna är dagens och flyttar till bubblan överst i varje kort. |
| Källorna: `.ey`, `h2`, ingress, sex `h3` med text | Står kvar ordagrant. | |
| Källkortens monogram (`aria-hidden`) | AF · SCB · Fack · FK · CSN · SKV | |
| Ny rad under källkorten (`.liten`) | Kunskapsbasen är ett femtiotal dokument och uppdateras när vi gör en ny genomgång, inte av sig själv när en källa ändras. Därför står källan vid de svar som bygger på kunskapsbasen, så att du kan kontrollera att regeln fortfarande gäller. | Samma sak som FAQ-svaret om uppdatering, som står kvar ordagrant. |

### Premium (`.premium`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, texten, knappen, länken | Står kvar ordagrant som i koden (JC-1). | "Fråga Jobbcoachen gratis" är 24 tecken. |
| Kvot 1, rubrik (stycke) | Gratis: tio meddelanden per konto | Talet ur konstanten. |
| Kvot 1, bild, `aria-label` | Tio meddelanden | |
| Kvot 1, rad | Samtalet ligger kvar att läsa när de är slut. | Stämmer med FAQ-svaret. |
| Kvot 2, rubrik (stycke) | Premium: fråga så mycket du vill | |
| Kvot 2, bild, `aria-label` | Inget tak | |
| Kvot 2, rad | Du fortsätter i samma samtal, där du slutade. | Stämmer med FAQ-svaret. |

### Frågorna (`.faq`)

| Plats | Lydelse | Not |
|---|---|---|
| `h2`, raden under, åtta frågor med svar | Står kvar ordagrant som i koden. | |
| Skissens nionde fråga, "Vad vet Jobbcoachen om mig?" | Byggs inte. | SEO: NEJ. Ägarens, skrivs inte. Innehållet står i blocket Frågor utifrån läget. |
| `.knapp` efter frågorna | Fråga gratis | Som i hjälten. |

### UX-kontrollen, den här sidan

- **En primär handling:** registreringen. "Fråga gratis" i hjälten och slutet, "Skapa konto och fråga" i lyftet, "Fråga Jobbcoachen gratis" på Premiumytan. Under stegen är knappen vit.
- **Namnen** stämmer med kontot: Jobbcoachen, Frågor utifrån ditt läge, Sökta tjänster, meddelanden (inte frågor) om kvoten.
- **Exemplen:** två samtal, båda ur koden. Inget lönebelopp, ingen namngiven källa som ingen har sett kunskapsbasen ge.

---

## jobbmatchning

`/verktyg/jobbmatchning`. Skiss `sidor/jobbmatchning.html` med delen `delar/jobbmatchning-skarm.html`, not `noter/jobbmatchning.md`. Sidans text i koden bär redan textbeslutets lydelser (JM-1 till JM-8, B5) och står kvar ordagrant: H1, title, description, sju H2, alla H3, stegens och skälens texter, de åtta frågorna med svar. Där skissen har en annan lydelse för de texterna gäller koden. Här står bara det som är nytt: bilderna, kedjan, två länkar och Premiumlistan. Ordantalet går upp med ungefär 110 ord.

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h1`, `.varde`, knapparna | Står kvar ordagrant som i koden. | Ingressen är JM-1, inte skissens "Vi läser ditt CV". |
| `.bricka` 1 | **3 träffar** gratis, med skälen | Står som i dag. Talet ur `FREE_TIER_JOB_LIMIT`. |
| `.bricka` 2 | **3 gånger** per dygn hämtas nya annonser | SEO och textbeslut JM-4, ordagrant. 29 tecken, ett över riktmärket, ryms på två rader. Skissens "25 bästa träffarna i Premium" står inte. |
| `.bricka` 3 | **Hela Sverige** alla branscher | Står som i dag. Skissens "0 kr att börja, utan kortuppgift" har inget besked och byggs inte. |
| Bilden, `aria-label` (`.mj`) | Exempel: Matchade jobb med en vald träff | Inga rubriker i bilden. |
| Bildens märke (nytt, synligt) | Exempel | SEO: matchgraderna märks "Exempel" i bilden. |
| Bildens topp (stycke) | Matchade jobb · Senast sökt för 2 timmar sedan. Sök igen | Som i kontot (`MatchadeJobb.tsx`). |
| Ringen, `aria-label` | Exempel: 91 procent matchgrad mot ditt CV | |
| Träffens huvud | Projektledare, bygg · Sweco, Göteborg | Exempel. |
| Träffens dag | Sista ansökningsdag 28 nov, 6 dagar kvar | Exempel. |
| Träffens skäl, rubrik (stycke) | Därför passar du | Som i kontot. |
| Skäl 1 | 1 av dina 3 roller · Projektledare stämmer med en roll i ditt CV. | Formen ur `annons.ts`. |
| Skäl 2 | Fyra av dina kompetenser nämns i annonsen · projektledning · LOU · budgetansvar · AMA | Formen ur `annons.ts`. |
| Skäl 3 | Göteborg · En av orterna du har valt. | Ordagrant ur `annons.ts`. |
| Träffens handlingar | Skriv brev · Spara till Ska sökas · Markera som sökt | Som i kontot. Bild, inga länkar. |
| Raderna under | 86, Uppdragsledare, infrastruktur, Trafikverket, Mölndal, sista dag 3 dec · 82, Byggprojektledare, Nordhaga Bygg, Kungälv, sista dag 11 dec | Exempel. Kommatecken i stället för skissens mittpunkt. |

### Tre träffar gratis (`.lyft`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Prova utan kort | Ny. 15 tecken. |
| `h2`, `.varde`, de tre bockarna, knappen, länken | Står kvar ordagrant som i koden. | Bockarna är JM-5 och JM-7, inte skissens. |
| `.tjugofem`, `aria-label` | Exempel: av de 25 bästa träffarna är tre öppna på gratisnivån | Talen ur `JOB_MATCHES_PER_RUN` och `FREE_TIER_JOB_LIMIT`. |
| `.tjugofem-rad` 1 | 3 öppna träffar, gratis | |
| `.tjugofem-rad` 2 | 22 till i Premium | Räknas: `JOB_MATCHES_PER_RUN - FREE_TIER_JOB_LIMIT`. |
| Ringarna i de öppna rutorna | 91 · 86 · 82 | Exempel, `aria-hidden` inne i bilden. |

### Så fungerar det (`.vagsteg`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Stryks. | Skissens etikett upprepar rubriken ordagrant. |
| `h2`, ingressen, de fyra stegen | Står kvar ordagrant som i koden. | Steg 1 heter "Välj eller ladda upp ditt CV" (SEO), inte skissens "Ditt CV läses in". Steg 3 är JM-8. |
| Steg 1, bild (`aria-hidden`) | Ditt CV · Byt CV · Sara Lindström, projektledare · 3 roller, 14 kompetenser, 2 utbildningar | Exempel. "Byt CV" som i kontot. |
| Steg 2, bild (`aria-hidden`) | Projektledare · LOU · Göteborg · Civilingenjör | Exempel. |
| Steg 3, bild (`aria-hidden`) | Hitta jobb som passar · Senast sökt för 2 timmar sedan. Sök igen | Knappens namn som i kontot. |
| Steg 4, bild (`aria-hidden`) | 91 · 86 · 82 | Exempel. |
| `.knapp-vit` | Hitta jobb nu | Står som i dag. |

### Sex datapunkter (`.dp`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, ingressen, sex `h3` med text | Står kvar ordagrant. | |
| Arket, `aria-label` | Exempel: Sara Lindströms CV med de sex datapunkterna utmärkta | Arkets rubriker (Profil, Arbetslivserfarenhet och så vidare) är stycken, inga h-taggar. |
| Arkets perioder | 2021 till nu · 2018 till 2021 · 2013 till 2018 | Skissen har tankstreck. |
| Ny rad under datapunkt 1 (`.ur`) | Ur Saras CV: projektledare, biträdande projektledare | Exempel. |
| Ny rad under datapunkt 2 | Ur Saras CV: projektledning, LOU, budgetansvar, AMA | Exempel. |
| Ny rad under datapunkt 3 | Ur Saras CV: civilingenjör, industriell ekonomi | Exempel. |
| Ny rad under datapunkt 4 | Ur Saras CV: Göteborg | Exempel. |
| Ny rad under datapunkt 5 | Ur Saras CV: svenska och engelska | Exempel. |
| Ny rad under datapunkt 6 | Ur Saras CV: åtta år i yrket, två roller | Exempel. |

### Sex skäl och grenarna (`article.o` och `.rutnat.r3`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, ingressen, sex `h3` med text | Står kvar ordagrant. | Skäl 5 heter "Uppdaterat varje dag" (SEO: NEJ till skissens rubrik), med texten ur koden. Skäl 1 behåller sin första mening. |
| Raden vid grenarna | Exempel på träffar för en undersköterska. Ingen av de tre annonserna innehåller ordet undersköterska. | Står som i dag. Skissens omskrivning gäller inte. |
| `.gren`, `aria-label` | Exempel: titeln undersköterska ger träffar som stödassistent, vårdbiträde och boendestödjare | |
| `.gren-rot` | Undersköterska · titeln i CV:t | |
| Skäl 2, bild (`aria-hidden`) | 72 · av 100 | Exempel. |
| Skäl 4, bild (`aria-hidden`) | Nära dig · Hela Sverige | |
| Skäl 5, bild (`aria-hidden`) | per dygn | Tre prickar och orden. |

### Från träff till ansökan (`.kedja`, nytt)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, ingressen | Står kvar ordagrant som i koden (JM-6). | Skissens ingress gäller inte. |
| Kedjan, led 1, etikett (`.var`) | Matchade jobb | |
| Led 1, exempel | 91 · Projektledare, bygg · Sweco, Göteborg · Sista ansökningsdag 28 nov | Exempel. |
| Led 1, text | Träffen visar matchgraden, skälen och sista ansökningsdag. Med Skriv brev får du ett personligt brev på just den annonsen. | |
| Pilen 1 (`.steg-k`) | Spara till Ska sökas | Handlingens namn i kontot. |
| Led 2, etikett | Ska sökas | |
| Led 2, exempel | SW · Projektledare, bygg · Sparad annons · Sista dag lördag 28 nov, 6 dagar kvar | Exempel. Formen ur `sistaDagText`. |
| Led 2, text | Annonsen ligger kvar med sin sista ansökningsdag, och när dagen närmar sig lyfter vi fram den. | |
| Pilen 2 | Markera som sökt | |
| Led 3, etikett | Sökta tjänster | |
| Led 3, exempel | SW · Projektledare, bygg · Sökt 24 november · Väntar svar | Exempel. |
| Led 3, text | Nu räknar vi dagarna. Har du inte hört något på tolv dagar föreslår vi ett uppföljningsmejl och skriver utkastet. | "tolv" ur `NO_RESPONSE_NUDGE_DAYS`. Skissens "ligger ett utkast klart" står inte. |
| Led 3, länk | Håll koll på dina sökta jobb | SEO, ankartexten ordagrant. Till `/verktyg/sokta-tjanster`. 28 tecken, textlänk. Skissen hade "Så fungerar Sökta tjänster". |
| Ny bricka, först i `.rutnat` | **Rekryteringstester** Kallad till test efter ansökan? Träna först. | Till `/verktyg/rekryteringstester`. |
| Brickan Sökta tjänster | Rubrik och text står som i koden. Målet byts till `/verktyg/sokta-tjanster`. | |
| Övriga sex brickor | Står kvar ordagrant, samma ankartext. | Jobbcoachens rad är kodens ("Lön, intervjufrågor och avtal inför jobbet du hittade."), inte skissens. |

### Premium (`.premium`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, texten, knappen, länken | Står kvar ordagrant som i koden (JM-3). | |
| `.pris` | 149 kr i månaden | Ur `PLANS`. Inga kampanjord. |
| `.bockar` 1 | De 25 bästa träffarna, med skälen för var och en | Ny. 25 ur `JOB_MATCHES_PER_RUN`. |
| `.bockar` 2 | Personliga brev från träffen, i alla 40 mallar | Ny. 40 ur `TEMPLATE_COUNT`. |
| `.bockar` 3 | Uppföljningsmejl till varje sökt tjänst och månadsrapporten att skriva ut | Ny. |
| `.bockar` 4 | Alla rekryteringstester i tre nivåer, och Jobbcoachen så mycket du vill | Ny. |

### Frågorna (`.faq`)

| Plats | Lydelse | Not |
|---|---|---|
| `h2`, raden under, åtta frågor med svar | Står kvar ordagrant som i koden. | Skissens svar är äldre än textbeslutet och gäller inte. |
| `.knapp` efter frågorna | Hitta jobb gratis | Som i hjälten. |

### UX-kontrollen, den här sidan

- **En primär handling:** "Hitta jobb gratis" i hjälten, lyftet, Premium och slutet, alltid till registreringen. "Hitta jobb nu" under stegen är vit, inte koppar.
- **Namnen** stämmer med kontot: Matchade jobb, Sök igen, Byt CV, Hitta jobb som passar, Därför passar du, Skriv brev, Spara till Ska sökas, Markera som sökt, Väntar svar.
- **Arbetsgivarna i exemplen** är verkliga i träffarna (Sweco, Trafikverket, och dagens grenar) och påhittade på sidan Sökta tjänster. Det är avsiktligt: en träff säger inget om arbetsgivaren, en ansökan som har varit tyst i tolv dagar gör det.

---

## linkedin

`/verktyg/linkedin-optimering`. Skiss `sidor/linkedin.html`, not `noter/linkedin.md`. H1, de sex H2, alla femton H3, stegens, sektionernas, skälens och lägenas texter och de åtta frågorna står kvar ordagrant. Tre meningar byts (steg 2, skäl 2, ett FAQ-svar), och slutblocket följer textbeslut GEM-5. Exemplet byter person: Sara Lindström på Nordanvind Energi i stället för Anna Lindberg på Klarna och Voi.

SEO har sagt nej till tre av skissens byten. De står kvar som i dag: "vi optimerar fem sektioner samtidigt" i hjälten, "Klart på fem minuter" med brickan "5 min", och meningen "LinkedIns algoritm prioriterar profiler som är kompletta".

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` (utanför `h1`) | LinkedIn-optimering, syns när rekryteraren söker | Står kvar, som egen rad över rubriken. Skissen lägger den inuti `h1`. Det är bara tillåtet på CV-analysen. Här skulle det byta H1. |
| `h1` | Hamna i rekryterarnas sökresultat på LinkedIn | Står kvar. |
| `.varde` | Som i dag, med "vi optimerar fem sektioner samtidigt". | SEO: nej till "skriver om". |
| `.knapp` | Optimera min profil | Står kvar. 19 tecken. |
| `.lank` | Så fungerar det | Står kvar. |
| `.liten` under knapparna | Ingår i Jobbcoach Premium, 149 kr i månaden. Exemplet här nedanför ser du utan konto. | Ny. SEO: ja. Priset ur `PLANS`. |
| Talbrickorna | Som i dag: 0 inloggningar på din LinkedIn, 5 sektioner samtidigt, 5 min tills profilen är uppdaterad. | Förklaringarna är 28, 19 och 28 tecken. |
| `.instr`, `aria-label` | Exempel: Sara Lindströms profil efter optimeringen, med orden rekryteraren söker på utmärkta | Bilden bär `role="img"`. Namnet på profilen är ett stycke. |
| `.svav.sok` | Rekryteraren söker · projektledare LOU Göteborg | Exempel. |
| Profilens rubrik | Projektledare inom energi och bygg \| Offentlig upphandling enligt LOU, budgetansvar, tidplan \| Leder ombyggnader från förfrågan till överlämning | Exempel. 144 tecken. Lodstrecken hör till rubriken, så skrivs LinkedIn-rubriker. |
| Profilens ort och Om | Göteborg, Västra Götalands län · Jag leder ombyggnader och energiprojekt åt offentliga beställare. | Exempel. |
| `.svav.poang` | 87 · i profilpoäng efter, 32 före | Exempel. Samma tal som dagens demo visar. |

### Exemplet, före och efter (`.lyft`, `#exempel`)

Hela kortet är ett exempel och säger det. Inga rubriker: "Rubriken och Om mig, före och efter" är ett stycke (SEO).

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Exempel, Sara Lindström | Ny. |
| Rubrikraden (stycke) | Rubriken och Om mig, före och efter | Dagens "Rubriken, före och efter", utökad. |
| `.varde` | Så ser rubriken och Om mig ut på en profil, där rekryteraren läser dem först. Erfarenhet, utbildning och kompetenser optimeras i samma pass. | Ny. Skissens "de två första raderna" stämmer inte, Om mig är ingen rad. |
| `.fe-tal`, `aria-label` | Exempel: profilpoängen för rubriken, 32 före och 87 efter | |
| Rad under talet | profilpoäng för rubriken, av 100 | Ny. |
| Kolumn 1, etikett | I dag · Det Sara klistrar in | |
| Kolumn 1, profilen | Projektledare på Nordanvind Energi · Göteborg, Västra Götalands län · Jag är en driven och engagerad projektledare som trivs med många bollar i luften och tycker om att arbeta med människor. | Exempel. |
| Kolumn 1, mätaren | Rubrikens längd · 34 av 220 tecken · Ord en rekryterare kan söka på: projektledare | Exempel. 34 stämmer med rubriken. |
| Kolumn 2, etikett | Efter · Det Sara får tillbaka | |
| Kolumn 2, rubriken | Samma rubrik som i hjälten. | Exempel. |
| Kolumn 2, Om, stycke 1 | Jag leder ombyggnads- och energiprojekt åt offentliga beställare, från förfrågningsunderlag till överlämning. De senaste tre åren har jag drivit fyra upphandlingar enligt LOU och hållit ihop tidplan, budget och underentreprenörer i projekt på upp till 42 miljoner kronor. | Exempel. Beloppet är en projektbudget, ingen lön. |
| Kolumn 2, Om, stycke 2 | Jag började som biträdande projektledare inom logistik och tog med mig vanan att räkna på flöden. I dag är det den som gör att mina projekt blir klara före plan. | Exempel. |
| Kolumn 2, raden under Om | Texten fortsätter med vart Sara är på väg. 280 ord. | Exempel. |
| Kolumn 2, mätaren | Rubrikens längd · 144 av 220 tecken · Ord en rekryterare kan söka på: projektledare, energi, bygg, offentlig upphandling, LOU, budgetansvar | Exempel. 144 stämmer med rubriken. |
| `.plus` | + Branschens sökord · + Tydlig specialisering · + Resultat i siffror | De två första står i dag. Den tredje ersätter "+ Tydlig målgrupp" och gäller Om mig. |
| `.chip-premium` | Ingår i Premium | |
| Verktygets knapp i bilden | Kopiera alla sektioner | 22 tecken. Verktygets egen knapptext. Ritas som en del av bilden, inte som en knapp: på den publika sidan finns inget att kopiera. Kortets handling är hjältens "Optimera min profil". |

### Så fungerar det (`.steg5`, HowTo)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Fem steg | Ny. Skissens "Fem steg, fem minuter" upprepar ett tal som inte är belagt en gång till. |
| `h2`, `.varde`, de fem `h3`, steg 1, 3, 4 och 5, knappen | Som i dag. | "Klart på fem minuter." står kvar (SEO). |
| Steg 2, text | Klistra in texten i fälten Rubrik, Om mig, Erfarenhet, Utbildning och Kompetenser, eller välj ditt sparade CV som källa. Om mig och Erfarenhet behövs, resten är valfritt. Profilen skrivs på svenska eller engelska, du väljer själv. | Andra meningen: SEO, ordagrant, ersätter "Inget fält är obligatoriskt." Tredje meningen är SEO:s tillägg om språket. HowTo-steg 2 följer med (`LD_UNDANTAG`). |
| Steg 2, bild | Rubrik, valfritt · Om mig · Erfarenhet · Utbildning, valfritt · Kompetenser, valfritt | `aria-hidden`. |
| Steg 4, bild | 32 Före · 87 Efter | `aria-hidden`. Exempel. |
| Steg 5, bild | Alla sektioner kopierade · Du klistrar in och sparar själv | `aria-hidden`. |

### Fem sektioner i ett pass (`.pass`)

Rubrik, ingress, de fem H3 och texterna står kvar ordagrant.

| Plats | Lydelse | Not |
|---|---|---|
| `.passtid` | Ett pass, 30 till 60 sekunder | Ny bricka. SEO: ja. Talet står redan i steg 3. |
| `.passark`, `aria-label` | Exempel: Saras profil med de fem sektionerna utmärkta, rubrik, om mig, erfarenhet, utbildning och kompetenser, sammanbundna av en tråd | |
| Profilens perioder (i bilden) | 2021 till nu · 2018 till 2021 · 2013 till 2018 | Exempel. Skissen har tankstreck. |
| Profilens kompetenser (i bilden) | Projektledning, Tidplan, Budgetansvar · LOU, Förfrågningsunderlag, AMA · Entreprenadjuridik, AB 04 | Exempel. Tre grupper, som H3 "Kompetenser i 3 till 4 grupper" säger. |
| Mätarna per sektion, `aria-label` | Exempel: 32 före, 87 efter · Exempel: 41 före, 89 efter · Exempel: 38 före, 84 efter · Exempel: 55 före, 80 efter · Exempel: 46 före, 88 efter | Påhittade exempeltal. Får bara stå i bilderna, aldrig i löptext. |
| `.liten` under raderna | Poängen är Saras och ett exempel: mörkt före, ljust efter. | Ny. |

### Varför du inte syns i dag (`.varfor`)

Rubrik, ingress, de tre H3 och texterna står kvar, med en mening bytt.

| Plats | Lydelse | Not |
|---|---|---|
| Skäl 2, andra meningen | Många använder bara en bråkdel av dem. | SEO, ordagrant. Ersätter "De flesta använder färre än 30." |
| Skäl 1, bild | projektledare LOU · Projektledare bygg \| LOU, budget · Projektledare \| Upphandling enligt LOU · Projektledare på Nordanvind Energi | `aria-hidden`. Exempel. |
| Skäl 2, bild | "Marknadsförare" 14 av 220 · Yrkesroll, specialområden, målgrupp 144 av 220 | `aria-hidden`. 14 stämmer med ordet. |
| Skäl 3, bild | Två av fem sektioner ifyllda | `aria-hidden`. |

### Bred eller skarp inriktning (`.val2`)

| Plats | Lydelse | Not |
|---|---|---|
| Chip på "Stå ut i mängden" | Bred | Ny. Står utanför `h3`. |
| Chip på "Sikta på en specifik roll" | Skarp | Ny. Står utanför `h3`. |
| Bred, bild | Rubriken blir: Projektledare inom energi, bygg och infrastruktur \| Upphandling, budget, tidplan · Syns i sökningar på: projektledare, byggprojektledare, uppdragsledare, projektchef | `aria-hidden`. Exempel. |
| Skarp, bild | Du skriver in målrollen: Projektchef, energi · Rubriken blir: Projektchef energi \| Offentlig upphandling enligt LOU \| Leder ombyggnader upp till 42 miljoner | `aria-hidden`. Exempel. |

### Premium (`.premium`) och länkbrickorna

Etiketten med priset, rubriken "Sluta vara osynlig. Börja synas i dag.", texten med "CV-analysens alla förslag" (textbeslut GEM-5) och de två knapparna står som i koden.

| Plats | Lydelse | Not |
|---|---|---|
| `.pris` | 149 kr · i månaden, säg upp när du vill | Ur `PLANS`. |
| `.bockar` 1 | LinkedIn-profilen optimerad, i båda lägena och så ofta du vill | Ny. |
| `.bockar` 2 | 40 CV-mallar och CV-analysens alla förslag | Ny. `TEMPLATE_COUNT`. |
| `.bockar` 3 | Rekryteringstester, personliga brev, Jobbsöket och Jobbcoachen | Ny. Skissens "jobbmatchning" byts mot Jobbsöket (textbeslut B-8). |
| `.liten` under listan | Utan Premium ser du exemplet här på sidan och kan skapa ett konto, men inte köra optimeringen på din egen profil. | Ny här. Samma mening som i FAQ-svaret om pris. |
| `.ey` över brickorna | Mer för ditt CV | Ny. Stycke, ingen rubrik. |
| Bricka 1, `/verktyg/cv-analys` | **CV-analys** Läsbarhetspoäng i sju delar, gratis för varje CV | Ankartexten exakt "CV-analys" (SEO). |
| Bricka 2, `/verktyg/skapa-cv` | **Skapa CV** Skriv direkt på arket | Ankartexten exakt "Skapa CV". |
| Bricka 3, `/cv-mallar` | **CV-mallar** 40 mallar, Linne och Björk gratis | Ankartexten exakt "CV-mallar". Talet ur `TEMPLATE_COUNT`. |

### Frågorna (`.faq`)

Alla åtta frågor står kvar. Sex svar ordagrant.

| Plats | Lydelse | Not |
|---|---|---|
| Svar, Hur lång tid tar optimeringen?, sista meningen | Har du redan ett sparat CV hos oss går det ännu snabbare, eftersom fälten då är ifyllda från början. | SEO: ja. "alla fält" blir "fälten": rubriken lämnas tom när CV:t är källa. |
| Svar, Vad kostar LinkedIn-optimeringen? | Textbeslut GEM-5: "CV-analysens alla förslag" i stället för "hela CV-analysen". | Står redan i koden. |
| Knappen efter frågorna | Optimera min profil | Står kvar. |

### UX-kontrollen, den här sidan

- **En primär handling:** "Optimera min profil" är kopparknappen överallt. Den leder till ett verktyg som kräver Premium, och raden under knappen i hjälten säger det innan man trycker.
- **Exemplets knapp** "Kopiera alla sektioner" är en bild av verktyget. En knapp som inte kopierar något får inte se tryckbar ut.
- **Orden:** sidan säger "optimerar" och "optimering" i rubriker och löptext, eftersom det är vad folk söker på. Nya rader följer det, också där skissen skriver "omskriven".
- **Exemplet** är ett och samma: Sara, 32 före och 87 efter, rubriken på 144 tecken. Byts något tal ska hjälten, lyftet, steg 4 och första mätaren följa med.
- **Engelska gränssnittsord:** verktygets språkval heter "English" i kontot. På den publika sidan skriver vi "svenska eller engelska".

---

## meny

Menyn och foten på alla publika sidor. Skiss `sidor/meny.html` med `delar/meny-mega.html` och `delar/fot.html`, not `noter/meny.md`. Alla dagens ankartexter står ordagrant (seo-krav, Menyn och foten krav 1). Nytt är de fyra delarnas namn, tre länkar, raden under varje länk, märket Nyhet, de två småbilderna och telefonmenyns knappar. Grunden är redan byggd: tre rader nedan skiljer sig från det som står i `LandingNavbarMega.tsx` i dag och är märkta "ändra".

### Toppraden (`.nav`)

| Plats | Lydelse | Not |
|---|---|---|
| De fem valen | Funktioner · Priser · Vad vi erbjuder · Artiklar · Om oss | Står kvar. Priser är egen länk. |
| `nav`, `aria-label` | Huvudmeny | Står kvar. |
| `.nav-in` | Logga in | Står kvar. |
| `.knapp-liten` | Skapa konto | Står kvar. 11 tecken. Sidans enda kopparknapp i toppraden. |
| Menyknappen i telefonen, `aria-label` | Öppna menyn | När menyn är öppen: Stäng menyn. |

### Vad vi erbjuder i datorn (`.mm`)

Delarnas huvud är länkar till delens huvudsida. Raden under varje länk är fri inom sanningen (SEO).

| Plats | Lydelse | Not |
|---|---|---|
| Del 1, huvud | Rekryteringstester | Till `/verktyg/rekryteringstester`. |
| Rekryteringstester | Åtta testtyper i tre nivåer | Talet ur `TESTTYPER`. |
| Personlighetstest | Det rekryteraren läser ut av dig | Ny länk, SEO:s ankartext. |
| Del 1, rad vid småbilden | Grundnivån är gratis i alla åtta. | `aria-hidden` som i skissen. |
| Del 2, huvud | CV | Till `/verktyg/cv-analys`. |
| CV-analys | Läsbarhetspoäng i sju delar | |
| Skapa CV | Skriv direkt på arket | |
| CV-mallar | 40 mallar, två gratis | Ur `TEMPLATE_COUNT` och `FREE_TEMPLATE_COUNT`. |
| LinkedIn-profilen | Rubrik och sammanfattning som hittas | Ändra: koden har "Syns i rekryterarnas sök". SEO har sagt ja till bytet. 36 tecken, bryts på två rader i smal kolumn. |
| Del 3, huvud | Personliga brev | Till `/verktyg/personligt-brev`. |
| Personligt brev | Skrivet mot annonsens krav | "på annonsens krav" är inte svenska. |
| Personligt brev-exempel | 89 yrken att utgå från | Ny länk, SEO:s ankartext. Talet ur datan. |
| Del 3, rad vid småbilden | Första personliga brevet är gratis. | |
| Del 4, huvud | Jobbsöket | Till `/verktyg/jobbmatchning`. |
| Jobbmatchning | Annonser som passar ditt CV | |
| Sökta tjänster | Håll koll på dina sökta jobb | Ny länk, SEO:s ankartext. Till `/verktyg/sokta-tjanster`. Raden bär sidans sökord. Skissens "Uppföljning och rapport" nämner bara det som kostar. |
| Märket vid Sökta tjänster | Nyhet | Eget element bredvid `<a>` eller `::after`, aldrig i ankartexten (SEO). Ändra: i koden ligger märket inne i länken. Tas bort 2027-01-12. |
| Jobbcoachen | Intervju, avtal och avslag | Ändra: koden har "Svar med källor". SEO har sagt ja till bytet. |
| Bli upptäckt | Låt rekryterare hitta dig | |
| Premiumraden, rubrik | Jobbcoach Premium, 149 kr i månaden | Ur `paketMedPris`. |
| Premiumraden, text | Tester, CV, personliga brev, Jobbsöket och Jobbcoachen. Säg upp när du vill. | Första meningen ur `beskrivning` i `plans.ts` (textbeslut GEM-6). Skissens "jobbmatchning" gäller inte. |
| Premiumradens knapp (`.knapp-glas`) | Se vad som ingår | Står kvar. Till `/priser`. |
| `.mm-mer`, `aria-label` | Mer | |
| `.mm-mer` | Alla funktioner · Jobbkartan · Räkna ut lön och skatt · För rekryterare | Står kvar. |

### Telefonmenyn (`.tm`)

| Plats | Lydelse | Not |
|---|---|---|
| `nav`, `aria-label` | Meny | |
| Knappen i toppraden när menyn är öppen | Stäng | `aria-label`: Stäng menyn. Ersätter "Skapa konto", så att skärmen har en kopparknapp. |
| Blockens namn (stycken eller `h3` inom `data-site-chrome`) | Rekryteringstester · CV · Personliga brev · Jobbsöket | |
| Länkarna | Samma ankartexter som i datorn. | Bara testblocket har raden under länken. Märket Nyhet står utanför ankartexten här också. |
| `.tm-mer` | Funktioner · Priser · Artiklar · Om oss · Jobbkartan · För rekryterare · Räkna ut lön och skatt | Står kvar. |
| Premiumraden | Jobbcoach Premium, 149 kr i månaden. Tester, CV, personliga brev, Jobbsöket och Jobbcoachen. Säg upp när du vill. | Samma källa som i datorn. |
| Premiumradens länk | Se vad som ingår | Förslag: låt bara de tre orden vara länkens text, inte hela blocket. Annars blir ankartexten till `/priser` ett helt stycke. |
| Fasta raden, `.knapp` | Skapa konto gratis | 18 tecken. Till `/register`. |
| Fasta raden, `.knapp-vit` | Logga in | Till `/login`. |

### Foten (`.fot`)

| Plats | Lydelse | Not |
|---|---|---|
| Raden under loggan | Står kvar ordagrant. | "CV, personligt brev, tester och matchning för svensk arbetsmarknad. Byggt i Sverige, med svenska källor." |
| Första kolumnens länkar | Om oss · Funktioner · Priser · Artiklar · Kontakt · Hjälpcenter · För rekryterare · Insikter för rekryterare | Står kvar. |
| Kolumnernas namn | Rekryteringstester · CV · Personliga brev · Jobbsöket | Nya namn på kolumnerna, stycken som i koden. |
| Rekryteringstester | Rekryteringstester · Personlighetstest | |
| CV | CV-analys · Skapa CV · CV-mallar · CV-exempel · CV-mallar per yrke · LinkedIn-profilen | "CV-mallar per yrke" pekar på `/cv-mallar#yrken` (SEO). Ändra: koden pekar på `/cv-mallar`. |
| Personliga brev | Personligt brev · Personligt brev-exempel · Exempel och mallar | |
| Jobbsöket | Jobbmatchning · Sökta tjänster · Jobbcoachen · Bli upptäckt · Jobbkartan · Räkna ut lön och skatt | Jobbcoachen står här, inte under Rekryteringstester som i skissens fot. Inget Nyhet-märke i foten. |
| Sociala länkar | Står kvar som i dag. | Facebook-adressen är ägarens fråga och rörs inte (SEO: NEJ). |
| Nedersta raden | Står kvar ordagrant. | Integritetspolicy, Användarvillkor, Cookies: ägarens, skrivs inte. |

### UX-kontrollen, den här sidan

- **En primär handling:** "Skapa konto" i toppraden, "Skapa konto gratis" i telefonmenyns fasta rad. När telefonmenyn är öppen finns bara den senare.
- **Namnen** stämmer med kontot: de fyra delarna heter som dörrarna (`DORR_ETIKETT.dator`). Länken heter Jobbmatchning, inte Matchade jobb: det är sidans sökord och H1 (textbeslut B-12).
- **Ryms:** underraderna i megamenyn är högst 36 tecken. I telefonen är länkarna 54 px höga, och "Personligt brev-exempel" (23 tecken) är den längsta: kontrollera att den inte bryts i 375 px när den står bredvid en annan länk.
- **Märket Nyhet** får inte räknas in i länkens namn för skärmläsare eller sök. Sätt datumet 2027-01-12 som kommentar vid märket, så att det tas bort samma dag som januariavläsningen.

---

## om-oss

`/om-oss`. Skiss `sidor/om-oss.html`, not `noter/om-oss.md`. H1, de tre H2, de sju H3, brödsmulorna, länkarna och schemat står ordagrant. Sidan har 300 ord och gränsen är 6: bara byten av samma längd och tillägg. Tre meningar byts enligt textbeslutet och SEO, och hjältens bild är ny.

### Hjälten (`.vagg.hjalte`, `.vaxt`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h1`, `.varde`, knappraden | Står kvar ordagrant. | "Om Jobbcoach.ai", "Se våra verktyg", "Så började det". |
| Bilden, `aria-label` | Från ett verktyg 2023 till fyra delar i dag: personliga brev, CV, Jobbsöket och rekryteringstester | Ny bild, ersätter telefonen. Inga rubriker i blocken (SEO). |
| Etikett överst | I dag: fyra delar i samma konto | 31 tecken. |
| Block 1 | **Rekryteringstester** Åtta testtyper i tre nivåer | Överst och bredast. Talet ur `TESTTYPER`. |
| Block 2 | **Jobbsöket** Matchade jobb, Sökta tjänster och Jobbcoachen | |
| Block 3 | **CV** Analys, mallar och LinkedIn | |
| Block 4 | **Personliga brev** Här började vi | |
| Etikett nederst | 2023: ett verktyg, cvbrev.se | |

Är bilden `role="img"` läses bara `aria-label` upp och blockens ord räknas inte. Låt i stället blocken vara vanlig text utan `aria-hidden`: sidan har ont om ord, och de här är sanna.

### Historien (`.vagsteg`, `#vart-team`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, de fyra H3, årtalen | Står kvar ordagrant. | |
| Kort 1, text | En enkel idé: göra det lättare att skriva personliga brev som fungerar för svenska arbetsgivare. De som använde den kom snabbare till sitt första utkast. | Textbeslut INF-4. Står redan i koden. Skissens "Användarna kom snabbare" gäller inte. |
| Kort 4, text | Vi lanserar verktyg löpande, alla med svenska källor och svensk arbetsmarknad som utgångspunkt: rekryteringstester, CV-analys, jobbmatchning, sökta tjänster, LinkedIn-profilen och Jobbcoachen. | Textbeslut INF-2. Rekryteringstester först, som SEO har sagt ja till. Två verktyg fler än skissen. |
| Kort 4, märke vid årtalet | nu | Står kvar ("2025 och framåt, nu"). |
| Bilderna i korten | Inga ord utöver cvbrev.se, överstruket, och Jobbcoach.ai i kort 3. | `aria-hidden`. |

### Tre saker vi lovar (`.loften`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Så arbetar vi | Ny etikett. |
| `h2`, de tre H3, löfte 1 | Står kvar ordagrant. | |
| Löfte 2, sista meningen | Vi gissar inte, vi hänvisar, och när svaret bygger på källorna står de med. | SEO, ordagrant. Ersätter "och varje siffra går att följa till källan". Skissens "med källor du kan kolla själv" gäller inte. |
| Löfte 3, första meningen | Du provar det mesta utan kortuppgifter. | SEO har sagt ja. Resten av stycket står kvar. |
| Löfte 1, bildens ord | Du klistrar in · Vi skriver · Du kopierar tillbaka och skickar · Ditt lösenord stannar hos dig | Ny bild. `aria-hidden` i skissen. |
| Löfte 2, bildens ord | Arbetsförmedlingen · SCB · Fackförbunden · Försäkringskassan · CSN · Skatteverket | Samma sex som i texten. |
| Löfte 3, bildens ord | **0 kr** Gratisnivån, inget kort · **149 kr** Premium, i månaden | Priset ur `PLANS`. |

### Slutytan (`.o.slut`)

| Plats | Lydelse | Not |
|---|---|---|
| Talen, `aria-label` | Jobbcoach.ai i siffror | Står kvar. |
| De två talen med text | Står kvar ordagrant, talen ur databasen som i dag. | "har skapat konto för att söka jobb med svenska verktyg." och "personliga brev skrivna på riktiga annonser sedan starten." |
| `.ey`, `h2`, texten, knapp och länk | Står kvar ordagrant. | "Kontakt", "Skapa konto gratis", info@jobbcoach.ai. |

### UX-kontrollen, den här sidan

- **En primär handling per skärmyta:** "Se våra verktyg" i hjälten och "Skapa konto gratis" i slutet.
- **Namnen** stämmer med kontot: Rekryteringstester, Jobbsöket, CV, Personliga brev, Matchade jobb, Sökta tjänster, Jobbcoachen.
- **Ordantalet:** bytena ger plus 3 ord (INF-2), plus 2 (INF-4), plus 1 (löfte 2) och noll (löfte 3). Telefonen som försvinner var text: räkna före och efter, och låt hjältens fyra block och löftenas bildord vara riktig text om sidan hamnar under gränsen.

---

## personlighetstest

`/verktyg/personlighetstest`. Skiss `sidor/personlighetstest.html`, not `noter/personlighetstest.md`. H1, de fyra H2, de nio H3 (fyra steg, fem faktorer), stegens och faktorernas texter och de sex frågorna med svar står kvar ordagrant. Provets egna texter (`personlighetsprov-copy.ts`) rörs inte. Nytt är hjältens knappar och bild, raderna bredvid provet, exemplet med kravprofilen, en ny H3 om intervjufrågorna och trappan med de tre testen.

Talen läses ur koden: 20 (`ANTAL` i provet), 50 (`GRATIS_PASTAENDEN`), 120 och 30 delfaktorer ur det fördjupade testet, priset ur `PLANS`.

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h1`, `.varde` | Som i dag. | |
| `.knapp` | Gör provet nu | 13 tecken. Ny. Ankare till provet i lyftet (`#provet`). |
| `.lank` | Så läser rekryteraren profilen | Ny. Ankare till "De fem faktorerna och vad rekryteraren ser i dem". |
| Talbrickorna | Som i dag: 20 påståenden, 2 min ungefär, 5 faktorer i profilen. | |
| `.pbild`, `aria-label` | Exempel: Sara Lindströms profil med fem faktorer, hennes tydligaste drag och en fråga hon kan få på intervjun | Bilden bär `role="img"`. Inga rubriker i den. |
| Profilens topp | Din profil · Fem faktorer, 1 till 5 | Provets egna rader (`COPY.resultat`). Se listan Stämmer inte. |
| Profilens rader | Samvetsgrannhet Hög · Utåtriktning Låg · Stabilitet Hög · Vänlighet Mitt emellan · Öppenhet Mitt emellan | Exempel. Samma profil som på testsidan. Bandord, inga tal. |
| `.svav.drag` | Ditt tydligaste drag · Hög samvetsgrannhet | Exempel. Etiketten som i provet. |
| `.svav.fraga` | Rekryteraren lär fråga · När kostade strukturen dig flexibilitet? | Exempel. Frågan är den som redan står på sidan. |

### Provet (`.lyft`, `#provet`)

Provet serverrenderas med de fem svaren i HTML:en (SEO). Huvudet, räknaren, påståendet, frågan "Hur väl stämmer det på dig?", de fem svaren, instruktionen och fotnoten står som i `personlighetsprov-copy.ts`. Fotnoten om att svaren sparas i sju dagar: ägarens, skrivs inte, står ordagrant.

| Plats | Lydelse | Not |
|---|---|---|
| Raden under svaren, första meningen | Ett tryck svarar och går vidare. | Ny. Står före instruktionen "Tänk på hur du är på jobbet, och svara med första rimliga svaret." Kortet har ingen egen knapp, så raden behövs. Skissens extra "Inga rätt eller fel." stryks, det står redan i provets huvud. |
| Stapeln, `aria-label` | Påstående 1 av 20 | Provets egen räknare. |
| Högerspalten, `.ey` | Det här får du | Ny. Stycke, ingen rubrik. |
| Rad 1 (bock) | **Profilen direkt** Fem faktorer med bandord: hög, mitt emellan eller låg. | Ny. |
| Rad 2 (bock) | **En rad per faktor** Så läser en rekryterare den. | Ny. |
| Rad 3 (lås) | **Profilen mot sex kravprofiler** Med ett gratiskonto. | Ny. |
| Rad 4 (lås) | **Vad du kan säga på intervjun** Med ett gratiskonto. | Ny. |

### Så fungerar det (`.vagsteg`)

Rubrik, ingress, de fyra H3 och stegens texter står kvar ordagrant.

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Fyra steg | Ny. Skissens "Från kryss till profil" upprepar ingressen. |
| Steg 2, bild | Hög · Låg · Hög · Mitt · Mitt | `aria-hidden`. Exempel. |
| Steg 3, bild | Ekonomi · Ledarskap · IT och utveckling | `aria-hidden`. Tre av de sex kravprofilerna. |
| Steg 4, bild | 50 | `aria-hidden`. `GRATIS_PASTAENDEN`. |

### De fem faktorerna och exemplet mot en kravprofil (`.fakt`)

Rubriken, ingressens två meningar, de fem H3 och faktorernas texter står kvar ordagrant. Exemplet är ett och fast: Saras profil mot kravprofilen Ledarskap och projektledning (SEO). Kraven läses ur `KRAVPROFILER` i `src/lib/personlighet/smakprov-tolkning.ts`, de ritas inte. Den kravprofilen ställer tre krav: hög samvetsgrannhet, hög stabilitet och utåtriktning som är mitt emellan eller hög. På vänlighet och öppenhet ställer den inget krav, och det ska bilden säga. Inga siffror på axeln (SEO): bara Låg, Mitt emellan och Hög.

| Plats | Lydelse | Not |
|---|---|---|
| `.varde`, ny tredje mening | Här är ett exempel: Saras profil läst mot kravprofilen Ledarskap och projektledning. | Ny. Skissens mening pekar på "en av de sex" utan att säga vilken. |
| `.roller`, `aria-label` | Sex vanliga kravprofiler | |
| `.roller` | Ledarskap och projektledning · Ekonomi och administration · Sälj och kundkontakt · Vård och omsorg · IT och utveckling · Lager, produktion och drift | Namnen ur `KRAVPROFILER`. Skissens "Lager" är avkortat. Raden är en lista, inte knappar: bara exemplets profil är markerad, med märket "Exemplet". |
| Rad under listan | Det som väger tungt i ledarskap och projektledning: ta plats, hålla planen, hålla lugnet. | Ny. `vagerTungt` ur datan, med liten bokstav i löptext. |
| `.forkl` | Saras profil · Det kravprofilen frågar efter | Förklaring till mätarna. |
| Mätarens axel | Låg · Mitt emellan · Hög | Ersätter skissens 1 till 5. |
| Samvetsgrannhet, mätare | Hög · Passar kravprofilen | Exempel. `aria-label`: Exempel: Sara har hög samvetsgrannhet. Kravprofilen frågar efter hög. |
| Utåtriktning, mätare | Låg · Räkna med en fråga | Exempel. Kortet får kopparkant. `aria-label`: Exempel: Sara har låg utåtriktning. Kravprofilen frågar efter mitt emellan eller hög. |
| Stabilitet, mätare | Hög · Passar kravprofilen | Exempel. `aria-label`: Exempel: Sara har hög stabilitet. Kravprofilen frågar efter hög. |
| Vänlighet, mätare | Mitt emellan · Inget krav i den här profilen | Exempel. Skissens spann "2 till 4" finns inte i datan. `aria-label`: Exempel: Sara ligger mitt emellan i vänlighet. Kravprofilen ställer inget krav här. |
| Öppenhet, mätare | Mitt emellan · Inget krav i den här profilen | Exempel. Skissens spann "3 till 4" finns inte i datan. `aria-label` som för vänlighet, med öppenhet. |
| Rad under de fem korten | Sammantaget för exemplet: Räkna med en fråga om utåtriktning. | Ny. Utfallet i produktens egen form (`kravUtfall`). |

### Frågor rekryteraren lär ställa (`article.o`), ny delrubrik

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Inför intervjun | |
| `h3` | Frågor rekryteraren lär ställa | SEO: ja, som H3. Ny rubrik på sidan, raden stod förut i telefonbilden. |
| `.varde` | Där profilen och kravprofilen skiljer sig kommer frågan. Vi skriver ut vilka frågor din profil brukar ge och hur du kan svara, faktor för faktor. | Ny. |
| Andra stycket | Med det fördjupade testet i Premium får du också frågorna rekryteraren har i sin intervjuguide, att öva på i förväg. | Ny. |
| `.knapp-vit` | Gör provet utan konto | 21 tecken. Ankare till provet. |
| `.liten` bredvid knappen | Hela tolkningen följer med ett gratiskonto. | Ny. SEO: ja. |
| Fråga 1 | Fråga 1, hög samvetsgrannhet · När kostade strukturen dig flexibilitet? | Står på sidan i dag, i telefonen. Nu synlig text. Etiketten är ett stycke. |
| Svar 1 | Så svarar du · Säg att du håller det du lovar, och ge ett exempel där det räknades. Visa också en gång när du släppte planen för att nå målet. | Ordagrant som i dag. |
| Fråga 2 | Fråga 2, låg utåtriktning · Hur gör du dig hörd i en grupp? | |
| Svar 2 | Så svarar du · Förbered ett exempel där du fick gehör för ett förslag i en grupp. Säg att du tänker innan du talar, och visa vad det gav. | Ordagrant som i dag. |
| Fråga 3 | Fråga 3, STAR · Fördjupade testet · Ett långt projekt utan yttre press, hur höll du igång? | "Fördjupade testet" som Premium-chip. Dagens knapp "Öva på svaret" ritas inte: den vyn finns inte i kontot (textbeslut B-15). |

### Femtio påståenden, gratis i kontot (`.trappa3`)

Rubriken, ingressen och de två länkarna "Skapa konto gratis" och "Gör provet först" står kvar. Trappan är ny.

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Hela testet | Står kvar. |
| Steg 1, tal | 20 · påståenden | |
| Steg 1, `h3` och chip | Provet · Utan konto | Ny H3. Chipet står utanför rubriken. |
| Steg 1, text | Två minuter. Profilen direkt, med en rad per faktor om hur rekryteraren läser den. | Ny. |
| Steg 2, tal | 50 · påståenden | `GRATIS_PASTAENDEN`. |
| Steg 2, `h3` och chip | Hela testet · Gratis i kontot | Ny H3. |
| Steg 2, text | Tio minuter. Profilen du kan ta med dig till intervjun. | Ny. |
| Steg 2, `.bockar` | Profilen mot sex kravprofiler · Dina styrkor, och det du bör vara medveten om · Det du kan säga på intervjun | Ny. Skissens andra rad haltar på svenska. |
| Steg 2, knappar | Skapa konto gratis · Gör provet först | Står kvar. "Skapa konto gratis" är 18 tecken. |
| Steg 3, tal | 120 · påståenden | |
| Steg 3, `h3` och chip | Fördjupade testet · Premium | Ny H3. |
| Steg 3, text | 25 minuter, 30 delfaktorer. Din arbetsstil och frågorna i rekryterarens intervjuguide. Ingår i Jobbcoach Premium, 149 kr i månaden. | Ny. Priset ur `PLANS`. |

### Frågorna och slutet

De sex frågorna och svaren står kvar ordagrant.

| Plats | Lydelse | Not |
|---|---|---|
| `.knapp` efter frågorna | Gör provet nu | 13 tecken. Ankare till provet. |
| `.lank` efter frågorna | Alla rekryteringstester | Ny länk till `/verktyg/rekryteringstester`. SEO: ja. |

### UX-kontrollen, den här sidan

- **En primär handling:** provet. "Gör provet nu" i hjälten och i slutet leder dit, och i lyftet svarar man med ett tryck utan knapp. "Skapa konto gratis" är kopparknapp bara i trappans mittsteg.
- **Bandord, inga tal:** FAQ-svaret säger att provet visar bandord i stället för poäng. Exemplet mot kravprofilen följer det: Låg, Mitt emellan, Hög, och inga siffror på axeln.
- **Exemplet är inget val.** De sex kravprofilerna står som en lista med en markerad. Ser de ut som flikar tror besökaren att de går att byta.
- **Namnen:** faktorerna heter som i testet (Samvetsgrannhet, Utåtriktning, Stabilitet, Vänlighet, Öppenhet). Utfallen är produktens: "Passar profilen" för hela kravprofilen, "Räkna med en fråga om utåtriktning". Per faktor skriver vi "Passar kravprofilen", "Räkna med en fråga" och "Inget krav i den här profilen".
- **Svarskorten på 375 px:** "Stämmer ganska bra" är det längsta svaret, 18 tecken. Det ryms på två rader i ett kort på en femtedel av bredden, men bara med 12 px text.

---

## personligt-brev

`/verktyg/personligt-brev`. Skiss `sidor/personligt-brev.html`, not `noter/personligt-brev.md`. H1, alla åtta H2, alla 25 H3, de fyra HowTo-stegen, de åtta frågorna med svar, title och description står kvar ordagrant. Här står bara det som är nytt. Rättningarna i `textbeslut.md` (BRV-1 och BRV-2) gäller som de står där.

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h1.h1` | Står kvar ordagrant. | |
| `.varde` | Vi läser jobbannonsen och ditt CV, plockar ut kraven som betyder något och skriver ett brev som låter som du. Mall, ton och språk väljer du själv. **Klart på några minuter.** | SEO: JA till "kraven" i stället för "nyckelorden". Resten ordagrant som i dag. |
| `.knapp` (primär) | Skriv ett brev nu | 17 tecken. Till `/skapa-brev/start`. SEO: JA. Knappens ord finns redan på sidan, platsen är ny. |
| `.lank` | Så fungerar det | Står kvar. |
| `.bricka` 1 | **1 brev** gratis, utan kortuppgift | Står kvar. 24 tecken. |
| `.bricka` 2 | **4 min** från annons till brev | Står kvar. 21 tecken. |
| `.bricka` 3 | **40** mallar, samma som till ditt CV | Samma ord som i dag, "mallar" flyttat till förklaringen. 30 tecken, två över måttet, men skissen är granskad på 375 px. Talet ur `BREV_MALL_ANTAL`. |
| `.kravbild`, `aria-label` | Exempel: Sara Lindströms personliga brev med annonsens krav utmärkta. Sex av sju krav har fått svar. | Bilden bär information, så den är inte `aria-hidden`. Inga rubriker i den: namnet och "Ansökan: projektledare" är stycken. |
| Arket, brevets text | Hej, / När ni söker en projektledare för byggprojekt som håller ihop upphandling och tidplan känner jag igen mina senaste tre år, där jag ledde en ombyggnad inom budget på 42 miljoner och två veckor före plan. / Ni skriver att rollen kräver vana vid offentlig upphandling enligt LOU. Jag har drivit fyra sådana, från förfrågningsunderlag till tilldelning. / Beskrivningarna skrev jag enligt AMA, och entreprenadjuridiken i AB 04 och ABT 06 har jag arbetat med i varje kontrakt. | Exempel. Snedstreck är styckebrytning. Inga namngivna projekt eller tidigare arbetsgivare (SEO: inga påhittade projekt på riktiga bolag). |
| Annonslappen (`.annons b`, stycke) | Projektledare, Sweco | Exempel. |
| Annonslappens krav | Projektledning, bygg · Upphandling, LOU · Budgetansvar · AMA · Tidplan · Entreprenadjuridik · PMP-certifiering | Exempel. Det sjunde är märkt som obesvarat. |
| `.svav` | **6 av 7** krav har fått svar | Exempel. Formen som i kontot (`kravSvar`). |

### Första handlingen (`.lyft`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Prova utan konto | Ny etikett. 16 tecken. |
| `h2.h2`, `.varde` | Står kvar ordagrant. | "Skriv ett brev utan konto". |
| Fältets etikett (`label`) | Annonsen | Som i kontot (`SKRIV.annons`). |
| Fältets platshållare | Klistra in annonsen här, hela texten. Vi läser ut kraven och skriver brevet mot dem. | Kontots platshållare slutar "mot ditt CV". Utan konto finns inget CV, därav "mot dem". |
| Fältets knapp | Skriv ett brev nu | Står kvar. Blir fältet en bild (SEO:s villkor) är knappen en vanlig länk till `/skapa-brev/start`. |
| Rad bredvid knappen (`.liten`) | Har du ingen annons? Börja med tjänsten och arbetsgivaren. | Ny. Sant: annonsen är ett valfritt fält i startflödet. |
| `.ey` över listan | Så mycket är gratis | Ny etikett. 19 tecken. |
| Punkt 1, underrad | Första stycket står på arket direkt. | Ny. Punkten över står kvar. `PREVIEW_PARAGRAPHS` är 1 i dag: blir talet ett annat följer underraden med. |
| Punkt 2, underrad | Utan kortuppgift. Allt du skrivit ligger kvar, och de två senaste breven går att ändra. | Ny. Följer textbeslut BRV-1. |
| Punkt 3, underrad | Att läsa och kopiera texten är gratis. | Ny. |
| Sista raden | Står kvar ordagrant, med länken "Brev yrke för yrke". | |

### Så fungerar det (`.vagsteg`) och tonblocket (`.toner`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Från annons till ansökan | Ny etikett. 24 tecken. |
| `h2.h2`, de fyra stegen | Står kvar ordagrant. | HowTo rörs inte. |
| `.varde` | Textbeslut BRV-2. | Skissen har dagens mening, den gäller inte. |
| Steg 1, bild | Brevet bygger på · Sara Lindström, projektledare · Byt CV | Exempel. Orden som i kontot. Miniatyrens `alt` tomt. |
| Steg 2, bild | LOU · Budgetansvar · Tidplan · +4 krav | Exempel. `aria-hidden`. |
| Steg 3, bild | Tre miniatyrer (Linne, Koppar, Ritning), `alt` tomt. | `aria-hidden`. |
| Steg 4, bild | Kopiera text · Word · Ladda ner PDF · Läs och kopiera ingår gratis. | Orden som i kontot (`BREVET`). Bild, inga länkar. |
| Tonblocket, `.ey` | Tonen | Som i kontot. |
| Tonblocket, rubrikrad (`p`, inte h-tagg) | Fem toner. Samma erfarenhet, olika röst. | SEO: ett stycke med rubrikstil, ingen ny H3. |
| Tonblocket, ingress | Exempel på hur Saras första mening kan låta i var och en av dem. Du väljer ton innan brevet skrivs. Byter du efteråt skriver vi om brevet i den nya tonen. | Skissens "byter när du vill" står inte: ett tonbyte skriver om brevet och räknas som veckans gratisbrev. |
| Språkväxeln, `aria-label` | Brevets språk | |
| Språkväxeln | Svenska · English | Som i kontot. Bild, ingen knapp. |
| Tonkort 1 | **Balanserad** Saklig men varm. Exempel: När ni söker en projektledare som håller ihop upphandling och tidplan känner jag igen mina senaste tre år. | Namn och underrad ur `TONER`. Ordet "Exempel" står synligt på varje kort (SEO). Kortet påstår inte att brevet blir exakt så. |
| Tonkort 2 | **Professionell** Saklig och formell. Exempel: Jag söker tjänsten som projektledare. De senaste tre åren har jag lett byggprojekt med fullt budgetansvar. | |
| Tonkort 3 | **Självsäker** Leder med resultat. Exempel: Jag tog en ombyggnad på 42 miljoner i mål två veckor före plan. Det gör jag gärna om hos er. | |
| Tonkort 4 | **Entusiastisk** Varm, energisk. Exempel: Upphandling och tidplan i samma roll. Er annons beskriver det jag tycker är roligast i yrket. | Skissens kolon i meningen är bytt mot punkt. |
| Tonkort 5 | **Kreativ** Vågar sticka ut. Exempel: Fyra upphandlingar, 42 miljoner, två veckor till godo. Så ser mina tre senaste år ut. | |
| `.tonauto` | **Vi väljer ton åt dig** Vi läser annonsens språk och bransch och skriver i den ton arbetsgivaren själv använder. | Namnet som i kontot (`TON_AUTO`). Chip: Premium. |
| `.knapp` under blocket | Börja skriva nu | Står kvar. |

### Mallarna (`.sekt-ton`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2.h2`, `.varde`, de sju mallkorten, länkkortet, länken under | Står kvar ordagrant. | Talen 40, 38 och priset ur konstanterna. |
| `.par`, `aria-label` | Exempel: Saras CV och personliga brev i samma mall, med samma huvud och typsnitt | Ny bild. Inga rubriker i arken. |
| Lapparna (`.lapp`) | Ditt CV · Ditt brev | Som i kontot (Mallar). |
| Mallkortens märken | Gratis · Premium | Står kvar. Gratis på Linne och Björk. |
| Mallkortens `alt` | Personligt brev i mallen Linne | Står kvar. Mönstret gäller alla sju. |
| Länkkortets miniatyrer | `alt` tomt, `aria-hidden`. | |

### Fem regler (`.regler`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2.h2`, `.varde`, de fem reglernas `h3` och text | Står kvar ordagrant. | |
| `.trebrev .ey` | Brevets tre stycken | Finns som `aria-label` i dag, nu också synlig etikett. |
| Öppningen, exempelrad (`em`) | När ni söker en projektledare som håller ihop upphandling och tidplan ... | Exempel, ur Saras brev. Raderna över ("Visa att du läst annonsen ...") står kvar. |
| Mitten, exempelrad | ... inom budget på 42 miljoner och två veckor före plan. | Exempel. |
| Avslutet, exempelrad | Jag berättar gärna mer om hur jag skulle lägga upp de första nittio dagarna. | Exempel. |
| Skalan, `aria-label` | Ett personligt brev bör vara 250 till 350 ord, alltså en sida | |
| Skalan | för kort · 250 till 350 ord · för långt | |
| Raden under skalan | Står kvar ordagrant. | "En sida, 250 till 350 ord. ..." |
| Regel 1, före (`s`) | Van att hantera intressenter | Ny. Märk raderna "Före" och "Efter" för skärmläsare (`aria-label` eller dold text). |
| Regel 1, efter (`b`) | Ledde intressentdialogen i tre projekt | SEO, ordagrant. Skissens "Stakeholder management i tre projekt" står inte. Se listan Stämmer inte. |
| Regel 2, före | Duktig på försäljning | Ny rad, orden finns i regelns text. |
| Regel 2, efter | Drev försäljningen från 2 till 12 mkr på två år | Ny rad, orden finns i regelns text. |

### Resultatet (`.o` med `.kravpanel`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2.h2` | Står kvar ordagrant. | |
| `.varde` | Varje krav i annonsen får en siffra, och du ser i brevet var det besvaras. **Saknas ett krav lägger du till en mening om det när brevet är klart.** | Ny ingress. Andra meningen står i dag på telefonskärmen. |
| Kravpanelen, `aria-label` | Exempel: kraven i annonsen och var Saras brev svarar på dem | |
| Panelens huvud (stycken) | Kraven i annonsen · 6 av 7 har fått svar i brevet | Som i kontot (`kravRubrik`, `kravSidorad`). Ingen h-tagg. |
| Krav 1 | Projektledning, bygg: mina senaste tre år, där jag ledde en ombyggnad | Exempel. Citatet ur brevet i hjälten, ord för ord. Ett par citattecken, inte dubbla. |
| Krav 2 | Offentlig upphandling, LOU: Jag har drivit fyra sådana, från förfrågningsunderlag till tilldelning | Exempel. |
| Krav 3 | Budgetansvar: inom budget på 42 miljoner | Exempel. |
| Krav 4 | AMA: Beskrivningarna skrev jag enligt AMA | Exempel. |
| Krav 5 | Tidplan: två veckor före plan | Exempel. |
| Krav 6 | Entreprenadjuridik: AB 04 och ABT 06 har jag arbetat med i varje kontrakt | Exempel. |
| Krav 7, saknas | PMP-certifiering · Står i annonsen men inte i brevet. | Exempel. Raden som i kontot (`saknasRad`). |
| Krav 7, fältets platshållare | En mening med ett exempel ur ditt CV räcker. | Som i kontot (`saknasPlats`). |
| Krav 7, knappen i bilden | Lägg till i brevet | Som i kontot. Bild, ingen knapp. |
| Kort 1, `h3` | Ett brev gratis | Står kvar. Chipet står utanför `h3`, annars blir rubriken "Ett brev gratis utan kortuppgift" och SEO:s rubrik ändras. |
| Kort 1, chip | utan kortuppgift | Nytt märke. |
| Kort 1, text | Textbeslut BRV-1. | |
| Kort 2, chip | Premium | Nytt märke, utanför `h3` "PDF och Word". |
| Kort 2 och 3, text | Står kvar ordagrant. | Priset i kort 3 ur `PLANS`. |
| `.knapp` | Skriv ditt första brev gratis | Står kvar. 29 tecken: bryts på två rader på 375 px, som i dag. |

### Läs mer (`.las`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2.h2`, `.varde`, de sex `h3` och deras texter | Står kvar ordagrant. | |
| Stora kortets tal (`.tal`) | 89 | SEO: talet ur datan, inte skrivet för hand. |
| Stora kortets länkrad (`.lank`) | Se alla yrken | Ny. Hela kortet är länken till `/personligt-brev-exempel`. |
| Stora kortets tre brevark | `alt` tomt, `aria-hidden`. | |

### Premium (`.premium`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2.h2`, stycket, de två knapparna | Står kvar ordagrant. | |
| `.pris` | 149 kr i månaden, säg upp när du vill | Ny form. Priset ur `PLANS`. Inga kampanjord. |
| Bock 1 | Personliga brev utan tak, med tonen vald åt dig | Ny. |
| Bock 2 | Alla 40 mallar, PDF i alla och Word i 26 | Ny. Talen ur `BREV_MALL_ANTAL` och `BREV_WORD_ANTAL` (SEO). |
| Bock 3 | Rekryteringstesterna, CV-analysens alla förslag, Matchade jobb och Jobbcoachen | Ny. Skissen hade "jobbmatchning" och saknade Jobbcoachen. "alla förslag" enligt textbeslut GEM-5. |

### Frågorna (`.faq`) och slutet

| Plats | Lydelse | Not |
|---|---|---|
| `h2.h2`, `.varde`, de åtta frågorna och svaren | Står kvar ordagrant, med BRV-1 i svaret om gratis. | SEO: NEJ till att ändra svaret om ChatGPT. |
| Svaret "Är det säkert att lämna mitt CV och era brev?" | Ägarens, skrivs inte. Står kvar ordagrant som i dag. | Skissens platshållare är ingen text. |
| `.knapp` efter frågorna, fasta knappraden i telefonen | Skapa ditt brev gratis | Står kvar. 22 tecken. Till registreringen. |

### UX-kontrollen, den här sidan

- **Primär handling:** hjältens och lyftkortets knapp heter samma sak, "Skriv ett brev nu", och går till samma ställe. På dator syns båda samtidigt: låt lyftkortets vara kopparknappen och gör hjältens till `.knapp-vit` om de hamnar på samma skärmyta. Längre ned leder kopparknapparna till registreringen ("Skriv ditt första brev gratis", "Skapa ditt brev gratis"). Två mål på en sida är rätt här: prova först, konto sedan.
- **Namnen** stämmer med kontot: Annonsen, Kraven i annonsen, "N av N har fått svar i brevet", Lägg till i brevet, Brevet bygger på, Byt CV, Kopiera text, Word, Ladda ner PDF, Tonen, Vi väljer ton åt dig, och de fem tonerna med sina underrader.
- **Mått:** alla nya etiketter är under 25 tecken. Tredje talbrickans förklaring är 30 tecken, se noten.
- **Ordantal:** allt nytt är tillägg. Telefonskärmarna som försvinner var `aria-hidden` och räknades inte.

---

## priser

`/priser`. Skiss `sidor/priser.html`, not `noter/priser.md`. H1, titeln, alla H2, de fem H3, de fyra frågorna, länkarna och schemat står kvar. Description enligt textbeslut PRI-9. Löptext, steg och tabellens rader läses ur `paket-copy.ts` och `priser-data.ts` med textbeslutets lydelser (PRI-1 till PRI-11, GEM-4, GEM-7 till GEM-13). Här står det som är nytt: de fyra delarna i hjälten, prislappens huvud, gratisnivåns fyra kort, raderna Gratis och Premium, H3 Sökta tjänster, kortet Inför intervjun, vägen Kom igång, tabellens huvuden och tre nya rader, och Premiumytan i slutet.

### Hjälten (`.vagg.hjalte`) och prislappen (`.prislapp`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h1`, ingressen, de tre ankarlänkarna | Står kvar ordagrant som i koden. | Ingressens fetade rad är textbeslutets: "Rekryteringstester, CV, personliga brev och Jobbsöket med jobbmatchning, sökta tjänster och Jobbcoachen". Skissens kortare rad gäller inte. |
| `.fyra-delar`, `aria-label` | Alla fyra delarna ingår | |
| `.fyra-delar` | Rekryteringstester · CV · Personliga brev · Jobbsöket | Ny rad. Namnen som i kontot (`RUM_NAMN`). Inga länkar. |
| Prislappens huvud (`.pl-topp`) | **Jobbcoach Premium** Säg upp när du vill | Ny. Stycken, ingen rubrik. |
| `.pl-pris` | 149 kr i månaden | Ur `PLANS`. Kampanjpriset visas här som i dag och ingen annanstans (SEO:s villkor 6). |
| Köpknappen | Köp Premium, 149 kr i månaden | Står kvar, ur `kopKnapp()`. 29 tecken: den är fullbred på prislappen och ryms. |
| Rad under knappen | Kortbetalning via Stripe. Kvitto på mejl. | Står kvar. |
| `h2` på prislappen | Allt i Premium | Står kvar som H2. |
| `.bockar` | Läses ur `HELA_PAKETET_RADER`. | Textbeslut GEM-4, sex rader. Skriv inte listan för hand. |

### Vill du se först? (`.lyft`, `#gratis`)

SEO:s villkor: varje fakta i dagens långa mening (`GRATIS_MENING_LANG`) ska finnas i korten. Kontrollerat rad för rad nedan. Räkna orden före och efter.

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Gratisnivån, 0 kr | Ny. |
| `h2` | Vill du se först? | Står kvar. |
| `.varde` | Det här gör du utan att betala. Inget kort behövs, och kontot ligger kvar så länge du vill. | Ersätter "Inget kort. Ligger kvar så länge du vill." |
| `.knapp-vit` | Skapa konto gratis | Står kvar. Vit här, eftersom köpknappen på prislappen är skärmytans kopparknapp. |
| Kort 1, namn | Rekryteringstester | Stycke. |
| Kort 1, tal | **1** test om dagen | |
| Kort 1, rader | Grundnivån i alla åtta testtyperna · Förklaring efter varje uppgift · Personlighetstestet med 50 påståenden | 50 ur `GRATIS_PASTAENDEN`. |
| Kort 2, namn | CV | |
| Kort 2, tal | **2** CV-mallar och en nedladdning | 28 tecken. Ur `FREE_TEMPLATE_COUNT` och `FREE_CV_EXPORTS`. |
| Kort 2, rader | CV-analysens läsbarhetspoäng och genomgång i sju delar, för varje CV · Jobbcoachens förslag en gång, det tyngsta öppet | |
| Kort 3, namn | Personliga brev | |
| Kort 3, tal | **1** brev var sjunde dag | Ur `GRATIS_BREVFONSTER`. |
| Kort 3, rader | Första personliga brevet direkt · Alla brev sparas, och de två senaste går att ändra · Nedladdning ingår inte | |
| Kort 4, namn | Jobbsöket | |
| Kort 4, tal | **3** matchade jobb | Ur `FREE_TIER_JOB_LIMIT`. |
| Kort 4, rader | Sökta tjänster med Ska sökas, veckans mål och det första uppföljningsmejlet · Tio meddelanden till Jobbcoachen · Ett intervjuprov om dagen | Första raden är `GRATIS_LISTA` rad 6, ordagrant. |

### Vad du faktiskt får, funktion för funktion (`#funktioner`)

Raderna Gratis och Premium (`.niv`) är samma som på /funktioner och läses ur samma källa: se sektionen funktioner, tabellen Raden Gratis och Premium. Löptext och steg står kvar ordagrant som i koden.

| Plats | Lydelse | Not |
|---|---|---|
| `h2` och ingressen | Står kvar ordagrant. | |
| Rekryteringstester, `.ey` | Inför urvalstestet | Ny etikett. |
| Rekryteringstester, bankraden | **3 500+** uppgifter. Nivån räknas bara på det du inte sett den senaste månaden. | Står kvar. Talet räknas ur banken som i dag. |
| Rekryteringstester, länken | Står kvar ordagrant, med talet ur `TESTTAL`. | "Gör personlighetstestet, 20 påståenden utan konto". |
| Kortet under testramen, `.ey` | Efter personlighetstestet | Nytt kort. |
| Kortet, rubrikrad (fet rad, stycke) | Frågor rekryteraren lär ställa | Ingen ny rubriknivå på prissidan. |
| Kortet, text | "När kostade strukturen dig flexibilitet?" Du får frågorna som din profil brukar väcka, med förslag på hur du svarar. | Exempel. Frågan finns i produkten (`src/lib/personlighet/smakprov-tolkning.ts`). |
| Kortet, underrad | Exempel, utifrån hög samvetsgrannhet | |
| CV-analysen, `.ey` | Inför ansökan | Ny etikett. |
| Personliga brev, `.ey` | Till varje annons | Ny etikett. |
| Matchade jobb, `.ey` | Jobben du annars missar | Ny etikett. |
| Jobbcoachen, `.ey` | Hela vägen | Ny etikett. |
| Bildernas `aria-label` | Samma som på startsidan: testramen, CV-arket, brevparet, träffarna och samtalet. | Se sektionen start. Samtalet utan belopp och källmärke. |
| Ny H3: Sökta tjänster, `.ey` | Gratis för alla med konto | 25 tecken. Skissens "Nyhet" står inte: etiketten ska hålla längre än ett märke som tas bort i januari. |
| Sökta tjänster, `h3` | Sökta tjänster | SEO har sagt ja. |
| Sökta tjänster, rad under rubriken | Gratis för alla med konto. I Premium: uppföljningsmejl till varje sökt tjänst och rapporten att skriva ut. | Copys GEM-12, ordagrant. Ritas som två rader med chip, som de andra. |
| Sökta tjänster, text | Den som söker många jobb tappar lätt bort vem som har svarat. Här sparar du annonsen du ska söka, med sista ansökningsdag, loggar den du har sökt och följer varje tjänst från Sökt till Erbjudande. Veckans mål håller takten uppe. Efter tolv tysta dagar föreslår vi ett uppföljningsmejl och skriver utkastet, som öppnas i din egen e-post. Vi skickar aldrig något åt dig. Månadens sökta jobb står sammanställda som underlag till aktivitetsrapporten hos Arbetsförmedlingen, och den lämnar du in själv. | Copys GEM-12, ordagrant. "tolv" ur `NO_RESPONSE_NUDGE_DAYS`. |
| Sökta tjänster, `.veckomal` | Veckans mål: 2 av 3 sökta | Exempel. |
| Sökta tjänster, länk | Så fungerar Sökta tjänster | SEO:s ankartext. Till `/verktyg/sokta-tjanster`. Skissen saknar länken. |
| Sökta tjänster, bildens `aria-label` | Exempel: sökta tjänster, från Ska sökas till Erbjudande | Copys bildtext i GEM-12. |
| Nytt kort: Inför intervjun, namn | Inför intervjun | Textbeslut B-9. H3 som de andra korten. Skissen saknar kortet. Lägg det bredvid Sökta tjänster. |
| Inför intervjun, rad under rubriken | Ingår i Premium. Gratis: ett intervjuprov om dagen. | Copys GEM-12, ordagrant. Gränsen ur konstanten. |
| Inför intervjun, text | Svara på en intervjufråga och få återkoppling som från en rekryterare: vad som hördes, och vad som saknades. När du är kallad skriver du in när intervjun är, så står den under Intervjuer på gång med förberedelserna bredvid. Efteråt frågar vi hur det gick, och hör du inget på sju dagar påminner vi om att fråga efter besked. | Copys GEM-12, ordagrant. "sju" ur `INTERVJU_BESKED_DAGAR`. |
| Inför intervjun, bildens `aria-label` | Exempel: intervjuprovet med återkoppling på svaret | Copys bildtext. |

### Kom igång (`#guide`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, ingressen | Står kvar ordagrant. | "Första kvällen". |
| Villkoren (`.villkor`), tre kort | Står kvar ordagrant som i koden (`FORTROENDE`). | Listans `aria-label`: Villkor. |
| Listans etikett | 12 steg | Textbeslut GEM-13: ``${KOM_IGANG_LISTA.allt.length} steg``. Skissens "Kom igång, steg för steg" gäller inte. |
| De tolv stoppen | Läses ur `GUIDE.listor.allt.steg`, i produktens ordning. | Textbeslut GEM-13. Skissens elva stopp gäller inte. |
| Stoppens småmärken (ny underrad per stopp) | Konto · CV · CV · CV · Jobbsöket · CV · Personliga brev · CV · Jobbsöket · Jobbsöket · Rekryteringstester · Jobbsöket | Ett per stopp, i listans ordning: profilen, CV uppladdat, CV-analysen, CV:t uppdaterat, första jobbmatchningen, mall vald, personligt brev, LinkedIn-profilen, Bli upptäckt, Jobbcoachen, rekryteringstesterna, intervjuprovet. Märket styr stoppets färg. |

### Vad som ingår, rad för rad (`#tabell`)

Tabellen står kvar som tabell i HTML. Radernas etiketter och celler läses ur `COMPARISON` med textbeslutets lydelser (PRI-1, PRI-5, PRI-6, PRI-7, B-18). Skissens omskrivna etiketter ("CV-analysens poäng och genomgång", "De 25 bästa", "Riktad träning") gäller inte: SEO kräver att etiketterna CV-analys, CV-nedladdning, Personliga brev, Matchade jobb, Jobbcoachen och Intervjuprovet står.

| Plats | Lydelse | Not |
|---|---|---|
| `h2` | Vad som ingår, rad för rad | Står kvar. |
| `.varde` | Gratis till vänster, Premium till höger. Samma ordning som i kontot. | Ny rad. |
| Kolumnhuvud 1 | **Gratis** 0 kr, inget kort | Underraden är ny. |
| Kolumnhuvud 2 | **Premium** 149 kr i månaden | Underraden är ny. Priset ur `PLANS`. |
| Gruppnamn | Rekryteringstester · CV · Personliga brev · Jobbsöket | Dagens grupp "CV och personliga brev" delas i två. Gruppnamnen är inga rubriker. |
| CV-mallar, nya underrader i cellerna | Gratis: Linne och Björk. Premium: 26 också som Word | Namnen och talet ur katalogen. |
| Ny rad 1, etikett | Nedladdning av brev | Under: som PDF eller Word |
| Ny rad 1, celler | Gratis: Ingår inte. Premium: Ingår, med underraden PDF i alla mallar, Word i 26 | 26 ur `BREV_WORD_ANTAL`. |
| Ny rad 2, etikett | Brevmallar | Under: samma 40 som för CV |
| Ny rad 2, celler | Gratis: 2 mallar, med underraden Linne och Björk. Premium: Alla 40 | Ur `BREV_GRATIS_ANTAL`, `BREV_GRATIS_NAMN`, `BREV_MALL_ANTAL`. |
| Ny rad 3, etikett | Ton | Under: fem att välja mellan |
| Ny rad 3, celler | Gratis: Du väljer. Premium: Du väljer, eller så väljer vi efter annonsen | Skissens Premiumcell "Vi väljer åt dig efter annonsen" låter som att valet försvinner. |
| Rapporten, gratiscellen | Antalen per månad | Står redan i koden. Skissens "Ingår inte" gäller inte (textbeslut Del 4 punkt 9). |
| Tabellens `aria-label` eller `caption` | Vad som ingår gratis och i Premium | Står kvar. |

### Frågorna och slutet (`#fragor`, `.premium`)

| Plats | Lydelse | Not |
|---|---|---|
| `h2` och de fyra frågorna med svar | Står kvar ordagrant som i koden. | Textbeslut PRI-8. |
| Premiumytan, `.ey` | Jobbcoach Premium | Ny yta. |
| Premiumytan, rubrikrad (`p.h2`, stycke) | Allt öppet från första minuten. | Ingen H2. |
| Premiumytan, text | Ingen bindningstid. Dagen innan månaden förnyas mejlar vi vad du har gjort, så att du kan säga upp om du är klar. | |
| `.pris` | 149 kr i månaden, säg upp när du vill | Ur `PLANS`. |
| Köpknappen | Köp Premium, 149 kr i månaden | Står kvar. |
| `.lank` | Eller börja gratis | Står kvar. Till `/register`. |
| Fasta köpraden i telefonen | Står kvar som i dag. | |

### UX-kontrollen, den här sidan

- **En primär handling per skärmyta:** köpknappen är kopparknappen, på prislappen och i slutet. "Skapa konto gratis" i gratisnivåns kort är vit, annars står två kopparknappar på samma skärm i datorn.
- **Köpknappen** är 29 tecken med priset. Den är fullbred på prislappen och i den fasta raden och ryms på 375 px. Korta den inte: priset efter namnet är regeln.
- **Namnen** stämmer med kontot: Rekryteringstester, CV, Personliga brev, Jobbsöket, Sökta tjänster, Inför intervjun, Intervjuer på gång, Din utveckling, Profil och Prenumeration.
- **Tabellen i telefonen:** varje rads etikett står överst och de två cellerna bredvid varandra. Cellen "Du väljer, eller så väljer vi efter annonsen" är den längsta nya och bryts på tre rader i 375 px, vilket ryms.

---

## registrering

`/register` och de två skärmarna efter kontot. Skiss `sidor/registrering.html`, not `noter/registrering.md`. H1 "Skapa ditt konto", titeln, raden under rubriken, Google-knappen, fälten, kryssrutan och knappen "Skapa konto" står ordagrant. Den juridiska raden under knappen, samtycket om ångerrätten och villkorsraderna i köpsteget: ägarens, skrivs inte, och rörs inte. Nytt är det fjärde kortet i "Det här ingår gratis", Premiumraden under korten och valen i "Vad vill du börja med?".

### Toppraden (`.topp`)

| Plats | Lydelse | Not |
|---|---|---|
| Frågan och länken | Har du redan ett konto? · Logga in | Står kvar. Ingen meny, som i dag. |

### Det här ingår gratis (`.delar4`, `KONTO_GRATIS`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Det här ingår gratis | Står kvar. |
| `h2` | Börja med det som avgör urvalet | Står kvar (SEO). |
| Kort 1, namn | Rekryteringstesterna | Står kvar. Stycke, ingen rubrik. |
| Kort 1, text | Grundnivån i alla åtta testtyperna, ett test om dagen, med förklaring efter varje uppgift. | "genomgång av varje fråga" blir "förklaring efter varje uppgift", produktens ord. "typerna" blir "testtyperna". Talet ur `TESTTYPER_ORD`. |
| Kort 2, namn | CV-analysen | Står kvar. |
| Kort 2, text | Läsbarhetspoängen och vad som saknas, del för del, för varje CV. | Textbeslut REG-1. Skissens "genomgången i sju delar" gäller inte. |
| Kort 2, bild | **93** av 100 | Exempel, `aria-hidden`. |
| Kort 3, namn | Ett personligt brev | Står kvar. |
| Kort 3, text | Skrivet på annonsen utifrån ditt CV. | Står kvar. |
| Kort 4, namn | Jobbsöket | Nytt kort. |
| Kort 4, text | Tre matchade jobb, och Sökta tjänster som håller koll på varje jobb du har sökt. | Nytt. Talet ur `FREE_TIER_JOB_LIMIT`. |
| Premiumraden (`.prem-not`) | **Jobbcoach Premium**, 149 kr i månaden, när du vill ha alla verktyg, nivåer och mallar. Säg upp när du vill. | Namnet helt utskrivet, priset efter. Ur `PLANS`. "allt utan tak" står inte (textbeslut Del 4 punkt 6). |

### Köpsteget efter kontot (skärm 2)

Inga nya texter. Listan läses ur `HELA_PAKETET_RADER`, samma källa som /priser (textbeslut GEM-4). Etiketterna, raden om första steget, knappen "Till betalning, 149 kr", länken "Börja gratis i stället" och raden om Stripe står kvar. Samtycket och villkorsraderna: ägarens, skrivs inte. Kampanjpriset visas som i dag.

### Vad vill du börja med? (skärm 3, `SPARVAL_GRATIS`)

BYGGBRIEF beslut 5 avgör formen: fem val bara om valet går att koppla till landningen utan att röra inloggat. Båda uppsättningarna står här.

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, rubrik, ingress, knapp | Står kvar ordagrant. | "Sista steget", "Vad vill du börja med?", "Till hemskärmen". |
| Valens grupp, `aria-label` | Vad vill du börja med? | |
| Fem val, val 1 | **Rekryteringstester** Grundnivån i varje testtyp ligger öppen. | Namnet byts från "Urvalstester" (SEO har sagt ja). Texten står kvar. Förvalt. |
| Fem val, val 2 | **CV** Vi läser ditt CV och visar vad en rekryterare ser. | Texten står kvar. |
| Fem val, val 3 | **Personliga brev** Klistra in annonsen, så skriver vi det personliga brevet utifrån ditt CV. | Nytt val. |
| Fem val, val 4 | **Jobbsöket** Vi matchar ditt CV mot lediga jobb i Platsbanken, skriver varför de passar och håller koll på dem du har sökt. | Nytt val. Textbeslut REG-3. |
| Fem val, val 5 | **Jag vet inte än** Då visar vi hemskärmen som den är. | Står kvar. |
| Tre val, om fem inte går | **Rekryteringstester** · **CV och personliga brev** · **Jag vet inte än** | Dagens tre, med testerna först och det nya namnet. Texterna står kvar. |

### UX-kontrollen, den här sidan

- **En primär handling per skärm:** Skapa konto på kontosidan, Till betalning i köpsteget, Till hemskärmen i valet. Google-knappen är vit.
- **Namnen** stämmer med kontot: Rekryteringstester, CV, Personliga brev, Jobbsöket, Sökta tjänster. Valet markeras med mörk kant och bock, aldrig med koppar, så att knappen förblir skärmens enda kopparyta.
- **Telefonen:** kontokortet ligger först, de fyra gratiskorten under. Premiumraden är 97 tecken och bryts på tre rader i 375 px.

---

## rekryteringstester

`/verktyg/rekryteringstester`. Skiss `sidor/rekryteringstester.html`, not `noter/rekryteringstester.md`. H1, alla tolv H2, alla H3 utom steg 2, de 17 frågorna, guidelänkarna och filmen står kvar ordagrant. Här står bara det som är nytt eller bytt. Där skissen har kortat en befintlig text gäller den befintliga, hela.

Två saker gäller hela sidan:

- **Uppgift, inte fråga.** SEO har sagt ja till bytet på de ställen som står i tabellerna nedan. Byt inte på andra ställen i den här omgången (textbeslut B4: resten tas i ett eget svep).
- **De ritade skärmarna** (startskärmen, uppgiften, resultatet, listan, typkortens småuppgifter) är bilder: `role="img"` med `aria-label` eller `aria-hidden`, inga rubriker i dem. Texten i dem är kontots egen (`src/components/session/copy.ts`) och räknas inte som sidans ord. Uppgifterna hämtas ur bankens publika exempel. Skissens uppgifter (talserien 3, 7, 15, 31, kön med Ali, Britt och Cleo, skolmatsavtalet, tabellen med Norr, Syd och Väst, UTFÖRLIG) används bara om de är kontrollräknade och listade i loggen.

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Rekryteringstester, kom förberedd till provet | Står kvar. 45 tecken, bryts på två rader på 375 px. Låt den brytas, korta inte. |
| `.varde`, andra och tredje meningen | **Fem uppgifter gratis här, grundnivån i alla åtta testtyperna, ett test om dagen, gratis med konto.** Ingen kortuppgift, och du ser rätt och fel direkt efter varje test. | Dagens mening med "uppgifter" i stället för "frågor". Första meningen står orörd. Skissen stryker sista meningen; den står kvar, den är sann och sidan har inga ord att ge bort. |
| `.knapp` (primär) | Gör ett prov direkt | 19 tecken. Till `/verktyg/rekryteringstester/prova`. Ny lydelse: knappen leder till provet utan konto, inte till registreringen. |
| `.lank` | Se alla tester | Står kvar. |
| `.bricka` 1 | **8** testtyper, grundnivån gratis | 27 tecken. Talet ur `ANTAL_TESTTYPER`. |
| `.bricka` 2 | **3** nivåer i varje testtyp | 22 tecken. Ny. Ersätter "20 min per test", som inte stämmer för alla typer. |
| `.bricka` 3 | **5** uppgifter utan konto | 20 tecken. |
| `.hbild`, `aria-label` | Exempel: en uppgift i matrislogik som den ser ut i testet, med klockan och framstegsstapeln | Bilden bär `role="img"`. |
| Ramens texter (i bilden) | Matrislogik · Grundnivå · 9 av 15 · Vilken figur hör hemma i den tomma rutan? · Nästa | Exempel. Knappen heter Nästa, som i kontot. |
| `.svav.res` | 12 av 15 · rätt på grundnivån | Exempel. |
| `.svav.regel` | Förklaringen · (uppgiftens egen förklaring ur banken) | Etiketten "Förklaringen" som i kontot. Förklaringens text följer uppgiften som ritas. |

### Provet utan konto (`.lyft`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Prova utan konto | Ny. |
| `h2.h2` | Gör ett prov direkt, utan konto | Står kvar. |
| `.varde` | Du behöver inte registrera dig för att se var du står. Fem uppgifter tar ett par minuter. | Dagens text med "uppgifter". |
| Frågan över typvalet (stycke, ingen rubrik) | Vilket test vill du prova? | Ny. |
| `.typval`, nio länkar till `/verktyg/rekryteringstester/prova?typ=` | Matrislogik · Figurserier · Deduktivt · Verbalt · Numeriskt · Talserier · Spatial förmåga · Ordförråd · I-provet | Nya länkar. De publika namnen, inte kontots (SEO). Matrislogik är förvald. |
| `.knapp` | Starta provet | 13 tecken. Som på provsidan. Lyftets enda kopparknapp. |
| `.liten` | Ingen inloggning, inget kort. | Står kvar. |
| `.provres`, `aria-label` | Exempel: resultatet efter provet | |
| `.provres .ey` | Det här ser du efteråt | Ny. |
| `.provres .tal` | 3 av 5 · rätt | Exempel. |
| `.tdom-rad` | Din första miss, uppgift 2 | Exempel. "Din första miss" som i provet (`prov-copy.ts`). |
| `.tdom-kropp` | Regeln · (uppgiftens regel ur banken) · Du valde B. Rätt svar är D. | Exempel. Formen "Du valde X. Rätt svar är Y." som i provet. |
| `.las` | Uppgift 5 väntar i kontot, förklarad på samma sätt. | Provets egen rad. Skissens "väntar i ett gratiskonto" säger samma sak med andra ord än provet. |
| `.bockar` 1 | Samma typ av uppgifter som i de skarpa testen | Dagens rad med "uppgifter". |
| `.bockar` 2 | Resultatet direkt, utan klocka | Dagens "Resultat direkt, ingen tidtagning", filad. |
| `.bockar` 3 | Rätt svar och regeln bakom en av uppgifterna | Ny. Ersätter "Fem matrislogikfrågor": provet finns nu i nio typer och öppnar ett facit före konto. |

Dagens knapp "Prova fem frågor" i den här rutan ersätts av "Starta provet". Länkmålet `/verktyg/rekryteringstester/prova` står kvar genom typvalet.

### Så fungerar det (`.topprad`, `.skarmar`, HowTo)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Fyra steg, från start till genomgång | Ny. 35 tecken. Skissens etikett upprepar ingressens första ord. |
| `h2.h2` | Så fungerar det | Står kvar. |
| `.varde` | Från första uppgiften till färdig rapport. Ingen registrering innan du provar, du börjar inom 30 sekunder. Alla tester går till på samma sätt: en startskärm som säger vad som gäller, uppgifterna med klocka och framstegsstapel, och ett resultat där varje uppgift går att öppna. | Dagens ingress med "uppgiften", plus en ny mening. Skissens ord "ram" står inte i synlig text. |
| `.knapp-vit` | Starta gratis test | Står kvar. |
| Filmens rad | Film · Så går ett test till · Slå på ljud | "Film" och "Så går ett test till" är nya. Filmen och VideoObject orörda. |
| Steg 1, `h3` | Välj test | Står kvar. |
| Steg 1, text | Välj bland åtta testtyper, från matrislogik till talserier. Startskärmen säger hur många uppgifter det är, hur lång provets tid är och vad som sparas. Grundnivån i varje typ är gratis med konto, med genomgång efteråt. | Dagens text med en ny mening i mitten. Skissen stryker "med genomgång efteråt"; det står kvar. |
| Steg 2, `h3` | Lös uppgifterna i din takt | SEO. `RUBRIK_BYTT`. |
| Steg 2, text | Klockan visar provets tid, och stapeln har en bit per uppgift. Ingenting bryter mitt i en uppgift: markera ditt svar, gå vidare med Nästa och lämna in när du är klar. | Ny. Dagens "Timern räknar uppåt" är osann. |
| Steg 3, `h3` | Se resultat och tid direkt | Står kvar. |
| Steg 3, text | När du har lämnat in ser du antal rätt, tiden mot provets tid och var missarna sitter, uppgift för uppgift. Du väntar inte på något. | Ny. |
| Steg 4, `h3` | Se vad du missade | Står kvar. |
| Steg 4, text | Varje uppgift står i listan med ditt svar och det rätta. Öppna en rad, så ser du regeln bakom uppgiften och var ditt eget svar gick snett. Du ser vilka mönster du missade och vet vad du ska träna mer på. | Ny, med dagens sista mening kvar. |
| Skärm 1, `aria-label` | Exempel: startskärmen före ett test i talserier på grundnivå | |
| Skärm 1, texter | Nivåtest · Talserier, grundnivå · 15 uppgifter. Provets tid är 12 minuter, klockan stoppar dig inte. · Rätt svar efteråt, med genomgång. · Resultatet syns i Din utveckling. · Starta testet · Ett grundnivåtest om dagen ingår gratis, valfri testtyp. | Exempel. Läs raderna ur startskärmens regler i kontot, hitta inte på dem. "Nivåtest" är lägets namn i kontot och får stå i bilden. Ordet Nivåkollen står aldrig på sidan. |
| Skärm 2, `aria-label` | Exempel: en uppgift i talserier, uppgift 9 av 15 | |
| Skärm 3, `aria-label` | Exempel: resultatet, 12 av 15 rätt inom provets tid | |
| Skärm 3, texter | Nivåtestet klart · 12 av 15 rätt · Inom provets tid · Uppgifterna · Det du missade | Exempel. Etiketterna som i kontot. |
| Skärm 3, brickraden, `aria-label` | Femton uppgifter: fel på uppgift 4, 9 och 13 | Exempel. |
| Skärm 4, `aria-label` | Exempel: uppgiftslistan med en utfälld rad, förklaringen och ditt misstag | |
| Skärm 4, texter | Femton uppgifter, tre fel · Alla · Bara fel · Inte den här · Förklaringen · Ditt misstag | Exempel. Etiketterna som i kontot. |

HowTo-stegen i JSON-LD följer rubrik och text ovan, ordagrant (`LD_UNDANTAG` finns).

### Sex färdigheter (`.fard`)

Rubrik, ingress och de sex korten står kvar ordagrant. Bilderna är nya och `aria-hidden`. Deras småtexter:

| Plats | Lydelse | Not |
|---|---|---|
| Logiskt tänkande, `.fbild` | Om A så B · A gäller · B | `aria-hidden`. |
| Kritiskt tänkande, `.fbild` | Sant · Falskt · Går inte att avgöra | `aria-hidden`. |
| Snabbräkning, `.fbild` | 48 → 60 · +25 % | `aria-hidden`. Stämmer: 12 av 48 är 25 procent. |

### Åtta testtyper (`.nivaer`, `.typer`)

| Plats | Lydelse | Not |
|---|---|---|
| `.varde`, meningen om nivåtestet | Grundnivån visar var du står i varje typ. | SEO, ordagrant. Ersätter "I matrislogik, figurserier, deduktiv slutledning, verbalt och numeriskt börjar du med ett kort nivåtest som visar var du står." Resten av ingressen, med priset ur `PLANS`, står kvar. |
| `.nivaer`, `aria-label` | Tre nivåer i varje testtyp | Ny. |
| Nivå 1 | **Grundnivå** Ett test om dagen, valfri testtyp · Gratis | Ny. Stycke, ingen rubrik. |
| Nivå 2 | **Avancerad nivå** Svårare uppgifter, samma format · Premium | Ny. |
| Nivå 3 | **Expertnivå** Svårast, och övningsprov mot klockan · Premium | Ny. |
| Typkortens nivårader | Grundnivå · Avancerad nivå | Chip i stället för fet text. Raderna står kvar med "uppgifter" i stället för "frågor" i Matrislogik, Numeriskt resonemang och Figurserier ("15 uppgifter, cirka 20 minuter"). |
| Figurserier och Deduktiv slutledning, andra raden | Avancerad nivå och expertnivå i Premium | Dagens "Avancerad och expert I Premium" med nivåernas hela namn. |
| Typkortens bilder, `aria-label` | Exempel: en matrisuppgift · Exempel: en uppgift i verbalt resonemang · Exempel: en uppgift i numeriskt resonemang · Exempel: en figurserie · Exempel: en uppgift i deduktiv slutledning · Exempel: en talserie · Exempel: en uppgift i spatial förmåga · Exempel: en uppgift i ordförråd | En per kort. Uppgiften ur bankens publika exempel. |
| `.knapp` under korten | Starta gratis test | Står kvar. |
| `.liten` bredvid | Gratis konto, inget kort. | Ny. |

De åtta H3 och deras texter står kvar ordagrant.

### Vilket test ska du göra? (`.inbj`)

Rubrik, ingress, de åtta H3, texterna och guidelänkarna står kvar ordagrant. Nytt är märkena som säger vad testet består av, och "uppgifter" i tre knappar.

| Plats | Lydelse | Not |
|---|---|---|
| Polisen eller Försvarsmakten, `.bestar` | Ord · Tal · Rumsuppfattning | Ny. |
| Matrigma, `.bestar` | Matriser | Ny. |
| Alva Labs, `.bestar` | Matriser · Adaptivt | Ny. |
| SHL, `.bestar` | Deduktivt · Induktivt · Numeriskt | Ny. |
| Aon, `.bestar` | Figurserier · 5 till 12 min | Ny. Tiden står redan i kortets text. |
| Lokförare, `.bestar` | Figurserier · Deduktivt · Siffror · Ord | Ny. |
| Annat eller vet inte, `.bestar` | Översikten | Ny. |
| Personlighet, `.bestar` | Fem faktorer | Ny. |
| Knappen i Matrigma, Alva Labs och Annat | Prova fem matrisuppgifter | 24 tecken. Dagens "Prova fem matrisfrågor". |
| Övriga knappar | Prova sex uppgifter ur I-provet · Prova fem deduktiva uppgifter · Prova fem figurserier · Gör personlighetsprovet | Står kvar. "Prova sex uppgifter ur I-provet" är 31 tecken: låt knappen fylla kortets bredd och brytas på två rader på 375 px. |

### Personlighetsprofilen (`article.o`)

Rubrik, båda styckena, de tre testen med sina texter, knappen, raden bredvid och de fem H3 står kvar ordagrant, också de meningar skissen har kortat ("Varje dimension får sina styrkor ..." och "att öva på").

| Plats | Lydelse | Not |
|---|---|---|
| `.profil`, `aria-label` | Exempel: en personlighetsprofil med fem dimensioner | Profilen bär inte `role="img"`, eftersom de fem H3 står i den. |
| Faktorernas chip | Hög · Låg · Mitt emellan | Står kvar. Bandord, inga siffror på skalan. |
| `.las-mot`, kort 1, `.ey` | Så läses profilen mot kravprofiler | Står kvar. |
| Kravrad 1 | Ledarskap och projektledning · En fråga väntar · Räkna med en fråga om utåtriktning. | Exempel. Chipet "En fråga väntar" är nytt. Utfallet läses ur `KRAVPROFILER` för exempelprofilen. |
| Kravrad 2 | Ekonomi och administration · Passar profilen · Hög samvetsgrannhet är det rollen frågar efter. | Exempel. Sista meningen är ny och står bara om `KRAVPROFILER` säger det om profilen. |
| Kort 2, `.ey` | Frågor rekryteraren lär ställa | Står kvar. Stycke, ingen rubrik här. |
| Frågorna och svaren | Som i dag: "När kostade strukturen dig flexibilitet?" och "Hur gör du dig hörd i en grupp?", med "Så svarar du". | Står kvar ordagrant. |

### Träning som syns på resultatet (`.kurvkort`, `.tre-kort`)

| Plats | Lydelse | Not |
|---|---|---|
| `.kurvkort .ey` | Exempel: Din utveckling | Hela kortets bild är `aria-hidden` (SEO). "Din utveckling" är sidans namn i kontot. |
| `.kurvkort .stort` | 6,1 · i talserier, från 4,2 för tre veckor sedan | Exempel, påhittade tal. Får bara stå inne i den `aria-hidden` bilden, aldrig i löptext. |
| `.liten` | Nivån räknas bara på uppgifter du inte sett den senaste månaden. | Står kvar, utanför bilden. |
| `.bricka` 1 | **3 500+** uppgifter i banken | 19 tecken. Talet räknas ur banken som i dag ("över 3 500 uppgifter"). |
| `.bricka` 2 | **8** testtyper i tre nivåer | 23 tecken. Ny. |
| Kort 1, `h3` och chip | Gratis att prova · 0 kr | Rubriken står kvar. Chipet är nytt och står utanför `h3`. |
| Kort 1, text | Fem uppgifter här, utan konto, med resultatet direkt. Med kontot gör du grundnivån i alla åtta testtyperna, ett test om dagen, gratis. Ingen kortuppgift. | Första meningen ny ("Fem frågor med facit här" lovar mer facit än provet ger). Resten står kvar. |
| Kort 2, text | Resultat, tid och en genomgång uppgift för uppgift med rätt svar och förklaringen. | Dagens text med "uppgift för uppgift" och förklaringen tillagd. |
| Kort 3, `h3` och chip | Premium tar bort taket · 149 kr i månaden | Rubriken står kvar. Priset ur `PLANS`, som chip utanför `h3`. Kampanjpriset ritas inte här. |
| Kort 3, text | Alla nivåer, träning på din nivå utan tak, övningsprov mot klockan, det fördjupade personlighetstestet och hela din historik. | Står kvar. Priset flyttar till chipet. |
| Kort 3, `.lank` | Se vad som ingår i Premium | Ny länk till `/priser`. |

### Så förbereder du dig (`.forb`)

Rubrik, hela dagens ingress med TRR-siffrorna och Ingenjören, och de sex råden står kvar ordagrant. Skissens korta ingress gäller inte. Bilden är ny.

| Plats | Lydelse | Not |
|---|---|---|
| `.statkort .ey` | Andel som fått göra test | Ny. |
| Staplarna, `aria-label` | 58 procent 2019 och 67 procent 2022 | Talen ur dagens text. |
| `.liten` | TRR-undersökning bland tjänstemän som nyligen bytt jobb. | Källan ur dagens text. |
| `.tjugo` | **Upp till 20 %** Så mycket kan två till tre timmars övning höja resultatet, enligt tidningen Ingenjören. | Skissen skriver "20 %". Dagens text säger "upp till", och det ska stå med. |
| Råd 6, sista meningen | Att du inte hinner med varenda uppgift är ofta inbyggt i designen, inte ett tecken på att du misslyckats. | Dagens mening med "uppgift". |

### Inför testet och Guider per testtyp

Allt står kvar ordagrant, också de två guidetexter skissen har kortat (Spatial förmåga, Deduktiva och induktiva test). Bilderna i de tre guidekorten är `aria-hidden`.

| Plats | Lydelse | Not |
|---|---|---|
| `.knapp-vit` under guidekorten | Prova fem uppgifter utan konto | 30 tecken. Dagens "Prova fem frågor utan konto". Ryms på en rad på 375 px bara om knappen fyller bredden. |
| Guidekortens bilder | mån till lör och test · stanineskalan 1 till 9 med 4 utmärkt · Skatteverket, Kronofogden, Försäkringskassan, Säkerhetspolisen, Tullverket, +4 | `aria-hidden`. Myndigheterna står i artikeln som kortet länkar till. |

### Premium (`.premium`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Jobbcoach Premium, 149 kr i månaden | Står kvar. Priset ur `PLANS`. |
| `h2.h2` | Träna nu. Kom förberedd sen. | Står kvar. |
| Texten | Fem uppgifter gratis här. Grundnivån i alla åtta testtyperna gratis med konto, ett test om dagen. Avancerad nivå och expertnivå, övningsprov mot klockan och din utveckling över tid ingår i Premium. | Dagens text med "uppgifter" och nivåernas hela namn. Läs första meningen ur `GRATIS_TESTRAD_PROV` när den har bytt ord. |
| `.pris` | 149 kr · i månaden, säg upp när du vill | Ur `PLANS`. |
| `.bockar` 1 | Alla tre nivåerna i alla åtta testtyperna | Ny. |
| `.bockar` 2 | Övningsprov mot klockan, i provens format | Ny. |
| `.bockar` 3 | Det fördjupade personlighetstestet, 120 påståenden | Ny. |
| `.bockar` 4 | Din utveckling över tid och hela testhistoriken | Ny. |
| Knappar | Starta gratis test · Se hur det fungerar | Står kvar. |

### Frågorna (`.faq`)

Alla 17 frågor står kvar. Två svar byts (SEO: ja, `LD_UNDANTAG` finns). Övriga svar står ordagrant, också där skissen skriver "Svaret står kvar som i dag".

| Plats | Lydelse | Not |
|---|---|---|
| Svar, Hur lång tid tar varje test? | Matrislogik tar runt 20 minuter på grundnivå och 25 på avancerad nivå, verbalt resonemang runt 20 minuter på både grund- och avancerad nivå och numeriskt resonemang runt 25 minuter på både grund- och avancerad nivå. Övningsproven går mot klockan: 25 minuter i matrislogik, 40 i verbalt och 40 i numeriskt. I träningen visar klockan provets tid men stoppar dig inte: går du över syns det i resultatet, så att du tränar på att hålla tempot. Du kan avbryta ett test och fortsätta senare, eller göra om det. | De två första meningarna står kvar. De två sista ersätter "pausa" och "du ser tiden räkna upp". |
| Svar, Är testerna gratis?, andra meningen | Fem uppgifter provar du direkt här, utan konto, och ser resultatet och förklaringen till en av dem. | Ersätter "Fem frågor med facit provar du direkt här, utan konto." Resten av svaret står kvar, också "Att träna på din nivå så ofta du vill", som skissen har tappat. |
| Svar, Hur fungerar ett matrislogik-test?, sista meningen | Hos oss tränar du på 15 uppgifter per test i samma format som SHL och Cut-e använder. | Bara ordet byts. |
| Svar, Vad är numeriskt resonemang?, sista meningen | Du tränar på 20 uppgifter per test, och övningsprovet har 36. | Bara ordet byts. |
| Knappen efter frågorna | Starta gratis test | Står kvar. |

### UX-kontrollen, den här sidan

- **En primär handling per skärmyta:** hjälten leder till provet ("Gör ett prov direkt"), lyftet startar det ("Starta provet"). Överallt annars är kopparknappen "Starta gratis test", som går till registreringen. Knapparna i "Vilket test ska du göra?" är vita, så att åtta kopparknappar inte står på samma yta.
- **Namnen:** i rubriker, löptext och länkar står de publika namnen Matrislogik, Verbalt resonemang och Numeriskt resonemang. Kontots namn (Figurer och mönster, Ord och text, Siffror och tabeller) får bara stå inne i de ritade skärmarna.
- **Ramens ord** är kontots: uppgift, Nästa, Lämna in, Starta testet, Starta provet, Förklaringen, Ditt misstag, Inom provets tid, Din utveckling.
- **Långa knappar:** "Prova sex uppgifter ur I-provet" (31 tecken) och "Prova fem uppgifter utan konto" (30) är dagens ankartexter och korta inte. De får fylla bredden.
- **Kampanjpriset** ritas inte i chip, brickor eller Premiumytan. Det står där priskomponenten visar det i dag.

---

## skapa-brev-start

`/skapa-brev/start`, startflödet för personliga brev utan konto. Skiss `sidor/skapa-brev-start.html`, not `noter/skapa-brev-start.md`. Sidan har `noindex` och det står kvar. H1, ingressen, de tre fältens etiketter och hjälptext, "Klistra in jobbannonsen också", "Skriv mitt brev", H2 "Ditt brev är klart" med sitt stycke, "Skapa konto och läs brevet" och raderna under står kvar ordagrant. Exemplet i skissen är projektledare med mallen Koppar: yrket och mallen läses ur adressen, och varje rad nedan som nämner dem har en form för andra fall.

### Toppen (`.fl-topp`)

| Plats | Lydelse | Not |
|---|---|---|
| Tillbakalänken (`.fl-bak`) | Tillbaka till exemplet för projektledare | Ny. Yrket ur `yrke` i adressen, med liten bokstav. Till `/personligt-brev-exempel/<yrke>`. Saknas yrket visas ingen länk. |
| `h1.h1`, `.varde` | Står kvar ordagrant. | "Skriv ditt personliga brev som projektledare", utan yrke "Skriv ditt personliga brev". |

### Panelen, startläget (`form.panel`)

| Plats | Lydelse | Not |
|---|---|---|
| Formulärets `aria-label` | Tjänsten och din erfarenhet | Ny. |
| Panelhuvudet (stycken) | Tjänsten och du · Allt går att ändra efteråt | Nytt. Andra raden är kontots egen (`SKRIV.bladSidorad`). Ingen h-tagg. |
| Mallraden, etikett när mallen kom med i adressen | Mallen du valde | Ny. |
| Mallraden, etikett när ingen mall kom med | Mall | Ny. Då står förvalet Linne. |
| Mallraden, namn och nivå | **Koppar.** Ingår i Premium, även som Word. | Meningen läses ur katalogen (`namnradMening`), samma som i visaren. Linne: "Linne. Gratis, även som Word." |
| Mallraden, länk | Byt mall | Som i visaren och kontot. Miniatyren har tomt `alt`. |
| Fältet Tjänsten du söker, märke | från exemplet | Nytt. Visas bara medan fältet har exemplets yrke. Ändrar besökaren texten försvinner märket. |
| Fältet Arbetsgivare, platshållare | Till exempel ICA Maxi Haninge | Står kvar. SEO: en platshållare per yrke om datan har en, annars dagens. Skissens "Till exempel Sweco" är ingen ny standard. |
| Fältet Din erfarenhet, hjälptext och räknare | Står kvar ordagrant. | "0 av minst 200 tecken", talet ur `MIN_EXPERIENCE`. Stapeln är `aria-hidden`. |
| Raden för annonsen | Klistra in jobbannonsen också | Står kvar. Utfälld: "Jobbannonsen (valfritt)". |
| Rad över annonsfältet när annonsen kom från verktygssidan | Annonsen du klistrade in följde med. | Ny. Bara om annonsfältet på `/verktyg/personligt-brev` byggs. |
| Panelfoten | **Första personliga brevet är gratis.** Du ser första stycket direkt och hela brevet när du har skapat ett gratiskonto. | Ny. "första stycket" följer `PREVIEW_PARAGRAPHS`, i dag 1. |
| `.knapp` | Skriv mitt brev | Står kvar. 15 tecken. Medan brevet skrivs: "Skriver ditt brev…" som i dag. |

### Arket bredvid, startläget (`.arkspalt`)

| Plats | Lydelse | Not |
|---|---|---|
| Arkets platshållare | Ditt namn · din e-post, ditt telefonnummer, din ort · Arbetsgivaren · Ansökan: Projektledare | Nya, `aria-hidden`. Tjänsten följer fältet. Bara i brett läge. |
| Raden under arket, Premiummall | **Koppar, mallen du valde.** Du provar den med ditt eget brev. Linne och Björk är gratis. | Ny. Namnen ur `BREV_GRATIS_NAMN`. |
| Raden under arket, gratismall som kom med i adressen | **Linne, mallen du valde.** Den är gratis, även som Word. | Ny. |
| Raden under arket, ingen mall i adressen | **Linne.** Gratis, även som Word. Du byter mall när du vill. | Ny. |

### Utkastet klart, spärren (`.sparr`)

| Plats | Lydelse | Not |
|---|---|---|
| Panelhuvudet (stycken) | Utkastet är skrivet · Projektledare, Sweco | Nytt. Andra raden är tjänsten och arbetsgivaren ur fälten. |
| `h2.h2`, stycket under | Står kvar ordagrant. | Priset ur `PLANS`. |
| Rad 1 | Hela brevet, att läsa, kopiera och ändra | Ny. Skissen saknade "och ändra", som är sant för det första brevet (textbeslut BRV-1). |
| Rad 2, Premiummall | Brevet öppnas i Koppar, mallen du valde | Ny. "Öppnas", inte "sparas": brevet sparas i Linne och mallen provas. |
| Rad 2, gratismall | Brevet sparas i Linne, mallen du valde | Ny. Gäller Linne och Björk. |
| Rad 3 | Nedladdning som PDF och Word ingår i Premium | Ny här. Samma rad som på verktygssidan. |
| `.knapp` | Skapa konto och läs brevet | Står kvar. 26 tecken, två över måttet: knappen går över hela panelens bredd och ryms på 375 px. |
| Raderna under knappen | Står kvar ordagrant. | "Inget kreditkort. Avsluta när du vill." och "Utkastet för projektledare sparas i sju dagar." |
| Arket, `aria-label` | Ditt brev i mallen Koppar. Första stycket visas. | Nytt. Mallens namn ur valet. |
| Lappen på arket | Första stycket | Ny. 14 tecken. |
| Kortet på arket (`.vantar`) | Resten av brevet väntar på dig. Du ser det när du har skapat konto. | Ersätter dagens "Du ser resten av brevet när du skapat ett konto." Resten ritas som tomma streck, aldrig suddad text. |

### Byt mall, väljaren (`.valjare`)

| Plats | Lydelse | Not |
|---|---|---|
| Rubrik och dialogens `aria-label` | Välj mall | Som i visaren. Stycke, ingen h-tagg. |
| Stängknappen, `aria-label` | Stäng | |
| Filtren, `aria-label` | Filtrera mallar | |
| Filtren | Alla 40 · Gratis · Enkla · Med färg · Sidospalt | Som i kontot (`brev3/mallar/filter.ts`). Talet ur `BREV_MALL_ANTAL`. |
| Raden över rutnätet | Linne och Björk är gratis. De övriga 38 ingår i Premium, och du provar dem med ditt eget brev. | Ny. Namn och tal ur `BREV_GRATIS_NAMN` och `BREV_PREMIUM_ANTAL`. |
| Kortens märken | Gratis · Vald | Som i kontot. Inget lås och inget köpsteg här: alla 40 går att välja. |
| Foten, namnrad | **Koppar.** Ingår i Premium, även som Word. | Ur katalogen, samma mening som i mallraden. |
| Fotens knapp | Använd Koppar | Ny. Längst blir "Använd Terrakotta", 17 tecken. Vit knapp. |

### UX-kontrollen, den här sidan

- **En primär handling per läge:** "Skriv mitt brev" i startläget, "Skapa konto och läs brevet" när utkastet är klart. Väljarens "Använd Koppar" är vit, eftersom den ligger över panelen där kopparknappen står.
- **Knappen säger vad som händer:** "Skriv mitt brev" skriver utkastet, den skapar inget konto. Det står i panelfoten precis över knappen, så ingen blir överraskad av spärren.
- **Namnen** stämmer med kontot och visaren: Byt mall, Välj mall, Vald, Gratis, filtrens namn, "Allt går att ändra efteråt" och mallarnas nivårader.
- **Premiummall utan konto:** texten säger öppet att mallen ingår i Premium redan i mallraden, och "öppnas i" i spärren. Ingenstans står att brevet sparas eller laddas ner i en Premiummall.
- **Ingen ton i flödet:** det publika flödet har inget tonval. Verktygssidans tonblock säger "Du väljer ton innan brevet skrivs", vilket gäller i kontot. Se listan Stämmer inte.

---

## skapa-cv

`/verktyg/skapa-cv`. Skiss `sidor/skapa-cv.html` med arket i `delar/skapa-cv-ark.html`, not `noter/skapa-cv.md`. H1, de sex H2, alla arton H3, stegens och fördelarnas texter, de åtta frågorna med svar och alla länkar står kvar ordagrant. Sidan får ny form, och det som är nytt är etiketter, märken, tre stora tal, startbladets rader och Premiumytans lista.

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h1`, `.varde`, knappar | Som i dag. | "Bygg mitt CV gratis" (19 tecken) och "Ladda upp ditt CV" står kvar. |
| `.bricka` 1 | **På arket** du ser CV:t i mallen medan du skriver | Står kvar. Förklaringen är 37 tecken och bryts på tre rader på 375 px. Ryms inte snyggt: kortare med samma innehåll är "du skriver direkt i mallen" (26 tecken). |
| `.bricka` 2 | **3** förslag på punkter, gratis | 27 tecken. SEO: ja. Talet ur `FREE_CV_BYGG_AI_PER_ACCOUNT`. |
| `.bricka` 3 | **40** mallar, 2 gratis | Står kvar. Ur `TEMPLATE_COUNT` och `FREE_TEMPLATE_COUNT`. |
| `.mallchip` på arket | Mallen Linne, gratis | Ny. |
| Arket, `aria-label` | Exempel: Sara Lindströms CV i mallen Linne medan hon skriver. Avsnittet Arbetslivserfarenhet är öppet och Jobbcoachen föreslår en punkt. | Bilden bär `role="img"`. Inga rubriker i arket, avsnittsnamnen är stycken. |
| Arkets egna ord | Skriv punkter åt mig · + Lägg till utbildning · Examen eller utbildning, skola, år | Som i byggaren (`src/app/dashboard/skapa-cv/texter.ts`, `src/components/cv/Dokument/texter.ts`). Rita med byggarens strängar, skriv dem inte för hand. |
| Arkets perioder | 2021 till nu · 2018 till 2021 | Exempel. Skissen har tankstreck i perioderna. Skriv "till", eller låt mallen sätta sitt eget tecken om arket ritas med de riktiga komponenterna. |
| `.svav.forslag`, etikett | Jobbcoachen föreslår | Ny. |
| `.svav.forslag`, punkter | Drev fyra upphandlingar enligt LOU · Ansvarade för budget och tidplan · Ledde ett team på tolv personer | Exempel. Samma tre som telefonen visar i dag. |
| `.svav.forslag`, rad under | Du väljer, ändrar eller hoppar över. | Ny i bilden. Meningen står redan i fördelen Jobbcoachen skriver punkterna. |

### Startbladet (`.lyft`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Börja här | Ny. |
| Frågan (stycke med rubrikens stil, ingen `h2`) | Vilket jobb söker du? | SEO: ingen ny rubrik. Samma fråga som i byggaren. |
| `.varde` | Yrkestiteln styr rubrikerna, den grå exempeltexten och Jobbcoachens förslag. | Ny här. Samma ord som i steg 1. |
| Fältets exempel | Projektledare | Exempel, som platshållare. |
| Ingång 1 | **Ladda upp ett CV du har** PDF, Word eller en PDF av din LinkedIn-profil. | Som i byggaren. |
| Ingång 2 | **Skriv från början** Du börjar på ett tomt ark i Linne. | Som i byggaren. |
| `.knapp` | Bygg mitt CV gratis | 19 tecken. Till `/register?borja=cv`. |
| `.liten` | Gratis att börja, ingen kortuppgift. | Ny. |
| Linne-blocket, chip | Linne · Gratis · Även som Word | Dagens "Linne Gratis, även som Word" som tre märken. |
| Linne-blocket, rad (stycke) | Så ser arket ut | Står kvar. |
| Linne-blocket, text | Som i dag, med länken Linne till mallens sida. | Står kvar ordagrant. |
| Namnfältet | Prova Linne med ditt namn | Står kvar. |
| Miniatyren, `alt` | CV-mallen Linne | |

Fungerar fältet och ingångarna inte utan ny klientkod blir startbladet en bild (`role="img"`, `aria-label` "Exempel: byggarens start, med frågan Vilket jobb söker du?") och knappen en vanlig länk.

### Så fungerar det (`.vagsteg`, HowTo)

Rubrik, ingress, de fyra H3, stegens texter och länken "Skapa mitt CV gratis" (som `<a>`, SEO) står kvar ordagrant.

| Plats | Lydelse | Not |
|---|---|---|
| `.ey` | Fyra steg | Ny. |
| Steg 1, bild | Projektledare · Arbetslivserfarenhet · Projekt · Certifieringar | `aria-hidden`. Exempel. Rubrikerna läses ur yrkets rubriker i byggaren, inte ur skissen. |
| Steg 2, bild | Tomt ark | `aria-hidden`. |
| Steg 4, miniatyrer | Björk, Linne och Koppar | `aria-hidden`, tomt `alt`. |

### Det här gör CV-byggandet enkelt (`article.o`, `.fyra`)

De åtta H3 och deras texter står kvar ordagrant. Fyra av dem står numrerade bredvid arket, fyra som kort under.

| Plats | Lydelse | Not |
|---|---|---|
| Arket med nålar, `aria-label` | Exempel: arket i byggaren med fyra nummer. 1 arket är byggaren, 2 Jobbcoachen skriver punkterna, 3 rubriker som följer yrket, 4 ladda ner som PDF eller Word. | Numren pekar på de fyra H3 bredvid. |
| `.verktygsrad` (i bilden) | Aa Calibri · Byt mall · PDF · Word | Exempel. Som byggarens rad. |
| Kortet Utkastet väntar på dig, bild | Sparat, 3 av 5 avsnitt | `aria-hidden`. Exempel. |
| Kortet Börja från ett CV du redan har, bild | PDF → Linne | `aria-hidden`. |

### Mallar som passar din bransch (`.mallkort`, `.fler`)

Rubrik, ingress, de tre H3 med texter och "Se alla mallar" står kvar. Märkena och raden under är nya.

| Plats | Lydelse | Not |
|---|---|---|
| Linne, chip | Gratis · Word | Läs ur katalogen (`src/lib/cv/mallar/katalog.ts`). |
| Björk, chip | Gratis · Word · Foto | |
| Koppar, chip | Premium · Word · Foto | |
| Miniatyrernas `alt` | CV-mallen Linne · CV-mallen Björk · CV-mallen Koppar | |
| `.fler b` | 37 mallar till | SEO: talet räknas, `TEMPLATE_COUNT - 3`. Stycke, ingen rubrik. |
| `.fler span` | 26 finns också som Word, 15 har plats för foto. | Talen gäller alla 40 och läses ur katalogen (`WORD_TEMPLATE_COUNT`, antalet mallar med foto). |
| `.fler-rad` | Sju miniatyrer. | `aria-hidden`, tomt `alt`. |

### Gör skillnad i varje ansökan (`.skillnad`)

Rubriken, de tre H3 med texter och knappen "Skapa ditt CV gratis" står kvar. De tre stora talen är nya och står över var sin H3.

| Plats | Lydelse | Not |
|---|---|---|
| Tal 1 | 1 fil | Över "Ladda upp ditt gamla CV och börja där det slutade". |
| Tal 2 | 0 kr | Över "Gratis att börja". |
| Tal 3 | Alla 40 | Över "Läsbart för systemen i alla mallar". Talet ur `TEMPLATE_COUNT`. |

### Premium (`.premium`)

Etiketten med priset, rubriken "Skapa ditt CV gratis på minuter.", hela texten enligt textbeslut GEM-5 ("CV-analysens alla förslag") och de två knapparna står som i koden. Skissen kortar texten och flyttar uppräkningen till listan. Texten står kvar hel, listan läggs till.

| Plats | Lydelse | Not |
|---|---|---|
| `.pris` | 149 kr · i månaden, säg upp när du vill | Ur `PLANS`. Kampanjpriset visas av priskomponenten som i dag, inte här. |
| `.bockar` 1 | Alla 40 mallar | `TEMPLATE_COUNT`. |
| `.bockar` 2 | Word i alla 26 Word-mallar | `WORD_TEMPLATE_COUNT`. |
| `.bockar` 3 | CV-analysens alla förslag | Textbeslut GEM-5. Aldrig "hela CV-analysen". |
| `.bockar` 4 | Nedladdning utan tak | |
| `.bockar` 5 | Jobbcoachens förslag på punkter, 30 per dygn | Talet ur kvoten i `quotaService`. |

### Frågorna (`.faq`)

Alla åtta frågor och svar står som i koden, med textbeslut SCV-1 och SCV-2. Inget nytt.

### UX-kontrollen, den här sidan

- **En primär handling:** kopparknappen heter "Bygg mitt CV gratis" i hjälten, på startbladet, i Premiumytan och efter frågorna. "Skapa mitt CV gratis" (efter stegen, vit) och "Skapa ditt CV gratis" (efter talen) är dagens länktexter och står kvar. Tre lydelser för samma mål är en för mycket, men ingen av dem får bytas i den här omgången.
- **Namnen** är byggarens egna: Vilket jobb söker du?, Ladda upp ett CV du har, Skriv från början, Skriv punkter åt mig, Lägg till utbildning.
- **En nedladdning är gratis.** Ingen ny rad säger något annat. "Nedladdning utan tak" står bara i Premiumlistan.
- **Första talbrickan** har en förklaring på 37 tecken. Den är dagens text. Bryts den illa på 375 px finns den kortare lydelsen i tabellen.

---

## start

Startsidan, `/`. Skiss `sidor/start.html`, not `noter/start.md`. H1, alla åtta H2, de tre H3, metatiteln, description, FAQ och medielänkarna står ordagrant som i dag. Styckena under verktygen står som de är i koden efter textbeslutet (STA-1 till STA-8, B3, B4). Här står bara det som är nytt: hjältens fyra kort, en talbricka, raden om mallarna, blocket Sökta tjänster och bildernas texter. Ordantal i dag 1 039, gräns 20 ord: telefonerna som försvinner var text, så räkna före och efter.

### Hjälten (`.vagg.hjalte`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h1`, `.varde`, knappraden | Står kvar ordagrant. | "Skapa konto gratis" och "Se hur det fungerar". |
| `.bricka` 1 | **543+** har skapat konto | Står kvar. Talet ur databasen som i dag. |
| `.bricka` 2 | **8** testtyper, grundnivån gratis | Ny, SEO har sagt ja. 28 tecken. Talet ur `TESTTYPER`. Ersätter "60 sek till första CV-poängen". |
| `.bricka` 3 | **1 brev** gratis, sedan ett i veckan | Står kvar. |
| `.kollage`, `aria-label` | De fyra delarna i Jobbcoach: rekryteringstester, CV, personliga brev och Jobbsöket | |
| Kort 1, namn (stycke) | Rekryteringstester | SEO: korten har inga rubriker. Skissens `h3` blir `p`. |
| Kort 1, bild | En matrisuppgift, tre gånger tre rutor med frågetecken i den sista. | `aria-hidden`. Ingen text i kortet utöver namnet. |
| Kort 2, namn (stycke) | CV-analys | |
| Kort 2, tal | **93** av 100 | Exempel. |
| Kort 2, rad | 7 poäng kvar till 100. De sitter i två delar. | Exempel. "poäng kvar till 100" är vyns egna ord. |
| Kort 2, delar | Erfarenhet 30 av 35 · Språk 3 av 5 | Exempel. Delarnas namn ur poängmodellen. |
| Kort 3, namn (stycke) | Personliga brev | |
| Kort 3, rad | Svarar på 3 av 4 krav i annonsen. | Exempel. |
| Kort 4, namn (stycke) | Jobbsöket | |
| Kort 4, rad | 2 sökta väntar svar. Intervju på tisdag. | Exempel. "väntar svar" som i kontot, inte "väntar på svar". |

Ordet "Jobbmatchning" och mediecitaten med "AI" står kvar i löptexten längre ned (SEO:s villkor för att telefonen får bytas).

### Medieraden (`.sekt-papper .media`)

Står kvar ordagrant: "Rekryteringssystemen beskrivna av" och de fyra namnen.

### Tre verktyg (`.sekt`, tre `article.o`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, `.varde` | Står kvar ordagrant. | |
| Rekryteringstester, `.gratisrad` | Chip: Gratis. Rad: Grundnivån i alla åtta testtyperna och personlighetstestet | Dagens rad, med ordet "gratis" flyttat till chipet. Ordantalet är oförändrat. Skissen hade tappat "och personlighetstestet". |
| CV-analys, `.gratisrad` | Chip: Gratis. Rad: Poängen och genomgången, för varje CV | Samma grepp. Textbeslut STA-3. |
| Jobbmatchning, `.gratisrad` | Chip: Gratis. Rad: Tre träffar | Talet ur `FREE_TIER_JOB_LIMIT`. |
| De tre knapparna (`.knapp-vit`) | Så fungerar det | Står kvar. En per block, ingen kopparknapp här. |
| Testramen, `aria-label` | Exempel: en uppgift i matrislogik som den ser ut i testet | Grundens `Testram` skriver den själv. |
| Testramen, texter | Matrislogik · Grundnivå · 9 av 15 · 4:12 · Vilken figur hör hemma i den tomma rutan? · Nästa | Exempel. Uppgiften hämtas ur banken (BYGGBRIEF). "Nästa" som i testet. |
| CV-arket, `aria-label` | Exempel: Sara Lindströms CV med analysens sju delar utmärkta | |
| CV-arket, svävande bricka (`.svav`) | **93** av 100 i dag | Exempel. |
| Träffen, `aria-label` | Exempel: två träffar i Matchade jobb | Skissen sa "en träff" men visar två. |
| Träffen, handlingar | Skriv brev · Spara till Ska sökas · Markera som sökt | Som i kontot. Bild, inga länkar. |
| Träffen, matchgrad | Märks "Exempel" i bilden. | SEO:s villkor 4. Inget "vad som saknas" per träff (textbeslut B-4). |

### Brevet (`article.o.vand`, plommon)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, `.varde`, knapp, `.gratisrad` | Står kvar ordagrant. | "Skriv ett brev gratis", "Första personliga brevet gratis, sedan ett var sjunde dag". |
| Nytt stycke under `.varde` | Brevet får samma mall som ditt CV, så att ansökan hänger ihop. Du väljer bland 40 mallar och fem toner. | Nytt. 40 ur `BREV_MALL_ANTAL`. |
| Brevparet, `aria-label` | Exempel: en annons och det personliga brevet som svarar på dess krav | |
| Annonsens krav | Offentlig upphandling, LOU · Budgetansvar · Tidplan och uppföljning · PMP-certifiering | Exempel. Det fjärde står utan svar. |
| Svävande bricka (`.svav`) | **3 av 4** krav har fått svar | Exempel. |
| Brevets text | Som skissen, utan namngiven arbetsgivare i löptexten. | Exempel. Inga påhittade projekt på riktiga bolag. |

### Jobbcoachen (`.sekt-papper`, skog)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, `.varde`, stycket | Står kvar ordagrant som i koden. | Textbeslut STA-5 och STA-6. Skissens "Intervjufrågor, uppföljning, avtal och avslag" gäller inte. |
| `.knapp` | Ställ första frågan | Står kvar. |
| Rad vid knappen (`.liten`) | Tio meddelanden gratis | Talet ur `FREE_CHAT_MESSAGES_PER_ACCOUNT`. |
| Samtalet, `aria-label` | Exempel: ett samtal med Jobbcoachen | |
| Samtalet, frågan | Vad skriver jag i ett uppföljningsmejl? | Exempel. Vyns egen föreslagna fråga (`src/lib/jobbsok/coach.ts`). Skissens längre fråga står inte. |
| Samtalet, svaret | Håll det kort. Säg vilken tjänst det gäller, att du fortfarande är intresserad och fråga när de räknar med att ge besked. Tre till fyra meningar räcker. | Exempel. Samma svar som textbeslut JC-3 och TEL-5. Inget källmärke, inget belopp. |
| Samtalet, förslag | Vad frågar jag arbetsgivaren på intervjun? · Hur länge är det rimligt att vänta på besked? | Vyns egna förslag. Bild, inga knappar. |

### Medierna (`.o`, grafit)

Står kvar ordagrant: etikett, H2, ingress, de fyra korten med sina länkar och "öppnas i ny flik". Länken "Så hjälper vi dig komma förbi" till `/priser` står kvar som länk under korten. Skissen har gjort den till etikett över nästa rubrik, och då försvinner en länk.

### Och resten av jobbsöket (`.sekt`, ön Sökta tjänster och åtta brickor)

| Plats | Lydelse | Not |
|---|---|---|
| `h2` | Och resten av jobbsöket | Står kvar. |
| Öns `.ey` | Sökta tjänster | |
| Öns rubrik (`h3.h2`) | Håll koll på var varje ansökan står | Ny H3. Fäller grinden på startsidan blir den ett stycke med samma klass. |
| Öns `.varde` | Spara annonsen du ska söka, logga jobbet du har sökt och se när det är dags att höra av sig. Veckans mål håller farten uppe, och efter tolv tysta dagar skriver vi utkastet till det första uppföljningsmejlet. | Ersätter dagens rad i länklistan (textbeslut STA-7) och är längre. "tolv" ur `NO_RESPONSE_NUDGE_DAYS`. |
| `.veckomal` | Veckans mål: 2 av 3 sökta | Exempel. |
| `.knapp-vit` | Så fungerar Sökta tjänster | SEO:s ankartext, ordagrant. 26 tecken, strax över riktmärket men ryms utan ikon. Till `/verktyg/sokta-tjanster`. |
| `.chip-vagg` | Gratis för alla med konto | 25 tecken. Dagens ord. |
| Bilden, `aria-label` | Exempel: sökta tjänster på väg från Ska sökas till Erbjudande. Två väntar svar, och en av dem har varit tyst i tolv dagar. | Grundens `Stig`. |
| Bildens etiketter | Ska sökas, 1 sparad, sista dag onsdag · Sökt, 2 väntar svar · Intervju, tisdag 10.00 · Erbjudande · tyst i 12 dagar | Exempel. |
| De åtta brickorna | Står kvar ordagrant som i koden (`RESTEN`), med Jobbkartans andra mening "SCB:s siffror på en karta." kvar. | Jobbcoachens rad enligt textbeslut STA-6. |

### Premium (`.premium`)

| Plats | Lydelse | Not |
|---|---|---|
| `.ey`, `h2`, texten, knappen, raden om Stripe | Står kvar ordagrant som i koden. | Textbeslut STA-8. "Alla verktyg utan tak" står inte. |
| `.pris` | 149 kr i månaden | Ur `PLANS`. Kampanjpriset visas här som i dag, ingen annanstans. |
| `.bockar` | Läses ur `HELA_PAKETET_RADER`. | Textbeslut GEM-4, sex rader. Skriv inte listan för hand. |

### Frågorna och slutet

Står kvar ordagrant: H2, de fem frågorna med svar (svaret om säkerhet är ägarens, skrivs inte), knappen "Skapa konto gratis" och länken "Fler frågor om priset? Se priserna".

### UX-kontrollen, den här sidan

- **En primär handling per skärmyta:** kopparknappen står i hjälten (Skapa konto gratis), i brevblocket (Skriv ett brev gratis), hos Jobbcoachen (Ställ första frågan), på Premiumytan och i slutet. De tre verktygsblocken och Sökta tjänster har vita knappar, så ingen yta får två kopparknappar.
- **Namnen** stämmer med kontot: Rekryteringstester, CV, Personliga brev, Jobbsöket, Matchade jobb, Ska sökas, Sökta tjänster.
- **Ryms:** talbrickan "testtyper, grundnivån gratis" är 28 tecken, på gränsen. Knappen "Så fungerar Sökta tjänster" är 26 tecken. Bryter den på 375 px: gör den till textlänk (`.lank`) med samma ankartext, korta den inte.

---

## nya-funktioner

Beskrivningar av de sexton funktionerna i `docs/publikt-omgang3/nya-funktioner.md`, att använda där en funktion lyfts och sidan inte redan har en text för den. Kort: en rad för ett kort, en bricka eller en länkrad. Lång: två till fyra meningar för en sektion. Finns en lydelse för samma plats i sidans egen sektion ovan eller i `textbeslut.md` gäller den, inte den här. Rubriken i första kolumnen är funktionens namn som det skrivs publikt.

Tal läses ur konstanterna: tolv ur `NO_RESPONSE_NUDGE_DAYS`, sju ur `INTERVJU_BESKED_DAGAR`, tre träffar ur `FREE_TIER_JOB_LIMIT`, 25 ur `JOB_MATCHES_PER_RUN`, 40 ur `TEMPLATE_COUNT`, 26 ur Word-mallarnas antal, tio ur `FREE_CHAT_MESSAGES_PER_ACCOUNT`, priset ur `PLANS`.

### CV

| Plats | Lydelse | Not |
|---|---|---|
| 1. CV-analysen med läsbarhetspoäng, kort | En läsbarhetspoäng av 100 och vad som saknas, del för del. Gratis för varje CV. | |
| 1. CV-analysen med läsbarhetspoäng, lång | Vi går igenom ditt CV i sju delar, från kontaktuppgifter till datum, ordning och längd, och räknar en läsbarhetspoäng av 100. Du ser var varje tappad poäng sitter och vad som saknas i varje del. Poängen räknas om när du sparar, och genomgången är gratis för varje CV. | Aldrig "ATS-poäng", "en analys per konto" eller "samma CV ger alltid samma poäng" (textbeslut B-3). |
| 10. CV-byggaren, kort | Skriv CV:t direkt på arket och se det i mallen medan du skriver. | |
| 10. CV-byggaren, lång | Du skriver direkt i mallen, avsnitt för avsnitt, och ser hela tiden hur CV:t blir. Under arbetslivserfarenhet föreslår Jobbcoachen punkter åt dig, tre förslag gratis per konto. När du är klar laddar du ner CV:t som PDF eller Word. | En nedladdning är gratis (`FREE_CV_EXPORTS`). |
| 11. CV som Word, kort | 26 av de 40 mallarna finns som Word, alla 40 som PDF. | |
| 11. CV som Word, lång | Vill arbetsgivaren ha en Word-fil? 26 av de 40 CV-mallarna går att ladda ner som Word, och alla 40 som PDF. I gratismallarna Linne och Björk kan din gratis nedladdning vara en Word-fil. | |
| 8. Samma mallar för brev och CV, kort | Brevet och CV:t i samma mall, så att ansökan hänger ihop. | |
| 8. Samma mallar för brev och CV, lång | Det personliga brevet skrivs i samma 40 mallar som ditt CV, så att ansökan ser ut som en helhet. Linne och Björk är gratis. Alla 40 finns som PDF och 26 som Word, och att ladda ner brev ingår i Jobbcoach Premium, 149 kr i månaden. | |

### Personliga brev

| Plats | Lydelse | Not |
|---|---|---|
| 9. Brevet mot annonsens krav, kort | Brevet skrivs mot annonsens krav, och du ser vilka som har fått svar. | |
| 9. Brevet mot annonsens krav, lång | Vi skriver det personliga brevet mot kraven i annonsen och visar, krav för krav, var i brevet det besvaras och vilka som saknas. Du väljer mellan fem toner och mellan svenska och engelska. Alla brev sparas av sig själva, och på gratisnivån går de två senaste att ändra. | Tonerna: Professionell, Entusiastisk, Kreativ, Självsäker, Balanserad. I Premium väljer vi ton efter annonsen. |

### Jobbsöket

| Plats | Lydelse | Not |
|---|---|---|
| 2. Sökta tjänster, kort | Logga varje jobb du har sökt, spara annonser du ska söka och se var ansökningarna tar stopp. | Länkas med "Så fungerar Sökta tjänster" till `/verktyg/sokta-tjanster`. |
| 2. Sökta tjänster, lång | Under Sökta tjänster loggar du varje jobb du har sökt och sparar annonser du ska söka, med sista ansökningsdag. Veckans mål håller farten uppe, och statistiken visar vägen från sökt till erbjudande. Allt det är gratis för alla med konto. | På /priser och /funktioner gäller copys kort i GEM-12, inte den här. |
| 3. Uppföljningsmejlet, kort | Tyst i tolv dagar? Vi föreslår ett uppföljningsmejl och skriver utkastet. Du skickar själv. | |
| 3. Uppföljningsmejlet, lång | När en sökt tjänst har varit tyst i tolv dagar föreslår vi ett uppföljningsmejl och skriver utkastet utifrån din ansökan. Efter en intervju räcker sju dagar utan besked. Utkastet öppnas i din egen e-post och du skickar det själv. Det första är gratis, fler ingår i Jobbcoach Premium, 149 kr i månaden. | Aldrig att vi skickar mejlet. Inget tak skrivs ut för Premium. |
| 4. Månadsrapporten, kort | Månadens sökta jobb på ett blad, som underlag till din aktivitetsrapport. | |
| 4. Månadsrapporten, lång | Det du har loggat under månaden står samlat på ett blad: sökta annonserade jobb, spontanansökningar, intervjuer och provjobb, med datum. Det är ditt underlag när du själv lämnar aktivitetsrapport till Arbetsförmedlingen. Antalen ser du gratis. Raderna, utskriften och kopieringen ingår i Premium. | Aldrig att rapporten godkänns, har rätt format eller skickas av oss. Regler om aktivitetsrapporten skrivs bara med källa, se sektionen `sokta-tjanster`. |
| 5. Intervjun på tjänsten, kort | Sätt dag och tid på tjänsten, så ligger förberedelserna där du behöver dem. | |
| 5. Intervjun på tjänsten, lång | När du blir kallad sätter du dag, tid och plats på den sökta tjänsten. Den står då under Inför intervjun, med frågorna du har övat på och annonsens krav bredvid. Dagen efter frågar vi hur det gick. | |
| 6. Inför intervjun, kort | Skriv svaret på en intervjufråga och få ett betyg, med vad som saknades. | Ingen egen publik sida: kortet är ingen länk. |
| 6. Inför intervjun, lång | Under Inför intervjun svarar du skriftligt på en intervjufråga och får ett betyg av fem, med vad som hördes och vad som saknades. Skriv om svaret och se om det lyfter. Ett intervjuprov om dagen är gratis, och i Premium finns ingen dagsgräns. | På /priser och /funktioner gäller copys kort i GEM-12. |
| 7. En träff i Matchade jobb, kort | Från en träff skriver du brevet, sparar annonsen eller markerar den som sökt. | |
| 7. En träff i Matchade jobb, lång | Varje träff i Matchade jobb visar matchgraden, sista ansökningsdag och varför du passar: rollen, kompetenserna en och en, och orten. Därifrån skriver du det personliga brevet, sparar annonsen till Ska sökas eller markerar den som sökt. Annonserna hämtas tre gånger per dygn. Du söker om med ett tryck när du vill se de senaste. | De två sista meningarna är R7, ordagrant. Aldrig "när du öppnar sidan", "varje natt", "tillsatta" eller "vad som saknas". Gratis tre träffar, Premium de 25 bästa. |
| 16. Jobbcoachens frågeförslag, kort | Jobbcoachen föreslår frågor utifrån läget i dina sökta tjänster. | |
| 16. Jobbcoachens frågeförslag, lång | Har du loggat dina sökta tjänster föreslår Jobbcoachen frågor som passar läget: vad du skriver i ett uppföljningsmejl, vad du frågar arbetsgivaren på intervjun eller hur du ber om återkoppling efter ett avslag. Svaren utgår från svensk arbetsmarknad, med källor du kan kolla själv. Tio meddelanden är gratis per konto. | Jobbcoachen känner till målroll, ort och bransch och de dokument du delar i samtalet. Inte matchningar, inte testresultat. |

### Rekryteringstester

| Plats | Lydelse | Not |
|---|---|---|
| 12. Resultatet uppgift för uppgift, kort | Efter testet: en lista uppgift för uppgift, med regeln bakom varje svar. | |
| 12. Resultatet uppgift för uppgift, lång | Alla tester går till på samma sätt: en startskärm, uppgifterna med klocka och framstegsstapel, och resultatet. Klockan visar provets tid men bryter aldrig mitt i en uppgift. Efteråt får du en lista uppgift för uppgift, med regeln bakom rätt svar, vad som gick fel i ditt och en väg till träning på just det du missade. | "Uppgift", aldrig "fråga". Ordet "ram" skrivs aldrig publikt. |
| 13. Prov utan konto, kort | Prova fem uppgifter utan konto, i nio testtyper. | |
| 13. Prov utan konto, lång | Utan konto gör du ett prov på fem uppgifter i den testtyp du väljer, nio att välja på, och ser resultatet direkt. För en av uppgifterna visar vi rätt svar och regeln bakom. Resten av förklaringarna väntar i kontot. | Provsidan har `noindex`: länka till den, beskriv den inte som en egen sida i sök. |
| 14. Fyra nya testtyper, kort | Talserier, spatial förmåga, ordförråd och deduktiv slutledning, i tre nivåer. | |
| 14. Fyra nya testtyper, lång | Fyra testtyper har kommit till: talserier, spatial förmåga, ordförråd och deduktiv slutledning. Med matrislogik, figurserier, verbalt och numeriskt resonemang blir det åtta, alla i tre nivåer. Grundnivån är gratis i alla åtta, ett test om dagen. | |
| 15. Personlighetstestet, kort | Personlighetstest enligt femfaktormodellen, läst mot rollen du söker. | |
| 15. Personlighetstestet, lång | Personlighetstestet bygger på femfaktormodellen (Big Five). Du svarar på 20 påståenden utan konto, 50 gratis i kontot och 120 i Premium. Profilen läses mot sex kravprofiler och ger dig frågorna rekryteraren lär ställa. | Resultat i ord, aldrig poäng 1 till 5 (SEO). |

### UX-kontrollen, beskrivningarna

- **Korta rader** är högst 95 tecken och ryms på tre rader i ett kort på 375 px.
- **Testerna först:** räknas flera funktioner upp i samma block står Rekryteringstester först, sedan CV, Personliga brev och Jobbsöket.
- **Märket Nyhet** står bara på Sökta tjänster, och bara till 2027-01-12 (SEO).

---

## artikelreklam

Reklamkorten i artiklarna. Skiss `sidor/artikelreklam.html` med delarna `delar/artikelreklam-kort-*.html`, not `noter/artikelreklam.md`. Källan i koden är `src/components/artiklar/reklam/reklam-copy.ts`. SEO:s ram: tester 79 ord (81 i dag), CV-analys 53 (47), personliga brev 56 (49), sidokort och slutkort oförändrade. Korten får inte krympa; att de växer är bra. Orden är räknade på etikett, rubrik, text, gratisrad, knapp, länk och Premiumrad, med talen utskrivna.

I varje kort: rubriken är ett stycke, aldrig h2 eller h3. Bilden är `aria-hidden`. Gratisraden står i en egen ruta med bock. Premiumraden slutar med priset ur `PLANS`. Länkmålen är dagens.

### Kortet för tester (`INLINE_PROVA`, indigo) · 79 ord

| Plats | Lydelse | Not |
|---|---|---|
| `aside`, `aria-label` | Rekryteringstester | |
| `.rk-ey` | Rekryteringstester | I dag "Prova på riktigt". |
| `.rk-rub` (stycke) | Vilken figur hör hemma i den tomma rutan? | Står som i dag. |
| `.rk-brod` | Det här är en av våra expertuppgifter: tre regler samtidigt, form, tecken och fyllning. | "expertuppgifter", inte "expertfrågor". |
| `.rk-gratis` | Fem uppgifter gratis här, rätt och fel direkt. Facit och grundnivån i alla åtta testtyperna, ett test om dagen, gratis med konto. | Andra meningen ur `GRUNDNIVAN_ALLA_DAG`. |
| `.knapp` | Prova fem uppgifter | 19 tecken. Till `/verktyg/rekryteringstester/prova`. |
| `.lank` | Se alla tester och nivåer | Till `/verktyg/rekryteringstester`. Står som i dag. |
| `.rk-paket` | Avancerad och expertnivå, övningsprov mot klockan i samma format som Matrigma, Alva, SHL och Aon, och det fördjupade personlighetstestet ingår i Premium, 149 kr i månaden. | Står som i dag. |
| Bilden (`aria-hidden`) | Matrislogik · Expertnivå · 0:48 | Den riktiga expertuppgiften (`MatrisExpert`), inte skissens handritade. |

### Kortet för CV-analys (`INLINE.analys`, petrol) · 53 ord

| Plats | Lydelse | Not |
|---|---|---|
| `aside`, `aria-label` | CV-analys | |
| `.rk-ey` | CV-analys | |
| `.rk-rub` (stycke) | Se varför CV:t fastnar innan du skickar det | Står som i dag. |
| `.rk-brod` | Ladda upp CV:t, så läser vi det som en rekryterare gör i första urvalet. | Står som i dag. |
| `.rk-gratis` | Läsbarhetspoängen och genomgången i sju delar är gratis, för varje CV. | Textbeslut REK-1. |
| `.knapp` | Analysera mitt CV | 17 tecken. Till `/verktyg/cv-analys`. |
| `.rk-paket` | Alla förslag från Jobbcoachen, och nya efter varje ändring, ingår i Premium, 149 kr i månaden. | Textbeslut REK-1. |
| Bilden (`aria-hidden`) | Sara Lindström · 93 · av 100 i dag · 7 poäng kvar till 100 | Exempel. Poängen enligt textbeslut TEL-1: räknad på Saras exempel-CV om det går, annars 93. Perioder skrivs "2021 till nu", utan tankstreck. |

### Kortet för personliga brev (`INLINE.brev`, plommon) · 56 ord

| Plats | Lydelse | Not |
|---|---|---|
| `aside`, `aria-label` | Personliga brev | |
| `.rk-ey` | Personliga brev | |
| `.rk-rub` (stycke) | Skriv det personliga brevet på annonsen, inte på mallen | Står som i dag. |
| `.rk-brod` | Klistra in annonsen, välj ton, vi skriver utkastet utifrån ditt CV. | Står som i dag. |
| `.rk-gratis` | Ett personligt brev var sjunde dag är gratis, och de två senaste går att ändra. | Textbeslut REK-2. "sjunde" ur `LETTER_WINDOW_DAYS`. |
| `.knapp` | Skriv mitt personliga brev | 26 tecken, två över riktmärket. Står som i dag och ryms utan pil. Till `/skapa-brev/start`. |
| `.rk-paket` | Personliga brev utan tak, som PDF eller Word, ingår i Premium, 149 kr i månaden. | Textbeslut REK-2. |
| Bilden (`aria-hidden`), brevet | Sara Lindström · Ansökan: projektledare · När ni söker en projektledare som håller ihop upphandling och tidplan känner jag igen mina senaste tre år. · Ni skriver att rollen kräver vana vid offentlig upphandling enligt LOU. Den har jag. | Exempel. Skissens "inom budget på 42 miljoner" och "Jag har drivit fyra sådana" står inte: inga påhittade tal i exempel. |
| Bilden (`aria-hidden`), kraven | Annonsens krav · Upphandling · Budgetansvar · Tidplan · PMP-certifiering · 3 av 4 krav har fått svar | Exempel. |

### Nytt kort: Jobbsöket, träffen (`JOBB_KORT.matchning`, skog) · 45 ord

Står i artiklarna om matchning, till exempel `ai-jobbmatchning`. Det ersätter dagens kort bara om dagens korts länkmål står kvar i artikeln; annars läggs det till som slutkort (SEO).

| Plats | Lydelse | Not |
|---|---|---|
| `aside`, `aria-label` | Jobbsöket | |
| `.rk-ey` | Jobbsöket | |
| `.rk-rub` (stycke) | Se vilka annonser som passar ditt CV | |
| `.rk-brod` | Vi läser ditt CV och söker bland annonserna i Platsbanken. Varje träff visar varför du passar. | |
| `.rk-gratis` | Tre träffar är gratis, med skälen utskrivna. | Talet ur `FREE_TIER_JOB_LIMIT`. |
| `.knapp` | Hitta jobb gratis | 17 tecken. Till `/verktyg/jobbmatchning`. |
| `.rk-paket` | De 25 bästa träffarna ingår i Premium, 149 kr i månaden. | Talet ur `JOB_MATCHES_PER_RUN`. |
| Bilden (`aria-hidden`) | 91 · Projektledare, bygg · Sweco, Göteborg · Sista ansökningsdag 28 nov · Därför passar du · 1 av dina 3 roller · Fyra av dina kompetenser · Göteborg, en av dina orter · 86 · Uppdragsledare · Trafikverket, Mölndal | Exempel. Inget "vad som saknas" (textbeslut B-4). |

### Nytt kort: Jobbsöket, Sökta tjänster (`JOBB_KORT.sokta`, skog) · 66 ord

Står i artiklarna om uppföljning: `soka-jobb-via-mail`, `uppfoljning-efter-intervju` och `personligt-brev-jobbansokan` (SEO). Samma villkor som ovan.

| Plats | Lydelse | Not |
|---|---|---|
| `aside`, `aria-label` | Sökta tjänster | |
| `.rk-ey` | Jobbsöket | Delens namn, som i de andra korten. Koden har "Sökta tjänster" här i dag: byt. |
| `.rk-rub` (stycke) | Håll koll på varje jobb du har sökt | Samma ord som den nya sidans H1. |
| `.rk-brod` | Logga jobbet du har sökt, så räknar vi dagarna. Efter tolv tysta dagar föreslår vi ett uppföljningsmejl och skriver utkastet. | "tolv" ur `NO_RESPONSE_NUDGE_DAYS`. Kortare än utkastet i koden, som är sidans hela värdemening. |
| `.rk-gratis` | Att logga och se statistiken är gratis för alla med konto. Det första utkastet också. | `UPPFOLJNING_GRATIS_UTKAST`. |
| `.knapp` | Håll koll på sökta jobb | 23 tecken. Till `/verktyg/sokta-tjanster`. Kodens "Så fungerar Sökta tjänster" är 26 tecken och ryms inte med pil i kortet på 375 px. Sökordet "sökta jobb" står kvar i ankartexten. |
| `.rk-paket` | Uppföljningsmejl till varje sökt tjänst och månadsrapporten med alla rader ingår i Premium, 149 kr i månaden. | Inget tak skrivs ut (textbeslut B-13). |
| Bilden (`aria-hidden`) | Ska sökas 1 · Sökt 3 · Intervju 1 · Erbjudande 0 · 12 dagar | Exempel. De fyra facken ur sidan Sökta tjänster, två gånger två på 375 px. |

### Övriga kort, i samma form

Samma ord som i dag, bara flyttade till den nya formens platser. Inget länkmål ändras.

| Plats | Lydelse | Not |
|---|---|---|
| Mallkortet (`INLINE.mallar`), `.rk-ey` | CV-mallar | Petrol. Bilden visar riktiga mallminiatyrer (SEO), Linne och Björk först. |
| Mallkortet, `.rk-brod` | Byggda så att rekryteringssystem läser dem rätt. Du fyller i, vi formaterar. | Dagens text delad i två, samma ord: 46 ord före och efter. |
| Mallkortet, `.rk-gratis` | Två mallar och en nedladdning utan att betala. | Talet ur `FREE_TEMPLATE_COUNT`, en nedladdning ur `FREE_CV_EXPORTS`. |
| Mallkortet, rubrik, knapp, Premiumrad | Står kvar ordagrant. | "Välj en mall" till `/cv-mallar`. |
| Coachkortet (`INLINE.coach`), `.rk-ey` | Jobbcoachen | Skog. Rubrik, text, gratisrad, knapp och Premiumrad står kvar ordagrant. Gratisraden finns redan som eget fält. |
| Coachkortet, bilden (`aria-hidden`) | Vad skriver jag i ett uppföljningsmejl? · Håll det kort. Säg vilken tjänst det gäller, att du fortfarande är intresserad och fråga när de räknar med att ge besked. | Samma samtal som på startsidan (textbeslut JC-3). Inget belopp, ingen källa. |
| Räknarkortet (`INLINE_RAKNARE`) och länkraden (`LANKRAD`) | Står kvar ordagrant. | Grafit. Texten är textbeslut REK-3. De tre respektive två länkarna står. |
| Provkorten per testtyp (`TypProvKort`) och intervjuartiklarnas provkort (`TESTKORT_INTERVJU`) | Står kvar ordagrant. | Indigo. "fråga" blir "uppgift" bara där ordet gäller en testuppgift. "Intervjufrågor" är fortfarande frågor. |
| Gratiskortet (`GRATIS_KORT`) och listans slutkort (`LISTA_SLUT`) | Står kvar ordagrant. | Raderna läses ur `GRATIS_LISTA` och `PLANS`. |

### Sidokortet och slutkortet · oförändrade ord

| Plats | Lydelse | Not |
|---|---|---|
| Sidokortet (`SIDO`), alla tre | Står kvar ordagrant. | Gratisraden för tester läses ur `GRATIS_TESTRAD_PROV` och säger "uppgifter" när den konstanten har rättats (textbeslut B4). 46 ord. |
| Sidokortets bild (`aria-hidden`) | 0:48 | Testets klocka och stapel. |
| Slutkortet (`SLUT`), alla tre | Står kvar ordagrant. | 83 ord i testvarianten. |
| Slutkortets bild, tester (`aria-hidden`) | Matrislogik · Expertnivå · 12 av 15 rätt | Exempel. Ersätter de tre telefonerna. |
| Slutkortets bild, CV och brev (`aria-hidden`) | Samma ark och brev som i korten ovan, större. | |
| Slutkortets bild, allt (`aria-hidden`) | Samma träff som i kortet för Jobbsöket. | |

### Artikelns topp

| Plats | Lydelse | Not |
|---|---|---|
| H1, ingress, brödsmulor, författarrad, artikelbild | Står kvar ordagrant. | BYGGBRIEF beslut 8: väggen i klustrets färg står kvar. |
| Hjältens knapp i testartiklarna | Prova fem uppgifter gratis | 26 tecken, två över riktmärket. I dag "Prova fem frågor gratis", samma längd. |
| Länken bredvid | Läs guiden | Står som i dag. |

### UX-kontrollen, reklamkorten

- **En knapp per kort.** Testkortet har en textlänk bredvid, de andra ingen.
- **På telefon** ligger bilden mellan rubriken och texten och kortet blir nästan en skärm högt. Knappen ska synas utan mer än en rullning: krymp bilden före texten.
- **Tre mörka ytor per artikel** (rutan, sidokortet, slutkortet). Ingen av dem får en andra kopparknapp.
- **Etiketten** är alltid delens namn som användaren ser det: Rekryteringstester, CV-analys, CV-mallar, Personliga brev, Jobbsöket, Jobbcoachen.

---

## Stämmer inte

Ställen där skissen, textbeslutet, SEO:s besked och koden säger olika, och vilken lydelsen i den här filen följer. Ordningen är alltid densamma: en sann lydelse går före allt, SEO:s besked går före skissen, textbeslutet gäller där SEO inte uttryckligen har ändrat det, och sidans befintliga text går före skissens omskrivning.

### sokta-tjanster

1. **Två SEO-underlag.** `seo-krav.md` har en äldre disposition (title på 52 tecken, sju H2, "Logga en sökt tjänst på en minut"). `seo-besked-skisser.md` har den nyare (56 tecken, elva H2). Följer beskedet.
2. **Etiketten.** Skissen: "Sökta tjänster, gratis för alla med konto". SEO: "Sökta tjänster". Följer SEO. Gratis står i första talbrickan.
3. **Tre H2.** Skissen: "Logga en tjänst du har sökt", "Tyst i tolv dagar? Utkastet är redan skrivet.", "Underlaget till din aktivitetsrapport, redan ifyllt". Följer SEO:s tre.
4. **"Ligger ett utkast klart".** Skissen säger det i hjälten. Utkastet skrivs när man öppnar det (SEO). Lydelsen är "föreslår vi ett uppföljningsmejl och skriver utkastet", också i kedjan på jobbmatchningen.
5. **Frågorna.** Skissen har nio, med egna lydelser. Följer SEO:s åtta. Den nionde ("Vem kan se mina sökta tjänster?") och raden "ingen där ser ditt konto": ägarens, skrivs inte.
6. **Ordmängden.** SEO bedömer 900 till 1 100 ord. SEO:s egen disposition med elva H2 och åtta frågor ger cirka 1 500. Följer dispositionen. Ska sidan kortas är det bildernas exempel som går först, inte löptexten.
7. **Regelrutan om aktivitetsrapporten** finns inte i skissen. SEO:s disposition kräver de belagda fakta med källa i rapportavsnittet. Tillagd, med källa och läsdatum.
8. **Obelagt i skissen, struket eller omskrivet:** "Tar en minut", "De flesta ansökningar får aldrig en påminnelse", "Den försvinner aldrig ur din historik" (man kan ta bort en tjänst), "Du ser vilken väg som ger svar" (kortet visar antal per väg).
9. **Arkets kanal.** Skissen: "Svar på annons". Arket i kontot: "Annons". Följer kontot.
10. **Arbetskopian saknar omgång 2.** "Kallad till test" och `INTERVJU_BESKED_DAGAR` finns på main, inte i `C:\Users\chris\cvbrev-publikt3`. Texten räknar dem som live (BRIEF). Byggaren läser dem ur konstanterna när grenen är inslagen; tills dess står talet sju utskrivet och "Kallad till test" med i statusraden.

### start

11. "Så hjälper vi dig komma förbi" är en länk till `/priser` i dag och en etikett i skissen. Följer dagens sida, annars försvinner en länk.
12. Jobbcoachens ingress och samtal: skissen mot textbeslut STA-5, STA-6 och JC-3. Följer textbeslutet.
13. Skissens gratisrad för testerna har tappat "och personlighetstestet", och Jobbkartans andra mening saknas. Dagens text står.
14. Blocket Sökta tjänster har en ny H3 i skissen, medan SEO säger att H3 står oförändrade. H3 står med, och blir ett stycke om grinden fäller.

### funktioner

15. Etiketten över Jobbsöket: skissen "Jobbsöket", textbeslut FUN-3. Följer FUN-3.
16. Brevets sista steg: SEO sa ja till skissens "Redigera, välj mall och skicka. Nedladdning ingår i Premium.", textbeslut GEM-9 har "Redigera, ladda ner som PDF eller Word, skicka." Följer textbeslutet, eftersom beskedet inte uttryckligen ändrar det. SEO avgör i slutgranskningen.
17. Gratisraderna för brev och CV-analys, de två H3 om CV, hjältens fetade rad: skissen mot FUN-5, GEM-7, FUN-7, FUN-8, FUN-11. Följer textbeslutet.
18. Sökta tjänster: skissens text mot copys GEM-12. Följer GEM-12 ordagrant.
19. Skissens förklaring till "uppgift 9" är påhittad. Den hämtas ur bankuppgiften som visas, annars utgår rutan.
20. Kortet Inför intervjun är en länk i skissen. Funktionen har ingen publik sida, så kortet är ingen länk.

### priser

21. Tabellen: skissen byter radernas etiketter. SEO kräver dagens. Följer SEO, bara de nya raderna är nya.
22. Kom igång: skissen har elva stopp och "Kom igång, steg för steg". Följer GEM-13: tolv stopp och etiketten ur listans längd.
23. Skissen saknar kortet Inför intervjun (textbeslut B-9) och länken "Så fungerar Sökta tjänster". Båda är inskrivna.
24. Märket "Nyhet" på Sökta tjänster-kortet är bytt till "Gratis för alla med konto". Copys val, inget besked.
25. Tonradens Premiumcell: skissens "Vi väljer åt dig efter annonsen" läses som att valet försvinner. Lydelsen är "Du väljer, eller så väljer vi efter annonsen".

### meny

26. Tre saker som redan är byggda i `LandingNavbarMega.tsx` och `nav-data.ts` avviker från SEO:s besked och är märkta "ändra": underraderna "Syns i rekryterarnas sök" och "Svar med källor", märket Nyhet inne i länken, och "CV-mallar per yrke" i foten som pekar på `/cv-mallar` i stället för `/cv-mallar#yrken`.
27. Premiumraden: skissen "jobbmatchning", GEM-6 "Jobbsöket". Följer GEM-6. Foten: Jobbcoachen under Jobbsöket (SEO), inte under Rekryteringstester som i skissen.
28. Två underrader är copys egna, inom SEO:s "fria inom sanningen": "Håll koll på dina sökta jobb" och "Skrivet mot annonsens krav".

### registrering, inloggning, om-oss

29. Registreringens kort för CV-analysen: skissen mot REG-1. Följer REG-1. Fem eller tre val på skärm 3 avgörs av BYGGBRIEF beslut 5; båda uppsättningarna står i sektionen.
30. Glömt lösenordet: skissen stryker citatet och talen. SEO och textbeslut B-30 säger att de står tills ägaren har svarat. Följer dem.
31. Inloggningens panel har `aria-hidden` på fyra block som är text. Ska bort.
32. Om oss: tre meningar där skissen avviker. Följer INF-4, INF-2 och SEO:s lydelse om källorna.

### rekryteringstester

33. Skissen kortar eller stryker befintlig text på flera ställen (hjältens ingress, ingressen med TRR-siffrorna, steg 1, personlighetsplattan, två guidetexter, två FAQ-svar). Det befintliga står, bara det nya läggs till.
34. Brickan "20 %": dagens text säger "upp till 20 procent". Lydelsen är "Upp till 20 %".
35. Ordet "ram" står i skissens synliga text. Lydelsen är "går till på samma sätt".
36. "Nivåtest" i de ritade skärmarna är lägets namn i kontot, inte Nivåkollen, och står i bilden. I ingressen gäller SEO:s ersättare ordagrant.
37. Låsraden i provkortet följer provets egen text (`prov-copy.ts`), inte skissens.
38. Textbeslut B4 lägger bytet "fråga" till "uppgift" i ett eget svep, SEO har sagt ja till bytet på den här sidan. Bytet är listat ställe för ställe, inga byten utanför listan.

### cv-analys, skapa-cv, cv-mallar, linkedin, personlighetstest

39. CV-analysens lyft lovar "Delen där du tappar mest" i skissen. Textbeslut B-2 förbjuder det. Lydelsen är "Det viktigaste att ändra först".
40. "Förslagen gör jobbet åt dig" under Vägen till 100 poäng lovar för mycket och är omskrivet. "Släpp din CV-fil här" står bara om släppytan byggs.
41. Premiumlistorna på cv-analys, linkedin och personligt-brev säger "jobbmatchning" i skissen. Lydelsen följer textbeslut B-8 och GEM-6.
42. Skapa CV: skissen kortar Premiumtexten. Hela texten står (GEM-5). Sidan har tre lydelser för samma knapp; alla är dagens länktexter och står.
43. Skissernas ark har tankstreck i perioderna under erfarenheten. Lydelsen är "2021 till nu", överallt.
44. CV-mallar: Premiumremsan följer SEO ordagrant, inte skissen. Chipet "Gratis som Word" står utanför `h3`, mallens namn i visaren är ett stycke. "1 yrken" är rättat till "1 yrke".
45. LinkedIn: etiketten inuti `h1` är bara godkänd för cv-analys och står utanför här. "optimerar" står (SEO: NEJ till "skriver om"). "Fem steg, fem minuter" är kortat till "Fem steg". "Kopiera alla sektioner" är en bild, ingen knapp.
46. Personlighetstestet: skissens mätare har spann för alla fem faktorerna, `KRAVPROFILER` ställer tre krav i profilen. De två andra får "Inget krav i den här profilen". Sjätte kravprofilen heter "Lager, produktion och drift".
47. Personlighetstestets hjälte har raden "Fem faktorer, 1 till 5", provets egen resultattitel. Den står i bilden fast SEO vill ha bandord i stället för tal. SEO avgör i slutgranskningen.
48. Fotnoten "Svaren sparas i sju dagar" under provet: ägarens, står ordagrant.

### personligt-brev och brevsidorna

49. **Regel 1 säger emot sitt exempel.** SEO:s efterexempel "Ledde intressentdialogen i tre projekt" står ordagrant, men regelns egen text, som står kvar, säger "Står det 'stakeholder management' i annonsen, skriv just den frasen". SEO bör se det.
50. Tonblocket: skissens "byter när du vill" stämmer inte, ett tonbyte skriver om brevet och räknas mot kvoten. Lydelsen är "Byter du efteråt skriver vi om brevet i den nya tonen."
51. "Du väljer ton innan brevet skrivs" stämmer i kontot men inte i det publika startflödet, som saknar tonval. Meningen står och är flaggad.
52. Märken inuti `h3` ("Ett brev gratis utan kortuppgift") skulle byta en rubrik som SEO kräver. Märket står utanför.
53. "Brev som fungerat, yrke för yrke" står kvar på verktygssidan, fast startsidan byter samma fras till "Brev att utgå från". Inget besked finns för verktygssidan. Bör få samma byte.
54. Länken efter fotraden på brevexemplen och i visaren: skissen "Se alla 40 mallar" till `/cv-mallar`. Följer SEO: "Se alla 40 brevmallar" till `/verktyg/personligt-brev`.
55. Brevets tre delar heter Öppningen, Mitten och Avslutet som på verktygssidan, inte skissens Inledningen, Huvuddelen, Avslutningen. Märket på CV-kortet är "Samma person", inte "Samma person, samma mall".
56. Navets fjärde guidesvar: skissens första stycke saknar "mall" och "ladda ner", som SEO kräver. Båda orden står i lydelsen.
57. Vårdens ingress: talet räknas per typ ur datan, eftersom texten delas med CV-kategorin.
58. Startflödet: platshållaren i Arbetsgivare är dagens, inte skissens "Till exempel Sweco". Spärrens första rad har fått "och ändra" (BRV-1).
59. "Tillbaka till hubben" och "hub-sidan" på navet är interna ord som står i dag. Förslag till textspåret: "Alla exempel".

### jobbmatchning, jobbcoachen, bli-upptackt

60. Jobbmatchningens tredje talbricka: skissen "0 kr att börja, utan kortuppgift". Inget besked, dagens "Hela Sverige, alla branscher" står.
61. Kedjans länk: skissen "Så fungerar Sökta tjänster". Följer SEO: "Håll koll på dina sökta jobb".
62. Ingressen till Från träff till ansökan och alla FAQ-svar i skissen är äldre än textbeslutet. Koden gäller.
63. Arbetsgivarna i exemplen är verkliga i träffarna (Sweco, Trafikverket, dagens grenar) och påhittade på sidan Sökta tjänster. Avsiktligt: en träff säger inget om arbetsgivaren, en tyst ansökan gör det.
64. Jobbcoachens samtal i hjälten och svaret i lyftet har påhittade källor i skissen. Följer SEO: textbeslut JC-3 i hjälten, kodens demo 2 i lyftet.
65. **Ny text utan uttryckligt besked på Jobbcoachen:** etiketten "svar med källor", brickorna "Källor, du kan kolla själv" och "6, svenska källor bakom svaren", lyftets rubrik "Du ser var svaret kommer ifrån". Dagens "Källa till varje svar" är osann enligt B-19 och "Sekunder till första svaret" är inte mätt. SEO tar dem i slutgranskningen.
66. Nionde FAQ-frågan på Jobbcoachen: SEO: NEJ. Byggs inte.
67. Bli upptäckt: skissens "chattar i appen" är "här på jobbcoach.ai". Listan Syns på kortet följer sidans egen H3-text ("två främsta styrkor"), inte skissens kortare rad. Arbetsgivaren och "percentiler": ägarens, skrivs inte.

### artikelreklam och nya funktioner

68. Kortet för Sökta tjänster är redan utkastat i `reklam-copy.ts` med etiketten "Sökta tjänster" och knappen "Så fungerar Sökta tjänster". Lydelsen här har etiketten "Jobbsöket", som de andra kortens delnamn, och knappen "Håll koll på sökta jobb", som ryms. SEO har bara sagt att knappen är ankartexten.
69. Brevkortets exempelbrev har påhittade tal i skissen ("inom budget på 42 miljoner", "Jag har drivit fyra sådana"). De står inte.
70. Noten räknar CV-analysens och brevens kort som ett och två ord över SEO:s ram. SEO har godkänt 53 och 56 ord.
71. `nya-funktioner.md` säger att Word är gratis i Linne och Björk. Gratisnivån har en nedladdning, så lydelsen är att den nedladdningen kan vara en Word-fil.

## SEO-lydelser och mått

Ingen av SEO:s lydelser behövde kortas på sin plats. De här ligger över riktmärket:

| Lydelse | Tecken | Var | Vad som gäller |
|---|---|---|---|
| Så fungerar Sökta tjänster | 26 | Knapp på start, funktioner och priser | Står. Bryter den på 375 px blir den textlänk med samma ankartext. I artikelkortet, där den har pil, är den bytt till "Håll koll på sökta jobb" (23). |
| Håll koll på dina sökta jobb | 28 | Länk i kedjan på jobbmatchningen | Står, som textlänk. |
| per dygn hämtas nya annonser | 29 | Talbricka på jobbmatchningen (JM-4) | Står, på två rader. |
| testtyper, grundnivån gratis | 28 | Talbricka på startsidan | På gränsen, står. |
| Mer i Jobbcoach Premium, 149 kr i månaden | 39 | Etikett på funktioner (FUN-3) | På gränsen, står. |

Befintliga texter som står kvar fast de går över måtten: "Prova sex uppgifter ur I-provet" (31) och "Prova fem uppgifter utan konto" (30) på testsidan, etiketten "Rekryteringstester, kom förberedd till provet" (45), "Köp Premium, 149 kr i månaden" (29) på priser, "Skriv mitt personliga brev" (26) och "Skapa konto och läs brevet" (26) för breven, "Prova fem uppgifter gratis" (26) i artiklarnas topp. Två har en kortare ersättare i sin sektion: skapa-cv:s första talbricka ("du skriver direkt i mallen", 26) och sökta-tjanster:s hjälteknapp ("Börja logga gratis", 18, i stället för skissens 29).

## Ägarens, skrivs inte

- Sökta tjänster: frågan "Vem kan se mina sökta tjänster?" och raden "ingen där ser ditt konto".
- Jobbcoachen: frågan "Vad vet Jobbcoachen om mig?".
- Bli upptäckt: vad som gäller arbetsgivaren efter ett ja, och "percentiler" i samtycket.
- Glömt lösenordet: "100% krypterat" och "24 h".
- Personlighetstestet: fotnoten om hur länge svaren sparas.
- Alla FAQ-svar om säkerhet och datalagring, på varje sida. De står ordagrant som i dag.
