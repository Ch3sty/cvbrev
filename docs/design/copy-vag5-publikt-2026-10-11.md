# Copygranskning våg 5: publika texter, köpväg och betalväggar

Copywriterns beslut 2026-10-11, natt. Ägaren är borta och har lämnat textbesluten hit. Granskat i worktree `agent-a7eef925647d8c234` mot `main`, facit är `docs/design/copy-premium-2026-10-11.md` (nedan "facit") och minnesreglerna om svenska facktermer, copywriting-stil, inga tankstreck och paketnamnen. Ingen kod är ändrad här; Opus-agenten gör bytena och vänder testerna enligt avsnitt 8.

Formen är `nuvarande → ny`. "Behåll" betyder att våg 5-strängen står. Där texten lovar något som koden måste bära upp står det under **Kontroll**. Det som kräver ägarens eller juristens blick är markerat **ÄGARE** eller **JURIST**.

---

## 1. Artikelreklamen (`src/components/artiklar/reklam/reklam-copy.ts`)

Våg 5 har gjort rätt sak: klustret styr vinkeln i rubriken, alla kort säljer samma produkt, fulla namnet står i etiketten och knappen läser `kopKnapp()`. Rubrikerna håller. Det som behöver rättas är två listrader och en sekundärlänk.

| Plats | Nuvarande (main) | Våg 5 | Beslut |
|---|---|---|---|
| `SIDO.cv.rubrik` | Sju dagar till ett CV som går igenom | Ett CV som går igenom första urvalet | **Behåll.** "Första urvalet" är rekryterarens ord och säger vad som händer med CV:t. Bättre än main. |
| `SIDO.test.rubrik` | Träna med klockan på innan kallelsen kommer | oförändrad | Behåll. |
| `SIDO.allt.rubrik` | Förberedd in i intervjun och löneförhandlingen | oförändrad | Behåll. |
| `SIDO.*.under` | i veckan, ingen bindningstid | i månaden, ingen bindningstid | Behåll. |
| `SLUT.test.rubrik` | Sju dagar. Alla nivåer. Klockan på. | Alla nivåer. Klockan på. | **Behåll.** Tretakten är borta med veckan, men två slag räcker i bläck under etiketten Jobbcoach Premium. Läsaren kommer från en testartikel och vet vad klockan betyder. |
| `SLUT.test.rader[3]` | Din utveckling, test för test | Och CV:t, personliga brev, jobbmatchning och Jobbcoachen | **Ny:** `Dessutom CV-analysen, alla mallar, personliga brev, jobbmatchning och Jobbcoachen`. En listrad som börjar med "Och" läser som fortsättning på raden ovanför, och "CV:t" är kundens eget, inte något som ingår. |
| `SLUT.cv.rubrik` | Sju dagar. Ett CV som går igenom. Personliga brev som svarar på annonsen. | Ett CV som går igenom. Personliga brev som svarar på annonsen. | Behåll. |
| `SLUT.cv.rader[3]` | LinkedIn-profilen omskriven | Och rekryteringstesterna, jobbmatchning och Jobbcoachen | **Ny, två rader:** rad 4 `LinkedIn-profilen omskriven` tillbaka (den såldes bort i bytet utan skäl, och facit avsnitt 3 räknar LinkedIn till CV-raden), rad 5 `Dessutom alla rekryteringstester, jobbmatchning och Jobbcoachen`. Fem rader, som `SLUT.allt`. |
| `SLUT.allt.rubrik` och rader | Allt ingår. Från första annonsen till löneförhandlingen. / … / Allt i CV-paketet och Träningspaketet | samma rubrik, sista raden ersatt av `CV_RAD` och `TEST_RAD` | Behåll. Exakt facit avsnitt 3. |
| `SLUT.*.knapp` | Börja med CV-paketet, 79 kr i veckan | `kopKnapp()` = Köp Premium, 149 kr i månaden | Behåll. |
| `SLUT.*.sekundar` | Eller Hela paketet, 99 kr i veckan, med testerna / Se alla tre paketen | Se vad som ingår | Behåll. |
| `INLINE.*.paketrad` | … ingår i CV-paketet, 79 kr i veckan. | … ingår i Premium, 149 kr i månaden. | Behåll. Rätt preposition enligt facit avsnitt 2. |
| `GRATIS_KORT.sekundar` | Se paketen | Se vad som ingår | **Ny:** `Se vad som ingår i Premium`. På ett kort vars etikett är "Utan att betala" och vars rader är gratisnivån läses "Se vad som ingår" som gratisnivåns innehåll. Länken går till /priser, så den ska säga vad den visar. |
| `LISTA_SLUT.etikett` | Paketen | Jobbcoach Premium | Behåll. |
| `LISTA_SLUT.text` | Tre paket, alla per vecka, ingen bindningstid. … | Allt i en prenumeration, 149 kr i månaden. Ingen bindningstid, säg upp med ett klick. | Behåll. |
| `LISTA_SLUT.knapp` | Se paketen | Se vad som ingår | Behåll. Här står etiketten Jobbcoach Premium ovanför, så det är entydigt. |

