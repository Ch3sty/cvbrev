# Kandidatens intresseflöde v2 — synlighet + värde efter accept

Problem (användaren, 2026-07-06): (1) kandidaten märker knappt att en
rekryterare visat intresse, måste själv gå till Bli upptäckt och scrolla ned.
(2) Efter "Accepterad" är det en återvändsgränd: kandidaten har delat namn +
mejl men ser inte vem rekryteraren är, kan inte kontakta eller svara.

Nuläge i koden:
- POST /api/recruiter/interest skapar redan en notifications-rad
  (type 'recruiter_interest') + mail + email_log. Men dashboarden har INGEN
  notis-yta som visar notifications (bara admin-headern har en klocka).
- candidate_interests: id, recruiter_user_id, candidate_user_id, message,
  status, created_at, responded_at. Ingen kandidat→rekryterare-kommunikation.
- recruiter_profiles: company_name, org_number, contact_name, contact_role,
  recruiting_roles, status. INGEN kontaktkanal (mejl/telefon). Rekryterarens
  mejl finns i profiles.email.
- InterestsCard visar företag, kontaktnamn, meddelande, status. Vid accept
  bara texten "din e-postadress har delats med X". Punkt slut.
- respond-routen: mail till rekryteraren vid svar är MEDVETET utelämnat i
  betan (kommentar i filen).

## Princip

Symmetri: när kandidaten accepterat och delat sina uppgifter ska hen få minst
lika mycket tillbaka. Rekryteraren blir en riktig, namngiven kontakt med en
väg att nå. Och intresset ska synas direkt vid inloggning, inte kräva att man
letar upp det.

---

## FAS 1 — Gör intresset synligt vid inloggning (störst effekt, minst risk)

### 1a. Notisyta i dashboarden
notifications-rader skapas redan men visas ingenstans för kandidaten. Bygg:
- GET /api/notifications (egna rader via RLS, senaste först, unread-count) +
  POST /api/notifications/read (markera lästa, en eller alla).
- En notisklocka i dashboardens header/sidebar (mönster: src/components/
  admin/header.tsx finns som förlaga) med unread-badge. Klick öppnar en lista;
  "recruiter_interest"-notisen länkar till /dashboard/bli-upptackt#intressen.
- Alternativ/komplement om headern är trång: ett litet "intresse-kort" högst
  upp på dashboardens översikt (/dashboard) när det finns obesvarade intressen,
  med direktknapp till svaret. Detta är den verkliga fixen på "syns knappt".

### 1b. Ankare + upphöjning på Bli upptäckt
- Ge InterestsCard ett id="intressen" så notisen/mailet kan djuplänka dit.
- Flytta InterestsCard HÖGST UPP på Bli upptäckt-sidan när det finns minst ett
  pending-intresse (annars kvar där den är). Ett obesvarat intresse är det
  mest angelägna på hela sidan.
- Sidomenyns "Bli upptäckt"-post får en liten prick/räknare när det finns
  obesvarade intressen (NY-badgen finns redan, återanvänd mönstret).

---

## FAS 2 — Ge kandidaten värde efter accept (fyller återvändsgränden)

### 2a. Exponera rekryterarens kontaktkort vid accepterat intresse
Idag ser kandidaten bara "din e-post har delats". Spegla upplåsningen.
BESLUT (användaren): exponera namn, roll, företag, mejl, TELEFON och WEBB.
- Lägg till i recruiter_profiles: contact_email (default = profiles.email vid
  registrering), phone, website. Migration + fält i registreringsformuläret
  (contact_email kan börja = kontots mejl; phone/website valfria).
- GET /api/candidate/interests berikas: när status='accepted', inkludera
  recruiterContact { companyName, contactName, contactRole, email, phone,
  website }. ENDAST vid accepterat intresse (symmetrisk maskering med
  rekryterarens e-postupplåsning).
- InterestsCard vid accepterad status: kontaktkort med namn, roll, företag,
  mejl, telefon, webb. Ersätter dagens platta bekräftelsetext. Trådvyn (2b)
  är default-vägen, kontaktkortet är för den som vill ta det offline.

### 2b. Inbyggd meddelandetråd (BESLUTAT: standard för branschen)
Beslut (användaren): håll konversationen i plattformen, inte i privat mejl.
Motiv: symmetri/trygghet för kandidaten, du äger relationen + svarsfrekvens-
datan (ditt säljargument), ser proffsigt ut. Mailto tappar allt i skicka-
ögonblicket. LinkedIn/Teamtailor/Alva gör alla in-app-tråd.
- Tabell interest_messages (id, interest_id, sender_user_id, sender_role
  'candidate'|'recruiter', body, created_at). RLS: läs för båda parter i
  intresset, skriv via server-API.
- Trådvy i BÅDA ytor: kandidatens InterestsCard (expanderbar tråd vid
  accepterat intresse) och rekryterarens /rekryterare/inbox (som redan finns).
  Trådar upplåses bara vid status='accepted' (spegling av kontaktupplåsningen).
- POST /api/interests/[id]/messages (delad, rollen härleds ur inloggning +
  intressets parter). Varje nytt meddelande → notis + mail till motparten med
  "du har ett nytt svar, läs i appen" (INTE meddelandet i klartext, drar
  tillbaka till plattformen), loggas i email_log.
- Kontaktkortet (2a) med namn/roll/företag/mejl/telefon/webb visas fortsatt,
  så den som vill ta det offline kan, men default-vägen är tråden.
- Detta river den medvetna beta-begränsningen "mail till rekryteraren
  utelämnat".

### 2c. Rekryteraren får veta att kandidaten svarat (stänger loopen)
- I respond-routen (accept/decline): skapa en notifications-rad för
  rekryteraren + mail (rekryterarens inbox-vy /rekryterare/inbox visar redan
  status, men en notis/mail drar tillbaka hen). Vid accept: "Anna tackade ja,
  ni kan ta kontakt." Detta gör flödet symmetriskt åt båda håll.

---

## FAS 3 — Polish

- Tidsstämplar relativa ("för 2 timmar sedan") i intressekortet.
- Tom-state-copy när alla intressen besvarats.
- E-postmallen till kandidaten (recruiter-interest) får en tydlig
  "Svara direkt"-knapp som djuplänkar till #intressen.
- Räkna accepterade/avböjda i /admin/email eller en liten funnel så du ser
  hur stor andel som faktiskt leder till kontakt.

## Rekommenderad ordning
1. **Fas 1a-b** (synlighet) — löser den akuta "syns knappt", ren additiv risk.
2. **Fas 2a** (rekryterarens kontaktkort vid accept) — fyller återvändsgränden
   med minst arbete, ren spegling av befintlig maskering.
3. **Fas 2c** (rekryteraren notifieras vid svar) — stänger loopen.
4. **Fas 2b** (svara i tråden) + Fas 3 — när grunden sitter.

## Öppna beslut till användaren
- Kontaktväg efter accept: räcker mejl (mailto), eller vill du ha en
  inbyggd meddelandetråd redan nu?
- Ska rekryterarens telefon/webb exponeras, eller bara mejl?
- Notisyta: klocka i headern, kort på översikten, eller båda?
