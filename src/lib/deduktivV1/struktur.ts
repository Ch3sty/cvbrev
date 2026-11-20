// src/lib/deduktivV1/struktur.ts
// =============================================================================
// Uppgiftens form för gränssnittet (omgång 3, steg 2b): villkorens bilder,
// kladdytorna och kedjan i facit. Byggs ur lösarens `formell`, som aldrig
// lämnar servern i sin helhet: `roller` och `alternativ` avslöjar svaret.
//
//   deduktivStruktur  villkoren (premisserna) och scenens namn, utan något
//                     om alternativen. Får skickas med uppgiften före svaret.
//   deduktivLedNamn   kedjans namn på leden (termnamn, atomnamn). Avslöjar
//                     inte svaret men skickas med facit, som lösningen.
//
// Ren modul: får importeras från klienten och vitest.
// =============================================================================

import type { DeduktivLedNamn } from './types';

/** Ett platsvillkor (D2, D3, kan_inte): a och b är index i `namn`, k en plats 1 till n. */
export interface PlatsVillkor {
  typ: 'plats' | 'inte_plats' | 'granne' | 'inte_granne' | 'vanster_om' | 'direkt_vanster_om' | 'ordning' | 'samma_grupp';
  a: number;
  b?: number;
  k?: number;
}

/** En premiss i kvantorform (D1, D4 kvantor): x och y är term-id, i en individ. */
export interface KvantorLed {
  typ: 'alla' | 'inga' | 'nagra' | 'nagra_inte' | 'ar' | 'ar_inte';
  x: string;
  y?: string;
  i?: string;
}

/** Ett villkor i om_sa: atomernas index och om de är nekade. */
export type OmSaVillkor =
  | { typ: 'om'; p: { a: number; neg: boolean }; q: { a: number; neg: boolean } }
  | { typ: 'lit'; a: number; neg: boolean };

export type DeduktivStruktur =
  | { slag: 'plats'; tema: 'personer' | 'saker' | 'turordning'; namn: string[]; villkor: PlatsVillkor[]; antagande: { a: number; k: number } | null }
  | { slag: 'kvantor'; termer: string[]; individer: string[]; villkor: KvantorLed[][] }
  | { slag: 'om_sa'; atomer: number; villkor: OmSaVillkor[] }
  | { slag: 'sanning'; namn: string[]; talare: number[] }
  | {
      slag: 'tabell';
      namn: string[];
      kategorier: { A: { mall: string; varden: string[] }; B: { mall: string; varden: string[] } };
    };

const PLATS_TYPER = new Set(['plats', 'inte_plats', 'granne', 'inte_granne', 'vanster_om', 'direkt_vanster_om', 'ordning', 'samma_grupp']);
const KVANTOR_TYPER = new Set(['alla', 'inga', 'nagra', 'nagra_inte', 'ar', 'ar_inte']);

const arObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const tal = (v: unknown): number | undefined => (typeof v === 'number' && Number.isInteger(v) ? v : undefined);
const text = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
const texter = (v: unknown): string[] | null => (Array.isArray(v) && v.every((x) => typeof x === 'string') ? (v as string[]) : null);

function platsVillkor(v: unknown): PlatsVillkor | null {
  if (!arObj(v) || typeof v.typ !== 'string' || !PLATS_TYPER.has(v.typ)) return null;
  const a = tal(v.a);
  if (a == null) return null;
  return { typ: v.typ as PlatsVillkor['typ'], a, ...(tal(v.b) != null ? { b: tal(v.b) } : {}), ...(tal(v.k) != null ? { k: tal(v.k) } : {}) };
}

function kvantorLed(v: unknown): KvantorLed | null {
  if (!arObj(v) || typeof v.typ !== 'string' || !KVANTOR_TYPER.has(v.typ)) return null;
  const x = text(v.x);
  if (!x) return null;
  return { typ: v.typ as KvantorLed['typ'], x, ...(text(v.y) ? { y: text(v.y) } : {}), ...(text(v.i) ? { i: text(v.i) } : {}) };
}

