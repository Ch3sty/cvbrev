# Brief: smal plan ska inte se tunn ut (2026-11-18)

## Ägarens iakttagelse (ordagrant i sak)

I appen Testklar (och samma logik på webben, /dashboard/tester) styr valet av "Mitt test" vad Idag, Tester och Utveckling visar.

- **Eget urval med alla deltester ikryssade:** Idag känns som en utmaning. Under "Fler pass i dag" står sju pass (textpass, sifferpass, figurpass, deduktivpass, ordpass, talseriepass, spatialpass), "Var du tappar" visar flera mönster, och Utveckling visar en rad per testtyp (figurer och mönster 3, deduktiv 5,3, och "ej mätt" för resten). Det händer mycket, man har något att bita i, och det ser ut som att man utvecklas.
- **Alva Logic (bara figurmatriser):** Idag har dagens pass, ett par rader under "Fler pass i dag", två "Var du tappar" och "Inför provet: Övningsprovet". Utveckling visar en enda rad (Figurer och mönster 3) och kurvan med en punkt. Det ser inte ut som att man behöver göra mycket, och inte heller att man kan se om man utvecklas.

Ägarens slutsats: ju mer man bockar i, desto bättre blir upplevelsen; ju mer man nischar sig, desto sämre ser vi ut. Det är ingen bugg utan en designmiss som också finns på webben. Uppdraget: låt användarna välja och nischa in sig, men visa ändå att man kan göra mycket mer och utvecklas mycket mer. Förslagen ska skissas i en artefakt för ägarens godkännande, med motivering. Agenterna ska komma överens. Inget byggs förrän ägaren godkänt.

## Möjliga fel som syntes på skärmdumparna (kontrollera, rapportera)

- Utveckling visar "dag 38 av 45" och kurvan börjar 11 oktober för ett konto vars provdatum är 25 november.
- Märket "Provdagen" ser ut att vara uppnått (orange bock) fast provdagen inte har kommit.

## Var koden ligger

