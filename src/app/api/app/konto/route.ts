// /api/app/konto
//
// DELETE: raderar den inloggades konto från appens kontovy. Samma väg som
// webbens /api/konto/radera (lib/konto/raderaKonto.server.ts): levande
// Stripe-prenumerationer avslutas, sedan tas auth-användaren bort och
// raderingen kaskaderar via foreign keys.
//
// En prenumeration i Google Play avslutas inte av raderingen; kontovyn
// säger det före bekräftelsen.

import { NextResponse } from 'next/server';
import { fel, inloggad, internt } from '@/lib/traning/rutt.server';
import { raderaKonto } from '@/lib/konto/raderaKonto.server';
import { lasAnledning } from '@/lib/konto/avslut';

// Kroppen kan bära en frivillig anledning (beslut-mejl-och-radering 2c punkt 5).
export async function DELETE(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  try {
    const kropp = await request.json().catch(() => ({}));
    const r = await raderaKonto(a.admin, a.userId, { kalla: 'app', anledning: lasAnledning(kropp?.anledning) });
    if (!r.ok) return fel(r.fel === 'stripe' ? 502 : 500, r.fel === 'stripe' ? 'prenumeration_kvar' : 'kunde_inte_radera');
    return NextResponse.json({ raderat: true });
  } catch (e) {
    return internt(e, 'app/konto DELETE');
  }
}
