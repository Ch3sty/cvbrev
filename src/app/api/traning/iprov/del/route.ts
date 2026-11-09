// /api/traning/iprov/del
//
// POST {sessionId, nr, handling: 'starta' | 'avsluta'}
//   Startar deltestet på tur (servern sätter klockan) eller avslutar det.
//   Ett avslutat deltest öppnas aldrig igen. Efter sista deltestet rättas
//   provet och svaret bär resultatet.

import { NextResponse } from 'next/server';
import { avslutaDel, startaDel } from '@/lib/tester/steg2/iprov.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const k = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof k.sessionId !== 'string') return fel(400, 'session_saknas');
  try {
    const r = k.handling === 'avsluta'
      ? await avslutaDel({ admin: a.admin, userId: a.userId, id: k.sessionId, nr: k.nr })
      : await startaDel({ admin: a.admin, userId: a.userId, id: k.sessionId, nr: k.nr });
    if (!r.ok) return fel(r.status, r.fel);
    return NextResponse.json({ session: r.vy });
  } catch (e) {
    return internt(e, 'iprov/del');
  }
}