- Appens vyer: `src/lib/mobilapp/vyer.ts` (byggKatalog, Idag, Utveckling), `src/components/mobilapp/IdagVy.tsx`, `KatalogVy.tsx`, `UtvecklingVy.tsx`.
- Webbens motsvarighet: `src/app/dashboard/tester/` (TesterHubClient, getHubData, testConfig), `src/components/traning/` (HemKlient, utveckling/*), `src/lib/traning/`, `src/lib/tester/` (deltesterForPlan, Mitt test, test_planer).
- Planer och beslut: `docs/plan-app.md`, `docs/plan-tester-*.md`, `docs/designsystem.md`, appkonceptet `docs/design/app-koncept-2026-11-13.html`.

## Gemensamma regler

- Svenska facktermer, inga em-dash, aldrig Sparkles-ikonen, användaren som "de/dem" när de omtalas, data som bild och inte uppräknade siffror i löptext.
- Inget får lova mer än testerna faktiskt mäter. Det ska vara sant och trovärdigt för någon inför ett viktigt prov.
- Förslag ska fungera både i appen Testklar och på webben, eller säga tydligt var de skiljer sig.
- Ändra ingen kod. Skriv ditt bidrag som en fil i `docs/design/smal-plan-2026-11-18/`.

## Ägarens beslut 2026-11-18

- **Fritt läge som standard, Plan inför provet som tillval** (ägarens input, alla fem agenter har gett sin syn i input-*.md).
- **Frågebanken anpassas efter designen, inte tvärtom.** "Vi kan inte designa fel pga ett annat fel." Intensiteten designas för det användaren behöver; räcker banken inte görs den större eller ändras karensen. Bankarbetet blir en förutsättning i planen med räknat behov per intensitet och testtyp.

## Ägarens besked, omgång 2 (2026-11-18)

1. **Träningen ligger fritt, inga tvingade provtillfällen.** "Testerna bör ligga fritt och man kan välja när man ska göra proven, så fungerar t.ex. alla körprovsappar, Duolingo, allt. Det känns som dålig UX att begränsa tränande och tvinga till provtillfällen." Alltså: obegränsad träning (för Premium), användaren väljer själv när de gör nivåkoll och övningsprov. Planen får föreslå, inte styra eller låsa. Om "intensitet" alls behövs är det högst ett frivilligt dagsmål, inte en begränsning.
2. **Artikelbesökaren (t.ex. Alva Logic) landar i sin plan, men ser alla tester.** Det som ingår i Alva Logic, alltså användarens test i rekryteringen, framhävs; resten finns kvar och går att träna fritt.
3. **Namn: "Plan inför provet"** för planen. Standardläget får inget eget namn.

## Ägarens besked, omgång 3 (2026-11-18)

1. **Gratis:** Nivåkollen och ett första pass gratis i varje testtyp. Resten av träningen är Premium (149 kr i månaden).
2. **Karensen kortas** så att frågorna kommer tillbaka oftare: "en användare kommer inte komma ihåg dem ändå", och vi slipper skriva lika många nya. Testansvarigs krav på sann mätning gäller fortfarande: lös det genom hur upprepade frågor räknas i nivån (t.ex. bara osedda eller tidigare fel frågor räknas i nivåkollen), inte genom att hålla frågorna borta länge.
3. **Ordning:** (a) nya skisser i en artefakt för ägarens godkännande, (b) implementering, (c) sist fler frågor i bankerna. De två felen (dag 38 av 45, märket Provdagen) rättas i implementeringen.

## Ägarens besked, omgång 4 (2026-11-18): styrande instruktioner efter skiss v2

Ägaren underkände skiss v2 på fem punkter:
1. "Allt öppet fram till provet" är fel. Premium är öppet så länge man har Premium.
2. Utveckling får inte visa bara en typ. Alla gör tester och får resultat, så utvecklingen ska visas per testtyp.
3. "Karta" förstår ingen. Använd inte begreppet eller den bilden.
4. Plan-läget låser in användaren: man ser inte att det finns många testtyper och missar 80 % av allt att göra.
5. "Övriga tester" är en värdelös lista som ingen vill trycka på. Jämför appens nuvarande Idag-lista ("Fler pass i dag" med ikon, beskrivning och Starta/Gjort per testtyp) och appens Utveckling (nivå per testtyp med reglage): de är inbjudande och bra.

Instruktioner, ordagrant i sak:
- **Allting fritt**, med möjligheten att välja vilken typ av prov man ska göra. Valets delar markeras bland testerna: de som ingår ska stå ut i mängden, men allt ska vara tillgängligt och lika inbjudande. Ingen separat "Övriga tester".
- **All utveckling ska gå att se i en graf**, en linje per testtyp, där det valda provets delar markeras och står ut (övriga syns men tonas ned).
- **När man väljer en testtyp** kommer man till det vanliga menyvalet: nivåer (hur svårt det ska vara: grund, avancerad, expert, ett pass), Nivåkollen om man vill mäta vilken nivå man ligger på, och möjlighet att göra ett prov (övningsprov).
- **Provresultat och Nivåkollens resultat ska gå att följa** över tid.

## Ägarens besked, omgång 5 (2026-11-19): efter skiss v3

Bra: **Tester** (listan med alla testtyper, status per typ, tryck öppnar menyn med nivåer, Nivåkoll och prov) ser ut och fungerar som ägaren vill.

Underkänt och nya instruktioner:
1. **Idag är usel och saknar syfte.** Allt heter "pass" (Matrispass, Figurpass ...), det är förvirrande, och när man kan välja och göra allt från Tester tillför Idag inget. Idag behöver en ny och bättre USP. Även med I-provet (tre delar) är den tom och förvirrande.
2. **Passen som begrepp** är rörigt, begränsar användaren, döljer vad vi har och riskerar att låsa in dem i fel saker. Alla tester är kanon; det är dem vi ska visa. Ifrågasätt passen helt.
3. **Gratis får inte ha fri tillgång till delar** (några tester öppna, andra låsta är fel). Gratis ska regleras på ett annat, enhetligt sätt för alla testtyper.
4. **Nivån visas fult** som ren text ("nivå 5,3"). Den ska visas som en snygg visuell indikator.
5. **"I ditt prov" byts mot "Ingår i <provet>"**, t.ex. "Ingår i Alva Logic".
6. **Din utveckling** ska bli tydligare, snyggare och mer interaktiv.
7. **Från en artikel om t.ex. Alva Logic** är det bra att få en hint om vad man ska träna på, men inte genom passen.

## Ägarens besked, omgång 6 (2026-11-19): underlag för skiss v4

1. **Båda förslagen behålls.** En startflik (Hem eller Idag, agenterna väljer namnet) som ger hintar om vad man borde göra, förutsatt att det finns data som pekar ut svagheter (svagt mönster, saknad Nivåkoll, tempo, provet nära), plus tips. Kortet "Nästa steg" får också ligga överst i Tester.
2. **"Träna" läggs in bland valen i varje testtyp** (i menyn tillsammans med nivåerna, Nivåkollen och övningsprovet). Det är i princip de gamla passen: uppgifter som anpassas efter nivån, förklaring efter varje svar, fokus på svaga mönster. Det måste tydliggöras för användaren vad Träna innebär.
3. **Data från träningen mäts och redovisas tillsammans med provens och Nivåkollens data** i Din utveckling, så att man ser sin utveckling över tid.
4. **Ordet "pass" används inte utåt.**
5. **Gratis:** ägaren har inte svarat; skissa saas-leads modell (ett avslutat test eller en träning om dagen, valfri typ och nivå, Nivåkollen inräknad, övningsprov och historik Premium) och märk den som rekommendation.
6. **Allt annat från omgång 4 och 5 gäller:** Tester som i v3, "Ingår i <provet>", visuell nivå 1 till 10 som samma komponent i lista, meny och utveckling, interaktiv Din utveckling, artikelhint som kort.

## Ägarens besked, omgång 7 (2026-11-19)

- **Gratis, beslutat:** ett grundnivåtest om dagen, valfri testtyp (samma regel för alla typer); Nivåkollen en gång per testtyp; genomgången av svaren alltid öppen. Premium: Träna, avancerad och expert, Nivåkollen när man vill, övningsprov, historik och kurva. Ersätter saas-leads modell A. Ägarens skäl: annars kan någon köra ett gratis test om dagen i en månad före provet.
- **Träna-texten** ska bli bättre, t.ex. att träningen anpassar sig efter nivån för att alltid vara utmanande och lärorik.
- **LYHÖRD** måste rymmas i ikonens ruta (i skissen).
- **Markeringen av provets delar** måste bli tydligare (det framgår inte att de orange korten ingår i I-provet). De som inte ingår kan märkas, t.ex. "Bra hjärnträning, men förekommer inte i <provet>" (copy formulerar så att det är sant).
