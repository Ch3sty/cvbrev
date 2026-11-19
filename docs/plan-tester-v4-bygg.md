# Byggplan: rekryteringstesterna v4 på webben (2026-11-19)

Teknisk plan för att bygga den godkända skissen (`docs/design/smal-plan-2026-11-18/skiss.html`, utkast v4 och ägarens beslut i `brief.md` omgång 1 till 7) på `/dashboard/tester`. Fyra parallella arbetsflöden med eget filägande, ett gemensamt kontrakt som skrivs först, och en samlad kontroll före push.

Inget i appen Testklar ändras: `src/app/app/**`, `src/components/mobilapp/**` och `src/lib/mobilapp/**` är frysta. Grinden körs på varje gren:

```
git diff --name-only origin/main... | grep -E '^src/(app/app|components/mobilapp|lib/mobilapp)/' && exit 1
```

Ordet "pass" står kvar i kod, filnamn och test_type. Utåt (text i gränssnittet) används det inte i de nya vyerna.

---

## 1. Kartläggning

### 1.1 Adresserna och vad som händer med dem

Avgörande fakta: proxyn skriver om allt under `/dashboard/tester/*` från appen till `/app/tester/*` (`src/lib/mobilapp/appvag.ts`), utom tre adresser som går till appens egna vyer: `/dashboard/tester` blir `/app/katalog`, `/dashboard/tester/kurvan` blir `/app/utveckling` och `/dashboard/installningar` blir `/app/konto`. Appens undersidor är omexporter av webbens sidor. **En ny webbadress under `/dashboard/tester/` ger 404 i appen**, eftersom det saknas en omexport och appen inte får ändras. Därför bygger v4 på befintliga adresser och query-parametrar, inga nya sidor som länkas från delade flöden.

| Adress | I dag (webben) | v4 (webben) | I appen (oförändrat) |
|---|---|---|---|
| `/dashboard/tester` | Hemvyn: `page.tsx` med `byggHemvy` + `Hemvy` | **Hem** (ny vy, C) | Skrivs om till appens Tester (`/app/katalog`) |
| `/dashboard/tester/alla` | Alla tester: `TesterHubClient` med flikarna Tester och Din utveckling | **Tester** (kortrutnät och typens meny, B). `?typ=<id>` öppnar menyn. `?flik=utveckling` blir 308 till `/kurvan` | `/app/tester/alla` omexporterar webbsidan, så nya Tester ritas i appens ram. Måste fungera med app-UA |
| `/dashboard/tester/kurvan` | Helkurvan (`Helkurva`) | **Din utveckling** (graf, nivå per typ, resultat, D). `?typ=<id>` väljer typen i grafen | Skrivs om till appens Utveckling |
| `/dashboard/tester/installningar` | Ingången E1 till E3 (`Ingang`) | **Plan inför provet**, väljaren (test, datum, dagsmål, Avsluta planen). Ändras additivt (C) | Omexporteras och används från appens konto. Props och beteende för befintliga steg oförändrade |
| `/dashboard/tester/pass?typ=...` | Passflödena (matris, text, siffror, figur, deduktiv, steg 2, nivåkoll) | Kvar. Träna och Nivåkollen startar här. `typ=nivakoll&kind=talserie\|spatial\|ordforrad` tillkommer (A) | Omexporteras, används av appen |
| `/dashboard/tester/[slug]` | Klassiska nivåtesten (grund, avancerad, expert) | Kvar, är "Testa dig på en nivå". Gratisraden läser nya kvoten (A) | Omexporteras |
| `/dashboard/tester/ovningsprov/[typ]`, `/iprov`, `/kvitto/[nyckel]`, `/provdatum`, `/uppvarmning`, `/prov/*`, `/personlighet-*` | Kvar | Kvar, länkas från typens meny | Omexporteras |
| `/dashboard/tester/forhandsvisning*` | Verktyg | Tre nya förhandsvisningar med fixturer: `forhandsvisning/v4-tester`, `v4-hem`, `v4-utveckling` | Skrivs om till `/app/webben` (verktyg, inte appen) |

### 1.2 Vyer som ersätts, behålls eller tas bort

| Fil | Beslut | Varför |
|---|---|---|
| `src/app/dashboard/tester/page.tsx` | Skrivs om (C): läser `hamtaTesterV4`, ritar `HemVy` | Hem enligt skissen |
| `src/components/traning/Hemvy.tsx` | Tas bort i integrationen om grep visar noll importörer | Ersatt av `HemVy` |
| `src/lib/traning/hemvy.ts`, `hem-copy.ts` | **Behålls orörda** | Appen importerar `byggHemvy` och typerna `HemModell`, `LyftModell`, `RadModell`, `Sektion`, `Symbol` |
| `src/components/traning/HemKlient.tsx` | Behålls. `Betalvagg` används av nya sidorna | Betalväggens kontext och `GraValSheet` |
| `src/app/dashboard/tester/TesterHubClient.tsx`, `components/AllaTesterVagg`, `FlerTester`, `MittTestRad`, `NastaTestKort`, `NivakollRad`, `NivaSegment`, `ProvCard`, `TestCard`, `TestKategori`, `TesterTabs`, `SymProv`, `SymTyst`, `Fakta` | Tas bort i integrationen efter grep | Ersatta av B:s kort och meny |
| `components/testCatalog.ts`, `PersonlighetKort.tsx`, `testConfig.ts`, `getHubData.ts` | **Behålls** | `testConfig` importeras av appens `vyer.ts`; `TEST_GROUPS` av `Sidomeny`; `getTesterHubData` av `getTraningSummary` (som appen använder) |
| `src/components/traning/Helkurva.tsx`, `Kurva.tsx`, `utveckling/DinUtveckling.tsx`, `SmaMultiplar`, `VarDuStar`, `Nivavagg`, `Nivaerna` | Helkurva och DinUtveckling tas bort efter grep. `Kurva.tsx` behålls (PassFlode ritar övningsprovets kurva med den) | Ersatta av D:s graf |
| `src/components/traning/utveckling/typer.ts`, `data.server.ts` (`hamtaMotordata`), `berakna.ts`, `familjer`-delarna | **Behålls** | Appens `UtvecklingVy` och `(flikar)/utveckling/page.tsx` importerar `UtvecklingTempo` och `hamtaMotordata` |
| `src/components/rum/Sidomeny.tsx` (raderna för `tran`) | Ändras (C): Hem, Tester, Din utveckling, Plan inför provet. Raden Provläget tas bort (övningsprovet ligger i typens meny) | Skissens sidomeny |

### 1.3 Delat med appen som inte får brytas

Kontrollerat med grep i `src/app/app`, `src/components/mobilapp`, `src/lib/mobilapp`:

