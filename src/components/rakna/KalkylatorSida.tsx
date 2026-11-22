/**
 * KalkylatorSida: mallen för de nio kalkylatorerna under /rakna-ut.
 * Publikt omgång 3 (P5a): grundens skal och komponenter (BYGGBRIEF beslut
 * 10, ingen egen skiss), texten, rubrikerna och länkarna som i publikt v2.
 *
 * Sektionsföljden:
 *   1. Hjälten på väggen (skog för lön och jobb, grafit för rekryterarna)
 *      bär kalkylatorn: etikett, h1, ingress och tre bevis till vänster,
 *      fälten och resultatet till höger. I telefonen står kalkylatorn
 *      direkt under h1 (CSS-ordning), DOM-ordningen är h1, ingress,
 *      kalkylator.
 *   2. "Så räknar vi" på golvet, med källorna på ett eget kort.
 *   3. Jobbcoachen på sidans mörkaste ton med samtalet (lönesidorna), eller
 *      insikterna för rekryterare på papper (rekryterarsidorna, inget paket).
 *   4. Frågorna och Läs mer.
 *
 * Schemat (WebApplication, FAQPage), brödsmulorna (Breadcrumb bär
 * BreadcrumbList som förut), rubrikerna och länkarna är desamma som före.
 * Serverkomponent; kalkylatorn är en klientö som skickas in färdig med sitt
 * startläge. Kalkylatorns egna klasser (rk-kalk, rk-res) står i rakna.css,
 * som också artiklarna och /embed läser; skalet står i rakna-v3.css.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import '@/components/publikt/publikt.css'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import { Sida, Sektion, SektionHuvud, Faq, Knapp, Knapprad, TextLank, Samtal } from '@/components/publikt/v3'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT } from '@/lib/quota/quotaService'
import type { Slug } from '@/lib/rakna/delning'
import ArtikelKlient from '@/components/artiklar/ArtikelKlient'
import './rakna.css'
import './rakna-v3.css'

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
  /** Etiketten över h1. */
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
      <circle cx="28" cy="29" r="6" fill="var(--papper)" />
      <path d="M25.5 29l2 2 3.5-4" />
    </svg>
  )
}

/**
 * Nästa steg efter lönesidorna: Jobbcoachen och testerna (analysen
 * 2026-11-08, punkt 11). Klicken mäts av ArtikelKlient som
 * article_cta_clicked med slug rakna-ut/<sidan> och target = målet.
 */
function Jobbcoachen({ slug }: { slug: Slug }) {
  return (
    <Sektion id="lonesamtal" luft="tat">
      <div
        className="p3-premium rk3-premium"
        data-cta-position="final"
        data-cta-cluster="career"
        data-cta-variant="rakna-ut"
        data-cta-slug={`rakna-ut/${slug}`}
      >
        <div className="p3-premium-rad p3-med-lista">
          <div className="p3-premium-text">
            <p className="p3-ey">
              Ingår i {paketKort()}, {prisPeriod(SALD_PLAN)}
            </p>
            <h2 className="p3-h2">
              Ta siffrorna med in i <span className="rk3-ord">lönesamtalet</span>
            </h2>
            <p className="rk3-text">
              Jobbcoachen tar fram marknadslön och argument ur SCB och fackens statistik, med källa till varje svar, och
              hjälper dig lägga upp samtalet. {FREE_CHAT_MESSAGES_PER_ACCOUNT} meddelanden är gratis på ditt konto.
              Jobbcoachen, så mycket du vill, ingår i {paketKort()}.
            </p>
            <Knapprad>
              <Knapp href="/verktyg/jobbcoachen" data-cta-klick="/verktyg/jobbcoachen">
                Fråga Jobbcoachen
              </Knapp>
              <TextLank href="/priser" data-cta-klick="/priser">
                Se vad som ingår
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
  )
}

function Insikterna() {
  return (
    <Sektion botten="papper" id="insikter">
      <div className="rk3-insikt">
        <SektionHuvud
          etikett="För rekryterare"
          rubrik="Siffran är början. Insikterna tar er vidare."
          varde="Våra insikter för rekryterare går igenom vad ni gör med resultatet: kravprofilen, den strukturerade intervjun, testerna och referenserna, med källorna utskrivna."
        />
        <Knapprad>
          <Knapp href="/for-rekryterare">Läs insikterna för rekryterare</Knapp>
        </Knapprad>
      </div>
    </Sektion>
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
      {/* Sidans färg: skog, som navet /rakna-ut. Rekryterarsidorna hör till Jobbsökets andra sida. */}
      <Sida farg="jobb" className="rk3">
        <main>
          {/* 1. Hjälten bär kalkylatorn */}
          <section id="hjalte" className="p3-vagg p3-hjalte p3-utan-lyft rk3-hjalte">
            <div className="p3-bredd">
              <div className="rk3-smula">
                <Breadcrumb
                  items={[
                    { name: 'Hem', href: '/' },
                    { name: 'Räkna ut', href: '/rakna-ut' },
                    { name: titel, href: `/rakna-ut/${slug}` },
                  ]}
                />
              </div>
              <div className="rk-hjalte-g">
                <div className="rk-hjalte-text">
                  <p className="p3-ey">{kick ?? 'Kalkylator, gratis och utan konto'}</p>
                  <h1 className={`p3-h1 rk-h1 ${langtOrd ? 'rk-h1-lang' : ''}`.trim()}>{titel}</h1>
                  <p className="p3-varde rk-ingress">{intro}</p>
                  <ul className="rk-bevis">
                    {(bevis ?? BEVIS[kategori]).map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
                {kalkylator}
              </div>
            </div>
          </section>

          {/* 2. Så räknar vi */}
          <Sektion id="sa-raknar-vi">
            <div className="rk-metod">
              <div>
                <p className="p3-ey">Metod</p>
                <h2 className="p3-h2 rk3-h2">Så räknar vi</h2>
                <div className="rk-brod">{metod}</div>
              </div>
              <aside className="p3-kort rk3-kallkort" aria-label="Källor">
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
                <p className="p3-liten">
                  Uppdaterad för inkomståret 2026. Vi går igenom siffrorna varje januari. Vägledning, inte skatte- eller
                  juridisk rådgivning.
                </p>
              </aside>
            </div>
          </Sektion>

          {/* 3. Nästa steg */}
          {kategori === 'lon' ? <Jobbcoachen slug={slug} /> : <Insikterna />}

          {/* 4. Frågorna och Läs mer */}
          <Sektion botten="ton" id="fragor">
            <Faq rubrik="Vanliga frågor" fragor={faq} />
            <h2 className="p3-h3 rk3-rub-liten">Läs mer</h2>
            <ul className="rk-merom rk3-merom">
              {relaterade.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.text}</Link>
                </li>
              ))}
              <li>
                <Link href="/rakna-ut">Alla kalkylatorer</Link>
              </li>
            </ul>
          </Sektion>
        </main>
        <FastKnapprad text="Räkna ut" href="#kalkylator" observera="hjalte" />
        {/* Mätningen av nästa steg (punkt 11). Utan slug: ingen article_viewed. */}
        <ArtikelKlient cluster="career" />
      </Sida>
    </>
  )
}
