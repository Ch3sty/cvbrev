// src/lib/tester/v4/typer.ts
// =============================================================================
// Kontraktet för rekryteringstesterna v4 på webben (docs/plan-tester-v4-bygg.md
// avsnitt 3.0). Hem (C), Tester (B) och Din utveckling (D) bygger mot de här
// typerna; hamta.server.ts (A) fyller dem ur databasen och fixturer.ts ur
// skissen. Ändringar går genom arbetsflöde A och meddelas B, C och D.
//
// Ren fil, inga importer från server. Går att importera från klienten.
// =============================================================================

import type { Dag } from '@/lib/traning/datum';
import type { Deltyp, MittTest } from '@/lib/traning/mittTest';

export type { Dag } from '@/lib/traning/datum';

/** Testtyperna med nivå. Personlighet står utanför (ingen nivå). */
export type TestTypId = Exclude<Deltyp, 'personlighet'>;
export const TEST_TYP_ORDNING: readonly TestTypId[] = [
  'matris',
  'figurserie',
  'deduktiv',
  'verbal',
  'numerisk',
  'talserie',
  'spatial',
  'ordforrad',
];

export function arTestTypId(v: unknown): v is TestTypId {
  return (TEST_TYP_ORDNING as readonly unknown[]).includes(v);
}

/** Färgton per typ i grafen och på ikonen (skissens TON). Tokens: var(--<ton>-ink). */
export type TypTon = 'himmel' | 'turkos' | 'rosa' | 'gul' | 'salvia' | 'sand' | 'syren';
export const TYP_TON: Readonly<Record<TestTypId, TypTon>> = {
  matris: 'himmel',
  figurserie: 'turkos',
  deduktiv: 'rosa',
  verbal: 'gul',
  numerisk: 'salvia',
  talserie: 'salvia',
  spatial: 'sand',
  ordforrad: 'syren',
};

export type Zon = 'grund' | 'avancerad' | 'expert';

/** Zonernas gränser på skalan 1 till 10 (Grund 1 till 4, Avancerad 4 till 7, Expert 7 till 10). */
export const ZON_GRANSER: Readonly<Record<Zon, readonly [number, number]>> = {
  grund: [1, 4],
  avancerad: [4, 7],
  expert: [7, 10],
};

export interface NivaLage {
  status: 'omatt' | 'paborjad' | 'matt';
  /** 1 till 10, en decimal. Null om inte mätt. */
  niva: number | null;
  /** Standardfelet som ljusare band, 0,6. */
  osakerhet: number;
  /** Påbörjad nivåkoll: svar hittills och antal uppgifter. */
  svar?: { besvarade: number; antal: number };
  /** Taket tills banken är kalibrerad över det, 7,5. */
  tak: number;
}

/** Nivåbandets props, samma komponent i tre storlekar (B bygger, C och D använder). */
export interface NivabandProps {
  namn: string;
  lage: NivaLage;
  storlek: 'liten' | 'mellan' | 'stor';
  /** Koppar för provets delar och för alla utan plan, grått för övriga när en plan finns. */
  ton: 'koppar' | 'neutral';
}

export type LasSkal = 'premium' | 'kvot' | 'nivakoll_gjord';

export interface Handling {
  slag: 'trana' | 'nivakoll' | 'niva_test' | 'ovningsprov' | 'personlighet';
  /** "Träna", "Mät din nivå", "Gör ett övningsprov" */
  etikett: string;
  /** Alltid en befintlig adress (rutter.ts). */
  href: string;
  /** För niva_test. */
  zon?: Zon;
  /** "Ingår i Premium", "I morgon", "Igen med Premium" */
  las: null | { skal: LasSkal; chip: string };
  /** "1 kvar i dag", "Gratis en gång" */
  meta?: string;
}

export interface TesttypKort {
  id: TestTypId;
  /** DELTYP_NAMN */
  namn: string;
  /** "Kallas även Matrigma eller logiktest" */
  kallas: string;
  ingarIPlan: boolean;
  niva: NivaLage;
  senasteNivakoll: Dag | null;
  /** Senaste dagen med en träning i typen, eller null. */
  senasteTraning: Dag | null;
  antalTraningar: number;
  /** Träna, eller Mät din nivå om omätt, eller Grundnivå för gratis. */
  primar: Handling;
  /** steg2Synlig/ordforradRedo */
  synlig: boolean;
}

export interface TypMeny {
  typ: TestTypId;
  /** Med plan: provets format, annars "kallas även". */
  rad: string;
  trana: Handling & { rubrik: string; text: string };
  nivaer: (Handling & { zon: Zon; rubrik: string; text: string })[];
  nivakoll: Handling & { senaste: { dag: Dag; niva: number } | null };
  /** Tom lista där inget prov finns. */
  ovningsprov: (Handling & { rubrik: string; text: string })[];
  /** Tre senaste nivåkoller respektive två senaste prov. */
  senaste: { nivakoller: UtvecklingsPunkt[]; prov: UtvecklingsPunkt[] };
  /** "Öva på mönstret". Null när typen saknar mönsterdata. */
  monster: { namn: string; ratt: number; antal: number; href: string }[] | null;
}

export type PunktSlag = 'nivakoll' | 'trana' | 'ovningsprov';