- Typer och funktioner: `Traningsstatus` och `hamtaTraningsstatus` (`motor.server.ts`), `getTraningSummary`, `byggHemvy` och hemvyns typer, `nivaKort` (`pass-copy.ts`), `datumText`, `kortDatum`, `provrad` (`rubrik.ts`), `dagarMellan`, `laggTill`, `dagSthlm` m.fl. (`datum.ts`), allt ur `mittTest.ts` som appen läser (`deltesterForPlan`, `mittTestNamn`, `mittTestUrPlan`, `DELTYP_NAMN`, `MITT_TEST_KORT`, `synligaVal`, `arMittTest`, `planFranVal`), `byggPlan`/`raknaPlan` (`plan.ts`), `PROVDATUM_MAX_DAGAR` (`testplan.ts`), `TRANING_RUTT`, `nivakollHref`, `ovningsprovHref`, `steg2PassHref`, `passHref`, `sessionHref`, `TEST_CONFIGS`, `testPaths`, `iprovProvSynligt`, `NIVAKOLL_TEST_TYPER`, `PassFlode`, `fetchPassApi`, `matningResultat`, `UtvecklingTempo`, `hamtaMotordata`.
- Regel: lägg till fält och unionsmedlemmar, ändra aldrig en befintlig signatur eller ett befintligt fälts betydelse. `nivakollHref` får vidgad parametertyp (bakåtkompatibelt). `Traningsstatus` får nya valfria fält.
- API:er som appen anropar (`/api/traning/*`, `/api/logicTestV4/*` m.fl.) behåller svarsformen. Nya fält får läggas till.

---

## 2. Datamodell

### 2.1 Vad som finns

| Data | Var | Täcker |
|---|---|---|
| Nivå över tid | `test_nivapunkter` (PK `user_id, test_kind, dag, typ`; `typ` i `matning, ommatning, pass, general`; `test_kind` utan villkor) | Matris: nivåkoll och träning (typ `pass`), en punkt per dag och typ. Figurserie, deduktiv, verbal, numerisk: bara nivåkoller. Talserie, spatial, ordförråd: inget |
| Nivåkoller | `logic_test_v4_sessions` med `test_type` `matrislogik-matning` och `*-nivakoll` (`NIVAKOLL_TEST_TYPE`), resultat i `meta.resultat` | Fem typer. Påbörjad = rad utan `completed_at`, antal svar i `answers` |
| Träning | `logic_test_v4_sessions`: `matrislogik-pass/-riktat`, `verbal-pass`, `numerisk-pass` (`VN_PASS_TEST_TYPER`), `figurserie-pass`, `deduktiv-pass`, `STEG2_PASS_TEST_TYPE` | Alla åtta typer, med rätt, antal, tid och tappade familjer i `meta` |
| Övningsprov | `matrislogik-general`, `verbal-general`, `numerisk-general`, `figurserie-prov`, `deduktiv-prov` (`OVNINGSPROV_TEST_TYPER`), `iprov-prov`, äldre `*-prov` (`PROV_TEST_TYPES`) | Resultat i procent och över tid, ingen nivå |
| Nivåtest (fasta) | Klassiska `test_type` i `COGNITIVE_TEST_TYPE` (`getHubData.ts`) | Procent per försök (`summarizeSessions`) |
| Mönster | Matris: `varDuTappar`, `Familjestatistik`, `dagensTema` i `Traningsstatus`; `hamtaMotordata().familjer`. Övriga: `meta.resultat.tappade` (nivåkoll), `Steg2Tappad`, VN- och figurpassens tappade familjer | Matris fullt, övriga per session |
| Tempo | Matris: `UtvecklingTempo` (`hamtaMotordata`), `meta.over_budget`. Övriga: `time_spent` per svar och typens budget | Matris fullt, övriga räknas fram |
| Plan | `test_planer` (`mitt_test`, `mitt_test_variant`, `extra_typer`, `provdatum`, `skapad_at`, `uppdaterad_at`, `pass_tid`) | Ingen startdag, inget dagsmål |
| Märken | `test_milstolpar` | `provdagen` kan stå kvar från ett tidigare datum |
| Gratiskvot | `checkDailyTestQuota`: en slutförd session **per test_type** och dygn | Fel mot beslutet (ger en per typ) |

### 2.2 Vad som räknas fram (utan migrering)

1. **Punkter per testtyp för grafen** (`byggPunkter` i `src/lib/tester/v4/punkter.ts`, ren): slår ihop `test_nivapunkter` (alla `test_kind`) med sessionsraderna till `UtvecklingsPunkt[]`. Nivåkoll = ring med nivå. Träning = punkt; nivån tas ur nivåpunkten typ `pass` samma dag och `test_kind` om den finns, annars `niva: null` (ritas då på tidslinjen under grafen, aldrig som en påhittad nivå). Övningsprov = fyrkant på tidslinjen med `resultat`, aldrig omräknat till nivå. Gratis: bara senaste punkten per typ (`historikLast`).
2. **Nivåbandets läge per typ** (`nivaLage`): `omatt`, `paborjad` (öppen nivåkoll, `svar` av 12) eller `matt` (senaste nivåpunkt, osäkerhet 0,6, tak 7,5 tills banken är kalibrerad, `nivaTak()` i `flaggor.ts`).
3. **Svagaste mönster per typ** (`svagasteMonster`): matris ur `varDuTappar.svagaste`; övriga ur de 30 senaste dagarnas `meta`-tappade familjer summerade, krav minst sex svar och under 60 procent.
4. **Tempo per typ** (`tempoAndel`): andel svar över provets tid per uppgift, ur `answers[].time_spent` mot `NIVAKOLL_BUDGET_S`, VN-budgeten och steg 2:s `SEKUNDER_PER_UPPGIFT`.
5. **Banan** (`byggBana` i `bana.ts`): planens start till provdatum, gjorda dagar ur alla slutförda sessioner, föreslagen nivåkoll sju dagar efter senaste, föreslaget övningsprov två dagar före provet.
6. **Dagsmål och dagar i rad** (`dagsmalLage`): slutförda sessioner i dag (alla slag) mot `test_planer.dagsmal`; dagar i rad med befintliga `raknaSerie`.
7. **Nivå efter träning för typerna utan den** (arbete A4): samma räkning som matrisens passnivå (`src/lib/traning/niva.ts`), bara osedda frågor räknas, dagstak 0,5. Skrivs som nivåpunkt `typ: 'pass'` med `test_kind` = typen. RPC:n `slutfor_traningssession` skriver bara nivåpunkt för sessioner med `meta.alternativ_blandade`; talserier blandas aldrig. Därför skriver A punkten med service role direkt (`skrivNivapunkt` i `nivapunkt.server.ts`, upsert på primärnyckeln, idempotent) efter att RPC:n lyckats. Ingen migrering.

### 2.3 Migrering (en, additiv)

`supabase/migrations/20261120090000_test_planer_v4.sql`

