// src/lib/traning/testplan.ts
// =============================================================================
// Validering av test_planer-skrivningarna (PUT /api/traning/plan, POST
// /api/traning/sikte, POST /api/traning/efter-provet) och regeln för när
// frågan "Hur gick det?" ställs. Ren.
// =============================================================================

import { arGiltigDag, dagarMellan, laggTill, type Dag } from './datum';
import { nivaTak } from './flaggor';

export const TESTTYPER = ['matris', 'numerisk', 'verbal', 'personlighet'] as const;
export const LEVERANTORER = ['matrigma', 'alva', 'shl', 'aon', 'annat'] as const;
export const VARIANTER = ['klassisk', 'adaptiv'] as const;
export const UTFALL = ['vidare', 'vet_inte', 'inte_vidare'] as const;

export type Utfall = (typeof UTFALL)[number];

/** Tidpunkten för passet (riktlinjer-tester-v2 4.2): styr påminnelsemejlet. */
export const PASS_TIDER = ['morgon', 'lunch', 'kvall'] as const;
export type PassTid = (typeof PASS_TIDER)[number];

export function arPassTid(v: unknown): v is PassTid {
  return (PASS_TIDER as readonly unknown[]).includes(v);
}

/** Validerar POST /api/traning/pass-tid: en av de tre, eller null för att ta bort valet. */
export function validerPassTid(body: unknown): Validering<PassTid | null> {
  const v = (body as Record<string, unknown> | null)?.pass_tid;
  if (v === null) return { ok: true, data: null };
  return arPassTid(v) ? { ok: true, data: v } : { ok: false, fel: 'ogiltig_tid' };
}

/** Längsta tid framåt ett provdatum får sättas. */
export const PROVDATUM_MAX_DAGAR = 366;
/** Dagar innan "Hur gick det?" ställs igen efter "vet inte än". */
export const FRAGA_IGEN_EFTER_DAGAR = 7;

export interface PlanAndring {
  testtyper?: string[];
  leverantor?: string | null;
  variant?: string | null;
  provdatum?: Dag | null;
}

export type Validering<T> = { ok: true; data: T } | { ok: false; fel: string };

const har = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

/**
 * Validerar en PUT. Bara fälten som skickas ändras; null tar bort ett värde.
 * Ett provdatum får inte ligga före i dag eller mer än ett år fram.
 */
export function validerPlan(body: unknown, idag: Dag): Validering<PlanAndring> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, fel: 'ogiltig_kropp' };
  const b = body as Record<string, unknown>;
  const ut: PlanAndring = {};

  if (har(b, 'testtyper')) {
    if (!Array.isArray(b.testtyper) || !b.testtyper.every((t) => (TESTTYPER as readonly unknown[]).includes(t))) {
      return { ok: false, fel: 'ogiltiga_testtyper' };
    }
    ut.testtyper = [...new Set(b.testtyper as string[])];
  }
  if (har(b, 'leverantor')) {
    if (b.leverantor !== null && !(LEVERANTORER as readonly unknown[]).includes(b.leverantor)) {
      return { ok: false, fel: 'ogiltig_leverantor' };
    }
    ut.leverantor = b.leverantor as string | null;
  }
  if (har(b, 'variant')) {
    if (b.variant !== null && !(VARIANTER as readonly unknown[]).includes(b.variant)) {
      return { ok: false, fel: 'ogiltig_variant' };
    }
    ut.variant = b.variant as string | null;
  }
  if (har(b, 'provdatum')) {
    if (b.provdatum === null) ut.provdatum = null;
    else if (!arGiltigDag(b.provdatum)) return { ok: false, fel: 'ogiltigt_provdatum' };
    else {
      const n = dagarMellan(idag, b.provdatum);
      if (n < 0) return { ok: false, fel: 'provdatum_passerat' };
      if (n > PROVDATUM_MAX_DAGAR) return { ok: false, fel: 'provdatum_for_langt_fram' };
      ut.provdatum = b.provdatum;
    }
  }
  // Varianten gäller bara Matrigma.
  if (ut.leverantor !== undefined && ut.leverantor !== 'matrigma' && !har(b, 'variant')) ut.variant = null;
  if (Object.keys(ut).length === 0) return { ok: false, fel: 'inget_att_andra' };
  return { ok: true, data: ut };
}

/** Siktet: 1 till taket, en decimal. */
export function validerSikte(body: unknown): Validering<number> {
  const v = (body as Record<string, unknown> | null)?.niva;
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
  if (typeof n !== 'number' || !Number.isFinite(n)) return { ok: false, fel: 'ogiltig_niva' };
  const avrundad = Math.round(n * 10) / 10;
  if (avrundad < 1 || avrundad > nivaTak()) return { ok: false, fel: 'niva_utanfor_skalan' };
  return { ok: true, data: avrundad };
}

export interface UtfallAndring {
  utfall: Utfall;
  utfall_svarat_at: string;
  utfall_fraga_igen_at: Dag | null;
}

export function validerUtfall(body: unknown, idag: Dag, nu: Date = new Date()): Validering<UtfallAndring> {
  const u = (body as Record<string, unknown> | null)?.utfall;
  if (!(UTFALL as readonly unknown[]).includes(u)) return { ok: false, fel: 'ogiltigt_utfall' };
  return {
    ok: true,
    data: {
      utfall: u as Utfall,
      utfall_svarat_at: nu.toISOString(),
      utfall_fraga_igen_at: u === 'vet_inte' ? laggTill(idag, FRAGA_IGEN_EFTER_DAGAR) : null,
    },
  };
}

/**
 * Ska "Hur gick det?" ställas i dag? Dagen efter provet och framåt, när
 * inget svar finns; efter "vet inte än" igen från sju dagar efter svaret.
 * Aldrig efter "vidare" eller "inte vidare".
 */
export function fragaEfterProvet(
  plan: { provdatum: Dag | null; utfall: string | null; utfall_fraga_igen_at: Dag | null } | null,
  idag: Dag
): boolean {
  if (!plan?.provdatum || idag <= plan.provdatum) return false;
  if (!plan.utfall) return true;
  if (plan.utfall === 'vet_inte') return !!plan.utfall_fraga_igen_at && idag >= plan.utfall_fraga_igen_at;
  return false;
}
