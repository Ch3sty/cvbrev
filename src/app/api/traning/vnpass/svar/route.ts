// /api/traning/vnpass/svar
//
// POST {sessionId, nyckel, svar, tid}
//   Rättar ett svar i ett text- eller sifferpass och svarar med rätt svar
//   och förklaringen. Ett svar per uppgift.

import { NextResponse } from 'next/server';
import { svaraVnPass } from '@/lib/tester/pass.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const kropp = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof kropp.sessionId !== 'string') return fel(400, 'session_saknas');
  try {
    const r = await svaraVnPass({ admin: a.admin, userId: a.userId, sessionId: kropp.sessionId, nyckel: kropp.nyckel, svar: kropp.svar, tid: kropp.tid });
    if (!r.ok) return fel(r.status, r.fel);
    const { ok: _ok, ...data } = r;
    return NextResponse.json(data);
  } catch (e) {
    return internt(e, 'vnpass/svar');
  }
}
