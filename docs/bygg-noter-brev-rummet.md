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


## Körningar mot produktion

- **2026-11-21, migreringen `20261121130000_brev_rummet.sql`** kördes av art director med Supabase-MCP (`apply_migration`, namn `brev_rummet`) inom ägarens beställning av bygget samma dag. Bara tillägg: nio nullbara kolumner på `letters` (`body_stycken`, `halsning`, `mottagare_person`, `mall_id`, `font_id`, `krav`, `forberett_at`, `forberett_som`, `cv_id`), en check på `forberett_som` och indexet `idx_letters_user_updated`. Kontrollerad direkt efteråt mot `information_schema.columns`: alla nio finns och är nullbara. Inga rader ändrade.
- **Backa:** `alter table public.letters drop column ...` för de nio kolumnerna och `drop index idx_letters_user_updated`. Koden före brevrummet läser inga av kolumnerna, så de kan också ligga kvar.



Ett avsnitt per uppdrag (byggspecen avsnitt 1 punkt 15). Filen skapas på flera grenar samtidigt: slå ihop avsnitten vid sammanslagningen.

## Arket (brevmallen), gren `feat/brev-rummet-b`, 2026-11-21

### Vad som byggdes

En brevmall som ritar ett personligt brev i vilken som helst av de 40 CV-mallarna. Brevet läser CV-mallens definition (`MallDef`) och ritar huvudet med CV-renderarens egna delar, så namn, titel, kontakt, typsnitt, färger och linjer blir CV:ts. Under huvudet: datum (med orten), mottagare (företag fet, person under), ärenderad i rubrikernas typsnitt och färg, hälsning, stycken, avslut och namn.

- Huvudformerna: vänster, centrerad, höger, band, namnruta (Kvadrat), tidningshuvud, delat och remsa ritas av CV-renderaren. Monogram (Sigill), ram (Pergament), stapel (Fasad), två namnrader (Affisch) följer med.
- Sidospaltsmallar med kontakten i spalten (Kalksten, Granit, Sand, Ek, Ritning): spalten i hela sidans höjd med kontakten överst, brevet i huvudspalten. Granit: bandet överst, spalten under. Ritning: namnet i spalten. Kvadrat har kontakten i huvudet och ritas utan spalt.
- Hoppas över: foto, tidsaxel (Horisont), rutor (Kakel), profil i spalter (Tidning), spaltens CV-avsnitt. Sockel behåller sockeln med kontakten nederst, Ramverk ramen, Kant färgkanten, Terrakotta sidans färg.
- Under huvudet: har huvudet ingen egen avgränsning (linje, ram, band, tidningshuvud, namnruta) ritas rubrikernas linje (hel eller kort, som Terrakotta och Tusch), annars en hårlinje i mallens linjefärg.
- Brödtexten står en punkt över CV:ts brödtext (10,5 till 12 pt) med radavstånd 1,45 till 1,6. Krympning i två steg innan sida två: steg 1 minus 0,5 pt och 0,1 i radavstånd, steg 2 minus 1 pt och 0,2. Steget väljs genom mätning (skript i dokumentet, `passaBrevet` i BrevArk); Word väljer med en uppskattning (`uppskattatSteg`).
- Mörkrums band är 52 mm i brevet i stället för 72 (byggt för fotot), Panoramas band får egen luft utan foto.
- Ärenderaden tar rubrikernas färg bara om den har minst 4,5:1 mot papperet, annars textfärgen (Skylt har vita rubriker på band).

### Nya filer

- `src/lib/letters/brevmall/render.ts` renderaren (inga Node-moduler, kan laddas dynamiskt i klienten).
- `src/lib/letters/brevmall/word.ts` Word-byggaren (server).
- `src/lib/letters/brevmall/index.ts` serverns ingång.
- `src/lib/letters/brevmall/katalog.ts` `brevMallKatalog()`, `brevMallKort(id)`, klientsäker.
- `src/lib/letters/brevmall/text.ts` fasta rader sv/en, datum, `brevOrd`, `brevSomText` (Kopiera text), `hittaMarkeringar`, klientsäker.
- `src/lib/letters/brevmall/scopa.ts` brevets HTML i sidan utan iframe (`scopaBrevHtml`), `passaBrevet`, klientsäker.
- `src/lib/letters/brevmall/exempel.ts` exempelbrevet till Nordanvind Energi i tre längder (122, 150, 352 ord) och skissens sju krav. Mallar utan brev kan använda `exempelBrev('normal', användarensAvsändare)`.
- `src/components/brev3/ark/BrevArk.tsx`, `BrevMiniatyr.tsx`, `index.ts`.
- `src/app/api/letters/download/brev-data.ts` TILLFÄLLIG `brevDataFranBrev` (se nedan).
- `scripts/brevmallar-kontaktark.ts` kontaktarken.
- Tester: `src/lib/letters/brevmall/__tests__/brevmall.test.ts`, `src/app/api/letters/download/__tests__/route.test.ts`.

### Gränssnittet

```ts
renderBrevHtml(mallId: string, data: BrevData, val?: BrevVal, opt?: BrevRenderVal & { steg?: 0 | 1 | 2 }): string
byggBrevDocx(mallId: string, data: BrevData, val?: BrevVal): Promise<Buffer>   // kastar för mallar utan Word
brevOrd(data: BrevData): number                                              // bara styckena
brevMallKatalog(): BrevMallKort[]                                            // katalog.ts, klientsäker
brevSomText(data: BrevData): string                                          // text.ts, hälsning + stycken + avslut och namn
```

