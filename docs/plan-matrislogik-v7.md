# Plan: Matrislogik V7 — lager-motor + tre svårighetsnivåer

## Mål
Lyfta matrislogik från "barnversion" till branschstandard (SHL / Assessio / cut-e).
Konkret:
1. **Ersätt grund (V5)** med en ny, snyggare och rikare lättvariant.
2. **Bygg en svårare nivå** än nuvarande avancerad (V6).
3. **Bygg en blandad variant** som drar frågor från alla nivåer.

Allt på **en gemensam motor (V7)** så att variation, kvalitet och underhåll löses en gång.

---

## Diagnos (varför nuvarande inte räcker)

### Grund (V5) — problem
- Orange grafik (ser ut som barnapp, inte rekryteringstest).
- Låst till 90°-rotationer.
- Ett platt element per cell, aldrig lager.
- Bara 3 platta fyllningar (none/grå/svart), ingen textur.
- Svaga distraktorer (avslöjar regeln).
- Max 2 samtidiga regler.

### Avancerad (V6) — bättre men fel arkitektur
- **Fördelar:** ren svartvit grafik, godtyckliga vinklar (`Angle = 0–359`), fler mekanismer (analogi, XOR, räkna ytor, subtraktion, spegling).
- **Svaghet:** inte en motor utan 14 hårdkodade `switch`-fall, ett per fråga. `count_areas` ensam = ~45 rader specialfall. Skalar inte — varje ny idé kräver ny renderar-kod.

### Vad konkurrenterna gör som vi inte gör (från användarens skärmdumpar)
- Sammansatta celler med **flera oberoende lager** (ram + grå kvadranter + liten hörnform).
- **Textur/shading** som egen dimension (linjeraster, prickraster, schack, halvfyllt).
- **2×2 / 3×3 subgrid** inuti varje cell.
- **Nestning** (ruta-i-romb-i-cirkel).
- **Fria vinklar** och **kombinerade former**.

---

## V7-arkitektur: cell = stack av lager

En cell är `Layer[]`, ritad underifrån och upp. Ren svartvit SVG (viewBox 0–100), som V6.

| Lager | Varianter | Löser |
|---|---|---|
| `frame` | none / square / circle / diamond | nestning, ramar |
| `texture` | none / gray / black / hatch / dots-raster / checker / half-top / half-bottom | shading-dimension |
| `subgrid` | 2×2 eller 3×3 av på/av-rutor | subgrid-frågor |
| `figure` | shape (circle/square/triangle/arrow/L/T/F/diamond/star) + rotation (valfri grad) + fill | dagens kärna, komponerbar |
| `decor` | små markörer (dot/square/tri) i TL/TR/BL/BR/C | hörn-element-stilen |

**Svårighet = antal aktiva lager × antal samtidiga regler.**
- Lätt: 1–2 lager, 1–2 regler.
- Svår: 3–4 lager, 3 regler.

### Varför V7 räcker för all variation (verifierat mot V6-koden)
Lager-modellen är ett superset av V6: arrow/shape→figure, shaded_shape→texture, lines→lines-lager, composition→decor, count_areas/subtraction→figure med inre struktur. Det V7 lägger till (textur-raster, subgrid, nestning, fri lager-komposition) är exakt det som saknas mot branschnivå. Inget V6 gör faller utanför.

---

## Distraktor-doktrin (gäller alla nivåer)
Varje fråga får 5 distraktorer där **var och en kodar ett namngivet feltänk**, byggt genom att ta rätt svar och ändra *ett* lager fel:
- fel regel applicerad på ett lager (t.ex. rotation åt fel håll)
- off-by-one (en rotation/ett steg fel)
- rätt-figur-fel-textur
- granne-kopia (kopierar cellen ovanför/bredvid)
- rätt på alla lager utom ett

Detta byggs in i valideringsskriptet: en fråga **underkänns** om en distraktor är "för långt borta" (skiljer sig på fler än rimligt antal lager) eller om den är identisk med rätt svar.

---

## De tre nivåerna

### 1. Grund V7 (ersätter V5 `matrislogik-grund`)
- Ren svartvit, 1–2 lager, 1–2 regler.
- Mönstertyper: progression, distribution-of-three, rotation (inkl. 45°), enkel textur-alternering.
- ~25–30 frågor i pool, slumpa 15.

### 2. Expert V7 (ny, svårare än V6)
- 3–4 lager, 3 samtidiga regler.
- Mönstertyper: kombinationsregler, nestning, subgrid-XOR, textur-progression + rotation + decor samtidigt.
- ~25–30 frågor, slumpa 15. Premium-låst.

### 3. Blandad V7 (ny)
- Drar slumpvis från grund- + avancerad- + expert-poolen, i stigande svårighet.
- Simulerar ett skarpt test (som Raven: börjar lätt, slutar svårt).
- Premium-låst.

(Avancerad/V6 kan behållas tills vidare eller migreras till V7 i ett senare steg — inte kritiskt för detta mål.)

---

## Branschens 10 mönstertyper — täckning i V7
Rotation ✓ (fria vinklar), Reflection ✓, Number progression ✓, Size progression ✓,
Shading/textur ✓ (nytt lager), Position shift ✓ (decor/figure-pos), Add/subtract ✓,
Symmetry ✓, Analogy ✓ (rad→rad), Combination ✓ (lager-stapling). Alla 10 täckta.

---

## Leverans i faser (varje fas pushas + granskas okulärt innan nästa)

**Fas A — Motor-prototyp.** Bygg V7-renderaren med 3 lager (frame + texture + figure) och 4–5 expert-frågor. Pusha till granska-sidan. Mål: bevisa visuell nivå mot konkurrenterna innan vi bygger ut.

**Fas B — Full motor.** Lägg till subgrid + decor + lines-lager. Generator-hjälpare för distraktorer.

**Fas C — Grund V7.** Skriv grund-poolen, validera (struktur + anti-trivial + distraktor-doktrin + okulärt), ersätt V5 bakom `matrislogik-grund`-routen.

**Fas D — Expert V7.** Skriv expert-poolen, ny route + kort på hub-sidan, premium-gating.

**Fas E — Blandad.** Drar från alla pooler, stigande svårighet. Ny route + kort.

**Fas F — Slumpning + utvecklingsvy.** (Från tidigare plan: 15 av pool per session, poäng-över-tid-graf.)

---

## Verifiering (varje fråge-pool)
1. Strukturell validering (grid 3×3, 6 unika alternativ, ett rätt).
2. Anti-trivialitet (inga rad/kol-repetitioner, ingen granne-kopia).
3. Distraktor-doktrin (varje distraktor en namngiven near-miss).
4. Semantisk där lösbart (latin square, aritmetik).
5. Okulär granskning via granska-sidan före live.

## Öppna beslut
- Behålla V6/avancerad parallellt, eller migrera in i V7-blandad? (Förslag: behåll tills V7 är bevisad, migrera sen.)
- Antal frågor per pool (förslag 25–30, slumpa 15).
