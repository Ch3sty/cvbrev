# Ställningstagande: retention och användartillfredsställelse

Granskare: SaaS-produktexpert, retention. Underlag: `plan-utkast.md` samt min
egen kodgenomgång i `audit-saas-retention.md`.

Utkastet är starkare än min egen granskning på flera punkter, särskilt
sanningskravstabellen i avsnitt 9 och insikten att ansökningshistoriken är det
som gör 149 kr försvarbart. Jag ställer mig bakom visionen utan reservationer.

## 1. De sex konfliktpunkterna

**1. FAB i mobilnavet: jag går på sammankallandes förslag.** Fyra slots utan
FAB. Jag ville bara ta bort hänglåset, men argumentet att en kontextuell yta
som betyder olika saker på olika sidor lär användaren att inte lita på den är
bättre än mitt. Det avgörande för mig är att Skapa-arket ger ansökningsloggning
en väg i navet, vilket är exakt den koppling jag efterlyste. Ingen kompromiss
behövs.

**2. Notisklockan: jag går på förslaget, med en precisering.** Behåll klockan
och fyll den med uppföljningsnotiser. Men "dölj när tom" får inte betyda att
den försvinner och dyker upp igen, eftersom ett element som flyttar sig i
headern är värre än ett tomt. Min precisering: klockan är alltid synlig men
utan badge, och vid klick visar den tomma tillståndet enligt sidmallen med
meningen "Inget nytt just nu. Vi hör av oss när en ansökan blivit tyst för
länge." Då lovar vi något konkret i stället för att visa en tom yta.

**3. Snabbåtgärder: jag går på förslaget.** Kort i tillstånd B, en rad i
tillstånd C. Det var min position i praktiken, och uppdelningen per tillstånd
löser upptäckbarhetsinvändningen som jag själv skrev att jag inte hade data mot.
Enda tillägget: raden i tillstånd C ska rankas av befintliga `useUnusedFeatures`,
inte vara statisk, annars blir den blind efter tredje besöket.

**4. Huvudsiffra: jag går på förslaget, det är mitt eget.** Fyra beskrivande
antal, ingen svarsfrekvens på hemskärmen, meningen i stället för nollraden. Att
möta "0 procent svarsfrekvens" varje morgon när man är arbetslös är den enskilt
mest demoraliserande sak vi kan bygga. Att svarsfrekvensen bor på
ansökningssidan, dit man går aktivt för att analysera, är rätt avvägning mellan
ärlighet och omsorg.

**5. Gamification: jag ger mig, ta bort allt.** Jag skrev själv att jag ger upp
gamification om någon argumenterar att registret är fel, och sammankallande gör
det övertygande. Rabattstegen och XP för att klicka på sin egen XP är
argument jag inte kan bemöta. Ett villkor, inte en kompromiss: borttagningen
måste ta med `AchievementManager` i `dashboard/layout.tsx` och XP-anropen i
`letters/route.ts` och `cv/jobs/[jobId]/route.ts`, annars fortsätter systemet
skriva till `xp_history` och `global_user_stats` utan att någon yta läser dem.
Halvvägs borttagen gamification är sämre än båda alternativen.

**6. Streak: jag går på förslaget, bort från hemskärmen.** Jag kallade den
själv min svagaste position, och med konflikt 5 avgjord faller den av sig
själv. Jag vill dock att ersättningen faktiskt byggs: "3 ansökningar den här
veckan" i statusraden är den progression användaren behöver, och den är redan
med i wireframen i avsnitt 4. Utan den tar vi bort en känsla av framsteg utan
att sätta något i stället.

## 2. Tre övriga invändningar

**A. `weekly_digest` ligger i våg 2 men borde ligga i våg 1.** Den är märkt M
tillsammans med uppföljningsnotisen och beror inte på någon strukturell ändring:
datan finns i `job_applications`, runnern finns, mallayouten finns. Samtidigt är
den enda åtgärden i hela planen som når de 304 konton som inte öppnar appen, och
alltså den enda som kan väcka en sovande bas medan våg 2 och 3 byggs. **Förslag:**
dela punkt 16, lägg `weekly_digest` som punkt 9 i våg 1 och låt uppföljningsnotisen
i appen ligga kvar i våg 2 där den hör ihop med ansökningssidan.

**B. Planen saknar en avregistreringsväg för `weekly_digest`.** Vi lägger till
ett återkommande mail till en målgrupp som ofta är arbetslös, och den som fått
jobb ska kunna säga stopp utan att tappa transaktionsmailen. `unsubscribe.ts`
finns redan men täcker inte en per-maltyp-inställning. **Förslag:** lägg till i
avsnitt 8 att veckomailet har en egen avregistreringslänk som bara stänger
digesten, plus en rad i profilen, och att mailet slutar skickas automatiskt efter
fyra veckor utan inloggning i stället för att mala vidare. Ett mail man inte kan
stänga av blir spam oavsett innehåll.

**C. Tomma tillståndet i avsnitt 3 saknar ett fall som planen själv skapar.**
När ansökningssidan blir produktens centrum möter varje befintligt konto med
sparade brev men noll loggade ansökningar en tom sida, och det är merparten av de
304. `BackfillBanner` finns men dismissas idag till localStorage utan utgång.
**Förslag:** skriv in i avsnitt 5 att ansökningssidans tomma tillstånd, när
användaren har sparade brev, visar importvägen som primär handling ("Vi hittade 11
brev. Lägg in dem som ansökningar") i stället för det generiska tomma tillståndet,
och att banderollen snoozas 30 dagar i stället för för alltid.

## 3. Övrigt godkänt

Övrigt godkänt.
