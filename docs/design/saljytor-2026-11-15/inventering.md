# Inventering av säljytor, 2026-11-15

Underlag för granskningen av alla reklamkort, banners, betalväggar och popups. Framtagen av Explore-agent ur koden (main be2c78a1). Ägarens utgångspunkt: GratisKortets sista rad "Nivåkollen i testerna med genomgång, och ett första träningspass" säljer inte, för ingen vet vad Nivåkollen är och det framgår inte att vi har en massa tester att öva på.

Platshållare: FREE_TEMPLATE_COUNT 3, TEMPLATE_COUNT 41, FREE_CV_EXPORTS 1 (src/lib/cv/template-antal.ts); FREE_TIER_JOB_LIMIT 3, JOB_MATCHES_PER_RUN 25; FREE_CHAT_MESSAGES 10, FREE_LETTERS 1, LETTER_WINDOW_DAYS 7, CV_ANALYSIS_LIMIT 1. paketNamn "Jobbcoach Premium", kopKnapp "Köp Premium, 149 kr i månaden". HELA_PAKETET_RADER (src/lib/plans/plans.ts:93-97): "Alla rekryteringstester, övningsprov och det fördjupade personlighetstestet" / "Alla CV-mallar, CV-analysen, personliga brev och LinkedIn" / "Jobbmatchning varje natt, alla träffar med skälen" / "Jobbcoachen, fråga så mycket du vill" / "Bli upptäckt av rekryterare, anonymt" (+ "Säg upp när du vill").

## Delade copy-källor
- src/lib/plans/plans.ts: namn, pris, highlights, kopKnapp
- src/components/artiklar/reklam/reklam-copy.ts: alla artikelkort
- src/components/paywall/paywall-copy.ts: betalväggar, GRATISRADER, PAKETRADER
- src/components/pricing/paket-copy.ts: prissidan, köpsteget, kontosidan
- src/app/(public)/priser/components/priser-data.ts: FREE_HIGHLIGHTS, GRATIS_RAD, jämförelsetabell, FAQ
- src/components/registrering/registrering-copy.ts: registrering, provspärrar, PROVA_OCKSA
- src/lib/kampanj/kampanj.ts: Black Week / Cyber Monday
- src/lib/traning/hem-copy.ts, pass-copy.ts: testrummets låsta rader

## A. PUBLIKT

### A1. GratisKort ("UTAN ATT BETALA")
ArtikelReklam.tsx:356, copy GRATIS_KORT reklam-copy.ts:253-266. Visas sist i artiklar i klustret generic, och som plats 4 i /artiklar-listan.
- Eyebrow "Utan att betala". Rubrik "Vill du prova innan du läser vidare?"
- Knapp "Skapa konto gratis" (/register). Länk "Se vad som ingår i Premium".
- Punkter: "Tre CV-mallar och en nedladdning" (länk /verktyg/cv-mallar) / "En CV-analys med poäng och tyngsta fyndet" / "Ett personligt brev var sjunde dag, att läsa på skärmen" / "Tre matchade jobb och tio frågor till Jobbcoachen" / "Nivåkollen i testerna med genomgång, och ett första träningspass"
- Sidokolumnvariant SidoPaketKort 'gratis' (desktop): samma men bara tre första punkterna.

### A2. Övriga artikelkort (ArtikelReklam.tsx, reklam-copy.ts). Kluster: test, interview, letter, cv, career, generic.
InlineKort (efter andra stycket), eyebrow "Verktyget":
- mallar (cv/generic): "Bygg CV:t på en mall som rekryteringssystem läser" / "Tre mallar och en nedladdning utan att betala, byggda så att rekryteringssystem läser dem rätt. Du fyller i, vi formaterar." / knapp "Välj en mall" / "Alla 41 mallar och hela CV-analysen ingår i Premium, 149 kr i månaden."
- analys: "Se varför CV:t fastnar innan du skickar det" / "Ladda upp CV:t, så läser vi det som en rekryterare gör i första urvalet. Poängen och det tyngsta fyndet är gratis." / "Analysera mitt CV" / "Hela analysen med varje fynd och åtgärd ingår i Premium, 149 kr i månaden."
- brev: "Skriv det personliga brevet på annonsen, inte på mallen" / "Klistra in annonsen, välj ton, vi skriver utkastet utifrån ditt CV. Ett personligt brev var sjunde dag att läsa på skärmen, gratis." / "Skriv mitt personliga brev" / "Personliga brev utan tak, som PDF, ingår i Premium, 149 kr i månaden."
- coach: "Träna svaret innan du sitter i rummet" / "Bolla dina svar med Jobbcoachen och få följdfrågorna en rekryterare hade ställt. Tio frågor utan att betala." / "Träna intervjufrågor" / "Jobbcoachen, så mycket du vill, ingår i Premium, 149 kr i månaden."
- raknare: "Räkna på det själv, fråga sedan" + länkar. lankrad: "Räkna på det själv:" + länkar.
- INLINE.test (syns aldrig, testklustret får ProvKort): "Öva på frågorna innan de räknas" / "Matrislogik, verbalt och numeriskt med facit och förklaring till varje fråga. Fem frågor gratis här. Nivåkollen och första passet gratis med konto." Paketraden används på ProvKort: "Alla nivåer, övningsprov mot klockan och fördjupade personlighetstestet ingår i Premium, 149 kr i månaden."

