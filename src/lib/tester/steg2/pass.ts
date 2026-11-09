// src/lib/tester/steg2/pass.ts
// =============================================================================
// Passen för testplanens steg 2 (brief-tester-steg2 avsnitt 2.4 och skissen):
// talseriepasset och spatialpasset. Sex uppgifter, en i taget, och
// genomgången (rätt svar, förklaringen och misstaget) efter varje svar. Lugn
// tidsrad mot provets tid per uppgift, ingen nedräkning. Kräver
// test_daily_pass som de andra passen. Matrisnivån och kurvan läser aldrig
// passen; dagsringen, serien och Pass per testtyp räknar dem.
//
// Rena typer och konstanter: får importeras av klienten och vitest. Motorn
// bor i pass.server.ts.
// =============================================================================

export type Steg2PassKind = 'talserie' | 'spatial' | 'ordforrad';

export const STEG2_PASS_TEST_TYPE: Record<Steg2PassKind, string> = {
  talserie: 'talserie-pass',
  spatial: 'spatial-pass',
  ordforrad: 'ordforrad-pass',
};

export const STEG2_PASS_ANTAL = 6;

export function arSteg2PassTestTyp(t: unknown): boolean {
  return typeof t === 'string' && Object.values(STEG2_PASS_TEST_TYPE).includes(t);
}

export function steg2PassKind(t: unknown): Steg2PassKind | null {
  const e = Object.entries(STEG2_PASS_TEST_TYPE).find(([, v]) => v === t);
  return e ? (e[0] as Steg2PassKind) : null;
}

export type Steg2PassNiva = 'grund' | 'avancerad';

export interface Steg2Aterkoppling {
  correct: boolean;
  rattVisat: number;
  /** Hennes val (visat index), null för "Vet inte". */
  valtVisat: number | null;
  /** Genomgången av uppgiften: motorns genomgång (regel, bågar, uppvikning, misstag). */
  genomgang: unknown;
  grupp: string | null;
}

export interface Steg2Tappad {
  familj: string;
  ratt: number;
  antal: number;
  andel: number;
}

export interface Steg2PassResultat {
  ratt: number;
  antal: number;
  tid_s: number;
  budget_s: number;
  /** Grupperna hon tappade i, ackumulerat över passen, svagast först. */
  tappade: Steg2Tappad[];
}

export interface Steg2PassVy {
  id: string;
  kind: Steg2PassKind;
  niva: Steg2PassNiva;
  /** Riktat pass: gruppens nyckel (regelfamilj eller form), annars null. */
  grupp: string | null;
  upprepad: boolean;
  budget_s: number;
  startad: string;
  avslutad: boolean;
  uppgifter: ({ nyckel: string } & Record<string, unknown>)[];
  besvarade: Record<string, { visat: number | null; tid_s: number }>;
  aterkoppling: Record<string, Steg2Aterkoppling>;
  resultat: Steg2PassResultat | null;
}

/** Bästa slutförda grundtest i procent, null utan försök. */
export function bastaGrundProcent(
  rader: readonly { test_type: string | null; meta: unknown; score?: number | null; completed_at: string | null }[],
  grundSlug: string
): number | null {
  let bast: number | null = null;
  for (const r of rader) {
    if (!r.completed_at || r.test_type !== grundSlug || typeof r.score !== 'number') continue;
    const antal = Number((r.meta as { antal?: unknown } | null)?.antal) || 15;
    const p = Math.max(0, Math.min(100, Math.round((r.score / antal) * 100)));
    bast = bast == null ? p : Math.max(bast, p);
  }
  return bast;
}
