/**
 * Förhandsvisning av Tester v4 med skissens fixturer (lib/tester/v4/fixturer),
 * utan databas. Bara i utveckling eller med TRANING_FORHANDSVISNING=1, aldrig
 * i produktion.
 *
 *   /dashboard/tester/forhandsvisning/v4-tester?lage=a|b|c&niva=premium|gratis
 *     &kvot=1     dagens grundnivåtest är gjort (gratis)
 *     &artikel=1  planen skapad ur en artikel, utan datum
 *     &typ=matris typens meny öppen
 */
import { notFound } from 'next/navigation'
import { fixturTester, type FixturLage, type FixturNiva } from '@/lib/tester/v4/fixturer'
import { arTestTypId } from '@/lib/tester/v4/typer'
import TesterVy from '@/components/tester-v4/tester/TesterVy'
import Navigering from '@/components/tester-v4/hem/Navigering'
import { navTexter } from '@/components/tester-v4/hem/hemData'

export const dynamic = 'force-dynamic'

const forst = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function ForhandsvisningTesterV4({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (process.env.NODE_ENV !== 'development' && process.env.TRANING_FORHANDSVISNING !== '1') notFound()
  const sp = await searchParams
  const lage = (['a', 'b', 'c'].includes(forst(sp.lage) ?? '') ? forst(sp.lage) : 'a') as FixturLage
  const niva = (forst(sp.niva) === 'gratis' ? 'gratis' : 'premium') as FixturNiva
  const data = fixturTester(lage, niva, { kvotAnvand: forst(sp.kvot) === '1', artikel: forst(sp.artikel) === '1' })
  const typ = forst(sp.typ)
  return (
    <TesterVy
      data={data}
      startTyp={arTestTypId(typ) ? typ : null}
      nav={<Navigering aktiv="tester" texter={navTexter(data)} />}
    />
  )
}
