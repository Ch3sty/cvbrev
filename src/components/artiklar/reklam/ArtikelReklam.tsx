/**
 * Reklamkorten i artiklarna och artikellistan
 * (docs/design/analys-artiklar-2026-09-23.html, avsnitt 6).
 *
 * Tre platser på en artikel: efter andra stycket (verktyget, gratis först),
 * i sidokolumnen (paketet, kort) och efter texten (paketet, fullt i bläck).
 * Två platser i listan: gratiskortet bland artikelkorten och de tre paketen
 * i bläck efter pagineringen. Klustret väljer paketet (paketForKluster).
 *
 * Alla är serverkomponenter. Rubrikerna är p med display-stil, aldrig h2
 * eller h3, så att de inte hamnar i artikelns rubrikträd (SEO-spärrlistan
 * punkt 3). Visning och klick mäts av ArtikelKlient via data-attributen
 * data-cta-position och data-cta-klick, utan egen klientkod per kort.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import type { ArtikelPaket, CtaCluster, InlineVerktyg } from '@/lib/cta/clusters'
import InkPanel, { INK_KNAPP, INK_LANK } from '@/components/shell/InkPanel'
import { paketNamn } from '@/lib/plans/plans'
import {
  IlluScenAllt,
  IlluScenBrev,
  IlluScenCoach,
  IlluScenCv,
  IlluScenMallar,
  IlluScenMatris,
} from '@/components/illustrations/PriserScener'
import {
  GRATIS_KORT,
  INLINE,
  INLINE_RAKNARE,
  LANKRAD,
  LISTA_SLUT,
  SIDO,
  SLUT,
} from './reklam-copy'

const KNAPP =
  'inline-flex h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto'
const TEXTLANK =
  'text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

const TAG: Record<'cv' | 'test' | 'allt', string> = {
  cv: 'bg-cv-mjuk text-cv',
  test: 'bg-test-mjuk text-test',
  allt: 'bg-ink-1 text-white',
}

/** Datat som ArtikelKlient läser för visnings- och klickmätningen. */
function matning(position: string, cluster: CtaCluster | 'lista', variant: string) {
  return {
    'data-cta-position': position,
    'data-cta-cluster': cluster,
    'data-cta-variant': variant,
  }
}

const INLINE_SCEN: Record<Exclude<InlineVerktyg, 'raknare' | 'lankrad'>, (p: { className?: string }) => ReactNode> = {
  test: IlluScenMatris,
  mallar: IlluScenMallar,
  analys: IlluScenCv,
  brev: IlluScenBrev,
  coach: IlluScenCoach,
}

/* --------------------------------------------------------- inline-kortet */