Kontroll: inga tankstreck, inga ogaranterade tal, fulla namnet en gång per kort (etiketten), knappen under 30 tecken. Allt uppfyllt.

---

## 2. Yrkesmallarna (`src/app/(public)/cv-mallar/yrkesmall-content.ts`, 69 rubriker)

Rubrikerna står som h3 i kort under "Varför vår mall passar", bredvid rubriker som "Kassasystem och resultat överst" och "Eget block för kompetens och certifikat". Alla andra kort har en rubrik som är en sak eller en mening; "I Premium: Disk Plus med foto" är det enda kortet med etikett och kolon. Besökaren har inte köpt något, så facits grundform för det hon inte fått gäller: `{Det låsta} ingår i Premium`.

**Mönstret:** `I Premium: {Mall} med {X}` → `{Mall} med {X} ingår i Premium`

| Nuvarande (våg 5) | Ny | Antal |
|---|---|---|
| I Premium: Disk Plus med foto | Disk Plus med foto ingår i Premium | 8 |
| I Premium: Pedagog med foto | Pedagog med foto ingår i Premium | 7 |
| I Premium: Servering med foto | Servering med foto ingår i Premium | 6 |
| I Premium: Logistik Plus med foto | Logistik Plus med foto ingår i Premium | 6 |
| I Premium: Aspekt med fokusområden | Aspekt med fokusområden ingår i Premium | 4 |
| I Premium: Konto Plus med snabbfakta | Konto Plus med snabbfakta ingår i Premium | 3 |
| I Premium: Myndighet Plus med guld-accent | Myndighet Plus med guldaccent ingår i Premium | 3 |
| I Premium: Verkstad Plus med blueprint-grid | Verkstad Plus med ritningsraster ingår i Premium | 2 |
| I Premium: Magasin med editorial-känsla | Magasin med tidningskänsla ingår i Premium | 1 |
| I Premium: Klinik med sidopanel för meriter | Klinik med sidopanel för meriter ingår i Premium | 1 |
| I Premium: Atlas eller Tidlös Plus | Atlas eller Tidlös Plus ingår i Premium | 1 |
| I Premium: Vården & Omsorg med foto | Vården & Omsorg med foto ingår i Premium | 2 (mallen heter så, `templates/varden-omsorg`) |
| övriga `I Premium: {Mall} med foto` | `{Mall} med foto ingår i Premium` | resten |

**De sex som avviker:**

| Nuvarande (våg 5) | Ny |
|---|---|
| Mallen i Premium lägger till foto (5 st, rad 480, 824, 2220, 2565, 2911) | `{Mall} med foto ingår i Premium`, där mallnamnet tas ur samma yrkes `atsInfo`-stycke ("premium-varianten Vården", "premium-varianten Pedagog"). Finns inget namn: `Varianten med foto ingår i Premium`. |
| Mallen i Premium lägger CME-block (rad 128) | `Klinik med CME-block ingår i Premium` ("lägger CME-block" saknar "till"; mallen heter Klinik enligt rad 383). |

