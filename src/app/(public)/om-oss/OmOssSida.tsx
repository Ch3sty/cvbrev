/**
 * Om oss i linjen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5): hero med IlluScenSkrivbordet, berättelsen som en panel med
 * tidslinje i ink där tråden markerar "nu", tre löften som rader med
 * display-siffror, talen som display-tal med mening, och kontakten som
 * sidans enda bläckyta. Fjorton ikonkort är borta. Serverkomponent.
 *
 * h1 och JSON-LD är oförändrade (i page.tsx).
 */

import Link from 'next/link'
import InkPanel, { INK_KNAPP, INK_LANK } from '@/components/shell/InkPanel'
import { IlluScenSkrivbordet } from '@/components/illustrations/PriserScener'
import Breadcrumb from '@/components/Breadcrumb'

const KNAPP =
  'inline-flex h-12 w-full items-center justify-center rounded-lg bg-ink-1 px-5 text-base font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto'
const LANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'
const SEKTION = 'mt-16 scroll-mt-24 lg:mt-[88px]'

const MILSTOLPAR = [
  {
    period: '2023',
    rubrik: 'Det började som cvbrev.se',
    text: 'En enkel idé: göra det lättare att skriva personliga brev som fungerar för svenska arbetsgivare. Tusentals användare kom snabbare till sitt första utkast.',
  },
  {
    period: 'Hösten 2024',
    rubrik: 'Användarna ville ha mer',
    text: 'Det personliga brevet var bara ena halvan. Användarna bad om hjälp med CV, jobbsökning, intervjuförberedelse och lön. Problemet var större än vi först trott.',
  },
  {
    period: 'Vintern 2024',
    rubrik: 'cvbrev.se blev Jobbcoach.ai',
    text: 'Det nya namnet speglar det större uppdraget: en partner genom hela jobbsöket, från första utkastet till första anställningsdagen.',
  },
  {
    period: '2025 och framåt',
    rubrik: 'En plattform med fler verktyg',
    text: 'Vi lanserar verktyg löpande, alla med svenska källor och svensk arbetsmarknad som utgångspunkt: jobbmatchning, rekryteringstester, LinkedIn-profilen och Jobbcoachen.',
    nu: true,
  },
]

const LOFTEN = [
  {
    rubrik: 'Du behåller kontrollen',
    text: 'Vi loggar aldrig in på dina konton, varken LinkedIn, Arbetsförmedlingen eller någon annanstans. Du klistrar in det som behövs och kopierar tillbaka resultatet. Inget delat lösenord, ingen automatik bakom ryggen.',
  },
  {
    rubrik: 'Svenska källor i botten',
    text: 'Svaren bygger på Arbetsförmedlingen, SCB, fackförbunden, Försäkringskassan, CSN och Skatteverket. Vi gissar inte, vi hänvisar, och varje siffra går att följa till källan.',
  },
  {
    rubrik: 'Du betalar för veckorna du söker',
    text: 'Du provar varje verktyg utan kortuppgifter. Behöver du mer väljer du spåret du söker på och betalar en vecka i taget, och säger upp i ditt konto utan att uppge skäl.',
  },
]

