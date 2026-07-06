# Rekryterarportalen v2 — från kortlista till sourcing-verktyg

Underlag: tre expertgenomgångar 2026-07-06 (senior rekryterare med konkurrensbenchmark
mot Alva Labs/Assessio/TestGorilla/LinkedIn Recruiter, psykometriker med IPIP-NEO-djup,
portal-UX-spec). Ägarens kritik som utlöste arbetet: "amatörmässig och basic approach,
hur hittar man spetskompetens, och är 4 punkter verkligen allt vi får ut av 120 frågor?"

## Diagnosen (alla tre eniga)

Verktyget är byggt inifrån och ut ("vilken data har vi?") i stället för utifrån
rekryterarens fråga ("vem uppfyller min kravprofil?"). Tre saker dödar förtroendet
hos en riktig rekryterare inom fem minuter:

1. **Sökningen är trasig på riktigt.** `haystack.includes(hela söksträngen)` gör att
   "redovisningsekonom med koncernredovisning" ger 0 träffar även när den perfekta
   kandidaten finns i poolen. Ingen relevansrankning finns; sortering sker på
   profilkompletthet, så en irrelevant men testflitig kandidat rankas över den
   perfekta matchen.
2. **Testintegriteten håller inte för granskning.** `buildTestBadges` väljer bästa
   session på rå score över alla nivåer: 95 % på grundnivå slår 80 % på expertnivå.
   Obegränsade omförsök med best-of-N visas som "verifierat". Percentiler mot
   golv 25 självselekterade testare ("topp 4 % av 87 testade") punkterar
   trovärdigheten. Testdata är vår enda riktiga differentiator mot LinkedIn —
   ETT bakvänt resultat och en testvan rekryterare dömer ut hela plattformen.
3. **Arbetsstilspanelen läses som horoskop.** Alla kandidater får enbart positiva
   enradare, alltså är informationsvärdet för att skilja kandidater åt nära noll.
   120 frågor → 4 punkter känns som fusk (ägaren har rätt).

Rekryterarens prisvillighet idag: 0 kr. Med hygienfaktorerna fixade och några hundra
kandidater: 1 500–3 000 kr/mån per rekryterare (jämför LinkedIn Recruiter Lite
~1 700 kr/mån), alternativt success-baserat per upplåst kontakt i betan.

## Så söker en rekryterare (verklighetscheck)

1. Kravprofil först (roll + måsten + år + region + tillträde + budget) — söker aldrig
   förutsättningslöst.
2. Titel + avgörande spetskompetens ("med koncernredovisning" skiljer 200 träffar
   från 12 rätt).
3. Karriärbana och MILJÖ (byrå/koncern/noterat/bransch) — ofta viktigare än exakt
   arbetsgivare.
4. Testresultat som screen/tiebreaker — aldrig startpunkt.
5. Nåbarhet och villkor (vår opt-in-pool är en inbyggd styrka: alla svarar).

Vår modell stödjer 4 och 5, saknar 1 helt, 2 nästan helt, 3 delvis (miljön är
bortmaskerad ihop med arbetsgivarnamnet).

---

## FAS A — Trovärdighet (hygien, före allt annat)

### A1. Relevansrankad rollsökning
- Tokenisera sökfrågan, AND-logik, matcha varje term mot: roll, ALLA titlar i
  arbetshistoriken, kompetenser (extracted_skills är redan normaliserade), pitch.