- `BrevVal.accent` är en hex bland mallens fyra accenter; en färg utanför dem ignoreras. `BrevVal.typsnitt` ersätter brödtexten (som i CV:t), namn och rubriker behåller mallens.
- Markeringar: kravets citat söks i styckena med normaliserade blanksteg (skiftläge först exakt, sedan inte). Ett citat som överlappar ett tidigare märkt hoppas över. `data-krav` är kravets plats i listan, 1-baserad, så att siffran stämmer med listan i bladet även när ett krav saknar svar.
- Dokumentet bär `data-steg` och `data-grans` (mm) på `.cv.brev`. `opt.steg` låser steget (`data-last`).
- Kontraktet `typer.ts` är oförändrat.

### BrevArk och BrevMiniatyr

- `BrevArk { html, bredd?, lage?: 'arbete' | 'golv', saknatKrav?: { nr, stycke }, onStycke?, ariaLabel?, className? }`. Ge `bredd` (480 i arbetsläget på dator) så ritas arket i rätt skala vid serverrenderingen. Utan `bredd` mäts behållaren och platsen hålls med A4:ans proportioner.
- Kravens siffror mäts i klienten och läggs 30 px till vänster om styckets text; två krav på samma rad staplas. Saknat krav: pulserande plats sist i stycket (nästa rad om raden är full), streckad siffra och etiketten "Här hamnar meningen" som hänger ut över arkets högra kant. Aktivt stycke (`opt.aktivtStycke` i renderaren): orange ram i HTML:en och etiketten "Du ändrar här" vid kanten. Med `onStycke` blir styckena knappar (Enter och mellanslag fungerar, synligt fokus).
- `BrevMiniatyr { html, bredd, hojd?, className? }` serverrenderbar, utan mätning.
- Båda scopar CSS:en till en egen klass per instans (`useId`), så olika mallar på samma sida inte påverkar varandra.

### Nedladdningen

- Ny väg: `POST /api/letters/download` med `{ id, format: 'pdf' | 'docx' }`. Raden läses med id och `user_id`. Har den `mall_id`: PDF av `renderBrevHtml` (typsnitten inbäddade, typsnittet ur `font_id`, fynd 8) eller Word av `byggBrevDocx` (400 om mallen saknar Word), och `forberett_at` sätts om den är tom (fel där stoppar aldrig filen). 404 om brevet inte finns.
- Gamla vägen: brev utan `mall_id`, eller anrop utan `id`, går som förut. Skickas `id` utan `content` hämtas `content` ur raden. Inloggningen, 402-spärren (`letter_download`), 422 `name_required` och loggningen är som förut och ligger före den nya vägen.
- Avsändaren: `kontaktIBrev(profil, user)`, samma som gamla vägen. Profilen har ingen yrkestitel; titeln under namnet kommer med motorns `brevDataFranBrev` (troligen ur CV:t).

### Sammankoppling med motorn

`src/app/api/letters/download/brev-data.ts` har `brevDataFranBrev(letter, profil)` med samma signatur som motorns. Vid sammanslagningen: byt importen i `route.ts` (märkt `TODO(motorn)`) mot motorns funktion i `src/lib/letters/` och ta bort `brev-data.ts`. Stäm av att motorns `profil` har fälten `namn, epost, telefon, ort` (och gärna `titel`), annars anpassa anropet. `forberett_at` skrivs direkt i rutten; används motorns `POST /api/letters/[id]/forberett` i stället, ta bort det blocket. Kolumnerna läses otypat tills `database.types.ts` har dem.

### Exporter i `src/lib/cv/**` (bara exporter, inga ändringar i sak)

Varje fil fick en exportrad sist i filen (en rad tillagd, inget annat rört, minsta konfliktyta mot CV-rummets session):

- `src/lib/cv/mallar/render/html.ts`: `export { css as mallCss, huvud as mallHuvud }`, `export type { Ctx as MallCtx }`.
- `src/lib/cv/word/bygg.ts`: `export { huvudInnehall, huvudStycken, bandCell, remsaTabell, stilar, wordTypsnitt, skapaLinjer, linjerSomBehovs, rubrik2, iSpaltcell, stycke, tabell, tabellCell }`, `export type { B as WordSammanhang, Ruta as WordRuta }`.

Kopierat i stället för exporterat: kontaktavsnittets markup i spalten (fem rader, `kontaktAvsnitt` i render.ts) och enheterna i Word (`mm`, `pt`, `hp`, `ord`, A4). Byter CV-rummets session namn på något av de exporterade fäller `tsc` vid sammanslagningen; då pekas exportraden om.

### Fynd 7: Sidofält

`src/lib/letters/docx-templates.ts`: HTML-mallens spalt hade `word-break: break-all`, som bröt e-postadressen vid sista tecknet. Nu `word-break: normal; overflow-wrap: anywhere` och spalten växer med adressen (23 till 36 procent). Word-filen ger en lång adress lägre grad (lägst 8 pt) i stället för att bryta den. Inget annat i mallen är ändrat.

### Beslut jag tog

- Brödtexten en punkt över CV:ts: med CV:ts egen grad blev brevet tydligt mindre än förlagorna (Calibri och Garamond är små i grad 10,5).
- Sidospalten i hela sidans höjd (förlagan Kalksten), inte under huvudet som i CV:t.
- Datumraden har orten först när profilen har en ort ("Stockholm, 21 november 2026"), som förlagorna. Datumet i filen är nedladdningsdagen.
- Förvald hälsning: "Hej {förnamn}," med namngiven mottagare, annars "Hej,". Engelska: "Dear {namn}," eller "Dear Hiring Manager,".
- `brevOrd` räknar bara styckena.

### Testat

