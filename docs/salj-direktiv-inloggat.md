# Säljdirektiv: det inloggade läget

Underlag: kodgenomgång på main (3e412e51) plus siffror från prod (307 konton).
Mottagare: UX-specialisten. Ingen kod är ändrad i den här omgången.

## 1. Försäljningsanalys per tillstånd

### Var användaren ser Premium idag
Efter dagens omgång finns tre permanenta ytor: sidebarraden "Premium" med status
(`Sidebar.tsx`), profilsidans kort "Plan & konto" (`ProfileOverviewCards.tsx`) och
prenumerationssidan. Utöver det dyker `PaywallCard` upp i flödena och
`TrialStatusRow` överst på dashboarden. Alla sekundärlänkar går numera in-app.

### Trial dag 1-3
Värde: full tillgång, men ingenting säger vad det är värt. `TrialStatusRow` visar
"Premium aktivt, 4 dagar kvar" med länken "Vad ingår". Sidebar visar "4 dagar kvar".
Läcka: användaren möter aldrig en gräns, så hon får ingen referenspunkt för vad
gratisnivån saknar. När nedräkningen börjar betyda något har hon inget minne av
värdet. Vi mäter heller inte vilka Premium-funktioner hon faktiskt använde.

### Trial dag 4-5
`TrialStatusRow` blir orange och "Behåll Premium" öppnar `UpgradeSheet` direkt.
Det är det starkaste säljögonblicket i hela appen. Läcka: sheeten visar fyra
produkter men inget om vad hon förlorar. Jämförelsen `GratisMotPremium` finns
på prenumerationssidan, ett klick bort, men inte i sheeten.

### Gratis dag 6 och framåt
`DowngradedNotice` visas en gång. Sedan är dashboarden tyst tills hon slår i en
kvot. `QuotaNudgeRow` visar bara brevkvoten och bara när den är slut. Läckor:
analys, chatt och tester har kvoter som aldrig syns förrän man blockeras, vilket
gör gratisnivån otydlig snarare än generös. `UsageStats` på prenumerationssidan
säger "Inga gränser, bara översikt" och "Obegränsat" under brev, till en
gratisanvändare. Det är ett direkt felaktigt budskap som underminerar hela säljet.
Etiketten lyder dessutom "Personliga brev denna vecka" trots att modellen är
per dygn sedan kvotsänkningen.

### Betalande
Sidebar visar "Aktiv", prenumerationssidan visar `ManageSubscriptionCard`.
Läcka: ingen uppföljning, ingen uppgradering månad till kvartal, ingen känsla av
att prenumerationen ger något löpande. Risk för tyst churn.

### Engångsköp
Sidebar räknar ner, `TidsbegransadPremiumCard` visar historik och "Förläng".
Läcka: ingen påminnelse när dagspasset närmar sig slutet. `TrialStatusRow` filtrerar
på `premium_source` i trial-listan och visas alltså inte för engångsköp, så den som
köpt ett dagspass ser ingen nedräkning på dashboarden alls.

### Strukturella läckor
- **Sidebaren har 13 likvärdiga val** i fyra grupper. Allt väger lika tungt, så
  inget leder. "Belöningar", "Sökta tjänster" och "Förbättra LinkedIn-profil"
  konkurrerar visuellt med kärnflödet CV, brev, analys.
- **Mobilnav saknar Premium helt.** Fyra slots: Hem, Brev, Jobb, Profil.
  Mobilanvändaren har ingen synlig väg till köp utom via profilsidan.
- **Ingen profilmeny i headern.** `header.tsx` är en länk till `/dashboard/profil`,
  ingen dropdown. Kontoåtgärder saknar en samlad plats.

## 2. Direktiv till UX-specialisten

1. **Rätta `UsageStats` så den visar verkliga kvoter per tillstånd**, för att
   gratisanvändare ska se en gräns i stället för ordet "Obegränsat". Byt
   "denna vecka" mot "idag". Mät: andel som klickar vidare till produktkorten
   från prenumerationssidans gratisläge, mål över 15 procent.
2. **Bygg en kvotöversikt i tillstånd C** som visar brev, analys, chatt och
   tester med använt av totalt, alltid synlig och inte bara vid stopp, för att
   göra gratisnivåns tak begripligt före frustrationen. Ersätter `QuotaNudgeRow`.
   Mät: fler uppgraderingar utlösta utan föregående blockering.
3. **Lägg vad-du-förlorar i `UpgradeSheet` när den öppnas från dag 4-5**, tre
   punkter från `GratisMotPremium`, för att köpbeslutet ska kunna tas utan att
   lämna sheeten. Mät: konvertering på "Behåll Premium", mål över 8 procent.
4. **Gruppera om sidebaren till tre nivåer**: kärnflöde överst (Översikt, Mina CV,
   Sparade brev, Nytt brev), sedan Verktyg (analys, mallar, jobbmatchning,
   jobbcoach, LinkedIn, tester), sist Konto (Premium, Profil). Flytta Belöningar
   in i Profil och Sökta tjänster in i kärnflödet först när den har användning.
   Syfte: minska valträngsel så Premium-raden syns. Mät: klickfrekvens på
   Premium-raden.
