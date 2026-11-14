# Testgranskning: cubiks-logiks-test.mdx

Granskad 2026-11-14 i rollen testansvarig. Fil: content/artiklar/cubiks-logiks-test.mdx. Inga innehållsfiler ändrade. Källorna i källraden hämtades och lästes 2026-11-14.

## Utlåtande: GODKÄND

### De tre lösta exemplen och facit

**Verbalt (rad 75 till 77).** "Alla som arbetar i lagret har truckkort. Kim har truckkort." Påstående: "Kim arbetar i lagret." Facit "går inte att avgöra" är rätt. Premissen ger lager → truckkort, inte truckkort → lager. Förklaringen pekar ut den omvända slutsatsen, vilket är rätt feltyp.

**Numeriskt (rad 85 till 87).** 240 → 300 jackor. Ökning 60. 60/240 = 0,25 = 25 procent. Rätt. Distraktorn 60/300 = 20 procent är korrekt uträknad och är den vanliga fällan (fel bas).

**Abstrakt (rad 95 till 97).** Prick i övre vänstra, övre högra, nedre högra. Nästa: nedre vänstra. Rotationen övre vänster → övre höger → nedre höger → nedre vänster är medurs. Facit och regel (förflyttning) stämmer.

### Antyds Talogys format?

Nej. Rad 28 ("med våra egna exempel"), rad 32 (rutan: uppgifterna är våra egna, inget Cubiks-prov) och rad 73 ("Exemplet här är vårt eget och visar tankesättet, inte Talogys format") är tydliga. Rad 85 och 95 saknar egen markering, men rutan på rad 32 täcker hela artikeln. Inga logotyper, inget som antyder samarbete.

### "Samma test"

Skrivs aldrig. Artikeln använder "samma typer av uppgifter" (rad 19, 30, 157) och "samma typ av uppgifter som i testet" (rad 113). Rätt enligt ramen "samma format som", aldrig "samma test".

### Löftena om gratis och Premium mot src/lib/traning/gratisniva.ts

- "fem numeriska uppgifter utan konto" (rad 19, 157): ArtikelProv typ="numerisk" är en giltig provtyp (PROV_TYPER i src/lib/tests/prov-typer.ts) och kortet säger "fortsätter provet med fyra till", alltså fem anonyma uppgifter. Stämmer.
- "Nivåkollen och ett första pass ingår gratis" (rad 125): matningGratis true, grundpassPerDag 1 med grundpassVarjeDag false (bara dag 0). "Ett första pass" är exakt rätt nivå av löfte. Stämmer.
- "dagliga pass ... ingår i Premium" (rad 125): grundpassVarjeDag false. Stämmer.
- "övningsprov ingår i Premium" (rad 125): provlageGratis false. Stämmer.
- "Avancerad nivå ... ingår i Premium" (rad 125): src/lib/tests/sessionGate.ts: "Grundnivån per testtyp är fri. Allt över den kräver tests_above_base." Stämmer.
- "Gör Nivåkollen i varje del" (rad 119): Nivåkollen finns per testtyp för figurserier, deduktivt, verbalt och numeriskt (src/lib/traning/motor.server.ts rad 105, rutter.ts rad 29). Stämmer.

### "Mitt test" saknar Cubiks-val mot src/lib/traning/mittTest.ts

MITT_TEST = iprov, matrigma, alva, shl, aon, lokforare, annat, personlighet. Inget cubiks eller talogy. Påståendet på rad 125 ("vi inte har något eget Cubiks-val") stämmer. Se dock förslaget om etiketterna nedan.

### Tiderna mot Talogys sidor i källraden

