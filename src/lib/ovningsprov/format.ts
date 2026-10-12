// src/lib/ovningsprov/format.ts
// =============================================================================
// Övningsprov mot klockan, formatet per testtyp (riktlinjer-tester-v2 1.2 och
// 1.9, granskning-figurer avsnitt 6 punkt 3).
//
// Logik läser PROVFORMAT i tempo.ts (sex format, nyckeln står i sessionens
// meta). Verbalt och numeriskt har två format var: SHL och vårt eget. Allt
// annat mappar till vårt eget med en anmärkning per leverantör. Talen läses
// härifrån, aldrig som fasta tal i copyn: det som står på raden är exakt det
// provet levererar.
//
// Ordregler: "samma format som", aldrig "samma test". Leverantörens namn
// kommer bara ur planens leverantör. Aons tal för logiken är inte verifierade
// av bevakningen (granskningen 6.3), så Aon står som "Vårt format" med sin
// anmärkning.
// =============================================================================

import { paketKort } from '@/lib/plans/plans';
import { formatForPlan, PROVFORMAT, type FormatNyckel, type Provformat } from '@/lib/traning/tempo';

export type Provtyp = 'logik' | 'verbal' | 'numerisk';
export const PROVTYPER: readonly Provtyp[] = ['logik', 'verbal', 'numerisk'];

export function arProvtyp(v: unknown): v is Provtyp {
  return v === 'logik' || v === 'verbal' || v === 'numerisk';
}

export type Enhet = 'uppgifter' | 'påståenden' | 'frågor';

export type FormatNyckelVN = 'verbal_shl' | 'verbal_eget' | 'numerisk_shl' | 'numerisk_eget';

export interface Ovningsformat {
  typ: Provtyp;
  /** Logik: PROVFORMAT-nyckeln. Verbalt och numeriskt: verbal_shl, numerisk_eget ... */
  nyckel: FormatNyckel | FormatNyckelVN;
  /** Namnet efter "Samma format som". Null: vårt format. */
  namn: string | null;
  antal: number;
  minuter: number;
  /** Provets tid per uppgift, påstående eller fråga i sekunder. */
  budget_s: number;
  adaptiv: boolean;
  cirka: boolean;
  tidsform: 'total' | 'per_uppgift';
  enhet: Enhet;
  /** Verbalt och numeriskt: texterna eller underlagen provet består av. */
  delar: { antal: number; per: number; budget_s: number; ord: 'texter' | 'underlag' } | null;
  /** Meningen under formatet (tabellens anmärkning), null när ingen finns. */
  anmarkning: string | null;
  /** Leverantören är okänd: raden erbjuder att byta format. */
  okandLeverantor: boolean;
}

/* --------------------------------- Verbalt -------------------------------- */

const VERBAL_BAS = {
  typ: 'verbal' as const,
  antal: 32,
  minuter: 20,
  // 37 sekunder per påstående, 150 per text (riktlinjerna 1.2).
  budget_s: 37,
  adaptiv: false,
  tidsform: 'total' as const,
  enhet: 'påståenden' as const,
  delar: { antal: 8, per: 4, budget_s: 150, ord: 'texter' as const },
  okandLeverantor: false,
};

const NUMERISK_BAS = {
  typ: 'numerisk' as const,
  antal: 20,
  minuter: 25,
  // 75 sekunder per fråga, 300 per underlag (riktlinjerna 1.2).
  budget_s: 75,
  adaptiv: false,
  tidsform: 'total' as const,
  enhet: 'frågor' as const,
  delar: { antal: 5, per: 4, budget_s: 300, ord: 'underlag' as const },
  okandLeverantor: false,
};

export const ANMARKNING = {
  logik: {
    shl: 'SHL Verify G+ blandar siffror, slutledning och figurer. Övningsprovet övar figurdelen.',
    aon: 'Aon scales ix använder figurserier, inte rutnät. Övningsprovet övar tempot med matriser.',
  },
  verbal: {
    shl: 'Svaren sant, falskt eller går inte att avgöra, som i SHL Verify verbal.',
    aon: 'Aons scales verbal har fler uppgifter än någon hinner och texter i flikar. Svarsformatet är detsamma.',
    matrigma: 'Assessio har inget verbalt test. Får du bara Matrigma behöver du inte öva det här.',
    alva: 'Alva har inget verbalt test. Får du bara Alva Logic behöver du inte öva det här.',
  },
  numerisk: {
    shl: 'SHL Verify numerisk finns i flera versioner. Den vanligaste har 18 frågor på 25 minuter.',
    aon: 'Aons scales numerical har svaren sant, falskt eller går inte att avgöra och fler uppgifter än någon hinner. Räknandet i tabellerna är detsamma.',
    matrigma: 'Assessio har inget numeriskt test. Får du bara Matrigma behöver du inte öva det här.',
    alva: 'Alva har inget numeriskt test. Får du bara Alva Logic behöver du inte öva det här.',
  },
  okand: 'Vet du leverantören så byter vi format.',
} as const;

export const OVNINGSFORMAT_VN: Readonly<Record<FormatNyckelVN, Omit<Ovningsformat, 'anmarkning'>>> = {
  verbal_shl: { ...VERBAL_BAS, nyckel: 'verbal_shl', namn: 'SHL Verify verbal', cirka: false },
  verbal_eget: { ...VERBAL_BAS, nyckel: 'verbal_eget', namn: null, cirka: false },
  numerisk_shl: { ...NUMERISK_BAS, nyckel: 'numerisk_shl', namn: 'SHL Verify numerisk', cirka: true },
  numerisk_eget: { ...NUMERISK_BAS, nyckel: 'numerisk_eget', namn: null, cirka: false },
};

