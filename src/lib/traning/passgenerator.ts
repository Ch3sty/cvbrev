// src/lib/traning/passgenerator.ts
// =============================================================================
// Urvalet av frågor till mätning, pass, riktat pass, generalrepetition och
// uppvärmning (spec-rummen 6 våg 3a och 3c, briefen 3.3, 3.4 och 3.6).
//
// Rent och deterministiskt: samma indata och samma seed ger samma urval.
// Rutten sparar urvalet i sessionens meta, så test- och resultatsidan läser
// samma frågor utan att räkna om.
//
// Återanvändning (banken är liten tills våg 3c, flaggor.ts):
// - aldrig samma fråga två gånger i samma session;
// - aldrig en fråga som visats i dag eller i går ("två dagar i rad");
// - helst en fråga hon aldrig sett, sedan en som inte visats på
//   ATERANVAND_EFTER_DAGAR dagar (30 sedan BANK_RACKER_30_DAGAR sattes, 14 utan
//   BANK_RACKER_30_DAGAR), sedan en som inte visats förra veckan (8 dagar),
//   sist en som visats för minst två dagar sedan. Varje steg används bara när
//   det förra inte räcker, och urvalet säger hur många som återanvändes.
// =============================================================================

import { dagarMellan, type Dag } from './datum';
import { ATERANVAND_EFTER_DAGAR } from './flaggor';
import { bandForP, nivaForP, NARA_NIVAN_P, pForNiva, type Band, type Prior } from './svarighet';
import { hashString, mulberry32 } from '@/lib/logicTestV7/blanda';

export type Bankkalla = 'grund' | 'avancerad' | 'expert';

export interface BankFragaInfo {
  id: string;
  /** Andel rätt, uppmätt eller prior. */
  p: number;
  prior: Prior;
  family: string | null;
  kalla: Bankkalla;
}

export interface Sedd {
  id: string;
  /** Dagen (svensk tid) frågan senast visades. */
  dag: Dag;
}

/** Friskhet: 0 aldrig sedd, 1 efter återanvändningsfönstret, 2 inte förra veckan, 3 minst två dagar sedan. */
export type Friskhet = 0 | 1 | 2 | 3;

export const FRISKHET_DAGAR = { forraVeckan: 8, tvaDagarIRad: 2 } as const;

/** Senast sedd per fråga. */
export function senastSedd(sedda: readonly Sedd[]): Map<string, Dag> {
  const m = new Map<string, Dag>();
  for (const s of sedda) {
    const f = m.get(s.id);
    if (!f || s.dag > f) m.set(s.id, s.dag);
  }
  return m;
}

/** Frågans friskhet i dag, null när den inte får visas (i dag eller i går). */
export function friskhet(
  senast: Dag | undefined,
  idag: Dag,
  aterAnvandEfter = ATERANVAND_EFTER_DAGAR
): Friskhet | null {
  if (!senast) return 0;
  const sedan = dagarMellan(senast, idag);
  if (sedan >= aterAnvandEfter) return 1;
  if (sedan >= FRISKHET_DAGAR.forraVeckan) return 2;
  if (sedan >= FRISKHET_DAGAR.tvaDagarIRad) return 3;
  return null;
}

interface Kandidat {
  q: BankFragaInfo;
  friskhet: Friskhet;
  slump: number;
}

function kandidater(
  bank: readonly BankFragaInfo[],
  sedda: readonly Sedd[],
  idag: Dag,
  seed: string
): Kandidat[] {
  const senast = senastSedd(sedda);
  const rng = mulberry32(hashString(seed));
  const ut: Kandidat[] = [];
  for (const q of bank) {
    const slump = rng();
    const f = friskhet(senast.get(q.id), idag);
    if (f === null) continue;
    ut.push({ q, friskhet: f, slump });
  }
  return ut;
}

const efterFriskhet = (a: Kandidat, b: Kandidat) => a.friskhet - b.friskhet || a.slump - b.slump;