**Beskrivningarna, samma fil.** Facit avsnitt 2 tillåter gement `premium` i branschtexterna bara som vanligt adjektiv ("premium-segment", rad 1500 är rätt). "premium-varianten" (rad 383, 481, 727, 825, 1072, 1421, 1766, 2120, 2221, 2468, 2566, 2813, 2911, 3158, 3503, 3849, 4194, 4292, 4539, 4637 med flera) handlar om vår mall och är produktnamnet med litet p. Testet släpper igenom filen, men regeln gäller.

| Nuvarande | Ny |
|---|---|
| Både vår mall Norrsken och premium-varianten Vården är ATS-säkra. | Både vår mall Norrsken och Vården, som ingår i Premium, läser rekryteringssystemen rätt. |
| lägger premium-varianten till foto och LinkedIn | lägger mallen i Premium till foto och LinkedIn |
| lägger premium-varianten Vården till foto | lägger Vården, som ingår i Premium, till foto |
| customer-voice-blockquote (rad 1519) | citat från kunder |
| magazine-känsla (rad 1519) | tidningskänsla |

"ATS-säkra" och "ATS-läsbarhet" är branschjargong som facit inte täcker; byt där du ändå rör meningen, låt resten stå till CV-klustrets nästa revision.

Kontroll: ny rubrik på två rader vid 360 px (h3 text-base, `pr-10`) är avsett; den längsta, "Verkstad Plus med ritningsraster ingår i Premium", är 48 tecken.

---

## 3. CrossLinkCTA (`src/components/CrossLinkCTA.tsx` rad 56)

| Nuvarande (main) | Våg 5 | Ny |
|---|---|---|
| Hela paketet | CV och brev som hör ihop | **CV och personligt brev som hör ihop** |

Skälet: skrivregeln från 2026-09-24 säger "personliga brev", aldrig bara "brev". Rubriken är det första ordet på kortet och sätter termen för resten. Längden går på en rad vid text-sm.

Sidofynd i samma kort, inte våg 5 men billiga att ta i samma svep: brödtexten "Komplettera brevet med ett ATS-optimerat CV" → `Komplettera det personliga brevet med ett CV som rekryteringssystemen läser rätt`, knappen "Se personligt brev-exempel" → `Se exempel på personligt brev` (sammansättningen går inte), och "Komplettera" står tre gånger på kortet (eyebrow och båda brödtexterna); låt eyebrown behålla ordet och skriv brödtexterna utan.

---

## 4. Användarvillkoren, avsnitt 7 (`src/app/(public)/anvandarvillkor/page.tsx` rad 115 till 141)

Avsnittet är mycket bättre än mains mallvillkor med hakparenteser. Språket är klart, du-formen hålls, inga tankstreck. Nedan är rättningarna av språk och tydlighet, och efter dem det juristen eller ägaren måste titta på. Jag har inte ändrat något löfte.

### 4.1 Språk och tydlighet

