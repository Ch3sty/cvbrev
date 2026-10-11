# Copygranskning: Rummen våg 1b

Datum 2026-10-11. Granskare: svensk-ux-copywriter (Fable). Mottagare: art-director, testansvarig, 1b-byggagenten. Ingen kod är ändrad; allt nedan är ändringsuppdrag mot `src/lib/rum/copy.ts` och ett par ställen utanför den.

Underlag: `docs/design/spec-rummen-2026-10-10.md` (avsnitt 0 beslut 4, avsnitt 4.3, avsnitt 9), `docs/qa/rummen/vag-1b/copy.md` i worktreen, `src/lib/rum/copy.ts` som den ser ut i 1b-branchen, konceptet `koncept-testvy-2026-10-10.html` (ramarna N1 och N2, `.bnav`), samt minnesreglerna om svenska facktermer, copywriting-stil, talstreck och paketnamnen.

---

## 1. Ordet i navet

### Hur jag har provat

Jag har inte haft riktiga personer att sätta framför skärmen under natten, så det här är en skrivbordsprövning mot två läsare som jag känner väl från artiklarna och supportmejlen: den som fått mejlet "nästa steg är ett test" från en arbetsgivare och aldrig gjort ett förut, och den som registrerade sig för att få ett brev eller ett CV och inte har något test på gång. Måtten är de fyra som art-director och testansvarig satte: förstås direkt, ryms på 360 px i 11 px under ikonen, skrämmer inte brevskrivaren, svensk fackterm. Bredderna är räknade mot konceptets egen kalibrering ("Personliga brev" i Inter 500 på 11 px mäter cirka 84 px, alltså knappt 5,6 px per tecken) och varje plats på 360 px är 87 px bred. Det ska ändå fotograferas i riktig webbläsare, det står redan i acceptans 1b.1.

### Jämförelsen

| Ord | Förstås direkt | Ryms på 360 px | Skrämmer inte brevskrivaren | Svensk fackterm | Omdöme |
|---|---|---|---|---|---|
| **Testträning** | Ja. "Test" är ordet hon fick i mejlet, "träning" säger att det här är övning och inte det riktiga provet. Enda risken är att en som aldrig hört om rekryteringstest läser "test" som att prova tjänsten; det tar rummets första rad hand om (se nedan). | Ja, cirka 62 px på en rad, marginal kvar. | Ja. Hon läser "ett rum för den som ska träna inför ett test" och går förbi utan att känna sig uppmanad. | Halv. "Testträning" är inte rekryterarens ord, men rekryterarens ord ("urvalstest", "arbetspsykologiskt test") beskriver instrumentet, inte det kandidaten gör här. Kandidaten tränar. | **Vald.** |
| Tester | Nästan. Men "Tester" ensamt läser den ovana som "testa tjänsten" eller som en flik med funktioner att prova. Det säger inte att det är träning. | Ja, cirka 34 px. | Nej, inte helt. Ett rum som heter "Tester" låter som något man blir utsatt för. | Nej, för kort för att vara en term. | Reserv, som beslut 4 säger. |
| Träna inför test | Bäst på att förstås: en hel uppmaning. | Nej. Cirka 90 px, bryts till två rader ("Träna inför / test") och då står två av fyra dörrar på två rader på 360 px. Navet ser ojämnt ut och "test" i singular hänger ensamt på rad två. | Ja, tydligast av alla att det är frivilligt. | Nej, en mening, inte en term. | Faller på bredden. |
| Urvalstest | Nej för nybörjaren. "Urval" förstår hon, men sammansättningen är rekryterarens interna ord; i jobbsökarnas eget språk (och i våra artiklars sökord) heter det "rekryteringstest". | Ja, cirka 56 px. | Nej. Det säger vad hon ska bli bedömd med, inte vad hon kan göra här. Mest skrämmande av de fyra. | Ja, den rätta facktermen för instrumentet. | Faller på begriplighet och ton. |
| Rekryteringstest | Ja, det är ordet hon söker på. | Nej. Ett enda ord på cirka 92 px som inte går att bryta utan bindestreck; klipps eller avstavas i navet. | Som Urvalstest: namnet på hotet, inte på hjälpen. | Ja, kandidatens fackterm. | Faller på bredden. |

### Beslut

**Dörren heter Testträning.** Rummet heter Träningen i toppraden och grupprubriken, som i dag. Paret fungerar: dörren säger vad man tränar, rummet säger att man tränar.

Tre villkor som hör till beslutet:

1. **Rummets första rad definierar ordet en gång.** Den som aldrig gjort ett rekryteringstest ska mötas av "rekryteringstest" i den första meningen hon ser i rummet, så att "test" i dörren får sin betydelse. Konceptets T1 ("Börja med att mäta var du står") gör det inte. Förslag till raden under rubriken Träningen i det tomma tillståndet: "Ska du göra ett rekryteringstest? Börja med att mäta var du står, cirka 8 minuter." Det är våg 2-text, så det går till art-director som önskemål, inte som 1b-ändring.
2. **Mät det i stället för att gissa.** `markeraRumYta('dorr')` finns redan. Lägg på registreringsvalet (`profiles.onboarding_intent`) som egenskap, så vi kan läsa två saker första veckan: andelen CV- och brevregistrerade som trycker på Testträning (nyfikenhet är bra), och andelen av dem som lämnar rummet inom tio sekunder (då lovade ordet något annat). Står den andra siffran över hälften byter vi till reserven Tester.
3. **Reserven står.** Om ordet faller i mätningen eller i ett riktigt korridortest: dörren "Tester", rummet fortfarande "Träningen". Inget annat i navet behöver röras.

