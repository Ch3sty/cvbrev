# Affärsgranskning av mallflödet, 2026-11-16

saas-lead med säljansvarig. Grenen `feat/mallar-komponenter` (c9a6d7cd) kördes på http://localhost:8330. Testet gjordes i riktig Chrome (puppeteer-core) med Pixel 7 och 1280 px, som utloggad, inloggad gratis och Premium, och koden lästes parallellt. Testskriptet ligger i scratchpad och inte i repot. Skärmdumparna ligger utanför git.

Kontona hette `qa-saas-gratis-1794799698212`, `qa-saas-premium-1794799698212` och `qa-saas-utloggad-1794800004053` @jobbcoach-qa.test. Alla tre raderades per id efter räkning: 4 cv_texts, 4 formatted_cv_downloads, 18 user_activities och 3 auth-konton. Efteråt fanns 0 profiler kvar. Inga köp gjordes i Stripe.

Underlag: `docs/plan-mallar-2026-11-15.md` (villkor a till f, punkt 14, avsnitt 8), skissen version 4, `mallar-utbud-2026-11-16.md` (avsnitt 6) och ägarbeslutet 2026-11-16: Linne och Björk är gratis som PDF eller Word, en gratisfil per konto, och 18 mallar är Premium.

## Det som håller (verifierat i Chrome)

| Kontroll | Utfall |
|---|---|
| Premiummall vald utloggad | Köpet står i knappen: "Ladda ner PDF i Koppar, Premium 149 kr i månaden". Gratisvägen syns som bild: "Ladda ner gratis i Linne". |
| Premiummall vald inloggad gratis (dator och Pixel) | "Ladda ner PDF i Kalksten med Premium, 149 kr i månaden" och gratisvägen som bild. Väggen säger "Mallen ingår i Premium" med prisraden. |
| Kontoarket | Google kommer först. Arket säger vilken väg hon valt: "När kontot är klart går du till kassan" eller "Ditt CV i Linne, gratis. Filen kommer direkt när kontot är klart." |
| Gratisfilen utloggad | Linne som Word ger kontot i arket och sedan .docx direkt i samma flik. Utkastet hämtas till cv_texts, `free_cv_exports_used` blir 1 och finalen visas. |
| Gratisfilen inloggad | PDF i Linne laddas ner och finalen visas. |
| Andra nedladdningen | Servern svarar 402 (`export_blockerad`, reason kvot) och merförsäljningen visas med tre kort (Kalksten, Granit, Stål) och hennes CV i iframe. Knappen "Ladda ner i Kalksten, Premium 149 kr i månaden" och "Nej tack, behåll Linne" finns. Det gäller både provsidan och inloggat läge. |
| Premium | Word i Koppar laddas ner. Ingen merförsäljning och inget pris. |
| Finalen | Testet gav en jobbträff ("IT-projektledare inom IT/OT, Adavo AB, Stockholm"), "Se fler jobb som matchar" går till /dashboard/jobbmatchning, och ingen försäljning visas första gången. |
| Kampanjen publikt | Med `localStorage.kampanj_nu` satt till 24 nov står `data-kampanj=black-week-2026` på sidan och knappen säger "Premium 99 kr första månaden". 30 nov ger "49 kr första månaden". Raden "BLACK WEEK" visas överst. |
| Kampanjen inloggat | Lästes bara i koden, eftersom KAMPANJ_NU är serverns miljövariabel och servern inte fick startas om. `page.tsx` byter priset bara när `kampanjForVisning` säger behörig. PaywallCard visar då "99 kr första månaden, sedan 149 kr i månaden" och merförsäljningen visar "Just nu ... Ordinarie ...". |

## Blockerare

### B1. Main har fortfarande e-postspärren, och Black Week säljer på main (före 20 nov)

Grenen går inte live förrän tidigast 1 dec (frysen i avsnitt 9). Under kampanjen gäller alltså main, och där spärrar `src/app/api/cv/generate-formatted/route.ts` (rad 2401 till 2408) och `src/app/api/letters/download/route.ts` (rad 245 till 249) fortfarande på `profiles.email_verified_at`. Det är verifierat med `git show main:`. Rättelsen ligger på `fix/nedladdning-ats` (ab14ede4) men är inte mergad. Den som köper Premium för 99 kr under Black Week och saknar kolumnen får ingen fil. Det gäller 6 av 9 betalande i dag.

