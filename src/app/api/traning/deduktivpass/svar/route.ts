// /api/traning/deduktivpass/svar
//
// POST {sessionId, nyckel, visat, tid}
//   Rättar ett svar i deduktivpasset (visat index, null för "Vet inte, visa
//   regeln") och svarar med rätt svar, lösningen och misstaget. Ett svar per uppgift.

import { NextResponse } from 'next/server';
import { svaraDeduktivPass } from '@/lib/tester/pass-deduktiv.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const kropp = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof kropp.sessionId !== 'string') return fel(400, 'session_saknas');
  try {
    const r = await svaraDeduktivPass({ admin: a.admin, userId: a.userId, sessionId: kropp.sessionId, nyckel: kropp.nyckel, visat: kropp.visat ?? null, tid: kropp.tid });
    if (!r.ok) return fel(r.status, r.fel);
    const { ok: _ok, ...data } = r;
    return NextResponse.json(data);
  } catch (e) {
    return internt(e, 'deduktivpass/svar');
  }
}
