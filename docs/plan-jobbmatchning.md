# Plan: Jobbmatchning som loop, inte som sökknapp

Skriven 2026-09-14 efter ägarens reaktion på sidan i produktion: snabb men obegriplig, inget visar vad som händer, inte innovativt. Underliggande problem är inte layouten utan produktrollen.

## 1. Vad sidan är i dag

En engångssökning. Användaren väljer CV, trycker "Visa matchande jobb", en edge-funktion (`match-jobs`) läser roller, kompetenser och ort ur CV:t, söker i Arbetsförmedlingens annonser, snabbpoängsätter allt och förfinar topp 100. Resultatet visas i en lista, gratisnivån ser en del suddat. Inget sparas. Ingen anledning att komma tillbaka. Inget knyter träffen till brevet, som är vår konverteringsmotor. Preferenser finns inte: profilen har målroll, bransch och ort, men ingen önskad ort, distans, omfattning eller lön, och sökningen använder bara CV:ts ort.

## 2. Vad ett framgångsrikt SaaS gör med samma funktion

Matchningen är den enda funktionen som kan skapa **återkommande värde utan att användaren gör något**. CV, brev och tester är engångsjobb. Nya annonser kommer varje dag. Därför:

1. **Matchningar räknas åt användaren, inte av användaren.** Efter CV-uppladdning och sedan varje natt. Sidan heter "Dina matchningar" och visar ett levande läge: "17 jobb passar dig, 3 nya sedan igår".
2. **Varje träff förklarar sig och leder vidare.** Matchgrad med två till tre skäl ("3 av dina roller", "8 av 12 kompetenser i kravprofilen", "Stockholm", "publicerad igår") och en primär handling: **Skriv brev**, som öppnar brevflödet med annonsen ifylld. Det är kopplingen till intäkten: brev är kvoterade och betalväggen sitter där.
3. **Preferenser är synliga och styr.** "Så söker vi åt dig": ort(er), distans ja/nej, omfattning, lägsta lön. Redigerbart på sidan, sparas på profilen, används av matchningen. Lön visas aldrig utåt (se Bli upptäckt-regeln).
4. **Anledning att återvända.** Dashboardens "Nästa handling" och veckomejlet får raden "3 nya matchningar", med djuplänk. Notis i klockan.
5. **Betalväggen säljer på förklaringen.** Gratis: topp 3 med full förklaring, resten som suddade kort med matchgrad synlig. Premium: alla, plus "varför just du" per annons. Det är samma redact-mekanism som i dag, men argumentet blir "se varför du passar", inte "se fler".
6. **Processen syns.** Sidan visar kedjan som en tråd: CV, det vi läste ut (redigerbart), det du vill ha, annonserna vi läst (antal och färskhet), träffarna. En 240-scen "CV mot annonser" i tomt tillstånd. Inte tre textrader i en panel.

## 3. Mätning

PostHog-händelser: `match_page_viewed`, `match_preferences_saved`, `match_viewed` (kort öppnat), `match_letter_started` (Skriv brev), `match_applied` (Markera som sökt), `match_digest_clicked`. Mål: andel användare med aktivt CV som har minst en match visad per vecka, andel träffar som leder till brev, och brevkvot nådd via match (betalväggsträffar från match).

## 4. Vågor

**Våg 1 (sidan, denna vecka):** ny sida enligt avsnitt 2.2, 2.3, 2.5, 2.6 ovanpå befintlig `match-jobs`. Preferensfält på profilen (`job_preferences` jsonb: locations, remote, extent, min_salary) och i sidan. Skriv brev från träff: prefill av annonsens titel, företag, text och länk in i skapa-brev (prefill-mekanismen finns: `prefillData.jobAdUrl`). Händelser enligt avsnitt 3. Design enligt `docs/designsystem.md`.

**Våg 2 (loopen):** tabell `job_matches` (user_id, cv_id, job_id, score, reasons, first_seen, seen_at, status). Nattlig körning i befintlig cron (max två Vercel-crons, lägg i `pricing-sync`) för användare med aktivt CV och besök senaste 30 dagarna. "Nya sedan igår" på sidan, dashboardens Nästa handling, veckomejlet, notis.

**Våg 3 (kvalitet):** matchning använder preferenser fullt ut i edge-funktionen, sparade och avvisade träffar ("Inte för mig" lär modellen), och en "Vad saknas i ditt CV för den här rollen"-koppling till CV-analysen.

## 5. Ägarens beslut

Inga för våg 1. Våg 2 kräver beslut om nattlig körning mot Arbetsförmedlingens API (volym: antal aktiva användare gånger en sökning per natt) innan den byggs.