/** Sedd inom återanvändningsfönstret: friskhet 2 eller 3. */
export function arUpprepad(f: Friskhet): boolean {
  return f === 2 || f === 3;
}

function upprepadeAv(valda: readonly Kandidat[]): string[] {
  return valda.filter((k) => arUpprepad(k.friskhet)).map((k) => k.q.id);
}

/**
 * Delar kandidaterna efter friskhet: det minsta steget t som räcker till
 * `antal` frågor. Alla frågor friskare än t tas med (`sakra`), resten av
 * platserna fylls ur steg t (`pool`) enligt sammansättningen. En äldre fråga
 * går alltså alltid före en nyare, även om sammansättningen då får ge efter.
 */
function delaEfterFriskhet(alla: readonly Kandidat[], antal: number): { sakra: Kandidat[]; pool: Kandidat[] } {
  for (const t of [0, 1, 2, 3] as const) {
    if (alla.filter((k) => k.friskhet <= t).length >= antal) {
      return {
        sakra: alla.filter((k) => k.friskhet < t).sort(efterFriskhet),
        pool: alla.filter((k) => k.friskhet === t),
      };
    }
  }
  return { sakra: [...alla].sort(efterFriskhet), pool: [] };
}

/** Lättast först (högst p), stabilt på id. Passet går från säkert till sträck. */
function lattastForst(a: BankFragaInfo, b: BankFragaInfo): number {
  return b.p - a.p || a.id.localeCompare(b.id);
}

export interface Sammansattning {
  nara: number;
  under: number;
  over: number;
}

/** 60/20/20 av antal, avrundat så att summan stämmer (9 ger 5/2/2). */
export function fordelning(antal: number): Sammansattning {
  const under = Math.round(antal * 0.2);
  const over = Math.round(antal * 0.2);
  return { nara: Math.max(0, antal - under - over), under, over };
}

export interface Urval {
  fragor: string[];
  sammansattning: Sammansattning;
  tema: string | null;
  /** Antal frågor hon sett förut (friskhet 1 till 3). */
  ateranvanda: number;
  /**
   * Frågorna hon sett för 2 till 13 dagar sedan (friskhet 2 eller 3). De
   * räknas inte mot nivån, tempot, familjerna eller frågestatistiken
   * (spec-rummen 14.1 punkt 3).
   */
  upprepade: string[];
  /** Nivån passet riktades mot. */
  malniva: number;
}

function lagg(ut: Kandidat[], fran: Kandidat[], n: number, tagna: Set<string>): number {
  let lagt = 0;
  for (const k of fran) {
    if (lagt >= n) break;
    if (tagna.has(k.q.id)) continue;
    tagna.add(k.q.id);
    ut.push(k);
    lagt++;
  }
  return lagt;
}

/**
 * Dagens pass: 60 procent nära nivån (|p − p_nivå| ≤ 0,15), 20 under, 20
 * över. Med tema föredras temats frågor bland de nära. Räcker ett band inte
 * fylls det med de närmaste frågorna i övrigt. endastGrund ger grundpasset
 * (bara grundbanken).
 */
