// /api/traning/uppvarmning: provdagens tre uppvärmningsfrågor (1d).
// Sparas inte. Frågorna seedas på konto och dag, alternativen blandas med
// samma funktion som i testerna (seed = uppvarmning:<konto>:<dag> + frågans
// id), och servern dömer.
//
// GET  -> {fragor: VisadFraga[]} (utan facit)
// POST {questionId, selectedIndex} -> {correct, rattVisat, regel}

import { NextResponse } from 'next/server';
import { bedomSvar } from '@/lib/logicTestV7/fragor.server';
import { genomgaFraga, visaFraga } from '@/lib/logicTestV7/visning';
import { bankInfo, hittaTraningsfraga } from '@/lib/traning/bank.server';
import { dagSthlm } from '@/lib/traning/datum';
import { uppvarmningsSeed } from '@/lib/traning/motor.server';
import { valjUppvarmning } from '@/lib/traning/passgenerator';
import { fel, inloggad, lasKropp } from '@/lib/traning/rutt.server';

function dagensFragor(userId: string) {
  const seed = uppvarmningsSeed(userId, dagSthlm());
  const ids = valjUppvarmning(bankInfo(), seed);
  return { seed, ids };
}

export async function GET() {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const { seed, ids } = dagensFragor(a.userId);
  const fragor = ids
    .map((id) => hittaTraningsfraga(id))
    .filter((q): q is NonNullable<typeof q> => !!q)
    .map((q) => visaFraga(q, seed, true));
  return NextResponse.json({ fragor });
}

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const k = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  const { seed, ids } = dagensFragor(a.userId);
  if (typeof k.questionId !== 'string' || !ids.includes(k.questionId)) return fel(400, 'fel_fraga');
  const q = hittaTraningsfraga(k.questionId);
  if (!q) return fel(404, 'fraga_saknas');
  const bedomt = bedomSvar(q, seed, true, k.selectedIndex);
  if (!bedomt) return fel(400, 'ogiltigt_svar');
  return NextResponse.json({
    correct: bedomt.correct,
    rattVisat: genomgaFraga(q, seed, true).rattVisat,
    regel: q.rule,
  });
}
