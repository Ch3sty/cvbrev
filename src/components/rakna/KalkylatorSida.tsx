/**
 * KalkylatorSida: mallen för de nio kalkylatorerna under /rakna-ut, syskon
 * till VerktygsSida (docs/designsystem.md avsnitt 12, regel 9).
 *
 * Sektionsföljden:
 *   1. Hero på mark: brödsmulor, eyebrow, h1 i text-h1-pub (sidans
 *      befintliga, den rankar), ingressen, scenen till höger från lg.
 *   2. Kalkylatorn: fälten i panel, resultatet som sidans enda bläckyta
 *      med talet i display, fördelningen, källan och Dela-knappen.
 *   3. "Så räknar vi" som text på mark, med källorna som lista bredvid.
 *   4. Nästa steg som upphöjd panel: jobbcoachen och Hela paketet för lönesidorna,
 *      insikterna för rekryterare för rekryterarsidorna (inget paket).
 *   5. Frågorna som details och summary, direkt på mark.
 *   6. Läs mer som lista på mark.
 *
 * Schemat (WebApplication, FAQPage) och brödsmulorna är desamma som i
 * RaknaUtSida före linjen: samma namn, beskrivning och frågor.
 *
 * Serverkomponent. Kalkylatorn skickas in färdig med sitt startläge: förvalen
 * på den statiska sidan, länkens parametrar på den delade vyn.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import { IlluScenKalkylator } from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY } from '@/lib/plans/plans'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT } from '@/lib/quota/quotaService'
import type { Slug } from '@/lib/rakna/delning'

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
}

const SEKTION = 'mt-16 lg:mt-[88px]'
const LANK =
  'text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'
const SEKUNDAR =
  'inline-flex h-11 w-full items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken sm:w-auto'

function NastaSteg({ kategori }: { kategori: Kategori }) {
  if (kategori === 'rekryterare') {
    return (
      <section aria-label="Insikter för rekryterare" className="rounded-xl border border-kant-stark bg-panel p-4 sm:p-6">
        <p className="text-steg uppercase text-ink-3">För rekryterare</p>
        <h2 className="mt-2 text-varde text-ink-1">Siffran är början. Insikterna tar er vidare.</h2>
        <p className="mt-2 max-w-[60ch] text-sm leading-[22px] text-ink-2 sm:text-base sm:leading-6">
          Våra insikter för rekryterare går igenom vad ni gör med resultatet: kravprofilen, den strukturerade
          intervjun, testerna och referenserna, med källorna utskrivna.
        </p>
        <div className="mt-4">
          <Link href="/for-rekryterare" className={SEKUNDAR}>
            Läs insikterna för rekryterare
          </Link>
        </div>
      </section>
    )
  }
  const vecka = PLAN_BY_KEY.all_week
  const manad = PLAN_BY_KEY.all_month
  return (
    <section aria-label="Jobbcoachen" className="rounded-xl border border-kant-stark bg-panel p-4 sm:p-6">
      <p className="text-steg uppercase text-ink-3">Ingår i Hela paketet, {vecka.amount} kr i veckan</p>
      <h2 className="mt-2 text-varde text-ink-1">Ta siffrorna med in i lönesamtalet</h2>
      <p className="mt-2 max-w-[60ch] text-sm leading-[22px] text-ink-2 sm:text-base sm:leading-6">
        Jobbcoachen tar fram marknadslön och argument ur SCB och fackens statistik, med källa till varje svar, och
        hjälper dig lägga upp samtalet. {FREE_CHAT_MESSAGES_PER_ACCOUNT} meddelanden är gratis på ditt konto.
        Jobbcoachen, så mycket du vill, ingår i Hela paketet, {vecka.amount} kr i veckan eller {manad.amount} kr i månaden.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <Link href="/verktyg/jobbcoachen" className={SEKUNDAR}>
          Fråga jobbcoachen
        </Link>
        <Link href="/priser" className={`${LANK} inline-flex min-h-11 items-center`}>
          Se vad Hela paketet innehåller
        </Link>
      </div>
    </section>
  )
}

export default function KalkylatorSida({ slug, titel, intro, metod, faq, kallor, relaterade, kategori, kalkylator }: KalkylatorSidaProps) {
  const url = `https://www.jobbcoach.ai/rakna-ut/${slug}`
  // Ett ord som Träffsäkerhetssimulatorn får inte plats i 32 px på 375 px.
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
    <main className="min-h-screen bg-mark">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-6 lg:px-12 lg:pb-[72px] lg:pt-10">
        <Breadcrumb
          items={[
            { name: 'Hem', href: '/' },
            { name: 'Räkna ut', href: '/rakna-ut' },
            { name: titel, href: `/rakna-ut/${slug}` },
          ]}
        />

        {/* 1. Hero */}
        <header className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
          <div className="min-w-0">
            <p className="text-steg font-semibold uppercase tracking-[0.08em] text-ink-3">
              Räkna ut · gratis, utan konto
            </p>
            <h1 className={`mt-2 max-w-[20ch] text-h1-pub text-ink-1 [hyphens:auto] [overflow-wrap:anywhere] lg:mt-3 ${langtOrd ? 'max-sm:text-[28px] max-sm:leading-[32px]' : ''}`}>{titel}</h1>
            <p className="mt-4 max-w-[60ch] text-base leading-[27px] text-ink-2 lg:mt-6 lg:text-lg lg:leading-[29px]">
              {intro}
            </p>
          </div>
          <div className="hidden text-ink-1 lg:block" aria-hidden="true">
            <IlluScenKalkylator className="h-auto w-full" />
          </div>
        </header>

        {/* 2. Kalkylatorn */}
        <div className="mt-8 lg:mt-12">
          {kalkylator}
        </div>

        {/* 3. Så räknar vi */}
        <section aria-label="Så räknar vi" className={SEKTION}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
            <div>
              <h2 className="text-h2-pub text-ink-1">Så räknar vi</h2>
              <div className="mt-4 max-w-[68ch] space-y-4 text-base leading-[27px] text-ink-2 [&_a]:font-medium [&_a]:text-ink-1 [&_a]:underline [&_a]:decoration-kant-stark [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-ink-1">
                {metod}
              </div>
            </div>
            <aside aria-label="Källor">
              <p className="text-sm font-medium text-ink-3">Källor</p>
              <ul className="mt-2">
                {kallor.map((k) => (
                  <li key={k.href} className="border-t border-kant py-3">
                    <a href={k.href} target="_blank" rel="noopener noreferrer" className={LANK}>
                      {k.text}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-meta text-ink-3">
                Uppdaterad för inkomståret 2026. Vi går igenom siffrorna varje januari. Vägledning, inte skatte- eller
                juridisk rådgivning.
              </p>
            </aside>
          </div>
        </section>

        {/* 4. Nästa steg */}
        <div className={SEKTION}>
          <NastaSteg kategori={kategori} />
        </div>

        {/* 5. Frågorna */}
        <section aria-label="Vanliga frågor" className={SEKTION}>
          <h2 className="text-h2-pub text-ink-1">Vanliga frågor</h2>
          <div className="mt-6 border-b border-kant">
            {faq.map((f, i) => (
              <details key={f.q} open={i === 0} className="group border-t border-kant">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-base font-semibold text-ink-1 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="shrink-0 text-ink-3 group-open:hidden" aria-hidden="true">
                    +
                  </span>
                  <span className="hidden shrink-0 text-ink-3 group-open:inline" aria-hidden="true">
                    −
                  </span>
                </summary>
                <p className="max-w-[72ch] pb-4 text-sm leading-[22px] text-ink-2 sm:text-base sm:leading-[26px]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 6. Läs mer */}
        <section aria-label="Läs mer" className={SEKTION}>
          <h2 className="text-sm font-medium text-ink-3">Läs mer</h2>
          <ul className="mt-2 grid gap-x-12 md:grid-cols-2">
            {relaterade.map((l) => (
              <li key={l.href} className="border-t border-kant py-3">
                <Link href={l.href} className={LANK}>
                  {l.text}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/rakna-ut" className={`mt-6 inline-flex min-h-11 items-center ${LANK}`}>
            Alla kalkylatorer
          </Link>
        </section>
      </div>
    </main>
  )
}