export function InlineKort({
  cluster,
  verktyg,
  slug,
}: {
  cluster: CtaCluster
  verktyg: InlineVerktyg
  slug: string
}) {
  if (verktyg === 'lankrad') {
    return (
      <aside
        className="not-prose my-8 rounded-xl border border-kant bg-panel px-4 py-3 sm:px-5"
        aria-label="Relaterade räknare"
        {...matning('inline', cluster, 'lankrad')}
        data-cta-slug={slug}
      >
        <p className="text-sm text-ink-2">{LANKRAD.text}</p>
        <ul className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-6">
          {LANKRAD.lankar.map((l) => (
            <li key={l.href}>
              <Link href={l.href} data-cta-klick={l.href} className={`inline-flex min-h-11 items-center ${TEXTLANK}`}>
                {l.text}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    )
  }

  if (verktyg === 'raknare') {
    return (
      <aside
        className="not-prose my-8 rounded-xl border border-kant bg-panel p-4 sm:p-6"
        aria-label={INLINE_RAKNARE.rubrik}
        {...matning('inline', cluster, 'raknare')}
        data-cta-slug={slug}
      >
        <p className="text-steg uppercase text-ink-3">Verktyget</p>
        <p className="mt-2 font-display text-[22px] font-bold leading-7 tracking-[-0.02em] text-ink-1">
          {INLINE_RAKNARE.rubrik}
        </p>
        <p className="mt-2 text-sm leading-[22px] text-ink-2 sm:text-base sm:leading-6">{INLINE_RAKNARE.text}</p>
        <ul className="mt-3 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-6">
          {INLINE_RAKNARE.lankar.map((l) => (
            <li key={l.href}>
              <Link href={l.href} data-cta-klick={l.href} className={`inline-flex min-h-11 items-center ${TEXTLANK}`}>
                {l.text}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    )
  }

  const copy = INLINE[verktyg]
  const Scen = INLINE_SCEN[verktyg]
  return (
    <aside
      className="not-prose my-8 rounded-xl border border-kant bg-panel p-4 sm:p-6"
      aria-label={copy.rubrik}
      {...matning('inline', cluster, verktyg)}
      data-cta-slug={slug}
    >
      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-steg uppercase text-ink-3">Verktyget</p>
          <p className="mt-2 font-display text-[22px] font-bold leading-7 tracking-[-0.02em] text-ink-1 [text-wrap:balance]">
            {copy.rubrik}
          </p>
          <p className="mt-2 text-sm leading-[22px] text-ink-2 sm:text-base sm:leading-6">{copy.text}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href={copy.href}
              data-cta={`article-inline-${cluster}`}
              data-cta-klick={copy.href}
              className={KNAPP}
            >
              {copy.knapp}
            </Link>
            <p className="text-meta text-ink-3">{copy.paketrad}</p>
          </div>
        </div>
        <div className="hidden w-[132px] shrink-0 text-ink-1 sm:block" aria-hidden="true">
          <Scen className="h-auto w-full" />
        </div>
      </div>
    </aside>
  )
}

/* ------------------------------------------------ sidokolumnens paketkort */

export function SidoPaketKort({ paket, cluster, slug }: { paket: ArtikelPaket; cluster: CtaCluster; slug: string }) {
  if (paket === 'gratis') {
    return (
      <section
        className="rounded-xl border border-kant bg-panel p-5"
        aria-label={GRATIS_KORT.rubrik}
        {...matning('sidebar', cluster, 'gratis')}
        data-cta-slug={slug}
      >
        <p className="text-steg uppercase text-ink-3">{GRATIS_KORT.etikett}</p>
        <p className="mt-2 text-varde text-ink-1">{GRATIS_KORT.rubrik}</p>
        <ul className="mt-3 space-y-1 text-sm leading-[22px] text-ink-2">
          {GRATIS_KORT.rader.slice(0, 3).map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <Link href={GRATIS_KORT.href} data-cta-klick={GRATIS_KORT.href} className={`mt-4 ${KNAPP} sm:w-full`}>
          {GRATIS_KORT.knapp}
        </Link>
      </section>
    )
  }
  const copy = SIDO[paket]
  return (
    <section
      className="rounded-xl border border-kant bg-panel p-5"
      aria-label={copy.rubrik}
      {...matning('sidebar', cluster, paket)}
      data-cta-slug={slug}
    >
      <span className={`inline-block rounded-md px-2 py-1 text-steg font-semibold uppercase ${TAG[paket]}`}>
        {copy.etikett}
      </span>
      <p className="mt-3 text-varde text-ink-1">{copy.rubrik}</p>
      <p className="mt-2 text-sm leading-[22px] text-ink-2">{copy.text}</p>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-[28px] font-bold leading-8 tracking-[-0.02em] tabular-nums text-ink-1">
          {copy.belopp}
        </span>
        <span className="text-meta text-ink-3">{copy.under}</span>
      </p>
      <Link href="/priser" data-cta-klick="/priser" className={`mt-4 ${KNAPP} sm:w-full`}>
        Se vad som ingår
      </Link>
      {copy.gratisrad ? <p className="mt-2 text-meta text-ink-3">{copy.gratisrad}</p> : null}
    </section>
  )
}

/* ---------------------------------------------------- slutkortet i bläck */

const SLUT_SCEN: Record<'cv' | 'test' | 'allt', (p: { className?: string }) => ReactNode> = {
  cv: IlluScenCv,
  test: IlluScenMatris,
  allt: IlluScenAllt,
}

export function SlutKort({ paket, cluster, slug }: { paket: ArtikelPaket; cluster: CtaCluster; slug: string }) {
  if (paket === 'gratis') return <GratisKort cluster={cluster} slug={slug} position="final" />
  const copy = SLUT[paket]
  const Scen = SLUT_SCEN[paket]
  return (
    <div className="not-prose mt-12" {...matning('final', cluster, paket)} data-cta-slug={slug}>
      <InkPanel
        eyebrow={copy.etikett}
        title={copy.rubrik}
        titleAs="p"
        label={copy.rubrik}
        scene={<Scen className="h-auto w-full" />}
        action={
          <Link href={copy.href} data-cta={`article-final-${cluster}`} data-cta-klick={copy.href} className={INK_KNAPP}>
            {copy.knapp}
          </Link>
        }
        secondary={
          <Link href={copy.sekundar.href} data-cta-klick={copy.sekundar.href} className={INK_LANK}>
            {copy.sekundar.text}
          </Link>
        }
      >
        <ul className="space-y-2 text-sm leading-[22px] text-white">
          {copy.rader.map((r) => (
            <li key={r} className="flex gap-2">
              <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-1-accent" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-1-mjuk">{copy.prisrad}</p>
      </InkPanel>
    </div>
  )
}

/* ------------------------------------------------------- gratiskortet */

export function GratisKort({
  cluster,
  slug,
  position = 'inline',
  className,
}: {
  cluster: CtaCluster | 'lista'
  slug?: string
  position?: string
  className?: string
}) {
  return (
    <aside
      className={`not-prose flex flex-col rounded-xl border border-kant bg-insunken p-5 shadow-insunken sm:p-6 ${className ?? ''}`}
      aria-label={GRATIS_KORT.rubrik}
      {...matning(position, cluster, 'gratis')}
      data-cta-slug={slug}
    >
      <p className="text-steg uppercase text-ink-3">{GRATIS_KORT.etikett}</p>
      <p className="mt-2 font-display text-[22px] font-bold leading-7 tracking-[-0.02em] text-ink-1 [text-wrap:balance]">
        {GRATIS_KORT.rubrik}
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-[22px] text-ink-2">
        {GRATIS_KORT.rader.map((r, i) => (
          <li key={r} className="flex gap-2">
            <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-3" />
            {/* Mallraden leder till verktygssidan: intern länkkraft som kortet
                hade förut och inte får tappa (SEO-spärrlistan punkt 4). */}
            {i === 0 ? (
              <Link href="/verktyg/cv-mallar" data-cta-klick="/verktyg/cv-mallar" className={TEXTLANK}>
                {r}
              </Link>
            ) : (
              <span>{r}</span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:gap-4">
        <Link href={GRATIS_KORT.href} data-cta-klick={GRATIS_KORT.href} className={KNAPP}>
          {GRATIS_KORT.knapp}
        </Link>
        <Link href={GRATIS_KORT.sekundar.href} data-cta-klick={GRATIS_KORT.sekundar.href} className={TEXTLANK}>
          {GRATIS_KORT.sekundar.text}
        </Link>
      </div>
    </aside>
  )
}

/* -------------------------------------------- listans slutkort i bläck */

export function ListaSlutKort() {
  return (
    <div {...matning('final', 'lista', 'paket')}>
      <InkPanel
        eyebrow={LISTA_SLUT.etikett}
        title={LISTA_SLUT.rubrik}
        titleAs="p"
        label="Paketen"
        text={LISTA_SLUT.text}
        action={
          <Link href={LISTA_SLUT.href} data-cta-klick={LISTA_SLUT.href} className={INK_KNAPP}>
            {LISTA_SLUT.knapp}
          </Link>
        }
        secondary={
          <Link href="/verktyg/cv-mallar" data-cta-klick="/verktyg/cv-mallar" className={INK_LANK}>
            Eller börja gratis med en CV-mall
          </Link>
        }
      >
        <ul className="grid gap-3 lg:grid-cols-3">
          {[LISTA_SLUT.paket[2], LISTA_SLUT.paket[0], LISTA_SLUT.paket[1]].map((p) => (
            <li
              key={p.namn}
              className={`rounded-lg border border-ink-1-kant p-4 ${p.namn === paketNamn('all_week') ? 'lg:order-last' : ''}`}
            >
              <p className="text-steg uppercase text-ink-1-accent">{p.etikett}</p>
              <p className="mt-1 font-display text-[22px] font-bold leading-7 text-white">{p.namn}</p>
              <p className="mt-1 text-sm leading-[22px] text-ink-1-mjuk">{p.text}</p>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-[24px] font-bold tabular-nums text-white">{p.pris}</span>
                <span className="text-meta text-ink-1-mjuk">{p.under}</span>
              </p>
            </li>
          ))}
        </ul>
      </InkPanel>
    </div>
  )
}
