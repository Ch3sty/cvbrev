// /api/traning/pass/session
//
// POST {typ: 'matning' | 'pass' | 'riktat' | 'general', family?, format?}
//   Skapar en träningssession: gate (gratisnivån och paketet), kvot och
//   sammansättning. En mätning när en redan finns blir en ommätning.
//   200 {session: Sessionsvy}. 402 med featureRequiredBody (betalväggen),
//   429 med quotaExceededBody (grundpasset i dag är gjort), 422 när banken
//   inte räcker (riktat pass i en familj med för få frågor).
//
// GET ?id=<uuid>
//   Sessionen i klientens form, för att återuppta: frågorna i blandad
//   ordning utan facit, svaren som visat index, återkopplingen i pass, och
//   genomgången först när sessionen är avslutad.

import { NextResponse } from 'next/server';
import { featureRequiredBody, nextMidnightStockholm, quotaExceededBody } from '@/lib/quota/quotaService';
import { signalQuotaWall } from '@/lib/quota/quotaWallSignal';
import { suggestPlan } from '@/lib/access/features';
import { hamtaSession, sessionsvy, skapaTraningssession } from '@/lib/traning/motor.server';
import { PROVFORMAT, type FormatNyckel } from '@/lib/traning/tempo';
import { TEST_TYPE, type Begard } from '@/lib/traning/tillgang';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';
import { paketKort } from '@/lib/plans/plans';

const BEGARDA: readonly Begard[] = ['matning', 'pass', 'riktat', 'general'];

const KVOT_TEXT = `Dagens grundpass är gjort. Nästa i morgon, eller köp ${paketKort()} för passet på din nivå.`;

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const kropp = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  const typ = kropp.typ as Begard;
  if (!BEGARDA.includes(typ)) return fel(400, 'ogiltig_typ');
  const family = typeof kropp.family === 'string' ? kropp.family : null;
  const formatNyckel = typeof kropp.format === 'string' && kropp.format in PROVFORMAT ? (kropp.format as FormatNyckel) : null;

  try {
    const r = await skapaTraningssession({
      supabase: a.supabase,
      admin: a.admin,
      userId: a.userId,
      begard: typ,
      family,
      format: typ === 'general' && formatNyckel ? PROVFORMAT[formatNyckel] : null,
    });
    if (r.ok) return NextResponse.json({ session: r.vy });

    const b = r.beslut;
    if (b && !b.tillatet && b.skal === 'betalvagg') {
      return NextResponse.json(
        featureRequiredBody(b.feature, suggestPlan(b.feature, null), { testType: TEST_TYPE[b.typ], typ: b.typ }),
        { status: 402 }
      );
    }
    if (b && !b.tillatet && b.skal === 'kvot') {
      const feature = `test:${TEST_TYPE.pass}`;
      signalQuotaWall(a.userId, feature);
      return NextResponse.json(
        quotaExceededBody(
          feature,
          { allowed: false, isPremium: false, used: b.anvant, limit: b.grans, nextResetAt: nextMidnightStockholm().toISOString() },
          KVOT_TEXT
        ),
        { status: 429 }
      );
    }
    return fel(r.status, r.fel);
  } catch (e) {
    return internt(e, 'pass/session POST');
  }
}

export async function GET(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return fel(400, 'id_saknas');
  try {
    const rad = await hamtaSession(a.admin, a.userId, id);
    const vy = rad ? sessionsvy(rad) : null;
    if (!vy) return fel(404, 'session_saknas');
    return NextResponse.json({ session: vy });
  } catch (e) {
    return internt(e, 'pass/session GET');
  }
}