- `npx vitest run src/lib/letters/brevmall src/app/api/letters/download`: 23 tester gröna (alla 40 mallar ritar, markeringar, aktivt stycke, skrivläget, engelska, typsnitt, accent, ordräkning, datum, katalogen, scopningen, Word för alla 26 Word-mallar, rutten med mockad databas: 401, 402, 404, Word, mall utan Word, gamla vägen).
- `npx tsc --noEmit` rent för mina filer.
- Kontaktarken (puppeteer direkt från renderaren): alla 40 mallar med 122 och 352 ord ryms på en sida.
- PDF som i nedladdningen för tio mallar (långa brevet): en sida var, ritade till bild och granskade.
- Word: åtta mallar öppnade i Microsoft Word, sparade som PDF och ritade till bild (vanligt och långt brev): en sida var efter rättningen av spaltradens höjd.
- BrevArk och BrevMiniatyr ritade i Chrome med en liten esbuild-sida (siffror, saknat krav, aktivt stycke, tryck på stycke).

### Inte testat

- Nedladdningsrutten mot riktig databas och i Vercels Chromium (`@sparticuz/chromium`). PDF-vägen är inte körd genom rutten, bara samma HTML och utskriftsinställningar i lokal puppeteer.
- BrevArk i den riktiga appen (Next, kitets CSS, mörkt läge, telefonbredd). Etiketterna hänger ut över arkets högra kant som i skissen; behållaren måste tillåta det (inte `overflow: hidden`).
- Brev som går över en sida (längre än cirka 420 ord): sida två är inte granskad i någon mall, varken i PDF eller Word.

### Det som återstår

- Koppla in motorns `brevDataFranBrev` (se ovan).
- Etapp 2 ska skicka `id` till nedladdningen för nya brev.

### Hur man backar

Ta bort `src/lib/letters/brevmall/` utom `typer.ts`, `src/components/brev3/ark/`, `brev-data.ts` och den nya vägen i `download/route.ts` (blocket efter JSON-tolkningen och funktionerna `filnamn`, `brevmallPdf`, `nyttBrevSomFil`), och de två exportraderna sist i `html.ts` och `bygg.ts`. Sidofält: återställ `.sidebar`-reglerna och e-postradens grad i `docx-templates.ts`.


## Hem (etapp 2, gren `feat/brev-rummet-omgang1`, arbetskopia `brev-a`), 2026-11-21

### Vad som byggdes

- **QA-kontona** (`scripts/qa-brev-konton.mjs`, körs med `SCRATCH=<mapp> npx tsx scripts/qa-brev-konton.mjs skapa|radera`): `gratis-ny`, `gratis-brev`, `premium` under `@jobbcoach-qa.test`, Erik Lindberg i Stockholm, onboarding klar (`onboarding_track` + `_asked_at`), CV i `cv_texts` med `structured_data` (`bygge.mall` linne respektive koppar). Breven är rader utan AI-anrop, `content` ritad med motorns `ritaRad`. Premium via `premium_grants` (7 dygn). Varje konto har också fyra påhittade jobb i `job_matchings_cache` så att "Jobb att skriva till" syns. E-post, lösenord och id står bara i `UNDERLAG\qa\qa-konton.json`. Raderingen tar bara rader med kontonas egna `user_id` (och ansökningarnas id) och räknar före varje delete.
- **De två kända felen**: `stycken.ts` läser tillbaka stycken ur brevmallens HTML (`p[data-stycke]`, entiteter avkodade, markeringar och skrivmarkör bortrensade) före den gamla vägen (`div.body-content`). Testet prövar båda vägarna. Nedladdningstestets låtsasdatabas svarar på `hamtaBrevProfil` och kedjan i `markeraForberett`.
- **Dina brev** (`src/app/dashboard/mina-brev/page.tsx`, `loading.tsx`, `src/components/brev3/hem/`): serverkomponent, all första data i en parallell omgång (`hem/data.ts`: `hamtaBrevlista`, `hamtaBrevProfil`, CV:na med `bygge` och `personalInfo` som json-sökvägar, antal sökta tjänster, de tolv första jobben ur senaste `job_matchings_cache` som json-sökvägar i stället för hela listan, aktivt CV och orterna för skälen). Alla lägen i motorns `nastaSteg` ritas: första brevet (annonsfältet i väggen), CV saknas (Öppna CV), krav saknas, läs igenom, skicka, alla skickade.
- Miniatyrerna (`hem/Miniatyr.tsx`) delar CSS per brev (en `<style>` per brev för hela sidan) och skalas med CSS-variabler per brytpunkt, ingen mätning i klienten. Bunten bakom brevet visar samma brev i Koppar och Kalksten (eller Björk), ritade på servern.
- Längden: ordantal ur styckena, fyllnaden ur brevmallens egen `uppskattadHojd` mot `brevGransMm` (samma uppskattning som Word-filen väljer steg med). Över en sida när brevet inte ryms ens i krympsteg 2.
- Klientöar (`hem/Klient.tsx`, `hem/CvRad.tsx`): annonsfältet och jobbens "Skriv brev" skriver `coverLetterPrefill` och går till Skriv; Byt CV öppnar `CvPickerGrid` (importerad ur `skapa-brev/components`) i `Sheet`, valet blir `?cv=<id>` och följer med i alla länkar till Skriv; listan fäller ut efter sju kort med sökfält först när breven är fler än sju; `useBetalvaggVisad('kvot')` när låsta kort finns, som förut.
- Texterna: `UNDERSIDA.dinaBrev` och `RUBRIK.dinaBrev` ("Dina brev") ersätter `minaBrev`, sidomenyn och Kom igång-raden läser det nya. `LYFT.minaBrev` borttagen.
- Borttaget: `MinaBrevClient.tsx`, `components/LetterCard*.tsx`, `ViewToggle.tsx`, `illustrations/LetterIcons.tsx`. `scopeLetterHtml.ts` och `getLetterForUser.ts` står kvar (brevvyn och PreviewStep använder dem).

### Beslut jag tog