```sql
alter table public.test_planer
  add column if not exists plan_start date null,
  add column if not exists dagsmal smallint null;

alter table public.test_planer drop constraint if exists test_planer_dagsmal_check;
alter table public.test_planer
  add constraint test_planer_dagsmal_check check (dagsmal is null or dagsmal between 1 and 3);

comment on column public.test_planer.plan_start is
  'Dagen Plan inför provet startade: sätts när mitt_test eller provdatum ändras. Banan och "dag N av M" räknas härifrån, aldrig från första nivåkollen.';
comment on column public.test_planer.dagsmal is
  'Frivilligt dagsmål, 1 till 3 test om dagen. Null = inget dagsmål.';

-- Bästa gissning för befintliga planer: senaste ändringen av planen.
update public.test_planer
   set plan_start = (uppdaterad_at at time zone 'Europe/Stockholm')::date
 where plan_start is null and (provdatum is not null or mitt_test is not null);

-- Rollback:
--   alter table public.test_planer drop constraint test_planer_dagsmal_check;
--   alter table public.test_planer drop column dagsmal;
--   alter table public.test_planer drop column plan_start;
```

Varför migrering och inte härledning: `skapad_at` sätts vid registreringen (samma dag som första nivåkollen, alltså samma fel) och `uppdaterad_at` flyttas av varje ändring, även dagsmål och påminnelsetid. Dagsmålet har ingen plats alls i dag. Körs på Supabase-branch först, sedan prod (stående ja finns). `lasLage` läser `select('*')`, så kolumnerna följer med utan ändrad fråga. Koden faller tillbaka på `dagSthlm(uppdaterad_at)` om kolumnen saknas, så ordningen deploy och migrering spelar ingen roll.

Inga andra migreringar. `test_nivapunkter.test_kind` saknar villkor och `typ: 'pass'` är tillåtet för alla typer.

---

## 3. Fyra arbetsflöden

### 3.0 Kontraktet (A skriver först, dag 0, cirka tre timmar)

`src/lib/tester/v4/typer.ts` (ren, inga importer från server), `src/lib/tester/v4/fixturer.ts` och `src/lib/tester/v4/copy.ts`. När de tre är incheckade fryses typerna; ändringar efter det går genom A och meddelas B, C och D.

```ts
// src/lib/tester/v4/typer.ts
import type { Dag } from '@/lib/traning/datum'
import type { Deltyp, MittTest } from '@/lib/traning/mittTest'

/** Testtyperna med nivå. Personlighet står utanför (ingen nivå). */
export type TestTypId = Exclude<Deltyp, 'personlighet'>
export const TEST_TYP_ORDNING: readonly TestTypId[] =
  ['matris', 'figurserie', 'deduktiv', 'verbal', 'numerisk', 'talserie', 'spatial', 'ordforrad']

export type Zon = 'grund' | 'avancerad' | 'expert'

export interface NivaLage {
  status: 'omatt' | 'paborjad' | 'matt'
  /** 1 till 10, en decimal. Null om inte mätt. */
  niva: number | null
  /** Standardfelet som ljusare band, 0,6. */
  osakerhet: number
  /** Påbörjad nivåkoll: svar hittills och antal uppgifter. */
  svar?: { besvarade: number; antal: number }
  /** Taket tills banken är kalibrerad över det, 7,5. */
  tak: number
}

/** Nivåbandets props, samma komponent i tre storlekar (B bygger, C och D använder). */
export interface NivabandProps {
  namn: string
  lage: NivaLage
  storlek: 'liten' | 'mellan' | 'stor'
  /** Koppar för provets delar och för alla utan plan, grått för övriga när en plan finns. */
  ton: 'koppar' | 'neutral'
}

export type LasSkal = 'premium' | 'kvot' | 'nivakoll_gjord'
export interface Handling {
  slag: 'trana' | 'nivakoll' | 'niva_test' | 'ovningsprov' | 'personlighet'
  etikett: string            // "Träna", "Mät din nivå", "Gör ett övningsprov"
  href: string               // alltid en befintlig adress (rutter.ts)
  zon?: Zon                  // för niva_test
  las: null | { skal: LasSkal; chip: string }   // "Ingår i Premium", "I morgon", "Igen med Premium"
  meta?: string              // "1 kvar i dag", "Gratis en gång"
}

export interface TesttypKort {
  id: TestTypId
  namn: string               // DELTYP_NAMN
  kallas: string             // "Kallas även Matrigma eller logiktest"
  ingarIPlan: boolean
  niva: NivaLage
  senasteNivakoll: Dag | null
  antalTraningar: number
  primar: Handling           // Träna, eller Mät din nivå om omätt, eller Grundnivå för gratis
  synlig: boolean            // steg2Synlig/ordforradRedo
}

export interface TypMeny {
  typ: TestTypId
  rad: string                // med plan: provets format, annars "kallas även"
  trana: Handling & { rubrik: string; text: string }
  nivaer: (Handling & { zon: Zon; rubrik: string; text: string })[]
  nivakoll: Handling & { senaste: { dag: Dag; niva: number } | null }
  ovningsprov: (Handling & { rubrik: string; text: string })[]   // tom lista där inget prov finns
  senaste: { nivakoller: UtvecklingsPunkt[]; prov: UtvecklingsPunkt[] }  // tre resp. två
  monster: { namn: string; ratt: number; antal: number; href: string }[] | null // "Öva på mönstret"
}

export type PunktSlag = 'nivakoll' | 'trana' | 'ovningsprov'
export interface UtvecklingsPunkt {
  id: string                 // sessionens id
  typ: TestTypId
  dag: Dag
  slag: PunktSlag
  niva: number | null        // null: ritas på tidslinjen, aldrig på nivåaxeln
  raknas: boolean            // false: "övning, räknas inte" (andra nivåkollen samma dag)
  resultat: { ratt: number; antal: number } | null
  overTid: number | null
  provNamn?: string          // "Övningsprov Alva", "I-provet, talserier"
  href: string | null        // genomgången
}

export type HintTyp =
  | 'forsta_steg' | 'nivakoll_saknas' | 'nivakoll_paborjad' | 'svagt_monster'
  | 'tempo' | 'nivakoll_igen' | 'provet_nara' | 'prova_nytt'
export interface Hint {
  id: string                 // stabil nyckel för händelser och "stäng"
  typ: HintTyp
  eyebrow: string
  rubrik: string
  skal: string
  tips: string
  testtyp: TestTypId | null
  knapp: Handling            // öppnar typens meny eller startar direkt
  stangbar: boolean          // bara forsta_steg
}

export interface PlanV4 {
  mittTest: MittTest
  namn: string               // mittTestNamn: "Alva Logic", "I-provet"
  typer: TestTypId[]         // deltesterForPlan utan personlighet
  provdatum: Dag | null
  dagarKvar: number | null
  planStart: Dag
  dagsmal: 1 | 2 | 3 | null
  format: string | null      // "Provet har 20 uppgifter med två minuter var."
  ovningsprov: { namn: string; meta: string; href: string; foreslagenDag: Dag | null } | null
  franArtikel: boolean       // skapad ur provkällan utan datum
}

export interface BanaDag {
  dag: Dag
  status: 'gjord' | 'idag' | 'kommande' | 'prov'
  forslag?: 'nivakoll' | 'ovningsprov'
}

export interface Gratislage {
  premium: boolean
  harHistorik: boolean
  grundKvarIdag: number      // 0 eller 1
  pafyllning: string         // ISO, nästa midnatt svensk tid
  nivakollGjord: Partial<Record<TestTypId, boolean>>
  pris: { namn: string; prisrad: string; knapp: string }  // ur paketet och kampanjen
}

export interface DagsmalLage { mal: number | null; gjortIdag: number; dagarIRad: number }

export interface Fortsatt { punkt: UtvecklingsPunkt; rubrik: string }

export interface TesterV4Data {
  idag: Dag
  plan: PlanV4 | null
  bana: BanaDag[]            // tom utan plan
  typer: TesttypKort[]       // planens först, sedan TEST_TYP_ORDNING
  menyer: Record<TestTypId, TypMeny>
  hintar: Hint[]             // prioritetsordning, högst fem
  gratis: Gratislage
  dagsmal: DagsmalLage
  fortsatt: Fortsatt | null
  personlighet: { gjord: boolean; href: string }
  paket: { scope: string | null; track: string | null; planKey: string | null } // för Betalvagg
}

export interface UtvecklingV4Data {
  idag: Dag
  plan: PlanV4 | null
  typer: { id: TestTypId; namn: string; ingarIPlan: boolean; niva: NivaLage }[]
  punkter: UtvecklingsPunkt[]          // alla typer, tidsordning
  historikLast: boolean
  provdag: Dag | null
  matrisMonster: { namn: string; family: string; lage: 'omott' | 'mott' | 'saker' | 'snabb'; ratt?: number; antal?: number; href: string }[] | null
  gratis: Gratislage
  paket: TesterV4Data['paket']
}
```

