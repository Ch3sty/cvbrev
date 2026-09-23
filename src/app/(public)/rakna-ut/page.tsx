/**
 * /rakna-ut, hubben för de nio kalkylatorerna, i den visuella linjen
 * (docs/designsystem.md avsnitt 12). h1, title, description och canonical är
 * oförändrade; ramen och sektionernas form är nya.
 *
 * Sektionsföljden:
 *   1. Hero på mark med scen (IlluScenKalkylator), bläckknapp plus textlänk.
 *   2. Lönesidan: Lön efter skatt som upphöjd panel med ett räknat exempel,
 *      sedan tre kort.
 *   3. Sidans enda bläckyta: löneförhandlingens värde och jobbcoachen, som
 *      ingår i Allt.
 *   4. Rekryterarsidan: Vad kostar en anställd som rad på mark med ett
 *      räknat exempel, tre kort, och länken till insikterna för rekryterare
 *      (inget paket).
 *
 * Aldrig fler än tre ytor i samma vikt i följd (regel 4). Exemplen räknas på
 * servern med samma funktioner som kalkylatorerna.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import InkPanel, { INK_KNAPP, INK_LANK } from '@/components/shell/InkPanel'
import { IlluScenKalkylator } from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY } from '@/lib/plans/plans'
import { TABELLER } from '@/lib/rakna/sammanfattning'
import { LON_STANDARD, beraknaLon } from '@/lib/rakna/lonEfterSkatt'
import { FORHANDLING_STANDARD, beraknaForhandling } from '@/lib/rakna/loneforhandling'
import { ANSTALLD_STANDARD, beraknaAnstalld } from '@/lib/rakna/anstalldKostnad'
import { kr, krTecken } from '@/lib/rakna/format'

export const metadata: Metadata = {
  title: 'Räkna ut: gratis kalkylatorer för lön, jobb och rekrytering',
  description:
    'Gratis kalkylatorer utan konto: lön efter skatt 2026, uppsägningstid enligt LAS, semesterersättning, vad en anställd kostar och mer. Byggda på myndighetsdata.',
  alternates: { canonical: 'https://www.jobbcoach.ai/rakna-ut' },
  openGraph: { images: ['https://www.jobbcoach.ai/images/rakna-ut.webp'] },
}

type Kort = { slug: string; varde: string; namn: string; beskrivning: string }

const LONEKORT: Kort[] = [
  {
    slug: 'uppsagningstid',
    varde: 'Räkna fram din sista anställningsdag',
    namn: 'Uppsägningstid enligt LAS',
    beskrivning: 'Hur lång är din uppsägningstid, och vilket datum blir sista anställningsdagen?',
  },
  {
    slug: 'semesterersattning',
    varde: 'Se vad dina sparade semesterdagar är värda',
    namn: 'Semesterersättning',
    beskrivning: 'Semestertillägg per dag, slutlön för sparade dagar och tolvprocentsregeln.',
  },
  {
    slug: 'timlon-till-manadslon',
    varde: 'Jämför timlön och månadslön rakt av',
    namn: 'Timlön till månadslön',
    beskrivning: 'Konvertera åt båda hållen med 174-timmarsschablonen, och se årslönen.',
  },
]

const REKRYTERARKORT: Kort[] = [
  {
    slug: 'felrekrytering',
    varde: 'Sätt en siffra på en misslyckad rekrytering',
    namn: 'Felrekryteringens kostnad',
    beskrivning: 'Vad en misslyckad rekrytering kostar post för post, från annons till omstart.',
  },
  {
    slug: 'sourcing',
    varde: 'Se hur många kontakter en anställning kräver',
    namn: 'Sourcingtratten',
    beskrivning: 'Hur många riktade kontakter krävs för en anställning, med branschens svarsfrekvenser?',
  },
  {
    slug: 'traffsakerhet',
    varde: 'Jämför hur ofta urvalsmetoderna träffar rätt',
    namn: 'Träffsäkerhetssimulatorn',
    beskrivning: 'Jämför urvalsmetoders träffsäkerhet på urvalsforskningens validitetssiffror.',
  },
]

const SEKTION = 'mt-16 lg:mt-[88px]'
const KNAPP =
  'inline-flex h-12 w-full items-center justify-center rounded-lg bg-ink-1 px-5 text-base font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto'
const LANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

function KortRad({ kort }: { kort: Kort[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {kort.map((k) => (
        <li key={k.slug}>
          <Link
            href={`/rakna-ut/${k.slug}`}
            className="flex h-full flex-col rounded-xl border border-kant bg-panel p-4 transition-colors hover:border-kant-stark sm:p-5"
          >
            <h3 className="text-kort text-ink-1">{k.varde}</h3>
            <span className="mt-1 text-meta text-ink-3">{k.namn}</span>
            <span className="mt-3 text-sm leading-[22px] text-ink-2">{k.beskrivning}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Page() {
  const lon = beraknaLon(LON_STANDARD, TABELLER)
  const forhandling = beraknaForhandling(FORHANDLING_STANDARD)
  const anstalld = beraknaAnstalld(ANSTALLD_STANDARD)
  const vecka = PLAN_BY_KEY.all_week
  const manad = PLAN_BY_KEY.all_month

  return (
    <main className="min-h-screen bg-mark">
      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-6 lg:px-12 lg:pb-[72px] lg:pt-10">
        <Breadcrumb
          items={[
            { name: 'Hem', href: '/' },
            { name: 'Räkna ut', href: '/rakna-ut' },
          ]}
        />

        {/* 1. Hero */}
        <header className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
          <div>
            <p className="text-steg font-semibold uppercase tracking-[0.08em] text-ink-3">Räkna ut · gratis, utan konto</p>
            <h1 className="mt-2 max-w-[18ch] text-h1-pub text-ink-1 lg:mt-3">
              Räkna ut: kalkylatorer för lön, jobb och rekrytering
            </h1>
            <p className="mt-4 max-w-[56ch] text-base leading-[27px] text-ink-2 lg:mt-6 lg:text-lg lg:leading-[29px]">
              Gratis, utan konto och byggda på myndighetsdata och namngivna källor: Skatteverkets skattetabeller, LAS,
              semesterlagen och Avtalats premier.{' '}
              <b className="font-semibold text-ink-1">Varje verktyg redovisar öppet hur det räknar.</b>
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/rakna-ut/lon-efter-skatt" className={KNAPP}>
                Räkna ut lön efter skatt
              </Link>
              <Link href="#for-dig-som-anstaller" className={LANK}>
                Kalkylatorerna för rekryterare
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-[13px] leading-[18px] text-ink-3">
              <li>
                <span className="block font-display text-[26px] font-bold leading-[30px] tracking-[-0.02em] tabular-nums text-ink-1">
                  9
                </span>
                kalkylatorer
              </li>
              <li>
                <span className="block font-display text-[26px] font-bold leading-[30px] tracking-[-0.02em] tabular-nums text-ink-1">
                  2026
                </span>
                års skattetabeller
              </li>
              <li>
                <span className="block font-display text-[26px] font-bold leading-[30px] tracking-[-0.02em] tabular-nums text-ink-1">
                  0 kr
                </span>
                och inget konto
              </li>
            </ul>
          </div>
          <div className="mx-auto w-full max-w-[300px] text-ink-1 lg:max-w-[360px]" aria-hidden="true">
            <IlluScenKalkylator className="h-auto w-full" />
          </div>
        </header>

        {/* 2. Lönesidan */}
        <section id="for-dig-som-soker-jobb" aria-label="För dig som söker jobb eller byter" className={`${SEKTION} scroll-mt-24`}>
          <h2 className="text-h2-pub text-ink-1">För dig som söker jobb eller byter</h2>
          <p className="mt-3 max-w-[60ch] text-base leading-[27px] text-ink-2">
            Innan du säger ja till ett erbjudande, säger upp dig eller går in i lönesamtalet: räkna på vad det betyder i
            kronor.
          </p>

          <Link
            href="/rakna-ut/lon-efter-skatt"
            className="mt-6 grid gap-6 rounded-xl border border-kant-stark bg-panel p-4 transition-colors hover:border-ink-1 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] md:items-center"
          >
            <div>
              <h3 className="text-varde text-ink-1">Se vad som blir kvar i handen</h3>
              <span className="mt-1 block text-meta text-ink-3">Lön efter skatt 2026</span>
              <span className="mt-3 block max-w-[52ch] text-sm leading-[22px] text-ink-2">
                Nettolön med Skatteverkets riktiga skattetabeller och din kommuns skattesats. Jämför två löner eller
                kommuner.
              </span>
              <span className="mt-4 inline-flex text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4">
                Räkna på din lön
              </span>
            </div>
            <div className="border-t border-kant pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <span className="block text-tal-display text-ink-1">{kr(lon.netto)}</span>
              <span className="mt-2 block text-sm leading-[22px] text-ink-2">
                kvar av {kr(LON_STANDARD.lon)} i {LON_STANDARD.kommun}, skattetabell {lon.tab}
              </span>
            </div>
          </Link>

          <div className="mt-4">
            <KortRad kort={LONEKORT} />
          </div>
        </section>

        {/* 3. Bläckytan */}
        <div className={SEKTION}>
          <InkPanel
            eyebrow="Ingår i Allt"
            title={`${kr(FORHANDLING_STANDARD.hojning)} mer i månaden är värt ${krTecken(forhandling.ar10)} på tio år`}
            text={
              <>
                Löneförhandlingens värde räknar ut vad en höjning blir när varje revision läggs ovanpå den. Jobbcoachen
                hjälper dig få den: marknadslön och argument ur SCB och fackens statistik, med källa till varje svar.
                Obegränsad chatt ingår i Allt, {vecka.amount} kr i veckan eller {manad.amount} kr i månaden.
              </>
            }
            action={
              <Link href="/verktyg/jobbcoachen" className={INK_KNAPP}>
                Fråga jobbcoachen
              </Link>
            }
            secondary={
              <Link href="/rakna-ut/loneforhandling" className={`${INK_LANK} inline-flex min-h-11 items-center`}>
                Räkna på din egen höjning
              </Link>
            }
          />
        </div>

        {/* 4. Rekryterarsidan */}
        <section id="for-dig-som-anstaller" aria-label="För dig som anställer" className={`${SEKTION} scroll-mt-24`}>
          <h2 className="text-h2-pub text-ink-1">För dig som anställer</h2>
          <p className="mt-3 max-w-[60ch] text-base leading-[27px] text-ink-2">
            Siffrorna som bär ett rekryteringsbeslut, räknade på era egna förutsättningar.
          </p>

          <Link
            href="/rakna-ut/vad-kostar-en-anstalld"
            className="group mt-6 grid gap-4 border-y border-kant py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] md:items-center md:gap-6"
          >
            <div>
              <h3 className="text-varde text-ink-1 underline decoration-transparent underline-offset-4 group-hover:decoration-kant-stark">
                Vet vad en anställning kostar innan ni annonserar
              </h3>
              <span className="mt-1 block text-meta text-ink-3">Vad kostar en anställd?</span>
              <span className="mt-3 block max-w-[52ch] text-sm leading-[22px] text-ink-2">
                Hela månadskostnaden 2026: arbetsgivaravgift, ITP1, särskild löneskatt, försäkringar och semester.
              </span>
            </div>
            <div>
              <span className="block text-tal-display text-ink-1">{kr(anstalld.total)}</span>
              <span className="mt-2 block text-sm leading-[22px] text-ink-2">
                i månaden för {kr(ANSTALLD_STANDARD.lon)} i lön med kollektivavtal
              </span>
            </div>
          </Link>

          <div className="mt-6">
            <KortRad kort={REKRYTERARKORT} />
          </div>

          <p className="mt-6 text-sm leading-[22px] text-ink-2">
            Siffran är början.{' '}
            <Link href="/for-rekryterare" className={LANK}>
              Läs insikterna för rekryterare
            </Link>
          </p>
        </section>

        <p className="mt-16 border-t border-kant pt-6 text-meta text-ink-3">
          Kalkylatorerna uppdateras årligen med nya skattetabeller, basbelopp och avgifter, senast för inkomståret 2026.
          De ger vägledning, inte skatte- eller juridisk rådgivning.
        </p>
      </div>
    </main>
  )
}
