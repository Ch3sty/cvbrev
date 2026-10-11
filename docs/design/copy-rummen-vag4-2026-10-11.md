# Copygranskning: Rummen våg 4

Datum 2026-10-11. Granskare: svensk-ux-copywriter (Fable). Mottagare: byggagenten för `design/rummen-4`, art-director, testansvarig. Ingen kod är ändrad; allt nedan är facit för `src/lib/rum/copy.ts` och de strängar utanför den som nämns per punkt.

Underlag: `docs/qa/rummen/vag-4/README.md` och skärmdumparna i `vyer/` (mycket-kontot på Pixel 7 och 1280), `src/lib/rum/copy.ts`, `jobbsok.ts`, `cvRum.ts`, `JobbsokGolv.tsx`, `NastaHandling.tsx`, `ViewLetterClient.tsx`, `ArbetsstilClient.tsx`, `kravIAnnonsen.ts`, `getSummary.ts`, `status.ts`, `testConfig.ts`; spec-rummen avsnitt 16.4(b), 17.2 och 18.4; copy-rummen-1b och copy-premium; minnesreglerna om svenska facktermer, copywriting-stil och talstreck.

Två regler som går igenom alla åtta punkter:

- **Tal i löpande mening skrivs med bokstäver till och med tolv, siffror därefter.** I dag står "4 saker drar ner" bredvid "Två saker drar ner" i samma funktion. Instrument (ringen "72 av 100", chippen "+9", länken "Alla 5", spårets "16 dagar") behåller siffror.
- **Säg bara det vi vet.** Flera rader påstår något om användarens dokument som vi inte har läst (se punkt 2 och 8). Där vi har ett förslag säger vi det; där vi bara har ett tal säger vi talet.

---

## 1. "N saker drar ner. Alla går att åtgärda i kväll."

| Var | Nuvarande | Ny |
|---|---|---|
| `CV_RUM.drarNer(n)`, n ≥ 2 | 4 saker drar ner. Alla går att åtgärda i kväll. | Fyra saker drar ner. Alla går att åtgärda på en kväll. |
| n = 1 | En sak drar ner. Den går att åtgärda i kväll. | En sak drar ner. Den går att åtgärda på en kväll. |
| n = 0 | Inget drar ner just nu. | Inget drar ner just nu. (oförändrad) |

Motivering: Konceptets rad är bra och behålls i sin form. Två saker rättas. "I kväll" är en tidpunkt, och raden står kvar dygnet runt; skärmdumpen är tagen under "God natt, Anna", då lovar "i kväll" något som redan passerat, och klockan åtta på morgonen lovar den att hon ska vänta tolv timmar. "På en kväll" är ett mått på arbetet, inte en tid, och det är sant: fynden är analysens egna förslag som läggs in med ett klick vardera. Talet skrivs med bokstäver till och med tolv (fem fynd visas, men funktionen får hela längden), siffror från 13. "Drar ner" utan objekt står kvar; ringen bredvid säger vad som dras ner.

---

## 2. Fyndens metatexter

| Var | Nuvarande | Ny |
|---|---|---|
| `CV_RUM.fynd.sammanfattningMeta` | Inledningen säger inte tydligt vem du är som yrkesperson. | Det första rekryteraren läser. Vårt förslag säger tydligare vilken roll du har och vad du kan. |
| `CV_RUM.fynd.rollMeta` | Beskriver ansvar mer än resultat. Förslaget lägger till utfall och nyckelord. | Vårt förslag beskriver rollen med resultat och nyckelord, inte bara ansvar. |
| `CV_RUM.fynd.kompetenserMeta(namn)` med namn | Saknas i CV:t: SAP, Agil projektledning. | Saknas i CV:t: SAP, Agil projektledning. (oförändrad) |
| `CV_RUM.fynd.kompetenserMeta([])` | Efterfrågade kompetenser saknas i CV:t. | Kompetenser ur kravprofilen som inte står i CV:t. |

Motivering: De två första är fasta texter som visas för varje profil- och rollfynd oavsett vad analysen faktiskt såg (`cvRum.ts` har bara `atsImpact`, ingen beskrivning). "Inledningen säger inte tydligt vem du är" och "beskriver ansvar mer än resultat" är då gissningar om hennes CV, och den som skrivit en tydlig inledning som analysen ändå vill vässa läser raden som fel. Det vi vet är att analysen har ett förslag och att det ger poäng (chippen). Nya raderna säger det, i vi-form, och ger rekryterarens perspektiv ("det första rekryteraren läser") som skäl att börja där. "Yrkesperson" och "utfall" är inte ord någon säger högt. Kompetensraden är redan konkret och sann, den står. Reservtexten utan namn knyter an till rubriken "Kompetenser mot kravprofilen" i stället för det passiva "efterfrågade".

