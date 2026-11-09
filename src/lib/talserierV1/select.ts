// src/lib/talserierV1/select.ts
// =============================================================================
// Urvalet: 15 uppgifter ur nivåns pool, seedat på sessionId (samma mekanik som
// figurserierna och deduktivt), med ett tak: högst fem av samma regelfamilj
// per session (TS8). Test- och resultatsida härleder samma urval.
//
// Poolen en session drar ur får aldrig ändras; nya uppgifter läggs till med
// ny TALSERIE_VERSION (meta.talserie_version) och gamla pensioneras med
// pensionerad_fran. Bara serverkod: bankerna har facit.
// =============================================================================

import grund from './bankGrund.json';
import avancerad from './bankAvancerad.json';
import expert from './bankExpert.json';
import { hashString, mulberry32 } from '@/lib/logicTestV7/blanda';
import type { TalserieFraga, TalserieNiva } from './types';

export const FRAGOR_PER_SESSION = 15;
export const TALSERIE_VERSION = 1;
/** Högst så många av samma regelfamilj i ett urval (TS8). */
export const MAX_PER_FAMILJ = 5;
/** Ungefärlig tid för nivåtestet (briefen avsnitt 3). */
export const TIDSGRANS_S: Record<TalserieNiva, number> = { grund: 12 * 60, avancerad: 15 * 60, expert: 18 * 60 };
/** Tid per uppgift i provformat (I-prov), läses av passets tidsrad. */
export const SEKUNDER_PER_UPPGIFT = 60;

const BANK: Record<TalserieNiva, TalserieFraga[]> = {
  grund: grund as unknown as TalserieFraga[],
  avancerad: avancerad as unknown as TalserieFraga[],
  expert: expert as unknown as TalserieFraga[],
};

export function talserieVersion(meta: unknown): number {
  const v = (meta as { talserie_version?: unknown } | null)?.talserie_version;
  return typeof v === 'number' ? v : TALSERIE_VERSION;
}

export function poolFor(niva: TalserieNiva, version: number = TALSERIE_VERSION): TalserieFraga[] {
  return BANK[niva].filter((q) => q.fran_version <= version && (!q.pensionerad_fran || q.pensionerad_fran > version));
}

export function allaTalserier(): TalserieFraga[] {
  return (['grund', 'avancerad', 'expert'] as const).flatMap((n) => BANK[n]);
}

/** Seedad Fisher-Yates och sedan familjetaket: hoppar över en uppgift vars familj redan har fem. */
export function valjTalserier(
  niva: TalserieNiva,
  sessionId: string,
  antal = FRAGOR_PER_SESSION,
  version: number = TALSERIE_VERSION
): TalserieFraga[] {
  const a = [...poolFor(niva, version)];
  const rng = mulberry32(hashString(sessionId));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const ut: TalserieFraga[] = [];
  const per = new Map<string, number>();
  for (const q of a) {
    if (ut.length >= antal) break;
    const n = per.get(q.family) ?? 0;
    if (n >= MAX_PER_FAMILJ) continue;
    per.set(q.family, n + 1);
    ut.push(q);
  }
  return ut;
}