`fixturer.ts` exporterar `fixturTester(lage: 'a' | 'b' | 'c', niva: 'premium' | 'gratis', opt?: { artikel?: boolean; kvotAnvand?: boolean })` och `fixturUtveckling(...)` med exakt skissens data (`TYPER`, `PLAN`, `FAMILJER` i skiss.html), så att B, C och D bygger mot samma tal som ägaren godkänt.

`copy.ts` innehåller de delade fraserna ordagrant ur skissen: zonnamnen, "Ingår i ${namn}", "Ingår i ${namn} · ${n} del/delar", "Används i andra rekryteringstest, inte i ${namn}", Träna-kortets rubrik och text, Testa dig-kortets tre nivårader, Mät dig-raderna, låschippen, gratisraden, hintarnas rubriker, skäl och tips. Copy granskas mot reglerna: inga talstreck, svenska facktermer, inget "pass", data som bild.

### 3.1 A: Server och regler

**Äger** (ingen annan rör de här filerna):

- Nytt: `src/lib/tester/v4/typer.ts`, `fixturer.ts`, `copy.ts`, `rutter.ts`, `punkter.ts`, `niva-lage.ts`, `monster.ts`, `bana.ts`, `dagsmal.ts`, `hintar.ts`, `gratis.ts`, `karens.ts`, `hamta.server.ts`, `nivapunkt.server.ts`, `src/lib/tester/v4/__tests__/*`
- `src/lib/quota/quotaService.ts`, `src/lib/prov/allowance.ts`
- `src/lib/traning/gratisniva.ts`, `tillgang.ts`, `milstolpar.ts`, `motor.server.ts`, `testplan.ts`, `flaggor.ts`, `passgenerator.ts`, `mittTestFranKalla.server.ts`, `rutter.ts`
- `src/lib/nivakoll/**` (motor, niva, typer, las, copy)
- `src/lib/tester/pass.server.ts`, `pass-figur.server.ts`, `pass-figur.ts`, `pass-deduktiv.server.ts`, `pass-typer.ts`, `pass-urval.ts`, `sedda.server.ts`, `src/lib/tester/steg2/pass.server.ts`, `steg2/motor.server.ts`
- `src/app/api/traning/plan/route.ts`, `src/app/api/traning/nivakoll/**`
- `src/app/dashboard/tester/pass/page.tsx` (nya nivåkoll-typerna), `src/app/dashboard/tester/[slug]/getRunData.ts` (gratisraden)
- `src/components/traning/nivakoll/**` (nivåkollens flöde för talserie, spatial, ordförråd)
- `src/lib/analytics/events.ts` (alla nya händelser, en gång)
- `supabase/migrations/20261120090000_test_planer_v4.sql`

**Uppgifter i ordning:**

**A1. Kontraktet** (3.0 ovan). Klart när B, C och D kan rendera sina förhandsvisningar ur fixturerna.

**A2. Gratisregeln och kvoten.**
- `quotaService.ts`: ny export `GRUND_TEST_TYPER` (`matrislogik`, `figurserier-grund`, `deduktiv-grund`, `talserier-grund`, `spatial-grund`, `ordforrad-grund`, `verbal-resonemang`, `numerical-reasoning`) och `checkGrundnivaQuota(supabase, userId)` som räknar slutförda sessioner i hela listan sedan `startOfTodayStockholm()`. `checkDailyTestQuota(supabase, userId, testType)` behåller signaturen: är `testType` en grundtyp räknas hela listan, annars som i dag. Alla elva rutter som anropar den får regeln utan att ändras.
- `gratisniva.ts`: ny nyckel `grundnivaTestPerDag: 1` och `tranaGratis: false`. `grundpassVarjeDag: false` och dag 0-grundpasset står kvar: appens onboarding lovar "dagens grundpass, gratis i dag" (`Nivaogonblick.tsx`) och den texten får inte bli ett brutet löfte. Grundpasset dag 0 räknas in i samma dagskvot (`tillgang.ts` får `grundIdag` som indata). Webben erbjuder aldrig Träna gratis; låset sitter i vyn.
- Nivåkollen en gång per testtyp: redan sant (`beslutaTillgang` med `matningarSlutforda` per typ). Inget ändras, men vitest låser det för alla åtta typer.
- Övningsprov (`test_exam_mode`), historik (`test_history`), avancerad och expert (`tests_above_base`), övriga träningar (`test_daily_pass`): redan Premium. Låses med vitest.
- `gratis.ts` (ren) + del av `hamta.server.ts`: `Gratislage` med pris ur `kampanjForVisning(userId, kampanjNu())`, `premiumPrisrad`, `premiumKnapp` och `paketNamn`, så att Black Week syns utan kodändring i vyerna.
- `getRunData.ts`: gratisraden på nivåtestets startsida säger "1 kvar i dag" eller "I morgon" ur `checkGrundnivaQuota`.

