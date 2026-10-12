// /api/traning/figurpass/slutfor
//
// POST {sessionId}
//   Avslutar figurpasset: rätt, tid, "Var du tappade" och frågestatistiken.
//   Svarar med passet i klientens form, resultatet med.

import { NextResponse } from 'next/server';
import { slutforFigurPass } from '@/lib/tester/pass-figur.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const kropp = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof kropp.sessionId !== 'string') return fel(400, 'session_saknas');
  try {
    const r = await slutforFigurPass({ admin: a.admin, userId: a.userId, sessionId: kropp.sessionId });
    if (!r.ok) return fel(r.status, r.fel);
    return NextResponse.json({ session: r.vy });
  } catch (e) {
    return internt(e, 'figurpass/slutfor');
  }
}
