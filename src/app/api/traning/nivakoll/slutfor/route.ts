// /api/traning/nivakoll/slutfor
//
// POST {sessionId}
//   Avslutar Nivåkollen: nivån, nivåpunkten för typen, frågestatistiken och
//   genomgången. Svarar med Nivåkollen i klientens form, resultatet med.

import { NextResponse } from 'next/server';
import { slutforNivakoll } from '@/lib/nivakoll/motor.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const k = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof k.sessionId !== 'string') return fel(400, 'session_saknas');
  try {
    const r = await slutforNivakoll({ admin: a.admin, userId: a.userId, sessionId: k.sessionId });
    if (!r.ok) return fel(r.status, r.fel);
    return NextResponse.json({ session: r.vy });
  } catch (e) {
    return internt(e, 'nivakoll/slutfor');
  }
}