export default function OmOssSida({ konton, brev }: { konton: number | null; brev: number | null }) {
  return (
    <main className="min-h-screen bg-mark">
      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-6 lg:px-12 lg:pb-[72px] lg:pt-10">
        <Breadcrumb
          items={[
            { name: 'Hem', href: '/' },
            { name: 'Om oss', href: '/om-oss' },
          ]}
        />

        <header className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
          <div>
            <p className="text-steg font-semibold uppercase tracking-[0.08em] text-ink-3">Om Jobbcoach.ai</p>
            <h1 className="mt-2 max-w-[16ch] text-h1-pub text-ink-1 lg:mt-3">Vi hjälper dig att nå dina karriärmål</h1>
            <p className="mt-4 max-w-[52ch] text-base leading-[27px] text-ink-2 lg:mt-6 lg:text-lg lg:leading-[29px]">
              Vi har byggt jobbverktyg som förstår svensk arbetsmarknad. Ingen amerikansk import, ingen gissning.{' '}
              <b className="font-semibold text-ink-1">Verktygen vi själva hade velat ha när vi sökte jobb.</b>
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/funktioner" className={KNAPP}>
                Se våra verktyg
              </Link>
              <a href="#vart-team" className={LANK}>
                Så började det
              </a>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[360px] text-ink-1" aria-hidden="true">
            <IlluScenSkrivbordet className="h-auto w-full" />
          </div>
        </header>

        {/* Berättelsen: en panel med tidslinje i ink, tråden markerar nu. */}
        <section id="vart-team" aria-labelledby="om-berattelse" className={SEKTION}>
          <div className="rounded-xl border border-kant bg-panel p-5 sm:p-8">
            <p className="text-steg uppercase text-ink-3">Vår historia</p>
            <h2 id="om-berattelse" className="mt-2 text-h2-pub text-ink-1">
              Från cvbrev.se till Jobbcoach.ai
            </h2>
            <ol className="mt-6 border-l-2 border-ink-1">
              {MILSTOLPAR.map((m) => (
                <li key={m.rubrik} className={`relative pb-6 pl-6 last:pb-0 ${m.nu ? 'thread-row' : ''}`}>
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-ink-1 ${m.nu ? 'bg-ink-1' : 'bg-panel'}`}
                  />
                  <p className="text-steg uppercase text-ink-3">
                    {m.period}
                    {m.nu ? ' · nu' : ''}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-ink-1">{m.rubrik}</h3>
                  <p className="mt-1 max-w-[62ch] text-sm leading-[22px] text-ink-2">{m.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Tre löften som rader med display-siffror. */}
        <section aria-labelledby="om-loften" className={SEKTION}>
          <h2 id="om-loften" className="text-h2-pub text-ink-1">
            Tre saker vi lovar
          </h2>
          <ol className="mt-6">
            {LOFTEN.map((l, i) => (
              <li key={l.rubrik} className="flex gap-4 border-t border-kant py-5">
                <span aria-hidden="true" className="w-10 shrink-0 font-display text-[32px] font-extrabold leading-8 text-ink-1">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink-1">{l.rubrik}</h3>
                  <p className="mt-1 max-w-[70ch] text-sm leading-[22px] text-ink-2">{l.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Talen, med en mening var. */}
        {konton || brev ? (
          <section aria-label="Jobbcoach.ai i siffror" className={SEKTION}>
            <div className="grid gap-8 sm:grid-cols-2">
              {konton ? (
                <div>
                  <p className="text-tal-display text-ink-1">{konton.toLocaleString('sv-SE')}+</p>
                  <p className="mt-2 text-sm leading-[22px] text-ink-2">
                    har skapat konto för att söka jobb med svenska verktyg.
                  </p>
                </div>
              ) : null}
              {brev ? (
                <div>
                  <p className="text-tal-display text-ink-1">{brev.toLocaleString('sv-SE')}+</p>
                  <p className="mt-2 text-sm leading-[22px] text-ink-2">
                    personliga brev skrivna på riktiga annonser sedan starten.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <div className={SEKTION}>
          <InkPanel
            eyebrow="Kontakt"
            title="Saknar du något, eller har du en fråga?"
            text="Vi läser varje mejl och svarar inom ett par vardagar. Mycket av det som finns i verktygen i dag kom från användare som skrev till oss."
            action={
              <Link href="/register" className={INK_KNAPP}>
                Skapa konto gratis
              </Link>
            }
            secondary={
              <a href="mailto:info@jobbcoach.ai" className={INK_LANK}>
                info@jobbcoach.ai
              </a>
            }
          />
        </div>
      </div>
    </main>
  )
}