**A3. De två felen.**
- *Dag 38 av 45:* `motor.server.ts` får `planStart: Dag | null` i `Traningsstatus` (nytt valfritt fält) ur `plan_start`, med fallback `dagSthlm(uppdaterad_at)`. `start` (första mätningen) behåller sin betydelse: `hemvy.ts` räknar gratisnivån på `s.start.dag` (rad 963 och 964) och appen ritar kurvan från den. Alla nya webbvyer räknar banan och "dag N av M" från `planStart`. `PUT /api/traning/plan` sätter `plan_start = idag` när `mitt_test` eller `provdatum` ändras och tar emot `dagsmal` (validering i `validerPlan`). `mittTestFranKalla.server.ts` sätter `plan_start` när planen skapas från en artikel.
- *Märket Provdagen:* `milstolpar.ts` får `giltigaMilstolpar(milstolpar, provdatum, idag)` som bara släpper igenom `provdagen` när ett provdatum finns och `idag > provdatum`. `hamtaTraningsstatus` filtrerar `milstolpar` och `ovisade` genom den. Det rättar också appens Märken, eftersom appen läser `s.milstolpar`. Före ändringen: läs det rapporterade kontots rader i `test_milstolpar` och `test_planer` (bara select) och skriv orsaken i commit-meddelandet.
- *Kvarstår i appen:* texten "dag N av M" i `src/components/mobilapp/UtvecklingVy.tsx` räknar från `s.start` i fryst kod. Att ändra `start` skulle flytta appens gratisregel och kurva, så det görs inte. Rättas i appen med en rad (`s.planStart ?? start.dag`) när appen får ändras nästa gång. Står i rapporten till ägaren.

**A4. Nivå över tid för alla typer.**
- `punkter.ts`, `niva-lage.ts`, `monster.ts`: de rena funktionerna i 2.2.
- `hamta.server.ts`: `hamtaTesterV4(userId): Promise<TesterV4Data>` och `hamtaUtvecklingV4(userId): Promise<UtvecklingV4Data>`. En parallell omgång: `hamtaTraningsstatus` (matrisen, plan, märken, mönster), `test_nivapunkter` för alla `test_kind`, `logic_test_v4_sessions` för övriga typers träning, nivåkoll och prov (kolumnerna `id, test_type, meta, score, created_at, completed_at`, `answers` bara för de 30 senaste dagarna), `getUserScope`, `kampanjForVisning`. Varje del faller för sig till tomt läge, aldrig en trasig sida.
- Nivå efter träning för figurserie, deduktiv, verbal, numerisk, talserie, spatial, ordförråd: `nivaEfterTraning` i `src/lib/tester/v4/niva-lage.ts` (ren, samma räkning som matrisens passnivå, dagstak 0,5, bara osedda), anropas från `slutfor*` i `pass.server.ts`, `pass-figur.server.ts`, `pass-deduktiv.server.ts`, `steg2/pass.server.ts`, och skrivs med `skrivNivapunkt`. Svaret till klienten får fältet `niva_efter` tillagt; inga befintliga fält ändras.

**A5. Hintmotorn för Hem.** `hintar.ts`: `byggHintar(in: HintIn): Hint[]`, ren, prioritetsordningen ur utkastet:

| # | Villkor | Typ |
|---|---|---|
| 0 | Ingen data alls och plan från artikel | `forsta_steg` (stängbar) |
| 1 | Planens typ omätt, eller nivåkoll påbörjad | `nivakoll_saknas`, `nivakoll_paborjad` |
| 2 | Mönster med minst sex svar under 60 procent | `svagt_monster` |
| 3 | Över 30 procent av svaren över provets tid | `tempo` |
| 4 | Sju dagar eller mer sedan nivåkollen | `nivakoll_igen` |
| 5 | Högst sju dagar till provet | `provet_nara` |
| 6 | Utan plan: omätta typer, högst två | `prova_nytt` |
| 7 | Inget pekar | `prova_nytt` (en ny typ) |

Med plan räknas bara planens typer i 1 till 4. Hintar vars knapp kräver Premium får `knapp.las` med "Ingår i Premium". Texterna ur `copy.ts`.

**A6. Karens och räknereglerna.** `karens.ts` (ren): `karensVisningar(bankIFonstret: number, golv: number)` (hälften av banken i nivåfönstret, golvet sätts efter bankräkningen, startvärde 20) och `raknasMotNivan({ sedd, tidigareFel, dagarSedan })` (osedd räknas; upprepning räknas bara om den tidigare var fel och minst 14 dagar sedan). Kopplas in bakom flaggan `KARENS_V4` i `flaggor.ts` där karensen sitter i dag: `ATERANVAND_EFTER_DAGAR` (`passgenerator.ts`, `motor.server.ts` rad 993), `VN_KARENS_DAGAR`, `FIGUR_KARENS_DAGAR`, deduktivens och steg 2:s 30 dagar, nivåkollens `upprepade`. Högst en nivåkoll per dag och typ räknas (redan sant). Händelsen `bank_slut_visad` skickas när de osedda tar slut. Flaggan står av tills vitest och integrationstestet med pglite (`integration.pglite.test.ts`) är gröna, slås på i en egen commit.

**A7. Nivåkoll för talserie, spatial och ordförråd.** `NivakollKind` vidgas med de tre, `NIVAKOLL_TEST_TYPE` får `talserie-nivakoll`, `spatial-nivakoll`, `ordforrad-nivakoll`, `valjNivakoll`, `uppgiftFor`, `bedom`, `pFor`/`pNiva`/`pGrund` får grenar via `steg2Motor(kind)`. `nivakollHref` får vidgad typ. `pass/page.tsx` och `/api/traning/nivakoll/*` tar de nya typerna. `NivakollUppgift.tsx` ritar steg 2:s uppgifter med samma komponenter som `Steg2PassFlode`. Ordförrådet följer `ordforradRedo()`: är banken inte redo visar kortet nivåbandet som omätt utan knapp. Det här är A:s största del och får landa efter integrationen av vyerna; vyerna klarar sig utan (omätt band, hinten pekar på nivåtestet).

**A8. Händelser** i `events.ts` (typade, en commit): `hint_visad`, `hint_klickad` (`hint_typ`), `plan_skapad` (`kalla`), `provdatum_satt`, `dagsmal_satt`, `trana_klart`, `nivakoll_gjord`, `kvot_slut_visad`, `bank_slut_visad`, och `lage`/`surface` på befintliga `paywall_shown`/`paywall_cta_clicked`. Alla med `plan_test`, `i_planens_test`, `plattform`.

**Vitest för A:** `src/lib/tester/v4/__tests__/{punkter,niva-lage,monster,bana,dagsmal,hintar,gratis,karens,rutter}.test.ts`; `src/lib/traning/__tests__/milstolpar-form.test.ts` (Provdagen före, på och efter datumet, och efter byte av datum); `tillgang-plan-api.test.ts` (dagsmal, plan_start); ny `src/lib/quota/__tests__/grundkvot.test.ts` (en grundnivå om dagen över alla typer, dag 0-grundpasset räknas in, Premium obegränsat, avancerad når aldrig kvoten); `src/lib/nivakoll/__tests__/nivakoll.test.ts` utökad med de tre typerna; `integration.pglite.test.ts` med en nivåpunkt `typ: 'pass'` för deduktiv.

### 3.2 B: Tester

**Äger:**

