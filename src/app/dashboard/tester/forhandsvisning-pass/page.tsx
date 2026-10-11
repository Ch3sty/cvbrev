/**
 * Förhandsvisning av våg 3b för utvecklare och klicktest:
 *
 *   /dashboard/tester/forhandsvisning-pass?ram=P1|P2|P3|P4|S1|M0|M1|O1|K1|uppvarmning
 *   (&betalande=1 för M0 och M1 utan betalvägg)
 *
 * Finns bara när NODE_ENV är development eller TRANING_FORHANDSVISNING=1
 * (en flagga som aldrig sätts i produktionen); annars 404. Ritar samma
 * komponenter som passet med fixturer ur riktiga V7-frågor och spec-rummens
 * exempeltal, utan databas: migreringarna för testmotorn är inte körda i
 * prod. Passen går att klicka igenom (svar, regel, nästa, resultat,
 * genomgång) mot ett fixtur-API; inget sparas.
 */

import { notFound } from 'next/navigation'
import { byggForhandsdata, RAMAR, type Ram } from './fixturer.server'
import Forhandsvisning from './Forhandsvisning'

export const dynamic = 'force-dynamic'

function forhandsvisningTillaten(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.TRANING_FORHANDSVISNING === '1'
}

export default async function ForhandsvisningPassSida({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (!forhandsvisningTillaten()) notFound()
  const sp = await searchParams
  const v = Array.isArray(sp.ram) ? sp.ram[0] : sp.ram
  const ram: Ram = RAMAR.includes(v as Ram) ? (v as Ram) : 'P1'
  const data = byggForhandsdata(ram, { betalande: sp.betalande === '1' })
  return <Forhandsvisning data={data} />
}