ProvKort (test-klustret, ArtikelReklam.tsx:176): eyebrow "Prova på riktigt" / "Vilken figur hör hemma i den tomma rutan?" / "Det här är en av våra expertfrågor: tre regler samtidigt, form, tecken och fyllning. Fem frågor gratis här, rätt och fel direkt. Nivåkollen och första passet gratis med konto." / knapp "Prova fem frågor" / länk "Se alla tester och nivåer". MDX <TestKort/> (1 artikel): "Inför intervjun" / "Intervjun kommer sällan ensam" / "Logiktest och personlighetstest ingår ofta i samma process, före eller efter intervjun. Prova fem matrisfrågor gratis, rätt och fel direkt, eller se alla tester och nivåer."

TypProvKort (TypProvKort.tsx:41-87, MDX i 5 artiklar):
- deduktiv: "Öva deduktivt" / "Deduktivt test med lösningen efter varje svar" / "Börja med Nivåkollen i deduktivt. Den är gratis med konto, visar var du ligger och går igenom varje uppgift efteråt." / "Gör Nivåkollen i deduktivt" / "Övningsprovet mot klockan" / "Pass varje dag, avancerad och expert och övningsprovet mot klockan ingår i Premium, 149 kr i månaden."
- talserie: "Öva talserier" / "Talserier i tre nivåer, med lösning efter varje rad" / "Grundnivån är gratis med konto: femton talserier på tolv minuter och genomgång av varje rad. Sedan två luckor som i I-provet." / "Gör nivåtestet i talserier" / "I-provet, övningsprov" / "Avancerad och expert, pass varje dag och I-provets övningsprov ingår i Premium, 149 kr i månaden."
- spatial: "Öva spatial förmåga" / "Vridna figurer, pappersvikning och tärningar" / "Grundnivån i spatial förmåga är gratis med konto: femton uppgifter på tolv minuter och genomgång av varje figur." / "Gör nivåtestet i spatial förmåga"
- ordforrad: "Öva ordförståelse" / "Synonymer och motsatsord i tre nivåer" / "Grundnivån är gratis med konto: tjugo ord på åtta minuter, och efteråt betydelsen och en exempelmening för varje ord." / "Gör nivåtestet i ordförråd"
- iprov: "Öva inför I-provet" / "Alla sex deltester, i provets ordning" / "Grundnivån i synonymer och motsatsord, talserier och spatial förmåga är gratis med konto. Övningsprovet med tid per deltest ingår i Premium." / "Börja med grundnivån gratis" / "Halva och hela I-provets övningsprov, alla nivåer och pass varje dag ingår i Premium, 149 kr i månaden."

SidoPaketKort (desktop-sidokolumn): eyebrow "Jobbcoach Premium", text "CV, personliga brev, tester, jobbmatchning och Jobbcoachen", "149 kr" + "i månaden, ingen bindningstid", knapp "Se vad som ingår". test: "Träna med klockan på innan kallelsen kommer" + "Fem frågor gratis här. Nivåkollen och första passet gratis med konto. Resten ingår i Premium." cv: "Ett CV som går igenom första urvalet" + "Tre mallar och ett personligt brev var sjunde dag är gratis." allt: "Förberedd in i intervjun och löneförhandlingen".