- `src/app/dashboard/tester/alla/page.tsx`, `alla/loading.tsx`
- `src/components/tester-v4/Nivaband.tsx` och `src/components/tester-v4/__tests__/Nivaband.test.tsx`
- `src/components/tester-v4/tester/`: `TesterVy.tsx` (klient, äger öppen meny och `?typ=`), `TesttypKort.tsx`, `ProvGrupp.tsx` (den tonade gruppen "Ingår i ... · n delar"), `OvrigaRubrik.tsx`, `OvningsprovKort.tsx`, `PersonlighetKort.tsx`, `TypMenyPanel.tsx` (panel till höger på dator, ark under 900 px), `TranaKort.tsx`, `TestaDigKort.tsx`, `MatDigRader.tsx`, `SenasteResultat.tsx`, `copy.ts`, `__tests__/*`
- `src/app/dashboard/tester/forhandsvisning/v4-tester/page.tsx`
- Copy-svepet för ordet pass i flödenas text: `src/lib/traning/pass-copy.ts` (utom `nivaKort`, vars signatur och utdata appen använder), `src/lib/tester/pass-copy.ts`, `src/lib/tester/steg2/copy.ts`, `src/lib/ovningsprov/copy.ts`. Före ändring: grep efter strängen i `src/lib/mobilapp/__tests__` och `src/components/mobilapp`.

**Uppgifter:**

1. **Nivåbandet först** (inom första arbetsdagen, eftersom C och D använder det): SVG enligt `nivaband()` i skissen, tre storlekar, tre zoner, fyllning, knopp med talet, osäkerhetsband ±0,6, taket 7,5 i stor storlek, streckad omätt skala med "Nivåkoll, 8 min", påbörjad "8 av 12 svar". Serverkomponent utan klientkod. `aria-label` med nivån i ord. Färger ur designsystemets tokens (koppar, `--ink-3`), mörkt läge.
2. **Rutnätet**: väggen ("Alla tester", planraden med Ändra), sedan Nästa steg-kortet (C:s `NastaSteg`, monteras i integrationen; till dess en plats `nastaSteg?: ReactNode`), sedan med plan den tonade gruppen med planens kort och övningsprovets kort, rubriken "Används i andra rekryteringstest, inte i ...", övriga kort i samma stil och personlighet sist. Utan plan: "Alla testtyper". Två kort per rad från 640 px, tre från 1100 px, ett på mobil. Primärknapp direkt på kortet ur `kort.primar`.
3. **Typens meny**: ikon, namn, `rad`, nivåbandet (mellan), Träna-kortet i koppar, hårlinjen "eller", Testa dig-kortet i indigo med tre nivåer, Mät dig (nivåkoll och övningsprov), senaste resultat med länken "Hela historiken i Din utveckling" (`/dashboard/tester/kurvan?typ=<id>`). Lås och chip ur `Handling.las`. Panelen öppnas utan nätverksanrop (menyerna ligger i sidans data), stängs med Esc, fokus fångas i arket, `history.replaceState` för `?typ=`.
4. **alla/page.tsx**: läser `hamtaTesterV4`, `?flik=utveckling` ger `permanentRedirect('/dashboard/tester/kurvan')`, omsluts av `Betalvagg`. Måste fungera i appens ram (`/app/tester/alla`): inga beroenden till webbens sidomeny i sidan själv.
5. **Copy-svepet** (efter 1 till 4).

**Vitest för B:** `Nivaband.test.tsx` (omätt, påbörjad, mätt 5,3, tak, ton), `tester/__tests__/TesterVy.test.tsx` med fixturerna a/b/c × premium/gratis (gruppens rubrik, etiketten "Ingår i Alva Logic", låsen, "1 kvar i dag" och "I morgon", inga "pass" i renderad text), `TypMenyPanel.test.tsx` (Esc, fokus, alla tre val).

### 3.3 C: Hem

**Äger:**

- `src/app/dashboard/tester/page.tsx`, `src/app/dashboard/tester/loading.tsx`
- `src/components/tester-v4/hem/`: `HemVy.tsx`, `PlanHuvud.tsx` (väggen med nedräkning, eller datum och "Hem"), `Bana.tsx`, `NastaSteg.tsx` (exporteras för B), `FlerSteg.tsx`, `Dagsmal.tsx`, `GratisRad.tsx`, `SaLiggerDuTill.tsx`, `FortsattDarDuSlutade.tsx`, `PlanKort.tsx` ("Vet du vilket test du ska göra?", hopfällbart), `HintSparning.tsx` (klient: `hint_visad` en gång per hint och dag, `hint_klickad`, stängt första steg i `localStorage` inom try/catch), `copy.ts`, `__tests__/*`
- `src/components/traning/Ingang.tsx`, `src/app/dashboard/tester/installningar/page.tsx`, `installningar/loading.tsx`: väljaren Plan inför provet får dagsmålet ("Ett test om dagen", "Två om dagen", "Inget dagsmål") och "Avsluta planen" med bekräftelse (DELETE `/api/traning/plan`). Additivt: befintliga steg, props (`idag`, `plan`, `startSteg`, `forsta`) och `?steg=` fungerar som i dag i appen.
- `src/components/rum/Sidomeny.tsx` (bara `tran`-raderna), `src/lib/rum/copy.ts` (UNDERSIDA för Hem, Tester, Din utveckling, Plan inför provet), `src/lib/rum/__tests__/rum.test.ts`
- `src/app/dashboard/tester/forhandsvisning/v4-hem/page.tsx`

**Uppgifter:**

1. `HemVy` enligt skissens webbvy: väggen bär huvudet och banan; det lyfta kortet bär Nästa steg (första hinten med eyebrow, rubrik, skäl, knapp, tips); golvet i två spalter med Fler steg (hint 2 till 4 som rader), Dagsmål ("Dagsmål 1 av 2 · 4 dagar i rad", Ändra), Gratisraden när dagens test är gjort, Så ligger du till (nivåbandet liten per typ: planens typer med plan, mätta typer utan), Fortsätt där du slutade, och utan plan plankortet.
2. Hintens knapp öppnar typens meny: `/dashboard/tester/alla?typ=<id>` (befintlig adress, fungerar i appen). Knappar som startar direkt (Mät din nivå när typen är omätt) går till `knapp.href`.
3. Artikelingången: plan med `franArtikel` och utan datum visar "Lägg till provdatum" som länk till `installningar?steg=3`, banan med öppet slut och första steget som stängbar hint.
4. `page.tsx`: behåll redirecten till `installningar?forsta=1` för den som valde tester vid registreringen och saknar plan. `after()` för `markeraTraningSedd` behålls. Läser `hamtaTesterV4`.
5. Sidomenyn: Hem (`/dashboard/tester`, exact), Tester (`/dashboard/tester/alla`, chip med antal typer), Din utveckling (`/dashboard/tester/kurvan`), Plan inför provet (`/dashboard/tester/installningar`).

**Vitest för C:** `hem/__tests__/HemVy.test.tsx` med fixturerna (utan plan, Alva, I-provet, artikel, gratis med kvoten använd), `Bana.test.tsx` (gjorda, i dag, förslag, prov, öppet slut), `HintSparning.test.tsx` (en `hint_visad` per hint och dag), `Ingang`-testet för dagsmål och avslut; `rum.test.ts` för sidomenyn.

### 3.4 D: Din utveckling

**Äger:**

