/**
 * Förhandsvisning av Din utveckling (tester-lyftet, skiss Provbladet v3
 * avsnitt 2) med exempeldata, utan databas. Finns bara i utveckling
 * (NODE_ENV=development) eller när TRANING_FORHANDSVISNING=1 är satt, vilket
 * det aldrig är i produktion.
 *
 *   /dashboard/tester/forhandsvisning/utveckling                 allt
 *   /dashboard/tester/forhandsvisning/utveckling?lage=under25    räknarna
 *   ...?lage=klassiska | gratis | tomt
 *   ...&forsta=1                                                  hjälpen öppen
 *
 * Flikraden här är en platshållare: den riktiga byggs med sidan.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DinUtveckling from '@/components/traning/utveckling'
import { LAGEN, LAGE_NAMN, utvecklingFixtur, type Lage } from '@/components/traning/utveckling/fixtur'
import { HjalpProvider } from '@/components/hjalp'

export const dynamic = 'force-dynamic'

function forhandsvisningTillaten(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.TRANING_FORHANDSVISNING === '1'
}

function Flikar() {
  return (
    <nav aria-label="Flikar (platshållare)" className="flex gap-1 rounded-xl border border-kant bg-papper-2 p-1 text-sm font-medium" data-platshallare="flikar">
      <span className="flex min-h-10 flex-1 items-center justify-center rounded-lg text-ink-3">Tester</span>
      <span aria-current="page" className="flex min-h-10 flex-1 items-center justify-center rounded-lg bg-papper text-ink-1 shadow-sm">
        Din utveckling
      </span>
    </nav>
  )
}

export default async function Sida({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!forhandsvisningTillaten()) notFound()
  const sp = await searchParams
  const v = (Array.isArray(sp.lage) ? sp.lage[0] : sp.lage) ?? 'full'
  if (!(LAGEN as readonly string[]).includes(v)) notFound()
  const lage = v as Lage
  return (
    <HjalpProvider dold={null} forsta={sp.forsta === '1'}>
      <DinUtveckling data={utvecklingFixtur(lage)} flikar={<Flikar />} />
      <nav aria-label="Förhandsvisningens lägen" className="mx-auto mt-6 flex w-full max-w-[1120px] flex-wrap gap-2 px-4 pb-8 lg:px-10" data-lagen>
        {LAGEN.map((l) => (
          <Link
            key={l}
            href={`/dashboard/tester/forhandsvisning/utveckling?lage=${l}`}
            aria-current={l === lage ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-sm ${l === lage ? 'border-ink-1 text-ink-1' : 'border-kant text-ink-2'}`}
          >
            {LAGE_NAMN[l]}
          </Link>
        ))}
      </nav>
    </HjalpProvider>
  )
}
