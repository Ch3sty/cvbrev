// /api/traning/nivakoll/svar
//
// POST {sessionId, nyckel, svar, tid}
//   Sparar ett svar i Nivåkollen (svar null för "Vet inte"). Ingen
//   återkoppling: rätt svar visas först i genomgången. Ett svar per uppgift.

import { NextResponse } from 'next/server';
import { svaraNivakoll } from '@/lib/nivakoll/motor.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const k = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof k.sessionId !== 'string') return fel(400, 'session_saknas');
  try {
    const r = await svaraNivakoll({ admin: a.admin, userId: a.userId, sessionId: k.sessionId, nyckel: k.nyckel, svar: k.svar ?? null, tid: k.tid });
    if (!r.ok) return fel(r.status, r.fel);
    const { ok: _ok, ...data } = r;
    return NextResponse.json(data);
  } catch (e) {
    return internt(e, 'nivakoll/svar');
  }
}
