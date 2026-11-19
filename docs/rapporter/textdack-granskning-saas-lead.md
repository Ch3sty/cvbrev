# Granskning av textdäcket 2026-11-19, saas-lead

Underlag: docs/rapporter/textdack-2026-11-19.md, min genomgång docs/rapporter/genomgang-saas-lead-2026-11-19.md och koden på main (6a902f02). Däcket och koden är inte ändrade.

Ägarens beslut gäller: allt körs i ett svep före 23 nov, mejlens stycke 2 skrivs om utan tal, GRATISRAD i v4/copy.ts rättas nu och datalagringen rörs inte.

## Facit, kontrollerat i koden

| Påstående | Källa | Utfall |
|---|---|---|
| Gratis ger ett grundnivåtest om dagen, i valfri typ | `GRATISNIVA.grundnivaTestPerDag = 1`; `quotaService.ts:128-147` räknar de åtta `GRUND_TEST_TYPER` plus `matrislogik-pass` i en gemensam dagskvot | Stämmer. Personlighetstestet ingår inte i kvoten, så "ett test om dagen, och personlighetstestet" är sant. |
| Träna ingår aldrig gratis | `gratisniva.ts:26` `tranaGratis: false` | Stämmer |
| Premium tränar utan tak | `traning/tillgang.ts:10`: med `tests_above_base` är passet på din nivå "obegränsat". Träna finns i alla åtta typerna (`v4/rutter.ts:31-47`). | Stämmer, också "i alla åtta testtyperna" i mejlet |
| Åtta testtyper | `ANTAL_TESTTYPER` = 3 + fem flaggor, i dag 8 | Stämmer |
| Nivåkollen finns i fem typer | `v4/rutter.ts:54-63` `NIVAKOLL_FINNS`: matris, figurserie, deduktiv, verbal och numerisk är true, medan talserie, spatial och ordförråd är false | Stämmer |
| "Nivån räknas bara på uppgifter du inte sett den senaste månaden" | Träning: `traning/motor.server.ts:1023-1028`. Nivåkollen: `nivakoll/motor.server.ts:526-529`. | Stämmer i praktiken. Undantag: om alla uppgifter är sedda och ingen tidigare nivå finns räknas de ändå. Kommentaren på rad 20 och 82 säger fel ("räknas i nivån") och ska rättas i samma svep, annars läser nästa granskare fel. |
| "Tolv uppgifter som anpassar sig" | `traning/niva.ts:41` `MATNING_ANTAL = 12` gäller bara matrisen. `NIVAKOLL_URVAL`: figurserier 9, deduktivt 6, verbalt och numeriskt fyra underlag, med fast urval och inte adaptivt. | **Stämmer bara för matrislogik.** Se T1. |
| Kroppar och speglingar på grundnivå i spatial | `spatialV1/bankGrund.json`: 22 kroppar och speglingar | Stämmer, så knappen på TypProvKort leder till kroppar |
| Provet utan konto i alla typer | `tests/prov-typer.ts:25` | Stämmer |
| Deduktiva familjer | `deduktivV1/familjer.ts:20-24` | Stämmer med däcket |

## Per punkt

**T1 Gratisraden: ändring på en rad, resten godkänt.**
- page.tsx:488-493: "I de flesta typerna börjar du med ett nivåtest på tolv uppgifter som anpassar sig efter dina svar och på cirka åtta minuter visar var du står" är fel. Tolv uppgifter med anpassning finns bara i matrislogik. Ny text: `I matrislogik, figurserier, deduktiv slutledning, verbalt och numeriskt börjar du med ett kort nivåtest som visar var du står.` Resten av stycket står kvar.
- paywall-copy.ts:374 godkänns, och raden ingår i T11 nedan.

**T2 Åtta i stället för nio: godkänd.** `ingangTester.rubrik` tar emot en sträng (TesterIngang.tsx:148), så "Åtta testtyper och personlighetstestet" blir rätt. Grep-vakten ska byggas.

**T3 Premium utan tak: godkänd, inklusive båda mejlen.** Mejltexterna innehåller inga tal och följer därmed ägarens beslut. Kommentaren om "3 000+" i paywall-copy:280 gäller bilden, inte texten, och får stå.

**T4 Fjorton artiklar: godkänd.** Jag kontrollerade stickprov mot koden. Deduktivt-artikeln bäddar verkligen in `<ArtikelProv typ="deduktiv" />` (rad 44), så "fem deduktiva uppgifter utan konto, här på sidan" stämmer.

**T5 Uppräkningarna: godkänd, med en mening struken.**
- talserier.mdx "Gånger och delat" godkänns, se fråga 5.
- talserier.mdx:355 "På expertnivån förekommer också serier där först tredje raden av skillnader är jämn" **stryks**. Det finns ingen familj för tredje ordningens differenser. De åtta familjerna i `talserierV1/types.ts` är aritmetisk, geometrisk, andra_ordningen, vaxelvis, varvad, geodiff, affin och summa. Träffarna på "tredje" i bankerna är distraktornamn. Vill copywritern ha en mening under Expert används i stället den som går att belägga: `På avancerad och expertnivå kombineras stegen, till exempel gånger två och plus tre i samma serie.` Familjen affin finns i både avancerad (47) och expert (46).

**T6 Typbeskrivningarna: godkänd.** Familjerna stämmer mot familjer.ts och FORM_NAMN. Om spatialrubriken, se fråga 3.

