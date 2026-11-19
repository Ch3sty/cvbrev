# Granskning, testansvarig (2026-11-18)

Helheten håller: mätreglerna, kurvan från planens start, banden under tolv svar och "aldrig en summa" stämmer med vad testerna mäter. Åtta saker måste rättas innan skissen går till ägaren.

1. **skiss.html, Övningsprov Alva: "20 uppgifter på 15 min" (två ställen).** Fel format. Alva Logic är 20 uppgifter med två minuter var (`tempo.ts`, per uppgift, 120 s). Skriv "20 uppgifter, två minuter var". Tempokortets "över Alvas 120 s" är rätt.
2. **skiss.html, mönsterrutorna: "Spegling", "Överlagring", "Latinsk kvadrat", "Räkning över raden", "Vridning i steg".** Interna id-namn. Gränssnittsnamnen är fasta i `familjer.json`: "Figuren speglas", "Två rutor läggs ihop", "Varje form en gång per rad" och så vidare. Använd dem, alla elva.
3. **skiss.html, talserier: fem påhittade namn, "Räkna sidor" hör till spatial (kuber).** Talserier har åtta regelfamiljer (`talserierV1/types.ts`) utan gränssnittsnamn än. Visa åtta rutor; namnen sätts av mig och copy i implementeringen.
4. **skiss.html, I-provet: "Ordförråd på din nivå" med 8 svar.** Cirkulärt: bandet under, på, över saknar referens för en hel testtyp före nivån finns. Skriv "8 av 12 svar till din nivå". Bandet gäller familjer mot testtypens nivå.
5. **skiss.html och utkast.md §2, dagens förslag med plan: "Spegling, fem uppgifter".** Riktade pass är nio frågor och flyttar inte nivån; blir de dagens förslag får kurvan ingen punkt den dagen. Låt dagens förslag vara det vanliga passet med tema (svagaste mönstret, `valjTema`, räknas mot nivån) och riktade pass stå som "Öva mer på mönstret".
6. **skiss.html, väljaren: Aon scales "Figurserier, siffror, deduktivt".** Saknar text; `DELTESTER.aon` har fyra. Lägg till "text".
7. **utkast.md §6: "lägre än dagens 150" och "I morgon finns nya".** 150 var mitt golvförslag, inte dagens värde (dagens karens är 30 dagar). Och visningskarens ger inte nya frågor i morgon. Skriv "golvet sätts efter bankräkningen" och "Nya frågor när banken fyllts på".
8. **skiss.html, definitionen av snabb: "högst ett över provets 120 s".** Rätt för Alva, men i läge (a) och för Matrigma (68 s) gäller planens format eller vårt eget (83 s). Skriv "över provets tid" och låt talet följa formatet.

Resten godkänt.
