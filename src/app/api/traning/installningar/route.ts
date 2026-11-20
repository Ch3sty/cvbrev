// /api/traning/installningar
//
// GET   {forklaring_efter_svar}: Träna-inställningen, standard på.
// POST  {forklaring_efter_svar: boolean}: sparar kryssrutan på
//       Träna-startskärmen (plan-testflode-2026-11-20 beslut 3). Enda
//       vägen som skriver profiles.test_installningar.

import { NextResponse } from 'next/server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';
import { lasTestInstallningar, sparaTestInstallningar } from '@/lib/tester/installningar.server';

export async function GET() {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  try {
    return NextResponse.json(await lasTestInstallningar(a.admin, a.userId));
  } catch (e) {
    return internt(e, 'installningar GET');
  }
}

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const k = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof k.forklaring_efter_svar !== 'boolean') return fel(400, 'ogiltig_installning');
  try {
    const sparad = await sparaTestInstallningar(a.admin, a.userId, { forklaring_efter_svar: k.forklaring_efter_svar });
    if (!sparad) return fel(500, 'sparades_inte');
    return NextResponse.json(sparad);
  } catch (e) {
    return internt(e, 'installningar POST');
  }
}
