// src/lib/traning/niva.ts
// =============================================================================
// Nivån 1 till 10 (spec-rummen 6 våg 3a, briefen avsnitt 5).
//
// Testansvarig äger formeln. Det här är byggets version som uppfyller specens
// krav, så att 3b kan visa en nivå; byt innehållet i funktionerna, inte deras
// form, när testansvarigs formel kommer.
//
// Modellen, i en mening var:
// - En fråga ligger på nivå b = 1 + 9 × (1 − p) (svarighet.ts).
// - Chansen att någon på nivå θ klarar en fråga på nivå b är
//   1 / (1 + e^−(θ − b)): hälften på sin egen nivå, oftare under, sällan över.
// - Mätningen (beraknaNiva): nivån är den θ där du väntas klara lika många
//   av de frågor du fick som du faktiskt klarade. Ett halvt rätt svar på nivå
//   5,5 läggs till som stöd, så att alla rätt eller alla fel ger en ändlig
//   nivå. Fler rätt ger alltid högre nivå, och samma antal rätt på svårare
//   frågor ger högre nivå. (Mätningen är adaptiv: den som svarar rätt får
//   svårare frågor, så vägen dit räknas genom vilka frågor hon fick.)
// - Passet (passUppdatering): varje fråga flyttar nivån med
//   K × (utfall − väntat utfall). Rätt på en sträckuppgift lyfter mycket, fel
//   på den sänker lite; fel på en säker uppgift sänker mycket. Summan har tak
//   ±0,5 per pass, så nivån inte fladdrar. Det är ett glidande medel: nivån
//   rör sig mot det passet visar, aldrig hela vägen på en gång.
// - Tolv mätfrågor ger en punkt med vikt 1: mätningen ersätter nivån helt.
//   Färre besvarade mätfrågor väger n/12.
// - Nivån visas med en decimal och har tak 7,5 tills
//   BANK_KALIBRERAD_OVER_7_5 är sann.
// =============================================================================

import { nivaTak } from './flaggor';
import { nivaForP } from './svarighet';

export const NIVA_MIN = 1;
export const NIVA_MAX = 10;
/** Antal mätfrågor som ger en punkt med vikt 1. */
export const MATNING_ANTAL = 12;
/** Passets steg per fråga, i nivåer per (utfall − väntat). */
export const PASS_K = 0.1;
/** Största förflyttning per pass. */
export const PASS_TAK = 0.5;
/** Stödet i mätningen: ett halvt rätt svar på den här nivån. */
export const STOD_NIVA = 5.5;
export const STOD_VIKT = 1;

export interface NivaSvar {
  /** Frågans andel rätt (uppmätt eller prior). */
  p: number;
  /** Rätt svar. "Vet inte" räknas som fel. */
  correct: boolean;
}

/** En decimal, som nivån visas och lagras (numeric(3,1)). */
export function avrunda(niva: number): number {
  return Math.round(niva * 10) / 10;
}

function begransa(niva: number, tak = nivaTak()): number {
  return Math.min(tak, Math.max(NIVA_MIN, niva));
}

/** Chansen att klara en fråga med andel rätt p för någon på nivån. */
export function chansRatt(niva: number, p: number): number {
  return 1 / (1 + Math.exp(-(niva - nivaForP(p))));
}

/**
 * Nivån ur ett antal svar: den nivå där väntat antal rätt är lika med
 * faktiskt antal rätt (med stödet). Ger nivån med en decimal, inom 1 till
 * taket. Tom lista ger stödnivån.
 */
export function beraknaNiva(svar: readonly NivaSvar[]): number {
  const observerat = svar.reduce((s, x) => s + (x.correct ? 1 : 0), 0) + STOD_VIKT / 2;
  const f = (theta: number) =>
    svar.reduce((s, x) => s + chansRatt(theta, x.p), 0) +
    STOD_VIKT / (1 + Math.exp(-(theta - STOD_NIVA))) -
    observerat;

  // f är strängt växande i theta. Bisektion över ett brett intervall, sedan
  // tak och golv.
  let lo = -5;
  let hi = 16;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid;
    else hi = mid;
  }
  return avrunda(begransa((lo + hi) / 2));
}

export interface Nivaresultat {
  niva: number;
  /** niva - fore, en decimal. 0 när det inte fanns någon nivå före. */
  delta: number;
}

/**
 * Mätningen och ommätningen. Tolv svar ger vikt 1 (nivån ersätts), färre
 * väger n/12 mot nivån före. Utan nivå före gäller mätningen helt.
 */
export function matningsNiva(svar: readonly NivaSvar[], fore?: number | null): Nivaresultat {
  const matt = beraknaNiva(svar);
  if (fore == null) return { niva: matt, delta: 0 };
  const vikt = Math.min(1, svar.length / MATNING_ANTAL);
  const niva = avrunda(begransa(fore + vikt * (matt - fore)));
  return { niva, delta: avrunda(niva - fore) };
}

/**
 * Passet och generalrepetitionen: K × (rätt − väntat) per fråga, tak ±0,5.
 * Väntat räknas på nivån före passet.
 */
export function passUppdatering(fore: number, svar: readonly NivaSvar[]): Nivaresultat & { vantat: number } {
  let summa = 0;
  let vantat = 0;
  for (const x of svar) {
    const c = chansRatt(fore, x.p);
    vantat += c;
    summa += (x.correct ? 1 : 0) - c;
  }
  const steg = Math.max(-PASS_TAK, Math.min(PASS_TAK, PASS_K * summa));
  const niva = avrunda(begransa(fore + steg));
  return { niva, delta: avrunda(niva - fore), vantat: Math.round(vantat * 10) / 10 };
}

/**
 * Föreslaget sikte efter mätningen (M1: "Siktet är vårt förslag"). Byggets
 * förslag, testansvarig äger det: en tiondel per dag till provet, högst 1,5
 * över nivån, utan datum 1,0; aldrig över taket.
 * Exemplet: 5,0 med 18 dagar kvar ger 6,5.
 */
export function foreslaSikte(niva: number, dagarKvar: number | null): number {
  const tillagg = dagarKvar == null ? 1 : Math.min(1.5, Math.max(0.5, dagarKvar * 0.1));
  return avrunda(begransa(niva + tillagg));
}
