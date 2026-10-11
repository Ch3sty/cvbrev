// /api/traning/ovningsprov/slutfor
//
// POST {sessionId}
//   Lämnar in övningsprovet, av henne eller av klockan. Obesvarade räknas
//   som fel. 200 {session: Ovningsvy} med genomgången och resultatet. Ett
//   redan avslutat prov ger samma svar, så att ett dubbeltryck eller en
//   klocka som går ut samtidigt aldrig ger ett fel.

import { NextResponse } from 'next/server';
import { markeraTestBricka } from '@/lib/onboarding/komigang-server';
import { avbrytSchemalagtPassmejl } from '@/lib/email/lifecycle/traningsmejl';
import { slutforOvningsprov } from '@/lib/ovningsprov/motor.server';
import { OVNINGSPROV_TEST_TYPE } from '@/lib/ovningsprov/typer';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const k = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof k.sessionId !== 'string') return fel(400, 'falt_saknas');
  try {
    const r = await slutforOvningsprov({ admin: a.admin, userId: a.userId, sessionId: k.sessionId });
    if (!r.ok) return fel(r.status, r.fel);
    void markeraTestBricka(a.userId, OVNINGSPROV_TEST_TYPE[r.vy.typ]);
    void avbrytSchemalagtPassmejl(a.admin, a.userId);
    return NextResponse.json({ session: r.vy });
  } catch (e) {
    return internt(e, 'ovningsprov/slutfor POST');
  }
}
