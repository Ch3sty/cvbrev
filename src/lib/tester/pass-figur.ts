// src/lib/tester/pass-figur.ts
// =============================================================================
// Figurpasset (beställning omgång 3, A3): den tredje passraden under dagens
// pass, bredvid textpasset och sifferpasset. Fyra figurserier, tre härnäst
// och en bryter mönstret, regeln förklarad efter varje svar. Inte i
// Nivåkollen och inte på skalan: matrisnivån och kurvan läser aldrig passet.
//
// Typerna, konstanterna och urvalet här är rena och får importeras av
// klienten och av vitest; motorn bor i pass-figur.server.ts.
// =============================================================================

import type { V7Cell } from '@/lib/logicTestV7/types.v7';
import type { SerieFamilj } from '@/lib/figurserierV1/familjer';
import type { SerieForm } from '@/lib/figurserierV1/types';
import type { Dag } from '@/lib/traning/datum';
import { arOsett, type Sedda } from './pass-urval';

export const FIGURPASS_TEST_TYPE = 'figurserie-pass';
export const FIGUR_ANTAL = 4;
/** Härnäst per pass när bryter mönstret når golvet; annars alla fyra. */
export const FIGUR_HARNAST = 3;
/** Provets tid per uppgift (A3: tempot mot budgeten 45 s per uppgift). */
export const FIGUR_BUDGET_PER_UPPGIFT_S = 45;
export const FIGUR_KARENS_DAGAR = 30;

export type FigurNiva = 'grund' | 'avancerad';

export function arFigurpassTestTyp(t: unknown): boolean {
  return t === FIGURPASS_TEST_TYPE;
}

/** En uppgift som klienten ser: utan facit, regel och misstag. */
export interface FigurUppgift {
  nyckel: string;
  form: SerieForm;
  rad: V7Cell[];
  options: V7Cell[];
}

export interface FigurAterkoppling {
  correct: boolean;
  /** Härnäst: visat index bland alternativen. Bryter: visat index i raden. */
  rattVisat: number;
  /** Hennes val (visat index), null för "Vet inte". */
  valtVisat: number | null;
  regel: string;
  misstag: string | null;
  familj: SerieFamilj;
}

export interface FigurTappad {
  familj: string;
  ratt: number;
  antal: number;
  andel: number;
}

export interface FigurResultat {
  ratt: number;
  antal: number;
  tid_s: number;
  budget_s: number;
  /** Familjerna hon tappade i, ackumulerat över figurpassen, svagast först. */
  tappade: FigurTappad[];
}

export interface FigurPassVy {
  id: string;
  niva: FigurNiva;
  upprepad: boolean;
  budget_s: number;
  startad: string;
  avslutad: boolean;
  /** Sitter på avancerad: "Expertnivån: gör nivåtestet". */
  expertRad: boolean;
  uppgifter: FigurUppgift[];
  besvarade: Record<string, { visat: number | null; tid_s: number }>;
  aterkoppling: Record<string, FigurAterkoppling>;
  resultat: FigurResultat | null;
}

/** Bästa slutförda klassiska figurserier-grund i procent, null utan försök. */
export function bastaFigurGrundProcent(
  rader: readonly { test_type: string | null; meta: unknown; score?: number | null; completed_at: string | null }[]
): number | null {
  let bast: number | null = null;
  for (const r of rader) {
    if (!r.completed_at || r.test_type !== 'figurserier-grund' || typeof r.score !== 'number') continue;
    const antal = Number((r.meta as { antal?: unknown } | null)?.antal) || 15;
    const p = Math.max(0, Math.min(100, Math.round((r.score / antal) * 100)));
    bast = bast == null ? p : Math.max(bast, p);
  }
  return bast;
}

/* ---------------------------------- Urval --------------------------------- */

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function blandaSeedat<T>(lista: readonly T[], seed: string): T[] {
  const rng = mulberry32(hash(seed));
  const ut = [...lista];
  for (let i = ut.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [ut[i], ut[j]] = [ut[j], ut[i]];
  }
  return ut;
}

/**
 * n frågor ur poolen: osedda (karens 30 dagar) seedat först, därefter de äldst
 * sedda (B2-mekanismen). `upprepad` när någon av dem var sedd inom karensen.
 */
export function valjFigurer(
  pool: readonly { id: string }[],
  n: number,
  sedda: Sedda,
  idag: Dag,
  seed: string,
  utom: ReadonlySet<string> = new Set()
): { ids: string[]; upprepad: boolean } {
  const kandidater = pool.filter((p) => !utom.has(p.id));
  const blandad = blandaSeedat(kandidater, seed);
  const osedda = blandad.filter((p) => arOsett(p.id, sedda, idag));
  const sett = blandad
    .filter((p) => !arOsett(p.id, sedda, idag))
    .sort((a, b) => {
      const da = sedda.get(a.id) ?? '';
      const db = sedda.get(b.id) ?? '';
      return da < db ? -1 : da > db ? 1 : 0;
    });
  const ids = [...osedda, ...sett].slice(0, n).map((p) => p.id);
  return { ids, upprepad: ids.some((id) => !arOsett(id, sedda, idag)) };
}

/** Passets fyra: tre härnäst och en bryter sist, eller fyra härnäst under golvet. */
export function valjFigurpass(args: {
  harnast: readonly { id: string }[];
  bryter: readonly { id: string }[];
  sedda: Sedda;
  idag: Dag;
  seed: string;
}): { ids: string[]; upprepad: boolean } {
  const medBryter = args.bryter.length > 0;
  const h = valjFigurer(args.harnast, medBryter ? FIGUR_HARNAST : FIGUR_ANTAL, args.sedda, args.idag, `${args.seed}:h`);
  if (!medBryter) return h;
  const b = valjFigurer(args.bryter, 1, args.sedda, args.idag, `${args.seed}:b`);
  return { ids: [...h.ids, ...b.ids], upprepad: h.upprepad || b.upprepad };
}