export interface UtvecklingsPunkt {
  /** Sessionens id. */
  id: string;
  typ: TestTypId;
  dag: Dag;
  slag: PunktSlag;
  /** Null: ritas på tidslinjen, aldrig på nivåaxeln. */
  niva: number | null;
  /** False: "övning, räknas inte" (andra nivåkollen samma dag). */
  raknas: boolean;
  resultat: { ratt: number; antal: number } | null;
  /** Andel svar över provets tid, 0 till 1. */
  overTid: number | null;
  /** "Övningsprov Alva", "I-provet, talserier", "Nivåtest, grundnivå" */
  provNamn?: string;
  /**
   * Varifrån nivån kommer, när den inte är en Nivåkoll eller en träning.
   * 'nivatest': skattad ur ett fast nivåtest med Nivåkollens räkning, för
   * talserier, spatial förmåga och ordförråd som saknar egen Nivåkoll. Sådana
   * punkter har slag 'nivakoll' (ring i grafen) men ska märkas "Nivåtest".
   */
  kalla?: 'nivatest';
  /** Genomgången. */
  href: string | null;
}

export type HintTyp =
  | 'forsta_steg'
  | 'nivakoll_saknas'
  | 'nivakoll_paborjad'
  | 'svagt_monster'
  | 'tempo'
  | 'nivakoll_igen'
  | 'provet_nara'
  | 'prova_nytt';

export interface Hint {
  /** Stabil nyckel för händelser och "stäng". */
  id: string;
  typ: HintTyp;
  eyebrow: string;
  rubrik: string;
  skal: string;
  tips: string;
  testtyp: TestTypId | null;
  /** Öppnar typens meny eller startar direkt. */
  knapp: Handling;
  /** Bara forsta_steg. */
  stangbar: boolean;
}

export interface PlanV4 {
  mittTest: MittTest;
  /** mittTestNamn: "Alva Logic", "I-provet" */
  namn: string;
  /** deltesterForPlan utan personlighet */
  typer: TestTypId[];
  provdatum: Dag | null;
  dagarKvar: number | null;
  /** Dagen planen startade. Banan och "dag N av M" räknas härifrån. */
  planStart: Dag;
  dagsmal: 1 | 2 | 3 | null;
  /** "Provet har 20 uppgifter med två minuter var." */
  format: string | null;
  ovningsprov: { namn: string; meta: string; href: string; foreslagenDag: Dag | null } | null;
  /** Skapad ur provkällan utan datum. */
  franArtikel: boolean;
}

export interface BanaDag {
  dag: Dag;
  status: 'gjord' | 'idag' | 'kommande' | 'prov';
  forslag?: 'nivakoll' | 'ovningsprov';
}

export interface Gratislage {
  premium: boolean;
  harHistorik: boolean;
  /** 0 eller 1. */
  grundKvarIdag: number;
  /** ISO, nästa midnatt svensk tid. */
  pafyllning: string;
  nivakollGjord: Partial<Record<TestTypId, boolean>>;
  /** Ur paketet och kampanjen. */
  pris: { namn: string; prisrad: string; knapp: string };
}

export interface DagsmalLage {
  mal: number | null;
  gjortIdag: number;
  dagarIRad: number;
}

export interface Fortsatt {
  punkt: UtvecklingsPunkt;
  rubrik: string;
}

export interface Paketinfo {
  scope: string | null;
  track: string | null;
  planKey: string | null;
}

export interface TesterV4Data {
  idag: Dag;
  plan: PlanV4 | null;
  /** Tom utan plan. */
  bana: BanaDag[];
  /** Planens först, sedan TEST_TYP_ORDNING. */
  typer: TesttypKort[];
  menyer: Record<TestTypId, TypMeny>;
  /** Prioritetsordning, högst fem. */
  hintar: Hint[];
  gratis: Gratislage;
  dagsmal: DagsmalLage;
  fortsatt: Fortsatt | null;
  personlighet: { gjord: boolean; href: string };
  /** För Betalvagg. */
  paket: Paketinfo;
  /**
   * Hems minigraf: alla punkter de senaste 28 dagarna (i dag inräknat) för
   * de synliga typerna, i tidsordning. Gratis utan historik: bara senaste
   * punkten per typ, som i Din utveckling.
   */
  kurva: UtvecklingsPunkt[];
  /** Dagar med minst ett slutfört test de senaste 14 dagarna, för veckoraden. */
  aktivaDagar: Dag[];
}

export type MonsterLage = 'omott' | 'mott' | 'saker' | 'snabb';

export interface UtvecklingV4Data {
  idag: Dag;
  plan: PlanV4 | null;
  /** Väggens bana, samma som Hem och Tester. Tom utan plan. */
  bana: BanaDag[];
  typer: { id: TestTypId; namn: string; ingarIPlan: boolean; niva: NivaLage }[];
  /** Alla typer, tidsordning. */
  punkter: UtvecklingsPunkt[];
  historikLast: boolean;
  provdag: Dag | null;
  matrisMonster: { namn: string; family: string; lage: MonsterLage; ratt?: number; antal?: number; href: string }[] | null;
  gratis: Gratislage;
  paket: Paketinfo;
}