SlutKort (efter brödtexten, PremiumBlock): eyebrow "Jobbcoach Premium", "149 kr i månaden, säg upp när du vill.", knapp "Köp Premium, 149 kr i månaden", länk "Se vad som ingår".
- test: "Alla nivåer. Klockan på." / "Logik, verbalt och numeriskt i grund, avancerad och expert, med förklaring till varje svar" / "Övningsprov på 25 till 40 minuter och automatisk inlämning, samma tidspress som hos rekryteraren" / "Fördjupade personlighetstestet, 120 påståenden" / "Dessutom CV-analysen, alla mallar, personliga brev, jobbmatchning och Jobbcoachen"
- cv: "Ett CV som går igenom. Personliga brev som svarar på annonsen." / "Hela CV-analysen med varje fynd och åtgärd" / "Alla 41 mallar, nedladdning utan tak" / "Personliga brev utan tak, som PDF" / "LinkedIn-profilen omskriven" / "Dessutom alla rekryteringstester, jobbmatchning och Jobbcoachen"
- allt: "Allt ingår. Från första annonsen till löneförhandlingen." + HELA_PAKETET-liknande rader.

ListaSlutKort (/artiklar efter paginering): "Läs klart. gör sedan." (BUGG: litet g) / "Allt i en prenumeration, 149 kr i månaden. Ingen bindningstid, säg upp med ett klick." / HELA_PAKETET_RADER / "Se vad som ingår" / "Eller börja gratis med en CV-mall".

Hjälteknapp i artikel: test "Prova fem frågor gratis", raknare "Fråga Jobbcoachen". StickyMobileCTA (mobil): interview "Träna intervjufrågor", test "Prova fem frågor gratis", letter "Skapa mitt brev", cv/generic "Välj en mall"; exempelsidor "Använd denna mall som {yrke}" / "Skapa mitt brev som {yrke}".

Inbäddade prov: ArtikelProv (16 artiklar) "Svara på uppgiften här, så fortsätter provet med fyra till. Rätt svar och regeln bakom visas när provet är hämtat till ett gratiskonto." Premiumrad "Premium, 149 kr i månaden, när du sedan vill träna på din nivå varje dag. Först Nivåkollen, gratis." Knapp "Se vad jag missade". Intervjuprov: "Se hela återkopplingen och ditt svar omskrivet" ... "Inget kreditkort · Avsluta när du vill". Personlighetsprov: "Spara profilen och se hela tolkningen" ...

### A3. Kampanjraden (Black Week 23–29 nov, Cyber Monday 30 nov)
KampanjRadPublik (Kampanj.tsx:72): "BLACK WEEK Första månaden Premium för 99 kr, till och med söndag." + "Se erbjudandet". Cyber Monday: "Första månaden Premium för 49 kr. Bara i dag till 23.59." Knapp under kampanj "Köp Premium, 99 kr första månaden". Inget kampanjkort finns (copy.kortText oanvänd).

### A4. Startsidan (Startsidan.tsx, hårdkodat)
Hjälte "Därför får du inte svar på dina ansökningar", "Skapa konto gratis" / "Se hur det fungerar". Stationer: Tester "Nivåkollen, första passet och personlighetstestet gratis"; CV-analys "Poängen och tyngsta fyndet gratis"; Jobbmatchning "Tre träffar gratis"; Brev "Första brevet gratis, sedan ett i veckan"; Coach "Tio frågor gratis". PremiumBlock "Allt i Premium" / "Alla verktyg utan tak. Mindre än en lunch i månaden, säg upp med ett klick." + HELA_PAKETET_RADER. FAQ: "Gratisnivån kräver inget kort: grundnivån i varje testtyp och personlighetstestet, 3 CV-mallar ..."

### A5. /priser
H1 "Jobbcoach Premium, 149 kr i månaden". Gratiskortet "Vill du se först?" / "Utan att betala får du **Nivåkollen i testerna** med full genomgång och ett första träningspass samma dag, **personlighetstestet** med 50 påståenden, **3 CV-mallar** ...". Talrad "1 Nivåkollen / 50 påståenden / 3 CV-mallar / 1 CV-analys / 1 brev, sedan ett i veckan / 3 matchade jobb". Tester-stationen: "Ingår i Premium. Gratis: Nivåkollen med genomgång, ett första träningspass och personlighetstestet med 50 påståenden." Testtexten paket-copy.ts:257: "samma fyra typer ... matrislogik, verbalt resonemang, numeriskt och personlighet" (FEL, det finns 8 kognitiva typer).

