/**
 * /rakna-ut, hubben för kalkylatorerna, publikt v2
 * (docs/design/spec-publikt-v2-del-b-2026-10-12.md avsnitt 3.5, skissen
 * flik #raknaut). h1, title, description, canonical, rubrikerna och
 * länkarna är oförändrade; ramen är ny.
 *
 * Sektionsföljden:
 *   1. Hjälten på vägg jobb med lönebeskedet (räknat på servern ur
 *      beraknaLon(LON_STANDARD)) och talraden, där antalet kalkylatorer
 *      räknas ur listan.
 *   2. För dig som söker jobb eller byter: lön efter skatt som stort kort
 *      med ett räknat exempel, sedan tre kort.
 *   3. Bläck: löneförhandlingens värde, räknat ur loneforhandling.ts, och
 *      Jobbcoachen i telefonen.
 *   4. För dig som anställer på panel: vad en anställd kostar som stort kort,
 *      tre kort och länken till insikterna för rekryterare.
 *
 * Serverkomponent, ingen klient-JS utöver sidhuvudet.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import PubliktSida from '@/components/publikt/PubliktSida'
import Rum from '@/components/publikt/Rum'
import TalRad from '@/components/publikt/TalRad'
import SkarmCoach from '@/components/publikt/telefon/skarmar/SkarmCoach'
import { Stapel } from '@/components/rakna/ui'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { TABELLER } from '@/lib/rakna/sammanfattning'
import { SLUGGAR } from '@/lib/rakna/delning'
import { LON_STANDARD, beraknaLon } from '@/lib/rakna/lonEfterSkatt'
import { FORHANDLING_STANDARD, beraknaForhandling } from '@/lib/rakna/loneforhandling'
import { ANSTALLD_STANDARD, beraknaAnstalld } from '@/lib/rakna/anstalldKostnad'
import { kr, krTecken } from '@/lib/rakna/format'
import '@/components/rakna/rakna.css'

export const metadata: Metadata = {
  title: 'Räkna ut: gratis kalkylatorer för lön, jobb och rekrytering',
  description:
    'Gratis kalkylatorer utan konto: lön efter skatt 2026, uppsägningstid enligt LAS, semesterersättning, vad en anställd kostar och mer. Byggda på myndighetsdata.',
  alternates: { canonical: 'https://www.jobbcoach.ai/rakna-ut' },
  openGraph: { images: ['https://www.jobbcoach.ai/images/rakna-ut.webp'] },
}

type Kort = { slug: string; varde: string; namn: string; beskrivning: string; ikon?: ReactNode }

const IKON_KALENDER = (
  <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
    <rect x="4" y="6" width="20" height="18" rx="3" />
    <path d="M4 11h20M9 3v5M19 3v5M10 17l3 3 5-6" />
  </svg>
)
const IKON_SOL = (
  <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
    <circle cx="14" cy="12" r="5" />
    <path d="M14 2v3M14 19v3M4 12h3M21 12h3M7 5l2 2M19 5l-2 2M5 26h18" />
  </svg>
)
const IKON_KLOCKA = (
  <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
    <circle cx="14" cy="15" r="10" />
    <path d="M14 9v6l4 3M11 3h6" />
  </svg>
)

const LONEKORT: Kort[] = [
  {
    slug: 'uppsagningstid',
    varde: 'Räkna fram din sista anställningsdag',
    namn: 'Uppsägningstid enligt LAS',
    beskrivning: 'Hur lång är din uppsägningstid, och vilket datum blir sista anställningsdagen?',
    ikon: IKON_KALENDER,
  },
  {
    slug: 'semesterersattning',
    varde: 'Se vad dina sparade semesterdagar är värda',
    namn: 'Semesterersättning',
    beskrivning: 'Semestertillägg per dag, slutlön för sparade dagar och tolvprocentsregeln.',
    ikon: IKON_SOL,
  },
  {
    slug: 'timlon-till-manadslon',
    varde: 'Jämför timlön och månadslön rakt av',
    namn: 'Timlön till månadslön',
    beskrivning: 'Konvertera åt båda hållen med 174-timmarsschablonen, och se årslönen.',
    ikon: IKON_KLOCKA,
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

function KortRad({ kort }: { kort: Kort[] }) {
  return (
    <ul className="rk-kort">
      {kort.map((k) => (
        <li key={k.slug}>
          <Link href={`/rakna-ut/${k.slug}`}>
            {k.ikon ? <span className="rk-ikon">{k.ikon}</span> : null}
            <small>{k.namn}</small>
            <h3>{k.varde}</h3>
            <span>{k.beskrivning}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** Bock i en cirkel, för lappen på lönebeskedet. */
