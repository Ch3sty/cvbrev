/**
 * VerktygsSida: en mall för de nio verktygssidorna under /verktyg
 * (docs/design/analys-visuell-linje-2026-09-22.html, avsnitt 5, "Övriga
 * publika ytor", och steg 9 i insatsordningen).
 *
 * Sektionsföljden i designsystemets §12:
 *   1. Hero på mark: brödsmulor, eyebrow, h1 i text-h1-pub (texten är
 *      sidans befintliga, den rankar), ingress med en fetad mening,
 *      bläckknapp plus textlänk, löftena i display. Till höger den handling
 *      som går att göra direkt (ladda upp CV, klistra in annons) som panel,
 *      eller scenen när sidan saknar en sådan.
 *   2. "Så fungerar det" som rader med display-siffror, med scenen i egen
 *      kolumn när heron bär handlingen.
 *   3. "Vad vi kontrollerar" som en lista på mark i två kolumner.
 *   4. Valfria rader med mer innehåll (tips, bevis), direkt på mark.
 *   5. Citatet som panel.
 *   6. Sidans enda bläckyta: paketet eller gratisnivån.
 *   7. Frågorna som details och summary.
 *
 * Serverkomponent. Handlingen och eventuella extra delar skickas in som
 * färdiga element och får vara klientkomponenter. Schemat (WebApplication,
 * HowTo, FAQPage) ligger kvar i respektive page.tsx och rörs inte.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import InkPanel, { INK_KNAPP, INK_LANK } from '@/components/shell/InkPanel'

export interface VerktygsLank {
  text: string
  href: string
}

export interface VerktygsRad {
  rubrik: string
  text: ReactNode
}

export interface VerktygsSidaProps {
  brodsmulor: { name: string; href: string }[]
  eyebrow: string
  /** Sidans h1, ordagrant som förut. */
  h1: ReactNode
  ingress: ReactNode
  /** Den fetade meningen i ingressen, sist. */
  fet?: ReactNode
  primar: VerktygsLank & { dataCta?: string }
  sekundar?: VerktygsLank
  /** Löftena under knapparna: tal plus kort text. */
  loften?: { tal: string; text: string }[]
  /** Scen i 240 × 200 ur PriserScener-familjen. */
  scen: ReactNode
  /** Den handling som går att göra direkt, som panel i heron. */
  handling?: ReactNode
  /** Id på handlingens ankare, till exempel "mini-analys". */
  handlingId?: string

  steg: { id?: string; rubrik: string; ingress?: string; rader: VerktygsRad[]; lank?: VerktygsLank }
  kontroll?: { id?: string; eyebrow?: string; rubrik: string; ingress?: string; rader: VerktygsRad[] }
  /** Extra sektioner med rader, direkt på mark. */
  extra?: { id?: string; eyebrow?: string; rubrik: string; ingress?: string; rader: VerktygsRad[]; lank?: VerktygsLank }[]
  /** Fria element efter listorna, till exempel en demo som redan finns. */
  fritt?: ReactNode
  citat?: { text: string; namn: string; roll?: string }
  slut: {
    eyebrow: string
    rubrik: string
    text: ReactNode
    knapp: VerktygsLank
    sekundar?: VerktygsLank
    scen?: ReactNode
  }
  faq: { id?: string; rubrik: string; ingress?: ReactNode; fragor: readonly { q: string; a: string }[] }
}

const KNAPP =
  'inline-flex h-12 w-full items-center justify-center rounded-lg bg-ink-1 px-5 text-base font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto'
const LANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'
const SEKTION = 'mt-16 lg:mt-[88px]'

