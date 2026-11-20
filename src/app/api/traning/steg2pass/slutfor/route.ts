// /api/traning/steg2pass/slutfor
//
// POST {sessionId}
//   Avslutar passet: rätt, tid, "Var du tappade" och frågestatistiken.

import { NextResponse } from 'next/server';
import { slutforSteg2Pass } from '@/lib/tester/steg2/pass.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';
import { avbrytSchemalagtPassmejl } from '@/lib/email/lifecycle/traningsmejl';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const kropp = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof kropp.sessionId !== 'string') return fel(400, 'session_saknas');
  try {
    const r = await slutforSteg2Pass({ admin: a.admin, userId: a.userId, sessionId: kropp.sessionId });
    if (!r.ok) return fel(r.status, r.fel);
    // Dagens pass är gjort: dagens schemalagda pass_dag2 ska inte gå (alla testtyper sedan 2026-11-10).
    void avbrytSchemalagtPassmejl(a.admin, a.userId);
    // niva_efter (tester v4): nivån efter träningen, null när den inte flyttades eller saknas.
    return NextResponse.json({ session: r.vy, niva_efter: r.niva_efter ?? null, niva_fore: r.niva_fore ?? null });
  } catch (e) {
    return internt(e, 'steg2pass/slutfor');
  }
}