export function valjPass(inp: {
  bank: readonly BankFragaInfo[];
  niva: number;
  sedda: readonly Sedd[];
  idag: Dag;
  seed: string;
  antal?: number;
  tema?: string | null;
  endastGrund?: boolean;
}): Urval {
  const antal = inp.antal ?? 9;
  const bank = inp.endastGrund ? inp.bank.filter((q) => q.kalla === 'grund') : inp.bank;
  // Grundpasset riktas mot nivån, men aldrig över grundbankens svåraste.
  const malniva = inp.endastGrund
    ? Math.min(inp.niva, Math.max(...bank.map((q) => nivaForP(q.p)), 1))
    : inp.niva;
  const pNiva = pForNiva(malniva);
  const { sakra, pool } = delaEfterFriskhet(kandidater(bank, inp.sedda, inp.idag, inp.seed), antal);
  const mal = fordelning(antal);
  const tema = inp.tema ?? null;
  const fack = (k: Kandidat): keyof Sammansattning => {
    const d = k.q.p - pNiva;
    return Math.abs(d) <= NARA_NIVAN_P + 1e-9 ? 'nara' : d > 0 ? 'under' : 'over';
  };

  const tagna = new Set<string>();
  const valda: Kandidat[] = [];
  const faktiskt: Sammansattning = { nara: 0, under: 0, over: 0 };
  // De friskare frågorna tas med först, sedan sammansättningen ur poolen.
  for (const k of sakra.slice(0, antal)) {
    tagna.add(k.q.id);
    valda.push(k);
    faktiskt[fack(k)]++;
  }
  const nara = pool
    .filter((k) => fack(k) === 'nara')
    .sort(
      (a, b) =>
        (tema ? Number(a.q.family !== tema) - Number(b.q.family !== tema) : 0) || efterFriskhet(a, b)
    );
  const under = pool.filter((k) => fack(k) === 'under').sort(efterFriskhet);
  const over = pool.filter((k) => fack(k) === 'over').sort(efterFriskhet);
  const plats = () => antal - valda.length;
  faktiskt.nara += lagg(valda, nara, Math.min(plats(), Math.max(0, mal.nara - faktiskt.nara)), tagna);
  faktiskt.under += lagg(valda, under, Math.min(plats(), Math.max(0, mal.under - faktiskt.under)), tagna);
  faktiskt.over += lagg(valda, over, Math.min(plats(), Math.max(0, mal.over - faktiskt.over)), tagna);

  // Fyll upp med de närmaste frågorna i övrigt.
  if (valda.length < antal) {
    const rest = pool
      .filter((k) => !tagna.has(k.q.id))
      .sort((a, b) => Math.abs(a.q.p - pNiva) - Math.abs(b.q.p - pNiva) || a.slump - b.slump);
    for (const k of rest) {
      if (valda.length >= antal) break;
      tagna.add(k.q.id);
      valda.push(k);
      faktiskt[fack(k)]++;
    }
  }

  return {
    fragor: valda.map((k) => k.q).sort(lattastForst).map((q) => q.id),
    sammansattning: faktiskt,
    tema: tema && valda.some((k) => k.q.family === tema) ? tema : null,
    ateranvanda: valda.filter((k) => k.friskhet > 0).length,
    upprepade: upprepadeAv(valda),
    malniva,
  };
}

/**
 * Temat för dagens pass. Efter ett pass som gick bra ("samma familj en nivå
 * upp") samma familj; annars den svagaste familjen som har minst tre frågor
 * att välja, och som inte var förra passets tema. Utan familjer i banken: null.
 */
export function valjTema(inp: {
  bank: readonly BankFragaInfo[];
  sedda: readonly Sedd[];
  idag: Dag;
  /** Förra passets tema och vad "I morgon" lovade. */
  forra?: { tema: string | null; nasta: 'familj_upp' | 'ny_familj' | null } | null;
  /** Familjerna med lägst andel rätt först (familjer.ts). */
  svagaste: readonly string[];
}): string | null {
  const senast = senastSedd(inp.sedda);
  const tillgangliga = new Map<string, number>();
  for (const q of inp.bank) {
    if (!q.family) continue;
    if (friskhet(senast.get(q.id), inp.idag) === null) continue;
    tillgangliga.set(q.family, (tillgangliga.get(q.family) ?? 0) + 1);
  }
  if (tillgangliga.size === 0) return null;
  const racker = (f: string | null | undefined): f is string => !!f && (tillgangliga.get(f) ?? 0) >= 3;

  if (inp.forra?.nasta === 'familj_upp' && racker(inp.forra.tema)) return inp.forra.tema;
  for (const f of inp.svagaste) if (f !== inp.forra?.tema && racker(f)) return f;
  // Annars den familj med flest frågor kvar (stabilt på namnet).
  const sorterade = [...tillgangliga.entries()]
    .filter(([f]) => f !== inp.forra?.tema && racker(f))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'sv'));
  return sorterade[0]?.[0] ?? (racker(inp.forra?.tema) ? inp.forra!.tema : null);
}

