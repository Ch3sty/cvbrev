/**
 * Förhandsvisning av grunden för tester-lyftet (Provbladet): illustrationerna
 * på papper, golv och vägg, hjälpraden, i-knappen och sidopanelen. Finns bara
 * i utveckling (NODE_ENV=development) eller när TRANING_FORHANDSVISNING=1 är
 * satt, vilket det aldrig är i produktion.
 *
 *   /dashboard/tester/forhandsvisning/grund             hopfälld (vana)
 *   /dashboard/tester/forhandsvisning/grund?forsta=1    öppen första gången
 *
 * Ingen data läses. "Dölj hjälpen" sparar som på riktigt (profilen och
 * localStorage); knappen "Visa hjälpen igen" längst ner slår på den.
 */
import { notFound } from 'next/navigation'
import GrundForhandsvisning from './GrundForhandsvisning'

export const dynamic = 'force-dynamic'

function forhandsvisningTillaten(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.TRANING_FORHANDSVISNING === '1'
}

export default async function Sida({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (!forhandsvisningTillaten()) notFound()
  const sp = await searchParams
  return <GrundForhandsvisning forsta={sp.forsta === '1'} />
}
