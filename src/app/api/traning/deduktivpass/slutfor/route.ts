// /api/traning/deduktivpass/slutfor
//
// POST {sessionId}
//   Avslutar deduktivpasset: rätt, tid, "Var du tappade" och frågestatistiken.
//   Svarar med passet i klientens form, resultatet med.

import { NextResponse } from 'next/server';
import { slutforDeduktivPass } from '@/lib/tester/pass-deduktiv.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const kropp = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof kropp.sessionId !== 'string') return fel(400, 'session_saknas');
  try {
    const r = await slutforDeduktivPass({ admin: a.admin, userId: a.userId, sessionId: kropp.sessionId });
    if (!r.ok) return fel(r.status, r.fel);
    return NextResponse.json({ session: r.vy });
  } catch (e) {
    return internt(e, 'deduktivpass/slutfor');
  }
}
