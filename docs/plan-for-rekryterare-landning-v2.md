# Landningssidan /for-rekryterare v2 — djupare insikt, högre upplevt värde

Nuläge: 8 sektioner byggda före portal v2 (Hero, Vardeprops, SaFunkar,
Exempel, ProfilExempel, Trust, FAQ, CTABand). Sidan säljer "verifierade
testresultat + anonym pool" men visar inget av det som nu är produktens
kärna: relevanssökningen, testintegriteten, arbetsstilsrapporten,
arbetsflödet (projekt/bevakning/jämför/dela). Profilexemplet visar den
gamla 3-punkters arbetsstilspanelen.

## Strategi

Rekryterare litar inte på påståenden, de litar på mekanik. Sidan ska därför
VISA hur systemet fungerar i stället för att beskriva det: en interaktiv
sökdemo, en riktig rapportmock och en ärlig förklaring av varför siffrorna
tål följdfrågor. Differentiatorerna (ur expertanalysen) i prioritetsordning:

1. Svarsvilliga kandidater: alla har själva valt att synas, intresse landar
   hos någon som väntar på det.
2. Verifierad data FÖRE första kontakt, med integritet som tål granskning
   (första försöket räknas, nivåviktning, öppen normgrupp).
3. Bevakning: "Lägg in kravprofilen, vi mailar när rätt person dyker upp."
   Detta är också svaret på beta-poolens litenhet, vänd den till en styrka.
4. Budgetfilter utan löneexponering, data ingen annan har i sourcing-ledet.
5. Arbetsstilsrapporten + intervjuguiden: bättre intervjuer, inte urval.
   Etikhållningen (visning aldrig filtrering, kandidaten ser exakt samma
   rapport, AI Act-medveten design) säljs som en FÖRDEL, inte en brasklapp.

Ton: vi-form, copywriter-svenska, inga tankstreck, inga överlöften om
prediktion ("beskriver arbetssätt och trivsel, inte förväntad prestation").
Beta-framing behålls: "Tidig åtkomst, gratis under betan".

## Sektionsplan (i sidordning)

### 1. Hero (uppdatera RekryterareHero + StaticCandidateCard)
- Behåll rubrikformeln "Kandidater med bevisade färdigheter" eller vässa till
  "Sök på kravprofilen. Få kandidater som redan sagt ja till att bli hittade."
- Underrubriken nämner de tre nya bevisen: relevansrankad sökning,
  verifierade resultat per nivå, arbetsstilsrapport ur 120 frågor.
- Exempelkortet uppgraderas till v2-kortet: percentilbadge MED nivå
  ("Matrislogik · Expertnivå · topp 10 %"), matchförklaringsrad
  ("Matchar 'koncernredovisning' i kompetenser") och "Söker mig till"-tagg.

### 2. NY HUVUDSEKTION: Interaktiv produkttur ("Så här ser det ut på insidan")
Beslut (2026-07-06, "mer spicy"): INTE skärmdumpar utan pixeltrogna statiska
kopior av portalens riktiga vyer, renderade i ett mockat appfönster
(browser-chrome med adressrad "jobbcoach.ai/rekryterare"). Skarpt på alla
skärmar, animerbart med framer-motion, noll bildunderhåll.

Turen har 5 scener med stegnavigering (klickbara steg + auto-advance som
pausas vid interaktion, prefers-reduced-motion respekteras):
1. SÖK: filterpanel + tabellrader med percentilprickar och matchförklaring.
   Klickbara exempelsökningar ("redovisningsekonom koncernredovisning",
   "frontendutvecklare react") som omrankar raderna. Absorberar sökdemon.
2. PEEK: sidopanelen glider in över tabellen med sammanfattning + knappar.
3. PROFIL: snabbsammanfattning + verifierade resultat med nivå/N testade +
   arbetsstilsrapporten med spektra och Trivs när-kort. Absorberar den
   fristående arbetsstils-sektionen.
4. INTERVJUGUIDEN UPPLÅST: kandidaten har tackat ja, STAR-fråga med
   lyssna efter-punkter + onboardingpunkter, "låstes upp när kandidaten
   accepterade" som poäng.