5. **Ge mobilnav fem slots: Hem, Brev, Jobb, Premium, Profil**, för att mobila
   användare ska ha samma köpväg som desktop. Premium-slotten visar prick när
   trial har två dagar kvar eller mindre. Mät: andel mobila köp av totala köp.
6. **Bygg en profilmeny i headern** med namn, e-post, Premium-status,
   Prenumeration, Profil, Logga ut. Ja, den ska finnas: den samlar kontoåtgärder
   och ger en tredje permanent Premium-yta utan att ta plats i navigationen.
7. **Gör `TrialStatusRow` till en generell premiumstatusrad** som även täcker
   engångsköp och prenumeration, så alla betalande ser sin status. Idag filtrerar
   den bort allt utom reverse trial.
8. **Uppgraderingsimpulser får finnas** på: dashboardens statusrad, kvotöversikten,
   i flödet vid faktiskt stopp, och på prenumerationssidan. De får **inte** finnas
   i: CV-byggarens steg, brevflödets skrivsteg, testresultat innan resultatet är
   läst, eller som modal vid inloggning. Regel: aldrig mer än en säljyta samtidigt
   på samma skärm.
9. **Copy-principer**: säg alltid vad gränsen är i siffror, aldrig "obegränsat"
   till någon som har en gräns. Beskriv värde i tid sparad eller jobb sökta, inte
   i funktionslistor. Inga em-dash. Aldrig Sparkles-ikonen.

## 3. Profildatan

### Vad som faktiskt skrivs
Triggern `handle_new_user` skriver `id`, `email`, `full_name` (fallback
"Ej angivet") och `phone` från `raw_user_meta_data`. Den läser **inte** `name`
eller `avatar_url`, som är vad Google skickar, och aldrig `location`.
`auth/callback/route.ts` kompenserar delvis: den läser `full_name`, `name` och
`avatar_url` och fyller i namnet om triggern missade. Telefon och ort rörs aldrig.

### Verkligt läge i prod (307 konton)
- 172 saknar telefon (56 procent), 294 saknar ort (96 procent), 28 saknar riktigt namn.
- Av 79 konton skapade senaste 90 dagarna saknar 30 telefon.
- **128 konton har telefon men `include_phone_in_letters = false`.** Toggeln
  defaultar till av, så numret finns men når aldrig brevhuvudet. Endast 7 konton
  har den påslagen.

### Var fälten används och vad som går sönder
- **Brevhuvud** (`docx-templates.ts`, `letters/download`): namn faller tillbaka på
  e-postens lokaldel. Telefon och ort kräver både värde och påslagen toggle.
- **CV-byggaren** (`CVCreatorWizard.tsx` rad 244): steg 0 **blockeras** om namn,
  e-post och telefon saknas i både profil och CV-data. Telefon är alltså redan
  obligatorisk, men vi ber aldrig om den.
- **CV-export** (`generate-formatted`, `preview-html`): profilvärden skriver över
  platshållare. Saknas de blir fälten tomma i filen.
- **Jobbcoachen** (`chat/route.ts`): skickar "Stad: Ej angivet" till modellen.
- Parsern (`cv/parse/route.ts`) **extraherar redan telefon och ort** ur uppladdade
  CV, men ingenting skriver tillbaka dem till `profiles`.

### Direktiv
10. **Rätta triggern att läsa `name` och `avatar_url`, och låt callbacken alltid
    kopiera `email` från auth till profiles.** Ta bort "Ej angivet" som fallback,
    lämna hellre null så vi kan upptäcka att fältet saknas. Prio hög, ren bugg.
11. **Skriv tillbaka parsad telefon och ort vid CV-uppladdning** när profilfältet
    är tomt, för att fylla luckan utan att fråga. Detta ensamt bör täcka en stor
    del av de 56 procenten. Visa vad vi hittade och låt användaren rätta.
12. **Sätt `include_phone_in_letters` och `include_location_in_letters` till true
    som default** när värdet finns, för att 128 befintliga konton ska få sina
    uppgifter i brevhuvudet. Användaren kan stänga av.
13. **Lägg ett kompakt profilkort i tillstånd B och C** som listar saknade fält
    med en rad per fält, bara när något saknas, för att fånga det parsern missade.
    Max tre fält, inline-redigering, ingen egen sida.
14. **Spärra aldrig registreringen med fler fält.** Tre fält är rätt. All
    komplettering sker efter att värdet levererats, alltså efter CV-uppladdning
    eller före export.
15. **Obligatoriskt per funktion**: namn och e-post för all export och för
    kandidatprofilen. Telefon för CV-byggaren (redan hårt krav) och för brevhuvud
    som ska se professionellt ut. Ort endast för brevhuvud och jobbmatchning.
    Blockera export om namn saknas, med inline-fält i stället för felmeddelande.
