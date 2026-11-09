// /api/traning/iprov/session
//
// POST {halvt}
//   Skapar övningsprovet för I-prov 2025, eller återupptar ett påbörjat.
//   Kräver test_exam_mode (403 med featureRequiredBody annars). 404 när
//   provet inte syns än (steg2Status).
//
// GET ?id=<uuid>
//   Provet i klientens form: deltesten, svaren och, efter avslutat prov,
//   resultatet och genomgången.

import { NextResponse } from 'next/server';
import { featureRequiredBody } from '@/lib/quota/quotaService';
import { suggestPlan } from '@/lib/access/features';
import { hamtaIprov, iprovVy, skapaIprov } from '@/lib/tester/steg2/iprov.server';
import { IPROV_TEST_TYPE } from '@/lib/tester/steg2/iprov';
import { iprovProvSynligt } from '@/lib/tester/steg2Status';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  if (!iprovProvSynligt()) return fel(404, 'saknas');
  const kropp = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  try {
    const { data: plan } = await a.admin.from('test_planer').select('mitt_test_variant').eq('user_id', a.userId).maybeSingle();
    const r = await skapaIprov({ supabase: a.supabase, admin: a.admin, userId: a.userId, halvt: kropp.halvt !== false, variant: (plan as { mitt_test_variant?: string | null } | null)?.mitt_test_variant ?? null });
    if (r.ok) return NextResponse.json({ session: r.vy });
    if (r.status === 403) {
      return NextResponse.json(featureRequiredBody('test_exam_mode', suggestPlan('test_exam_mode', null), { testType: IPROV_TEST_TYPE }), { status: 403 });
    }
    return fel(r.status, r.fel);
  } catch (e) {
    return internt(e, 'iprov/session POST');
  }
}

export async function GET(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return fel(400, 'id_saknas');
  try {
    const rad = await hamtaIprov(a.admin, a.userId, id);
    const vy = rad ? iprovVy(rad) : null;
    if (!vy) return fel(404, 'session_saknas');
    return NextResponse.json({ session: vy });
  } catch (e) {
    return internt(e, 'iprov/session GET');
  }
}
