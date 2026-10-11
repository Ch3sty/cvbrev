// /api/traning/pass/complete
//
// POST {sessionId}
//   Avslutar mätning, ommätning, pass, riktat pass eller generalrepetition.
//   Räknar nivån (niva.ts), tempot (tempo.ts), familjerna (familjer.ts),
//   milstolparna (milstolpar.ts) och "I morgon" (imorgon.ts), och skriver
//   sessionen, nivåpunkten, frågestatistiken och milstolparna atomärt med
//   slutfor_traningssession.
//
//   200 {niva_fore, niva_efter, ratt, antal, over_tid, snitt_s, budget_s,
//        familjer, imorgon: {typ, text, dag}, milstolpe?, milstolpar, sikte,
//        tempo, tid_s, typ}
//   400 inga svar, 404 sessionen finns inte, 409 redan avslutad.

import { NextResponse } from 'next/server';
import { markeraTestBricka } from '@/lib/onboarding/komigang-server';
import { slutforTraning } from '@/lib/traning/motor.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const k = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof k.sessionId !== 'string') return fel(400, 'falt_saknas');
  try {
    const r = await slutforTraning({ admin: a.admin, userId: a.userId, sessionId: k.sessionId });
    if (!r.ok) return fel(r.status, r.fel);
    // Kom igång: grundtestets bricka står för "Mät din nivå" tills våg 2 döper om den.
    if (r.avslut.typ === 'matning') void markeraTestBricka(a.userId, 'matrislogik');
    // Generalrepetitionen kvitterar provlägets bricka.
    if (r.avslut.typ === 'general') void markeraTestBricka(a.userId, 'matrislogik-general');
    return NextResponse.json(r.avslut);
  } catch (e) {
    return internt(e, 'pass/complete POST');
  }
}
