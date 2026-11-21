# Byggnoter: brevrummet, omgång 1

Spec: BYGGSPEC (art director, 2026-11-21). Ett avsnitt per uppdrag.

## Motorn (etapp 1, gren `feat/brev-rummet-omgang1`, arbetskopia `brev-a`)

### Vad som byggdes

Datamodellen, reglerna och rutterna för brevrummet. Inga vyer, ingen CSS.

- Migreringen `supabase/migrations/20261121130000_brev_rummet.sql`: nya nullbara kolumner på `letters` (bara tillägg, går att köra flera gånger). **Inte körd.** Art director kör den.
- Rena, testade funktioner i `src/lib/letters/` (test: `src/lib/letters/__tests__/brevrummet-motor.test.ts`, 43 fall; autosparet i `src/hooks/__tests__/use-brev-autospar.test.tsx`, 2 fall).
- Rutterna i `src/app/api/letters/` (utom `download/`).
- Kravanropet i AI-lagret: `src/lib/openai/brevKrav.ts`.
- Storen och hooken: `src/store/letter-store.ts`, `src/hooks/use-letters.ts`.

### Nya kolumner på `letters`

| Kolumn | Typ | Innehåll |
|---|---|---|
| `body_stycken` | jsonb | Styckena som ren text (string[]). Källan. |
| `halsning` | text | Null = mallens förval. |
| `mottagare_person` | text | Namngiven mottagare. |
| `mall_id` | text | CV-mallens id. Null = gammalt brev (ritas i `template_id`). |
| `font_id` | text | Null = mallens eget. |
| `krav` | jsonb | `BrevKrav[]`. Null = inte läst, `[]` = inget kravmått. |
| `forberett_at` | timestamptz | Första kopiering eller nedladdning. |
| `forberett_som` | text | `'kopierat'` eller `'nedladdat'` (check). **Utöver specen**, se beslut. |
| `cv_id` | uuid → `cv_texts(id)` on delete set null | **Fanns bara i typfilen, inte i databasen.** |

Plus index `idx_letters_user_updated (user_id, updated_at desc)`.

### Funktioner för etapp 2 (signaturer)

Rena (klientsäkra, går att använda i serverkomponenter och i klienten):

```ts
// src/lib/letters/lista.ts
avdubblaBrev<T extends BrevRadForLista>(rader: readonly T[]): T[]
brevlista<T>(rader: readonly T[], harBetalt: boolean): Array<T & { isLocked: boolean }>
arBrevLast<T>(id: string, rader: readonly T[], harBetalt: boolean): boolean
oppnaBrevIds<T>(rader: readonly T[], harBetalt: boolean): Set<string>
OPPNA_BREV_GRATIS = 2

// src/lib/letters/lage.ts
brevetsVag(brev: { forberett_at?: string | null }, sokt: boolean): { steg: BrevSteg; klara: BrevSteg[] }
nastaSteg(indata: { brev; sokta: ReadonlySet<string>; harCv: boolean; harBetalt?: boolean; antalAnsokningar?: number }): NastaSteg
  // NastaSteg = { lage, brevId, overrad, rubrik, text, knapp: { text, href }, stortTal: { tal, rest } | null, vag }
kravForBrev(brev): BrevKrav[] | null          // kraven med träffar omräknade mot texten
stortTalForBrev(brev): { tal: string; rest: string }   // "6" + "av 7 krav i annonsen", eller "150" + "ord"

// src/lib/letters/brevData.ts
brevDataFranBrev(letter, profil: BrevProfil | null, user?: { email? }, opt?: { nu?: Date }): BrevData
titelUrStrukturerad(structuredData: unknown): string | null

// src/lib/letters/stycken.ts
styckenForBrev(letter): string[]              // body_stycken, annars lat ur content
raknaOrd(stycken): number
brevSomText({ halsning, stycken, sprak, avsandare: { namn } }): string   // "Kopiera text"
forvaldHalsning(sprak): string                // "Hej," / "Dear Hiring Manager,"
avslut(sprak): string                         // "Med vänlig hälsning" / "Kind regards"

// src/lib/letters/krav.ts
kravMedTraffar(krav, stycken): BrevKrav[] | null
kravMatt(krav): { antal; medSvar; saknas } | null   // null när färre än tre krav
forvaltStycke(antalStycken): number           // där "Här hamnar meningen" ska pulsera

// src/lib/letters/brevKvot.ts
brevKvot(profil, harBetalt, nu?): BrevKvot    // { harBetalt, grans, anvant, kvar: number | null, nastaGratisbrev: ISO | null }
formatGratisbrevDag(iso): string              // "fredag 27 nov"

// src/lib/letters/brevRegler.ts
premiumSparr({ mallId?, fontId?, ton? }, harBetalt): 'mall' | 'typsnitt' | 'ton' | null
farSparaMall(mallId, harBetalt): boolean
startmallForBrev(cvMall, harBetalt): string
BREV_TYPSNITT_IDS, PREMIUM_TYPSNITT_IDS, PREMIUM_TON
```

