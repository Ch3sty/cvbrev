// src/lib/traning/strack.ts
// =============================================================================
// Sträck- och golvregeln mellan passen (tillägget om variation 1.3). Passet
// är inte adaptivt; svårigheten flyttas mellan passen:
//
// - Sträck: gav de två senaste passen (dagens pass eller riktat pass) båda
//   minst 8 av 9 på frågorna som räknas, riktas dagens pass STEG_UPP (0,5)
//   över nivån oavsett tema, och över-bandet dras ur frågor med p minst 0,25
//   under nivåns p. meta.strack sätts, och raden efter passet säger det.
// - Golv: gav förra passet högst 3 av 9 riktas dagens pass 0,5 under nivån
//   och under-bandet får tre frågor. Ingen text; passet ska kännas möjligt.
// - Taket 7,5 gäller. Riktade pass omfattas inte (de styrs av familjen).
//
// Frågorna som räknas är passets urval utan upprepade och utan
// kalibreringsfrågan, samma som nivån räknar (motor.server.ts).
//
// Ren, så att regeln kan testas utan databasen.
// =============================================================================

import { lasSvar, type SessionRad, type SlutfordRad } from './historik';

/** Andel rätt som räknas som "minst 8 av 9" och "högst 3 av 9". */
export const STRACK_ANDEL = 8 / 9;
export const GOLV_ANDEL = 3 / 9;

/** Rätt av räknade frågor i ett avslutat pass. Null när inget räknas. */
export function passUtfall(rad: SlutfordRad, sessioner: readonly SessionRad[]): { ratt: number; antal: number } | null {
  const meta = rad.meta;
  const upprepade = new Set(meta.upprepade ?? []);
  const raknas = new Set((meta.fragor ?? []).filter((id) => !upprepade.has(id) && id !== meta.kalibrering));
  if (raknas.size === 0) return null;
  const svar = lasSvar(sessioner.find((s) => s.id === rad.id)?.answers);
  const ratt = svar.filter((s) => raknas.has(s.q_id) && s.correct).length;
  return { ratt, antal: raknas.size };
}

/**
 * Regeln för dagens pass, ur de avslutade sessionerna (äldst först) och
 * deras rader med svar. 'strack', 'golv' eller null.
 */
export function strackEllerGolv(slutforda: readonly SlutfordRad[], sessioner: readonly SessionRad[]): 'strack' | 'golv' | null {
  const pass = slutforda.filter((s) => s.typ === 'pass' || s.typ === 'riktat');
  const utfall = pass.map((p) => passUtfall(p, sessioner)).filter((x): x is { ratt: number; antal: number } => x !== null);
  const sista = utfall.slice(-2);
  if (sista.length === 2 && sista.every((u) => u.ratt / u.antal >= STRACK_ANDEL - 1e-9)) return 'strack';
  const forra = utfall[utfall.length - 1];
  if (forra && forra.ratt / forra.antal <= GOLV_ANDEL + 1e-9) return 'golv';
  return null;
}