### A6. Verktygssidor
/verktyg/rekryteringstester: hjälte "Fem frågor gratis här och Nivåkollen gratis med konto. ..."; ProvaKort "Gör ett prov direkt, utan konto" med punkt "Samma frågebank som i det skarpa testet" (riskabelt); H2 "Åtta testtyper, alla gratis att börja"; PremiumBlock "Träna nu. Kom förberedd sen." / "Fem frågor gratis här. Nivåkollen och första passet gratis med konto. Alla nivåer, övningsprov och din historik ingår i Premium."
/verktyg/personligt-brev, /jobbmatchning, cv-analys, cv-mallar, jobbcoachen, linkedin, bli-upptackt, personlighetstest: PremiumBlock med "Jobbcoach Premium, 149 kr i månaden" och respektive text (se källorna).

### A7. Övrigt publikt
/funktioner bläcksektion "Jobben hittar dig, och du går förberedd in i intervjun." Kalkylatorer: "Ta siffrorna med in i lönesamtalet" + "Fråga jobbcoachen" (litet j) + "Prova fem testfrågor gratis". /exempel ExempelCTABand: "Ett brev om dagen och en CV-analys var tredje dag, helt gratis." (FEL) + "Ingen kortuppgift · Ingen bindningstid · GDPR, data i EU".

### A8. Registreringen
KONTO_GRATIS: "Det här ingår gratis" / "Börja med det som avgör urvalet" / Nivåkollen / CV-analysen / Ett personligt brev / "Premium, 149 kr i månaden, när du vill ha allt utan tak."

## B. INLOGGAT
B1. KampanjRadInloggad "BLACK WEEK första månaden Premium för 99 kr. Köp Premium, 99 kr" + "Nej tack". EmailVerificationBanner "Bekräfta din e-post för att spara dokument permanent." InstallPrompt "Lägg Jobbcoach på hemskärmen" + "Lägg till".

B2. PaywallCard (paywall-copy.ts:250-391), alltid "Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill." + "Köp Premium, 149 kr i månaden".
- mall: "Mallen ingår i Premium" / "Du ser hela mallen som den blir. I Premium får du alla 41, plus personliga brev, hela CV-analysen och alla rekryteringstester." / "Välj bland de 3 fria"
- testniva: "Avancerad nivå ingår i Premium" (eller "Dagens pass / Extrapassen / Övningsprovet / Nya nivåkoller ingår i Premium", "Hela kurvan ingår i Premium") / "Premium ger alla 19 tester, alla nivåer, övningsprov mot klockan, det fördjupade personlighetstestet och förklaring till varje fråga." (FEL: 29 tester)
- analys: "Åtgärderna ingår i Premium" / "Du har sett det tyngsta fyndet och din läsbarhetspoäng. Premium öppnar åtgärden bakom varje rubrik och låter dig köra om analysen när du rättat."
- nedladdning: "Ditt personliga brev är klart" / "Läs och kopiera det fritt. Nedladdning som PDF och Word ingår i Premium, med alla mallar och hela CV-analysen." / "Kopiera texten i stället"
- cv-export: "Din gratis nedladdning är använd"
- jobbtraffar: "Se varför du passar för alla {n}" / "Du ser de tre bästa med skälen utskrivna. Premium öppnar resten, ..."
- linkedin, bli-upptackt, chatt ("Dina tio meddelanden är använda"), historik ("Du ser ditt senaste resultat"), kvot ("Ditt personliga brev för veckan är skrivet" / "Påminn mig")
- test-tak: "Dagens omgång är gjord" / "Premium ger alla nivåer, övningsprov och obegränsat antal försök." (bryter regeln mot "obegränsat")
- cv-antal, af-rapport, nedgraderad ("Din period är slut" / "Fortsätt gratis")
GraValSheet: PaywallCard i ark från låschip.

