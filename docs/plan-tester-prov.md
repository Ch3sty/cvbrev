# Plan: Prov-läge (4:e kort per testtyp)

Mål: ett "Prov"-kort per kognitiv testtyp (Logik, Verbal, Numerisk) som ger ett
slumpat prov med frågor från ALLA svårighetsgrader, utan förklarings-toggle, och
som sticker ut tydligt mot träningskorten.

Personlighetstestet får INGET prov (det är en självskattning, inte rätt/fel).

---

## Kärnbeslut (arkitektur)

**Egen prov-pipeline per familj** (egen lib + eget API + egna test/resultatsidor),
i stället för att hacka de befintliga per-nivå-rutterna. Skäl: de befintliga
validerarna/scorerna laddar EN bank och har hårdkodade nämnare — att mixa nivåer
i dem bryter scoring. En isolerad prov-pipeline:
- mergar alla nivåbanker och slår upp facit per fråge-id (funkar tvärs nivåer),
- har dynamisk nämnare (provets faktiska antal frågor),
- lagrar med eget `test_type` (`*-prov`) så provstatistik inte blandas med träning,
- håller förklaringar avstängda i resultatvyn.

## Provens sammansättning (slumpat, alla nivåer)

Seedat på sessionId (samma Fisher–Yates-mönster som idag), men drar tvärs nivåer:

- **Logik-prov:** 5 grund + 5 avancerad + 5 expert = **15 frågor**, blandad ordning.
  (Pooler: questionBankGrund.v7 / questionBank.v7 / questionBankExpert.v7.)
- **Verbal-prov:** 6 passager från v1-poolen + 6 från v2-poolen = **12 passager
  (48 påståenden)**, blandad ordning.
- **Numerisk-prov:** 3 passager v1 + 3 v2 = **6 passager (24 frågor)**, blandad ordning.

Provet känns "rättvist representativt": lika delar från varje nivå. Seed → stabilt
under sessionen, nytt vid omspel.

**ID-krock-risk (numerisk):** v1 och v2 har separata id-rymder (num-pNN vs
numv2-pNN) → ingen krock, säkert att merga. Verbal: v1-pNN vs v2-pNN → ingen krock.
Logik: grund/avancerad/expert har unika id → ok. Verifieras i bygget med ett
id-unikhetstest innan merge.

## Frågepool — räcker den?

Inga nya frågor krävs: proven drar delmängder ur befintliga pooler (logik 28/nivå,
verbal 18/nivå, numerisk 9/nivå). Gott om marginal.

## 1. Nya selection-libs (mixar nivåer, seedat)

- `src/lib/logicTestV7/selectProv.v7.ts` → `selectProvQuestionsForSession(sessionId)`:
  drar 5 ur varje pool, slår ihop, seedad shuffle. Exporterar `PROV_TOTAL = 15`.
- `src/lib/verbalTestProv/selectProv.ts` → drar 6+6 passager, seedad shuffle.
  `PROV_TOTAL_STATEMENTS = 48`. Re-exporterar en merged bank för validatorn.
- `src/lib/numericalTestProv/selectProv.ts` → drar 3+3 passager. `PROV_TOTAL = 24`.

Varje lib måste kunna härleda SAMMA urval på både test- och resultatsida (som idag).

## 2. Nya validerare (merged banker, dynamisk nämnare)

- Verbal: `src/lib/verbalTestProv/validator.prov.ts` — laddar v1+v2-bankerna,
  `validateAnswer(passageId, idx)` slår upp i merged, `calculateScore` använder
  `PROV_TOTAL_STATEMENTS` (48).
- Numerisk: `src/lib/numericalTestProv/validator.prov.ts` — laddar v1+v2,
  scoring räknar redan bara isCorrect (flexibelt), breakdown slår upp i merged.
- Logik: behöver en answer-route som känner alla fyra banker (V5 + grund + avancerad
  + expert). Den befintliga V4-routen saknar avancerad. Prov-routen mergar alla.

## 3. Nya API-rutter per familj (eget test_type)

Mönster (POST skapar, GET listar, answer sparar, complete scorar):
- `src/app/api/logicTestProv/{session,answer,complete}/route.ts` — test_type
  `matrislogik-prov`. answer mergar alla fyra logik-banker. complete: dynamisk total.
