# Plan: För rekryterare, B2B-sidan av Bli upptäckt

Skapad 2026-07-06. Bygger på kandidatsidan (docs: se minnesanteckning
project_bli_upptackt samt /dashboard/bli-upptackt som lanserades samma dag).
Strategin: kandidatpoolen fylls först, rekryterarprodukten lanseras när
poolen har volym. Landningssidan byggs NU för att samla leads och validera
efterfrågan innan portalen finns.

## Kandidatvisningens två nivåer (designbeslut)

- **Träffkortet** (byggt): kompakt sammanfattning för att skanna poolen —
  roll, region, verifierade testbadges med percentiler, personlighetsstyrkor,
  toppkompetenser, villkor.
- **Kompletta profilen** (fas 3): klick på kortet öppnar detaljvyn med
  arbetshistorik (titel, period, bransch, arbetsuppgifter ur structured_data),
  utbildning, alla testresultat, personlighetsstyrkor och villkor.
  **Integritetsregel:** i anonymt läge maskeras arbetsgivarnas namn
  ("större bank i Stockholm") tills kandidaten accepterat kontakt — en
  komplett historik med företagsnamn identifierar en person lika säkert som
  namnet. Namn, foto och kontaktuppgifter låses upp först vid accepterad
  kontakt.

## Fas 1: Landningssidan /for-rekryterare (byggs nu)

**Syfte:** lead-insamling + efterfrågevalidering innan portalen finns.
CTA är "Ansök om tidig åtkomst", inte "Skapa konto".

Innehåll (effektfull, i sajtens designspråk):
1. Hero: "Kandidater med bevisade färdigheter" — poängen som LinkedIn inte
   kan matcha: verifierade testresultat med percentiler på varje kandidat.
2. Värdeprops (för rekryteraren): förscreenade kandidater (kognitiva tester
   + personlighetsstyrkor), aktiva arbetssökande (inte passiva profiler),
   villkorsfiltrering (tillträde, arbetsplats, region, körkort) som dödar
   mismatch-kontakterna, anonym först = högre svarsfrekvens när kandidaten
   själv sagt ja.
3. Så funkar det, tre steg: sök i poolen → visa intresse → kandidaten
   svarar och profilen låses upp.
4. Exempelkort: ett par avidentifierade träffkort (samma komponent som
   förhandsvisningen) så produkten känns konkret.
5. Trust-sektion: GDPR-först-designen som säljargument (samtycke,
   anonymitet, verifierade rekryterare).
6. Lead-formulär: företag, org-nummer, kontaktperson, e-post, vilka roller
   de rekryterar, volym per år. Sparas i `recruiter_leads` + notis/mail till
   admin. Bekräftelsemail till leadet (Resend-infran finns).
7. Nav: "För rekryterare" i publika headern + footern.

**Mätning:** leads per vecka är valideringssignalen som avgör när fas 2-4
prioriteras.

## Fas 2: Rekryterarkonto och inloggning

- `recruiter_profiles`-tabell: user_id (auth.users), company_name, org_nr,
  contact_role, verified_at, verified_by (admin), status
  (pending/approved/rejected). Samma auth-pool som övriga användare,
  kontotypen avgörs av att raden finns + är godkänd.
- **Verifiering är manuell i början:** admin godkänner mot org-nummer
  (allabolag-koll) i en ny adminsektion. Manuellt skalar gott till 50+
  rekryterare och är säljsamtal på köpet.
- Egen layout `/rekryterare/*` (eget skal, inte kandidat-dashboarden),
  middleware som routar per kontotyp. Rekryterarkonton har INTE tillgång
  till kandidatfunktionerna (brev, tester osv.) och vice versa.
- Onboarding efter godkännande: bekräfta företagsuppgifter, roller man
  rekryterar för (ger sökdefaults).

## Fas 3: Kandidatpool + intresseflödet

