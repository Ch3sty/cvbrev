# Faktagranskning: content/artiklar/stanine-testresultat.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, skalan och spärrtiderna stämmer men en mening om polisens krav säger motsatsen till vad källan säger.

## Fynd att åtgärda

| Rad | Citat ur texten | Klass | Rätt uppgift eller förslag | Källa |
|---|---|---|---|---|
| 127 | "Med det nya provet är kravet alltså 4 igen." | fel | Meningen antyder att kravet höjts tillbaka till 2016 års nivå. Polistidningen, som artikeln själv citerar, skriver att Försvarshögskolans preliminära beräkningar visar att 4 på I-provet ungefär motsvarar den tidigare gränsen 3 på UNIQ, och Polismyndigheten räknar med att andelen godkända kan öka något. Siffrorna gäller olika prov och olika skalor och går inte att jämföra rakt av. Ersätt med: "Siffran 4 på I-provet går inte att jämföra rakt av med det gamla provet. Enligt Polistidningen visar Försvarshögskolans preliminära beräkningar att 4 på I-provet ungefär motsvarar den tidigare gränsen 3." | https://polistidningen.se/2025/04/nytt-intelligenstest-i-polisprovningen/ |
| 103 | "Alva beskriver sin skala som standardiserad efter en normalfördelning." | obelagt | Står inte på de två Alva-sidorna i källraden. Alva skriver att resultatet visar hur du presterar jämfört med en population av yrkesverksamma vuxna och att de allra flesta hamnar mellan 4 och 7. Ersätt med det, eller stryk meningen. | https://help.alvalabs.io/en/articles/3135413-how-alva-s-logic-test-work, https://help.alvalabs.io/en/articles/5040186-what-if-i-m-not-happy-with-my-test-results |

## Belagda påståenden
- Stanine: nio steg, medel 5, SD 2, steg om en halv SD, andelar 4/7/12/17/20/17/12/7/4 %, percentilgränser 4, 11, 23, 40, 60, 77, 89, 96; 4–6 rymmer 54 % (rad 12–18, 35–63): standarddefinition (Hogrefe termlexikon, Wikipedia Stanine).
- C-skala 0–10, Matrigmas resultatskala (rad 95, 103): Matrigma Technical Manual 2017, "The C-scale ranges from 0 to 10".
- Sten 1–10, medel 5,5, SD 2 (rad 96): standarddefinition.
- I-provet används sedan 5 maj 2025, mäter generell problemlösningsförmåga, uppdaterad normeringsgrupp (rad 73, 107): pliktverket.se, Nytt I-prov.
- Polistidningen: "Polismyndigheten har bestämt att polissökande måste få minst en fyra på I-provets niogradiga skala"; faktarutan värnplikt 3, polisutbildning 4, officersprogrammet 6 (rad 16, 109–124): polistidningen.se 2025-04. (Faktarutan har även tullaspirant 4, som artikeln medvetet utelämnar.)
- Riksrevisionen 2025:13: "2016: Kravet för godkänt på begåvningstestet sänks ... från en fyra till en trea" (rad 127): riksdagen.se.
- Polisen: spärrtid 12 månader, giltighetstid 24 månader för begåvningstest (rad 145): polisen.se.
- Plikt- och prövningsverket: I-provet spärrtid 18 månader, godkänt resultat giltigt högst 36 månader (rad 147): pliktverket.se.
- Alva: resultat gäller 24 månader, nytt försök för samma företag kräver att företaget tillåter det; spannet "can be more or less strict depending on the role" (rad 137, 149): help.alvalabs.io.
- Assessio: "for most positions, an average ability in problem-solving is adequate" (rad 137): assessio.com.
- Produkt: övningsprovet ger antal rätt per deltest och ingen stanine; övningsprovet i Premium; provdatum i kontot (rad 151, 159): features.ts (test_exam_mode), src/lib/traning/mittTestFranKalla.server.ts.

## Rättning (omgång 1, 2026-11-15)
- Rad 127 (fel): "Med det nya provet är kravet alltså 4 igen." ersatt med att ribban inte höjts tillbaka, att 4 på I-provet inte kan jämföras rakt av med det gamla provet, och Polistidningens uppgift (kontrollerad ordagrant): Försvarshögskolans preliminära beräkningar visar att 4 på I-provet kommer närmast den tidigare gränsen 3, och möjligen blir något fler godkända. Polistidningen fanns redan i källraden.
- Rad 103 (obelagt): "Alva beskriver sin skala som standardiserad efter en normalfördelning" ersatt med Alvas egen formulering: resultatet jämförs med en population av yrkesverksamma vuxna och de allra flesta hamnar mellan 4 och 7 (4–7 kontrollerat på Alvas hjälpsida). Alva-sidorna fanns redan i källraden.
- Inga rubriker, FAQ-frågor eller description ändrade. updated: "2026-11-15" tillagt. Bilden berörs inte.

## Andra granskningen (2026-11-15)
GODKÄND. Rad 128: Polistidningen kontrollerad ordagrant: "Försvarshögskolans preliminära beräkningar visar att en fyra på I-provet är det som kommer närmast en trea på UNIQ" och "Möjligen kan något fler polissökande bli godkända med det nya provet." Den nya texten säger inte mer än så. Rad 104: Alva kontrollerad: "compares to a population of working adults" (How Alva's Logic Test Works) och "The vast majority of people will get results in the 4-7 range on the 10-point scale" (What if I'm not happy). Ingen kvarvarande formulering om att kravet är "4 igen" eller om normalfördelad Alva-skala. Inga talstreck i ändrade rader.

## Svar till samordnaren
stanine-testresultat, GODKÄND, inga brister.