Bara server (`src/lib/letters/server.ts`, tar Supabase-klienten med användarens session):

```ts
hamtaBrevlista(supabase, userId): Promise<{ brev: BrevIListan[]; harBetalt: boolean; kvot: BrevKvot }>
  // BrevIListan = Letter & { isLocked, soktDatum, ansokanId, kravTraffar }
arBrevLastForAnvandare(supabase, userId, letterId, harBetalt): Promise<boolean>
hamtaSokta(supabase, userId, letterIds?): Promise<Map<letterId, { id, applied_at }>>
hamtaBrevProfil(supabase, userId, cvId?): Promise<{ profil: BrevProfil & kvotkolumner | null; cvStrukturerad }>
markeraForberett(supabase, userId, letterId, som: 'kopierat' | 'nedladdat')
ritaRad(rad, profil, user?): string           // content för en rad
```

Hem (Dina brev) gör ungefär: `hamtaBrevlista` → `nastaSteg({ brev, sokta: new Set(brev.filter(b => b.ansokanId).map(b => b.id)), harCv, harBetalt })`, och för väggens bana `brevetsVag(brev, !!brev.ansokanId)`.

### Rutter

| Rutt | Kropp | Svar | Fel |
|---|---|---|---|
| `GET /api/letters` | | `{ data: BrevIListan[], harBetalt, kvot }` | `?saved=` ignoreras numera |
| `GET /api/letters/[id]` | | `{ data: Letter & { isLocked, kravTraffar, soktDatum, ansokanId }, harBetalt }` | låst brev ger 200 med `isLocked: true`, aldrig 404 |
| `PUT /api/letters/[id]` | `{ stycken?, halsning?, mall_id?, font_id?, title?, company?, job_title?, mottagare_person? }` (äldre: `content`, `is_saved`) | `{ data: Letter & { isLocked:false, kravTraffar } }` | 403 `letter_locked`, 402 `premium_required` + `sparr`, 400 `invalid_field` + `falt` |
| `POST /api/letters/generate-preview` | som förut + `mall_id?`, `font_id?` | som förut + `data.body_stycken/krav/mall_id/kravTraffar`, `kvot` | 402 `premium_required` + `sparr` (mall, typsnitt, ton auto), 429, 422 |
| `POST /api/letters/[id]/skriv-om` | `{ tonality?, language? }` | `{ data, kvot }` | 403, 402 (`sparr:'ton'`), 422, 429, 409 `annons_saknas`/`cv_saknas` |
| `POST /api/letters/[id]/forberett` | `{ som: 'kopierat' \| 'nedladdat' }` | `{ data: { forberett_at, forberett_som } }` | tillåten på låsta brev |
| `POST /api/letters/[id]/krav` | `{ kravIndex, mening, stycke? }` | `{ data, stycke }` | 403, 409 `krav_saknas`, 400 |

Storen (`useLetterStore`) och hooken (`useLetters`) har `sparaBrev(id, andring)`, `skrivOmBrev(id, { tonality?, language? })`, `markeraForberett(id, som)`, `laggTillKravMening(id, { kravIndex, mening, stycke? })` och fälten `kvot`, `harBetalt`. De kastar `BrevFel` (`code`, `status`, `payload`). `useBrevAutospar(id, { fordrojningMs?, onSparat? })` ger `{ spara(andring), sparaNu(), status: 'sparat' | 'vantar' | 'sparar' | 'fel', fel }`.