| Rad | Nuvarande (våg 5) | Ny |
|---|---|---|
| Inledning | Det vi säljer är Jobbcoach Premium, en löpande prenumeration som kostar 149 kr i månaden. Priset står också i kassan innan du betalar, och det är det priset du godkänner när du köper. | Det vi säljer är Jobbcoach Premium, en löpande prenumeration som kostar 149 kr i månaden. Priset står i kassan innan du betalar, och det är det pris du godkänner när du köper. ("också" pekar på ingenting, "det priset" är talspråk i ett avtal.) |
| Period och förnyelse | Jobbcoach Premium betalas i förskott för en månad i taget. Prenumerationen förnyas automatiskt på samma datum varje månad tills du säger upp den. | Behåll. Tydligt och sant mot PLANS.body. |
| Uppsägning | Du kan säga upp prenumerationen när som helst i ditt konto under Prenumeration, eller genom att kontakta oss. Uppsägningen gäller från slutet av den period du redan har betalat, och fram till dess har du tillgång till allt som ingår. | Du kan säga upp prenumerationen när som helst i ditt konto under Prenumeration, eller genom att kontakta oss. Uppsägningen börjar gälla när den period du redan har betalat tar slut. Fram till dess har du tillgång till allt som ingår, och inget mer dras. ("gäller från slutet av" är tvetydigt: från slutet och framåt, eller från slutet räknat? Två meningar i stället för en lång.) |
| Ångerrätt och återbetalning | När du köper väljer du att starta direkt, och då gäller inte ångerrätten på fjorton dagar eftersom innehållet börjar levereras med en gång. Betalda perioder återbetalas inte, utom där lagen kräver det. Säger du upp dras inget mer. | I kassan samtycker du till att Premium startar direkt och bekräftar att ångerrätten på fjorton dagar därmed inte gäller, eftersom innehållet börjar levereras med en gång. Betalda perioder återbetalas inte, utom där lagen kräver det. (Kassan har en ruta kunden själv kryssar i, `ValjSparClient.tsx` rad 184 och `program.ts` rad 146. Villkoret ska beskriva det kunden faktiskt gör: samtycker och bekräftar, inte "väljer" som om det vore automatiskt. Sista meningen flyttad till Uppsägning, där den hör hemma.) |
| Tidigare köp | Har du köpt något av de paket vi sålde tidigare, till exempel en veckoprenumeration eller ett engångsköp på ett dygn, löper det ut som vanligt enligt villkoren som gällde när du köpte det. | Se 4.2 punkt 2. Språkligt: namnge produkterna, kunden känner dem vid namn. Förslag när ägaren svarat: `Har du köpt CV-paketet, Träningspaketet eller Dagspasset gäller villkoren och priset från när du köpte det. En veckoprenumeration fortsätter att förnyas tills du säger upp den; Dagspasset tar slut efter 24 timmar och förnyas inte.` |
| Prisändringar | Vi förbehåller oss rätten att ändra priset för Jobbcoach Premium. En prisändring gäller från nästa period efter att vi har meddelat dig via e-post och i webbappen. | Vi kan ändra priset på Jobbcoach Premium. En prisändring gäller tidigast från nästa period efter att vi har meddelat dig via e-post och i webbappen, och du kan alltid säga upp innan den börjar gälla. (Facit avsnitt 2: "priset på Premium", aldrig "för". "Förbehåller oss rätten" är den enda juridiska klyschan i ett annars klart avsnitt. Sista satsen är ett förtydligande av något som redan gäller, inte ett nytt löfte. Tidsfristen är juristens, se 4.2 punkt 3.) |

### 4.2 Kräver ägarens eller juristens blick

