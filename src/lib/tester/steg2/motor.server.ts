// src/lib/tester/steg2/motor.server.ts
// =============================================================================
// Testplanens steg 2: en gemensam väg från motorerna (src/lib/talserierV1,
// src/lib/spatialV1 och, när den finns, ordförrådet) till rutterna och
// vyerna. Motorerna äger bankerna, urvalet, rättningen och statistiken;
// den här filen ger dem samma form, så att nivåtestets rutter
// (/api/steg2/[kind]), passet och I-prov-provet inte behöver en gren per typ.
//
// Talserierna blandar aldrig alternativen (sorterade som en tallinje), så
// visat index är originalindex. Spatial förmåga blandar per session.
// Bara serverkod: bankerna har facit.
// =============================================================================

import 'server-only';
import { arBlandad } from '@/lib/logicTestV7/blanda';
import type { Steg2Kind } from '@/app/dashboard/tester/testConfig';
import * as T from '@/lib/talserierV1/fragor.server';
import { poolFor as talPool, TALSERIE_VERSION, SEKUNDER_PER_UPPGIFT as TAL_S } from '@/lib/talserierV1/select';
import type { TalserieFraga } from '@/lib/talserierV1/types';
import * as S from '@/lib/spatialV1/fragor.server';
import { poolFor as spatialPool, SPATIAL_VERSION, SEKUNDER_PER_UPPGIFT as SPATIAL_S } from '@/lib/spatialV1/select';
import type { SpatialFraga } from '@/lib/spatialV1/types';
import { FAMILJ_NAMN, FORM_NAMN } from './namn';

export type Niva = 'grund' | 'avancerad' | 'expert';

export interface Bedomt {
  selected: number;
  visat: number;
  correct: boolean;
}

export interface Svar {
  q_id: string;
  selected: number;
  correct: boolean;
  time_spent?: number;
}

export interface Steg2Motor {
  kind: Steg2Kind;
  arTestTyp(t: unknown): boolean;
  nivaFor(testType: string): Niva;
  meta(testType: string): Record<string, unknown>;
  innehall(session: { id: string; test_type?: string | null; meta?: unknown; completed_at?: string | null }): {
    fragor: unknown[];
    genomgang: unknown[] | null;
  };
  /** Uppgiften som klienten ser i ett pass eller prov, seedad på passets id. */
  visa(id: string, seed: string): unknown | null;
  /** Genomgången av en uppgift, seedad på samma id. */
  genomga(id: string, seed: string): { rattVisat: number; misstag: string[] } & Record<string, unknown>;
  bedom(id: string, seed: string, meta: unknown, visat: unknown): Bedomt | null;
  ratta(answers: readonly unknown[]): number;
  statistik(answers: readonly { q_id: string; correct: boolean; time_spent?: number; selected: number }[]): unknown[];
  /** Gruppen uppgiften räknas i för "Var du tappar" (regelfamilj eller uppgiftsform), i klartext. */
  grupp(id: string): string | null;
  /** Gruppens nyckel (familj eller form), för riktade pass. */
  gruppNyckel(id: string): string | null;
  /** Nivåns pool för passet. */
  pool(niva: Niva): { id: string }[];
  /** Provets tid per uppgift i sekunder. */
  budget(id: string): number;
  version: number;
}

const talserie: Steg2Motor = {
  kind: 'talserie',
  arTestTyp: T.arTalserieTestTyp,
  nivaFor: (t) => t.replace(/^talserier-/, '') as Niva,
  meta: (t) => T.talserieMeta(t.replace(/^talserier-/, '') as Niva),
  innehall: T.talserieInnehall,
  visa: (id) => {
    const q = T.hittaTalserie(id);
    return q ? T.visaTalserie(q) : null;
  },
  genomga: (id) => T.genomgaTalserie(T.hittaTalserie(id) as TalserieFraga) as never,
  bedom: (id, _seed, _meta, visat) => {
    const q = T.hittaTalserie(id);
    return q ? T.bedomTalserieSvar(q, visat) : null;
  },
  ratta: T.rattaTalserieSvar,
  statistik: T.talserieStatistik,
  grupp: (id) => {
    const q = T.hittaTalserie(id);
    return q ? FAMILJ_NAMN[q.family] ?? q.family : null;
  },
  gruppNyckel: (id) => T.hittaTalserie(id)?.family ?? null,
  pool: (n) => talPool(n),
  budget: () => TAL_S,
  version: TALSERIE_VERSION,
};

const spatial: Steg2Motor = {
  kind: 'spatial',
  arTestTyp: S.arSpatialTestTyp,
  nivaFor: (t) => t.replace(/^spatial-/, '') as Niva,
  meta: (t) => S.spatialMeta(t.replace(/^spatial-/, '') as Niva),
  innehall: S.spatialInnehall,
  visa: (id, seed) => {
    const q = S.hittaSpatial(id);
    return q ? S.visaSpatial(q, seed, true) : null;
  },
  genomga: (id, seed) => S.genomgaSpatial(S.hittaSpatial(id) as SpatialFraga, seed, true) as never,
  bedom: (id, seed, meta, visat) => {
    const q = S.hittaSpatial(id);
    return q ? S.bedomSpatialSvar(q, seed, meta === true ? true : arBlandad(meta), visat) : null;
  },
  ratta: S.rattaSpatialSvar,
  statistik: S.spatialStatistik,
  grupp: (id) => {
    const q = S.hittaSpatial(id);
    if (!q) return null;
    return q.form === 'B' && q.klipp ? FORM_NAMN.Bklipp : FORM_NAMN[q.form];
  },
  gruppNyckel: (id) => S.hittaSpatial(id)?.form ?? null,
  pool: (n) => spatialPool(n),
  budget: (id) => SPATIAL_S[S.hittaSpatial(id)?.form ?? 'A'],
  version: SPATIAL_VERSION,
};

const MOTORER: Partial<Record<Steg2Kind, Steg2Motor>> = { talserie, spatial };

export function steg2Motor(kind: unknown): Steg2Motor | null {
  return typeof kind === 'string' ? MOTORER[kind as Steg2Kind] ?? null : null;
}

/** Motorn för en test_type (nivåtestets slug), eller null. */
export function steg2MotorForTestTyp(testType: unknown): Steg2Motor | null {
  return Object.values(MOTORER).find((m) => m!.arTestTyp(testType)) ?? null;
}