### Ritningen av content

All HTML för `content` ritas i `ritaBrevHtml` (`src/lib/letters/ritaBrev.ts`). Tills arkets `renderBrevHtml` är sammanslagen ritas även nya brev i gamla Klassisk. Sammanslagningen byter raden märkt `BREVMALL` mot `if (val.mall_id) return renderBrevHtml(val.mall_id, data, { typsnitt: val.font_id ?? null })` plus importen. I reservvägen byts `<` och `>` i text mot ‹ › (den gamla mallen avkodar entiteter och kan inte skydda text).

### Beslut där specen var tyst

1. **`forberett_som`** (ny kolumn): Nästa steg säger "nedladdat" eller "kopierat", och det går inte att veta utan att spara det.
2. **`cv_id` skapas i migreringen** med främmande nyckel till `cv_texts`, `on delete set null`. Kolumnen fanns inte i databasen.
3. **Premium-svaret är 402** `{ error: 'premium_required', code: 'premium_required', sparr }`, samma status som nedladdningens spärr.
4. **Låset räknar alla rader**, inte bara sparade. En dubblett som avdubbleringen gömmer räknas som låst på gratisnivån. Följd: en gratisanvändare med många gamla osparade förhandsvisningar kan få sparade brev låsta som var öppna i går.
5. **Kraven sparas med originalcitatet.** Träffarna räknas om vid läsning (`kravTraffar`), så att en träff kommer tillbaka om texten skrivs tillbaka.
6. **Brevets datum är `created_at`** (svensk tid), så att samma brev får samma datum i alla mallar.
7. **Första ändringen av ett gammalt brev** (stycken, hälsning, mall, typsnitt, företag, tjänst, mottagare) läser styckena ur content och ger brevet startmallen (CV:ts mall om tillåten, annars Linne). Bara titeln ändrad: ingen flytt. Äldre klient som skickar färdig HTML på ett gammalt brev: sparas som förut.
8. **Överraden "Ditt första brev · ingår gratis"** blir "Ditt första brev" för Premium.
9. **Omskrivningen räknar kvoten före modellanropet**, som genereringen gör i dag (två snabba anrop kan inte båda gå igenom; ett misslyckat anrop förbrukar kvoten, som i dag).
10. **Genereringen sätter `first_letter_created_at` och onboarding-steget** (förut bara när brevet sparades för hand, men nu sparas allt av sig självt).
11. **Kravanropet görs efter brevet** (behöver styckena), med snabbmodellen utan thinking. Det lägger någon sekund på väntan. `extractJobInfo` körs nu parallellt med brevet, vilket tar igen en del.
12. **Premiumbehörigheten** i de nya kontrollerna är `userHasAccess(..., 'any')`, samma som genereringen och låset i dag.

### Det jag såg men inte ändrade

- Behörigheten skiljer sig mellan kontrollerna: genereringen, låset och nu mall/typsnitt/ton läser `'any'` (alla betalda spår, även `tester`), nedladdningen kräver `letter_download` (spåren `cv` och `allt`), och `checkLetterQuota` i quotaService läser `letter_download`. En kund med bara Testpaketet har alltså obegränsade brev utan lås men får inte ladda ner. Oförändrat.
- `src/app/dashboard/mina-brev/page.tsx` filtrerar fortfarande på `is_saved` och låser med den gamla regeln. Etapp 2 (hem) byter till `hamtaBrevlista`.
- `src/app/api/letters/generate/route.ts` (storens `generateLetter`) används inte av något gränssnitt jag hittade och är orörd: den sparar inga stycken.
- Den publika utkastvägen (`/api/public/letter-draft/claim`) skapar brev med ren text i `content`, utan `mall_id`. De ritas som förut, och `styckenForBrev` läser texten som stycken. Inget ändrat där.
- Nedladdningsrutten låser inte gamla brev (arkets fil).

### Det som återstår

- Köra migreringen (art director).
- Byta `BREVMALL`-raden i `ritaBrev.ts` vid sammanslagningen.
- Ingen rutt är provkörd mot databasen (kolumnerna finns inte än). Rutterna är typkontrollerade, logiken under dem är enhetstestad.