/** Minsta antal frågor ett riktat pass får ha. Färre: familjen räcker inte än. */
export const RIKTAT_MINST = 5;

/**
 * Riktat pass: nio frågor ur en familj, närmast nivån först. Saknar banken
 * familjer, eller har familjen för få frågor, blir urvalet tomt och rutten
 * svarar 422.
 */
export function valjRiktat(inp: {
  bank: readonly BankFragaInfo[];
  family: string;
  niva: number;
  sedda: readonly Sedd[];
  idag: Dag;
  seed: string;
  antal?: number;
}): Urval {
  const antal = inp.antal ?? 9;
  const pNiva = pForNiva(inp.niva);
  const alla = kandidater(
    inp.bank.filter((q) => q.family === inp.family),
    inp.sedda,
    inp.idag,
    inp.seed
  ).sort(
    (a, b) => a.friskhet - b.friskhet || Math.abs(a.q.p - pNiva) - Math.abs(b.q.p - pNiva) || a.slump - b.slump
  );
  const valda = alla.slice(0, antal);
  if (valda.length < Math.min(RIKTAT_MINST, antal)) {
    return { fragor: [], sammansattning: { nara: 0, under: 0, over: 0 }, tema: inp.family, ateranvanda: 0, upprepade: [], malniva: inp.niva };
  }
  const s: Sammansattning = { nara: 0, under: 0, over: 0 };
  for (const k of valda) {
    const d = k.q.p - pNiva;
    if (Math.abs(d) <= NARA_NIVAN_P + 1e-9) s.nara++;
    else if (d > 0) s.under++;
    else s.over++;
  }
  return {
    fragor: valda.map((k) => k.q).sort(lattastForst).map((q) => q.id),
    sammansattning: s,
    tema: inp.family,
    ateranvanda: valda.filter((k) => k.friskhet > 0).length,
    upprepade: upprepadeAv(valda),
    malniva: inp.niva,
  };
}

/* ------------------------- Mätningen, adaptivt ------------------------- */

export type Pooler = Record<Band, string[]>;

export const BAND_ORDNING: readonly Band[] = ['latt', 'mellan', 'svar'];

/**
 * Mätningens pooler: upp till `perBand` frågor per svårighetsband, ordnade
 * efter friskhet. Mätningen och ommätningen föredrar frågor hon inte sett.
 * `upprepade` är poolfrågorna hon sett för 2 till 13 dagar sedan.
 */
export function valjPooler(inp: {
  bank: readonly BankFragaInfo[];
  sedda: readonly Sedd[];
  idag: Dag;
  seed: string;
  perBand?: number;
}): { pooler: Pooler; upprepade: string[] } {
  const perBand = inp.perBand ?? 12;
  const alla = kandidater(inp.bank, inp.sedda, inp.idag, inp.seed).sort(efterFriskhet);
  const pooler: Pooler = { latt: [], mellan: [], svar: [] };
  const valda: Kandidat[] = [];
  for (const k of alla) {
    const b = bandForP(k.q.p);
    if (pooler[b].length < perBand) {
      pooler[b].push(k.q.id);
      valda.push(k);
    }
  }
  return { pooler, upprepade: upprepadeAv(valda) };
}

export interface AdaptivtSvar {
  q_id: string;
  correct: boolean;
}

export interface NastaFraga {
  id: string;
  band: Band;
  /** 0-baserad plats i mätningen. */
  index: number;
}

