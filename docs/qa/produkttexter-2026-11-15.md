# Produkttexter som inte stämmer med koden, 2026-11-15

Arbetslista för copywritern (punkt 1 i svepet). Underlag: produktsvep mot koden, saas-leads beslut och samordnarens kontroller. Allt ska vara live före 23 nov (kampanjfrys).

## Fastslaget (kontrollerat i koden eller i produktion)

- **Bli upptäckt är gratis för alla** (saas-lead, beslut B). Ingen spärr i koden; menyspärren och betalväggsvarianten är borttagna i kod. Premiumlistans rad ersätts med något som är sant och spärrat: intervjuprovet utan dagsgräns (gratis: ett per dygn) och testhistoriken.
- **Rekryterare ser aldrig råpoäng.** Under 25 testade visas bara nivån. Samordnaren har lagt in "Nivån slutförd" (rekryterarprofilen) och "Slutförd" (jämförelsen); copywritern godkänner eller byter.
- **Jobbmatchningen körs när sidan öppnas**, inte nattligt. Annonserna hämtas tre gånger per dygn. Gratis 3 träffar, Premium de 25 bästa (inte "alla").
- **CV-analysen**: läser bara CV:t, en gratis analys per konto, Premium obegränsat. En poäng 0-100 (modellens bedömning, inga trösklar). Förslagen kommer i flikarna Profil, Roller, Kompetenser och Automatiskt; de allmänna förslagen taggas Struktur, Formatering, Innehåll och Nyckelord; varje förslag har en vikt 1-5. Inga betyg per kategori, inget mejl när analysen är klar (resultatet visas på skärmen efter 30-60 sekunder). Prompterna är på svenska; inget belagt stöd för engelska. Ingen jämförelse av CV-versioner sida vid sida.
- **Brev**: första gratis, sedan ett per rullande sju dygn. Texten kan läsas och kopieras gratis, nedladdning kräver Premium. Fem toner, plus automatiskt tonval i Premium. Sju brevmallar.
- **Jobbcoachen**: 10 gratis meddelanden per konto, de kommer inte tillbaka. Att bifoga CV och spara samtal är inte spärrat. Kunskapsbasen är cirka 50 dokument och uppdateras inte löpande; den hämtar inte SCB-data direkt.
- **CV-byggaren**: ingen LinkedIn-import (bara ett fält för LinkedIn-adressen; en LinkedIn-PDF kan laddas upp som vilket CV som helst; LinkedIn-optimeringen i Premium kan spara resultatet som CV). Utkastet sparas bara i webbläsaren tills man sparar i sista steget.
- **Uppsägning** är inte "ett klick": man väljer en anledning, får ett erbjudande och säger upp i Stripes portal. Säg i stället "Säg upp när du vill under Profil och Prenumeration, ingen bindningstid."
- **Radering av konto**: man skriver en bekräftelse under Inställningar. Sedan 2026-11-15 tar raderingen bort kontot, all data i databasen och de uppladdade CV-filerna (kod ändrad i src/lib/konto/raderaKonto.server.ts). Kvitton finns kvar hos Stripe (bokföringskrav).
- **Var data ligger**: all data lagras i EU (ägarens besked 2026-11-15). Uppgiften om USA i en tidigare version av listan var fel och är struken. Ändra aldrig texter om datalagring utan ägaren.
- **Säkerhet som stämmer**: all trafik går över HTTPS (TLS), lösenord hanteras av Supabase Auth och lagras hashade, åtkomst till data styrs per användare med radnivåsäkerhet (Row Level Security) i databasen, CV-filerna ligger i en privat lagringshink, betalningar hanteras av Stripe och vi ser aldrig kortnummer.
- Vid uppladdning finns en samtyckesruta för behandling, inget särskilt intygande om känsliga uppgifter.

## Ställen att ändra (fil:rad i arbetskopian, nuvarande text)

Word-mallar och Word-export av CV eller brev: RÖR INTE (eget spår). Lämna alla Word-ord som de står, även i rader du ändrar av andra skäl.