5. ARBETSFLÖDET: jämför-kolumner + bevakningsmailets mock ("2 nya kandidater
   matchar Redovisningsekonom Sthlm") + delningslänken.
Mobil: scenerna staplas som svepbara kort i förenklad form.
Implementeras som statiska replikor (samma Tailwind-klasser som portalens
komponenter) i public-delen, ALDRIG import av portalkod med klientdata.

### 2b. (Absorberad i scen 1) Sökdemo ("Sökning som förstår kravprofilen")
Interaktiv, helt klientside med hårdkodad exempeldata (ingen API-koppling):
- Ett sökfält förifyllt med "redovisningsekonom koncernredovisning" och
  2-3 klickbara exempelsökningar ("frontendutvecklare react",
  "kundtjänstchef malmö").
- Under: 3 mockade träffrader (tabellradens design från portalen) som
  filtreras/omrankas när man byter sökning, med matchförklaringen synlig
  per rad och percentilprickarna.
- En rad mikrocopy: "Varje ord i sökningen måste träffa. Titelmatch väger
  tyngre än kompetensmatch. Du ser alltid varför en kandidat rankas högst."
Detta är sidans "aha", rekryteraren förstår mekaniken på 10 sekunder.

### 3. Vardeprops (uppdatera RekryterareVardeprops, 4 kort omskrivna)
- "Svarsvilliga kandidater" (behåll, vässa: opt-in = svar som betyder något)
- "Verifierat före första kontakt" (percentiler per nivå, inte CV-prosa)
- "Bevakning på kravprofilen" (NYTT: spara sökningen, få mail när nya
  kandidater matchar, poolen växer varje vecka)
- "Budgetfilter utan löneexponering" (NYTT: sålla bort omöjliga löneanspråk
  innan kontakt, kandidatens spann visas aldrig)

### 4. NY SEKTION: "Siffror som tål följdfrågor" (testintegriteten)
3-4 punkter med ikon + kort förklaring, designad som ett "så räknar vi"-kort:
- Första försöket räknas. Verifierat resultat är kandidatens första slutförda
  försök per nivå, aldrig bästa av tjugo.
- Nivån syns alltid. Topp 10 % på expertnivån och topp 10 % på grundnivån är
  olika saker, badgen säger vilken.
- Öppen normgrupp. "Topp 8 % av 340 testade" betyder exakt det: jämfört med
  alla som gjort samma test hos oss, och du ser hur många de är.
- Testdatum visas, resultat äldre än två år flaggas.
Avslut: "Vi hellre visar en ärlig siffra än en imponerande." Detta bygger
mer förtroende hos testvana rekryterare än någon säljcopy.

### 5. NY SEKTION: Arbetsstilsrapporten ("120 frågor. En rapport ni båda ser.")
- Vänster: copy om vad rapporten är (arbetssätt/samarbete/drivkrafter,
  Trivs när/Utmanas när, onboardingguide, STAR-intervjuguide med
  lyssna efter-punkter som låses upp när kandidaten tackar ja).
- Höger: en statisk men trogen mock av riktiga rapporten: arketyp-huvud,
  2-3 spektrum-rader (punkt på linje, inga siffror), ett Trivs när-kort och
  den låsta intervjuguideraden. Återanvänd samma visuella komponentspråk
  som portalens WorkStyleCard (statisk kopia, ingen import av portalkod).
- Etikrutan (differentierande, inte defensiv): "Rapporten visar, den
  filtrerar aldrig. Ingen sortering eller matchprocent på personlighet.
  Kandidaten ser exakt samma rapport som du. Byggd för att hålla för
  GDPR och EU:s AI-förordning."

### 6. SaFunkar (uppdatera från 3 till 4 steg = arbetsflödet)
Sök i poolen → Spara till projekt och jämför → Visa intresse, kandidaten
svarar → Dela profilen med din hiring manager. Varje steg med mini-mock
(tabellrad, jämförkolumner, intressestatus, delningslänk). Ersätter dagens
tre generiska steg och visar att detta är ett ARBETSVERKTYG, inte en
engångssökning.

### 7. ProfilExempel (uppdatera RekryterareProfilExempel)
Uppgradera mocken till v2-profilen: snabbsammanfattningens tre minikort,
verifierade resultat med nivå + "av N testade" + antal försök, fullständiga
arbetsstilsrapporten (spektra + Trivs när + låst onboarding/intervjuguide),
"Söker mig till"-taggar med mikrocopy, villkor. Behåll hänglåsen på
arbetsgivare, det är fortfarande rätt.

### 8. Trust (uppdatera RekryterareTrust)
Lägg till samtyckesmodellen som förtroendepunkt: nivå 1/nivå 2-samtycke,
symmetrin (kandidaten ser sin egen profil exakt som du ser den),
skrivningar endast via server, lönespann lämnar aldrig servern.

### 9. FAQ (utöka rekryterare-faq-data.ts)
Nya frågor: "Hur verifieras testresultaten?" (första försöket, nivåer,
normgrupp), "Kan jag filtrera på personlighet?" (nej, och varför det är en
fördel), "Vad låses upp när kandidaten tackar ja?" (namn, arbetsgivare,
kontakt, onboarding + intervjuguide), "Kan jag dela en profil med min chef?"
(ja, maskerad länk 14 dagar), "Vad kostar det?" (gratis under betan,
prissättning kommer), "Hur får jag veta när nya kandidater dyker upp?"
(bevakning på sparade sökningar).

### 10. CTABand (behåll, uppdatera underraden)
"Gratis under betan · Bevakning ingår · Ingen bindningstid".

## SEO/meta
Uppdatera title/description mot "rekryteringsverktyg med verifierade
testresultat och arbetsstilsprofiler". Behåll URL:en. FAQ-schema om
befintligt mönster används på andra sidor.

## Implementationsnoter
- Allt statiskt/klientside, inga API-anrop från landningssidan (sidan ska
  förbli SSG). Sökdemon är hårdkodad exempeldata med samma visuella språk
  som portalens tabellrad.
- Exempeldatan i mockarna: samma tre fiktiva personer som idag
  (redovisningsekonomen, frontendutvecklaren, kundtjänstchefen) så sidan
  hänger ihop, men uppgraderade till v2-fälten. Disclaimern "Exempelprofiler,
  kandidaterna i poolen är verkliga arbetssökande" behålls.
- Komponenter: uppdatera Hero/Vardeprops/SaFunkar/ProfilExempel/Trust/FAQ/
  StaticCandidateCard, nya SearchDemo.tsx, TestIntegrity.tsx,
  WorkStyleShowcase.tsx (statisk spektrum-variant, kopiera bandpunkts-
  renderingen, importera INTE portalens komponenter till public-delen).
- Designspråk som alltid: orange gradient-accent, indigo för arbetsstil,
  inga Sparkles, inga tankstreck i copy.

## Ordning vid bygge
1. ProfilExempel + StaticCandidateCard till v2 (störst gap mot verkligheten)
2. Sökdemo + testintegritet (de nya förtroendesektionerna)
3. Arbetsstilsrapport-sektionen
4. Vardeprops/SaFunkar/Trust/FAQ/Hero-copy
5. Meta/SEO