Åtgärd: merga beslut 0 (bara spärrblocken, enligt planens avsnitt 0) till main senast 20 nov. Kör sedan klicktestet `scripts/klicktest-nedladdning.ts` mot main och ett köptest i testläget. Den ATS-delen av grenen som inte är buggrättelse väntar enligt 6b.

### B2. Efter betalningen kommer hon inte tillbaka till filen

`src/app/api/stripe/create-plan-session/route.ts` rad 201: `success_url` är `/dashboard/vecka/start`. Där säger `valkommenMedCv` i `src/lib/onboarding/komigang.ts` (rad ca 575) "Kör hela CV-analysen" och leder till `/dashboard/cv-analys`. Den som betalade för "Ladda ner PDF i Kalksten" landar alltså utan sin fil och utan mallen vald. `cancel_url` går till `/priser` och tappar också valet.

Ändring:
1. `src/lib/onboarding/steps.ts` `kopstegHref(plan, plats, retur?)`: lägg till `&retur=<encodeURIComponent(retur)>` när `retur` finns.
2. `src/app/dashboard/valj-spar/page.tsx` och `ValjSparClient.tsx`: läs `?retur=` och skicka det vidare i POST till create-plan-session.
3. `create-plan-session/route.ts`: godkänn `retur` bara om det börjar med `/dashboard/cv-mallar?` (annars ignoreras det). Då blir `success_url` `${baseUrl}${retur}&ladda=1&premium_activated=true` och `cancel_url` `${baseUrl}${retur}`.
4. `src/app/dashboard/cv-mallar/CvMallarClient.tsx`: vid `?ladda=1` och `initialIsPremium` startar `laddaNer()` en gång efter första mätningen, och `ladda` tas bort ur adressen.
5. Anroparna: `retur = /dashboard/cv-mallar?cv=<id>&mall=<id>&format=<f>`.

### B3. "Går du till kassan" leder till en andra säljvägg

Villkor a säger att ingen betalspärr ska komma som överraskning efter kontot. Kontoarket lovar kassan, men `ProvaArbetsyta.hamtaHem` skickar till `/dashboard/cv-mallar?kop=1`, och effekten för `p.kop` i `CvMallarClient.tsx` (rad ca 133) öppnar `GraValSheet('mall')` med "Mallen ingår i Premium. Du ser hela mallen som den blir ...". Det blir ett extra klick efter ett ja.

Samma sak händer efter merförsäljningen. `onKop` i `CvMallarClient.tsx` (rad ca 375) sätter `setSparr('cv-export')`, och då visas "Din gratis nedladdning är använd" med knappen "Köp Premium". Mallen hon just valde (Granit i testet) nämns inte. Verifierat på 1280 px (B11): klicket på väggens knapp leder till `/dashboard/valj-spar?paket=all_month&steg=kop&plats=cv_export`.

Ändring i `CvMallarClient.tsx`:
- Effekten för `p.kop`: när köp krävs, `window.location.assign(kopstegHref(SALD_PLAN, 'mall', retur))` i stället för `setSparr('mall')`. Köpsteget har samtyckesrutan, så ingen dokumentation tappas.
- `Merforsaljning onKop`: `window.location.assign(kopstegHref(SALD_PLAN, 'mall', `/dashboard/cv-mallar?cv=${cv.id}&mall=${m.id}&format=${format}`))` i stället för `setSparr('cv-export')`.
- `ProvaArbetsyta.tsx` (`hamtaHem` med `viaKop` och `Merforsaljning onKop`): gå direkt till köpsteget med samma `retur`, inte via `?kop=1`.

### B4. Fotoarket utloggad gör av med gratisfilen

`ProvaArbetsyta.tsx`, `KontoArk onKlar`: `void hamtaHem(konto === 'foto' ? false : kop)`. Den som skapar konto från "Skapa konto och lägg till foto" får nedladdningen startad direkt.