---

## 3. Brevets träffrad och "Lägg till X"

| Var | Nuvarande | Ny |
|---|---|---|
| `BREV_RUM.traffar(n, av)`, n < av | Det möter 4 av 6 krav vi hittade i annonsen. | Brevet täcker 4 av de 6 krav vi hittade i annonsen. |
| `BREV_RUM.traffar(av, av)` | Det möter alla 6 krav vi hittade i annonsen. | Brevet täcker alla 6 krav vi hittade i annonsen. |
| `BREV_RUM.saknas(ord)` | "Azure" nämner du inte alls. | Azure saknas. |
| `BREV_RUM.traffarAria` | Krav i annonsen som brevet möter: … Saknas: … | Krav i annonsen som brevet täcker: … Saknas: … |
| `BREV_RUM.laggTill(krav)` | Lägg till Azure | Lägg till Azure (oförändrad) |
| `BREV_RUM.laggTillMeta` | Kravet står i annonsen men inte i brevet. Nämn det med ett exempel ur ditt CV. | Står i annonsen men inte i brevet. En mening med ett exempel ur ditt CV räcker. |

Motivering: "Det möter krav" är engelska i svensk dräkt (meets the requirements). Ett brev *täcker* krav på svenska, och "Brevet" som subjekt gör att raden står för sig själv under rubriken "Projektledare, Klarna". "Vi hittade" behålls med flit: `kravIAnnonsen` läser en ordlista med verktyg och metoder (SQL, Azure, Scrum …), inte annonsens hela kravprofil, så "4 av 6 krav i annonsen" vore osant. "De 6 krav vi hittade" säger exakt vad talet är. Citattecknen runt ordet försvinner; ordet står redan som cell i veckoraden ovanför, och "Azure saknas." är kortare än "nämner du inte alls" utan att säga mindre. Byggagenten: kravet står i den form det först står i annonsen, så "backend" ger "backend saknas."; gör första bokstaven versal i strängen. "Lägg till Azure" är konkret och fungerar som radtitel med "Redigera" till höger; metan tappar "Kravet" (titeln har redan sagt vilket) och "Nämn det" (det är vad hela raden handlar om) och säger i stället hur lite som krävs.

Talen 4 och 6 står kvar som siffror: raden är ett instrument, samma som veckoraden under den.

---

## 4. Väggens rad i Jobbsöket

| Var | Nuvarande | Ny |
|---|---|---|
| `JOBBSOK_HEM.rad`, öppna > 1 | 5 sökta tjänster pågår. | Fem sökta tjänster pågår. (siffror från 13) |
| öppna = 1 | En sökt tjänst pågår. | oförändrad |
| svarIGar | Ett nytt svar sedan i går. / 3 nya svar sedan i går. | Ett nytt svar sedan i går. / Tre nya svar sedan i går. |
| intervju | Intervju på Volvo Cars. | Intervju på Volvo Cars. (oförändrad) |
| tysta = 1 | En har varit tyst i 16 dagar. | En har varit tyst i 16 dagar. (oförändrad) |
| tysta > 1 | 2 har varit tysta i över 12 dagar. | Två har varit tysta i över tolv dagar. |

Motivering: Raden är rätt byggd. Tre korta meningar i den ordning hon bryr sig om, "pågår" säger att listan är de öppna, och "Intervju på Volvo Cars" är sant eftersom `nastaIntervju` bara tar `interview_invited` (den som redan gjort intervjun hamnar inte här). "Tyst" är produktens ord sedan 1b och står i spåret också; det byts inte. Det enda som ändras är talen, enligt regeln ovan: väggens rad är en mening, inte ett instrument, och "5 sökta tjänster pågår" bredvid "En har varit tyst" är två olika system i samma rad. Dagarna (16) står kvar som siffror, det är ett mått.

---

## 5. Spårets etiketter

Regel: **etiketten under en station upprepar aldrig stationens namn.** Rubrikraden säger redan Sökt, Svar, Intervju, Erbjudande; etiketten lägger till det som skiljer.

