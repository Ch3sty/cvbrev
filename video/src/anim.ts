import { Easing, interpolate } from 'remotion';

export const FPS = 30;
export const SEK = 30; // videons längd i sekunder

// Designsystemets kurva (avsnitt 8): ease-out cubic-bezier(.2,.7,.2,1).
export const UT = Easing.bezier(0.2, 0.7, 0.2, 1);
// Pilens vridning, filmens enda ease-in-out.
export const IN_UT = Easing.bezier(0.45, 0, 0.55, 1);
export const LINJAR = (x: number) => x;

/** 0 till 1 mellan start och start + langd (sekunder). */
export const ramp = (t: number, start: number, langd: number, easing: (x: number) => number = UT) =>
  interpolate(t, [start, start + langd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Tonar in vid `in` och ut vid `ut` (300 ms linjärt som standard). */
export const synlig = (t: number, inTid: number, utTid = Infinity, langd = 0.3) =>
  Math.min(ramp(t, inTid, langd, LINJAR), 1 - ramp(t, utTid, langd, LINJAR));

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** Landning: glider uppåt `px` och tonar in, 200 ms. */
export const landa = (t: number, start: number, px = 8, langd = 0.2) => {
  const p = ramp(t, start, langd);
  return { opacity: ramp(t, start, langd, LINJAR), transform: `translateY(${(1 - p) * px}px)` };
};

export const mellan = (t: number, start: number, slut: number) => t >= start && t < slut;