- I en gratismall laddas filen ner utan foto, och hennes enda gratisfil är förbrukad innan hon hunnit lägga till fotot.
- I en premiummall svarar servern 402 (`cv_templates_all`). Grenen `ut.typ === 'sparr'` öppnar då merförsäljningen med "Du har ... i Koppar", fast hon inte har någon fil.
- `FOTO_ARK.nu` ("Nu kan du lägga till foto") används ingenstans.
- Arkets knapp säger dessutom "Skapa konto och ladda ner" eller "gå till kassan" även när arket öppnats för fotot.

Ändring:
- `onKlar` vid `konto === 'foto'`: posta bara utkastet (`/api/cv/prova/hamta`) och gå sedan till `/dashboard/cv-mallar?cv=<id>&mall=<id>&foto=1`. Där öppnar `CvMallarClient` filväljaren (`foto.valj()`) och visar raden `FOTO_ARK.nu`.
- I `hamtaHem`: visa merförsäljningen bara när `ut.feature === 'cv_export'`, och gå till köpsteget för `cv_templates_all` och `cv_export_word`.
- `KontoArk`: ny prop `knapp?: string`. Fotovägen skickar `FOTO_ARK.konto` som knapptext och utelämnar raden om filen eller kassan.

## Rättelser

| Nr | Fil | Fel | Exakt ändring |
|---|---|---|---|
| R1 | `src/lib/cv/mallval/pris.server.ts`, `prova/ProvaKontext.tsx`, `prova/ProvaArbetsyta.tsx`, `app/dashboard/cv-mallar/page.tsx` | Under kampanjen säger knappen, mallraden och kontoarket bara "99 kr första månaden" och nämner aldrig att det sedan blir 149 kr i månaden. Det är verifierat i Chrome ("sedan 149" saknas i hela provvyn). Prisinformationen blir ofullständig och risken för återkrav ökar. Betalväggarna gör redan rätt via `premiumPrisrad`. | Lägg till `lang: kampanjPrisPeriod(k)` per kampanj i `prisInfo`. Lägg till `prisLang` i kontexten (kampanjens `lang`, annars ordinarie). Använd `prisLang` i `KontoArk vag.pris` och `Mallyta pris`. Knappen behåller den korta formen. Gör samma sak i dashboardens `page.tsx`: `pris` till Mallrad blir `${kampanj.pris}, sedan ${ordinarie}`. Copywritern godkänner ordföljden. |
| R2 | `src/lib/cv/mallar/katalog.ts` rad 38 till 40, `Dokument/Merforsaljning.tsx` | Merförsäljningen lovar foto när CV:t saknar foto. Testets CV utan foto fick korten "Sidospalt och foto" och "Mörk sidospalt, foto", och miniatyren visade platshållaren med initialen. Utbudets avsnitt 6 säger att texterna ska bytas utan foto. | Nytt fält `kortUtanFoto` i MallKort: koppar "Färgat huvud", kalksten "Ljus sidospalt", granit "Mörk sidospalt, vit text". I Merforsaljning blir texten `!harFoto && m.kortUtanFoto ? m.kortUtanFoto : m.kort`. |
| R3 | `src/app/api/cv/generate-formatted/route.ts` rad ca 395 | En gratis-PDF i Linne går att ladda ner utan konto via API:t. Tre anonyma anrop gav 200, 200, 200 (Koppar gav 401). Räknaren gäller bara inloggade, så "en gratisfil per konto" är bara en spärr i klienten, och de filerna mäts inte heller (`cv_nedladdad` kräver användare). Felet finns redan på main. | Kör först en grep efter publika anrop till `generate-formatted` utan session (inga hittades i Dokument-komponenterna). Lägg sedan till `if (!authedUserId) return 401 { error: 'Logga in för att ladda ner.' }` före gratisgrenen. |
| R4 | `src/app/api/cv/prova/hamta/route.ts` | Varje anspråk skapar en ny cv_texts-rad. I testet fick gratiskontot två CV när utkastet postades två gånger, trots att gratisnivån har ett CV. | Gör anspråket idempotent per konto och utkast: ta samma rad om kontot fått en rad från `cv_prova` de senaste 24 timmarna, eller använd en hash av structured_data. |
| R5 | `Dokument/Final.tsx` rad ca 145 | Jobbkortet i finalen går inte att trycka på. `nasta_steg_klickad` med target `jobb` finns i typen men skjuts aldrig, så det primära nästa steget går inte att mäta per träff. | Gör kortet till en länk: `traff.url` i ny flik, annars `/dashboard/jobbmatchning`. Skjut `capture('nasta_steg_klickad', { target: 'jobb', template, surface })`. |
| R6 | `prova/ProvaKontext.tsx` | Kampanjpriset publikt följer bara besökarens klocka och cookien `jc_kampanj_ej`. Den som haft Premium men är utloggad på en ny enhet ser 99 kr i knappen och möter 149 kr efter inloggningen. Det är ett litet antal, och kassan är facit. | Ingen kodändring före kampanjen. Kontoarkets rad (R1) får tillägget "för konton som inte haft Premium" under kampanjen, ur `prisFotnot`. |