1. Toppradens konto (Topprad `bara="atgarder"`) står till höger om väggens rad på dator och bredvid flikarna på telefonen, som i testernas vägg. Skissen ritar ingen topprad, men kontomenyn behövs.
2. Jobbens tagg är publiceringsdagen ("I dag", "I går", "I tisdags", "12 nov"), inte "Ny i natt": matchningscachen säger inte när en träff kom. Skälraden kräver ett aktivt CV för matchning; QA-kontona har inget, så raden syns inte där.
3. Annonsfältet skickar annonsen med tom titel och tomt företag. Skriv får läsa ut dem (arbetes sak); står "Annonsen kom från jobbmatchningen" för en inklistrad annons behöver Skriv skilja på dem.
4. "Sökt 14 nov"-kortets länk till den sökta tjänsten är sidotexten "I Sökta tjänster" (`/dashboard/sokta-tjanster/<id>`).
5. Bunten står 26 px längre till vänster än i skissen (sidomenyn gör golvet smalare än skissens 1440, och tredje arket klipptes annars av väggens kant). På Hem-ny står banan 40 px längre åt höger så att den inte går in under annonsfältet.
6. Telefonens vägg för Hem-ny är 570 px (inte ritad), annonsfältets knapp slutar på 448 px.

### Det som återstår

- "Byt CV" finns inte på telefon (Mobil-hem ritar ingen väggrad).
- `loading.tsx` har måtten för läget med brev (558/438); för en ny användare blir väggen högre när sidan kommer.
- Länkarna till Mallar, Brevet och Skriv pekar på vyer som andra byggare gör.

### Hur man backar

`git revert` på hem-commitarna. Den gamla listan återställs med `git checkout <före> -- src/app/dashboard/mina-brev`. QA-kontona: `SCRATCH=<mapp> npx tsx scripts/qa-brev-konton.mjs radera`.
## Mallar (etapp 2, gren `feat/brev-rummet-c`, arbetskopia `brev-c`)

### Vad som byggdes

- **Fliken Mallar** `/dashboard/mina-brev/mallar?brev=<id>` (skissen Mallar). Serverkomponenten `src/app/dashboard/mina-brev/mallar/page.tsx` läser brevlistan (`hamtaBrevlista`: lås och `harBetalt`), kontots paket (`getUserScope`, nedladdning = `letter_download`) och spår, och ritar brevet i de åtta första mallarna plus den som visas. Klienten `src/components/brev3/mallar/MallarKlient.tsx` provar mallar och typsnitt, sparar, laddar ner och öppnar spärren.
  - Adressen: `brev` (annars det senast uppdaterade), `mall` (mallen som provas; köpreturen sätter den), `format`, `ladda=1`. Klienten skriver tillbaka `brev` och `mall` med `replaceState` och tar bort `ladda`, `format`, `premium_activated`.
  - Premium: en provad mall sparas direkt med motorns `PUT` (`Brevet står nu i Kalksten`). Gratis: Linne och Björk sparas, övriga provas (`Du provar mallen Koppar` + Premiumtagg, `Tillbaka till Linne`). Låst brev: allt provas, inget sparas. Gammalt brev utan `mall_id`: visas som "Du provar" tills något sparas (då flyttar motorn brevet till nya formatet).
  - Typsnitt: "Mallens eget" + de elva, Helvetica låst för gratis (`aria-disabled`, ingen spärr: inga nya spärrar). Valet ritar om arket och sparas (`font_id`).
  - Filtren Alla 40, Gratis, Enkla, Med färg, Sidospalt härleds ur katalogens `familj` och `stil` (`filter.ts`, med test). Med färg = fyllda huvuden, band, spalter, sidor eller rubriker; Enkla = en spalt utan färgfält och utan sidospalt.
  - "Visa de 32 övriga": resten hämtas i ett anrop (`mallar: [...]`). Filter som visar mallar som inte är hämtade hämtar dem på samma sätt.
  - Utan brev: exempelbrevet (`exempelBrev('normal', egen avsändare)`, titel ur senaste CV:t), "Skriv ditt första brev, så ser du det här i alla mallar" och "Skriv brevet".
  - Telefon (inte ritad): väggen växer med innehållet, arket 60 % av bredden med CV:t bakom, brickorna som svepbar rad, mallarna som remsa (160 px) med ett sista kort "Visa de 32 övriga", filtren och typsnitten svepbara, en fast rad längst ner (sticky, ovanför dörrnavet) med "Ladda ner i {mall}".
- **Förhandsvisningsrutten** `POST /api/letters/[id]/forhandsvisa` (`src/app/api/letters/[id]/forhandsvisa/route.ts`). Ägarkontroll med id och `user_id` (404), ingen skrivning, ingen AI, ingen kvot. Låsta brev går att förhandsvisa.
  - `{ mall_id?, font_id? }` -> `{ html, mall_id, font_id }`. `mall_id` saknas: brevets mall, annars startmallen. `font_id` saknas: brevets; `null`: mallens eget.
  - `{ mallar: string[], font_id? }` -> `{ mallar: { [id]: html }, font_id }`, högst 40.
  - id `exempel` ritar exempelbrevet med användarens namn (Mallar och mallväljaren utan brev).
  - 400 `invalid_field` (`falt: font_id | mall_id | mallar`), 401, 404, 500.
- **Nedladdningen i gränssnittet**: `POST /api/letters/download` med `{ id, format }`. Det som visas sparas först om det skiljer sig från det sparade (filen ritas ur raden). 402 öppnar spärren, 422 visar `NameRequiredNotice` och laddar ner när namnet är sparat. Gratis får `BrevSparr` variant `nedladdning` (kopiera texten i stället kopierar `brevSomText` och märker brevet `kopierat`). Köpet: `kopstegHref(SALD_PLAN, 'nedladdning', { retur: '/dashboard/mina-brev/mallar?brev=..&mall=..&format=pdf', mall })` via spärren; Premiumkortet går till köpsteget med plats `mall` och samma retur. Kassan skickar tillbaka med `&ladda=1&premium_activated=true` och filen laddas ner av sig själv en gång.
- **Mallväljaren** `src/components/brev3/mallar/MallValjare.tsx` (default export, ladda med `next/dynamic`):

