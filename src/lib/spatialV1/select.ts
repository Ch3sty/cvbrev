// src/lib/spatialV1/select.ts
// =============================================================================
// Urvalet för Spatial förmåga (briefen avsnitt 2): 15 uppgifter per nivåtest,
// fem per form, blandade men aldrig två av samma form i följd. Seedat på
// sessionId som figurserierna, så att test- och resultatsida härleder samma
// urval. Poolen en session drar ur ändras aldrig: nya uppgifter kommer med ny
// SPATIAL_VERSION (meta.spatial_version), gamla pensioneras med
// pensionerad_fran. Bara serverkod: bankerna har facit.
//
// valjForm() är urvalet för passen och I-prov-provet (en form, till exempel
// B utan klipp eller C), med samma seedning.
// =============================================================================

import grund from './bankGrund.json';
import avancerad from './bankAvancerad.json';
import expert from './bankExpert.json';
import { hashString, mulberry32 } from '@/lib/logicTestV7/blanda';
import type { SpatialForm, SpatialFraga, SpatialNiva } from './types';

export const FRAGOR_PER_SESSION = 15;
export const PER_FORM = 5;
export const SPATIAL_VERSION = 1;
export const FORMER: SpatialForm[] = ['A', 'B', 'C'];
/** Ungefärlig tid för nivåtestet (briefen avsnitt 2). */
export const TIDSGRANS_S: Record<SpatialNiva, number> = { grund: 12 * 60, avancerad: 15 * 60, expert: 18 * 60 };
/** Tid per uppgift i provformat (briefen avsnitt 2.4), läses av passets tidsrad. */
export const SEKUNDER_PER_UPPGIFT: Record<SpatialForm, number> = { A: 30, B: 45, C: 45 };

const BANK: Record<SpatialNiva, SpatialFraga[]> = {
  grund: grund as unknown as SpatialFraga[],
  avancerad: avancerad as unknown as SpatialFraga[],
  expert: expert as unknown as SpatialFraga[],
};

export function spatialVersion(meta: unknown): number {
  const v = (meta as { spatial_version?: unknown } | null)?.spatial_version;
  return typeof v === 'number' ? v : SPATIAL_VERSION;
}

export function poolFor(niva: SpatialNiva, version: number = SPATIAL_VERSION): SpatialFraga[] {
  return BANK[niva].filter((q) => q.fran_version <= version && (!q.pensionerad_fran || q.pensionerad_fran > version));
}

export function allaSpatial(): SpatialFraga[] {
  return (['grund', 'avancerad', 'expert'] as const).flatMap((n) => BANK[n]);
}

function blanda<T>(a: T[], rng: () => number): T[] {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

/** En form ur nivåns pool (pass, riktade pass, I-prov-provets deltest). `klipp` filtrerar form B. */
export function valjForm(
  niva: SpatialNiva,
  form: SpatialForm,
  seed: string,
  antal: number,
  opts: { klipp?: boolean; version?: number } = {}
): SpatialFraga[] {
  const pool = poolFor(niva, opts.version).filter((q) => q.form === form && (opts.klipp === undefined || !!q.klipp === opts.klipp));
  return blanda(pool, mulberry32(hashString(`${seed}:${form}`))).slice(0, antal);
}

/** Nivåtestet: fem per form, aldrig två av samma form i följd. */
export function valjSpatial(niva: SpatialNiva, sessionId: string, version: number = SPATIAL_VERSION): SpatialFraga[] {
  const rng = mulberry32(hashString(sessionId));
  const perForm = new Map(FORMER.map((f) => [f, valjForm(niva, f, sessionId, PER_FORM, { version })]));
  const ut: SpatialFraga[] = [];
  let forra: SpatialForm | null = null;
  for (let varv = 0; varv < PER_FORM; varv++) {
    let ordning = blanda(FORMER, rng).filter((f) => (perForm.get(f)?.length ?? 0) > varv);
    if (ordning.length > 1 && ordning[0] === forra) ordning = [...ordning.slice(1), ordning[0]];
    for (const f of ordning) {
      ut.push(perForm.get(f)![varv]);
      forra = f;
    }
  }
  return ut;
}