B3. Testrummet: "Nivåkollen är gratis, med eller utan Premium." / "Grå dagar ingår i Premium." / "Nio uppgifter på din nivå. Från dag två ingår passen i Premium." / "Första nivåkollen är gratis. Nästa ingår i Premium." ImorgonKort efter Nivåkollen: "I morgon, passet på din nivå" / "Ingår i Premium" / "Övningsprovet i {format}. {n} dagar till provet. Månaden täcker hela vägen: passen, nivåkollerna och övningsproven de sista dagarna." Planens betalvägg: "{n} dagar kvar. Månaden täcker hela vägen." / "Ett pass om dagen på din nivå, extrapass på det du tappar, ny nivåkoll varje vecka, hela kurvan och övningsprov i samma format som {X}. Plus personliga brev, Jobbcoachen och matchade jobb." Resultat för prov utan konto: "Nästa steg: Nivåkollen" / "Kolla min nivå, cirka {n} min". TesterHubClient: "Gratis att prova: nivåkollen en gång med genomgång och ett första träningspass samma dag. Resten ingår i Jobbcoach Premium, 149 kr i månaden."

B4. PremiumGateModal (Smart ton), LockedWorkStylePreview, ProvaOcksa ("Klarar du logiktestet?"), Välkommen steg 3 (ForslagSteg; intervjuvalet har felaktigt rubriken "Var förberedd på testdagen"), prenumerationssidan, köpsteget, mobilappens köpvy ("Ett pass om dagen nära din nivå ..." / "Fortsätt till Google Play").

## C. Testutbudet (fakta för säljtext)
testConfig.ts: 29 tester, 9 testtyper (8 kognitiva + personlighet), tre nivåer var:
Logiktest/matris (15 frågor/20–30 min, prov 18/25), Figurserier (15), Deduktiv slutledning (12/15 min), Talserier (15/12–18 min), Spatial förmåga (15), Ordförråd (20/8–12 min), Verbalt resonemang (40/20 min, prov 48/40), Numeriskt (20/25 min, prov 36/40), Personlighet (50 resp. 120 påståenden).
Övningsprov i samma format som: Matrigma (klassisk och adaptiv), Alva Logic, SHL Verify (logik, verbalt, numeriskt, deduktivt), Aon scales ix / cut-e (logik, figurer), I-provet (Polisen/Försvarsmakten, halvt och helt, sex deltester), Lokförare (Aons tempo), eget format.
Gratis utan konto: 5 frågor per typ, I-provet 6 uppgifter, personlighet 20 påståenden. Facit kräver konto.
Gratis med konto: Nivåkollen en gång med genomgång (adaptiv, cirka 8 min), ett grundpass samma dag (9 uppgifter), grundnivån i VARJE testtyp (1 slutförd per typ och dygn), personlighet 50 påståenden, resultat/genomgång alltid öppna.
Premium: avancerad + expert, prov mot klockan, dagliga pass, riktade pass/extrapass, ny nivåkoll varje vecka, hela kurvan, övningsprov i leverantörens format, I-provets övningsprov, fördjupat personlighetstest 120 påståenden.

## D. Fel, dubbletter, oanvänt
D1 fel: "alla 19 tester" (29); copyn räknar bara 3–4 testtyper på många ställen (paket-copy.ts:257, reklam-copy.ts:69 och :210, registrering-copy.ts:47 och :235, rekryteringstestsidans steg, prisjämförelsen); ExempelCTABand gratisnivå fel; "obegränsat" i test-tak; ForslagSteg intervjuvalets rubrik kopierad; mittpunkter "·" i flera rader; "Samma frågebank som i det skarpa testet"; "Läs klart. gör sedan.".
D2 dubbletter: gratisnivån listas i fyra källor och beskrivs i en mening på minst sex sätt; gratis i testerna beskrivs tre olika sätt ("Nivåkollen och första passet" / "grundnivån i varje testtyp" / "Nivåkollen, första passet och personlighetstestet"), koden ger alla tre.
D3 oanvända komponenter: CrossLinkCTA, exempel-shared/FinalCTA, CompleteApplicationPackage, NumericalStartCTA, VerbalStartCTA, rewards/ActivationModal, pricing/JamforelseTabell, PremiumNavbar(+backup), FeatureMorphingCard, LiveAIDemo, PersonalizedUserJourney, StaticFeatureCard, InteractiveFunctionExplorer, CVGenerationModal.
D4 oanvända copy-nycklar i paket-copy, priser-data, paywall-copy GRATISRADER, kampanj kortText, INLINE.test.
D5 livscykelmejlen (src/lib/email/lifecycle/templates/campaign-gratisniva.ts, campaign-kampanj.ts) ej inventerade.
