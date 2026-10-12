// src/lib/tester/pass-urval.ts
// =============================================================================
// Urvalet för text- och sifferpassen (beställning omgång 2, B2). Rent, så att
// regler och vitest delar samma kod; banken och de sedda underlagen kommer
// som argument.
//
// - Nivån: grund tills bästa klassiska grundresultatet är minst
//   SITTER_PROCENT, därefter avancerad. Expert har ingen passform.
// - Exponering: inget underlag två gånger på VN_KARENS_DAGAR dagar, räknat
//   över pass, riktat pass, klassiska test, provet och övningsprovet
//   (sedda.server.ts). Räcker banken inte: det äldst sedda först, och passet
//   markeras upprepat (räknas inte i frågestatistiken).
// - Riktat pass: underlag med typen (pass-bank harFamilj). Färre än
//   VN_RIKTAT_MINST_OSEDDA osedda inom nivån döljer familjen.
// =============================================================================

import { dagarMellan, type Dag } from '@/lib/traning/datum';
import { SITTER_PROCENT } from './resultat';
import { VN_KARENS_DAGAR, VN_RIKTAT_MINST_OSEDDA, type VnNiva } from './pass-typer';

/** Senast sedd dag per underlags-id. */
export type Sedda = ReadonlyMap<string, Dag>;

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

/** Passets nivå ur det bästa klassiska grundresultatet i procent (null utan försök). */
export function passNiva(bastaGrundProcent: number | null): VnNiva {
  return bastaGrundProcent != null && bastaGrundProcent >= SITTER_PROCENT ? 'avancerad' : 'grund';
}

/** Är underlaget osett inom karensen? */
export function arOsett(id: string, sedda: Sedda, idag: Dag): boolean {
  const dag = sedda.get(id);
  return !dag || dagarMellan(dag, idag) > VN_KARENS_DAGAR;
}

/**
 * Ett underlag ur poolen: ett osett, seedat, annars det äldst sedda
 * (upprepat). Null bara när poolen är tom.
 *
 * foredra (riktat pass, omgång 3 B2): finns osedda underlag som uppfyller
 * den dras ett av dem, annars ett av de övriga osedda. Verbalt: texter med
 * två påståenden av familjens typ (parti 04) före texter med ett.
 */
export function valjUnderlag(args: {
  pool: readonly { id: string }[];
  sedda: Sedda;
  idag: Dag;
  seed: string;
  foredra?: (id: string) => boolean;
}): { id: string; upprepad: boolean } | null {
  const { pool, sedda, idag } = args;
  if (pool.length === 0) return null;
  const allaOsedda = pool.filter((p) => arOsett(p.id, sedda, idag));
  const forst = args.foredra ? allaOsedda.filter((p) => args.foredra!(p.id)) : [];
  const osedda = forst.length > 0 ? forst : allaOsedda;
  if (osedda.length > 0) {
    const rng = mulberry32(hash(args.seed));
    return { id: osedda[Math.floor(rng() * osedda.length)].id, upprepad: false };
  }
  // Det äldst sedda; lika gamla i poolens ordning.
  const aldst = [...pool].sort((a, b) => {
    const da = sedda.get(a.id) ?? '';
    const db = sedda.get(b.id) ?? '';
    return da < db ? -1 : da > db ? 1 : 0;
  })[0];
  return { id: aldst.id, upprepad: true };
}

/**
 * Familjerna som har ett riktat pass inom nivån: minst
 * VN_RIKTAT_MINST_OSEDDA osedda underlag med typen.
 */
export function riktadeFamiljer(args: {
  familjer: readonly string[];
  pool: readonly { id: string }[];
  harFamilj: (id: string, familj: string) => boolean;
  sedda: Sedda;
  idag: Dag;
}): { familj: string; osedda: number }[] {
  return args.familjer
    .map((familj) => ({
      familj,
      osedda: args.pool.filter((p) => args.harFamilj(p.id, familj) && arOsett(p.id, args.sedda, args.idag)).length,
    }))
    .filter((f) => f.osedda >= VN_RIKTAT_MINST_OSEDDA);
}

/** Var hon tappade: rätt och antal per familj, bara familjer med missar, svagast först. */
export function tappadeFamiljer(
  svar: readonly { familj: string | null; correct: boolean }[],
  max = 3
): { familj: string; ratt: number; antal: number; andel: number }[] {
  const per = new Map<string, { ratt: number; antal: number }>();
  for (const s of svar) {
    if (!s.familj) continue;
    const f = per.get(s.familj) ?? { ratt: 0, antal: 0 };
    f.antal += 1;
    if (s.correct) f.ratt += 1;
    per.set(s.familj, f);
  }
  return [...per.entries()]
    .map(([familj, f]) => ({ familj, ...f, andel: f.antal ? f.ratt / f.antal : 0 }))
    .filter((f) => f.ratt < f.antal)
    .sort((a, b) => a.andel - b.andel || b.antal - a.antal)
    .slice(0, max);
}