---

## 2. Strängarna: det som ska ändras

Granskat mot: svenska facktermer och rekryterarens perspektiv, inga engelska gränssnittsord, inget talstreck, inga AI-klichéer, paketnamnen rätt och pris efter namnet. Varje rad är "nuvarande → ny" med motivering. Allt annat i `copy.ts` och i avsnitt 9:s 1b-lista har jag läst och lämnar som det är (se avsnitt 3).

### 2.1 I `src/lib/rum/copy.ts`

| # | Var | Nuvarande | Ny | Motivering |
|---|---|---|---|---|
| 1 | `GRUPP_RUBRIK.cv` | I CV | CV | "I CV" är inte svenska; CV tar ingen bestämd form utan kolon ("CV:t"), och det vill ingen läsa i en rubrik. Dörrraden tre rader ovanför står redan i rummets ton med samma ord, så eyebrowen behöver inte säga "i". |
| 2 | `GRUPP_RUBRIK.brev` | I Personliga brev | Personliga brev | "I personliga brev" läses som "inuti breven". Samma skäl som rad 1. |
| 3 | `GRUPP_RUBRIK.neutral` | I Konto | Konto | "I Konto" är inte svenska ("i kontot" vore). Samma skäl som rad 1. |
| 4 | `GRUPP_RUBRIK.tran`, `.jobb` | I Träningen, I Jobbsöket | Träningen, Jobbsöket | Inte fel i sig, men ett mönster som bara fungerar för två av fem namn är inget mönster. Eyebrowen blir rummets namn i alla fem rum. Vill art-director behålla "I" måste alla fem namn ta bestämd form, och då hamnar vi i "CV-rummet" och "Brevrummet" utåt, vilket bryter regeln om att aldrig skriva bara "brev". |
| 5 | `CHIP.lastEtikett` | Ingår inte i ditt paket | Öppnas med ett paket | "Ditt paket" förutsätter att hon har ett; den som ser låset oftast står på gratisnivån och har inget. Den nya raden är sann för alla (gratis, CV-paketet, Träningspaketet), säger vad som händer i stället för vad som saknas, och lovar inget om vilket paket, det gör arket som öppnas. Inget paketnamn, så regeln om pris efter namnet berörs inte. |
| 6 | `NAV.dorrar` | Rummen | Huvudmeny | Det är en aria-label. En skärmläsaranvändare hör "navigering, Rummen" och förstår inte metaforen; "Huvudmeny" säger vad det är. Obs: globals.css pekar på `nav[aria-label="Rummen"]` i `html[data-flow-active]`-regeln (spec 3.2), selektorn följer med. |
| 7 | `JOBBSOK.loggaSoktJobb` | Logga sökt jobb | Logga sökt tjänst | Knappen landar i listan Sökta tjänster, och specen själv skriver "Logga sökt tjänst" (2.1) och "Spara som sökt tjänst" (B1). "Tjänst" är rekryterarens och Arbetsförmedlingens ord; "jobb" är vardagsordet, och vi ska inte ha tre ord (jobb, tjänst, ansökan) för samma rad. Samma text i `CreateSheet` tills den försvinner i våg 4. |

### 2.2 Utanför `copy.ts`

| # | Var | Nuvarande | Ny | Motivering |
|---|---|---|---|---|
| 8 | `BliUpptacktClient.tsx`, `RumHuvud title` före samtycke (copy.md fråga 10) | Låt jobben hitta dig | Låt rekryterare hitta dig | Jobb hittar ingen; rekryterare gör det, och raden under säger just det ("Rekryterare som söker din bakgrund kan hitta dig"). Rubriken ska stämma med raden och med rekryterarens perspektiv. "Jobben" är reklamspråk. Strängen bör flytta in i `copy.ts` enligt avsnitt 8:s regel om att inget bor i JSX. |
| 9 | `QuickLogSheet.tsx` (titel och knapp), `JobbsokOversikt.tsx`, `SoktaTjansterClient.tsx` | Logga ansökan | Logga sökt tjänst | Följdändring av rad 7. Ett ord för samma handling överallt i Jobbsöket. "Redigera ansökan" i samma ark kan stå kvar: det som redigeras är posten, och "ansökan" är rätt ord för den. |

Nio ändringar, sju i `copy.ts` och två utanför.

---

## 3. Granskat och behållet

Kort, så att ingen behöver undra om det glömdes.