| Var | Nuvarande | Ny |
|---|---|---|
| `SPAR.sokt(datum)` | sökt 15 okt | 15 okt |
| `SPAR.svar(datum)` | svar 15 okt | 15 okt |
| `SPAR.kallad(datum)` | kallad 15 okt | kallad 15 okt (oförändrad) |
| `SPAR.intervjuGjord` | intervju gjord | genomförd |
| `SPAR.provjobbat` | provjobbat | provjobbat (oförändrad) |
| `SPAR.erbjudande` | erbjudande | 12 okt (datumet, som de andra stationerna) |
| `SPAR.tyst(dagar)` | tyst 16 dagar | tyst 16 dagar (oförändrad) |
| `SOKT_META.intervjuGjord(datum)` | Intervju gjord 7 okt. Väntar besked. | Intervju genomförd 7 okt. Väntar på besked. |
| `SPAR.laget` (aria) | sökt, har fått svar, på intervju, har fått erbjudande | oförändrad |

Motivering: "Kallad 10 okt" under Intervju är den etikett som bär mest, för den skiljer kallad från genomförd, och den står. "Intervju gjord" under rubriken Intervju säger ordet två gånger på 40 px, och "gjord" är inte det ord statusen heter ("Intervju genomförd" i `status.ts`); ett ord för samma sak, alltså "genomförd". Det ryms i 11 px (nio tecken mot "intervju gjord" på fjorton). "Erbjudande" under Erbjudande säger ingenting; datumet säger när. Samma för "sökt" och "svar": "15 okt" under Sökt läses "Sökt 15 okt". Byggagenten: `SPAR.erbjudande` blir en funktion av datumet som `sokt` och `svar`, `sparRad` har redan `datumFor(t)`. "Väntar besked" blir "Väntar på besked" i metaraden; den kortare formen är talspråk som ser avhuggen ut i text.

---

## 6. Metatexterna under "Mer i Jobbsöket"

| Var | Nuvarande | Ny |
|---|---|---|
| `MER.matchade.meta` | Jobb som passar ditt CV, med skäl per träff. | Jobb som passar ditt CV, och varför de passar. |
| `MER.matchade.metaNya(n)` | En ny träff sedan du tittade senast. / 3 nya träffar sedan du tittade senast. | En ny träff sedan sist. / Tre nya träffar sedan sist. |
| `MER.jobbcoachen.meta` | Fråga om lön, uppsägningstid eller hur du svarar en arbetsgivare. | oförändrad |
| `MER.bliUpptackt.metaAv` | Anonym profil mot rekryterare. Du godkänner varje kontakt. | Rekryterare kan hitta dig, anonymt. Du godkänner varje kontakt. |
| `MER.bliUpptackt.metaPa` | Profilen är anonym och visas för rekryterare. | oförändrad (samma rad som `BLI_UPPTACKT.radEfter`) |
| `MER.intervju.meta` | Frågorna som brukar komma, och dina svar med exempel ur CV:t. | oförändrad |

Motivering: "Skäl per träff" är vårt interna namn på funktionen, inte något hon säger; "varför de passar" är samma löfte på svenska. "Sedan du tittade senast" är en mening för en chip-rad; "sedan sist" räcker, och chippen "3 nya" till höger säger talet en gång till. "Anonym profil mot rekryterare" läses som att profilen är riktad mot dem; "mot" är fel preposition och "anonym profil" är objekt utan verb. Nya raden börjar med vad som händer och stämmer med rummets rad på Bli upptäckt ("Rekryterare som söker din bakgrund kan hitta dig"). Jobbcoachen-raden är den bästa i gruppen: tre konkreta frågor, precis det som gör att man klickar. Intervju-raden är rätt och väntar på att få plats.

---

## 7. Arbetsstil: kortet och knappen mot gratisnivån

Kontroll mot 17.2 och koden: `personlighet-grund` har ingen `requiresFeature` i `testConfig.ts` och är gratis (plans.ts: "grundtestet är gratis"); `personlighet-avancerad` (120 påståenden) kräver `tests_above_base`. 17.2 räknar upp vad som är gratis i Rekryteringstester och nämner inte personlighetstestet, så grundtestet gratis står inte i strid med beslutet. Länken till `personlighet-grund` är därför rätt. Men texten lovar fel sak: "Din arbetsstilsrapport byggs på ditt personlighetstest" följt av knappen till grundtestet, och efter grundtestet möter hon `LockedWorkStylePreview` med "Din rapport är nästan klar" och kravet på det fördjupade testet. Kortet ska säga det före klicket.

