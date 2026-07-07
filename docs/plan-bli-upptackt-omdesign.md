# Bli upptäckt omdesign + meddelande-hub — implementeringsplan

Grundat i tre UX-genomgångar + godkänd mockup (artifact). Två delar:
(A) lugna om sidan till tvåkolumns med zoner, (B) bygg en riktig meddelande-hub
med egen plats i sidomenyn.

## Del A — Sidan lugnas (page.tsx + korten)

### A1. SectionCard-varianter
- `variant="subtle"`: ingen orange topplinje, `border-slate-100`, ingen skugga,
  mindre padding. För klara/ihopfällda kort.
- Nytt "sammanfattningsläge": när ett hopfällbart kort är ihopfällt OCH ifyllt,
  visa en kompakt summary-row (grön check + rubrik + sammanfattning + Ändra)
  i stället för bara rubrik + chevron. Ex: "Dina villkor · Stockholm · Hybrid ·
  Heltid [Ändra]".

### A2. Slå ihop kort
- **Grunduppgifter** = CvPickerCard + VisibilityModeCard i ETT kort, tunn
  border-t mellan. Två små beslut (vilket CV, vem ser det).
- **Din presentation** = PitchCard + ContextTagsCard i ETT kort (pitch överst,
  taggar under, taggar villkorade som idag).

### A3. ProfileStrengthCard → nästa-steg-nav
- Behåll mätaren överst.
- Visa BARA första oklara steget som ett framträdande "gör detta"-kort med
  genväg (första !done i nuvarande prioordning).
- "Visa alla steg (N kvar)"-knapp expanderar full checklista (default dold).
- Vid 100 %: kort bekräftelse i stället för tom lista.
- computeProfileStrength oförändrad.

### A4. page.tsx tvåkolumns
- Bredda max-w-5xl → max-w-6xl.
- Full bredd överst: MasterHeader, PendingInterestAlert, + genvägskort till
  meddelanden (högt upp, inte i botten).
- Grid `lg:grid-cols-[minmax(0,1fr)_372px]`:
  - Vänster ("Bygg din profil"-zonrubrik): Grunduppgifter, Villkor,
    Din presentation, Verifierade resultat, grundtestare-teaser.
  - Höger sticky ("Så syns du"-zonrubrik): RecruiterPreviewCard +
    ProfileStrengthCard. `lg:sticky lg:top-6 self-start`.
- InterestsCard TAS BORT ur sidan (flyttar till hubben); ersätts av
  genvägskortet högt upp.
- Sticky sätts på wrapper-div, INTE på SectionCard (overflow-hidden krockar).
- RecruiterPreviewCard: inre kortets max-w-md → w-full i 372px-kolumnen.
- Zonrubriker: enkel text + hairline, dubbel space-y mellan zoner.

### A5. Default-collapse smartare (valfritt, våg 2)
- Auto-fäll ihop ett kort EN gång när dess fält blir klart (engångsflagga per
  sektion i user_ui_preferences), användarens egen toggle vinner därefter.
- Verifierade resultat + villkor default öppna på desktop (spegeln tar höjd).

## Del B — Meddelande-hub

### B1. Route + hub
- Ny route `/dashboard/meddelanden/page.tsx` (egen destination, ej inbäddad).
- `src/components/interests/MessageHub.tsx`: orkestrerar, hämtar
  /api/candidate/interests, håller selectedId (ur ?interest= eller state),
  desktop tvåpanel / mobil lista→tråd.
- `ConversationList.tsx` + `ConversationListItem.tsx`: grupper pending/aktiva/
  avböjda, olästbadge, snippet, tid, accept/avböj direkt i pending-rader.
- Trådvyn: återanvänd InterestThread-logiken (bubblor/skicka), lägg
  ConversationHeader (företag+kontakt+mejl/tel/webb) ovanför, dagsgruppering,
  avatar på deras bubblor, tomt läge "Säg hej", pending-panel (accept/avböj +
  citat) när status !== accepted.
- Mobil: ContactSheet (bottom sheet) för kontaktinfo.

### B2. Sidomeny + kopplingar
- Sidebar.tsx: ny post "Meddelanden" (MessageSquare-ikon) under Bli upptäckt,
  med olästbadge (summa unreadCount + pending-antal från
  /api/candidate/interests, self-fetch som RecruiterSideNav-badgen).
- PendingInterestAlert.tsx: href → /dashboard/meddelanden.
- Notiser (recruiter_interest, interest_message): action_url →
  /dashboard/meddelanden?interest=<id>.
- InterestsCard tas bort ur Bli upptäckt (logiken lever i hubben).

### B3. Litet backend-tillägg (läst-status)
- messages GET returnerar motpartens last_read_at så klienten kan visa
  "✓✓ Läst" på egna meddelanden. Allt annat finns.

## Byggordning
1. SectionCard subtle + summary-row (A1)
2. Slå ihop Grunduppgifter + Din presentation (A2)
3. ProfileStrengthCard nästa-steg (A3)
4. page.tsx tvåkolumns + zoner + genväg + ta bort InterestsCard (A4)
5. Meddelande-hub: route, MessageHub, ConversationList, trådvy (B1)
6. Sidomeny + länkkopplingar + notis-action_url (B2)
7. Läst-status-tillägg (B3)
8. Validera + push
