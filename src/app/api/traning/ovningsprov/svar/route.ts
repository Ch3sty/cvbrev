// /api/traning/ovningsprov/svar
//
// POST {sessionId, nyckel, svar, tid}
//   Sparar ett svar i ett pågående övningsprov. Svaret kan bytas så länge
//   provet pågår. 200 {besvarade}. 400 fel punkt eller ogiltigt svar, 404
//   sessionen finns inte, 409 redan avslutat, 410 provets tid är ute.

import { NextResponse } from 'next/server';
import { svaraOvningsprov } from '@/lib/ovningsprov/motor.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const k = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof k.sessionId !== 'string' || typeof k.nyckel !== 'string') return fel(400, 'falt_saknas');
  try {
    const r = await svaraOvningsprov({
      admin: a.admin,
      userId: a.userId,
      sessionId: k.sessionId,
      nyckel: k.nyckel,
      svar: k.svar,
      tid: k.tid,
    });
    if (!r.ok) return fel(r.status, r.fel);
    return NextResponse.json({ besvarade: r.besvarade });
  } catch (e) {
    return internt(e, 'ovningsprov/svar POST');
  }
}