| Test | Artikeln | Talogy (hämtat 2026-11-14) | |
|---|---|---|---|
| Logiks Intermediate | 24 v/4 min, 16 n/4 min, 10 a/4 min, 50 på 12 min | 24, 16, 10 frågor, 4 min per del, 50 frågor, 12 min | Stämmer |
| Logiks General (Advanced) | 12 v/8 min, 8 n/8 min, 10 a/4 min, 30 på 20 min | 12/8 min, 8/8 min, 10/4 min, 30 frågor, 20 min | Stämmer |
| Logiks Verbal (Advanced) | 36 frågor, 25 min | 36, 25 min | Stämmer |
| Logiks Numerical (Advanced) | 20 frågor, 25 min | 20, 25 min | Stämmer |
| Logiks Abstract (Advanced) | 30 frågor, 15 min | 30, 15 min | Stämmer |

Sekunder per fråga (rad 13, 30, 67, 83, 99): 720/50 = 14,4 ("omkring 14"), 240/24 = 10, 240/16 = 15, 240/10 = 24, 480/12 = 40, 480/8 = 60. Alla rätt.

Talogys beskrivning på rad 38 ("hur du bearbetar och resonerar kring olika typer av information, såsom verbal, numerisk och mer abstrakt och icke-verbal information") är ordagrann mot sidan Våra bedömningar. PAPI, Talogy Factors och situationsbaserade bedömningstest nämns där. De sju råden på rad 105 till 111 motsvarar Talogys sju tips, parafraserade ("Se till att" för "Säkerställ att"). PR Newswire-källan är daterad 15 mars 2022 och säger att PSI Talent Management-bolagen, däribland Cubiks, samlas under namnet Talogy. Stämmer med rad 11 och 36.

## Förslag (separat, inget av dem hindrar publicering)

**Rad 26.** "ett av de snabbaste testen du kan möta i en svensk rekrytering"
Jämförande påstående utan belägg. Aons scales-deltest ligger på liknande eller kortare tid per uppgift. Föreslagen formulering: "Femtio frågor på tolv minuter är ett rent tempotest."

**Rad 108.** "Hasta inte, men arbeta snabbt."
Talogys tips fortsätter med ett konkret råd som är det mest värdefulla för ett tempotest: hoppa över osäkra frågor och återkom om tid finns. Föreslagen formulering: "Hasta inte, men arbeta snabbt. Hoppa över en fråga du är osäker på och gå tillbaka om det blir tid över."

**Rad 125.** "väljer du "Annat" som ditt test ... delarna numeriskt, verbalt och figurserier"
Kortet heter "Annat eller vet inte" och kryssrutorna visar DELTYP_NAMN: "Siffror och tabeller", "Ord och text", "Figurserier". Skriv de etiketter läsaren ser. Föreslagen formulering: "väljer du "Annat eller vet inte" som ditt test, eftersom vi inte har något eget Cubiks-val, och kryssar för Siffror och tabeller, Ord och text samt Figurserier."

**Rad 89.** "hinner du sällan använda miniräknaren på allt"
Rätt i sak, men läsaren kan tolka det som att Talogy avråder från miniräknare. Föreslagen tillägg efter meningen: "Ha den framme för de frågor där du behöver den, och räkna de enkla i huvudet."

**Rad 123.** "Där är tiden längre och texterna och tabellerna mer komplicerade."
Stämmer för General (Advanced) med 40 respektive 60 sekunder per fråga, men abstrakt i General har fortfarande 4 minuter på 10 frågor, lika snabbt som i Intermediate. Föreslagen formulering: "Där är tiden längre i det verbala och numeriska, och texterna och tabellerna mer komplicerade. Den abstrakta delen är lika snabb som i Intermediate, 24 sekunder per fråga."

## Produktnotering (ingen åtgärd i artikeln)

Cubiks och Talogy Logiks saknas som val i "Mitt test". Artikeln hanterar det ärligt via "Annat". Om sidan drar trafik är ett Talogy-val med rotationen verbal, numerisk, figurserie och ett övningsprov i Logiks Intermediate-format (50 frågor, 4 minuter per del) en naturlig kandidat till kön för våg 3.