export function arFormatNyckelVN(v: unknown): v is FormatNyckelVN {
  return typeof v === 'string' && v in OVNINGSFORMAT_VN;
}

function franLogik(f: Provformat): Ovningsformat {
  const aon = f.nyckel === 'aon';
  return {
    typ: 'logik',
    nyckel: f.nyckel,
    // Aons tal är inte verifierade av bevakningen (granskningen 6.3).
    namn: aon ? null : f.namn,
    antal: f.antal,
    minuter: f.minuter,
    budget_s: f.budget_s,
    adaptiv: f.adaptiv,
    cirka: f.cirka,
    tidsform: f.tidsform,
    enhet: 'uppgifter',
    delar: null,
    // Vårt format med anmärkning (Aon sedan omgång 2) bär sin egen anmärkning.
    anmarkning: f.nyckel === 'shl' ? ANMARKNING.logik.shl : aon ? ANMARKNING.logik.aon : f.anmarkning ?? null,
    // Vet inte och Annat (riktlinjernas tabell 1.2): samma rad för båda.
    okandLeverantor: f.nyckel === 'eget' && !f.anmarkning,
  };
}

/** Formatet för en testtyp och planens leverantör. */
export function ovningsformat(
  typ: Provtyp,
  leverantor?: string | null,
  variant?: string | null
): Ovningsformat {
  if (typ === 'logik') return franLogik(formatForPlan(leverantor, variant));
  const nyckel: FormatNyckelVN = leverantor === 'shl' ? `${typ}_shl` : `${typ}_eget`;
  const lev = leverantor === 'shl' || leverantor === 'aon' || leverantor === 'matrigma' || leverantor === 'alva' ? leverantor : null;
  return { ...OVNINGSFORMAT_VN[nyckel], anmarkning: lev ? ANMARKNING[typ][lev] : null };
}

/** Formatet ur en sparad nyckel (sessionens meta). */
export function ovningsformatUrNyckel(typ: Provtyp, nyckel: string): Ovningsformat {
  // Gamla sessioner med meta.format aon ritas som förut (omgång 2, A7).
  if (typ === 'logik' && nyckel === 'aon') return franLogik(PROVFORMAT.aon);
  if (typ === 'logik') return franLogik(formatForPlan(nyckelTillLeverantor(nyckel), nyckel === 'matrigma_adaptiv' ? 'adaptiv' : null));
  return arFormatNyckelVN(nyckel) ? { ...OVNINGSFORMAT_VN[nyckel], anmarkning: null } : ovningsformat(typ, null);
}

function nyckelTillLeverantor(nyckel: string): string | null {
  if (nyckel.startsWith('matrigma')) return 'matrigma';
  if (nyckel === 'alva' || nyckel === 'shl' || nyckel === 'aon') return nyckel;
  return null;
}

/* ---------------------------------- Texter --------------------------------- */

const TALORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'];

/** "cirka 35 uppgifter på 40 minuter", "32 påståenden på 20 minuter", "20 uppgifter, två minuter var". */
export function antalTid(f: Pick<Ovningsformat, 'antal' | 'minuter' | 'budget_s' | 'cirka' | 'tidsform' | 'enhet'>): string {
  let text: string;
  if (f.tidsform === 'per_uppgift') {
    const min = Math.round(f.budget_s / 60);
    const ord = min >= 1 && min <= 12 ? TALORD[min] : String(min);
    text = `${f.antal} ${f.enhet}, ${ord} ${min === 1 ? 'minut' : 'minuter'} var`;
  } else {
    text = `${f.antal} ${f.enhet} på ${f.minuter} minuter`;
  }
  return f.cirka ? `cirka ${text}` : text;
}

/** "Samma format som Matrigma" eller "Vårt format". */
export function formatTitel(f: Pick<Ovningsformat, 'namn'>): string {
  return f.namn ? `Samma format som ${f.namn}` : 'Vårt format';
}

export interface ProvradTexter {
  /** Rad 2 på provraden: "Samma format som Matrigma: cirka 35 uppgifter på 40 minuter." */
  rad: string;
  /** Anmärkningen under raden, eller null. */
  anm: string | null;
  /** Skärmläsarens text för hela raden. */
  aria: string;
}

export const PROVRAD_TITEL = 'Övningsprov mot klockan';

/**
 * Provradens texter i Alla tester (riktlinjerna 1.5, skiss 1): formatet i
 * klartext även låst, "Ingår i Premium." sist bara när raden är låst.
 */
export function provradTexter(f: Ovningsformat, last: boolean): ProvradTexter {
  const delar = [`${formatTitel(f)}: ${antalTid(f)}.`];
  if (f.okandLeverantor) delar.push(ANMARKNING.okand);
  if (last) delar.push(`Ingår i ${paketKort()}.`);
  const rad = delar.join(' ');
  const aria = [`${PROVRAD_TITEL}.`, rad, f.anmarkning, last ? `Låst, ingår i ${paketKort()}.` : null]
    .filter(Boolean)
    .join(' ')
    .replace(`Ingår i ${paketKort()}. Låst, ingår i ${paketKort()}.`, `Låst, ingår i ${paketKort()}.`);
  return { rad, anm: f.anmarkning, aria };
}

/** Startarkets beskrivning av ordningen (skiss 2, granskningen 6.4). */
export function ordningText(f: Pick<Ovningsformat, 'adaptiv' | 'tidsform'>): string {
  if (f.tidsform === 'per_uppgift') return 'Varje uppgift har sin egen tid. Provet anpassar sig efter dina svar, och du kan inte gå tillbaka.';
  if (f.adaptiv) return 'Provet anpassar sig efter dina svar. Du kan inte gå tillbaka.';
  return 'I fast ordning, de svåraste sist. Du kan gå tillbaka.';
}
