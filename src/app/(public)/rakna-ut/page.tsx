import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Räkna ut: gratis kalkylatorer för lön, jobb och rekrytering',
  description:
    'Gratis kalkylatorer utan konto: lön efter skatt 2026, uppsägningstid enligt LAS, semesterersättning, vad en anställd kostar och mer. Byggda på myndighetsdata.',
  alternates: { canonical: 'https://www.jobbcoach.ai/rakna-ut' },
  openGraph: { images: ['https://www.jobbcoach.ai/images/rakna-ut.webp'] },
}

type Verktyg = { slug: string; titel: string; beskrivning: string }

const KANDIDAT: Verktyg[] = [
  {
    slug: 'lon-efter-skatt',
    titel: 'Lön efter skatt 2026',
    beskrivning: 'Nettolön med Skatteverkets riktiga skattetabeller och din kommuns skattesats. Jämför två löner eller kommuner.',
  },
  {
    slug: 'uppsagningstid',
    titel: 'Uppsägningstid enligt LAS',
    beskrivning: 'Hur lång är din uppsägningstid, och vilket datum blir sista anställningsdagen?',
  },
  {
    slug: 'semesterersattning',
    titel: 'Semesterersättning',
    beskrivning: 'Semestertillägg per dag, slutlön för sparade dagar och tolvprocentsregeln.',
  },
  {
    slug: 'timlon-till-manadslon',
    titel: 'Timlön till månadslön',
    beskrivning: 'Konvertera åt båda hållen med 174-timmarsschablonen, och se årslönen.',
  },
  {
    slug: 'loneforhandling',
    titel: 'Löneförhandlingens värde',
    beskrivning: 'Vad en höjning i dag är värd över 5, 10 och 20 år när varje revision räknas på den.',
  },
]

const ARBETSGIVARE: Verktyg[] = [
  {
    slug: 'vad-kostar-en-anstalld',
    titel: 'Vad kostar en anställd?',
    beskrivning: 'Hela månadskostnaden 2026: arbetsgivaravgift, ITP1, särskild löneskatt, försäkringar och semester.',
  },
  {
    slug: 'felrekrytering',
    titel: 'Felrekryteringens kostnad',
    beskrivning: 'Vad en misslyckad rekrytering kostar post för post, från annons till omstart.',
  },
  {
    slug: 'sourcing',
    titel: 'Sourcingtratten',
    beskrivning: 'Hur många riktade kontakter krävs för en anställning, med branschens svarsfrekvenser?',
  },
  {
    slug: 'traffsakerhet',
    titel: 'Träffsäkerhetssimulatorn',
    beskrivning: 'Jämför urvalsmetoders träffsäkerhet på urvalsforskningens validitetssiffror.',
  },
]

function VerktygsGrid({ verktyg }: { verktyg: Verktyg[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {verktyg.map((v) => (
        <Link
          key={v.slug}
          href={`/rakna-ut/${v.slug}`}
          className="group rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/60 to-white p-5 transition-shadow hover:shadow-md"
        >
          <h3 className="mb-1 text-lg font-black text-slate-900 group-hover:text-orange-700">{v.titel}</h3>
          <p className="mb-0 text-sm leading-relaxed text-slate-600">{v.beskrivning}</p>
        </Link>
      ))}
    </div>
  )
}

export default function Page() {
  return (
    <main className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Breadcrumb
          items={[
            { name: 'Hem', href: '/' },
            { name: 'Räkna ut', href: '/rakna-ut' },
          ]}
        />

        <header className="mt-6 mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
            Räkna ut: kalkylatorer för lön, jobb och rekrytering
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
            Gratis, utan konto och byggda på myndighetsdata och namngivna källor:
            Skatteverkets skattetabeller, LAS, semesterlagen och Avtalats
            premier. Varje verktyg redovisar öppet hur det räknar.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5">För dig som söker jobb eller byter</h2>
          <VerktygsGrid verktyg={KANDIDAT} />
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5">För dig som anställer</h2>
          <VerktygsGrid verktyg={ARBETSGIVARE} />
        </section>

        <p className="mt-12 pt-6 border-t border-orange-100 text-xs text-slate-500">
          Kalkylatorerna uppdateras årligen med nya skattetabeller, basbelopp
          och avgifter, senast för inkomståret 2026. De ger vägledning, inte
          skatte- eller juridisk rådgivning.
        </p>
      </div>
    </main>
  )
}
