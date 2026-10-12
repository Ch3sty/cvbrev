/**
 * KalkylatorSida: mallen för de nio kalkylatorerna under /rakna-ut, publikt
 * v2 (docs/design/spec-publikt-v2-del-b-2026-10-12.md avsnitt 3.5, skissen
 * flik #raknaut).
 *
 * Sektionsföljden:
 *   1. Hjälten på vägg (jobb för lön och jobb, neu för rekryterarna) bär
 *      kalkylatorn: kick, h1, ingress och tre bevis till vänster, fälten och
 *      resultatet på bläck till höger. På mobil står kalkylatorn direkt
 *      under h1 (CSS-ordning), DOM-ordningen är h1, ingress, kalkylator.
 *   2. "Så räknar vi" på mark, med källorna i ett eget kort.
 *   3. Jobbcoachen på bläck med telefonen (lönesidorna), eller insikterna
 *      för rekryterare på panel (rekryterarsidorna, inget paket).
 *   4. Frågorna och Läs mer på mark.
 *
 * Schemat (WebApplication, FAQPage), brödsmulorna, rubrikerna och länkarna
 * är desamma som före v2. Serverkomponent; kalkylatorn är en klientö som
 * skickas in färdig med sitt startläge.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import PubliktSida from '@/components/publikt/PubliktSida'
import Rum from '@/components/publikt/Rum'
import Faq from '@/components/publikt/Faq'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import SkarmCoach from '@/components/publikt/telefon/skarmar/SkarmCoach'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT } from '@/lib/quota/quotaService'
import type { Slug } from '@/lib/rakna/delning'
import './rakna.css'

type FaqPost = { q: string; a: string }
type LankPost = { text: string; href: string }

export type Kategori = 'lon' | 'rekryterare'

export interface KalkylatorSidaProps {
  slug: Slug
  titel: string
  intro: string
  metod: ReactNode
  faq: FaqPost[]
  kallor: LankPost[]
  relaterade: LankPost[]
  kategori: Kategori
  /** Kalkylatorn med sitt startläge, från ./start/<slug>. */
  kalkylator: ReactNode
  /** Kicken över h1. */
  kick?: string
  /** Tre korta bevis under ingressen. */
  bevis?: readonly string[]
}

const BEVIS: Record<Kategori, readonly string[]> = {
  lon: ['Namngivna källor', 'Uppdaterad för 2026', 'Utan konto'],
  rekryterare: ['Namngivna källor', 'Era egna siffror', 'Utan konto'],
}

/** Dokument med bock, för källkortet. */
function KallIkon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M11 5h13l7 7v21a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      <path d="M24 5v7h7M14 18h12M14 23h8" />
      <circle cx="28" cy="29" r="6" fill="var(--panel)" />
      <path d="M25.5 29l2 2 3.5-4" />
    </svg>
  )
}

function Jobbcoachen() {
  return (
    <Rum yta="premium" id="lonesamtal">
      <div className="pub-wrap pub-tva">
        <div className="pub-tva-text">
          <p className="pub-kick">
            Ingår i {paketKort()}, {prisPeriod(SALD_PLAN)}
          </p>
          <h2 className="pub-h2">
            Ta siffrorna med in i <span className="pub-gradord">lönesamtalet</span>
          </h2>
          <p className="pub-ingress" style={{ marginTop: 16 }}>
            Jobbcoachen tar fram marknadslön och argument ur SCB och fackens statistik, med källa till varje svar, och
            hjälper dig lägga upp samtalet. {FREE_CHAT_MESSAGES_PER_ACCOUNT} meddelanden är gratis på ditt konto.
            Jobbcoachen, så mycket du vill, ingår i {paketKort()}, {prisPeriod(SALD_PLAN)}.
          </p>
          <div className="pub-handling">
            <Link className="pub-knapp" href="/verktyg/jobbcoachen">
              Fråga jobbcoachen
            </Link>
            <Link className="pub-lank" href="/priser">
              Se vad som ingår
            </Link>
          </div>
        </div>
        <div className="pub-mitt">
          <SkarmCoach />
        </div>
      </div>
    </Rum>
  )
}