1. **JURIST. Ångerrätten för en prenumerationstjänst.** Texten och kassans ruta bygger på undantaget för digitalt innehåll som inte levereras på ett fysiskt medium (distansavtalslagen 2 kap. 11 § 11). Jobbcoach Premium är en löpande digital tjänst, och för tjänster gäller en annan regel: kunden som bett att tjänsten ska börja under ångerfristen kan fortfarande ångra sig, men betalar för den del som använts (2 kap. 15 §), och förlorar ångerrätten först när tjänsten är fullgjord. Om Premium är "innehåll" eller "tjänst" avgör om meningen "gäller inte ångerrätten" håller. Jag har inte ändrat löftet, bara gjort det tydligare. Facit kallar rutan "lagkrav, oförändrad"; juristen bör bekräfta att det är rätt lagkrav.
2. **ÄGARE. "Tidigare köp … löper det ut som vanligt."** CV-paketet, Träningspaketet och Hela paketet vecka/kvartal är prenumerationer som förnyas tills de sägs upp (facit krock 8: veckokunder får fortsatt kvitton). Bara Dagspasset löper ut. Om de gamla prenumerationerna inte är satta att upphöra vid periodens slut i Stripe är meningen osann för varje veckokund. Ägaren bestämmer: ska de fortsätta förnyas till gammalt pris, eller stängas? Texten i 4.1 är skriven för det första.
3. **JURIST. Prisändringens tidsfrist.** "Från nästa period efter att vi har meddelat dig" kan bli en dag. Konsumentpraxis är en rimlig frist, ofta 30 dagar, och avsnitt 13 har redan platshållaren "[Ange tidsram, t.ex. minst 30 dagar]". Samma frist bör stå här.
4. **ÄGARE. Villkoren säger OpenAI, produkten kör Gemini** (avsnitt 4 och 9, integritetspolicyn också). Sidan får nu stämpeln "Senast uppdaterad 2026-10-11", vilket intygar att resten är aktuellt. Det är det inte.
5. **ÄGARE. Platshållare kvar på en daterad sida:** "[Specificera eventuell tidsram]" (avsnitt 3), "[Eventuellt: Vårt totala ansvar …]" (avsnitt 9), "[Beskriv hur man avslutar kontot …]" (avsnitt 11), "[Ange tingsrätt …]" (avsnitt 12), "[Ange tidsram …]" (avsnitt 13), och `mailto:[support@jobbcoach.ai]` med hakparenteser i själva länken (avsnitt 3 och 14), så mejllänken är trasig. Ingen av dem är våg 5, men ingen bör ligga under ett nytt datum.

---

## 5. Kontaktformuläret och kontaktinfon

### 5.1 Platshållaren i ämnesfältet

`KontaktForm.tsx` rad 154, `KontaktFormPublik.tsx` rad 168, testet `KontaktForm.test.tsx` rad 94.

| Nuvarande (main) | Våg 5 (facit rad 97) | Ny |
|---|---|---|
| En fråga om ditt paket | En fråga om din prenumeration | **Fråga om min prenumeration** |

Platshållaren står i fältet där kunden skriver sitt eget ämne. Den ska låta som något hon själv skulle skriva, inte som att vi frågar henne. Det ersätter facits rad 97, som var ett mekaniskt ordbyte. Testet byter sträng.

### 5.2 "Har du Premium får du svar först"

**Får vi lova det?** I inloggat läge: ja, med en justering. `api/contact/route.ts` läser `userHasAccess` och `kontakt.ts` rad 72 märker ämnet `[PREMIUM]` och lägger raden "Premium: ja" i mejlet. Det är en kö-ordning som supporten ser och kan följa. Det vi gör är att ta ärendet först; svaret är en människas handling. Löftet ska därför handla om vår hantering, inte om utfallet.

På den publika sidan: nej. `KontaktFormPublik.tsx` rad 73 till 85 skickar ingenting (fetchen är utkommenterad, ett `setTimeout` låtsas lyckas och visar Tack), och `/api/contact` kräver inloggning, så routen kan inte veta om besökaren har Premium. Där är löftet tomt, och det står dessutom två gånger på samma sida (`KontaktInfoPublik.tsx` rad 51 och 136).

| Plats | Nuvarande (våg 5) | Ny |
|---|---|---|
| `KontaktInfo.tsx` rad 50 (inloggat) | Inloggning, betalning eller din prenumeration. Har du Premium får du svar först. | Inloggning, betalning eller din prenumeration. Har du Premium tar vi ditt ärende först. |
| `KontaktInfoPublik.tsx` rad 51 | Inloggning, betalning eller din prenumeration. Har du Premium får du svar först. | Inloggning, betalning eller din prenumeration. Skriv från ditt konto, så ser vi direkt vad du har. |
| `KontaktInfoPublik.tsx` rad 136 | Har du Premium får du svar först | Stryks. Raden ovan säger det som är sant. |