function flytta(band: Band, steg: number): Band {
  const i = BAND_ORDNING.indexOf(band);
  return BAND_ORDNING[Math.max(0, Math.min(BAND_ORDNING.length - 1, i + steg))];
}

/**
 * Nästa fråga i en adaptiv session (mätningen, ommätningen och adaptiva
 * generalrepetitioner). Börjar i mellanbandet; rätt svar flyttar ett band
 * upp, fel ett band ned. Tar nästa oanvända fråga i bandet; är bandet slut
 * används närmaste band med frågor kvar. Null när `antal` frågor är besvarade
 * eller poolerna är slut.
 *
 * Svaren spelas upp i ordning, så rutten kan kontrollera att klienten svarar
 * på den fråga servern lade fram.
 */
export function nastaAdaptivaFraga(
  pooler: Pooler,
  svar: readonly AdaptivtSvar[],
  antal: number
): NastaFraga | null {
  const anvanda = new Set(svar.map((s) => s.q_id));
  let band: Band = 'mellan';
  for (const s of svar) band = flytta(band, s.correct ? 1 : -1);
  if (svar.length >= antal) return null;

  const ordning = [band, flytta(band, -1), flytta(band, 1), ...BAND_ORDNING];
  for (const b of ordning) {
    const id = pooler[b]?.find((q) => !anvanda.has(q));
    if (id) return { id, band: b, index: svar.length };
  }
  return null;
}

/* --------------------------- Generalrepetitionen --------------------------- */

/**
 * Fast generalrepetition i leverantörens format: `antal` frågor jämnt fördelade
 * över de tre banden, från lätt till svår, som ett riktigt prov. Är banken
 * för liten blir provet kortare; rutten anger det faktiska antalet.
 */
export function valjGeneral(inp: {
  bank: readonly BankFragaInfo[];
  antal: number;
  sedda: readonly Sedd[];
  idag: Dag;
  seed: string;
}): { fragor: string[]; upprepade: string[] } {
  const { sakra, pool } = delaEfterFriskhet(kandidater(inp.bank, inp.sedda, inp.idag, inp.seed), inp.antal);
  const tredjedel = Math.floor(inp.antal / 3);
  const mal: Record<Band, number> = {
    latt: tredjedel,
    mellan: inp.antal - 2 * tredjedel,
    svar: tredjedel,
  };
  const tagna = new Set<string>();
  const valda: Kandidat[] = [];
  lagg(valda, sakra, inp.antal, tagna);
  for (const k of valda) mal[bandForP(k.q.p)]--;
  const perBand: Record<Band, Kandidat[]> = { latt: [], mellan: [], svar: [] };
  for (const k of [...pool].sort(efterFriskhet)) perBand[bandForP(k.q.p)].push(k);
  for (const b of BAND_ORDNING) {
    lagg(valda, perBand[b], Math.min(inp.antal - valda.length, Math.max(0, mal[b])), tagna);
  }
  if (valda.length < inp.antal) lagg(valda, [...pool].sort(efterFriskhet), inp.antal - valda.length, tagna);
  return { fragor: valda.map((k) => k.q).sort(lattastForst).map((q) => q.id), upprepade: upprepadeAv(valda) };
}

/* ------------------------------ Uppvärmningen ------------------------------ */

/**
 * Provdagens tre uppvärmningsfrågor: lätta, ur grundbanken, seedade på dagen
 * så att samma dag ger samma tre. Sparas inte.
 */
export function valjUppvarmning(bank: readonly BankFragaInfo[], seed: string, antal = 3): string[] {
  const latta = bank.filter((q) => q.kalla === 'grund');
  const rng = mulberry32(hashString(seed));
  return latta
    .map((q) => ({ q, r: rng() }))
    .sort((a, b) => b.q.p - a.q.p || a.r - b.r)
    .slice(0, Math.max(antal * 3, antal))
    .sort((a, b) => a.r - b.r)
    .slice(0, antal)
    .map(({ q }) => q.id);
}
