/**
 * Förhandsvisning av Hem v4 (docs/plan-tester-v4-bygg.md 3.3) med skissens
 * fixturer (src/lib/tester/v4/fixturer.ts). Finns bara i utveckling eller
 * när TRANING_FORHANDSVISNING=1 är satt, vilket det aldrig är i produktion.
 *
 *   ?lage=a|b|c          utan plan, Alva Logic, I-provet
 *   ?niva=premium|gratis
 *   ?artikel=1           planen ur Alva-artikeln, utan datum och data
 *   ?kvot=1              gratis: dagens grundnivåtest är gjort
 *
 * Ingen data läses.
 */
import { notFound } from 'next/navigation'
import { fixturTester, type FixturLage, type FixturNiva } from '@/lib/tester/v4/fixturer'
import HemVy from '@/components/tester-v4/hem/HemVy'

export const dynamic = 'force-dynamic'

function tillaten(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.TRANING_FORHANDSVISNING === '1'
}

const forsta = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function Sida({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!tillaten()) notFound()
  const sp = await searchParams
  const l = forsta(sp.lage)
  const lage: FixturLage = l === 'b' || l === 'c' ? l : 'a'
  const niva: FixturNiva = forsta(sp.niva) === 'gratis' ? 'gratis' : 'premium'
  const artikel = forsta(sp.artikel) === '1'
  const data = fixturTester(artikel ? 'b' : lage, artikel ? 'gratis' : niva, { artikel, kvotAnvand: forsta(sp.kvot) === '1' })
  return <HemVy data={data} />
}
