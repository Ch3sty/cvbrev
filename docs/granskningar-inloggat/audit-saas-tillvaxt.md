# Granskning: tillväxt, konvertering och intryck

Perspektiv: SaaS-tillväxt. Underlag: faktisk kodläsning av `src/app/dashboard/**` och `src/components/dashboard/**` på main.

## 1. Helhetsbedömning

En ny användare möter dag 1 en genomtänkt, lugn yta (tillstånd A och B följer designsystemet) men har ingen aning om att hon fått fem dagar Premium värt 149 kr, och hon får därför aldrig chansen att sakna det. En aktiv användare i tillstånd C möter i stället nio staplade sektioner där tre av dem säger samma sak om samma elva ansökningar, i tre olika designgenerationer, och där tyngsta visuella vikten (röd-rosa gradientknapp, `font-black`, `boxShadow`) sitter på de minst viktiga korten. Tjänsten hindras från att kännas framstående av tre saker: den saknar en produktkärna att återvända till dagligen (dashboarden är en verktygskatalog, inte ett jobbsök), den visar 176 `rounded-3xl`, 81 `font-black` och 220 talstreck som säger "hemmabyggt över tid", och den säljer på fel ställen med fel löften. Räknat i affär: 304 konton och 3 betalande är inte ett prisproblem, det är ett värdeproblem, för produkten levererar enskilda AI-utdata men aldrig en pågående process som är dyr att lämna. Den enda frågan som betyder något för konvertering är "vad går jag miste om dag 6", och den besvarar produkten idag med tystnad.

## 2. De tio viktigaste problemen

**1. Reverse trial säljs aldrig in, och avslutas utan konsekvens.** `TrialStatusRow` visar en 10 px hög rad "Premium aktivt · 4 dagar kvar" som är visuellt svagare än allt annat på skärmen. Ingen någonstans säger vad Premium innehåller under de fem dagarna, och `UpgradeSheet` triggas först dag 4 till 5. Vi ger bort vår enda produktupplevelse utan att märka den. Konvertering: detta är hela reverse trial-modellens mekanism, och den är avstängd.

**2. Prenumerationssidan lovar en trial som inte finns.** `PrenumerationHero` `FreeHero` säger ordagrant "Prova gratis i 7 dagar" och "0 kr första 7 dagarna", till en användare som just förlorat sin femdagarsperiod. `ProfileHero` och `PremiumGateModal` upprepar "Testa Premium gratis i 7 dagar". Vi ljuger på säljsidan, och den som klickar möter fyra prisalternativ utan trial. Förtroende: värsta möjliga plats för en osann utfästelse.

**3. Ingen ansökningsöversikt i centrum.** Sökta tjänster är den enda funktionen i produkten som skapar dagligt återkommande värde och en databas användaren inte vill lämna. Den ligger som fjärde sidebar-rad, som ett snabbåtgärdskort och som en statusrad längst ner. `src/app/dashboard/sokta-tjanster/` har dessutom noll köpimpulser. Retention och konvertering: vi har byggt rätt produkt och gömt den.

**4. Tillstånd C upprepar samma siffra tre gånger.** `DashboardStatusRow` (11 ansökningar), `NastaSteg` (9 utan svar), `SoktaTjansterStatusRad` (11 sökta, 9 väntar) renderas efter varandra i `page.tsx`. Plus `CvStatusCard` och `BliUpptacktStatusRad` som är samma format igen. Tydlighet: fem sektioner med identisk form gör att inget leder.

**5. `StreakOchStatus` visar fel kvoter och säger "Obegränsat".** Komponenten hårdkodar `FREE_LIMITS = { letters: 7, analyses: 1, linkedin: 1 }` medan quotaService kör 1 brev per dag, och skriver "Obegränsat" till premium på tre rader. Det är precis den bugg `UsageStats` rättades för, kvar på dashboarden, en skärm ovanför den rättade `QuotaNudgeRow`. Två kvotvyer med olika siffror på samma sida.