- `src/app/dashboard/tester/kurvan/page.tsx`, `kurvan/loading.tsx`
- `src/components/tester-v4/utveckling/`: `UtvecklingVy.tsx` (klient: vald typ, period, vald punkt; `?typ=` vid start), `Graf.tsx` (ren SVG, ingen recharts, serverritad första bild), `GrafChips.tsx` (Alla eller en typ, planens framhävda; 4 veckor, Planen, Allt), `Tidslinje.tsx` (övningsprov och träning utan nivå), `PunktDetalj.tsx` (datum, slag, typ, resultat, uppgifter, tempo, knappen Öppna), `NivaPerTyp.tsx` (nivåbandet per typ, raden väljer typen), `Resultat.tsx` (alla typer: nivåkoller och prov; en typ: även träningarna), `Monsterrutor.tsx` (matrisens familjer i fyra tillstånd, tryck startar Träna på mönstret), `geometri.ts` (ren: skalor, linjer per typ, perioder), `copy.ts`, `__tests__/*`
- `src/app/dashboard/tester/forhandsvisning/v4-utveckling/page.tsx`

**Uppgifter:**

1. `geometri.ts`: tidsaxel från periodens start (Planen = `plan.planStart`), nivåaxel 1 till 10 med zonerna, en linje per typ med nivå, planens typer i koppar och övriga nedtonade grå när en plan finns, ring för nivåkoll, punkt för träning, fyrkant för övningsprov på tidslinjen, provdagen som lodrätt streck. Punkter med `raknas: false` ritas inte på linjen.
2. Interaktion: tryck och tangentbord (piltangenter mellan punkter, Enter öppnar detaljen, fokusring synlig), 44 px träffytor runt punkterna (osynliga cirklar), `aria-live` för detaljen. Inga hovereffekter som enda väg till data.
3. Gratis: `historikLast` ger bara senaste punkten per typ och chippet "Hela historiken ingår i Premium" som öppnar betalväggen (`Betalvagg`, `paywall_shown` med `surface: 'utveckling'`).
4. Tomt läge: "Gör Nivåkollen i en testtyp, så får grafen sin första linje." med knappen till typens meny.
5. `kurvan/page.tsx` läser `hamtaUtvecklingV4`, omsluts av `Betalvagg`. I appen nås adressen aldrig (skrivs om till appens Utveckling).

**Vitest för D:** `geometri.test.ts` (perioder, planens start, nedtoning, punkter utan nivå på tidslinjen, `raknas: false`), `UtvecklingVy.test.tsx` (chips, rad väljer typ, resultat följer valet, gratislås), `Graf.test.tsx` (tangentbordet).

### 3.5 Filer som ingen äger under bygget

`src/lib/traning/hemvy.ts`, `hem-copy.ts`, `getTraningSummary.ts`, `src/app/dashboard/tester/getHubData.ts`, `testConfig.ts`, `components/testCatalog.ts`, `src/components/traning/utveckling/{typer,data.server,berakna}.ts`, `src/components/traning/PassFlode.tsx` och resultatvyerna. De läses men ändras inte. Behövs en ändring där tar A den, efter grep i appens tre mappar.

---

## 4. Ordning, beroenden och integration

### 4.1 Ordning

| Steg | Vem | Vad | Beror på |
|---|---|---|---|
| 0 | A | A1 kontraktet, fixturerna, copy. Migreringen på Supabase-branch | Inget |
| 1 | A + B | A2 gratis och kvot, A3 felen, A4 hämtning och punkter. B: nivåbandet, sedan rutnät och meny mot fixturer | Steg 0 |
| 2 | C + D | C: Hem mot fixturer. D: Din utveckling mot fixturer. A: A5 hintmotorn och A8 händelser | Steg 0, nivåbandet från B |
| 3 | Integration (A leder) | Sidorna byter fixturer mot `hamtaTesterV4`/`hamtaUtvecklingV4`, B monterar C:s `NastaSteg`, borttagning av ersatta filer efter grep, perf-rutterna i `scripts/perf-inloggat.ts` | Steg 1 och 2 |
| 4 | A | A6 karensen bakom flaggan, A7 nivåkoll för tre typer | Steg 3 (vyerna klarar sig utan) |
| 5 | En agent | Samlad kontroll och klicktest (avsnitt 5), migrering i prod, push | Allt |

Högst två tunga agenter samtidigt (minnesregeln), därför paren i steg 1 och 2. Alla arbetar på grenen `feat/tester-v4` i en återanvänd arbetskopia (`.claude/worktrees/publikt-v2` byter gren), ingen `npm ci` per kopia. Varje agent committar bara sina egna filer; filägandet gör att sammanslagningen inte får konflikter.

### 4.2 Integrationen

1. Kör grinden mot appens mappar (överst i planen). Tom utdata krävs.
2. `alla/page.tsx`, `page.tsx`, `kurvan/page.tsx` byter `fixturTester(...)` mot `await hamtaTesterV4(user.id)` respektive `hamtaUtvecklingV4`. Typerna är desamma, så inget i vyerna ändras.
3. B importerar `NastaSteg` från `@/components/tester-v4/hem/NastaSteg` i `TesterVy`.
4. Grep efter importörer av varje fil i 1.2 som ska bort; ta bort bara de med noll träffar utanför sig själva och sina tester. Kör `npx tsc --noEmit` efter varje borttagning.
5. Lägg till i `scripts/perf-inloggat.ts`: `/dashboard/tester` (kritisk, 1,0 s), `/dashboard/tester/alla` (lista, 1,5 s), `/dashboard/tester/alla?typ=matris` (lista), `/dashboard/tester/kurvan` (lista, 1,5 s), `/dashboard/tester/installningar` (flöde, 2,0 s).
6. Migreringen körs i prod först efter att koden med fallback är deployad eller samtidigt; ordningen spelar ingen roll tack vare fallbacken.

---

## 5. Testplan

### 5.1 Per del, under bygget

Bara snabba kontroller per agent (minnesregeln "testa en gång före push"): `npx tsc --noEmit`, vitest för egna filer (listorna i 3.1 till 3.4), en skärmdump på 360 och 1280 av den egna förhandsvisningen. Ingen full build, ingen perf, ingen klickmatris per agent.

### 5.2 Samlad kontroll före push (en gång)