| Prop | Typ | |
|---|---|---|
| `open`, `onClose` | `boolean`, `() => void` | Sheet:ets läge |
| `vald` | `string \| null` | brevets mall, markeras "Vald" |
| `onValj` | `(mallId) => void` | en mall användaren får ha. Stänger inte själv |
| `harBetalt` | `boolean` | utan: Premiummallar med låstagg |
| `onPremium?` | `(mallId) => void` | gratis trycker på Premiummall. Saknas: de är `aria-disabled` |
| `brevId?` | `string \| null` | riktiga miniatyrer (ett anrop vid första öppning, `exempel` går), annars katalogens `/mallar/v2/<id>-liten.webp` |
| `fontId?` | `string \| null` | typsnitt för miniatyrerna, undefined = brevets |
| `titel?` | `string` | förval "Välj mall" |

- **Typsnittslistan** `src/lib/letters/typsnitt.ts`: `BREV_TYPSNITT` (id, namn, familj, grupp, premium), `typsnittNamn`, `malltypsnittNamn`, `MALLENS_EGET`. Id:n kommer ur `BREV_TYPSNITT_IDS` i `brevRegler.ts`, CSS-stacken ur `src/lib/documents/typsnitt.ts`. `FontSelector.tsx` är orörd (byggaren arbete kan läsa härifrån). Namnen sätts i sig själva med de egna typsnittsfilerna (`fontFace` ur `typsnitt-filer.ts`), inte Google.
- **Köpreturen** `src/lib/stripe/kopRetur.ts` (`arKopRetur`), använd av kassan (`create-plan-session/route.ts`) och köpsteget (`valj-spar/page.tsx`) i stället för deras egna kontroller. Godtar `/dashboard/cv-mallar?`, `/dashboard/mina-brev/mallar?` och `/dashboard/mina-brev/<uuid>?`, under 300 tecken, utan blanksteg, `<>"\`. Test i `create-plan-session/__tests__/retur.test.ts` och `mallar/__tests__/filter.test.ts`.

### Nya filer

`src/app/dashboard/mina-brev/mallar/page.tsx`, `src/app/api/letters/[id]/forhandsvisa/route.ts`, `src/components/brev3/mallar/` (`MallarKlient.tsx`, `MallKort.tsx`, `MallValjare.tsx`, `BytBrevArk.tsx`, `filter.ts`, `klient.ts`, `rita.server.ts`, `text.ts`, `index.ts`, `__tests__/filter.test.ts`), `src/lib/letters/typsnitt.ts`, `src/lib/stripe/kopRetur.ts`. CSS sist i `src/app/brev3.css` (avsnittet "Mallar").

### Beslut

- Åtta mallar på servern (specen), inte fyra som skissen; länken säger därför "Visa de 32 övriga".
- Skissens rubrik "CV-rummets 40 mallar, nu också för brevet" blev "Alla 40 CV-mallar, nu också för brevet": "rum" är ett internt designord (1.7).
- Korten är knappar (`aria-pressed`), inte länkar: ett tryck provar, ingen navigering.
- Mallkortens rad är katalogens kortrad utan foto ("Centrerad."), inte skissens handskrivna ("Centrerat huvud, rak linje.").
- Premium: "Ladda ner i {mall}" ger PDF, en vit bricka "Word" bredvid när mallen har Word; raden intill "PDF att bifoga, Word att ändra i själv." eller "Den här mallen finns som PDF.".
- Byt brev öppnar ett Sheet med användarens brev (högst 30).
- Väggens CV-bild är katalogens stora bild av mallen (exempel-CV:t), inte användarens CV.

### Det som återstår

- Brevet (`/dashboard/mina-brev/<id>`) är godkänd köpretur men läser inte `ladda=1` än (byggaren arbete / etapp 3).
- Mallväljaren är inte inkopplad i Skriv och Brevet (etapp 3).
- `loading.tsx` för Mallar finns inte: föräldern `mina-brev/loading.tsx` (hem) gäller under navigering.

### Backa

Ta bort filerna ovan och avsnittet "Mallar" sist i `brev3.css`; återställ `arMallRetur`/`lasRetur` i kassan och köpsteget (bara `/dashboard/cv-mallar?`).
## Arbete (etapp 2, gren `feat/brev-rummet-b`, arbetskopia `brev-b`)

### Vad som byggdes

Arbetsläget: Skriv brev, Brevet och Målgången, satta ihop av kitet (`ArbetsYta`, `ArbetsHuvud`, `MallKapsel`, `Blad`, `BrevSparrLaddare`) och arket (`BrevArk`, `BrevMiniatyr`).

- **Skriv brev** (`/dashboard/skapa-brev`): en skärm i stället för sex steg. Före skrivandet, väntan, uppspelning stycke för stycke (700 ms, kraven bockas av när deras citat syns, allt direkt under `prefers-reduced-motion`), sedan `router.replace` till `/dashboard/mina-brev/<id>?klart=1`. Sidan är en serverkomponent som läser CV:na (mall och titel ur `structured_data` med JSON-sökväg), låsen, behörigheten, profilen, kvoten och tonen, och ritar arket före skrivandet (brevhuvudet i startmallen, "Arbetsgivaren" och "Ansökan: tjänsten du söker" dämpat). Utan CV skickas man till `/dashboard/profil/cv?reason=cv-required` redan på servern.
- **Brevet** (`/dashboard/mina-brev/[id]`): serverkomponent som läser brevet, låset (`arBrevLastForAnvandare`), sökt (`hamtaSokta`), behörigheterna `any` och `letter_download`, profilen och kvoten, och ritar arket med kravens markeringar. Klienten `BrevetVy` har de fem flikarna (egen flikrad med kitets klass `b3-avsn` och knappar, så att `?flik=` byts med `history.replaceState` utan att sidan hämtas om från servern), autosparet (`useBrevAutospar`), Kopiera text, Word och PDF (`POST /api/letters/download { id, format }`), spärrarna, Markera som sökt och Ta bort.
- **Arket följer texten**: brevmallens renderare (`render.ts`) laddas dynamiskt i klienten (`src/components/brev3/arbete/ritare.ts`, förladdas när webbläsaren har tid över) och arket ritas om lokalt vid varje ändring, med markeringarna och det aktiva stycket. Servern räknar om `content` vid sparningen; arket behåller klientens ritning (samma funktion, plus markeringar), så inget blinkar. Gamla brev utan `mall_id` visar sin sparade HTML tills första sparningen har flyttat dem; då tas `mall_id` ur svaret och arket ritas lokalt.
- **Målgången** (`/dashboard/mina-brev/[id]/skickat`): serverkomponent. Talet är sökta tjänster sedan månadens början, plupparna skickade av användarens brev (högst sju), tredje kortet det senaste matchade jobbet utan brev ur `job_matchings_cache` (`jobs->0..9`, jämfört med brevens företag och tjänst), annars "Skriv nästa brev". Ett brev som inte är sökt skickas till brevet.
- **Gamla redigeringsrutten** `/dashboard/mina-brev/[id]/edit` skickar vidare till `?flik=texten`.
- **Laddvyer** (`loading.tsx` för Skriv och Brevet) i arbetslägets yta med samma blad och ark (`ArbetsLaddar`).

### Nya filer

`src/components/brev3/arbete/`: `texter.ts` (alla nya texter, `arFlik`), `typsnitt.ts` (typsnittslistan, se nedan), `ArbetsRam.tsx`, `ArbetsArk.tsx`, `ArbetsLaddar.tsx`, `SkrivBrev.tsx`, `CvVal.tsx`, `TonVal.tsx`, `BrevetVy.tsx`, `BrevetFlikar.tsx`, `BrevSaknas.tsx`, `Malgang.tsx`, `NastaJobb.tsx`, `ritare.ts`, `arkHjalp.ts`, `ladda.ts`. Rutten `src/app/dashboard/mina-brev/[id]/skickat/page.tsx`.

### Borttaget

`skapa-brev/CreateLetterClient.tsx`, `components/steps/*`, `LetterFlowLayout`, `LetterFlowSummary`, `PrefillBadgeCard`, `FontSelector`; `mina-brev/[id]/ViewLetterClient.tsx`, `edit/EditLetterClient.tsx`, `edit/loading.tsx`. `CvPickerGrid` står kvar (Skriv och Dina brev använder den).

### Typsnittslistan flyttad

`FONTS` i `FontSelector.tsx` lästes inte av någon rutt (nedladdningen läser `src/lib/documents/typsnitt.ts`). Listan som Brevet och Mallar visar finns nu i `src/components/brev3/arbete/typsnitt.ts`: `BREV_TYPSNITT` (id, namn, CSS-familj, premium, modern), `brevTypsnitt(id)` och `typsnittFontFace()` (@font-face ur CV-mallarnas egna filer, så att varje namn står i sitt eget typsnitt). Byggaren mallar kan importera samma.

### Beslut

1. **Sidomenyn** göms från 1280 px medan arbetsläget är öppet (en `<style>` i `ArbetsRam`, gäller bara medan ramen finns), så att arbetsläget står i full bredd som i skissen. Sidomenyn ligger i skalet ovanför innehållet (z-20 mot z-10), så ramen kan inte täcka den, och bredvid menyn klipptes etiketterna "Här hamnar meningen" och "Du ändrar här" vid 1440. Mellan 1024 och 1280 står menyn kvar och ramen börjar efter den, som FlowShell.
2. **Avbryt** i Skriv avbryter väntan i klienten och lämnar annonsen kvar. Servern skriver ändå klart brevet, sparar det och räknar kvoten (rutten kan inte avbrytas). Brevet syns då under Dina brev.
3. **Utkastet** återställs tyst (annons, CV, ton, språk) i stället för dagens val "Fortsätt där du var / Börja om". "Byt annons" tömmer fältet och utkastet. Utkastet har version 2, så gamla utkast kastas.
4. **Gratis utan kvot**: "Skriv brevet" öppnar veckospärren direkt, utan anrop (kvoten är känd från servern). 429 från servern ger samma spärr.
5. **Mallen i Skriv** är den servern ger brevet (`startmallForBrev` på CV:ts mall). Skriv skickar ingen `mall_id`; mallväljaren i etapp 3 behöver skicka den med genereringen.
6. **Ton och språk** väljs i fliken och skrivs om först på "Skriv om brevet" (`skrivOmBrev`, drar kvoten för gratis). Gratis utan kvot: knappen öppnar veckospärren.
7. **Telefon, Brevet**: foten följer Mobil-brevet (Ladda ner PDF överst, Kopiera text och Markera som sökt under, raden om gratis sist). Word finns på telefon som en bred knapp under för den som får ladda ner. Raden "Har du skickat ansökan?" visas bara på dator. Foten ligger sist på sidan som i skissen, inte fast i botten.
8. **Låst brev**: fälten avstängda, autosparet avstängt, kopiera och nedladdning (spärren) fungerar, raden med köpknappen överst i bladet (`kopstegHref(SALD_PLAN, 'kvot', { retur })`).
9. **Mallkapselns miniatyr** är CV-mallens bild (`/mallar/v2/<id>-liten.webp`), inte en ritad brevminiatyr.
10. **Etiketterna på telefonens ark** ("Här hamnar meningen", "Du ändrar här") döljs; de hänger ut över kanten och klipptes. Platsen och siffrorna står kvar.

### Det dagens flöde gjorde som inte längre görs

- Valet "Fortsätt där du var / Börja om" för utkastet (beslut 3).
- `OnboardingNextStep` ("Brev skapat, nästa: Analysera ditt CV") i första steget. Ingen plats i den nya skärmen; genereringen sätter fortfarande onboarding-steget på servern.
- Toasten med maskoten när brevet var skrivet. Ersatt av uppspelningen och brickan "Brevet klart"; aktiviteten loggas fortfarande (`logActivity('letter_created')`).
- Kontaktraden (`KontaktuppgifterRad`) under brevet och i steg 6: telefon och ort i brevhuvudet ändras inte längre här.
- "Ångra" efter Markera som sökt. Nu går man direkt till målgången.
- Mallbyte som skrev om brevet med AI (fynd 3), dialogen "Lämna utan att spara?" och knappen "Spara brevet" (allt sparas av sig självt).

### Ändringar utanför mina filer

- `src/lib/__tests__/namn-valfritt.test.ts`: testet läser `components/brev3/arbete/SkrivBrev.tsx` i stället för den borttagna `CreateLetterClient.tsx` (en rad).
- Inga ändringar i motorn, kitet eller arket.

### Fel jag såg men inte rättade (arket)

- `BrevArk`: när sista raden i stycket är full läggs platsen för ett saknat krav på nästa rad, ovanpå nästa stycke (syns på telefon).

### Det som återstår (etapp 3)

- Mallväljaren i Skriv: knappen i kapseln är märkt `// MALLVÄLJARE: kopplas in i etapp 3` och gör inget.
- Jobbkortet i veckospärren i Skriv visas bara när annonsen kom från matchningen.

### Hur man backar

`git revert` på arbetets commits på grenen. Den gamla stegkoden och vyerna kommer då tillbaka.

## Etapp 3 (sammankoppling, rättningar och slutkontroll), arbetskopia `brev-a`, 2026-11-21

Slutkontrollens resultat står i `docs/qa/brev-rummet-slutkontroll-2026-11-21.md`.

### Vad som ändrades

- **Mallväljaren i Skriv brev**: kapselns "Byt mall" öppnar `MallValjare` (laddas dynamiskt). Valet syns i kapseln och på arket före skrivandet och skickas som `mall_id` till `generate-preview` (servern prövar Premium som förut). Gratis som trycker på en Premiummall får raden `PAKETRADER.mallIngar` med länken "Se vad som ingår" (`/priser`) överst i väljaren; mallen väljs inte. Under skrivandet ligger mallen fast. I Brevet går "Byt mall" till Mallar som förut.
- **En typsnittslista**: `src/lib/letters/typsnitt.ts` har nu `modern` och `typsnittFontFace()`. `src/components/brev3/arbete/typsnitt.ts` är borttagen; Brevets typsnittsflik läser biblioteket och sätter namnet med CSS-stacken (första namnet är det `@font-face` deklarerar).
- **Köpreturen till Brevet**: `/dashboard/mina-brev/<id>?ladda=1&format=pdf|docx` (kassan lägger till `ladda=1`) städar adressen och laddar ner filen en gång för den som nu har tillgång. Nedladdningsspärren skickar med `?format=` för det format som öppnade den; köpknappen i låsta brevets rad går tillbaka till `?flik=texten` (en giltig köpretur, utan nedladdning).
- **CV-väljaren** flyttad till `src/components/brev3/cv/CvPickerGrid.tsx` (Skriv och Dina brev pekar dit). `scripts/rumikoner-baslinje.json` har den nya sökvägen.
- **Ingångarna**: alla länkar till `/dashboard/skapa-brev` och `/dashboard/mina-brev` i `src` gicks igenom. En ändring: CV-byggarens slutark (`src/components/cv/Dokument/Final.tsx`) skickar `?cv=<id>` när CV:t är känt (en rad). Övriga landar rätt som de är (matchningarna och Dina brev förifyller via `cover-letter-store`). Kvar med "Mina brev": en admintext om mätning, en testsida och en kodkommentar, ingen synlig text i produkten.
- **Död kod bort**: `mina-brev/components/LetterActions.tsx`, `getLetterForUser.ts`, `scopeLetterHtml.ts`, `lib/letters/kravIAnnonsen.ts` och dess test, texten `SKRIV.avbryt`. `src/components/letters/download-button.tsx` är oanvänd men var det redan på main; orörd.
- **Dina brev, dator**: första raden är de tre senaste breven plus "Skriv nytt brev"; resten fälls ut i hela rader under "Visa alla brev". Telefonen som förut (remsan med högst sju).
- **Dina brev, telefon**: "Byt" bredvid "Öppna CV:t" i radkortet (samma CV-väljare som väggens "Byt CV").
- **Mallar, telefon**: den fasta raden ligger mot bottennavet (`bottom: var(--bottom-nav-h)`, rullytans luft nollas och läggs under raden, CV-mallarnas `FastRad`-mönster). Flikarna tar sin textbredd (`flex: 1 1 auto`) så att "Läget och nästa steg" står hel.
- **BrevArk**: platsen för ett saknat krav blir en egen rad (padding under stycket) när styckets sista rad är full. Felet bakom B4 var ett annat: React 19 jämför `dangerouslySetInnerHTML` som objekt, och ett nytt objekt vid varje omritning satte om arkets innerHTML efter mätningen, så krympsteget och luften föll bort och siffrorna stod kvar från det krympta läget. Objektet memoreras nu (`inreHtml`). Arket mäter också om när innehållet byts (MutationObserver, med markeringen `data-b3-matt`), när ett typsnitt laddats, i egna koordinater, och sista raden mäts som den synliga nedersta. Tillstånden sätts bara om när värdet ändrats (ingen omritningsslinga).
- **Skriv brev**: "Avbryt" borta under väntan (foten visar bara kvotraden). Underraden visar tjänst och företag så fort de är kända (förifyllningen, sedan svaret). Skrivbrickans läge mäts i arkets egna koordinater.
- **Brevet, Titel och företag**: `KontaktuppgifterRad` (dokument `brev`) under fälten; när uppgifterna sparas ritas arket om med den nya avsändaren. Filen läser profilen på servern och följer med.
- **Laddvyer**: ny `mina-brev/mallar/loading.tsx` (samma klasser som sidan). Dina brev väljer form med eller utan brev ur skalets delade data (`HemLaddar`, sidomenyns antal). Arbetslägets laddvy ritar Brevets riktiga flikrad.
- **Perf-skriptet**: `scripts/perf-inloggat.ts` mäter `/dashboard/mina-brev/mallar` och Brevet med flödesbudgeten (2,0 s); de borttagna rutterna (`?steg=2..6`, `/edit`) är strukna ur listan.

- **Granskningens rättningar (efter slutkontrollen)**: mallväljarens tagg står under namnet (inget klipps); platsen för saknat krav pulserar med fyllnad inom sin rad (ram 2 px inuti, inget sken utanför); det saknade kravets siffra räknas med när siffrorna flyttas isär; Skriv säger "Brevet skrivs mot kraven i annonsen." under uppspelningen (`SKRIV.spelar`); Målgången på telefon har arket mindre och högre så att alla fyra punkterna syns (datorn orörd). Turbopack-bygget (`next build`) är grönt med typkontroll när `turbopack.root` och `outputFileTracingRoot` tillfälligt pekar på `C:/Users/chris/cvbrev` (länkade node_modules), inte commitat.

### Beslut

- Laddvyn för Dina brev läser formen ur skalets data i klienten i stället för att fråga databasen: laddvyn ska komma direkt.
- B9 (strecket före "Hej" i Folio och Kolumn): inte ett verkligt fel. Båda mallarna ritade i full skala och miniatyren förstorad: inget streck. Troligen nedskalningen i den förra skärmdumpen.

### Hur man backar

- Bara etapp 3: `git revert` på etapp 3:s commits (från `5fde4de8` och framåt på grenen).
- Hela brevrummet: `git revert -m 1` på sammanslagningen till main, eller återställ `src/app/dashboard/mina-brev`, `src/app/dashboard/skapa-brev`, `src/components/brev3`, `src/lib/letters`, `src/app/api/letters`, `src/app/brev3.css` (och importen i `src/app/dashboard/layout.tsx`) till läget före grenen. Migreringen är bara tillägg; kolumnerna kan ligga kvar (se "Körningar mot produktion"). Köpreturen (`src/lib/stripe/kopRetur.ts`) och exporterna i `src/lib/cv/**` backas med samma revert.

## Putsning av fem brevmallar 2026-11-21, gren `fix/brevmallar-puts`, arbetskopia `brev-a`

Art directorns fem beslut efter kontaktarken. CV-mallarna är orörda: ingen fil under `src/lib/cv/**` eller `src/components/cv/**` ändrades, och sha256 på CV:ts HTML (40 mallar, 15 med foto) och Word (26) är identiska före och efter. Brevets HTML och Word är identiska för de 36 övriga mallarna.

- **Tabellen:** `src/lib/letters/brevmall/puts.ts` (`BREV_PUTS`, fryst). `brevDef` lägger raden på sin kopia (sida, huvud, band, ruta kopieras innan de ändras), `brevMatt` läser `brod`, `brevCss` läser `block` och `css`, `brevArendeFarg` (render.ts, används också av word.ts) läser `arendeAccent`, `uppskattadHojd` läser `teckenEm`. Kontrasten ligger nu i `kontrast.ts` (render.ts exporterar den som förut).
- **Not:** sidmarginalerna 16 till 40 mm (huvudet och linjen följer med), brödtexten 11 pt i steg 0. Längsta raden 80 tecken i korta brevet (steg 0, 11 pt) och 93 i långa (steg 1, 10,5 pt), förut 119 och 123. Långt brev steg 1. Namnet får minst 45 % av huvudet så att en lång e-post bryts i kontakten. Word: samma marginaler och grad; uppskattningen räknar Calibri med 0,42 em per tecken (andra typsnitt som förut med 0,5).
- **Mörkrum:** bandet 52 (i praktiken 58) till 40,5 mm: luft 8/5 mm, luft under namn och titel 1 och 2,5 mm, namnet i samma grad (34 pt). Långt brev steg 2 till steg 1. Ärenderaden i accenten mörkad till kontrast 4,5 (förvald orange blir #906d4c).
- **Kvadrat:** rutan 56 till 32 mm (26 mm i första varvet var för litet: namnet blev mindre än titeln), namnet på två rader (delat där den längsta raden blir kortast, mellanslag före bindestreck) i 9 till 15 pt, Erik Lindberg 14 pt. Namnet är huvudets största text: blir det mindre än titelns 13 pt sänks titeln till namnets grad, bara i brevet. Rutan är kvadratisk med `aspect-ratio` och växer om ett namn inte ryms vid 9 pt (Anna-Karin Bergströmsson-Lind: 40 mm), så att namnet aldrig klipps; uppskattningen räknar med rutans storlek för namnet. Långt brev steg 1, slutar 255 av 279 mm.
- **Panorama:** ärenderaden i accenten (plommon #8C2F39, kontrast räcker), brödtexten 11 pt, bandets luft 12/10 till 10/8 mm så att långa brevet ryms i steg 1.
- **Siluett:** oförändrad. Namnet syns i miniatyren i 150 px bredd.
- **Word bland de fem:** bara Not.
- **Tester:** `src/lib/letters/brevmall/__tests__/puts.test.ts`.

### Hur man backar

- En mall: ta bort dess rad i `PUTS` i puts.ts (och id:t i testets lista).
- Allt: `git revert` på putsningens commit.