## Säljansvarigs omdöme (jobbcoach.ai, inte Begone)

**Vill användarna ha mallarna?** Ja, utbudet täcker det marknaden köper. Säljansvarigs hypotes, som prövas med `merforsaljning_klick` och `cv_nedladdad` per mall vid avläsningen 14 dec:
- Granit (mörk sidospalt med foto, den "moderna" looken som Canva och cvkungen säljer på) bör sälja bäst, följd av Kalksten (intygsfältet för vård och bygg), Koppar, Stål och Mörkrum.
- Svaga är Antikva, Folio och Kolumn, tre formella serifmallar som konkurrerar om samma köpare, samt Tidning, Tusch och Horisont (rörig vid många anställningar). Terrakotta skrivs ut sämre på grund av krämfärgen.

Det som saknas mot konkurrenterna:
1. **Personligt brev i samma mall.** Det är det starkaste premiumargumentet vi inte använder.
2. **En ljus färgad sidospalt med runt foto.** Det är Canvas vanligaste form.
3. **Engelska rubriker** som uppsättning i rubrikmodellen.

En risk att mäta innan något ändras: Björk är gratis och har foto, så den kan äta försäljningen för Koppar och Kalksten.

**Säljer flödet?**
- Knappen med köpet och gratisvägen som bild är rätt.
- Pengarna tappas efter ja: den andra väggen efter kontot (B3), den generiska "Din gratis nedladdning är använd" efter merförsäljningen (B3) och köpreturen till CV-analysen i stället för filen (B2).
- Merförsäljningen kommer bara vid andra nedladdningen, och den gör få under en kampanjvecka.

**Kampanjen:** priset syns där beslutet tas. Men knappen saknar "sedan 149 kr i månaden" (R1), och varken kampanjnamnet eller slutdatumet står vid knappen, bara i raden överst.

Säljansvarig föreslår en stilla kampanjrad i finalen under kampanjen. Det bryter mot beslut 4 (finalen säljer inget första gången), och jag avgör att beslut 4 står kvar. Flödet är inte live under Black Week, och raden överst bär kampanjen. Frågan prövas vid avläsningen 14 dec med `paywall_cta_clicked` per yta.

**Säljansvarigs topp tre efter intäkt:**
1. B1, före 20 nov.
2. B2 och B3, före merge 1 dec.
3. R1, före merge.

Fråga till ägaren från säljansvarig, oförändrad sedan planen: ska de sex kunder som betalat utan att kunna ladda ner kontaktas när B1 är ute?

## Mätningens luckor

Händelserna fångades i Chrome via en inspelande `window.posthog`. Serverhändelserna kontrollerades i PostHog med HogQL mot testkontonas id.

