// /api/traning/nivakoll/session
//
// POST {kind}
//   Startar Nivåkollen för figurserier, deduktivt, verbalt eller numeriskt
//   (testplanen steg 1), eller återupptar dagens. 200 {session: NivakollVy}.
//   402 med featureRequiredBody när en ny Nivåkoll kräver tests_above_base.
//
// GET ?id=<uuid>
//   Nivåkollen i klientens form; genomgången och resultatet när den är avslutad.

import { NextResponse } from 'next/server';
import { featureRequiredBody } from '@/lib/quota/quotaService';
import { suggestPlan } from '@/lib/access/features';
import { hamtaNivakoll, nivakollVy, skapaNivakoll } from '@/lib/nivakoll/motor.server';
import { arNivakollKind, NIVAKOLL_TEST_TYPE } from '@/lib/nivakoll/niva';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const k = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (!arNivakollKind(k.kind)) return fel(400, 'ogiltig_typ');
  try {
    const r = await skapaNivakoll({ supabase: a.supabase, admin: a.admin, userId: a.userId, kind: k.kind });
    if (r.ok) return NextResponse.json({ session: r.vy });
    if (r.status === 402) {
      return NextResponse.json(
        featureRequiredBody('tests_above_base', suggestPlan('tests_above_base', null), { testType: NIVAKOLL_TEST_TYPE[k.kind] }),
        { status: 402 }
      );
    }
    return fel(r.status, r.fel);
  } catch (e) {
    return internt(e, 'nivakoll/session POST');
  }
}

export async function GET(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return fel(400, 'id_saknas');
  try {
    const rad = await hamtaNivakoll(a.admin, a.userId, id);
    const vy = rad ? nivakollVy(rad) : null;
    if (!vy) return fel(404, 'session_saknas');
    return NextResponse.json({ session: vy });
  } catch (e) {
    return internt(e, 'nivakoll/session GET');
  }
}