function Bock() {
  return (
    <svg viewBox="0 0 34 34" aria-hidden="true" focusable="false">
      <circle cx="17" cy="17" r="16" fill="var(--positiv-mjuk)" />
      <path d="M10.5 17.5l4.5 4.5 8.5-9" fill="none" stroke="var(--positiv)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Page() {
  const lon = beraknaLon(LON_STANDARD, TABELLER)
  const forhandling = beraknaForhandling(FORHANDLING_STANDARD)
  const anstalld = beraknaAnstalld(ANSTALLD_STANDARD)
  const premie = `Ingår i ${paketKort()}, ${prisPeriod(SALD_PLAN)}`

  return (
    <PubliktSida>
      <main>
        {/* 1. Hjälten */}
        <Rum rum="jobb" yta="vagg" id="hjalte" vag="mark" style={{ paddingTop: 'clamp(24px, 4vw, 56px)' }}>
          <div className="pub-wrap">
            <Breadcrumb
              items={[
                { name: 'Hem', href: '/' },
                { name: 'Räkna ut', href: '/rakna-ut' },
              ]}
            />
            <div className="rk-hubb-g">
              <div>
                <p className="pub-kick">Räkna ut, gratis och utan konto</p>
                <h1 className="rk-h1">Räkna ut: kalkylatorer för lön, jobb och rekrytering</h1>
                <p className="pub-ingress" style={{ marginTop: 18 }}>
                  Gratis, utan konto och byggda på myndighetsdata och namngivna källor: Skatteverkets skattetabeller, LAS,
                  semesterlagen och Avtalats premier. <b>Varje verktyg redovisar öppet hur det räknar.</b>
                </p>
                <div className="pub-handling">
                  <Link className="pub-knapp" href="/rakna-ut/lon-efter-skatt" data-primar="">
                    Räkna ut lön efter skatt
                  </Link>
                  <Link className="pub-lank" href="#for-dig-som-anstaller">
                    Kalkylatorerna för rekryterare
                  </Link>
                </div>
                <TalRad
                  tal={[
                    { tal: String(SLUGGAR.length), text: 'kalkylatorer' },
                    { tal: '2026', text: 'års skattetabeller' },
                    { tal: '0 kr', text: 'och inget konto' },
                  ]}
                />
              </div>
              <div className="rk-besked-ram" aria-hidden="true">
                <div className="rk-besked">
                  <span className="rk-exempelchip">Exempel</span>
                  <p className="rk-res-kick">Lönebesked</p>
                  <p className="rk-res-rad">
                    <b>{kr(LON_STANDARD.lon)}</b> i lön i {LON_STANDARD.kommun}
                  </p>
                  <p className="rk-tal">
                    {kr(lon.netto)}
                    <small>kvar i handen per månad</small>
                  </p>
                  <Stapel
                    ljus
                    segment={[
                      { label: '', value: lon.netto, visa: 'Kvar' },
                      { label: `enligt tabell ${lon.tab}`, value: lon.skatt, visa: 'Skatt' },
                    ]}
                  />
                </div>
                <div className="rk-lapp">
                  <Bock />
                  <span>
                    <b>Skatteverkets tabell</b>samma som på lönebeskedet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Rum>

        {/* 2. För dig som söker jobb eller byter */}
        <Rum yta="mark" rum="jobb" id="for-dig-som-soker-jobb" aria-label="För dig som söker jobb eller byter">
          <div className="pub-wrap">
            <h2 className="pub-h2">För dig som söker jobb eller byter</h2>
            <p className="pub-ingress" style={{ marginTop: 12 }}>
              Innan du säger ja till ett erbjudande, säger upp dig eller går in i lönesamtalet: räkna på vad det betyder i
              kronor.
            </p>
            <Link className="rk-stortal" href="/rakna-ut/lon-efter-skatt">
              <div>
                <small className="rk-kalknamn">Lön efter skatt 2026</small>
                <h3>Se vad som blir kvar i handen</h3>
                <p>
                  Nettolön med Skatteverkets riktiga skattetabeller och din kommuns skattesats. Jämför två löner eller
                  kommuner.
                </p>
                <span className="pub-lank">Räkna på din lön</span>
              </div>
              <div>
                <p className="rk-tal-l">
                  {kr(lon.netto)}
                  <small>
                    kvar av {kr(LON_STANDARD.lon)} i {LON_STANDARD.kommun}, skattetabell {lon.tab}
                  </small>
                </p>
                <div className="rk-stapel rk-stapel-ljus" aria-hidden="true">
                  <i className="rk-ton-0" style={{ width: `${((lon.netto / LON_STANDARD.lon) * 100).toFixed(1)}%` }} />
                  <i className="rk-ton-1" style={{ width: `${((lon.skatt / LON_STANDARD.lon) * 100).toFixed(1)}%` }} />
                </div>
              </div>
            </Link>
            <KortRad kort={LONEKORT} />
          </div>
        </Rum>

        {/* 3. Bläck: löneförhandlingens värde och Jobbcoachen */}
        <Rum yta="premium" id="loneforhandling">
          <div className="pub-wrap pub-tva">
            <div className="pub-tva-text">
              <p className="pub-kick">{premie}</p>
              <p className="rk-storsiffra" aria-hidden="true">
                <span className="pub-gradord">{krTecken(forhandling.ar10)}</span>
              </p>
              <h2 className="pub-h2 rk-h2-mellan">
                {kr(FORHANDLING_STANDARD.hojning)} mer i månaden är värt {krTecken(forhandling.ar10)} på tio år
              </h2>
              <p className="pub-ingress" style={{ marginTop: 14 }}>
                Löneförhandlingens värde räknar ut vad en höjning blir när varje revision läggs ovanpå den. Jobbcoachen
                hjälper dig få den: marknadslön och argument ur SCB och fackens statistik, med källa till varje svar.
                Jobbcoachen, så mycket du vill, ingår i {paketKort()}, {prisPeriod(SALD_PLAN)}.
              </p>
              <div className="pub-handling">
                <Link className="pub-knapp" href="/verktyg/jobbcoachen">
                  Fråga jobbcoachen
                </Link>
                <Link className="pub-lank" href="/rakna-ut/loneforhandling">
                  Räkna på din egen höjning
                </Link>
              </div>
            </div>
            <div className="pub-mitt">
              <SkarmCoach />
            </div>
          </div>
        </Rum>

        {/* 4. För dig som anställer */}
        <Rum yta="panel" rum="neu" id="for-dig-som-anstaller" aria-label="För dig som anställer">
          <div className="pub-wrap">
            <h2 className="pub-h2">För dig som anställer</h2>
            <p className="pub-ingress" style={{ marginTop: 12 }}>
              Siffrorna som bär ett rekryteringsbeslut, räknade på era egna förutsättningar.
            </p>
            <Link className="rk-stortal" href="/rakna-ut/vad-kostar-en-anstalld">
              <div>
                <small className="rk-kalknamn">Vad kostar en anställd?</small>
                <h3>Vet vad en anställning kostar innan ni annonserar</h3>
                <p>Hela månadskostnaden 2026: arbetsgivaravgift, ITP1, särskild löneskatt, försäkringar och semester.</p>
                <span className="pub-lank">Räkna på en anställning</span>
              </div>
              <div>
                <p className="rk-tal-l">
                  {kr(anstalld.total)}
                  <small>i månaden för {kr(ANSTALLD_STANDARD.lon)} i lön med kollektivavtal</small>
                </p>
                <div className="rk-stapel rk-stapel-ljus" aria-hidden="true">
                  <i className="rk-ton-0" style={{ width: `${((ANSTALLD_STANDARD.lon / anstalld.total) * 100).toFixed(1)}%` }} />
                  <i className="rk-ton-1" style={{ width: `${(((anstalld.total - ANSTALLD_STANDARD.lon) / anstalld.total) * 100).toFixed(1)}%` }} />
                </div>
              </div>
            </Link>
            <KortRad kort={REKRYTERARKORT} />
            <p className="pub-liten rk-not">
              Siffran är början.{' '}
              <Link className="pub-lank" href="/for-rekryterare">
                Läs insikterna för rekryterare
              </Link>
            </p>
            <p className="pub-liten rk-not">
              Kalkylatorerna uppdateras årligen med nya skattetabeller, basbelopp och avgifter, senast för inkomståret 2026.
              De ger vägledning, inte skatte- eller juridisk rådgivning.
            </p>
          </div>
        </Rum>
      </main>
    </PubliktSida>
  )
}
