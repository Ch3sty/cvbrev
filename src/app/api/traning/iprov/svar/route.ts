// /api/traning/iprov/svar
//
// POST {sessionId, nyckel, visat, tid}
//   Sparar ett svar i det öppna deltestet. Svaret går att ändra så länge
//   deltestet är öppet och tiden inte är ute. Inget facit under provet.

import { NextResponse } from 'next/server';
import { svaraIprov } from '@/lib/tester/steg2/iprov.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const k = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof k.sessionId !== 'string') return fel(400, 'session_saknas');
  try {
    const r = await svaraIprov({ admin: a.admin, userId: a.userId, id: k.sessionId, nyckel: k.nyckel, visat: k.visat, tid: k.tid });
    if (!r.ok) return fel(r.status, r.fel);
    return NextResponse.json(r.vy);
  } catch (e) {
    return internt(e, 'iprov/svar');
  }
}
