// /api/traning/deduktivpass/session
//
// POST {}
//   Skapar dagens deduktivpass (testplanen steg 1), eller återupptar ett
//   påbörjat från i dag. 200 {session: DeduktivPassVy}. 403 med
//   featureRequiredBody för gratis (test_daily_pass).
//
// GET ?id=<uuid>
//   Passet i klientens form: uppgifterna utan facit, svaren med regel och
//   misstag, resultatet när det är avslutat.

import { NextResponse } from 'next/server';
import { featureRequiredBody } from '@/lib/quota/quotaService';
import { suggestPlan } from '@/lib/access/features';
import { deduktivPassVy, hamtaDeduktivPass, skapaDeduktivPass } from '@/lib/tester/pass-deduktiv.server';
import { DEDUKTIVPASS_TEST_TYPE } from '@/lib/tester/pass-deduktiv';
import { fel, inloggad, internt } from '@/lib/traning/rutt.server';

export async function POST() {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  try {
    const r = await skapaDeduktivPass({ supabase: a.supabase, admin: a.admin, userId: a.userId });
    if (r.ok) return NextResponse.json({ session: r.vy });
    if (r.status === 403) {
      return NextResponse.json(featureRequiredBody('test_daily_pass', suggestPlan('test_daily_pass', null), { testType: DEDUKTIVPASS_TEST_TYPE }), { status: 403 });
    }
    return fel(r.status, r.fel);
  } catch (e) {
    return internt(e, 'deduktivpass/session POST');
  }
}

export async function GET(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return fel(400, 'id_saknas');
  try {
    const rad = await hamtaDeduktivPass(a.admin, a.userId, id);
    const vy = rad ? deduktivPassVy(rad) : null;
    if (!vy) return fel(404, 'session_saknas');
    return NextResponse.json({ session: vy });
  } catch (e) {
    return internt(e, 'deduktivpass/session GET');
  }
}