| Händelse | Utfall i testet |
|---|---|
| `mall_visad`, `sidantal_visat` | Skjuts med template, tier och surface. |
| `forslag_visad` | Skjuts med grupp, templates och surface. |
| `nedladdning_klickad`, `konto_ark_visat` | Skjuts, men med nyckeln `mall` (se L4). |
| `signup_started`, `signup_completed` | Skjuts med entry cv_prova. |
| `draft_claimed` | Skjuts med kind cv_prova. |
| `belöning_visad` | Skjuts med template, tier, format och nasta. |
| `merforsaljning_visad`, `merforsaljning_klick` | Skjuts med kort och kop. |
| `nasta_steg_klickad` | Skjuts med fler_jobb. |
| `paywall_shown`, `paywall_cta_clicked`, `feature_blocked`, `betalvagg_visad` | Skjuts. |
| `cv_nedladdad` (server) | 4 rader med template, format, tier och gratisexport. |
| `export_blockerad` (server) | 1 rad, reason kvot, från provsidan. |

| Nr | Lucka | Ändring |
|---|---|---|
| L1 | `paywall_shown` och `paywall_cta_clicked` saknar `template` (utbudets avsnitt 6). Intäkten kan inte knytas till mall, eftersom `subscription_paid` ska attribueras till senaste `paywall_cta_clicked`. | `GraValSheet` och `PaywallCard` får prop `template?: string` som läggs i båda händelserna. CvMallarClient skickar `mall.id`. Med B2 och B3 går köpet via köpsteget, och då ska `kopstegHref` också bära `&mall=` till `source` (`betalvagg:mall:<id>`) så att `subscription_paid` får mallen på servern. |
| L2 | `cv_nedladdad` saknar `entry` (planens avsnitt 8) samt `foto_pa` och `sidor` (utbudets avsnitt 6). | Klienten skickar `entry: surface` i POST-kroppen (`hooks.ts` `ladda`). Routen lägger på `entry`, `foto_pa: Boolean(val?.foto && userProfile?.profile_photo_url)` och `sidor` (sidantalet i den färdiga PDF:en, null för Word). |
| L3 | `export_blockerad` underräknar. Inloggat stoppar klienten mallen och kvoten före servern (`CvMallarClient` läser `gratisAnvand`). Andra nedladdningen i inloggat läge gav merförsäljningen men ingen `export_blockerad` i PostHog, och premiummallen gav bara `feature_blocked`. | Ingen kodändring. Läs tratten som `nedladdning_klickad`, sedan `feature_blocked`/`merforsaljning_visad`, och därefter `cv_nedladdad`. `export_blockerad` mäter bara stopp på servern. Det skrivs in i avläsningen 14 dec. |
| L4 | `nedladdning_klickad` och `konto_ark_visat` har nyckeln `mall`, alla andra har `template`. Uppdelning per mall kräver då coalesce. | Byt till `template` i `events.ts` rad 425 och 438, `Mallyta`, `ProvaArbetsyta` och `CvMallarClient` nu, eftersom ingen historik finns. |
| L5 | Händelsenamnet `belöning_visad` innehåller ö. Det fungerar, men blir skört i HogQL, Actions och adresser. | Byt till `beloning_visad` före live. Ingen historik finns. |
| L6 | `nasta_steg_klickad` med target `jobb` skjuts aldrig (R5). | Se R5. |
| L7 | Inte prövat i webbläsaren, eftersom utkastet lades i localStorage i stället för att laddas upp: `cv_eget_start`, `cv_eget_inlast`, `cv_eget_misslyckad`, `mall_bytt` (svep, tryck och lista), `typsnitt_bytt`, `rubrik_bytt`, `farg_bytt`, `fil_delad`, `namn_ifyllt`, `fortsatt_klickad`, `mallvisning_*`, och kampanjen i inloggat läge. Koden skjuter dem (ProvaKontext, Mallyta, Final, MallVisningCv) med template och tier där planen kräver det. | Ta med dem i klickmatrisen före merge. Den ska omfatta en riktig uppladdning (PDF och Word), svep och tryck i remsan, och dashboarden med `KAMPANJ_NU=2026-11-24T12:00:00+01:00` på en egen port. |

Inga texter om datalagring, GDPR eller villkor är rörda eller föreslagna.
