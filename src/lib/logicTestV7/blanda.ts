// src/lib/logicTestV7/blanda.ts
// =============================================================================
// Seedad blandning av svarsalternativen, per session och fråga.
//
// Varför: i V7-bankerna låg rätt svar på index 0 i 81 av 84 frågor. Urvalet
// av frågor var slumpat, men alternativens ordning var fast, så den som
// märkte mönstret fick alltid rätt (docs/design/spec-rummen-2026-10-10.md,
// avsnitt 12.3).
//
// Regler:
// - Ordningen härleds ur seed = sessionId + ':' + frågans id (i smakprovet
//   token i stället för sessionId). Samma seed ger alltid samma ordning, så
//   testvyn, en omladdning, svar-API:t och resultatsidan ser samma sak.
// - `permutation[visatIndex] = originalIndex`. Lagring, rättning och all
//   statistik sker på originalindex; visat index är bara vad hon såg.
// - Sessioner utan flaggan `meta.alternativ_blandade` (allt före fixen) får
//   identitetsordningen, så gamla resultat ritas och rättas som förut.
//
// Filen är ren (ingen frågebank, inga nätverksanrop) och får importeras från
// både server och klient.
// =============================================================================

/** FNV-1a: sträng till 32-bitars heltal. Samma som urvalet använder. */
export function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mulberry32, liten deterministisk PRNG. Samma som urvalet använder. */
export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeden för en fråga i en session (eller ett smakprov, med token). */
export function alternativSeed(sessionId: string, questionId: string): string {
  return `${sessionId}:${questionId}`;
}

/** Identitetsordningen: det gamla beteendet, för oblandade sessioner. */
export function identitet(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

/**
 * Fisher-Yates över alternativens index, seedat på `seed`.
 * Returnerar `permutation[visatIndex] = originalIndex`.
 */
export function blandadPermutation(seed: string, n: number): number[] {
  const perm = identitet(n);
  const rng = mulberry32(hashString(seed));
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return perm;
}

/**
 * Blandar alternativen i en fråga. `options` kommer i visad ordning och
 * `permutation[visat] = original`.
 */
export function blandaAlternativ<T>(
  seed: string,
  q: { options: readonly T[] }
): { options: T[]; permutation: number[] } {
  const permutation = blandadPermutation(seed, q.options.length);
  return { options: permutation.map((orig) => q.options[orig]), permutation };
}

/**
 * Permutationen för en fråga i en given session. Oblandade sessioner (före
 * fixen, eller skapade utan flaggan) får identiteten.
 */
export function permutationForSession(
  sessionId: string,
  q: { id: string; options: readonly unknown[] },
  blandade: boolean
): number[] {
  return blandade
    ? blandadPermutation(alternativSeed(sessionId, q.id), q.options.length)
    : identitet(q.options.length);
}

/** Visat index till originalindex. -1 om indexet ligger utanför. */
export function tillOriginal(permutation: readonly number[], visat: number): number {
  return Number.isInteger(visat) && visat >= 0 && visat < permutation.length
    ? permutation[visat]
    : -1;
}

/** Originalindex till visat index. -1 om det inte finns. */
export function tillVisat(permutation: readonly number[], original: number): number {
  return permutation.indexOf(original);
}

/** Läser flaggan ur sessionens meta. Saknas den är sessionen oblandad. */
export function arBlandad(meta: unknown): boolean {
  if (
    !!meta &&
    typeof meta === 'object' &&
    (meta as Record<string, unknown>).alternativ_blandade === true
  ) {
    return true;
  }
  return qaBlandaAlla();
}

/**
 * Bara för klicktest mot en lokal dev-server innan migreringen körts:
 * QA_BLANDA_ALLA_SESSIONER=1 behandlar varje session som blandad. Går aldrig
 * att slå på i ett produktionsbygge (NODE_ENV är då 'production').
 */
function qaBlandaAlla(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    process.env.QA_BLANDA_ALLA_SESSIONER === '1'
  );
}

/** Meta som sätts på varje ny session från och med fixen. */
export const BLANDAD_META = { alternativ_blandade: true } as const;

/**
 * Det visade indexet för ett sparat svar. Nya svar har `visat`; gamla svar
 * (oblandade sessioner) har bara `selected`, och där är visat = original.
 */
export function visatForSvar(a: { selected?: unknown; visat?: unknown } | null | undefined): number | null {
  if (!a) return null;
  if (typeof a.visat === 'number') return a.visat;
  if (typeof a.selected === 'number') return a.selected;
  return null;
}