**6. Tre designgenerationer i samma vy.** `NastaSteg`, `CvStatusCard`, `SoktaTjansterStatusRad` och `StreakOchStatus` kör `rounded-3xl`, `font-black`, `border-orange-100`, inline `boxShadow` och `linear-gradient(135deg, #F97316, #DC2626)` direkt under `DashboardStatusRow` och `QuotaNudgeRow` som följer designsystemet. `kontakt/page.tsx` och `rewards/page.tsx` kör dessutom lila-rosa gradienttext. Intryck: en användare läser detta som "byggt av olika personer vid olika tillfällen", vilket är exakt vad som händer.

**7. Köpimpulsen ligger efter frustrationen, inte före värdet.** `jobbmatchning` klipper listan vid 10 träffar och säger "Uppgradera för 149 SEK/månad". `tester` skickar hela kortklicket till prenumerationssidan så man inte ens får se vad testet är. Det är den sämsta ordningen: vi tar betalt innan användaren fått känna att hon vill ha det. `cv-mallar` gör det rätt (mallen renderas, spärren sitter på nedladdningen), `mina-brev` likaså.

**8. Snabbåtgärder är en verktygslista som aldrig förändras.** Sex kort som ser likadana ut dag 1 och dag 90, med copy som "Score och förbättringar direkt". En användare som redan kört CV-analys tre gånger ser samma kort lika stort. Retention: ytan lär inte användaren något om var hon är i sitt jobbsök.

**9. Ingen progression och inget resultat.** XP och belöningar finns (`rewards/page.tsx`), men de mäter aktivitet i vår app, inte framsteg i jobbsökandet. Ingen plats säger "du har sökt 11 jobb, 3 svar, det är 27 procent svarsfrekvens, snittet är 12". Den som betalar 149 kr vill se att hon rör sig, inte att hon är Novis på nivå 1.

**10. Sidebaren har tolv likvärdiga rader och FAB:en pekar alltid på brev.** Tolv rader där "LinkedIn" väger lika mycket som "Sökta tjänster". Mobilens FAB går alltid till skapa brev, oavsett att den vanligaste dagliga handlingen för en aktiv användare är att logga en ansökan. Mobilen är halva trafiken.

## 3. Förslag

### Görs om från grunden

**A. Dashboarden blir "Mitt jobbsök", inte en verktygskatalog.** En vy, tre zoner, ingen upprepning. Allt som handlar om ansökningar slås ihop till en enda pipeline-yta.

```
+---------------------------------------------------------------+
| Premium aktivt · 4 dagar kvar                      Vad ingår   |  rad, h-10
+---------------------------------------------------------------+
| Ditt jobbsök i september                                       |
|                                                                |
|  11 sökta    9 väntar svar    2 intervju    1 svar             |
|  ---------------------------------------------------------     |
|  Svarsfrekvens 18 %          Senaste ansökan 3 dagar sedan     |
|                                                                |
|  9 ansökningar har varit tysta i över två veckor.              |
|  [ Följ upp ]              Logga en ansökan                    |  en orange knapp
+---------------------------------------------------------------+
| Pågår nu                                                       |
|  Systemutvecklare, Volvo      Väntar svar      17 dagar        |
|  Projektledare, Kommunen      Intervju bokad   2 okt           |
|  UX-designer, Spotify         Väntar svar      4 dagar         |
|                                             Se alla 11         |
+---------------------------------------------------------------+
| Fortsätt där du var                                            |
|  [ Brev till Volvo, utkast ]  [ CV-analys, 3 förslag kvar ]    |
+---------------------------------------------------------------+
| Verktyg                                                        |
|  Brev · Jobbmatchning · CV-analys · Tester · LinkedIn · Coach  |  kompakt rad
+---------------------------------------------------------------+
```

Detta ersätter `DashboardStatusRow`, `NastaSteg`, `SoktaTjansterStatusRad`, `CvStatusCard`, `BliUpptacktStatusRad`, `StreakOchStatus` och `DashboardSnabbAtgarder` med tre sektioner. Effekten är att dashboarden får ett skäl att öppnas varje dag, och att den siffra vi visar (svarsfrekvens) är den enda siffra en jobbsökare bryr sig om.

