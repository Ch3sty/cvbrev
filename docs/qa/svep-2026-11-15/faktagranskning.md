# Faktagranskning, svep 2026-11-15

Gren fix/svep-texter-artiklar. Källorna är hämtade och lästa i sin helhet 2026-11-15. Produktpåståenden är kontrollerade mot src/, supabase/functions/ och kunskapsbasen i databasen (ai_documents).

**Omdöme: godkänd efter rättelser.** Två produktfel måste rättas: CV-analysens poäng och påståendet att alla mallar har en kolumn. Därtill ska fyra källcitat justeras. Vi hittade inga påhittade fall, citat eller resultat. Exempelpersonerna är märkta som påhittade.

---

## din-digitala-jobbcoach.mdx

### Måste rättas

1. **Rad 159, CV-analysens poäng.** Nu står det: "ger poäng på tydlighet och struktur, innehåll, resultat och nyckelord".
   - **Det som stämmer:** analysen ger en enda läsbarhetspoäng från 0 till 100, plus förbättringsförslag i kategorier. Den ger inga poäng per område.
   - **Belägg:**
     - `src/app/dashboard/cv-analys/components/steps/AnalysisOverviewStep.tsx:107` ("Läsbarhetspoäng") och `:116` ("Poängen går från 0 till 100").
     - Kategorierna i resultatet är Personbeskrivning, Rollbaserade förbättringar, Kompetenser och färdigheter samt Automatiska förbättringar (`AnalysisOverviewStep.tsx:62-89`).
     - Edge-funktionen returnerar ett enda `atsScore` (`supabase/functions/analyze-cv-background/index.ts:446`).
   - **Förslag:** "ger en läsbarhetspoäng från 0 till 100 och en lista med förbättringar, där det tyngsta står först".
   - **Bakgrund:** formuleringen kommer från felaktig säljtext i `src/components/pricing/paket-copy.ts:196` ("poäng 1 till 10 på tydlighet och struktur...") och från telefonbilden i `src/components/publikt/telefon/skarmar/SkarmCvAnalys.tsx:13-18`. Båda är egna fel utanför artikeln.
2. **Rad 60, AF-citatet är avklippt.** Artikeln slutar med "...som arbetsgivaren kan tänkas fråga." och har punkten innanför citattecknen.
   - **Källan:** "Be sedan AI-verktyget att ställa de frågor till dig som arbetsgivaren kan tänkas fråga dig om på jobbintervjun." (https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2024-05-14-sa-kan-ai-hjalpa-dig-i-ditt-jobbsokande)
   - **Åtgärd:** citera hela meningen.