function omSaVillkor(v: unknown): OmSaVillkor | null {
  if (!arObj(v)) return null;
  const lit = (x: unknown) => (arObj(x) && tal(x.a) != null ? { a: tal(x.a)!, neg: x.neg === true } : null);
  if (v.typ === 'om') {
    const p = lit(v.p);
    const q = lit(v.q);
    return p && q ? { typ: 'om', p, q } : null;
  }
  if (v.typ === 'lit' && tal(v.a) != null) return { typ: 'lit', a: tal(v.a)!, neg: v.neg === true };
  return null;
}

/**
 * Villkorens form ur lösarens `formell`, utan alternativen och rollerna.
 * Null när formen saknas eller inte går att läsa: då ritas villkoren som text.
 */
export function deduktivStruktur(formell: unknown): DeduktivStruktur | null {
  if (!arObj(formell)) return null;
  const f = formell;
  // Platsform: D2, D3 och kan_inte (tema personer, saker eller turordning).
  if (f.tema === 'personer' || f.tema === 'saker' || f.tema === 'turordning') {
    const namn = texter(f.namn);
    if (!namn || !Array.isArray(f.villkor)) return null;
    const villkor = f.villkor.map(platsVillkor);
    if (villkor.some((v) => !v)) return null;
    const ant = arObj(f.antagande) && f.antagande.typ === 'plats' && tal(f.antagande.a) != null && tal(f.antagande.k) != null ? { a: tal(f.antagande.a)!, k: tal(f.antagande.k)! } : null;
    return { slag: 'plats', tema: f.tema, namn: [...namn], villkor: villkor as PlatsVillkor[], antagande: ant };
  }
  // Kvantorer: D1 har `premisser`, D4 kvantor har `villkor`.
  if (Array.isArray(f.termer) && (Array.isArray(f.premisser) || (f.slag === 'kvantor' && Array.isArray(f.villkor)))) {
    const termer = texter(f.termer);
    const rader = (Array.isArray(f.premisser) ? f.premisser : f.villkor) as unknown[];
    if (!termer) return null;
    const villkor = rader.map((r) => (Array.isArray(r) ? r.map(kvantorLed) : []));
    if (villkor.some((r) => !r.length || r.some((l) => !l))) return null;
    return { slag: 'kvantor', termer: [...termer], individer: texter(f.individer) ?? [], villkor: villkor as KvantorLed[][] };
  }
  if (f.slag === 'om_sa' && Array.isArray(f.atomer) && Array.isArray(f.villkor)) {
    const villkor = f.villkor.map(omSaVillkor);
    if (villkor.some((v) => !v)) return null;
    return { slag: 'om_sa', atomer: f.atomer.length, villkor: villkor as OmSaVillkor[] };
  }
  if (f.slag === 'sanning') {
    const namn = texter(f.namn);
    if (!namn || !Array.isArray(f.villkor)) return null;
    const talare = f.villkor.map((v) => (arObj(v) ? tal(v.talare) : undefined));
    if (talare.some((t) => t == null)) return null;
    return { slag: 'sanning', namn: [...namn], talare: talare as number[] };
  }
  if (f.slag === 'tabell' && arObj(f.kategorier)) {
    const namn = texter(f.namn);
    const kat = (k: unknown) => (arObj(k) && typeof k.mall === 'string' && texter(k.varden) ? { mall: k.mall, varden: [...(k.varden as string[])] } : null);
    const A = kat(f.kategorier.A);
    const B = kat(f.kategorier.B);
    if (!namn || !A || !B) return null;
    return { slag: 'tabell', namn: [...namn], kategorier: { A, B } };
  }
  return null;
}

/** Kedjans namn på leden ur `formell` (termnamn för kvantorer, atomnamn för om_sa). Null när de saknas. */
export function deduktivLedNamn(formell: unknown): DeduktivLedNamn | null {
  if (!arObj(formell)) return null;
  const ut: DeduktivLedNamn = {};
  if (arObj(formell.termnamn)) {
    const t: Record<string, string> = {};
    for (const [k, v] of Object.entries(formell.termnamn)) if (typeof v === 'string') t[k] = v;
    if (Object.keys(t).length) ut.termnamn = t;
  }
  const a = texter(formell.atomnamn);
  if (a?.length) ut.atomnamn = [...a];
  return ut.termnamn || ut.atomnamn ? ut : null;
}