**ÄGARE, bugg utanför våg 5:** det publika formuläret på /kontakt skickar inget mejl och visar ändå Tack. Den som skriver där utan konto får aldrig svar. Antingen kopplas formuläret till en route som tar emot utan inloggning, eller så ersätts det med mejladressen och en uppmaning att logga in.

---

## 6. Köpvägsagentens strängar utanför facit

### 6.1 Prissidan (`src/components/pricing/paket-copy.ts`, `priser-data.ts`)

| Plats | Nuvarande (våg 5) | Beslut |
|---|---|---|
| `GUIDE.h2` rad 300 | Hjälpredan tar dig igenom allt, i rätt ordning | **Ny:** `Hjälpredan Kom igång tar dig igenom allt i rätt ordning`. Besökaren på prissidan vet inte vad "Hjälpredan" är förrän i ingressen; funktionen heter Kom igång och ska stå i rubriken. Kommat före "i rätt ordning" hängde löst. |
| `GUIDE.ingress`, sista meningen | Dagen innan månaden förnyas visar vi vad du gjort, och först då frågar vi om du vill fortsätta. | **Ny:** `Dagen innan månaden förnyas mejlar vi vad du gjort, så att du kan säga upp med ett klick om du är klar.` Prenumerationen förnyas av sig själv; "frågar vi om du vill fortsätta" låter som att kunden måste säga ja, och det är inte sant. Förnyelsemejlet finns (facit rad 74). |
| `PAKET_KORT.allt.listEtikett` rad 104, kortets h2 | Allt i Premium | **Behåll.** H1 på sidan bär fulla namnet, kortet säger kortformen, listan under förklarar. Exakt facit avsnitt 1. |
| `LANGDER` rad 532 till 535 | Allt i Premium, en månad i taget | Behåll. |
| FAQ `vad-ingar.q` rad 187 | Vad ingår i Premium? | **Ny:** `Vad ingår i Jobbcoach Premium?` FAQ-datan blir FAQPage-schema och visas fristående i Google, där "Premium" utan varumärke är vem som helst. Svaret nämner inte namnet alls ("Allt vi gör …"), och det är rätt. |
| FAQ `vad-ingar.a` | Allt vi gör: alla CV-mallar, CV-analysen, personliga brev och LinkedIn, alla rekryteringstester med provläget och personlighetstestet, jobbmatchning varje natt, Jobbcoachen och Bli upptäckt. 149 kr i månaden, och inget av det kostar extra. | Behåll. |
| FAQ `nar-manaden-ar-slut.a`, sista meningen | Ingen påminnelse i smyg. | **Ny:** `Ingen förnyelse i smyg.` Det är förnyelsen som annars sker i smyg, inte påminnelsen. |
| FAQ `borja-gratis.q` | Kan jag börja gratis? | Behåll. |
| FAQ `borja-gratis.a` | Ja. Gratisnivån kräver inget kort och ligger kvar så länge du vill. Där ser du hur CV-analysen, de personliga breven och testerna fungerar, och köper Premium först när du vill ha resten. | Behåll. Kortform i svar enligt facit avsnitt 1. |
| `KONTO.bytPrisrad` rad 489 och `program.ts` rad 174 | 149 kr i månaden. Dagarna du redan betalat för räknas av, och månaden räknas från i dag. | **Ny:** `149 kr i månaden. Det du redan har betalat för resten av veckan drar vi av, och månaden räknas från i dag.` "betalat för räknas av" staplar två verb på "för". Vi-form, verbet aktivt. **Kontroll för Opus:** stämmer bara om Stripe-anropet för bytet gör proration och flyttar fakturadatumet till i dag (`proration_behavior` och `billing_cycle_anchor` i `create-plan-session` eller bytesrouten). Gör det inte det ska raden säga vad som faktiskt händer, inte det här. |

### 6.2 FAQ på verktygssidorna (hör till `allt-texter.test.ts`, avsnitt 8)

