import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ComponentType } from 'react'
import EmbedResizer from '@/components/rakna/EmbedResizer'
import LonEfterSkatt from '@/components/rakna/LonEfterSkatt'
import UppsagningstidRaknare from '@/components/rakna/UppsagningstidRaknare'
import TimlonManadslon from '@/components/rakna/TimlonManadslon'
import SemesterersattningRaknare from '@/components/rakna/SemesterersattningRaknare'
import AnstalldKostnad from '@/components/rakna/AnstalldKostnad'
import LoneforhandlingsKalkylator from '@/components/rakna/LoneforhandlingsKalkylator'
import FelrekryteringsKalkylator from '@/components/mdx/FelrekryteringsKalkylator'
import SourcingTratt from '@/components/mdx/SourcingTratt'
import TraffsakerhetsSimulator from '@/components/mdx/TraffsakerhetsSimulator'

/**
 * Inbäddningsbar variant av kalkylatorerna: bara verktyget plus en
 * källrad, ingen sajtnavigation. Visas i iframe på andra webbplatser,
 * därför noindex med canonical-länk in till den riktiga verktygssidan
 * via källraden. Höjden rapporteras till värdsidan av EmbedResizer.
 */

const VERKTYG: Record<string, { titel: string; Komponent: ComponentType }> = {
  'lon-efter-skatt': { titel: 'Räkna ut lön efter skatt 2026', Komponent: LonEfterSkatt },
  uppsagningstid: { titel: 'Räkna ut din uppsägningstid', Komponent: UppsagningstidRaknare },
  'timlon-till-manadslon': { titel: 'Räkna om timlön till månadslön', Komponent: TimlonManadslon },
  semesterersattning: { titel: 'Räkna ut semesterersättning', Komponent: SemesterersattningRaknare },
  'vad-kostar-en-anstalld': { titel: 'Vad kostar en anställd?', Komponent: AnstalldKostnad },
  loneforhandling: { titel: 'Vad är en löneförhandling värd?', Komponent: LoneforhandlingsKalkylator },
  felrekrytering: { titel: 'Räkna ut vad en felrekrytering kostar', Komponent: FelrekryteringsKalkylator },
  sourcing: { titel: 'Sourcingtratten', Komponent: SourcingTratt },
  traffsakerhet: { titel: 'Träffsäkerhetssimulatorn', Komponent: TraffsakerhetsSimulator },
}

type Props = { params: Promise<{ verktyg: string }> }

export function generateStaticParams() {
  return Object.keys(VERKTYG).map((verktyg) => ({ verktyg }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { verktyg } = await params
  const def = VERKTYG[verktyg]
  if (!def) return {}
  return {
    title: def.titel,
    robots: { index: false, follow: true },
  }
}

export default async function EmbedPage({ params }: Props) {
  const { verktyg } = await params
  const def = VERKTYG[verktyg]
  if (!def) notFound()

  return (
    <main className="bg-white px-2 py-1">
      <EmbedResizer verktyg={verktyg} />
      <def.Komponent />
      <p className="mb-2 px-1 text-xs text-slate-500">
        {def.titel}, byggd på öppna källor och uppdaterad för 2026.{' '}
        <a
          href={`https://www.jobbcoach.ai/rakna-ut/${verktyg}`}
          target="_blank"
          rel="noopener"
          className="font-semibold text-orange-700 hover:text-orange-800"
        >
          Öppna hos jobbcoach.ai
        </a>
      </p>
    </main>
  )
}