### Bli upptäckt (saas-lead)
1. src/lib/plans/plans.ts:97 `'Bli upptäckt av rekryterare, anonymt'` -> rad om intervjuprovet utan dagsgräns och testhistoriken, samma längd som grannraderna. (Test: src/lib/plans/__tests__/paketnamn.test.ts:180 kräver /Bli upptäckt/, uppdatera testet.)
2. src/components/artiklar/reklam/reklam-copy.ts:240-241 `'Bli upptäckt av rekryterare'` -> samma innehåll som 1, kortare.
3. src/app/(public)/priser/components/priser-data.ts:177-182 jämförelseraden Bli upptäckt (gratis NEJ) -> båda ja, eller ersätt raden med intervjuprovet (gratis "1 om dagen", Premium "Utan tak"). Rad 200 FAQ: ta bort Bli upptäckt och "varje natt".
4. src/app/(public)/verktyg/bli-upptackt/components/bli-upptackt-faq-data.ts:25-26 -> det kostar inget, profilen och synligheten är gratis; Premium bara för det som är Premium (alla testnivåer gör profilen starkare). Ingen "jobbmatchning varje natt".
5. src/app/(public)/verktyg/bli-upptackt/page.tsx:52 (serviceSchema.description sista meningen) och :60-65 (offers med pris 149: ta bort helt, ett Offer med pris på en gratis tjänst är fel), :143-145 slutpanelen (eyebrow "Jobbcoach Premium, 149 kr i månaden" och texten om att synligheten ingår i Premium) -> gratis, anonym tills du svarar.
6. src/app/(public)/verktyg/bli-upptackt/layout.tsx:7 description sista meningen "Ingår i Jobbcoach Premium, 149 kr i månaden." -> stryk eller "Kostar inget." (title och h1 orörda)
7. src/app/(public)/funktioner/FunktionerSida.tsx:245 Premiumblockets ingress utan Bli upptäckt, med intervjuprovet; länken "Om Bli upptäckt" (rad ~273-275) ut ur Premiumblocket.
8. src/components/pricing/paket-copy.ts:514, 517, 682 ledet "och Bli upptäckt" stryks eller byts mot intervjuprovet.
9. src/lib/onboarding/program.ts:75, 103, 112, 119 Bli upptäckt ut ur ingår/ingårInte-listorna.
10. src/lib/onboarding/komigang.ts:500, 532 stryk ledet om Bli upptäckt bland det Premium öppnar.
11. src/components/registrering/registrering-copy.ts:260 (Bli upptäckt som Premium).
12. content/artiklar/verifierade-testresultat-vs-cv.mdx:23 och :101 "...när minst 25 har gjort testet och annars som andel rätt" -> "...när minst 25 har gjort testet, innan dess bara vilken nivå du slutfört."
13. Godkänn eller byt rekryterarvyns texter: src/app/rekryterare/components/profile/ProfileSections.tsx `'Nivån slutförd'`, src/app/rekryterare/jamfor/page.tsx `'Slutförd'`.

### Jobbmatchning "varje natt"
14. src/lib/plans/plans.ts:95 `'Jobbmatchning varje natt, alla träffar med skälen'`
15. src/components/publikt/start/Startsidan.tsx:273 "varje natt får du de 25 bästa träffarna"
16. src/components/pricing/paket-copy.ts:276 "Kör när du vill, och varje natt får du..."
17. src/app/(public)/verktyg/jobbmatchning/page.tsx:201 "Alla 25 träffar varje natt ingår i Premium" och :319 "Alla träffar, varje dag, ingår i Premium"
18. src/app/(public)/funktioner/FunktionerSida.tsx:83 "får du de bästa träffarna varje natt"
19. src/components/artiklar/reklam/reklam-copy.ts:239 'Jobbmatchning varje natt, med skälen utskrivna'
20. src/components/registrering/registrering-copy.ts:55 och :259
21. src/components/publikt/telefon/skarmar/SkarmBana.tsx:17 och SkarmMatchning.tsx:15 (telefonbilderna "träffar i natt", "nya i natt")
22. src/lib/onboarding/paket-rader.ts:174-175 'Alla träffar per natt, med skälen' / 'Tre träffar per natt' (test: src/lib/onboarding/__tests__/komigang.test.ts:198)
23. src/lib/jobmatching/freeLimit.ts:2-4, 11 kommentarerna.

### CV-analysen
24. src/app/dashboard/cv-analys/components/CVAnalysisIntro.tsx:109 "Som gratisanvändare får du en ny var tredje dygn." -> en analys per konto, att köra om ingår i Premium. Rad 66 och CvAnalysClient.tsx:179 "på 30 sekunder" -> under en minut.
25. src/app/(public)/verktyg/cv-analys/components/cv-analys-faq-data.ts: rad 16 (sex kategorier, mejl när klar), 20 (trösklar 70/80/90), 24 (sex kategorier, poäng per punkt), 28 (engelska), 36 (versioner sida vid sida), 40 (EU, radera med ett klick, även våra kopior). Rad 44 "PDF eller Word": rör inte Word-delen.
26. src/app/(public)/verktyg/cv-analys/page.tsx:42, 52, 87, 139, 145 och layout.tsx:7, 13 "sex kategori-betyg", "sex kategorier (...)", "{ tal: '6', text: 'kategorier med betyg' }" -> en poäng 0-100 och förslag per flik; byt talet 6 mot något sant (t.ex. 30-60 sekunder).
27. src/app/(public)/exempel/components/ExempelCTABand.tsx:41 och ExempelHurAnvanda.tsx:26 "Ett brev om dagen och en CV-analys var tredje dag, helt gratis." -> första brevet gratis, sedan ett i veckan, en CV-analys per konto.
28. src/lib/email/lifecycle/templates/komigang.ts:152, 167: analysen utgår inte från rollen du söker; nyckelord för rollerna i ditt CV.

