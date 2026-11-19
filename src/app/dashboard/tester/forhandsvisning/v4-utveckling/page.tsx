/**
 * Förhandsvisning av Din utveckling v4 med skissens fixturer
 * (lib/tester/v4/fixturer), utan databas. Bara i utveckling eller med
 * TRANING_FORHANDSVISNING=1, aldrig i produktion.
 *
 *   /dashboard/tester/forhandsvisning/v4-utveckling?lage=a|b|c&niva=premium|gratis
 *     &artikel=1    planen skapad ur en artikel, utan data
 *     &ny=1         ny användare utan plan och utan data
 *     &typ=matris   typen vald i grafen
 *     &period=4v|plan|allt
 *     &punkt=senaste  den senaste synliga punkten vald (eller ett id)
 */
import { notFound } from 'next/navigation'
import { fixturTester, fixturUtveckling, type FixturLage, type FixturNiva } from '@/lib/tester/v4/fixturer'
import Navigering from '@/components/tester-v4/hem/Navigering'
import { navTexter } from '@/components/tester-v4/hem/hemData'
import { arTestTypId } from '@/lib/tester/v4/typer'
import UtvecklingVy from '@/components/tester-v4/utveckling/UtvecklingVy'
import { arPeriod } from '@/components/tester-v4/utveckling/geometri'
import { Betalvagg } from '@/components/traning/HemKlient'

export const dynamic = 'force-dynamic'

const forst = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function ForhandsvisningUtvecklingV4({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (process.env.NODE_ENV !== 'development' && process.env.TRANING_FORHANDSVISNING !== '1') notFound()
  const sp = await searchParams
  const lage = (['a', 'b', 'c'].includes(forst(sp.lage) ?? '') ? forst(sp.lage) : 'a') as FixturLage
  const niva = (forst(sp.niva) === 'gratis' ? 'gratis' : 'premium') as FixturNiva
  let data = fixturUtveckling(lage, niva, { artikel: forst(sp.artikel) === '1' })
  if (forst(sp.ny) === '1') {
    data = {
      ...data,
      plan: null,
      provdag: null,
      punkter: [],
      matrisMonster: null,
      typer: data.typer.map((t) => ({ ...t, ingarIPlan: false, niva: { status: 'omatt', niva: null, osakerhet: 0.6, tak: 7.5 } })),
    }
  }
  const typ = forst(sp.typ)
  const startTyp = arTestTypId(typ) ? typ : null
  const period = forst(sp.period)
  let punkt = forst(sp.punkt) ?? null
  if (punkt === 'senaste') {
    const kandidater = data.punkter.filter((p) => !startTyp || p.typ === startTyp)
    punkt = kandidater.length ? kandidater[kandidater.length - 1].id : null
  }
  return (
    <Betalvagg scope={null} track={null} planKey={null}>
      <UtvecklingVy data={data} startTyp={startTyp} startPeriod={arPeriod(period) ? period : null} startPunkt={punkt} nav={<Navigering aktiv="utveckling" texter={navTexter(fixturTester(lage, niva, { artikel: forst(sp.artikel) === '1' }))} />} />
    </Betalvagg>
  )
}
