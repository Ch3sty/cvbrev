// Samma blandning av svarsalternativ som src/lib/logicTestV7/blanda.ts, för
// valideringsskripten (som körs med node utan TypeScript). Vitest-testet
// src/lib/logicTestV7/__tests__/blanda-skript.test.ts håller de två lika.

export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** permutation[visat] = original, seedat på `${sessionId}:${frågans id}`. */
export function blandadPermutation(seed, n) {
  const perm = Array.from({ length: n }, (_, i) => i);
  const rng = mulberry32(hashString(seed));
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return perm;
}

export const alternativSeed = (sessionId, questionId) => `${sessionId}:${questionId}`;