- `src/app/api/verbalTestProv/{session,answer,complete}/route.ts` — `verbal-resonemang-prov`.
- `src/app/api/numericalTestProv/{session,answer,complete}/route.ts` — `numerical-reasoning-prov`.

Alla lagrar i samma tabell `logic_test_v4_sessions` (som de andra) men med eget
test_type, så GET-filtreringen separerar provstatistik.

## 4. Nya test- och resultatsidor

Återanvänder befintliga renderare (QuestionGrid/StatementList/numerisk-shared) men
matar in prov-urvalet:
- `dashboard/tester/{matrislogik,verbal-resonemang,numeriskt-test}-prov/test/[sessionId]/page.tsx`
- `.../[sessionId]/results/page.tsx`

**Tidsgräns:** prov får egen, generös gräns (t.ex. logik 35 min, verbal 40 min,
numerisk 35 min) — definieras per prov-sida.

**Förklaringar avstängda:** resultatvyerna får `isProv`-prop:
- `VerbalResultsBody`: toggle-knappen renderas inaktiverad med `title="Ej
  tillgänglig under prov"` (gråad, ingen expansion). Behåller knappen så det är
  tydligt att förklaring FINNS men inte under prov.
- `NumericalResultsBody`: `showExplanations={false}` döljer förklaringsblocket;
  lägg en liten inaktiv "Förklaring – ej tillgänglig under prov"-markör.

## 5. Provkort på hubben (sticker ut)

Nytt 4:e kort i varje kognitiv sektion (`TestGroup`), tydligt särskilt:
- **Mörkare/inverterad stil** — fylld orange→röd→rosa-gradient (som hero) i stället
  för vitt kort, vit text. Drar blicken direkt.
- Egen ikon (ny SVG: "rosett/medalj" eller "stoppur + check" = prov/bedömning).
- Etikett "PROV" + kort copy: "Mät var du står — frågor från alla nivåer, ingen
  hjälp." CTA "Gör provet".
- Visar senaste prov-resultat (procent) om gjort, annars "Ej gjort än".
- Premium? Förslag: provet är **premium-låst** (det är en värdefull "benchmark"),
  men öppet att diskutera. Default i planen: premium-låst med samma /priser-flöde.

Ny komponent `ProvCard.tsx`. `testCatalog.ts` får en `prov`-def per kognitiv grupp.

## 6. Statistik

Prov hålls SEPARAT från träningsstatistiken (egen test_type, ej i
`use-all-test-stats`-träningslistan). Provkortet hämtar sin egen session-lista via
prov-API:t (likt hur personlighetskorten gör). Ingen risk att prov "förorenar"
bästa-snitt eller utvecklingsgrafer.

## 7. Filer (översikt)

**Nya libs:** selectProv (3 familjer) + validator.prov (verbal, numerisk).
**Nya API-rutter:** session/answer/complete × 3 familjer.
**Nya sidor:** page/test/results × 3 familjer.
**Nya komponenter:** `ProvCard.tsx`, ny prov-SVG i `TesterHubIcons.tsx`,
ev. `useProvStats`-hook.
**Ändras:** `TestGroup.tsx` (rendera ProvCard), `testCatalog.ts` (prov-def),
`VerbalResultsBody.tsx` + `NumericalResultsBody.tsx` (`isProv`-prop),
ev. `logicTestProv/answer` mergar fyra banker.

## 8. Verifiering

- `tsc --noEmit`.
- ID-unikhetstest före merge per familj (inga krockande fråge-id mellan nivåer).
- Manuellt flöde mot riktig data: starta ett prov per familj, svara, se resultat
  utan förklaring, kontrollera att provstatistik inte syns i träningsvyn.
- Puppeteer-render av provkortet för att bekräfta att det sticker ut.
- Mobil-först.

## Öppna frågor att bekräfta innan/under bygget
- **Premium:** ska provet vara premium-låst (benchmark = värde) eller gratis?
  (Default: premium-låst.)
- **Provlängd:** 15/12/6 frågor (lika från varje nivå) — ok, eller vill du ha fler?
- **Förklarings-toggle:** inaktiv-med-hover (mitt förslag) vs. helt dold.
- **Tidsgräns:** föreslagna värden ovan, justeras gärna.
