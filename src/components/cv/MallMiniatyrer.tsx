/**
 * MallMiniatyrer: riktiga mallar ur mallregistret som miniatyrer i 3:4
 * (docs/design/analys-artiklar-2026-09-23.html, avsnitt 6, "Showcasen").
 *
 * Delas mellan artiklarnas mallvisning (ersätter ArticleTemplateShowcase
 * med sina påhittade mallnamn) och CV-mallar-hubben i inloggat läge.
 * Bilden är registrets egen förhandsvisning (imagePath), namnen är
 * registrets. Inga badges: "Populärast" och "Trendigt" saknade underlag.
 *
 * Inga hooks och ingen 'use client': används i både server- och
 * klientkomponenter.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  FREE_TEMPLATE_COUNT,
  SIMPLE_TEMPLATES,
  TEMPLATE_COUNT,
  type SimpleTemplate,
} from '@/lib/cv/simple-templates'
import { PLAN_BY_KEY } from '@/lib/plans/plans'

export interface MallMiniatyrProps {
  mall: Pick<SimpleTemplate, 'id' | 'name' | 'imagePath' | 'tier'>
  /** Raden under namnet: "gratis", "CV-paketet". */
  under?: ReactNode
  vald?: boolean
  /** Mallen ingår inte i paketet: insunken med lås. */
  last?: boolean
  className?: string
}

/** En miniatyr: arket i 3:4 på panel, namnet under. */
export function MallMiniatyr({ mall, under, vald, last, className }: MallMiniatyrProps) {
  return (
    <figure className={`min-w-0 ${className ?? ''}`}>
      <div
        className={`relative aspect-[3/4] overflow-hidden rounded-lg border ${
          vald ? 'border-ink-1 shadow-val' : 'border-kant'
        } ${last ? 'bg-insunken' : 'bg-panel'}`}
      >
        {/* Registrets förhandsvisning. Dokumentet är papper: vit bakgrund är
            designsystemets undantag för mallförhandsvisning (§10). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mall.imagePath}
          alt={`Mallen ${mall.name}`}
          width={300}
          height={400}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-cover ${last ? 'opacity-50' : ''}`}
        />
        {last ? (
          <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-panel text-ink-2" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <rect x="6" y="11" width="12" height="9" rx="2" />
              <path d="M9 11V8a3 3 0 0 1 6 0v3" />
            </svg>
          </span>
        ) : null}
      </div>
      <figcaption className="mt-2">
        <span className="block truncate text-sm font-semibold text-ink-1">{mall.name}</span>
        {under ? <span className="block truncate text-meta text-ink-3">{under}</span> : null}
      </figcaption>
    </figure>
  )
}

/** De fyra som visas i artiklarna: gratisnivåns mallar och den första betalda. */
function artikelUrval() {
  const gratis = SIMPLE_TEMPLATES.filter((t) => t.tier === 'free').slice(0, 3)
  const betald = SIMPLE_TEMPLATES.find((t) => t.tier === 'premium')
  return betald ? [...gratis, betald] : gratis
}

/** Mallvisningen i CV-artiklar. MDX-aliaset CVTemplateShowcase pekar hit. */
export default function MallMiniatyrer() {
  const urval = artikelUrval()
  return (
    <aside className="not-prose my-10 rounded-xl border border-kant bg-panel p-4 sm:p-6" aria-label="Mallar ur registret">
      <p className="text-steg uppercase text-ink-3">
        {urval.length} av {TEMPLATE_COUNT} mallar
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {urval.map((m) => (
          <MallMiniatyr key={m.id} mall={m} under={m.tier === 'free' ? 'gratis' : PLAN_BY_KEY.cv_week.name} />
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-2">
          {FREE_TEMPLATE_COUNT} gratis, alla {TEMPLATE_COUNT} i {PLAN_BY_KEY.cv_week.name} för {PLAN_BY_KEY.cv_week.amount} kr i veckan.
        </p>
        <Link
          href="/verktyg/cv-mallar"
          data-cta-klick="/verktyg/cv-mallar"
          className="text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
        >
          Se alla mallar
        </Link>
      </div>
    </aside>
  )
}