- **Dörrarna** CV, Personliga brev, Jobbsöket: rätt. Aldrig "Brev", som beslutat.
- **RUM_NAMN** Träningen, CV, Personliga brev, Jobbsöket, Konto: rätt. "Konto" som toppradens namn på profilsidorna fungerar.
- **Undersidorna.** Alla tester, Provläget, Mina CV, Analysera CV, CV-mallar, LinkedIn-profilen, Mina brev, Skriv nytt brev, Översikt, Sökta tjänster, Inför intervjun, Matchade jobb, Jobbcoachen, Bli upptäckt, Profil, Prenumeration, Utseende. "Mina brev" och "Skriv nytt brev" står direkt under dörren och eyebrowen Personliga brev, så "brev" är entydigt där; att skriva "personliga" två gånger till i en 248 px-rad kostar mer än det ger. "Matchade jobb" är bra svenska ("matchning" är Arbetsförmedlingens ord), men sidan heter "Dina matchningar" i dag; de ska säga samma sak när Jobbsöket byggs om i våg 4, och då vinner "Matchade jobb".
- **Chip** Nyhet, "N nya", "N väntar": rätt. "N väntar" är samma ord som Bli upptäckt redan använder ("2 väntar på ditt svar").
- **Utseende** Följer systemet, Ljust, Mörkt: rätt, och art-director har ett skäl för just "Följer systemet" (13.1).
- **Kontoraden** "Namn · Paket" med "Gratisnivån" som reserv: rätt, mittpunkt är inte talstreck. Paketnamnet kommer ur `PLANS.name`.
- **Toppraden** "Konto och inställningar", "Stäng": rätt.
- **NAV.sidomeny** "Sidomeny": rätt.
- **Avsnitt 9, våg 1b** i övrigt (toppradens brand Träningen och Jobbsöket): rätt.
- Inga talstreck, inga engelska gränssnittsord, inga AI-klichéer och inga paketnamn utan pris i något av det som 1b visar. Paketnamn förekommer bara i kontoraden, där det är en etikett och inte en säljrad.

---

## 4. Till byggagenten

1. Gör raderna 1 till 7 i `copy.ts`, rad 8 och 9 i sina filer (och flytta rubriken i rad 8 in i `copy.ts`).
2. Byt selektorn i globals.css när `NAV.dorrar` byter värde.
3. Fotografera dörrnavet på 360 px med Testträning: en rad, inte klippt. Det är acceptans 1b.1 och mitt beslut hänger på att det stämmer.
4. Skicka `onboarding_intent` med `markeraRumYta('dorr')` så mätningen i avsnitt 1 går att läsa om en vecka.

---

## Tillägg 2026-10-11

Två krockar som byggagenten hittade när raderna ovan var inarbetade. Ägaren har lämnat textbesluten till copywritern. Ingen kod är ändrad här; strängarna nedan är facit för `src/lib/rum/copy.ts`.

### 10. Sökta tjänster: lyftkortets titel och knapp

| Var | Nuvarande | Ny |
|---|---|---|
| `LYFT.soktaTjanster.titel` (också kortets `label`) | Logga ett sökt jobb | Logga en sökt tjänst |
| `JOBBSOK.loggaSoktJobb` (knappen i kortet, väggen och arket) | Logga sökt tjänst | Logga sökt tjänst (oförändrad) |

Motivering: rad 7 och 9 säger ett ord för samma handling överallt i Jobbsöket, och kortet landar i listan Sökta tjänster, så titeln kan inte säga "jobb" när knappen under säger "tjänst". Titeln följer de andra lyftkortens mönster med artikel ("Ladda upp ett CV", "Skriv ett brev mot en annons"); knappen är den korta formen som specen själv skriver (2.1 och B1). Kortets text "Företag, tjänst och datum räcker" står kvar, så "tjänst" löper genom hela kortet. Att titel och knapp inte är identiska är en fördel: skärmläsaren läser inte samma rad två gånger.

### 11. Bli upptäckt, raden före samtycke

| Var | Nuvarande | Ny |
|---|---|---|
| `BLI_UPPTACKT.radFore` | Låt rekryterare hitta dig. Rekryterare som söker din bakgrund kan hitta dig i kandidatpoolen. Du är anonym tills du själv godkänner en kontakt. | Rekryterare som söker din bakgrund kan hitta dig i kandidatpoolen. Du är anonym tills du själv godkänner en kontakt. |

Motivering: "Låt rekryterare hitta dig" var rad 8:s ersättning för den gamla rubriken "Låt jobben hitta dig" i `RumHuvud title`. Sedan dess följer sidan spec 16.3.2 och h1 är undersidans namn, Bli upptäckt, så den gamla rubriken har hamnat som första mening i raden och ger "rekryterare" två gånger i rad. Meningen stryks; det som står kvar är specens text, som redan säger vad rubriken lovar. "Kan hitta" behålls: raden beskriver vad som kan hända, inte ett löfte. Kortet under ("Kom igång", "Nästa steg är att läsa igenom vad som delas. Inget syns förrän du godkänt det.") upprepar inget av raden. Rad 8 i avsnitt 2.2 utgår därmed som egen sträng; `useUnusedFeatures.ts` och `paket-copy.ts` har kvar "Låt rekryterare hitta dig" som rubrik på kort där ingen h1 står ovanför, och där är den rätt.
