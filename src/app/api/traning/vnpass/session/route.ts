// /api/traning/vnpass/session
//
// POST {kind: 'verbal' | 'numerisk', familj?}
//   Skapar ett textpass eller sifferpass, eller ett riktat pass när familj
//   anges (beställning omgång 2, B3). Ett påbörjat pass av samma slag i dag
//   återupptas. 200 {session: VnPassVy}. 403 med featureRequiredBody för
//   gratis (test_daily_pass), 422 när typen har för få osedda underlag.
//
// GET ?id=<uuid>
//   Passet i klientens form: underlaget och uppgifterna utan facit, svaren
//   med rätt svar och förklaring, resultatet när det är avslutat.

import { NextResponse } from 'next/server';
import { featureRequiredBody } from '@/lib/quota/quotaService';
import { suggestPlan } from '@/lib/access/features';
import { hamtaVnPass, skapaVnPass, vnPassVy } from '@/lib/tester/pass.server';
import { VN_PASS_TEST_TYPE, type VnKind } from '@/lib/tester/pass-typer';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const kropp = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  const kind = kropp.kind as VnKind;
  if (kind !== 'verbal' && kind !== 'numerisk') return fel(400, 'ogiltig_typ');
  const familj = typeof kropp.familj === 'string' && kropp.familj ? kropp.familj : null;
  try {
    const r = await skapaVnPass({ supabase: a.supabase, admin: a.admin, userId: a.userId, kind, familj });
    if (r.ok) return NextResponse.json({ session: r.vy });
    if (r.status === 403) {
      return NextResponse.json(
        featureRequiredBody('test_daily_pass', suggestPlan('test_daily_pass', null), {
          testType: VN_PASS_TEST_TYPE[kind][familj ? 'riktat' : 'pass'],
        }),
        { status: 403 }
      );
    }
    return fel(r.status, r.fel);
  } catch (e) {
    return internt(e, 'vnpass/session POST');
  }
}

export async function GET(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return fel(400, 'id_saknas');
  try {
    const rad = await hamtaVnPass(a.admin, a.userId, id);
    const vy = rad ? vnPassVy(rad) : null;
    if (!vy) return fel(404, 'session_saknas');
    return NextResponse.json({ session: vy });
  } catch (e) {
    return internt(e, 'vnpass/session GET');
  }
}