- Söksida: serverside-filtrering på candidate_profiles där visibility <>
  'off' (partial index finns redan). Filter: yrkesroll/bransch, region,
  tillträde, arbetsplats, omfattning, körkort, percentilgolv per testfamilj,
  personlighetsstyrka. Serverside-API med rekryterar-auth, aldrig rådata
  till klienten utöver träffkortens fält.
- Detaljprofil enligt designbeslutet ovan (maskerade arbetsgivare).
- Intresseflödet: `candidate_interests` (recruiter_id, candidate_user_id,
  message?, status pending/accepted/declined, tidsstämplar).
  Kandidaten får in-app-notis + mail ("En rekryterare vill komma i kontakt
  med dig" — starkaste comeback-mailet, mailinfran klar). Accept → namn +
  kontaktväg låses upp för bägge; avböj → rekryteraren ser bara "avböjt".
  Kandidatens Bli upptäckt-sida har redan intresse-ytan som tom vy.
- Missbruksskydd: rate limit på intressen per rekryterare, rapportera-knapp,
  admin kan stänga av konton.

## Fas 4: Betalning (B2B)

- Beta: gratis med begränsning (t.ex. 5 intressen/mån) mot feedback.
- Sedan Stripe-produkter separat från konsumentprenumerationen
  (t.ex. per säte och månad, årsfaktura för team). Prissättning bestäms av
  betaanvändarnas beteende — inget pris på landningssidan i fas 1, bara
  "kontakta oss".

## Fas 3.5: Profildjup som säljer (beslutad 2026-07-06 efter granskning)

Problem: träffkorten svarar inte på rekryterarens första fråga (senioritet),
och landningssidan visar aldrig detaljprofilens djup — värdet är osynligt
där köpbeslutet fattas.

**Del 1: Berika datat (kort + detaljprofil):**
- `yearsOfExperience`: beräknas ur arbetshistorikens perioder i
  structured_data (summerade anställningsperioder, avrundat till hela år).
  Visas på träffkortet: "8 års erfarenhet".
- `latestRole`: senaste titel + hur länge ("Senast: Redovisningsansvarig,
  4 år") på kortet. Arbetsgivarnamn fortsatt maskerat.
- `educationLevel`: högsta examen ur structured_data på kortet.
- Språk ur structured_data i detaljprofilen.
- Percentiltolkning i detaljprofilen: "Topp 10 % av N testade" + en
  förklaringsrad om vad kognitiva test förutsäger.
- **Kandidatens pitch**: nytt fält i candidate_profiles (max ~280 tecken)
  som kandidaten skriver själv på Bli upptäckt-sidan. Visas överst i
  detaljprofilen. VIKTIGT: vi använder INTE CV:ts summary rakt av — den
  innehåller ofta namn/arbetsgivare som skulle läcka i anonymt läge.
  Egenskriven pitch är säker, och dessutom en engagemangsyta.

**Del 2: Landningssidan visar hela profilen:**
- Ny sektion "Så ser hela profilen ut" med en statisk men verklighetstrogen
  detaljprofil-mock: pitch, arbetshistorik-tidslinje med maskerade
  arbetsgivare ("Visas efter accepterad kontakt"-chips som poäng, inte
  brist), utbildning, testpanel med percentiltolkning, villkor.
- Exempelträffkorten uppdateras med senioritet/utbildning.

**Del 3: Portalen:** samma berikade fält i pool-korten, sortering på
profilkomplett het/senioritet.

Ordning: Del 1 (datat) → Del 3 (portalen) → Del 2 (landningssidan, så
mocken speglar den riktiga profilen).

## Beroenden och ordning

Fas 1 är oberoende och byggs direkt. Fas 2-4 väntar på kandidatvolym
(mätvärde: antal synliga profiler i poolen) OCH lead-signal från fas 1.
Concierge-mellansteget (manuell matchning av leads mot poolen via admin)
kan börja så snart båda kurvorna rör sig, före fas 3-bygget.