### Integritet och säkerhet
29. src/app/(public)/integritetspolicy/page.tsx:198 platshållaren "[Exempel: SSL/TLS-kryptering, hashade lösenord]" -> verklig text enligt "Säkerhet som stämmer" ovan.
30. integritetspolicy/page.tsx:212 platshållaren "[Specificera eventuell fördröjning eller backup-policy om relevant]" -> vad som raderas (kontot, databasen, CV-filerna), att kvitton finns kvar hos Stripe. Påstå inget om säkerhetskopior.
31. integritetspolicy/page.tsx:102 "(Exempel)" i rubriken "Användningsdata (Exempel):" stryks.
32. integritetspolicy/page.tsx:144-156 leverantörslistan: lägg till Vercel (drift), Resend (mejl), PostHog (analys, EU) (datalagringen anges som EU, ägarens besked).
33. integritetspolicy/page.tsx:127 och src/app/(public)/anvandarvillkor/page.tsx:135 "intygar vid uppladdning" -> det finns bara en samtyckesruta; skriv att vi ber dig ta bort känsliga uppgifter innan du laddar upp.
34. EU-löften och "radera med ett klick, även våra kopior": cv-analys-faq-data.ts:40, src/app/(public)/funktioner/FunktionerSida.tsx:79, src/components/publikt/start/Startsidan.tsx:122. Sök efter fler ("lagras i EU", "inom EU", "ett klick") i src/app/(public) och src/components.

### Uppsägning "ett klick"
35. src/components/pricing/paket-copy.ts:161, 323, 569-571; src/app/(public)/priser/page.tsx:105; priser-data.ts:205, 215; Startsidan.tsx:360; src/components/landing/LandingNavbar.tsx:201; reklam-copy.ts:272; src/lib/onboarding/program.ts:113, 122.

### Övrigt
36. src/app/(public)/verktyg/personligt-brev/page.tsx:100, 110, 145 och layout.tsx:14, 24 "sex tonaliteter/toner/tonlägen" -> fem toner, plus automatiskt tonval i Premium. layout.tsx:24 "Första brevet gratis. PDF eller Word, du väljer." -> gratis att läsa och kopiera, nedladdningen ingår i Premium (lämna ordet Word om du behåller formatet; rör inte Word-påståendet i sig).
37. src/components/publikt/innehall/exempel/ExempelMall.tsx:94 'Sex mallar' för brev -> sju (eller läs talet från LETTER_TEMPLATES i src/lib/letters/letter-templates.ts).
38. src/app/(public)/verktyg/rekryteringstester/layout.tsx:26, 37 "Tre tester gratis" -> grundnivån gratis.
39. src/app/(public)/verktyg/jobbcoachen/components/jobbcoachen-faq-data.ts:40 "spara dina samtal eller bifoga ditt CV" (inte spärrat) -> "fler än tio frågor". Samma fil och src/app/(public)/verktyg/jobbcoachen/page.tsx:16: "uppdateras löpande", "hämtar SCB-lönedata direkt" -> stryk eller säg sant (kunskapsbas om svensk arbetsmarknad, svaren anger källa).
40. src/app/dashboard/jobbcoachen/JobbcoachenClient.tsx:215 'Chatten öppnar igen efter midnatt' -> dina tio meddelanden är använda.
41. LinkedIn-import: src/app/(public)/verktyg/skapa-cv/page.tsx:33-34, 71; src/app/(public)/verktyg/skapa-cv/components/skapa-cv-faq-data.ts:32, 39-40 (bara LinkedIn-raderna, Word-raderna rörs inte); src/app/(public)/verktyg/cv-mallar/page.tsx:59. Säg: ingen direktimport; ladda upp ditt CV eller en PDF av profilen; i Premium kan LinkedIn-optimeringen spara resultatet som CV.
42. skapa-cv: "Börja på bussen och fortsätt vid datorn hemma" (utkastet ligger bara i webbläsaren tills det sparats) -> stryk eller säg att det sparas i kontot när du sparar.
