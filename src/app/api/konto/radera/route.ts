// /api/konto/radera
//
// DELETE: raderar den inloggades konto (webbens Inställningar, Radera mitt
// konto). Logiken ligger i lib/konto/raderaKonto.server.ts och delas med
// appens /api/app/konto.

import { NextResponse } from 'next/server'
import { fel, inloggad, internt } from '@/lib/traning/rutt.server'
import { raderaKonto } from '@/lib/konto/raderaKonto.server'

export async function DELETE() {
  const a = await inloggad()
  if (!a.ok) return a.svar
  try {
    const r = await raderaKonto(a.admin, a.userId)
    if (!r.ok) return fel(r.fel === 'stripe' ? 502 : 500, r.fel === 'stripe' ? 'prenumeration_kvar' : 'kunde_inte_radera')
    return NextResponse.json({ raderat: true })
  } catch (e) {
    return internt(e, 'konto/radera DELETE')
  }
}
