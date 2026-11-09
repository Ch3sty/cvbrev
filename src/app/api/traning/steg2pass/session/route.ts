// /api/traning/steg2pass/session
//
// POST {kind, grupp?}
//   Skapar dagens pass i talserier eller spatial förmåga (testplanen steg 2),
//   eller återupptar ett påbörjat från i dag. grupp ger ett riktat pass.
//   200 {session: Steg2PassVy}. 403 med featureRequiredBody för gratis
//   (test_daily_pass). 404 när typen inte syns än.
//
// GET ?id=<uuid>
//   Passet i klientens form.

import { NextResponse } from 'next/server';
import { featureRequiredBody } from '@/lib/quota/quotaService';
import { suggestPlan } from '@/lib/access/features';
import { hamtaSteg2Pass, skapaSteg2Pass, steg2PassVy } from '@/lib/tester/steg2/pass.server';
import { STEG2_PASS_TEST_TYPE, type Steg2PassKind } from '@/lib/tester/steg2/pass';
import { steg2Synlig } from '@/lib/tester/steg2Status';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const kropp = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  const kind = kropp.kind;
  if ((kind !== 'talserie' && kind !== 'spatial' && kind !== 'ordforrad') || !steg2Synlig(kind)) return fel(404, 'okand_typ');
  try {
    const grupp = typeof kropp.grupp === 'string' && kropp.grupp.length <= 40 ? kropp.grupp : null;
    const r = await skapaSteg2Pass({ supabase: a.supabase, admin: a.admin, userId: a.userId, kind, grupp });
    if (r.ok) return NextResponse.json({ session: r.vy });
    if (r.status === 403) {
      return NextResponse.json(featureRequiredBody('test_daily_pass', suggestPlan('test_daily_pass', null), { testType: STEG2_PASS_TEST_TYPE[kind as Steg2PassKind] }), { status: 403 });
    }
    return fel(r.status, r.fel);
  } catch (e) {
    return internt(e, 'steg2pass/session POST');
  }
}

export async function GET(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return fel(400, 'id_saknas');
  try {
    const rad = await hamtaSteg2Pass(a.admin, a.userId, id);
    const vy = rad ? steg2PassVy(rad) : null;
    if (!vy) return fel(404, 'session_saknas');
    return NextResponse.json({ session: vy });
  } catch (e) {
    return internt(e, 'steg2pass/session GET');
  }
}
