import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import EmbedResizer from '@/components/rakna/EmbedResizer'
import Kalkylator from '@/components/rakna/Kalkylator'
import { arSlug, type Slug } from '@/lib/rakna/delning'

/**
 * Inbäddningsbar variant av kalkylatorerna: bara verktyget plus en
 * källrad, ingen sajtnavigation. Visas i iframe på andra webbplatser,
 * därför noindex med canonical-länk in till den riktiga verktygssidan
 * via källraden. Höjden rapporteras till värdsidan av EmbedResizer.
 * Kalkylatorerna är desamma som på /rakna-ut, i Trådens form.
 */

const TITLAR: Record<Slug, string> = {
  'lon-efter-skatt': 'Räkna ut lön efter skatt 2026',
  uppsagningstid: 'Räkna ut din uppsägningstid',
  'timlon-till-manadslon': 'Räkna om timlön till månadslön',
  semesterersattning: 'Räkna ut semesterersättning',
  'vad-kostar-en-anstalld': 'Vad kostar en anställd?',
  loneforhandling: 'Vad är en löneförhandling värd?',
  felrekrytering: 'Räkna ut vad en felrekrytering kostar',
  sourcing: 'Sourcingtratten',
  traffsakerhet: 'Träffsäkerhetssimulatorn',
}

type Props = { params: Promise<{ verktyg: string }> }

export function generateStaticParams() {
  return Object.keys(TITLAR).map((verktyg) => ({ verktyg }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { verktyg } = await params
  if (!arSlug(verktyg)) return {}
  return {
    title: TITLAR[verktyg],
    robots: { index: false, follow: true },
  }
}

export default async function EmbedPage({ params }: Props) {
  const { verktyg } = await params
  if (!arSlug(verktyg)) notFound()

  return (
    <main className="bg-mark p-2">
      <EmbedResizer verktyg={verktyg} />
      <Kalkylator slug={verktyg} />
      <p className="mb-2 mt-3 px-1 text-meta text-ink-3">
        {TITLAR[verktyg]}, byggd på öppna källor och uppdaterad för 2026.{' '}
        <a
          href={`https://www.jobbcoach.ai/rakna-ut/${verktyg}`}
          target="_blank"
          rel="noopener"
          className="font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
        >
          Öppna hos jobbcoach.ai
        </a>
      </p>
    </main>
  )
}