3. **Rad 94, Kollega.** Artikeln skriver i nutid: "att det är en viktig kompetens".
   - **Källan skriver i framtid:** "I framtiden blir det en viktig kompetens att kunna granska AI-genererade förslag med kritisk blick, spår karriärvägledaren Edvard Danielsson." (https://kollega.se/arbetsmarknad/sa-later-du-ai-soka-jobb-dig-tips-fran-proffs)
   - **Åtgärd:** skriv "att det blir en viktig kompetens".

### Obelagt men ok/stryk

- **Rad 72, NBER.** Källsidan belägger "nearly half a million jobseekers", "hired 8% more often" och "no evidence that employers were less satisfied". Den säger "online labor market" och "treated jobseekers". Den nämner inte att plattformen är för frilansuppdrag eller internationell, och inte att hälften fick hjälp.
  - **Åtgärd:** stryk "hälften", eller belägg det i själva rapporten. "Frilans" är ok som beskrivning, men sammanfattningen på NBER-sidan belägger det inte.
- **Rad 165, TRR.** Sidan byggs med JavaScript och lästes bara via sammanfattningen, där påståendet stämmer.
- **Tidigare arbetslista.** `docs/qa/produkttexter-2026-11-15.md` finns inte i arbetskopian. Den listans uppgifter stämmer ändå med koden: en poäng 0-100, inga betyg per kategori, en gratis analys per konto och bara CV:t som underlag (`src/lib/quota/quotaService.ts:59` och `src/app/api/cv/analyze/route.ts:133-135`).

### Kontrollerat och korrekt

**Källorna:**
- SCB: 40 till 58 procent för 25-34 år.
- AF-citaten på rad 54, 141 och 143.
- Jobbland:
  - 315 svarande, 44 procent fördelat på 14 och 30 procent, och 9 procent.
  - Handeln åtta av tio.
  - Datumet 2025-05-14.
- TNG:
  - Namnet, titeln och citatet.
  - Bollplank som första råd och "Fabricera inte erfarenheter eller resultat".
  - Datumen.
- Rusta och matcha:
  - Möte var fjortonde dag och minst var fjärde vecka.
  - Sex månader.
- Unionen: 1 350 och 1 800 kr.

**Jobbcoachen:**
- Tio meddelanden per konto som inte kommer tillbaka (`quotaService.ts:48`, `:199-222`).
- "(Källa N)" (`src/app/api/jobbcoachen/chat/route.ts:25`, `:321`).
- 50 dokument i `ai_documents` som täcker CV, lön, intervju, LAS och uppsägning, a-kassa, aktivitetsrapportering och CSN:s omställningsstudiestöd.
- Bifoga sparat CV eller brev (`src/components/jobbcoachen/ChatInput.tsx:14`, `:55-61`).
- Profilen med målroll, stad och bransch följer med (`route.ts:193`, `:232-235`).
- Ingen juridisk rådgivning och aldrig personnummer (`route.ts:46-47`).
- Samtalet ligger kvar när kvoten är slut, eftersom bara inmatningen spärras (`JobbcoachenClient.tsx:212`).

**Gratisnivån:**
- En analys per konto, med poängen och det tyngsta fyndet (`src/components/cv/AnalysisLockedFindings.tsx:7`).
- Tre mallar (`src/lib/cv/template-antal.ts:17`).
- Tre träffar (`src/app/dashboard/jobbmatchning/JobbmatchningClient.tsx:101`).
- Brevet en gång och sedan ett i veckan (`quotaService.ts:39-45`).
- Grundpasset dag 0 (`src/lib/traning/gratisniva.ts:20-25`).

**Övrigt:**
- Premium kostar 149 kr utan bindningstid och utan provperiod (`src/lib/plans/plans.ts:184-190`; `src/app/api/stripe/create-plan-session/route.ts:184`).
- Platsbanken via JobSearch (`supabase/functions/sync-global-jobs/index.ts:20`).
- Fem toner (se brevartikeln).

**Fel i produkten, inte i artikeln:** för konton som har förbrukat sina tio meddelanden visar Jobbcoachen "Chatten öppnar igen efter midnatt" (`JobbcoachenClient.tsx:215`). Räknaren visar "... kvar idag" (`:225`). Kvoten gäller per konto, så båda texterna ger fel löfte och bör rättas i ett eget ärende.

---

## fardiga-personliga-brev.mdx

### Måste rättas

1. **Rad 46, snabbsvaret.** Där står: "Arbetsförmedlingen, Akavia och Saco ger samma råd: anpassa brevet till varje tjänst och håll det inom en A4-sida."
   - **Det som stämmer:** Saco säger ingenting om längd. Sacos text: "Brevet ska alltid vara anpassat för just det jobb som ansökan gäller." (https://www.saco.se/yrkesliv/jobb/jag-ska-soka-jobb/cv-och-personligt-brev/)
   - **Åtgärd:** byt Saco mot Vision eller ST när det gäller A4-rådet, eller dela meningen så att Saco bara står för anpassningen.
2. **Rad 54 och rad 165, Unionens frågor.** Bara den tredje rubriken har frågetecken i källan: "Varför vill jag jobba just här", "Varför vill jag ha jobbet" och "Varför passar jag för jobbet?". (https://www.unionen.se/filer/ovrigt/mallar-personligt-brev)
   - **Åtgärd:** stryk frågetecknen i de två första, eller skriv om utan citattecken.

### Obelagt men ok/stryk

- **Rad 56, Personligtbrev.se.** Sajten saknas i källistan. Påståendet stämmer (www.personligtbrev.se har mallar per yrke), men sajten bör läggas till i källorna.
- **Rad 205, respondentgruppen.** Skrivningen "employer branding eller i ledning" är en omskrivning. Källan säger "rekrytering, arbetsgivarvarumärke, rekryterings- marknadsföring eller inom företagsledningen". Det är inget citat, men "arbetsgivarvarumärke" ligger närmare källan och är svenska.
- **Rad 235, ST-citatet.** "En luftig A4 räcker" är början av meningen "En luftig A4 räcker gott och väl som personligt brev." Det är ok.
  - **Samma rad, Arbetsförmedlingen.** A4-rådet finns bara på den engelska sidan ("a maximum of one A4 page"), inte i artikeln med elva tips. Det är ok, eftersom den engelska sidan står i källistan.

### Kontrollerat och korrekt

**Källorna:**
- Vision har en gratis mall och en guide.
- Akavia har ingen mall men en guide.
- Academic Work har en mall.
- CVkungen har "Över 100".
- Citatet från personligt-brev.net är ordagrant.
- Citaten från Kommunal (rad 136, 211 och 227), Akavia (rad 136, 159 och 235), TNG och Saco (rad 203), ST och AF:s elva tips (rad 211) är ordagranna.
- Vision: tre till fyra stycken på sju rader.
- Jobbland: 315, 44 procent och 9 procent.

**Galleriet:**
- 89 brev (`src/app/(public)/exempel/components/galleri-data.ts:544` och framåt) i tio kategorier, bland dem vard, ekonomi, service och student (`src/app/(public)/exempel/components/exempel-data.ts:46-217`).
- Kategori-URL:erna genereras ur KATEGORIER (`personligt-brev-exempel/kategori/[kategori]/page.tsx:14-15`).

**Personerna:** Anna Bergström (ekonomiassistent), Lisa Andersson (undersköterska) och Emma Karlsson (butikssäljare) är samma personer i `personligt-brev-exempel/[yrke]/exempel-data.ts` och `cv-exempel/[yrke]/page.tsx`. Alla tre yrkena finns i både CV- och brevgalleriet.

**Brevverktyget:**
- Annonsen klistras in och brevet utgår från ett sparat CV (`src/app/api/letters/generate/route.ts:124`, `:158`). Uppladdningen nås via "Ladda upp CV" i väljaren (`CvPickerGrid.tsx:52`).
- De fem tonerna har rätt namn (`TonalityLanguageStep.tsx:57-85`).
- Automatiskt tonval finns bara i Premium (`:106-136`).
- Brevet kan skrivas på svenska eller engelska (`:92-94`).
- Första brevet är gratis, därefter ett per sju dygn (`quotaService.ts:38-40`).
- Att kopiera är fritt (`ViewLetterClient.tsx:122`).
- PDF och Word kräver `letter_download` (`src/app/api/letters/download/route.ts:255`, `:358-373`).
- Utan konto anger man yrke, arbetsgivare och erfarenhet och ser förhandsstycket (`src/app/api/public/letter-draft/route.ts:8`, `:24-29`; `src/lib/letters/public-draft.ts:51`).

---

## online-cv-byggare-gratis.mdx

### Måste rättas

1. **Rad 215, mallarnas kolumner.** Där står: "alla är byggda i en kolumn med svenska standardrubriker så att rekryteringssystemen läser dem rätt".
   - **Det som stämmer:** 17 av 41 mallar har två kolumner (`columns: 2` i `src/lib/cv/simple-templates.ts`), och 11 är markerade `atsSafe: false`. En av de tre gratismallarna, Sidopanel, har två kolumner, en sidopanel och ikoner (`simple-templates.ts:708-714`: "Tydlig sidopanel med kontakt och kompetenser", `features: { atsSafe: true, columns: 2 }`).
   - **Krock inom artikeln:** påståendet går emot artikelns eget råd på rad 19, 142, 175 och 227, där två kolumner och ikoner pekas ut som en risk.
   - **Förslag:** "de flesta mallarna, bland dem gratismallarna Norrsken och Student, har en kolumn med svenska standardrubriker". Lägg gärna till ett råd om att välja en enkolumnsmall om du söker via ett rekryteringssystem.
   - **Kontrollerat:** Norrsken och Student har båda `columns: 1` (`simple-templates.ts:44` och `:837`).
2. **Rad 213, förhandsvisningen.** Där står: "Förhandsvisningen ligger bredvid fälten hela tiden".
   - **Det som stämmer:** det gäller på desktop. På mobil öppnas förhandsvisningen i en låda (`CVCreatorWizard.tsx:201`, `mobilePreviewOpen`).
   - **Förslag:** "Förhandsvisningen ligger bredvid fälten på datorn och en knapptryckning bort i mobilen". Det här är ett mindre fel, men eftersom stycket lovar "samma ärlighet som vi kräver av andra" bör det rättas.

### Obelagt men ok/stryk

- **Rad 64-117 och 13, tabellen över sex byggare.** Byggarna har inga namngivna källor per rad, och vi har inte kontrollerat uppgifterna, bland dem "0 kr i 7 dagar, därefter 69 kr/vecka". Om citattecknen står kvar måste skribenten ha sidan sparad. Annars bör den skrivas som en omskrivning utan citattecken.
- **Rad 121, Konsumentverket.** Sidan säger "Granskad: 17 december 2025", inte "uppdaterad". Ändra till "granskad i december 2025", eller låt texten stå.
- **Rad 245, längden.** Rådet "en till två sidor" kommer från AF:s engelska Writing a CV ("1–2 pages is sufficient for a CV"), inte från den svenska guiden. Det är ok, eftersom sidan finns i källistan.
- **Rad 207, LinkedIn.** Knappen heter "Save to PDF" i källan. "Spara som PDF" är en rimlig svensk återgivning.

### Kontrollerat och korrekt

**Källorna:**
- Konsumentverkets citat är ordagranna, och 30 dagar stämmer.
- AF:s citat från 2026-02-10 är ordagranna, och så är rubrikerna, "högt upp" och filformatet.
- Rad 231 (vaga formuleringar) stämmer.
- AF Writing a CV om PDF stämmer.
- HR Dive/Ladders: 7,4 sekunder och beskrivningen av layouterna stämmer.
- LinkedIn: mobilappen och engelska som profilspråk stämmer.

**CV-byggaren:**
- Konto krävs (dashboard-rutt).
- De sju stegen har exakt de namn som står i artikeln (`src/app/dashboard/skapa-cv/components/steps.config.ts:17-23`).
- Utkastet sparas i localStorage (`skapa-cv/hooks/useAutoSave.ts:41`).
- Två CV gratis (`src/lib/supabase/premiumAccess.ts:138`).
- Mallen väljs i Granska-steget och låsta mallar går att förhandsvisa (`Step7Review.tsx:219-221`).
- 41 mallar, varav 3 gratis och 38 övriga (`src/lib/cv/template-antal.ts:14-20`).
- En PDF-export gratis (`template-antal.ts:27`; `src/app/api/cv/generate-formatted/route.ts:2332-2343`).
- Bekräftad e-post krävs (`generate-formatted/route.ts:2351`).
- Ingen vattenstämpel i mallarna (sökningen gav ingen träff).
- Uppladdning av .pdf, .docx och .txt (`src/components/cv/cv-uploader.tsx:266`), därefter mallval via `/dashboard/cv-mallar?cv=` (`MinaCvClient.tsx:493`).
- Ingen LinkedIn-import, bara ett fält för profiladressen (`Step1Kontakt.tsx:81`).
- LinkedIn-optimeringen kräver Premium (`linkedin-optimizer/page.tsx:57`) och kan spara resultatet som CV (`Step4Done.tsx:135`).
- Inget i artikeln påstår att CV:t kan laddas ner som Word. Rad 56 gäller Word-mallar för nedladdning, inte vår export. Det är ok.
- 149 kr i månaden, utan bindningstid och utan provperiod.
- En CV-analys gratis per konto.

---

## Runda 2 (2026-11-15)

Alla rättelser från runda 1 är införda och stämmer. De nya produktpåståendena är kontrollerade och stämmer också:

- **Fler brev än ett i veckan i Premium:** spärren gäller bara konton som inte betalat, `!harBetalt` i `src/app/api/letters/generate/route.ts:104`.
- **Ladda upp ett CV i brevverktyget:** knappen "Ladda upp CV" finns i `CvPickerGrid.tsx:52`.
- **Månadsprenumeration som förnyas, utan provperiod:** `mode: 'subscription'` i `src/lib/plans/plans.ts`, ingen `trial_period`.
- **Obegränsade nedladdningar och alla 41 mallar i Premium:** `cv_export` och `cv_templates_all` i `generate-formatted/route.ts:2314` och `:2332`.
- **Bifoga sparat CV och källmärkning i Jobbcoachen:** som i runda 1.

Citatet från CVfixaren står kvar, eftersom implementationsagenten har kontrollerat att det är ordagrant.

**Omdöme: godkänd.**