function Rader({ rader, numrerad, tva }: { rader: VerktygsRad[]; numrerad?: boolean; tva?: boolean }) {
  return (
    <ol className={`mt-6 grid gap-x-12 ${tva ? 'md:grid-cols-2' : ''}`}>
      {rader.map((r, i) => (
        <li key={r.rubrik} className="flex gap-4 border-t border-kant py-5">
          {numrerad ? (
            <span
              aria-hidden="true"
              className="w-10 shrink-0 font-display text-[32px] font-extrabold leading-8 tabular-nums text-ink-1"
            >
              {i + 1}
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-6 text-ink-1">{r.rubrik}</h3>
            <div className="mt-1 text-sm leading-[22px] text-ink-2">{r.text}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function VerktygsSida(p: VerktygsSidaProps) {
  return (
    <main className="min-h-screen bg-mark">
      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-6 lg:px-12 lg:pb-[72px] lg:pt-10">
        <Breadcrumb items={p.brodsmulor} />

        {/* 1. Hero */}
        <header className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-14">
          <div>
            <p className="text-steg font-semibold uppercase tracking-[0.08em] text-ink-3">{p.eyebrow}</p>
            <h1 className="mt-2 max-w-[18ch] text-h1-pub text-ink-1 lg:mt-3">{p.h1}</h1>
            <p className="mt-4 max-w-[52ch] text-base leading-[27px] text-ink-2 lg:mt-6 lg:text-lg lg:leading-[29px]">
              {p.ingress}
              {p.fet ? (
                <>
                  {' '}
                  <b className="font-semibold text-ink-1">{p.fet}</b>
                </>
              ) : null}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Link href={p.primar.href} data-cta={p.primar.dataCta} className={KNAPP}>
                {p.primar.text}
              </Link>
              {p.sekundar ? (
                <Link href={p.sekundar.href} className={LANK}>
                  {p.sekundar.text}
                </Link>
              ) : null}
            </div>
            {p.loften?.length ? (
              <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-[13px] leading-[18px] text-ink-3">
                {p.loften.map((l) => (
                  <li key={l.tal}>
                    <span className="block font-display text-[26px] font-bold leading-[30px] tracking-[-0.02em] tabular-nums text-ink-1">
                      {l.tal}
                    </span>
                    {l.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {p.handling ? (
            <div id={p.handlingId} className="scroll-mt-24">
              {p.handling}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[360px] text-ink-1" aria-hidden="true">
              {p.scen}
            </div>
          )}
        </header>

        {/* 2. Så fungerar det */}
        <section id={p.steg.id} aria-label={p.steg.rubrik} className={`${SEKTION} scroll-mt-24`}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
            <div>
              <h2 className="text-h2-pub text-ink-1">{p.steg.rubrik}</h2>
              {p.steg.ingress ? <p className="mt-3 max-w-[60ch] text-base leading-[27px] text-ink-2">{p.steg.ingress}</p> : null}
              <Rader rader={p.steg.rader} numrerad />
              {p.steg.lank ? (
                <Link href={p.steg.lank.href} className={`mt-2 ${LANK}`}>
                  {p.steg.lank.text}
                </Link>
              ) : null}
            </div>
            {p.handling ? (
              <div className="hidden text-ink-1 lg:block" aria-hidden="true">
                {p.scen}
              </div>
            ) : null}
          </div>
        </section>

        {/* 3. Vad vi kontrollerar */}
        {p.kontroll ? (
          <section id={p.kontroll.id} aria-label={p.kontroll.rubrik} className={`${SEKTION} scroll-mt-24`}>
            {p.kontroll.eyebrow ? <p className="text-steg uppercase text-ink-3">{p.kontroll.eyebrow}</p> : null}
            <h2 className="mt-2 text-h2-pub text-ink-1">{p.kontroll.rubrik}</h2>
            {p.kontroll.ingress ? <p className="mt-3 max-w-[60ch] text-base leading-[27px] text-ink-2">{p.kontroll.ingress}</p> : null}
            <Rader rader={p.kontroll.rader} tva />
          </section>
        ) : null}

        {/* 4. Mer innehåll */}
        {p.extra?.map((e) => (
          <section key={e.rubrik} id={e.id} aria-label={e.rubrik} className={`${SEKTION} scroll-mt-24`}>
            {e.eyebrow ? <p className="text-steg uppercase text-ink-3">{e.eyebrow}</p> : null}
            <h2 className="mt-2 text-h2-pub text-ink-1">{e.rubrik}</h2>
            {e.ingress ? <p className="mt-3 max-w-[60ch] text-base leading-[27px] text-ink-2">{e.ingress}</p> : null}
            <Rader rader={e.rader} tva={e.rader.length > 3} />
            {e.lank ? (
              <Link href={e.lank.href} className={`mt-2 ${LANK}`}>
                {e.lank.text}
              </Link>
            ) : null}
          </section>
        ))}

        {p.fritt ? <div className={SEKTION}>{p.fritt}</div> : null}

        {/* 5. Citatet */}
        {p.citat ? (
          <figure className={`${SEKTION} rounded-xl border border-kant bg-panel p-6 sm:p-8`}>
            <blockquote className="font-display text-[22px] font-semibold leading-8 tracking-[-0.01em] text-ink-1 lg:text-[26px] lg:leading-9">
              {p.citat.text}
            </blockquote>
            <figcaption className="mt-4 text-meta text-ink-3">
              <span className="font-semibold text-ink-1">{p.citat.namn}</span>
              {p.citat.roll ? `, ${p.citat.roll}` : ''}
            </figcaption>
          </figure>
        ) : null}

        {/* 6. Bläckytan */}
        <div className={SEKTION}>
          <InkPanel
            eyebrow={p.slut.eyebrow}
            title={p.slut.rubrik}
            text={p.slut.text}
            scene={p.slut.scen}
            action={
              <Link href={p.slut.knapp.href} className={INK_KNAPP}>
                {p.slut.knapp.text}
              </Link>
            }
            secondary={
              p.slut.sekundar ? (
                <Link href={p.slut.sekundar.href} className={INK_LANK}>
                  {p.slut.sekundar.text}
                </Link>
              ) : undefined
            }
          />
        </div>

        {/* 7. Frågorna */}
        <section id={p.faq.id} aria-label={p.faq.rubrik} className={`${SEKTION} scroll-mt-24`}>
          <h2 className="text-h2-pub text-ink-1">{p.faq.rubrik}</h2>
          {p.faq.ingress ? <p className="mt-3 text-base leading-[27px] text-ink-2">{p.faq.ingress}</p> : null}
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {p.faq.fragor.map((f, i) => (
              <details key={f.q} open={i === 0} className="group rounded-xl border border-kant bg-panel px-4 sm:px-5">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold text-ink-1 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="shrink-0 text-ink-3 group-open:hidden" aria-hidden="true">
                    +
                  </span>
                  <span className="hidden shrink-0 text-ink-3 group-open:inline" aria-hidden="true">
                    −
                  </span>
                </summary>
                <p className="pb-4 text-sm leading-[22px] text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
