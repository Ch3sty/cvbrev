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

- `src/app/dashboard/cv-analys/page.tsx`: går också genom `analysForKlient`, så gratisnivån filtreras vid återupptagning.
- `.../select/ImprovementCard.tsx` (ny `FyllISiffra`), `.../select/ProfileImprovementCard.tsx`, `.../select/SkillImprovementCard.tsx`: raden "Fyll i din egen siffra där det står [antal]", och kompetensförslag sägs vara förslag att lägga till om de stämmer.
- `src/lib/rum/copy.ts`: `kompetenserMeta` slutar med "Lägg till dem som stämmer."

## Edge-funktionen

`supabase/functions/analyze-cv-background/index.ts` och `supabase/functions/_shared/pii.ts` är ändrade men inte driftsatta. Webbappen klarar både gamla och nya versionen (den räknar allt själv, matchar rollerna, byter påhittade tal mot `[antal]` och tar bort maskeringens platshållare). Den nya versionen arbetar på lagrad struktur, ber aldrig om tal, sätter `experienceIndex`, föreslår en personbeskrivning när den saknas, ber om `[antal]` i stället för påhittade siffror och maskar också webbadresser och födelsedatum.

`_shared/pii.ts` delas med andra edge-funktioner som importerar den; de får den nya maskeringen (fler mönster, inga borttagna) nästa gång de driftsätts.

### Provköra och felsöka efter driftsättning

Driftsätt: `supabase functions deploy analyze-cv-background` (tar med `_shared`).

Provkör: kör en analys i appen med ett testkonto (ett CV med lagrad struktur och ett utan). Jobbet syns i `cv_analysis_jobs` och i adminsidan Drift (`/admin/drift`), som listar jobb som står i `processing`.

Loggarna: Supabase, Edge Functions, analyze-cv-background, Logs. Varje rad börjar med `[Job <id>]`. Förväntat förlopp:

1. `Step 1/5: Using stored structure (N roles)` (eller `Parsing CV ...` när strukturen saknas)
2. `Profile summary improvement generated` eller `New profile summary generated`
3. `Found N skill suggestions`
4. `Batch i completed: N improvements` per tre roller
5. `Step 5/5: Performing general analysis...`
6. `Preview text generated`, `✅ Analysis completed successfully`

`[privacy] personuppgifter kvar efter andra passet` betyder att maskeringen missade något mönster: texten skickades ändå maskerad hårt, men mönstret bör läggas till i båda `pii.ts`.

Resultatet i `cv_analysis_jobs.result` ska ha: `analysisType: 'full'`, `profileSummary` (eller `null`), `skillSuggestions[]` (utan `atsImpact`), `roleBasedImprovements[]` med `experienceIndex`, `generalImprovements[]` (utan `atsImpact`), `keywords[]`, `atsFriendliness: { score: null }`, `parsedRoles[]`, `structuredCV` och `formattedPreview`. Inga `[NAMN]`, `[TELEFON]`, `[LÄNK]` någonstans. Webbappen räknar talen när resultatet läses, så `score: null` är rätt.

Ett jobb som fastnat står kvar i `processing` med gammal `updated_at` (funktionen dog före sin catch, till exempel på tidsgränsen). Klienten ger upp efter 90 sekunder med "Analysen svarar inte", och kvoten rullas inte tillbaka för `processing`. Ett jobb som kastar sätts till `failed` med felet i `error`, och kvoten rullas tillbaka vid nästa läsning av jobbet.

Rätta framåt: felet syns i loggen med jobbets id; rätta i `index.ts` och driftsätt igen. Behövs en snabb återgång är förra versionen `git show b43314b6:supabase/functions/analyze-cv-background/index.ts` (grenens utgångspunkt; `_shared/pii.ts` på samma sätt); webbappen fungerar med den också.

## Personuppgifter och AI-anropen

Regeln (ägarens beslut 2026-11-21): namn, e-post, telefon, gatuadress och postnummer, personnummer, födelsedatum och webbadresser lämnar aldrig servern till AI:n. All CV-text till modellen går genom `maskaCvForModel` (`src/lib/privacy/cvForModel.ts`, ovanpå `maskForModel` i `pii.ts`). Kontaktuppgifterna läses lokalt (`extractContactLocally`, `lankarLokalt`) eller ur profilen och sätts in efter svaret. Maskeringens platshållare tas bort ur allt modellen svarar (`rensaDjupt`, i edge-funktionen `rensaPii`). Test: `src/lib/privacy/__tests__/cv-ai-anrop.test.ts`.
