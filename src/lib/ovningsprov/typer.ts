// src/lib/ovningsprov/typer.ts
// =============================================================================
// Övningsprovets klientform för verbalt och numeriskt (riktlinjer-tester-v2
// 1.9). Inget facit lämnar servern förrän provet är avslutat: under provet
// får klienten texterna och underlagen, påståendena och frågorna med
// alternativ, och de egna svaren. Genomgången och resultatet kommer först
// efter avslutet.
// =============================================================================

import type { Ovningsformat } from './format';

export type OvningsTyp = 'verbal' | 'numerisk' | 'figurer';

/** test_type i logic_test_v4_sessions. Logikens övningsprov är matrislogik-general. */
export const OVNINGSPROV_TEST_TYPE: Readonly<Record<OvningsTyp, string>> = {
  verbal: 'verbal-general',
  numerisk: 'numerisk-general',
  /** Figurseriernas övningsprov (beställning omgång 3, A4). */
  figurer: 'figurserie-prov',
};

export const OVNINGSPROV_TEST_TYPER = ['verbal-general', 'numerisk-general', 'figurserie-prov'] as const;

export function arOvningsprovTestTyp(t: unknown): boolean {
  return typeof t === 'string' && (OVNINGSPROV_TEST_TYPER as readonly string[]).includes(t);
}

/** Svarsvärdena i verbalt, samma som bankens correctAnswer. */
export type VerbaltSvar = 'true' | 'false' | 'cannot_say';

export interface VerbalDel {
  id: string;
  titel: string;
  text: string;
  /** Påståendena i ordning, utan facit. */
  pastaenden: string[];
}

export interface NumeriskFraga {
  id: string;
  text: string;
  /** Alternativen i sessionens blandade ordning, utan facit. */
  alternativ: { id: string; text: string }[];
}

export interface NumeriskDel {
  id: string;
  titel: string;
  kontext: string;
  tabell: { headers: string[]; rows: (string | number)[][]; caption?: string; highlightLastRow?: boolean } | null;
  diagram: unknown | null;
  fragor: NumeriskFraga[];
}

/**
 * En figurserie i provet (omgång 3, A4): härnäst med raden och sex alternativ
 * i sessionens blandade ordning, eller bryter mönstret med de sex figurerna
 * blandade. Utan facit, regel och misstag.
 */
export interface FigurDel {
  id: string;
  form: 'harnast' | 'bryter';
  rad: import('@/lib/logicTestV7/types.v7').V7Cell[];
  options: import('@/lib/logicTestV7/types.v7').V7Cell[];
}

/** En uppgift i provet, i ordning: del (text eller underlag) och punkt i delen. */
export interface Punkt {
  /** "delId:index" (verbalt) eller "delId:frågeId" (numeriskt). */
  nyckel: string;
  del: string;
  /** Verbalt: påståendets index. Numeriskt: frågans id. */
  punkt: string;
  /** Delens nummer, ettbaserat. */
  delNr: number;
  /** Punktens nummer i delen, ettbaserat. */
  iDel: number;
}

export interface Genomgangspunkt {
  nyckel: string;
  /** Hennes svar, null när obesvarad. Verbalt: true/false/cannot_say, numeriskt alternativets id. */
  svar: string | null;
  ratt: string;
  korrekt: boolean;
  forklaring: string | null;
  tid_s: number;
  /** Figurserier: misstaget för hennes val, null när rätt eller obesvarad. */
  misstag?: string | null;
}

export interface Ovningsresultat {
  ratt: number;
  antal: number;
  obesvarade: number;
  /** Väggklocka från start till inlämning, högst provets tid. */
  tid_s: number;
  /** Lämnades provet in av klockan? */
  avTiden: boolean;
  /** Per text eller underlag: rätt, antal, tid mot delens budget. */
  delar: { id: string; titel: string; ratt: number; antal: number; obesvarade: number; tid_s: number; budget_s: number }[];
  /** Var hon tappade: verbalt per svarstyp, numeriskt per underlagets typ. Bara grupper med missar, svagast först. */
  tappade: { namn: string; ratt: number; antal: number }[];
}

export interface Ovningsvy {
  id: string;
  typ: OvningsTyp;
  format: Ovningsformat;
  /** Sessionens start (started_at), klockan räknas härifrån. */
  startad: string;
  tidsgrans_s: number;
  avslutad: boolean;
  delar: VerbalDel[] | NumeriskDel[] | FigurDel[];
  punkter: Punkt[];
  /** Hennes svar per punktnyckel. */
  svar: Record<string, string>;
  /** Tid per punkt i sekunder, som klienten skickat (summerad över besöken). */
  tider: Record<string, number>;
  /** Efter avslutet. */
  genomgang: Genomgangspunkt[] | null;
  resultat: Ovningsresultat | null;
}