| Plats | Nuvarande (våg 5) | Ny |
|---|---|---|
| `bli-upptackt-faq-data.ts` rad 26 | Synligheten ingår i Premium, 149 kr i månaden, och du säger upp när du vill. Utan Premium kan du … Med Premium får du dessutom … | `Synligheten ingår i Jobbcoach Premium, 149 kr i månaden, och du säger upp när du vill. Utan Premium kan du skapa din profil och göra testerna, men profilen visas inte i rekryterarnas sökningar. Med Premium får du dessutom jobbmatchning varje natt, Jobbcoachen så mycket du vill, alla CV-mallar, CV-analysen, personliga brev och alla rekryteringstester.` Fulla namnet en gång, först, för att svaret står ensamt i Google. Sedan kortformen. |
| `linkedin-optimering-faq-data.ts` rad 47 | LinkedIn-optimeringen ingår i Jobbcoach Premium, 149 kr i månaden, tillsammans med … | Behåll. Fulla namnet är rätt bredvid LinkedIn (facit krock 2). |

---

## 7. Betalväggsagentens strängar utanför facit

| Plats | Nuvarande (main) | Våg 5 | Beslut |
|---|---|---|---|
| `MallarLivePreview.tsx` rad 467, knappen på låst mall | Ladda ned med CV-paketet, 79 kr i veckan | Ladda ned med Premium | **Ny:** `Ladda ner med Premium`. Produkten säger "Ladda ner" överallt annars (facit 9.1, "Nedladdning", knappen Ladda ner). Prepositionen är rätt enligt facit avsnitt 2. Knappen öppnar betalväggen, inte nedladdningen, men villkoret står i texten och väggen förklarar i nästa steg; "Köp Premium …" redan här vore två köpknappar i rad. 21 tecken. |
| `SMART_VAL.rubrik` (`profil-copy.ts` rad 121) | Smart val ingår när du har ett paket | Smart val ingår i Premium | Behåll. Facits mönster. |
| `SMART_VAL.eyebrow` rad 122 | Ingår i alla tre paketen | Premium | **Ny:** `Personliga brev`. I modalen står Premium redan i rubriken, prisraden och knappen; en fjärde gång som eyebrow säger ingenting. Eyebrown ska säga var funktionen hör hemma. |
| `menyFot()` (`paket-rader.ts` rad 211), fotrad för kund med CV-paketet eller Träningspaketet | Vill du ha Testerna också? Hela paketet kostar 20 kr till i veckan och öppnar allt grått. | CV-delen och allt grått ingår i Premium, 149 kr i månaden. / Testerna och allt grått ingår i Premium, 149 kr i månaden. | **Ny:** `del` = `CV, personliga brev` för testkunden, `Testerna` för CV-kunden: `CV, personliga brev och allt grått ingår i Premium, 149 kr i månaden.` respektive `Testerna och allt grått ingår i Premium, 149 kr i månaden.` "CV-delen" är internt språk. "allt grått" står direkt under de gråade raderna och är begripligt där. |
| `KONTO_SEKTION.gratis` (`profil-copy.ts` rad 105), undertext på raden Prenumeration för gratiskonto | Gratisnivån · tre paket, från 49 kr | Gratisnivån · Premium, 149 kr i månaden | **Ny:** `Gratisnivån · Premium kostar 149 kr i månaden`. Punkten är radens mönster (betalande får "Jobbcoach Premium · Nästa dragning …"), men andra halvan är ett erbjudande, inte ett läge, och ska vara en sats. |
| Felmeddelanden `api/applications/**` och `use-applications.ts` | Ansökan hittades inte / Kunde inte uppdatera ansökan / Serverfel vid hämtning av ansökningar / Kunde inte logga ansökan | Den sökta tjänsten hittades inte / Kunde inte uppdatera den sökta tjänsten / Serverfel när dina sökta tjänster skulle hämtas / Kunde inte spara den sökta tjänsten | **Behåll alla.** Trackern heter Sökta tjänster och raden är en sökt tjänst; "ansökan" var fel sak. "när … skulle hämtas" är bättre svenska än "vid hämtning av". |