### Hur man backar

Rutterna och biblioteken: `git revert` på motorns commits. Migreringen är bara tillägg; kolumnerna kan stå kvar. Vill man ta bort dem: `alter table public.letters drop column if exists body_stycken, drop column if exists halsning, ...` (inte förrän koden som läser dem är backad).



## Kitet (etapp 1, gren feat/brev-rummet-c)

**Byggt.** Gränssnittets grund enligt BYGGSPEC avsnitt 6: `src/app/brev3.css` (klasser `b3-*`, tokens under `[data-rum="brev"]` i ljust och mörkt) och komponenterna i `src/components/brev3/kit/`. Vyerna importerar från `@/components/brev3/kit` och skriver ingen egen CSS (layout mellan delarna får göras med Tailwind).

**Nya filer.**
- `src/app/brev3.css`, importerad i `src/app/dashboard/layout.tsx` (en rad) och i förhandsvisningen.
- `src/components/brev3/kit/`: `BrevVagg.tsx` (BrevVagg, BrevFlikar, VaggArk), `BrevBana.tsx`, `ArkBunt.tsx`, `delar.tsx` (StorKnapp, VitKnapp, Bricka, LitenKnapp, Chip, Tagg, MatarBricka, Formatmarken, Pips, KravBitar), `LyftPanel.tsx` (Golv, LyftPanel, PanelHuvud, SektionsHuvud), `Matare.tsx` (MattRutnat, Matare, KravMitt, LangdMitt, MallMitt), `Kort.tsx` (Radkort, JobbKort, JobbRutnat, BrevKort, BrevRemsa, NyttBrevKort), `Arbete.tsx` (ArbetsYta, ArbetsHuvud, MallKapsel, Avsnittsrad, Blad), `BrevSparr.tsx` + `BrevSparrLaddare.tsx`, `veckoremsa.ts` (+ test), `ikoner.tsx`, `index.ts`.
- `src/app/brev3-kit/page.tsx` + `ForhandsKlient.tsx`: förhandsvisning på `/brev3-kit`, 404 i produktion, utanför det inloggade skalet med `data-rum="brev"`. `?tema=mork|ljus`, `?sparr=nedladdning|vecka`.

**Beslut.**
- Brytpunkten är 1280 px (xl), samma som testernas omgång 3. Spärren byter till dialog vid 1060 px (den är 1020 px bred).
- Brevets väg tar `BrevSteg` ur kontraktet (`steg` = aktuell, `klara`). Datorns platser är Mains koordinater i alla lägen; Hem-ny ritar samma väg 20 px längre åt höger, det följer inte med.
- Klara "läs igenom" heter "läst igenom" (som Skickat-1440). Skickat som aktuell plats ritas som den stora punkten under flaggan (inte ritat i skissen).
- Bladets innehåll som Skriv och Brevet delar fick klasser utan komponent: `b3-kr`, `b3-saknas`, `b3-annons`, `b3-kravchips`, `b3-ton`, `b3-seg`, `b3-skrivbricka`, `b3-lop`, `b3-sokt-ik`, `b3-premium-rad`. Valda knappar markeras med `aria-pressed="true"`.
- `BrevSparr` ärver PaywallCard:s logik (copy, kampanjpris, mätning, spårkund, påminnelse). Skissens tre punkter, PDF/Word/Utan tak och veckoremsan står i komponenten. "Kopiera texten i stället" anropar `onKopiera` och stänger.

**Återstår / för nästa etapp.**
- `NyttBrevKort` står sist i remsan på dator men under remsan på telefonen: rendera den två gånger med `hidden xl:contents` / `xl:hidden` (se förhandsvisningen).
- Bladets fot på telefonen (Ladda ner PDF överst, två knappar under) byggs av vyn; Blad ger bara ramen.
- `returTill` skickas oförändrad till `kopstegHref`; kassan godtar i dag bara vissa returadresser, mallar-byggaren behöver stämma av det.

**Backa.** Ta bort importen i `src/app/dashboard/layout.tsx`, `src/app/brev3.css`, `src/components/brev3/kit/` och `src/app/brev3-kit/`. Inget annat rörs.
