// /api/konto/radera
//
// DELETE: raderar den inloggades konto (webbens Inställningar, Radera mitt
// konto). Logiken ligger i lib/konto/raderaKonto.server.ts och delas med
// appens /api/app/konto.

import { NextResponse } from 'next/server'
import { fel, inloggad, internt } from '@/lib/traning/rutt.server'
import { raderaKonto } from '@/lib/konto/raderaKonto.server'
import { lasAnledning } from '@/lib/konto/avslut'

// Kroppen kan bära en frivillig anledning (beslut-mejl-och-radering 2c punkt 5);
// bara de sex nycklarna släpps igenom, allt annat blir null.
export async function DELETE(request: Request) {
  const a = await inloggad()
  if (!a.ok) return a.svar
  try {
    const kropp = await request.json().catch(() => ({}))
    const r = await raderaKonto(a.admin, a.userId, { kalla: 'webb', anledning: lasAnledning(kropp?.anledning) })
    if (!r.ok) return fel(r.fel === 'stripe' ? 502 : 500, r.fel === 'stripe' ? 'prenumeration_kvar' : 'kunde_inte_radera')
    return NextResponse.json({ raderat: true })
  } catch (e) {
    return internt(e, 'konto/radera DELETE')
  }
}
