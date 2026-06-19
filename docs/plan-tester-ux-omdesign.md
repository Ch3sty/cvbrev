# Genomgripande UX-omdesign: Tester-hubben

Mål: göra Tester-fliken mindre textgrötig, mer ikon-driven och pedagogisk, samt
fixa tre konkreta buggar. Bygger på befintlig orange→röd→rosa-design och
återanvänder hub-gradienterna, men stramar upp kort, ikoner och hierarki.

---

## Buggar som fixas

1. **Ikon-inkonsekvens.** Idag har `matrix-grund` en 3×3-grid men `matrix-avancerad`
   /`matrix-expert` en helt annan koncentrisk cirkel-ikon (och de två delar ritning).
   → ALLA test inom en typ får SAMMA ikon. Nivån visas separat.
2. **Kronan.** Betyder olika saker: "bäst totalt" på kognitiva kort men "har profil"
   (alltid) på personlighetskort. → Tas bort helt. Ersätts med tydliga statusar.
3. **Grötig text** (särskilt personlighetssektionen): metod-rad + tre pill + tre
   statrader + progress-box + CTA = 10+ lager per kort. → Bantas, ikon-drivet.

---

## 1. Ikonsystem (nya/omgjorda SVG:er)

**En ikon per testtyp** (4 st, återanvänder/förfinar de befintliga kategori-SVG:erna):
- Logik → matris-glyph (3×3 med mönster)
- Verbal → "Aa"/text-glyph
- Numerisk → stapel/diagram-glyph
- Personlighet → Big Five-glyph

`TestCardThumbnail` görs om så `variant` mappar testtyp → en ikon (inte per nivå).
Alla matris-varianter → samma matris-ikon, osv. Tar bort den dubbla
avancerad/expert-ritningen.

**Ny komponent `LevelDots`** (liten SVG/markup): 1/2/3 fyllda punkter som visar
Grund/Avancerad/Expert visuellt. Ersätter behovet av olika ikoner per nivå.
- Grund: ●○○  Avancerad: ●●○  Expert: ●●●
- Färgkodning behålls (slate/amber/rose) men som fyllnad på punkterna.

## 2. Omdesignat testkort (`TestCard`)

Mål: färre textlager, tydligare hierarki, mer luft.

**Borttaget/hopslaget:**
- Metod-raden ("Mönsterigenkänning · matriser") flyttas till sektionsrubriken
  (gäller hela typen) istället för att upprepas på varje kort.
- Nivå-pillret ersätts av `LevelDots` + nivå i titeln (redan i titeln för logik;
  utökas konsekvent eller visas via dots — en variant, inte båda).
- Kronan bort.

**Ny kortstruktur (uppifrån och ner):**
1. Topprad: kategoripill + LevelDots till höger (+ ev. Premium-lås).
2. Ikon (typ-ikon, större) + titel + "frågor · min" som en kompakt rad med
   ikoner istället för ren text.
3. Status-zon (ETT av):
   - Ej gjort: subtil "Ej påbörjad"-markör.
   - Gjort: kompakt progress — bästa % som siffra + mini-sparkline (återanvänder
     `Sparkline`) istället för dagens nästlade box. En rad, inte en ruta.
   - Låst: "Lås upp med Premium" + lås.
4. CTA: ikon-driven ("Starta"/"Gör om"/play-ikon) + pil.

**Status istället för krona:**
- "Klar"-bock på avklarade test.
- Bästa-resultat markeras med subtil ram/accent på det kort där du presterat bäst
  (med en liten "Ditt bästa"-etikett så det är självförklarande), INTE en krona.

## 3. Pedagogisk sektions-header (`TestGroup`)

Behåll riktningen från förra rundan (ikon + förklaring + sökord) men:
- Flytta metod-info hit (en gång per typ), så korten slipper upprepa den.
- Lägg ev. en liten "exempel"-thumbnail eller mini-illustration som visar vad en
  fråga ser ut som (pedagogiskt: "så här ser ett logiktest ut"). Utvärderas under
  bygget; om det blir för tungt hoppar vi det.

## 4. Personlighetssektionen (minska grötet — din huvudpoäng)

Idag: 2 start-kort (Grund/Avancerad) som upprepar "Vad dina svar säger
rekryteraren" + 1 resultatkort = mycket text.

**Förslag:**
- Start-korten bantas till samma stramare `TestCard`-stil som övriga (ikon + titel
  + dots + CTA), utan den extra undertexten på varje.
- Resultatkortet (`PersonalityResultCard`) behålls men förfinas så Big Five visas
  mer visuellt (de fem staplarna får ikon/färg per drag, mindre text).
- Sektionsblurben bär den förklarande texten EN gång, korten bär den inte.

## 5. Layout & responsivitet

- Behåll `max-w-6xl` och 3-kol på lg för logik/personlighet, 2-kol för verbal/num.
- Öka luften: större gap mellan pill-grupper, tydligare whitespace i korten.
- Mobil: större fontstorlekar på de minsta etiketterna (idag 9–10px → minst 10–11px),
  så det går att läsa.
- Stat-kortet överst (Slutförda/Snitt/Tid) behålls men kan få progress-ring för
  "slutförda X/8" (återanvänder `CircularProgress` från `src/components/ui`).

## 6. Filer

**Nya:**
- `components/LevelDots.tsx` — nivåindikator (1/2/3 punkter).
- Ev. `components/TestStatusBadge.tsx` — "Klar"/"Ditt bästa"/"Ej påbörjad".

**Ändras:**
- `illustrations/TesterHubIcons.tsx` — `TestCardThumbnail` mappar typ→en ikon;
  förfina de fyra typ-ikonerna; ta bort dubbletten avancerad/expert.
- `components/TestCard.tsx` — ny stramare struktur, krona bort, LevelDots, ikon-CTA,
  sparkline-status.
- `components/PersonalityTestCard.tsx` — samma stramare stil, ta bort krona +
  upprepad undertext.
- `components/PersonalityResultCard.tsx` — mer visuell Big Five.
- `components/TestGroup.tsx` — metod-info i headern, ev. exempel-thumbnail.
- `components/testCatalog.ts` — flytta `method` till grupp-nivå om det blir renare.
- `components/TestStatsCard.tsx` — ev. progress-ring för slutförda.
- Ev. `page.tsx` — om props ändras.

## 7. Verifiering

- `tsc --noEmit` rent.
- Rendera om PDF→PNG (jag har skript) eller starta dev och granska okulärt mot
  riktig data (admin har fullt utbud + personlighetsprofil).
- Mobil-först: kontrollera kort, dots, sparkline och sektioner på liten skärm.
- Inga DB/API-ändringar — ren frontend.

## Öppna frågor (löser under bygget)
- Exempel-thumbnail per sektion (pedagogiskt men kan bli tungt) — testas, slopas om
  det stör.
- "Ditt bästa"-accent vs. enklare "Klar"-bock — väljer det som ser renast ut.
