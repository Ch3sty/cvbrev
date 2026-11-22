/**
 * /rakna-ut, hubben för kalkylatorerna. Publikt omgång 3 (P5a): grundens
 * skal och komponenter (BYGGBRIEF beslut 10, ingen egen skiss). h1, title,
 * description, canonical, rubrikerna och länkarna är oförändrade sedan
 * publikt v2.
 *
 * Sektionsföljden:
 *   1. Hjälten på skogens vägg med lönebeskedet (räknat på servern ur
 *      beraknaLon(LON_STANDARD)) och talbrickorna, där antalet
 *      kalkylatorer räknas ur listan.
 *   2. För dig som söker jobb eller byter: lön efter skatt som stort kort
 *      med ett räknat exempel, sedan tre kort.
 *   3. Sidans mörkaste ton: löneförhandlingens värde, räknat ur
 *      loneforhandling.ts, och samtalet med Jobbcoachen.
 *   4. För dig som anställer på papper i grafit: vad en anställd kostar som
 *      stort kort, tre kort och länken till insikterna för rekryterare.
 *
 * Serverkomponent, ingen klient-JS utöver ramen och mätningen. Brödsmulan
 * (Breadcrumb) bär BreadcrumbList som förut.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import { Sida, Sektion, SektionHuvud, Talbrickor, Knapp, Knapprad, TextLank, Samtal } from '@/components/publikt/v3'
import { Stapel } from '@/components/rakna/ui'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { TABELLER } from '@/lib/rakna/sammanfattning'
import { SLUGGAR } from '@/lib/rakna/delning'
import { LON_STANDARD, beraknaLon } from '@/lib/rakna/lonEfterSkatt'
import { FORHANDLING_STANDARD, beraknaForhandling } from '@/lib/rakna/loneforhandling'
import { ANSTALLD_STANDARD, beraknaAnstalld } from '@/lib/rakna/anstalldKostnad'
import { kr, krTecken } from '@/lib/rakna/format'
import '@/components/rakna/rakna.css'
import '@/components/rakna/rakna-v3.css'
import ArtikelKlient from '@/components/artiklar/ArtikelKlient'

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
    <ul className="rk-kort rk3-kort">
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
    <Sida farg="jobb" className="rk3">
      <main>
        {/* 1. Hjälten */}
        <section id="hjalte" className="p3-vagg p3-hjalte p3-utan-lyft">
          <div className="p3-bredd">
            <div className="rk3-smula">
              <Breadcrumb
                items={[
                  { name: 'Hem', href: '/' },
                  { name: 'Räkna ut', href: '/rakna-ut' },
                ]}
              />
            </div>
            <div className="p3-hjalte-rad p3-med-bild">
              <div className="p3-hjalte-text">
                <p className="p3-ey">Räkna ut, gratis och utan konto</p>
                <h1 className="p3-h1 p3-h1-mindre">Räkna ut: kalkylatorer för lön, jobb och rekrytering</h1>
                <p className="p3-varde">
                  Gratis, utan konto och byggda på myndighetsdata och namngivna källor: Skatteverkets skattetabeller, LAS,
                  semesterlagen och Avtalats premier. <b>Varje verktyg redovisar öppet hur det räknar.</b>
                </p>
                <div className="p3-knapprad">
                  <Knapp href="/rakna-ut/lon-efter-skatt" pil data-primar="">
                    Räkna ut lön efter skatt
                  </Knapp>
                  <TextLank href="#for-dig-som-anstaller">Kalkylatorerna för rekryterare</TextLank>
                </div>
                <Talbrickor
                  brickor={[
                    { tal: String(SLUGGAR.length), text: 'kalkylatorer' },
                    { tal: '2026', text: 'års skattetabeller' },
                    { tal: '0 kr', text: 'och inget konto' },
                  ]}
                />
              </div>
              <div className="p3-hjalte-bild rk-besked-ram" aria-hidden="true">
                <div className="rk-besked rk3-besked">
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
                <div className="rk-lapp rk3-lapp">
                  <Bock />
                  <span>
                    <b>Skatteverkets tabell</b>samma som på lönebeskedet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. För dig som söker jobb eller byter */}
        <Sektion id="for-dig-som-soker-jobb" aria-label="För dig som söker jobb eller byter">
          <SektionHuvud
            rubrik="För dig som söker jobb eller byter"
            varde="Innan du säger ja till ett erbjudande, säger upp dig eller går in i lönesamtalet: räkna på vad det betyder i kronor."
          />
          <Link className="rk-stortal rk3-stortal" href="/rakna-ut/lon-efter-skatt">
            <div>
              <small className="rk-kalknamn">Lön efter skatt 2026</small>
              <h3>Se vad som blir kvar i handen</h3>
              <p>
                Nettolön med Skatteverkets riktiga skattetabeller och din kommuns skattesats. Jämför två löner eller
                kommuner.
              </p>
              <span className="p3-lank">Räkna på din lön</span>
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
        </Sektion>

        {/* 3. Löneförhandlingens värde och Jobbcoachen */}
        <Sektion id="loneforhandling" luft="utan-topp">
          {/* Nästa steg mäts som article_cta_clicked, slug rakna-ut (analysen 2026-11-08, punkt 11). */}
          <div
            className="p3-premium rk3-premium"
            data-cta-position="final"
            data-cta-cluster="career"
            data-cta-variant="rakna-ut"
            data-cta-slug="rakna-ut"
          >
            <div className="p3-premium-rad p3-med-lista">
              <div className="p3-premium-text">
                <p className="p3-ey">{premie}</p>
                <p className="rk-storsiffra rk3-storsiffra" aria-hidden="true">
                  <span className="rk3-ord">{krTecken(forhandling.ar10)}</span>
                </p>
                <h2 className="p3-h2 rk-h2-mellan">
                  {kr(FORHANDLING_STANDARD.hojning)} mer i månaden är värt {krTecken(forhandling.ar10)} på tio år
                </h2>
                <p className="rk3-text">
                  Löneförhandlingens värde räknar ut vad en höjning blir när varje revision läggs ovanpå den. Jobbcoachen
                  hjälper dig få den: marknadslön och argument ur SCB och fackens statistik, med källa till varje svar.
                  Jobbcoachen, så mycket du vill, ingår i {paketKort()}, {prisPeriod(SALD_PLAN)}.
                </p>
                <Knapprad>
                  <Knapp href="/verktyg/jobbcoachen" data-cta-klick="/verktyg/jobbcoachen">
                    Fråga Jobbcoachen
                  </Knapp>
                  <TextLank href="/rakna-ut/loneforhandling" data-cta-klick="/rakna-ut/loneforhandling">
                    Räkna på din egen höjning
                  </TextLank>
                </Knapprad>
                <p className="p3-liten">
                  Ska du på intervju? Många arbetsgivare har logiktest och personlighetstest i samma process.{' '}
                  <Link className="rk3-lank" href="/verktyg/rekryteringstester/prova" data-cta-klick="/verktyg/rekryteringstester/prova">
                    Prova fem testfrågor gratis
                  </Link>{' '}
                  eller{' '}
                  <Link className="rk3-lank" href="/verktyg/rekryteringstester" data-cta-klick="/verktyg/rekryteringstester">
                    se alla rekryteringstester
                  </Link>
                  .
                </p>
              </div>
              <div className="rk3-samtal" aria-hidden="true">
                <Samtal yta />
              </div>
            </div>
          </div>
        </Sektion>

        {/* 4. För dig som anställer */}
        <Sektion botten="papper" id="for-dig-som-anstaller" aria-label="För dig som anställer">
          <SektionHuvud
            rubrik="För dig som anställer"
            varde="Siffrorna som bär ett rekryteringsbeslut, räknade på era egna förutsättningar."
          />
          <Link className="rk-stortal rk3-stortal" href="/rakna-ut/vad-kostar-en-anstalld">
            <div>
              <small className="rk-kalknamn">Vad kostar en anställd?</small>
              <h3>Vet vad en anställning kostar innan ni annonserar</h3>
              <p>Hela månadskostnaden 2026: arbetsgivaravgift, ITP1, särskild löneskatt, försäkringar och semester.</p>
              <span className="p3-lank">Räkna på en anställning</span>
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
          <p className="p3-liten rk-not">
            Siffran är början.{' '}
            <Link className="rk3-lank" href="/for-rekryterare">
              Läs insikterna för rekryterare
            </Link>
          </p>
          <p className="p3-liten rk-not">
            Kalkylatorerna uppdateras årligen med nya skattetabeller, basbelopp och avgifter, senast för inkomståret 2026.
            De ger vägledning, inte skatte- eller juridisk rådgivning.
          </p>
        </Sektion>
      </main>
      <ArtikelKlient cluster="career" />
    </Sida>
  )
}
