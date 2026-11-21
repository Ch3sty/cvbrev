# Byggnoter: poängen i CV-analysen (gren feat/cv-analys-poang)

Modellen står i `docs/poangmodell-cv-analys.md`. Här står det som nästa bygge (den nya Analys-sidan och CV-rummet) behöver veta.

## Det Analys-sidan läser

Allt finns i analysresultatet som `GET /api/cv/jobs/[jobId]` och den återupptagna analysen (`?job=`) levererar. Fältnamnen är desamma som förut, men talen är uträknade:

| Fält | Innehåll |
|---|---|
| `atsFriendliness.score` | poäng i dag (samma som `poang.idag`) |
| `poang` | `PoangSammanfattning`, se nedan |
| `poangVersion` | modellens version, `1` |
| `structuredCV` | CV:t i dag i kanonisk form (CVMetadata) ur CV-raden |
| `profileSummary.atsImpact`, `.plus` | profilförslagets plus (`atsImpact` aldrig under 0) |
| `roleBasedImprovements[i].atsImpact`, `.plus`, `.rollIndex` | rollförslagets plus och rollens plats i `structuredCV.experience` |
| `skillSuggestions[i].atsImpact`, `.plus` | kompetensförslagets plus |
| `generalImprovements[i].atsImpact` | alltid 0, råden förs inte in |
| `forvald` (profil, roller, kompetenser) | förvalt: sänker inte poängen, ensamt eller tillsammans med de andra förvalda. Förväl bara dessa. |
| `fyllI`, `ersattaTal` (profil, roller) | texten har platshållaren `[antal]` där hon ska fylla i en egen siffra; `ersattaTal` är hur många påhittade tal som byttes ut |

Gratisnivån: servern filtrerar som förut (`gateAnalysisResult`) och räknar sedan om `poang` på de förslag hon faktiskt får, så "med våra förslag" aldrig lovar något hon inte ser.

### Typerna

Ur `@/lib/cv/poang` (klientsäker):

```ts
export interface PoangSammanfattning {
  version: 1
  idag: number        // poäng i dag, 0 till 100
  medAlla: number     // "med våra förslag": de förvalda (inga som sänker), aldrig under idag
  plus: number        // medAlla - idag
  kategorier: PoangKategori[]
}

export interface PoangKategori {
  id: 'kontakt' | 'profil' | 'erfarenhet' | 'kompetenser' | 'utbildning' | 'sprak' | 'format'
  namn: string        // "Kontaktuppgifter", "Personbeskrivning", ...
  max: number         // maxpoäng, summerar till 100
  idag: number        // kategorins poäng i dag, summerar till idag
  medAlla: number     // kategorins poäng med de förvalda förslagen
  plus: number        // medAlla - idag
}
```

Kontrollerna inom en kategori (för en detaljvy) får man med `raknaPoang(kanonisktCv(structuredCV)!)`: varje `Kategori` har `kontroller: { id, text, max, poang }[]`, där `text` är skriven för användaren ("Varje roll har minst ett resultat i siffror").

### Exempel

```json
"poang": {
  "version": 1, "idag": 69, "medAlla": 89, "plus": 20,
  "kategorier": [
    { "id": "kontakt",     "namn": "Kontaktuppgifter",          "max": 10, "idag": 10, "medAlla": 10, "plus": 0 },
    { "id": "profil",      "namn": "Personbeskrivning",         "max": 15, "idag": 7,  "medAlla": 15, "plus": 8 },
    { "id": "erfarenhet",  "namn": "Erfarenhet",                "max": 35, "idag": 22, "medAlla": 29, "plus": 7 },
    { "id": "kompetenser", "namn": "Kompetenser",               "max": 12, "idag": 9,  "medAlla": 12, "plus": 3 },
    { "id": "utbildning",  "namn": "Utbildning",                "max": 8,  "idag": 8,  "medAlla": 8,  "plus": 0 },
    { "id": "sprak",       "namn": "Språk",                     "max": 5,  "idag": 3,  "medAlla": 3,  "plus": 0 },
    { "id": "format",      "namn": "Datum, ordning och längd",  "max": 15, "idag": 10, "medAlla": 12, "plus": 2 }
  ]
}
```

(Fixturen "normalt" i `src/lib/cv/poang/__tests__/fixturer.ts`.)

### Potential med hennes val

```ts
import { poangMedVal, byggForbattratCv } from '@/lib/cv/poang'

const val = { profil: true, roller: [0, 2], kompetenser: [1] }   // index i resultatets listor
const red = { profil: redigeradProfil, roller: new Map([[0, redigeradText]]) }
poangMedVal(analysResultat, val, red)?.total     // "Potential med dina val"
byggForbattratCv(analysResultat, val, red)       // exakt det som ska sparas som structured_data
```

Spara alltid det `byggForbattratCv` ger, annars håller inte löftet. Plus kan inte summeras: räkna alltid om med `poangMedVal`.

## Ändrade filer i gränssnitt och CV-rummet (för sammanslagningen)

- `src/lib/rum/cvRum.ts`: nytt valfritt fält `kompetenserPlus?: number | null` i `AnalysUnderlag`; `fyndUrAnalys` använder det i stället för summan av kompetensernas `atsImpact` när det finns (och listar då alla föreslagna kompetenser). Kommentarer i filhuvudet. Inga andra signaturer ändrade.
- `src/app/dashboard/profil/cv/page.tsx`: frågorna mot `cv_analysis_jobs` läser inte längre `atsFriendliness.score`; poängen per CV räknas ur CV-raden, underlaget poängsätts med `poangsattAnalys`. `MinaCvClient.tsx` är orörd.
- `src/app/dashboard/cv-analys/components/CVAnalysisWizard.tsx`: talen ur poängmodellen, `byggForbattratCv` när CV:t byggs och sparas, knepet `updateAnalysisWithImprovements` borttaget.
- `src/app/dashboard/cv-analys/components/steps/AnalysisOverviewStep.tsx`: prop `totalImpactBreakdown` ersatt av `kategorier?: PoangKategori[]`; rutan heter "Så räknas poängen"; tooltip och potentialtext rättade; "Automatiska förbättringar" heter "Råd om struktur och format".
- `.../steps/SelectImprovementsStep.tsx`, `.../select/AutoApplyPanel.tsx`, `.../select/CategoryHero.tsx`, `.../select/categoryFlow.ts` (+ test), `.../review/ChangeLogList.tsx`: texten om att råden "tillämpas automatiskt" rättad (de har aldrig förts in), fliken heter "Råd", profilens plus visas bara när det är över noll.
- `src/app/dashboard/cv-analys/page.tsx`: den återupptagna analysen poängsätts med CV-raden ur listan.

## Edge-funktionen

`supabase/functions/analyze-cv-background/index.ts` är ändrad men inte driftsatt. Webbappen klarar både gamla och nya versionen (den räknar allt själv och matchar rollerna). Den nya versionen arbetar på lagrad struktur, ber aldrig om tal, sätter `experienceIndex` och föreslår en personbeskrivning när den saknas.
