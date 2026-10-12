// src/lib/fragor/visning.server.ts
// =============================================================================
// Verbala och numeriska frågor i admin Frågor (beställningen omgång 3, B3):
// underlaget, påståendet eller frågan, facit, alternativen med misstag och
// förklaringen, uppslaget på statistikens id. Bara serverkod.
// =============================================================================

import 'server-only';
import { POOL_V4 as VERBAL_GRUND } from '@/lib/verbalTestV1/selectPassages.v1';
import { POOL_V4 as VERBAL_AVANCERAD } from '@/lib/verbalTestV2/selectPassages.v2';
import { getAllPassages as verbalExpert } from '@/lib/verbalTestExpert/validator';
import { getAllPassages as numGrund } from '@/lib/numericalTest/validator';
import { getAllPassages as numAvancerad } from '@/lib/numericalTestV2/validator';
import { getAllPassages as numExpert } from '@/lib/numericalTestExpert/validator';
import type { TestKind } from './register.server';

export interface Underlagsfraga {
  titel: string;
  text: string | null;
  tabell: unknown | null;
  fraga: string;
  facit: string | null;
  alternativ: { id: string; text: string; ratt: boolean; misstag: string | null }[] | null;
  forklaring: string | null;
}

type Text = { id: string; title: string; text: string; statements: { text: string; correctAnswer: string; explanation?: string; typ?: string }[] };
type Underlag = {
  id: string;
  title: string;
  contextText?: string;
  dataTable?: unknown;
  questions: { id: string; questionText: string; correctAnswerId: string; explanation?: string; options: { id: string; text: string; misstag?: { typ?: string } }[] }[];
};

export function hittaUnderlagsfraga(kind: TestKind, id: string): Underlagsfraga | null {
  if (kind === 'verbal') {
    const delning = id.lastIndexOf(':');
    if (delning > 0) {
      const textId = id.slice(0, delning);
      const i = Number(id.slice(delning + 1));
      const t = ([...VERBAL_GRUND, ...VERBAL_AVANCERAD] as unknown as Text[]).find((x) => x.id === textId);
      const s = t?.statements[i];
      if (t && s) return { titel: t.title, text: t.text, tabell: null, fraga: s.text, facit: s.correctAnswer, alternativ: null, forklaring: s.explanation ?? null };
    }
  }
  const lista: Underlag[] =
    kind === 'verbal'
      ? (verbalExpert(3) as unknown as Underlag[])
      : kind === 'numerisk'
        ? ([...numGrund(3), ...numAvancerad(3), ...numExpert()] as unknown as Underlag[])
        : [];
  for (const p of lista) {
    const q = p.questions?.find((x) => x.id === id);
    if (!q) continue;
    return {
      titel: p.title,
      text: p.contextText ?? null,
      tabell: p.dataTable ?? null,
      fraga: q.questionText,
      facit: null,
      alternativ: q.options.map((o) => ({ id: o.id, text: o.text, ratt: o.id === q.correctAnswerId, misstag: o.misstag?.typ ?? null })),
      forklaring: q.explanation ?? null,
    };
  }
  return null;
}