**T7 Nya avsnitt: godkänd i sak, med två ändringar.**
- Alla sju lösta exempel håller. Jag har räknat igenom kroppen (2, 3, 2), L:et efter två speglingar, sanningssägarna (Tom ljuger, Sara och Vera talar sanning), tabellen och pärmarna.
- Tabellpusslets inledning säger "Fyra personer, fyra avdelningar, fyra bilar", men exemplet har tre av varje. Byt till `Några personer, lika många avdelningar och lika många bilar, och en lista med villkor som mest säger vad som inte gäller.`
- seoTitle för deduktivt-induktivt-test ändras bara om SEO visar i GSC att "deduktiv slutledningsförmåga" bär klicken. Den nya titeln tappar "induktiv". Det är SEO:s beslut, inte en sanningsfråga. Description och de nya H2:orna godkänns.

**T8 Bankbredden: godkänd.** Talet visas först när det finns en konstant med ett vitest som vaktar den.

**T9 Play-butiken: ändring på en mening.**
- Stryk talet i `Vi har över 3 000 uppgifter, och nivån räknas ...`. Ny text: `Nivån räknas bara på uppgifter du inte sett den senaste månaden. Den visar vad du kan, inte vad du minns.` Det följer samma regel som mejlet och T8: inget tal förrän konstanten finns.
- Påminnelsen finns i appen (`src/lib/mobilapp/notis.ts`, `NotisFraga.tsx`). Den raden godkänns.
- Om klockraden ingår i AAB:n är fortfarande ägarens kontroll i Play Console.

**T10 Nivåkollen publikt: godkänd.**

**T11 Betalväggens rubrik vid kvotlås saknas i däcket, och jag föreslår den här.**
- Felet: när dagens grundnivåtest är gjort och användaren trycker på en grundnivå skickar `lasFor` (tester-v4/tester/lasning.ts:25) väggen med `variant="testniva"` och `plats: 'testniva'`. `testrumRubrik` returnerar null för den platsen, så rubriken blir "Avancerad nivå ingår i Premium" (paywall-copy.ts:279). PaywallCard byter bara den sekundära knappen (`grundSlutIdag`, PaywallCard.tsx:151 och 341). Användaren bad om grundnivån och får höra om avancerad nivå, i just det ögonblick då spärren ska kännas ärlig.
- Bygget: när `grundSlutIdag(variant, grundKvarIdag)` är sant ska rubriken vara `Dagens grundnivåtest är gjort` och brödtexten `Ett nytt i morgon. Med {PREMIUM} tränar du på din nivå utan tak, med avancerad nivå, expertnivå och övningsprov mot klockan.` Copywritern tar slutorden. Prisraden och knappen står kvar som i dag. Samma rubrik får test-tak (T1). Ett vitest i paywall-copy ska vakta att grundnivån med kvoten slut aldrig ger "Avancerad nivå".
- Mätning: `paywall_shown` får `plats: 'kvot'` i det läget, eftersom 'kvot' redan finns i BetalvaggPlats. Då kan huvudtalet i min genomgång, kvot_slut_visad till paywall_cta_clicked till checkout_started, läsas utan att blandas med riktiga nivåspärrar.

**GRATISRAD v4/copy.ts:140 (ägarens beslut, rättas nu).** Byt `Valfri testtyp, och Nivåkollen en gång per testtyp.` mot `Valfri testtyp. Där Nivåkollen finns gör du den en gång gratis.` Resten av strängen är orörd i det här svepet. Om "Proven ligger på avancerad nivå" stämmer avgör sälj (E8), det är inte prövat här.

## Öppna frågor

1. **Alva: rätta de två meningarna nu, exakt enligt T4, och ingenting annat.** Artikeln lovar gratis träning som har varit Premium sedan 19 nov, och löftet står i FAQ-schemat. Sanningskravet väger tyngre än en ren avläsning. Två meningar om gratisnivån stör inte avläsningen av säljsidan (U11) på 2 dec, men rättelsen ska noteras i tidslinjen med datum.
3. **TypProvKort spatial: rubriken står kvar, texten byts.** Det blir alltså däckets alternativ, `Grundnivån i spatial förmåga är gratis med konto: femton uppgifter på tolv minuter, också kroppar och speglingar, och genomgång av varje figur.` Kortet hör till I-provsklustret och rubriken matchar provets deltest. Kropparna finns på grundnivå (22 i bankGrund), så texten håller. Sälj och SEO behöver inte förhandla om det här.
5. **"Gånger och delat" är verifierad.** Den är `FAMILJ_NAMN.geometrisk` i `src/lib/tester/steg2/namn.ts:10`, och bankGrund har kvoter åt båda hållen (÷2 till ÷5, plus multiplikation). Meningen till talserier.mdx godkänns. Tredje ordningens differenser är inte verifierade och stryks, se T5. Påminnelsen i appen är verifierad, och klockraden är ägarens.

## Det jag inte godkänner

- **T1, page.tsx-ingressen, "tolv uppgifter som anpassar sig" i de flesta typerna.** Det gäller bara matrislogik (NIVAKOLL_URVAL).
- **T5, talserier "tredje raden av skillnader".** Det finns ingen sådan familj i generatorn eller bankerna.
- **T9, "över 3 000 uppgifter" i butikstexten.** Det är ett tal utan konstant, i strid med samma regel som ägaren satte för mejlet.
- **T7, seoTitle för deduktivt-induktivt-test** godkänns inte utan SEO:s GSC-underlag.
- **T11 och GRATISRAD** saknas i däcket och måste in i svepet. Annars säger väggen "Avancerad nivå" till den som bara nått dagskvoten.
