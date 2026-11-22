# Brief: skisser för publikt omgång 3 (2026-11-22)

Du ritar skisser för jobbcoach.ai:s publika sidor. Du bygger ingenting i produkten och ändrar ingen produktkod. Ägaren godkänner skisserna innan något byggs. Allt är på svenska.

## Varför

Det inloggade läget byggdes om 2026-11-21 och fick ett ordentligt lyft, inspirerat av Duolingo: mörk vägg i rummets färg, ljust golv, papper med tjock kant och klack, kopparknapp med klack, stora tal, riktiga dokument och instrument i stället för små bilder. De publika sidorna ska få samma standard och säga det som är sant om produkten nu. Varje del av produkten har sin färg och får ha sin egen struktur, och det ska synas publikt:

- Rekryteringstester: indigo (`data-rum="tran"`)
- CV: petrol (`data-rum="cv"`)
- Personliga brev: plommon (`data-rum="brev"`)
- Jobbsöket: skog (`data-rum="jobb"`)
- Konto, inloggning och annat utan egen del: grafit (`data-rum="neutral"`)

## Var du arbetar

- Allt ligger i `C:\Users\chris\cvbrev-publikt3\docs\design\publikt-omgang3\`. Skriv bara där.
- Rör aldrig `C:\Users\chris\cvbrev` (andra sessioners ocommittade filer). Läs gärna produktkoden i `C:\Users\chris\cvbrev-publikt3\src`.
- Ingen server, inget bygge av produkten, inga anrop mot produktionen eller databasen. Committa inte, pusha inte.
- Flera agenter ritar samtidigt. **Ändra inte** `kit.css`, `bygg.mjs`, `rendera.mjs`, befintliga filer i `delar/` eller andras filer i `sidor/`. Sidans egen CSS skrivs i ett `<style>` överst i din sidfil. Behöver du en ny delfil i `delar/`, ge den ett namn som börjar med din sidas namn. Saknas något i grunden som fler borde få: skriv det i din not under "Förslag till grunden".

## Så är en skiss uppbyggd

- Källa: `sidor/<namn>.html`. Första raden: `<!-- titel: Skiss <sida> | rum: <rum> -->`. `<!--@del namn-->` ersätts med `delar/namn.html`.
- Bygg: `node docs/design/publikt-omgang3/bygg.mjs <namn>` (kör från `C:\Users\chris\cvbrev-publikt3`). Resultat: `ut/skiss-<namn>.html`, fristående med all CSS i filen.
- Rendera: `node docs/design/publikt-omgang3/rendera.mjs <namn> 375 412 1440 --nu`. Bilderna hamnar i `bilder/<namn>-<bredd>-NN.png`, i bitar uppifrån och ned. Skriptet har ett lås så att bara en webbläsare kör åt gången på datorn: det kan ta en stund innan din tur kommer. Ägaren har sagt ja till rendering trots lite minne (2026-11-22), därav `--nu`. Starta aldrig en egen webbläsare vid sidan av skriptet.
- **Titta på varje bild du har renderat** (Read på png-filen) och rätta det du ser innan du går vidare. En skiss som du inte har sett renderad får inte lämnas över. Skriptet varnar också för låga tryckytor och text som sticker ut.

Läs först, i den här ordningen:
1. `kit.css` (hela) och filerna i `delar/`.
2. Referenssidorna `sidor/cv-analys.html` och `sidor/start.html`, och deras bilder `bilder/cv-analys-1440-01.png` till `-05`, `bilder/start-1440-01.png` till `-06`, `bilder/cv-analys-412-01.png`, `bilder/start-412-01.png`. De sätter nivån.
3. `underlag/inloggat/*.png`: så ser de nya inloggade rummen ut. Det är dem de publika sidorna ska spegla.
4. `underlag/live-idag/*.png` och `underlag/brev-publikt-idag/*.png`: så ser de publika sidorna ut i dag.
5. `underlag/text-live-2026-11-22/<sida>.txt`: sidans synliga text i dag. `_rubriktrad.txt`: titel, beskrivning, schematyper och H1 till H3 per sida.
6. `docs/designsystem.md` avsnitt 1 till 8 (inloggats regler), och sidans kod under `src/app/(public)/`.

## Grundens ordförråd (kit.css)

- `.nav` (står på väggen i sidans rum), `.fot` (grafit), `.mega` (menyn Vad vi erbjuder), `.kampanj`.
- `.vagg` + `.hjalte` + `.hjalte-rad` + `.hjalte-text`: hjälten. `.brod` brödsmulor, `.ey` etikett, `.h1`, `.varde`, `.knapprad`, `.brickor` > `.bricka` (ett tal med sin förklaring). `.hjalte.utan-lyft` när inget kort går in över väggen.
- `.lyft`: stort papperskort som går in över väggens nederkant (vyns första handling).
- `.sekt`, `.sekt-ton`, `.sekt-papper`, `.sekt-huvud`, `.rutnat r2/r3/r4`.
- `.kort`, `.kort-ton`, `.chip` (`.chip-gratis`, `.chip-premium`, `.chip-vagg`), `.nr` (`.nr-koppar`), `.vagsteg` (stegen som en väg), `.faq`, `.lankbricka`, `.dorr`.
- `.o` (ö: stort färgblock i ett rum, sätt `data-rum` på det), `.o-rad`, `.o-text`, `.o-bild`, `.o.vand`, `.o-huvud`.
- `.premium` (Premium-ön), `.bockar`, `.pris`.
- Knappar: `.knapp` (koppar, exakt en primär handling per skärmyta), `.knapp-vit`, `.knapp-glas`, `.knapp-liten`, `.lank`.
- Instrument: `.ark` (CV- och brevark, `delar/cv-ark.html`), `.nal`, `.svav` (svävande bricka), `.stapel`, `.ram` (testets ram, `delar/matris.html`), `.stig` (spåret, `delar/stig.html`), `.traff` (`delar/traffar.html`), `.brevpar` (`delar/brevpar.html`), `.chatt` (`delar/chatt.html`), `.gungar`.

## Formens regler

- Levande, illustrerat, påkostat. Platt underkänns. Referensen är Duolingo: stora färgblock, klackar, stora tal, en tydlig handling per skärm, Premium som syns.
- **Rita om innehållet, klä inte om det.** Ägaren har underkänt skisser där bara ramen var ny. Varje sektion ska ha en ny, bättre form för sitt innehåll: en tabell blir en bild, en punktlista blir kort eller en väg, en telefonskärm blir det riktiga instrumentet i stor skala.
- Visa produkten som den ser ut inloggat: det riktiga arket, den riktiga testuppgiften, det riktiga spåret. Ingen liten telefon med oläslig text som huvudbild. En telefonram får användas där ytan är liten (artikelreklamen).
- Data som bild: ett huvudtal eller en liten visualisering, aldrig tre tal i en textrad.
- Koppar är enda accenten. Aldrig rött i Jobbsöket. Aldrig gnistikonen (Sparkles). Aldrig emoji.
- Inga interna designord i synlig text (rum, vägg, golv, ö, instrument, station). Användaren ser "Rekryteringstester", "CV", "Personliga brev", "Jobbsöket".
- Rekryteringstester står först och störst överallt där verktyg räknas upp.
- Telefon först: 375 och 412 ska fungera utan sidledsrullning, tryckytor minst 44 px, minsta text 12 px.
- Exempelpersonen är Sara Lindström, projektledare i Göteborg. Använd henne där ett exempel behövs.

Riktiga mallminiatyrer finns att använda: `underlag/mallar/cv/<id>-liten.webp` (alla 40 CV-mallar, till exempel `linne-liten.webp`, `bjork-liten.webp`) och `underlag/mallar/brev/<id>.webp` (linne, bjork, koppar, kalksten, granit, fasad, terrakotta, ritning). Länka dem från sidan som `../underlag/mallar/...` (den byggda filen ligger i `ut/`). Rita inte mallar som grå streck när den riktiga bilden finns.

Fällor som redan har kostat tid:
- Papper som ligger på en vägg eller ö ärver ljus text. Grunden rättar `.kort`, `.lyft`, `.svav`, `.traff`, `.ram`, `.ark`. Gör du en egen pappersyta: sätt `color: var(--ink-1)` själv och kontrollera i bilden.
- Ett rutnätsbarn med `margin: 0 auto` krymper till innehållets bredd. Sätt `width: 100%`.
- Rutnätsbarn behöver `min-width: 0` för att inte spränga 375 px.
- Använd inte `font-variant-numeric: tabular-nums` på rubriksnittet (Schibsted Grotesk): komma och kolon spärras.
- Långa svenska ord i smala kort ("Rekryteringstester", "Personlighetstest") sticker ut på 375. Kontrollera.

## SEO är en grind

Sökmotorerna är sajtens enda trafikkälla. Därför:
- Behåll sidans H1 och H2 som de står i `_rubriktrad.txt`, i samma ordning, och behåll varje sektions innehåll, FAQ-frågor och interna länkar. Du ger innehållet ny form, du stryker det inte.
- Är en rubrik eller ett påstående osant mot produkten (se facit nedan): rita med en sann lydelse och skriv upp bytet i noten. Slutlig lydelse bestäms av saas-lead, SEO och UX i ett eget textspår, så lägg ingen tid på att fila på formuleringar. Sant och begripligt räcker.
- Schematyperna (WebApplication, HowTo, FAQPage med flera) behålls. HowTo-steg och FAQ-frågor ska gå att läsa på sidan.
- URL:er, canonical och slugs rörs inte.

## Text

- Skriv som en copywriter, inte som en AI. Vi-form, varierad meningslängd.
- Aldrig tankstreck (—) i löptext. Inga emoji.
- Svenska facktermer ur rekryterarens värld, inga engelska gränssnittsord.
- Skriv "personliga brev", "Jobbcoachen" (AI-hjälpen), "Premium" eller "Jobbcoach Premium", "sökt tjänst", "Matchade jobb", "Sökta tjänster", "Inför intervjun". Ordet "spår" används aldrig publikt. Priset står efter namnet: "Jobbcoach Premium, 149 kr i månaden".
- Lön skrivs aldrig ut i exempel. Inga påhittade citat, fall eller siffror som framställs som verkliga.
- Ändra aldrig texter om datalagring, GDPR, integritetspolicy eller villkor. Rita rutan och skriv "Svaret står kvar ordagrant som i dag".
- Mejlmallar rörs inte.

## Produktfacit (får aldrig sägas fel; belägg i koden om du är osäker)

Två grenar räknas som live enligt ägaren: `fix/brev-kvar` och `feat/jobbsoket-omgang2` (läs med `git show <gren>:<fil>` från arbetskopian).

**Pris.** Bara Jobbcoach Premium säljs, 149 kr i månaden (`src/lib/plans/plans.ts`). Rita inga nya priser, erbjudanden eller gränser. Kampanjord (Black Week) får aldrig stå i title, H1, description, FAQ eller schema, och behöver inte ritas alls.

**Rekryteringstester.** Åtta testtyper i tre nivåer (grundnivå, avancerad nivå, expertnivå). Grundnivån i alla åtta är gratis, ett test om dagen. Alla tester går i samma ram: startskärm, uppgifterna med klocka och framstegsstapel, resultat med uppgiftslista och förklaring. Ord: uppgift (inte fråga), Nästa, Svara, Lämna in, Visa resultatet. Nivåkollen ska inte stå i reklam. Läs `docs/designsystem.md` avsnittet Sessionsramen, `docs/bygg-noter-testflode.md` och `src/components/session/` för hur det ser ut. Personlighetstestet: femfaktormodellen, publikt prov med tjugo påståenden, femtio i kontot.

**CV-analysen.** Genomgång i sju delar som ger 100 poäng: Kontaktuppgifter 10, Personbeskrivning 15, Erfarenhet 35, Kompetenser 12, Utbildning 8, Språk 5, Datum, ordning och längd 15. Poängen heter läsbarhetspoäng. Rubriken i vyn: "N poäng kvar till 100". Gratis: poängen och vad som saknas i alla sju delar för varje CV, utan kvot. "Hämta Jobbcoachens förslag": en gång per konto gratis, bara den tyngsta förslagstexten öppen. Premium: alla förslag, nya förslag efter ändringar, "Ersätt mitt nuvarande CV". Skriv aldrig "en analys per konto", "kör om analysen", "ATS-poäng", "fyra delar" eller "sex saker". "ATS" får stå en gång som förklaring. Inskannade PDF:er läses bara inloggat och bara på svenska.

**CV-rummet.** Flikarna Ditt CV, Mallar, Analys. 40 mallar, Linne och Björk gratis, 26 finns som Word, foto i 15. Nya CV-byggaren: man skriver direkt på arket, Jobbcoachens förslag 3 per konto gratis.

**Personliga brev.** Samma 40 mallar som CV. Linne och Björk gratis, 38 i Premium. PDF för alla 40, Word för 26. Att ladda ner kräver Premium. Första brevet gratis, sedan ett per rullande sju dagar. Alla brev sparas, på gratisnivån går de två senaste att redigera. Fem toner: Professionell, Entusiastisk, Kreativ, Självsäker, Balanserad; automatiskt tonval i Premium. Skriv brev är en enda skärm. Rummets vyer: Dina brev, Mallar, Skriv brev, Brevet. Brevet visar träffarna mot annonsens krav. Talen hämtas ur `src/components/publikt/brevmallar.ts`.

**Jobbsöket.** Flikarna Översikt, Matchade jobb, Sökta tjänster, Inför intervjun. Till rummet hör Jobbcoachen och Bli upptäckt.
- Matchade jobb: visar senaste körningen och söker om först när användaren trycker. Ingen nattlig matchning, inget "när du öppnar sidan". Annonserna hämtas från Platsbanken tre gånger per dygn. Gratis tre öppna träffar, Premium de 25 bästa (inte "alla"). Inget steg "Aktivera ditt CV": senaste CV:t läses in, knappen heter "Byt CV". På en träff: Skriv brev, Spara till Ska sökas, Markera som sökt, sista ansökningsdag.
- Sökta tjänster: gratis för alla (logga, lista, statistik som tratt). Ska sökas (sparad annons med sista ansökningsdag). Veckans mål, förval 3. Statusar bland annat Sökt, Kallad till test, Intervju, Erbjudande. Uppföljningsmejl föreslås efter tolv tysta dagar, utkastet öppnas i användarens egen e-post, vi skickar aldrig själva; första utkastet gratis, sedan Premium. Månadsrapporten (underlag till Arbetsförmedlingens aktivitetsrapport): radlistor, utskrift och kopiering är Premium, användaren lämnar in den själv.
- Jobbcoachen: tio gratis meddelanden per konto. Känner till målroll, ort och bransch ur profilen och de dokument användaren delar i samtalet. Känner inte till matchningar eller testresultat. Föreslår frågor utifrån läget i de sökta tjänsterna.
- Inför intervjun: intervjuprov med bedömning, ett per dygn gratis. "Intervjuer på gång". Frågan "När är intervjun?".
- Bli upptäckt: kandidatprofil för rekryterare, anonym tills man själv tackar ja, styrkor aldrig råpoäng, lönespann visas aldrig utåt.

## Vad du lämnar per sida

1. `sidor/<namn>.html`, byggd och renderad i 375, 412 och 1440, och granskad av dig i bilderna.
2. `noter/<namn>.md`, kort:
   - Vad som ändras mot i dag (form, sektion för sektion).
   - Oförändrat för SEO (rubriker, FAQ, länkar, schema).
   - Rubriker och påståenden som bytts för att de var osanna, med gammal och ny lydelse.
   - Det som kräver beslut.
   - Vilka filer bygget rör, så långt du kan se.
   - Förslag till grunden, om något saknas.

Ditt slutmeddelande: sidorna du ritade med sökvägar, valen du gjorde där underlaget lämnade öppet, vad du är osäker på och vad du inte hann. Sagt rakt ut.