**B. Trial dag 1 till 5 blir en egen upplevelse.** Dag 1 en rad som säger vad hon fått, inte att hon fått något: "Du har Premium i fem dagar. Ladda ner så många brev du vill." Dag 2 till 3 tyst. Dag 4: raden byter till orange och `UpgradeSheet` får sin förlustsummering byggd på faktisk användning (planen beskriver detta, `showLossSummary` finns i `TrialStatusRow`, men mekaniken saknar användningslogg). Dag 6: `DowngradedNotice` med exakt vad som ändrats, en gång.

**C. Prenumerationssidan skrivs om.** Gratisläget: en rubrikrad (ingen gradienthero), `UsageStats` som redan är rättad, `PlanCards`, `GratisMotPremium`, FAQ. Premiumläget: statusrad, `UsageStats`, `ManageSubscriptionCard`, inget annat. `PrenumerationHero`, `PremiumFeaturesGrid` och `TrialCTACard` tas bort helt.

### Justeras

- `QuotaNudgeRow` behålls som den är (den är rätt byggd) och blir enda kvotvyn.
- `PaywallCard` behålls oförändrad, men `jobbmatchning` och `tester` byter till den: matchningslistan visar alla träffar med de sista suddade och gaten under, testkortet öppnar alltid testet och gaten kommer vid tredje sessionen.
- Sidebaren: fyra rader i kärnflödet där "Jobbsök" (sökta tjänster) ligger först efter Översikt, verktygen kollapsas till en grupp, Konto sist. Rewards flyttas in under Profil.
- Mobil-FAB blir kontextuell: logga ansökan när användaren har ansökningar, skapa brev annars.
- Copyrensning i ett svep: 220 talstreck, 14 förekomster av "Obegränsat", "i realtid" i jobbmatchning (datan är cachad Platsbanken), "Prova gratis i 7 dagar" på tre ställen.

### Tas bort helt

`NastaSteg` (uppgår i pipeline-ytan), `CvStatusCard` (CV-status hör hemma på CV-sidan), `SoktaTjansterStatusRad`, `BliUpptacktStatusRad`, `StreakOchStatus`, `CvUnlocksFlow` ("Du har låst upp 4 funktioner" säger användaren ingenting), `PremiumFeaturesGrid`, `PrenumerationHero`, `TrialCTACard`, `FeatureSpotlight`, och den lila-rosa gradientkosmetiken i `kontakt` och `rewards`.

## 4. Tre saker jag inte kompromissar om

**1. Ansökningsöversikten är produktens centrum, inte en flik.** Allt annat vi bygger är engångsutdata som konkurrenterna också har. Det enda som gör 149 kr per månad rimligt är att data om användarens jobbsök samlas hos oss och blir dyrare att lämna för varje vecka. En tjänst där kunden har elva ansökningar, tre intervjuer och en historik säger inte upp sig i mars.

**2. Löften om trial måste stämma exakt.** "Prova gratis i 7 dagar" på en sida där det inte finns någon trial är inte ett copyfel, det är en förtroendeskada hos exakt den användare som var beredd att betala. Detta rättas före allt annat i denna lista.

**3. Vi säljer aldrig innan värdet visats.** Mallen renderas innan nedladdningen spärras. Analysen visar tre fynd innan resten låses. Testet öppnas innan taket slår till. Matchningarna syns innan listan klipps. Varje spärr som ligger före upplevelsen lär användaren att vi är en betalvägg med en produkt bakom, i stället för tvärtom.

## 5. Tre saker jag gärna ger upp

**1. Att belöningar och XP ska bort.** Jag ser dem som aktivitetsteater, men om retention-experten visar att streaken faktiskt driver återkomst för den här målgruppen, som ofta söker jobb i en tung period, backar jag. Då ska de bara flyttas ur dashboardens huvudflöde.

**2. Att svarsfrekvens ska vara den siffra vi lyfter.** Den kan upplevas som ett betyg på användaren snarare än på hennes sökande, och en jobbsökare med 0 svar på 20 ansökningar kanske inte ska mötas av det varje morgon. Ett UX-argument om en mjukare huvudsiffra väger tyngre än min.

**3. Att verktygen ska kollapsas till en rad längst ner.** Om någon visar att snabbåtgärdskorten faktiskt driver första klicket för nya användare, ska de vara kvar som kort i tillstånd B och bara kollapsa i tillstånd C.