| Var | Nuvarande | Ny |
|---|---|---|
| `ARBETSSTIL.forstTitel` | Gör personlighetstestet först | Börja med personlighetstestet |
| `ARBETSSTIL.forstText` | Din arbetsstilsrapport byggs på ditt personlighetstest. Det tar ungefär tio minuter, och det finns inga rätta svar. | Grundtestet är gratis: 50 påståenden, cirka tio minuter, inga rätta svar. Det ger dina styrkor. Hela rapporten om hur du arbetar bygger på det fördjupade testet med 120 påståenden. |
| `ARBETSSTIL.forstKnapp` | Gör personlighetstestet | Starta grundtestet |
| `ARBETSSTIL.rad` | Hur du arbetar, samarbetar och drivs. Alltid i ord, aldrig i siffror, och den privata delen är bara din. | oförändrad |

Motivering: Hon ska veta tre saker innan hon trycker: att det är gratis, hur stort det är och att det inte är hela vägen. Talen 50, tio och 120 läses ur `TEST_CONFIGS` (`totalQuestions`, `minutes`), aldrig som fasta tal; "tio minuter" skrivs med bokstäver i meningen, 50 och 120 med siffror (över tolv). Kortet nämner inget paketnamn: det fördjupade testets betalvägg bär sin egen rad enligt copy-premium ("Ingår i Premium") när våg 5 har bytt namnet, och ett paketnamn i våg 4 skulle falla på `paketnamn.test.ts` tills dess. Knappen säger vad som startar; "Starta" är samma verb som personlighetshubbens lyftkort ("Starta testet") i spec 16.3.2. Testansvarig kan byta "Grundtestet är gratis" mot sin egen formulering, men ordet gratis ska stå i kortet så länge 17.2 gäller.

---

## 8. "Ansökan" i Sökta tjänster och Nästa handling

**Regeln.** Posten i Jobbsöket heter **sökt tjänst**, i alla former: det man loggar, följer upp, redigerar, tar bort och räknar. Ordet "ansökan" används inte om posten någonstans i Jobbsöket. Det får bara stå där det betyder dokumentet hon skickade ("ansökningshandlingar" i Profil) och i Arbetsförmedlingens egen term "sökta jobb" i aktivitetsrapporten, som är deras ord och ska kännas igen där. Det upphäver undantaget i copy-rummen-1b rad 9 ("Redigera ansökan kan stå kvar"): med 16.4(b) punkt 11 på bordet är ett ord bättre än ett undantag.

Statusen "Sökt" (chip och station) och statusraden "5 sökta, 3 väntar svar, 2 intervju, 2 svar" följer redan regeln och står.

