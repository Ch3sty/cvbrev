# Publik landningssida för "Bli upptäckt" (kandidatsidan)

Ny route `/verktyg/bli-upptackt`. Säljer in att arbetssökande gör sig synliga
för rekryterare. Ska matcha /for-rekryterare i kvalitet men spegla den ur
KANDIDATENS perspektiv. Custom SVG, pedagogisk, demonstrativ, säljande.
Underlag: strateg + designer (2 UX-genomgångar).

## Bärande idé (design)
"Din profil är en fyr, inte ett CV i en hög." Profilkapseln ligger STILL i
mitten av varje illustration, rekryterare/signaler rör sig MOT den. Vänder
jaga-jobb-logiken visuellt.

FÄRGLOGIK (skiljer sidan från /for-rekryterare): INDIGO #4F46E5/#EEF0FF
dominant (kandidatens kontroll/trygghet), ORANGE gradient accent (CTA +
"andra är intresserade av dig": radarprickar, notiser, badges). Tvärtom mot
rekryterarsidan (orange dominant) så man känner vems sida det är. Grön endast
för verifierat/tackade-ja.

## Hero
Vinkel A (vändningen) + kontroll direkt i andra meningen:
- H1: "Sluta jaga jobb. Låt de rätta hitta dig." (copywriter finslipar)
- Undertext: adresserar kontroll/anonymitet omedelbart ("du väljer alltid vem
  som får se vem du är innan du är redo").
- Beta-badge "Tidig åtkomst" (ärligt om betafas, som rekryterarsidan).
- Primär CTA "Gör mig synlig" → /register (annars /dashboard/bli-upptackt).
  Sekundär textlänk "Så funkar det" → #sa-funkar-det.
- HERO-ILLUSTRATION (radarfyr, viewBox 0 0 480 480, fyller högerkolumnen):
  radial gradient-duk, 3 koncentriska radarringar (indigo, avtagande opacitet),
  långsamt roterande sweep-kon (12s, reduced-motion off), profilkapsel i
  centrum (avatar + chip-rader + låsikon = anonym), 4-5 orange rekryterarprickar
  på olika radier med streckade ledlinjer in, 2 med pulserande halo ("söker nu"),
  en flytande notisbubbla "Ny match i din bransch" (y-float 4s).

## Sektioner (ordning)
1. Hero (ovan).
2. **Så funkar det** (4 steg, spegling av RekryterareSaFunkar ur kandidatvy),
   varje steg med egen mini-SVG (64x64 i bg-indigo-50-platta):
   (1) Bygg din profil (dokument som fylls i = CV, inte quiz),
   (2) Bli synlig (kapsel + radarring + orange prickar),
   (3) Rekryterare hör av sig (pratbubbla glider in + halvöppet lås),
   (4) Du väljer (kapsel med grön bock / grått kryss, lika vikt = inget tryck).
3. **CandidateTour** (sidans WOW, syskon till ProductTour.tsx, KANDIDATENS
   dashboard-vy). Browser-chrome "jobbcoach.ai/dashboard/bli-upptackt", sidnav
   [UserCircle, Eye, MessageSquare, Settings]. Indigo-gradient stegnummer (skilt
   från rekryterarsidans orange). 5 scener, auto-advance 6s stannar vid
   interaktion, reduced-motion-gate:
   - SceneBuildProfile: profilformulär, kompetens-chips checkas in, "Testresultat:
     valfritt" nedtonat.
   - SceneGoVisible: stor toggle av→på (grå→indigo), radarringar animerar in.
   - SceneGetFound: notislista droppar in ("En rekryterare inom ekonomi visade
     intresse", stagger).
   - SceneDecide: en notis expanderad, anonym rekryterarpitch + Tacka ja / Inte
     just nu, klick visar bekräftelse.
   - SceneChat: chattmock i appfönster, allt sker i plattformen.
4. **Värdeprops** (4 kort, kandidatens motiv, spegling av RekryterareVardeprops):
   slipp 50 ansökningar i mörkret / du styr vad som visas (CV, villkor, lön som
   filter) / ingen ser dig förrän du vill / arbetsstil som bonus (nedtonat).
5. **Trygghet: "Osynlig tills du säger ja"** (invändningshantering, spegling av
   RekryterareTrust). Punkter: anonym som standard; blockera specifika
   arbetsgivare; bara verifierade rekryterare (org.nr); lönespann bara filter;
   dra tillbaka samtycke när som helst; ingen spam, varje kontakt riktad.
   ANONYMITETS-ILLUSTRATION (B): skiktad kapsel (anonym silografi + lås),
   främre skikt "Namn & kontakt: Låses upp när du säger ja", pil till grön
   upplåst kapsel. Indigo-ton, en grön accent.
6. **Så ser din profil ut** (demonstrativ, spegling av RekryterareProfilExempel).
   Full avidentifierad exempelprofil + bildtext "Detta är vad en rekryterare
   ser, inte mer." MATCHNINGS-ILLUSTRATION (C): sökrad-mock + 3 kort där din
   kapsel är topprankad (orange ram + medalj/stjärna, EJ Sparkles), streckad
   linje kopplar sökord "koncernredovisning" till chip i profilen.
7. **Arbetsstil som bonus** (kort, nedtonat, spegling av RekryterareTestIntegritet).
   E-illustration: liten "+Arbetsstilsrapport"-badge som kopplas på kapseln,
   en spektrumlinje, medvetet minst utsmyckad på sidan (test = aldrig huvudmotiv).
8. **FAQ** (bemöter invändningarna, bra för SEO). Frågor: Kan min chef se att
   jag är synlig? / Blir jag nerspammad? / Är rekryterarna seriösa? / Måste jag
   göra personlighetstestet? / Syns min lön? / Kan jag ångra mig?
9. **Final CTA-band**. Största knappen: "Bli hittad idag" / "Gör dig synlig nu".
   Trust-microcopy: gratis, ingen bindningstid, du styr allt. CHATT-ILLUSTRATION
   (D) kan bo här eller i sektion 3.

## CTA-strategi
Verb: synas/aktivera/bli hittad, ALDRIG "ansök" (det här handlar om att slippa
ansöka). Hero primär → /register. Mellanliggande CTA-rad efter trygghet
("Aktivera din profil, gratis"). Final band störst.

## Invändningar (var de bemöts)
Chef ser mig: hero-undertext + trygghetspunkt (blockera) + FAQ. Spam:
trygghet + FAQ + tour scen 4 (du väljer). Seriöst: verifierade rekryterare +
proffsig exempelprofil. Test obligatoriskt: sektion 7 + FAQ (nej, frivilligt).
Lön: värdeprops + trygghet. Ångra: trygghet + final band.

## Filstruktur (matchar konventionen)
- src/app/(public)/verktyg/bli-upptackt/page.tsx
- src/app/(public)/verktyg/bli-upptackt/layout.tsx (metadata, SEO, canonical)
- src/app/(public)/verktyg/bli-upptackt/components/*.tsx (Hero, SaFunkar,
  CandidateTour + tour/, Vardeprops, Trygghet, ProfilExempel, ArbetsstilBonus,
  FAQ + faq-data, CTABand, delade illustrations-SVG:er, StaticCandidateCard-
  variant/återanvändning)
Återanvänd/spegla: for-rekryterare-komponenterna (MockCard, LockChip, chip-
stilar, StaticCandidateCard) och DiscoverByRecruitersCard (RecruiterRadar-SVG).

## Meny + upptäckbarhet
- LandingNavbar.tsx: lägg till i TOOLS-listan (Vad vi erbjuder-dropdown):
  { label: 'Bli upptäckt', href: '/verktyg/bli-upptackt', ... }.
- Ev. länk på /funktioner och i footern.

## Hårda regler
Statisk (SSG), inga API-anrop. Orange accent / indigo bas. ALDRIG Sparkles,
ALDRIG tankstreck i copy. Svensk vi-form. Custom inline-SVG, inget clipart.
Test aldrig huvudmotiv. Mobile-first, snygg desktop.
