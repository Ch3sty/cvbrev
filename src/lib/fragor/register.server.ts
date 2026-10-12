// src/lib/fragor/register.server.ts
// =============================================================================
// Registret över alla frågor i alla banker (beställningen omgång 3, B3):
// test_kind, id, nivå, familj, p_prior och bankfil. Admin Frågor läser det
// mot fraga_kalibrering_vy och fraga_statistik. Id:t är samma nyckel som
// statistiken använder:
//   matris      frågans id (v7g-..., v7a-..., v7e-...)
//   figurserie  fs-<g|a|e>-...
//   deduktiv    dd-<g|a|e>-...
//   verbal      "<textens id>:<påståendets index>" (grund och avancerad),
//               frågans id (expert, argumentationsanalys)
//   numerisk    frågans id
// Bara serverkod: bankerna har facit.
// =============================================================================

import 'server-only';
import { ALLA_GRUND, ALLA_AVANCERAD, ALLA_EXPERT } from '@/lib/logicTestV7/selectQuestions.v7';
import { allaFigurFragor as allaSerier } from '@/lib/figurserierV1/select';
import { allaFragor as allaDeduktiva } from '@/lib/deduktivV1/select';
import { POOL_V4 as VERBAL_GRUND } from '@/lib/verbalTestV1/selectPassages.v1';
import { POOL_V4 as VERBAL_AVANCERAD } from '@/lib/verbalTestV2/selectPassages.v2';
import { getAllPassages as verbalExpert } from '@/lib/verbalTestExpert/validator';
import { getAllPassages as numGrund } from '@/lib/numericalTest/validator';
import { getAllPassages as numAvancerad } from '@/lib/numericalTestV2/validator';
import { getAllPassages as numExpert } from '@/lib/numericalTestExpert/validator';
import { PRIOR_P, lasPPrior, svarighetPrior } from '@/lib/traning/svarighet';
import type { Band } from '@/lib/kalibrering/flaggor';

export const TEST_KINDS = ['matris', 'figurserie', 'verbal', 'numerisk', 'deduktiv'] as const;
export type TestKind = (typeof TEST_KINDS)[number];

/** Testtypernas namn i gränssnittet (copy-omgang3.md 5.4). */
export const TEST_KIND_NAMN: Record<TestKind, string> = {
  matris: 'Matriser',
  figurserie: 'Figurserier',
  verbal: 'Verbalt',
  numerisk: 'Numeriskt',
  deduktiv: 'Deduktiv slutledning',
};

export type Niva = 'grund' | 'avancerad' | 'expert';

export interface RegisterRad {
  test_kind: TestKind;
  id: string;
  niva: Niva;
  /** Bandet kalibreringen mäter mot: nivån, eller plus för matrisernas plus-frågor. */
  band: Band;
  familj: string | null;
  p_prior: number;
  bankfil: string;
  pensionerad: boolean;
}

export function arTestKind(v: unknown): v is TestKind {
  return typeof v === 'string' && (TEST_KINDS as readonly string[]).includes(v);
}

const prior = (pPrior: unknown, difficulty: unknown) => lasPPrior(pPrior) ?? PRIOR_P[svarighetPrior(difficulty)];

type Matris = { id: string; difficulty?: number; family?: string; p_prior?: number; band?: string; pensionerad?: boolean; pensionerad_fran?: number };
type Text = { id: string; difficulty?: number; p_prior?: number; statements: { typ?: string }[] };
type Underlag = {
  id: string;
  difficulty?: number;
  p_prior?: number;
  questions: { id: string; difficulty?: number; options?: { misstag?: { typ?: string } }[] }[];
};

function bygg(): RegisterRad[] {
  const ut: RegisterRad[] = [];
  const matris = (lista: readonly unknown[], niva: Niva, fil: string) => {
    for (const q of lista as Matris[]) {
      ut.push({
        test_kind: 'matris',
        id: q.id,
        niva,
        band: q.band === 'plus' ? 'plus' : niva,
        familj: q.family ?? null,
        p_prior: prior(q.p_prior, q.difficulty),
        bankfil: fil,
        pensionerad: q.pensionerad === true || q.pensionerad_fran != null,
      });
    }
  };
  matris(ALLA_GRUND, 'grund', 'src/lib/logicTestV7 (grund)');
  matris(ALLA_AVANCERAD, 'avancerad', 'src/lib/logicTestV7 (avancerad)');
  matris(ALLA_EXPERT, 'expert', 'src/lib/logicTestV7 (expert)');

  for (const q of allaSerier()) {
    ut.push({ test_kind: 'figurserie', id: q.id, niva: q.niva, band: q.niva, familj: q.family, p_prior: q.p_prior, bankfil: `src/lib/figurserierV1/bank (${q.niva})`, pensionerad: (q as { pensionerad_fran?: number }).pensionerad_fran != null });
  }
  for (const q of allaDeduktiva()) {
    ut.push({ test_kind: 'deduktiv', id: q.id, niva: q.niva, band: q.niva, familj: q.family, p_prior: q.p_prior, bankfil: `src/lib/deduktivV1/bank (${q.niva})`, pensionerad: false });
  }

  const verbal = (lista: readonly unknown[], niva: Niva, fil: string) => {
    for (const t of lista as Text[]) {
      t.statements.forEach((s, i) => {
        ut.push({ test_kind: 'verbal', id: `${t.id}:${i}`, niva, band: niva, familj: s.typ ?? null, p_prior: prior(t.p_prior, t.difficulty), bankfil: fil, pensionerad: false });
      });
    }
  };
  verbal(VERBAL_GRUND, 'grund', 'src/lib/verbalTestV1');
  verbal(VERBAL_AVANCERAD, 'avancerad', 'src/lib/verbalTestV2');

  const underlag = (lista: readonly unknown[], kind: TestKind, niva: Niva, fil: string) => {
    for (const p of lista as Underlag[]) {
      for (const q of p.questions ?? []) {
        const familj = q.options?.map((o) => o.misstag?.typ).find((t): t is string => typeof t === 'string') ?? null;
        ut.push({ test_kind: kind, id: q.id, niva, band: niva, familj, p_prior: prior(p.p_prior, q.difficulty ?? p.difficulty), bankfil: fil, pensionerad: false });
      }
    }
  };
  underlag(verbalExpert(3), 'verbal', 'expert', 'src/lib/verbalTestExpert');
  underlag(numGrund(3), 'numerisk', 'grund', 'src/lib/numericalTest');
  underlag(numAvancerad(3), 'numerisk', 'avancerad', 'src/lib/numericalTestV2');
  underlag(numExpert(), 'numerisk', 'expert', 'src/lib/numericalTestExpert');

  // Samma id två gånger (en fråga i två filer): den första vinner.
  const sedda = new Set<string>();
  return ut.filter((r) => {
    const k = `${r.test_kind}:${r.id}`;
    if (sedda.has(k)) return false;
    sedda.add(k);
    return true;
  });
}

let cache: RegisterRad[] | null = null;

export function register(): RegisterRad[] {
  if (!cache) cache = bygg();
  return cache;
}

/** Testtypen för ett id som inte står i registret: prefixet avgör, annars matris. */
export function kindForId(id: string): TestKind {
  if (id.startsWith('fs-')) return 'figurserie';
  if (id.startsWith('dd-')) return 'deduktiv';
  const r = register().find((x) => x.id === id);
  return r?.test_kind ?? 'matris';
}
