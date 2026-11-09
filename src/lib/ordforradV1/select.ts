// src/lib/ordforradV1/select.ts
// =============================================================================
// Urvalet för ordförråd (briefen avsnitt 4): 20 uppgifter per nivåtest, tio
// synonymer och tio motsatsord i block om fem, så att frågetypen bara byter
// tre gånger. Seedat på sessionId; test- och resultatsida härleder samma
// urval. valjTyp() är urvalet för I-prov-provets deltest (synonymer, motsatsord)
// och passen. Poolen ändras aldrig för en befintlig session: nya uppgifter får
// ny ORD_VERSION, gamla pensioneras med pensionerad_fran. Bara serverkod.
// =============================================================================

import grund from './bankGrund.json';
import avancerad from './bankAvancerad.json';
import expert from './bankExpert.json';
import { hashString, mulberry32 } from '@/lib/logicTestV7/blanda';
import type { OrdFraga, OrdNiva, OrdTyp } from './types';

export const FRAGOR_PER_SESSION = 20;
export const BLOCK = 5;
export const ORD_VERSION = 1;
/** Ungefärlig tid för nivåtestet (briefen avsnitt 4). */
export const TIDSGRANS_S: Record<OrdNiva, number> = { grund: 8 * 60, avancerad: 10 * 60, expert: 12 * 60 };
/** Tid per uppgift i provformat. */
export const SEKUNDER_PER_UPPGIFT = 20;

const BANK: Record<OrdNiva, OrdFraga[]> = {
  grund: grund as unknown as OrdFraga[],
  avancerad: avancerad as unknown as OrdFraga[],
  expert: expert as unknown as OrdFraga[],
};

export function ordVersion(meta: unknown): number {
  const v = (meta as { ord_version?: unknown } | null)?.ord_version;
  return typeof v === 'number' ? v : ORD_VERSION;
}

export function poolFor(niva: OrdNiva, version: number = ORD_VERSION): OrdFraga[] {
  return BANK[niva].filter((q) => q.fran_version <= version && (!q.pensionerad_fran || q.pensionerad_fran > version));
}

export function allaOrd(): OrdFraga[] {
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

/** En typ ur nivåns pool (I-prov-provets deltest, passen). `undvik` är id som visats nyligen (30 dagar). */
export function valjTyp(niva: OrdNiva, typ: OrdTyp, seed: string, antal: number, opts: { undvik?: ReadonlySet<string>; version?: number } = {}): OrdFraga[] {
  const pool = poolFor(niva, opts.version).filter((q) => q.typ === typ);
  const ordning = blanda(pool, mulberry32(hashString(`${seed}:${typ}`)));
  const farska = ordning.filter((q) => !opts.undvik?.has(q.id));
  return [...farska, ...ordning.filter((q) => opts.undvik?.has(q.id))].slice(0, antal);
}

/** Nivåtestet: tio av varje typ, i block om fem som växlar (synonym eller motsats först, seedat). */
export function valjOrd(niva: OrdNiva, sessionId: string, version: number = ORD_VERSION): OrdFraga[] {
  const halva = FRAGOR_PER_SESSION / 2;
  const syn = valjTyp(niva, 'synonym', sessionId, halva, { version });
  const ant = valjTyp(niva, 'antonym', sessionId, halva, { version });
  const forst = mulberry32(hashString(sessionId))() < 0.5;
  const [a, b] = forst ? [syn, ant] : [ant, syn];
  const ut: OrdFraga[] = [];
  for (let i = 0; i < halva; i += BLOCK) ut.push(...a.slice(i, i + BLOCK), ...b.slice(i, i + BLOCK));
  return ut;
}
