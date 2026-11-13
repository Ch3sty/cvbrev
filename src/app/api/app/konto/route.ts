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

export async function DELETE() {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  try {
    const r = await raderaKonto(a.admin, a.userId);
    if (!r.ok) return fel(r.fel === 'stripe' ? 502 : 500, r.fel === 'stripe' ? 'prenumeration_kvar' : 'kunde_inte_radera');
    return NextResponse.json({ raderat: true });
  } catch (e) {
    return internt(e, 'app/konto DELETE');
  }
}
