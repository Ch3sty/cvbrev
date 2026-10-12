// /api/traning/vnpass/slutfor
//
// POST {sessionId}
//   Avslutar ett text- eller sifferpass: rätt, tid, "Var du tappade" och
//   frågestatistiken. Svarar med passet i klientens form, resultatet med.

import { NextResponse } from 'next/server';
import { slutforVnPass } from '@/lib/tester/pass.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const kropp = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof kropp.sessionId !== 'string') return fel(400, 'session_saknas');
  try {
    const r = await slutforVnPass({ admin: a.admin, userId: a.userId, sessionId: kropp.sessionId });
    if (!r.ok) return fel(r.status, r.fel);
    return NextResponse.json({ session: r.vy });
  } catch (e) {
    return internt(e, 'vnpass/slutfor');
  }
}
