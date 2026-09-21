# Användning, trial och tester, 22 september 2026

Kort sammanfattning. Full rapport med tabeller och diagram: `analys-anvandning-trial-tester-2026-09-22.pdf`, källa `analys-anvandning-trial-tester-2026-09-22.html`.

Mätfönster: senaste **30 dagar (58 konton)** och **90 dagar (96 konton)**. Trialjämförelse 11 augusti till 21 september. Exkluderat i varje fråga: adminkonton, ägaren, QA-konton.

## Läs det här först

Med 58 konton på trettio dagar och 21 trialkonton flyttar en enda person varje andel med tre till fem procentenheter. Procenttalen är riktning, inte signifikans.

Det som är säkert oavsett urvalsstorlek: noll rader i `premium_grants`, noll överlappning mellan test och mall över 327 konton, noll aktivitet dag 2 till 5 i trialen, och samtliga konstateranden om koden.

## Fem slutsatser

1. **Vi driver två produkter för två folkgrupper som aldrig möts.** Av 96 konton på nittio dagar har noll både gjort ett test och laddat ned en CV-mall. Över hela historiken, 327 konton, är det 3 av 76 testanvändare som rört en mall. Mall och brev överlappar i 21 konton, brev och analys i 23.
2. **Trialen konsumeras på dag noll.** Av 61 händelser från 21 trialkonton ligger 60 på registreringsdagen. Dag 1 har en händelse, dag 2 till 5 har noll. Ett konto av 21 var aktivt efter dag 1, noll efter utgången.
3. **Folk kommer tillbaka, men skapar ingenting.** 18 av 58 konton har `last_active` efter dag 1 och bläddrade 150 sidor, men bara 6 producerade något och bara 4 efter dag 1. Återbesöket finns, handlingen saknas.
4. **Testerna är vårt starkaste dragplåster och vår svagaste affär.** 231 testsessioner från 75 konton, 82 procent matrislogik. 13 av 14 testvarianter är gratis, enda spärren är en dagskvot på en session per testtyp och dygn.
5. **De anonyma proven leder inte till konton.** 32 prov från 22 IP-adresser sedan 14 september, 29 slutförda. Högst 2 registreringar i tidsmässig närhet, noll inom en kvart.

## Svaret på din hypotes

Din formulering: *"vi ger bort allt med en trial, sedan har alla fått det de behövde"*.

**Halva hypotesen stämmer, men inte den halva du tror.** Ingen hinner konsumera allt: 4 av 21 trialkonton laddade ned en mall, 6 körde ett test och 5 gjorde ingenting alls under sina fem gratisdagar. Problemet är inte att trialen mättar dem, utan att den tar bort betalväggen under exakt de timmar de faktiskt är här, och när de kommer tillbaka finns de inte kvar för att se priset.

**Vad som konsumeras klart:** mallar och analys, båda med tydliga mättnadsmönster (fem mallar på ett dygn, sex analyser på ett dygn). **Vad som inte konsumeras alls:** brev (ett per konto), personlighetstest, LinkedIn och ansökningar, alla rörda av noll trialkonton.

## Nyckeltal

| Mätpunkt | Värde |
|---|---|
| Konton, 90 dagar | 96 |
| Konton, 30 dagar | 58 |
| Gjorde aldrig något | 11 av 58 (30 d), 6 av 38 (31-90 d) |
| Test plus mall, samma konto | 0 av 96 |
| Trialkonton | 21, varav 8 utgångna |
| Betalningar | 0 (`premium_grants` är tom) |
| Betalväggar visade | 3, av 1 person, den 21 september |
| Avbrottsorsaker | 2 rader, samma person, båda `for_dyrt`, före trialen |

## Testerna mot marknaden

Fjorton varianter live. Matrisbanken 84 frågor i tre nivåer, verbalt 60 passager, numeriskt 36. Kvalitetskontrollen på matriserna är gedigen: fyra valideringsskript mot parallellitet, identiska rader och kolumner, endimensionell variation och felmarkerat facit.

| Testtyp | Format-paritet | Saknas |
|---|---|---|
| Matrislogik | Delvis | Adaptiv svårighet, tidspress, extern normgrupp |
| Numeriskt | Delvis | Tidspress per fråga, kärnan i SHL-formatet |
| Verbalt | Ja | Tidsgräns finns bara i provläget |
| Personlighet | Delvis | Normgrupp och yrkesprofil |

**Fyra luckor:** tidspress (hård gräns med auto-inlämning finns i exakt en komponent), percentil mot normgrupp (räknas mot vår egen användarbas, en självrefererande siffra), adaptiv svårighet (finns inte alls), förklaring per fråga (detta har vi, och det är vår starkaste sida).

**För att få säga "träna på samma format"** krävs två små saker: hård tidsgräns med automatisk inlämning i alla provlägen, och en ärlig etikett på percentilen. Då kan vi säga *"öva på samma uppgiftstyper under samma tidspress"* och det är verifierbart i koden.

## Rekommendation

**Väg A nu, väg C när A har mätts i fyra veckor.**

- **A. Behåll trialen, undanta tester över nivå 1 och premiummallar.** Insats M. Störst effekt: flyttar betalväggen till den timme då 60 av 61 händelser sker. Låg risk mot SEO-trafiken, grundnivån och smakproven är kvar.
- **B. Ingen trial, priset från dag ett, dagspass 49 kr.** Insats S. Dagspasset passar testfolkets beteende exakt, men inför det inte samtidigt som trialen tas bort, då blir utfallet omöjligt att tolka. Vänta, gör det som riktat erbjudande i testflödet efter A.
- **C. Separata paket för tester och mallar.** Insats L. Rätt på sikt, följer den tydligaste strukturen i datan, men bygg den när vi vet att någon över huvud taget betalar.

Priset ändras aldrig utan ägarens beslut.

## Bortfall och mätfel

Exkluderingen är i praktiken **ett konto**: ägaren, som också är enda raden i `admin_users`. Noll QA-konton finns. Men kontot står för en stor del av aktiviteten: 47,7 procent av `user_activities`, 92,9 procent av `job_applications`, 82,4 procent av `linkedin_optimizations`, 41,4 procent av testsessionerna. `job_applications` och `linkedin_optimizations` är i praktiken tomma utan ägaren.

Åtgärda: `anon_test_sessions` saknar koppling till konto (S); procenttalen på fyra testresultatsidor räknas mot fel totalsumma (S); avbrottsflödet kan skicka dubbla `cancel_intents` (S).