- Ranka på antal/vikt av träffade termer; titelmatch boostas över kompetensmatch.
- Returnera `matchReasons: string[]` (max 3) per kort — synlig förklaring till
  rankningen i UI ("Matchar 'koncernredovisning' i kompetenser · Topp 8 % i
  Numeriskt · 8 års erfarenhet inom området").
- Data finns redan: `active_cv_for_matching.extracted_skills/extracted_occupations`,
  `cv_texts.structured_data` med alla roller och beskrivningar.

### A2. Testresultatens integritet
- Nivåviktad badge-logik: expertresultat får ALDRIG förlora mot grundresultat.
  Visa nivån i badgen: "Matrislogik expert · topp 8 %".
- Försökspolicy: räkna första slutförda försöket per nivå som "verifierat"
  (eller visa antal försök). Best-of-N på oövervakat test är psykometriskt värdelöst.
- Ärlig normgrupp: "jämfört med N som gjort samma test hos oss"; höj golvet för
  percentilvisning från 25 mot 100 i takt med volym.
- Tona ner "starkaste förutsägelsen av arbetsprestation"-copy tills detta är fixat.
- Visuell skala per familj (stapel med markör) i stället för textlista.

### A3. Filter som täcker grundkraven
- Senioritet i buckets: Junior 0–2 / Mid 3–5 / Senior 6–9 / Expert 10+ (data finns:
  yearsOfExperience).
- Percentilgolv PER testfamilj (checkboxar Matrislogik/Verbalt/Numeriskt), inte
  "någon familj".
- Budgetfilter: "ryms inom X kr/mån" som WHERE-villkor — spannet exponeras ALDRIG
  (befintlig policy). Unik data ingen konkurrent har i sourcing-ledet.
- extent + employment_types (samlas redan in, filtreras inte på).
- Utbildningsnivå (bucketfunktion av educationLevel-strängen).
- Riktig paginering ("Visa 50 fler") i stället för tyst cutoff vid 50.
- Flerval på styrkor/regioner (chips i stället för envals-selects).

---

## FAS B — Arbetsverktyget (portal-UX)

IA: fem vyer under delad layout med vänster ikonnav (desktop primär):
`/rekryterare` (Sök) · `/rekryterare/projekt` (+ `[projectId]`) ·
`/rekryterare/jamfor?ids=` · `/rekryterare/inbox` · sparade sökningar (panel i Sök
+ egen navpunkt).

### B1. Sökvyn: tabell på desktop
- Filterpanel vänster (280px, kollapsbar, ordning: fritext → senioritet → län →
  tillträde → arbetsplats → testresultat → styrkor → arketyp → utbildning;
  botten: Rensa + Spara sökning). Kort-grid behålls på mobil.
- Tabellkolumner: checkbox · kandidat (avatar+roll+region) · senioritet (år bold +
  senaste roll) · testresultat som PercentileDots (tre minipunkter, fylld=topp 10 %,
  tooltip med exakt värde) · arbetsstil (indigo-pill, bara arketyp) · kompetenser
  (3 chips + "+N") · villkor · status · åtgärd. Radhöjd 64–72px, hela raden klickbar.
- Sorteringsval synligt: Relevans / Senioritet / Senast aktiv / Testresultat.
- Aktivitets-/färskhetssignal: "aktiv i poolen sedan 12 juni" (opt-in-poolens
  motsvarighet till LinkedIns spotlights — gör styrkan explicit).
- Tomma lägen med konkret näst-bästa-åtgärd ("Bredda till Topp 25 %" som klickbar
  chip), inte bara "Rensa filter".

### B2. Peek-panel (mellan rad och fullprofil)
Slide-in höger 420px: header + senioritet + pitch + testbadges i fullbredd +
arbetsstil kort + alla kompetenser + villkor + matchförklaring i klartext.
Sticky footer: Visa intresse (primär) · Lägg i projekt · Öppna full profil.

### B3. Projekt (shortlists) + anteckningar + sparade sökningar med bevakning
- Tabeller: `recruiter_projects`, `recruiter_project_candidates`,
  `recruiter_candidate_notes`, `recruiter_saved_searches` (RLS: recruiter_user_id
  = auth.uid(), samma mönster som candidate_interests).
- Kandidatstatus i projekt: ny → kontaktad → väntar → dialog.
- Bevakning: mail "2 nya kandidater matchar [sökning]" max 1/dag via befintlig
  morgon-slot i pricing-sync-cronen (Vercel-budgeten: max 2 crons, redan använda —
  återanvänd morgonsloten). Detta är retention-mekanismen som gör att en liten pool
  inte är ett skäl att lämna.

### B4. Jämför 2–4 sida vid sida
Markera i tabell/projekt → `/rekryterare/jamfor`. Rader: senioritet, utbildning,
percentil per familj, arketyp, styrkor, toppkompetenser, tillträde, villkor, status.
Bästa värdet per rad får subtil bg-orange-50/60 (ingen "vinnarkrona").

### B5. Detaljprofilen som beslutsstöd
- Sticky action-bar: kontextuell tillbaka-länk ("Till sökningen ...") · Anteckning ·
  Lägg i projekt · Visa intresse (gradient, aldrig scroll för att hitta den).
- Ny sektionsordning: Hero → Pitch → Snabbsammanfattning (3 minikort: Erfarenhet /
  Bäst i / Arbetsstil) → Verifierade resultat → Arbetsstilsrapport →
  Erfarenhet → Utbildning → Språk → Villkor. Kontakt-panelen ut ur flödet.
- Beskrivningar ska inte kapas vid 200 tecken (beviset "koncernbokslut för 12
  legala enheter" är exakt det rekryteraren letar efter).

### B6. Dela till hiring manager (våg 2)
Tokeniserad länk med utgångsdatum, maskerad enligt gällande regler; full version
efter accept. Utan detta blir det skärmdumpar i Slack utan maskering.

---

## FAS C — Arbetsstilsrapporten (utväxlingen på 120 frågor)

Psykometrikerns kärnpoäng: personlighetsdata är bra på att beskriva HUR någon
arbetar (inte hur bra), på att strukturera intervjun (strukturerad intervju har
validitet ~0.42 — högst av allt vi har), och på onboarding. Den är värdelös för
ranking. "Visning, aldrig filtrering" är alltså psykometriskt korrekt, inte bara etik.

### C1. Ny härledningsmotor: ipsativ saliens (ersätter absoluta trösklar)
Verkliga värden klustrar 25–69, så absoluta golv missar profilens FORM.
```
m = medel över de 19 whitelistade måtten (18 facetter + composure)
d = score - m
SALIENT_HIGH: d >= 7 och score >= 55   (driver påståenden/rubriker)
SECONDARY:    d >= 4 och score >= 52   (fyller sektioner)
BAND (spektra, 5 lägen, aldrig siffror):
  <40 → 1, 40–47 → 2, 48–54 → 3, 55–61 → 4, >=62 → 5
  (kalibrera om till percentilband p20/p40/p60/p80 när N >= 150)
```
Rapporten kräver minst 3 SALIENT_HIGH eller 5 SECONDARY, annars dagens kompakta
panel som fallback. ALLT regelverk (trösklar, band, banker, kombinationstabeller)
ligger som data i workStyle.ts så kandidatens förhandsvisning och rekryterarens vy
garanterat renderar ur samma härledning.

### C2. Bipolära spektra (löser "horoskop"-problemet inom skyddsräckena)
Rekryteraren ville se hela profilen; psykometrikern förbjuder siffror. Syntesen:
5-bands-spektra där BÅDA polerna är likvärdigt positiva arbetsstilar, aldrig
brist mot styrka. Band 3 (mitten) renderas som "Flexibel mellan lägena" och
genererar ingen copy. Skillnaden mellan kandidater SYNS nu — utan råpoäng.
Uppdatera skyddsräckeskommentaren i filhuvudet: "lågt band renderas endast som
neutral pol i godkända bipolära spektra, aldrig som text".

### C3. Rapportens sektioner (rekryterarens detaljvy)
- **A. Så arbetar hen** — c2_orderliness, c5_self_discipline, c6_cautiousness,
  e4_activity_level, c4_achievement_striving. Spektra: "Improviserar och anpassar ↔
  Planerar och strukturerar" (c2), "Snabb till beslut ↔ Grundlig före beslut" (c6),
  "Jämnt uthålligt tempo ↔ Högt tempo, många bollar" (e4). + sammanfattande mening
  ur bandkombination.
- **B. Så samarbetar hen** — a4, a1, a3, a6, e1, e2. Spektrum: "Får energi av eget
  fokusarbete ↔ Får energi av samarbete i grupp" (e2) + 2–3 punktpåståenden.
- **C. Så leds och drivs hen** — e3, c1, c4, komposit drive=medel(c4,c1,e4).
  Spektrum: "Påverkar genom lyssnande och underlag ↔ Tar naturligt kommandot" (e3)
  + "Motiveras av"-punkter (bank: c4→mätbara mål, o5→komplexa problem, a3→göra
  skillnad, e1→relationer, o4→oprövade uppgifter, c2→rätt från början).
- **D. Kommer till sin rätt när** — kombinationskort "Trivs när X / Utmanas när Y"
  där Y ALLTID är en miljöegenskap, aldrig en personegenskap (kandidaten har inga
  brister, miljöer har olika passform). Regeltabell i psykometrikerns leverans
  (7 kombinationer, t.ex. c2+c5 → "Trivs när processer är tydliga... / Utmanas när
  planer rivs upp dagligen utan förklaring"). composure saknar rimligt Y → visa
  bara Trivs-delen.
- **E. Behöver för att prestera** — 3 punkter speglade ur SALIENT_HIGH-styrkor
  (aldrig ur låga värden).
- **F. Onboarda så här** (låses upp med kontakt) — "Första 90 dagarna", 3 punkter
  ur topp-3 SALIENT.
- **G. Fördjupad intervjuguide** (låses upp med kontakt) — 5–7 frågor i STAR-format
  med `listenFor: string[]` per fråga + 1–2 KOMBINATIONSFRÅGOR (t.ex. c4+a4 båda
  SALIENT: "Du verkar både tävlingsinriktad och mån om samförstånd — berätta om en
  gång de två krockade"). Etikett per fråga: "Utgår från kandidatens styrka: X".
  Detta är den mest evidensbaserade värdehöjningen i hela systemet.

Rapporthuvudets disclaimer skrivs som styrkedeklaration:
> "Den här profilen bygger på kandidatens egen skattning i ett fördjupat
> personlighetstest (120 frågor, femfaktormodellen). Den beskriver arbetssätt och
> trivsel, inte kompetens eller förväntad prestation. Använd den för att ställa
> bättre frågor, inte för att sortera. Kandidaten ser exakt samma rapport som du."

### C4. Ny samtyckesnivå
show_personality blir nivå 1 (dagens exponering: styrkor + arketyp + påståenden).
Fulla rapporten kräver nivå 2: "Visa min fullständiga arbetsstilsrapport" — separat
opt-in med förhandsvisning där kandidaten ser EXAKT rekryterarens vy (spektra visar
indirekt var kandidaten inte ligger; det ska aktivt godkännas).

### C5. Kandidatens egen utväxling (testkonverteringsmotorn)
- "Din arbetsstil i ord": hela rapporten i du-form + privat sektion "Din
  energibudget" (delas aldrig).
- Intervjuförberedelse: kandidaten ser och kan öva på exakt de frågor rekryteraren
  får, med STAR-mall och skrivyta. Ingen svensk konkurrent har detta.
- Grundtestare: låst förhandsvisning med skarpa sektionsrubriker och blurrat
  innehåll → konvertering till 120-frågorstestet.
- Kontexttaggar: kandidaten väljer själv upp till 2 kvalificerade taggar
  ("Söker mig till: Analytiskt djuparbete") som visas som kandidatens EGEN
  självpresentation — sökbar på samma villkor som pitch, aldrig som testfilter.

---

## FAS D — Bransch/miljökontext utan avanonymisering (våg 2)

Härled bransch/sektor/grov bolagsstorlek ur arbetsgivarnamnen server-side
(namnen finns i structured_data, maskeringen sker redan i mapExperience) och
exponera ENDAST etiketten: "4 år inom revision/byrå", "senast i noterad
industrikoncern". Största informationshöjningen som är förenlig med
anonymitetsmodellen — miljön är signal #3 i rekryterarens verklighetscheck.

---

## Röda linjer (bygg/påstå ALDRIG)

- Matchprocent eller lämplighetsprediktion på personlighet ("X % match mot rollen").
- Ranking/sortering/filtrering på personlighetsdata åt rekryterare — gör oss till
  högrisk-AI under EU AI Act (Annex III, anställning). Ren visning med deterministisk
  förklarbar härledning + mänskligt beslut är en väsentligt lägre riskposition;
  GDPR art. 22 aktiveras inte så länge systemet inte fattar beslut.
- Integritets-/ärlighetsinferenser (a2_morality förblir svartlistad).
- Teamsammansättningsanalys över flera kandidater (låter oskyldigt, är urval).
- Personlighet i samma visuella grammatik som testpercentiler (inga siffror,
  procenttal eller staplar som liknar testbadgarna — rågången ska synas).
- Testresultat äldre än 24 månader visas med "Testet gjordes för över två år sedan".
- Logga facettfördelningar från start så en framtida DIF-analys är möjlig.

## Prioriteringsordning (experternas eniga rekommendation)

1. **A1–A3** (sökning, testintegritet, filter) — utan dessa är allt annat lönlöst.
   "En rekryterare förlåter en liten pool, men förlåter aldrig att verktyget inte
   hittar kandidaten som bevisligen finns i poolen."
2. **C1–C3 + G** (arbetsstilsrapporten) — högst upplevt värde per byggtimme
   (~2–3 dagar, infrastrukturen finns), och det direkta svaret på ägarens fråga.
3. **B1–B2** (tabell + peek-panel) — det som löser "amatörmässigt"-intrycket visuellt.
4. **B3–B5** (projekt, bevakning, jämför, detaljprofil) — det som gör en sökning
   till ett pågående rekryteringsarbete.
5. **C4–C5, B6, D** — våg 2.

## Nya komponenter/filer (ur UX-specen)

Nya: CandidateTable, CandidateTableRow, PercentileDots, MatchReasonTooltip,
FilterPanel, PeekPanel, AddToProjectMenu, CompareToolbar, WorkStyleSpectrum,
QuickSummaryCards, StickyActionBar, RecruiterSideNav; routes projekt/,
projekt/[projectId]/, jamfor/, inbox/.
Ändras: rekryterare/page.tsx (tabell-layout), pool/route.ts (tokeniserad sökning,
nya filter, matchReasons, paginering), candidateData.ts (workStyleArchetype +
educationLevelBucket på kortet, matchReasons-byggare, nivåviktade badges),
workStyle.ts (saliens-motor, band, spektra, utökade banker), kandidat/[userId]/
page.tsx (ny ordning + action-bar).
Nya tabeller: recruiter_projects, recruiter_project_candidates,
recruiter_candidate_notes, recruiter_saved_searches.