| Var | Nuvarande | Ny |
|---|---|---|
| `NastaHandling.tsx` follow-up, titel | Följ upp en ansökan / Följ upp 3 ansökningar | Följ upp en sökt tjänst / Följ upp tre sökta tjänster |
| samma, text | Den har varit tyst i över två veckor. Ett kort mejl brukar räcka, och vi skriver utkastet från din ansökan. | Den har inte svarat på över tolv dagar. Ett kort mejl brukar räcka, och vi skriver utkastet åt dig. |
| samma, flera | De har varit tysta i över två veckor. … | De har inte svarat på över tolv dagar. Ett kort mejl brukar räcka, och vi skriver utkasten åt dig. |
| `NastaHandling.tsx` af-report, text | 4 sökta jobb att rapportera till Arbetsförmedlingen. … | oförändrad (Arbetsförmedlingens term) |
| `SoktaTjansterClient.tsx` flik | Ansökningar | Lista |
| samma, tomt tillstånd | Inga ansökningar än | Inga sökta tjänster än |
| samma, tom knapp | Logga din första ansökan | Logga din första sökta tjänst |
| samma, under brevförslaget | Logga en ansökan manuellt | Logga en sökt tjänst själv |
| samma, filter utan träff | Inga ansökningar matchar filtret | Inga sökta tjänster matchar filtret |
| samma, bekräftelse | Ansökan loggad. | Sparad i Sökta tjänster. |
| samma, aria på sökfältet | Sök bland dina ansökningar | Sök på företag eller tjänst (samma som platshållaren) |
| samma, brevförslagets text | Lägg in dem som ansökningar, så har du en komplett historik … | Lägg in dem som sökta tjänster, så har du hela historiken från start. |
| `QuickLogSheet.tsx` titel vid redigering | Redigera ansökan | Redigera sökt tjänst |
| `BackfillBanner.tsx` | Ett av dina brev är inte loggat som ansökan / N av dina brev är inte loggade som ansökningar | Ett av dina brev är inte loggat som sökt tjänst / N av dina brev är inte loggade som sökta tjänster |
| samma, knapp | Lägg in brevet som ansökan / Lägg in N brev som ansökningar | Lägg in brevet som sökt tjänst / Lägg in N brev som sökta tjänster |
| `CvComparisonCard.tsx` enhet | 3 ansökningar / 1 ansökan | 3 sökta tjänster / 1 sökt tjänst |
| samma, fotnot | 1 ansökan saknar valt CV och räknas inte här. / N ansökningar saknar … | 1 sökt tjänst saknar valt CV och räknas inte här. / N sökta tjänster saknar … |
| samma, ingress | Så många av ansökningarna med varje CV som fått svar. | Så många av de sökta tjänsterna med varje CV som fått svar. |
| `ApplicationDetailClient.tsx` laddning | Läser in ansökan | Läser in tjänsten |
| samma, sparat | Ansökan uppdaterad. | Sparat. |
| samma, ta bort-dialog | Ta bort hela ansökan? / Ansökan och hela dess historik försvinner, och den räknas inte längre med i din statistik eller i aktivitetsrapporten. Det går inte att ångra. / Ta bort ansökan | Ta bort tjänsten ur Sökta tjänster? / Tjänsten och hela dess historik försvinner, och den räknas inte längre med i statistiken eller i aktivitetsrapporten. Det går inte att ångra. / Ta bort |
| samma, händelse-dialog | … Själva ansökan ligger kvar. | … Tjänsten ligger kvar. |
| `DashboardHero.tsx`, `SnabbAtgarder.tsx` länk | Följ dina ansökningar | Dina sökta tjänster |
| `PagarNu.tsx`, `JobbsokOversikt.tsx` | Inga ansökningar än, Logga en ansökan, En ansökan den här veckan | Renderas inte längre av `DashboardHem`; tas bort om de är döda, annars samma ord som ovan |

Motivering: "Följ upp en sökt tjänst" är det enda stället där "ansökan" var det naturligare ordet, och det är ändå rätt att byta: kortet pekar på en rad i Sökta tjänster, raden heter sökt tjänst, och användaren ska inte behöva översätta mellan väggen ("En har varit tyst"), kortet ("ansökan") och listan ("sökt tjänst"). Texten under rättas också i sak: gränsen är `NO_RESPONSE_NUDGE_DAYS = 12`, så "över två veckor" är fel från dag 12 till dag 13, och "från din ansökan" lovar ett underlag vi inte säkert har (posten kan vara loggad utan brev). Fliken heter "Lista" för att "Sökta tjänster" redan är h1 två rader ovanför och bryts på två rader i segmentet på 360 px; "Lista", "Statistik" och "Rapport" är tre vyer av samma data och läses som ett set. "Sparad i Sökta tjänster." är samma rad som brevvyn säger efter "Spara som sökt tjänst", en bekräftelse för en händelse. "Logga en sökt tjänst själv" i stället för "manuellt": "manuellt" är systemets ord, "själv" är hennes, och det står i kontrast till brevförslaget ovanför som gör det åt henne.

---

## Till byggagenten

1. Punkt 1 till 7 bor i `copy.ts`; punkt 8 i `NastaHandling.tsx`, `SoktaTjansterClient.tsx`, `QuickLogSheet.tsx`, `BackfillBanner.tsx`, `CvComparisonCard.tsx`, `ApplicationDetailClient.tsx`, `DashboardHero.tsx` och `SnabbAtgarder.tsx`. Flytta gärna punkt 8:s strängar in i `copy.ts` när de ändå rörs (avsnitt 8:s regel: inget bor i JSX).
2. En hjälpare för talord (en till tolv, siffror därefter) i `copy.ts`, använd i `drarNer`, `JOBBSOK_HEM.rad`, `MER.matchade.metaNya` och Nästa handlings titel. Instrumenten rörs inte.
3. `SPAR.erbjudande` blir en funktion av datumet; `BREV_RUM.saknas` gör första bokstaven versal.
4. Talen i Arbetsstil-kortet läses ur `TEST_CONFIGS`.
5. Fotografera `profil-cv`, `dashboard` (C), `mina-brev-id`, `arbetsstil` och `sokta-tjanster` på Pixel 7 efter bytet; särskilt spåret, så att "genomförd" och datumen står på en rad i 11 px.