function Insikterna() {
  return (
    <Rum yta="panel" rum="neu" id="insikter">
      <div className="pub-wrap rk-insikt">
        <div>
          <p className="pub-kick">För rekryterare</p>
          <h2 className="pub-h2">Siffran är början. Insikterna tar er vidare.</h2>
          <p className="pub-ingress" style={{ marginTop: 16 }}>
            Våra insikter för rekryterare går igenom vad ni gör med resultatet: kravprofilen, den strukturerade
            intervjun, testerna och referenserna, med källorna utskrivna.
          </p>
        </div>
        <div className="pub-handling" style={{ marginTop: 0 }}>
          <Link className="pub-knapp" href="/for-rekryterare">
            Läs insikterna för rekryterare
          </Link>
        </div>
      </div>
    </Rum>
  )
}

export default function KalkylatorSida({
  slug,
  titel,
  intro,
  metod,
  faq,
  kallor,
  relaterade,
  kategori,
  kalkylator,
  kick,
  bevis,
}: KalkylatorSidaProps) {
  const url = `https://www.jobbcoach.ai/rakna-ut/${slug}`
  const rum = kategori === 'lon' ? 'jobb' : 'neu'
  // Ett ord som Träffsäkerhetssimulatorn får inte plats i full storlek på 360 px.
  const langtOrd = titel.split(' ').some((o) => o.length > 18)

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: titel,
    description: intro,
    url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'SEK' },
    publisher: { '@type': 'Organization', name: 'Jobbcoach.ai', url: 'https://www.jobbcoach.ai' },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PubliktSida>
        <main>
          {/* 1. Hjälten bär kalkylatorn */}
          <Rum rum={rum} yta="vagg" id="hjalte" className="rk-hjalte" vag="mark">
            <div className="pub-wrap">
              <Breadcrumb
                items={[
                  { name: 'Hem', href: '/' },
                  { name: 'Räkna ut', href: '/rakna-ut' },
                  { name: titel, href: `/rakna-ut/${slug}` },
                ]}
              />
              <div className="rk-hjalte-g">
                <div className="rk-hjalte-text">
                  <p className="pub-kick">{kick ?? 'Kalkylator, gratis och utan konto'}</p>
                  <h1 className={`rk-h1 ${langtOrd ? 'rk-h1-lang' : ''}`.trim()}>{titel}</h1>
                  <p className="pub-ingress rk-ingress">{intro}</p>
                  <ul className="rk-bevis">
                    {(bevis ?? BEVIS[kategori]).map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
                {kalkylator}
              </div>
            </div>
          </Rum>

          {/* 2. Så räknar vi */}
          <Rum yta="mark" rum={rum} id="sa-raknar-vi">
            <div className="pub-wrap rk-metod">
              <div>
                <p className="pub-kick" style={{ color: 'var(--rum-ink)' }}>
                  Metod
                </p>
                <h2 className="pub-h2">Så räknar vi</h2>
                <div className="rk-brod">{metod}</div>
              </div>
              <aside className="rk-kallkort" aria-label="Källor">
                <div className="rk-kallkort-topp">
                  <KallIkon />
                </div>
                <p className="rk-sidorub">Källor</p>
                <ul className="rk-kallista">
                  {kallor.map((k) => (
                    <li key={k.href}>
                      <a href={k.href} target="_blank" rel="noopener noreferrer">
                        {k.text}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="pub-liten" style={{ marginTop: 14 }}>
                  Uppdaterad för inkomståret 2026. Vi går igenom siffrorna varje januari. Vägledning, inte skatte- eller
                  juridisk rådgivning.
                </p>
              </aside>
            </div>
          </Rum>

          {/* 3. Nästa steg */}
          {kategori === 'lon' ? <Jobbcoachen /> : <Insikterna />}

          {/* 4. Frågorna och Läs mer */}
          <Rum yta="mark" id="fragor">
            <div className="pub-wrap" style={{ maxWidth: 820 }}>
              <Faq rubrik="Vanliga frågor" fragor={faq} />
              <h2 className="rk-rub-liten">Läs mer</h2>
              <ul className="rk-merom">
                {relaterade.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.text}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/rakna-ut">Alla kalkylatorer</Link>
                </li>
              </ul>
            </div>
          </Rum>
        </main>
        <FastKnapprad text="Räkna ut" href="#kalkylator" observera="hjalte" />
      </PubliktSida>
    </>
  )
}