Sidofynd: `applications/route.ts` rad 126 skickar `insertError?.message` rått till kunden, alltså Postgres-text på engelska när något går fel i databasen. Inte våg 5, men det bör bli standardtexten.

---

## 8. Testerna som ska vändas till besluten ovan

Opus vänder, tar inte bort.

**`src/lib/plans/__tests__/regel-r1.test.ts`**
- Kvittots ämnesrad: `'Kvitto: Hela paketet, en månad, 149 kr'` → `'Kvitto: Jobbcoach Premium, 149 kr'` (facit rad 66, `vecka.ts` rad 129 ger redan det, `kvitto.test.ts` väntar redan det). Längden står på raden Prenumeration, inte i ämnet.
- "etiketterna har beloppet och perioden på raden under": `SIDO.*.under` matchar `/i månaden/`; `LISTA_SLUT.paket` finns inte längre, testa i stället att `LISTA_SLUT.rader.length > 0` och att `LISTA_SLUT.text` innehåller `prisPeriod(SALD_PLAN)`.
- "ordningen är CV-paketet, Träningspaketet, Hela paketet" ersätts av: alla `SLUT.*.etikett === 'Jobbcoach Premium'`, alla `SLUT.*.knapp === kopKnapp()`, `SLUT.allt.rader` slutar med `CV_RAD` följt av `TEST_RAD`, och `SLUT.test.rader` samt `SLUT.cv.rader` har en rad som börjar med `Dessutom` (avsnitt 1).
- R1 i reklamkorten: lägg `'Premium'` till namnen som kräver pris eller period i knapp och paketrad, så att `brytR1` också fångar kortformen.
- R1 i paketcopyn: `PAKET_IDS` är bara `allt`; alla knappar är `'Köp Premium, 149 kr i månaden'`.

**`src/components/verktyg/__tests__/allt-texter.test.ts`**
- Bli upptäckt: kostnadsfrågan innehåller `paketMedPris(SALD_PLAN)` ("Jobbcoach Premium, 149 kr i månaden") exakt en gång, innehåller inte `all_week.amount`, inte "Hela paketet", inte "paketen". Behåll "ingenting säger att det är gratis att synas".
- LinkedIn: kostnadsfrågan innehåller `paketMedPris(SALD_PLAN)`, inte `cv_week.name`, inte `cv_week.amount`, inte `all_week.amount`. Behåll "ingen gratis optimering" och "inga talstreck".
- Describe-rubrikerna byter från "ingår i Hela paketet" till "ingår i Jobbcoach Premium".

**`src/components/artiklar/reklam/__tests__/reklam-copy.test.ts`**: `GRATIS_KORT.sekundar.text === 'Se vad som ingår i Premium'`; raderna med `Dessutom`; `SLUT.cv.rader` innehåller `'LinkedIn-profilen omskriven'`.

**`src/components/kontakt/__tests__/KontaktForm.test.tsx`** rad 94: `'Fråga om min prenumeration'`.

**`src/lib/plans/__tests__/paketnamn.test.ts`**: ingen ändring behövs för besluten ovan; "Fråga om min prenumeration", "Personliga brev" och "Premium kostar 149 kr i månaden" passerar alla förbud.

---

## 9. Grep efter bytet

Noll träffar i användarsträngar: `I Premium:`, `Mallen i Premium lägger`, `premium-varianten`, `CV och brev som hör ihop`, `får du svar först`, `En fråga om din prenumeration`, `Ladda ned`, `CV-delen`, `påminnelse i smyg`, `betalat för räknas av`, `priset för Jobbcoach Premium`.

Ska finnas: `ingår i Premium` som rubrikslut i yrkesmall-content (69 st), `CV och personligt brev som hör ihop`, `tar vi ditt ärende först` (bara i `KontaktInfo.tsx`), `Vad ingår i Jobbcoach Premium?`, `Kvitto: Jobbcoach Premium, 149 kr`.