1. `npm run build`, hela `npx vitest run`, särskilt `src/lib/mobilapp/__tests__` och `src/lib/traning/__tests__` oförändrat gröna.
2. Grep-listan i `docs/designsystem.md` avsnitt 10, plus: inga talstreck (U+2014) i nya filer, inget `Sparkles`, inget synligt "pass" i de nya vyerna (`grep -rn "[Pp]ass\b" src/components/tester-v4 --include=*.ts*` på strängar).
3. **Perf** mot budgeten med `npx tsx scripts/perf-inloggat.ts --filter tester` (Pixel 7, 3x CPU, LTE, median av tre): Hem under 1,0 s, Tester och Din utveckling under 1,5 s, Plan inför provet under 2,0 s, CLS 0. Mätt med ett konto med mycket data.
4. **Klicktest i riktig Chrome**: nytt skript `scripts/klicktest-tester-v4.ts` (mall: `scripts/qa-tester-steg2-vyer-2026-11-09.mjs` och `scripts/qa-*-konton.mjs` för konton), `puppeteer-core` med `C:/Program Files/Google/Chrome/Application/chrome.exe`, Pixel 7 (412 × 915, dpr 2,625, touch) och desktop (1280 × 800, stickprov 1440). Skärmdump per steg till `docs/qa/tester-v4/bilder/` (gitignorerad), resultat som `docs/qa/tester-v4/resultat.json` och `.md`. Per steg kontrolleras: primär handling inom viewport utan scroll, topprad och navigation synliga, inga konsolfel, inga 4xx/5xx, en hård omladdning per vy, mörkt läge som stickprov.

   Konton (egna, skapade av skriptet, raderas med id efteråt enligt regeln om testdata):
   - **Ny gratis** utan plan: Hem (första steget), Tester, öppna menyn för figurer och mönster, låsen på Träna, Avancerad, Expert, starta Grundnivå, slutför, tillbaka: kortet säger "I morgon" i alla typer, gratisraden står på Hem, Nivåkollen "Gratis en gång", gör den, låset "Igen med Premium", Din utveckling med en punkt och Premium-chippet, betalväggen öppnas och visar priset ur kampanjen.
   - **Artikelingång** som ny: provkällan Alva Logic, registrering, landning på Hem med "Plan inför provet · Alva Logic", "Lägg till provdatum", första steget som går att stänga, Tester med gruppen "Ingår i Alva Logic · 1 del".
   - **Premium** (via `premium_grants`) med plan I-provet och data: Hem med hintar (nivåkoll saknas, påbörjad, svagt mönster), banan och dagsmålet, ändra dagsmål, Tester med tre delar i gruppen, Träna i talserier, resultat, Din utveckling: byt typ via chip och via rad, period Planen, välj punkt med tangentbordet, Öppna.
   - **Konto med mycket data** (matris sedan oktober, provdatum 25 november): kontrollera att banan börjar på planens start och att märket Provdagen inte är nått före datumet.
   - **Black Week**: `KAMPANJ_NU=2026-11-24T10:00:00+01:00` lokalt, gratiskontot: betalväggar och gratisrad visar kampanjpriset; `KAMPANJ_NU=2026-12-02T10:00:00+01:00`: ordinarie pris.
   - Felvägar: simulerat nätverksfel på `PUT /api/traning/plan` (inget "sparat" på fel), Esc och tillbaka-knappen stänger menyn.

5. **App-regression** med user agent `JobbcoachApp/1.0.0 (android)` på Pixel 7, inloggat gratiskonto och Premiumkonto. Varje adress ska ge 200 och appens ram, inga konsolfel, ingen Stripe-länk:
   - `/dashboard` (Idag), `/dashboard/tester` (blir `/app/katalog`), `/dashboard/tester/kurvan` (blir `/app/utveckling`, märket Provdagen rättat), `/dashboard/installningar` (konto)
   - `/dashboard/tester/alla` och `/dashboard/tester/alla?typ=matris` (nya Tester i appens ram, menyn som ark)
   - `/dashboard/tester/installningar` och `?steg=3` (väljaren, gamla steg fungerar)
   - `/dashboard/tester/pass?typ=matning`, `?typ=pass` (gratis dag 0-grundpasset fungerar som appens onboarding lovar, och räknas i dagskvoten), `?typ=nivakoll&kind=deduktiv`, `?typ=steg2pass&kind=talserie`
   - `/dashboard/tester/matrislogik-grund` (starta, slutför, kvoten), `/dashboard/tester/ovningsprov/logik`, `/dashboard/tester/iprov`, `/dashboard/tester/kvitto/forsta_matningen`
   - Appens onboarding (`/register` blir `/app/valkommen`) till Nivåkollen och "Gör dagens grundpass".
   - `npx vitest run src/lib/mobilapp` grönt och oförändrat.

Inget kallas klart förrän 5.2 punkt 4 och 5 är gjorda. Annars: "byggt och typkontrollerat, inte klicktestat".

---

## 6. Risker

| Risk | Sannolikhet | Hantering |
|---|---|---|
| En ny webbadress under `/dashboard/tester/` 404:ar i appen | Hög om någon lägger till en sida | Planen använder bara befintliga adresser och `?typ=`. Grinden i integrationen: inga nya `page.tsx` under `src/app/dashboard/tester/` utom `forhandsvisning/*` |
| Nya Tester ritas i appens ram via `/app/tester/alla` och ser trasigt ut där | Medel | Sidan beror inte på sidomenyn, klicktestas med app-UA, menyn blir ark under 900 px |
| Gratisregeln krockar med appens fryst text "dagens grundpass, gratis i dag" | Hög om dag 0-grundpasset tas bort | Dag 0-grundpasset står kvar och räknas i dagens grundnivåkvot. Avvikelse från ägarens ordalydelse ("Träna är Premium") i appens onboarding: rapporteras till ägaren som beslut |
| "Dag N av M" står kvar i appen | Säker tills appen ändras | Fältet `planStart` finns; en rad i `UtvecklingVy` när appen öppnas igen. Att ändra `start` avvisades: det flyttar appens gratisregel (`hemvy.ts` rad 963) och kurva |
| Kvotändringen ger 429 där användare tidigare kunde göra ett test per typ | Säker, avsiktlig | `kvot_slut_visad` mäts, gratisraden förklarar, "I morgon" på alla kort samtidigt |
| Nivåpunkter utan RPC (talserier) skrivs inte atomärt med sessionen | Låg | Upsert på primärnyckeln, idempotent; ett fel loggas och punkten saknas bara den dagen. Vitest och pglite-test |
| Hämtningen för alla typer spräcker Hems budget 1,0 s | Medel | En parallell omgång, smala kolumner, `answers` bara 30 dagar, Din utveckling läser sitt eget. Mäts i integrationen; faller den läses hintarnas underlag via `after()`-cache först i andra hand |
| Karensen ger "frågorna tog slut" i små banker | Medel | Flaggan `KARENS_V4` av tills bankräkningen finns, `bank_slut_visad` mäts, över 5 procent av Premium-sessionerna flyttar bankarbetet först (utkastet) |
| Ordförrådets bank inte redo för nivåkoll | Medel | `ordforradRedo()` styr; kortet visar omätt band utan knapp, hinten hoppar över typen |
| Copy-svepet ändrar text som appens tester eller vyer förväntar sig | Låg | Grep i appens mappar och tester före ändring, `nivaKort` orörd |
| Fyra flöden på samma gren tävlar om datorn | Medel | Högst två tunga agenter åt gången, en arbetskopia, full kontroll en gång |
| Migreringen gissar startdagen för befintliga planer | Låg | Bästa tillgängliga (`uppdaterad_at`), syns bara i banan; nästa ändring av test eller datum sätter rätt dag |
| Black Week-priset syns inte på de nya ytorna | Låg | Priset läses i `Gratislage.pris` ur `kampanjForVisning`, klicktestas med `KAMPANJ_NU` före och under kampanjen |
