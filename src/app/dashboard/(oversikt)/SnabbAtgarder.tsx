'use client'

/**
 * Snabbåtgärder i tillstånd B: en panel med rader, inte sex jämnstora kort.
 * Naken ikon 24 i ink-2, titel, en rad, chevron. Det rekommenderade får
 * etiketten "Rekommenderas" i accent-bläck, det låsta säger "Kräver CV" i
 * klartext och leder till uppladdningen.
 */

import Link from 'next/link'
import type { ComponentType } from 'react'
import {
  IkonBrev,
  IkonAnsokningar,
  IkonMatchning,
  IkonAnalys,
  IkonMallar,
  IkonSynlig,
  type IkonProps,
} from '@/components/illustrations/Ikoner'

interface SnabbAtgarderProps {
  cvCount: number
  /** Slug från useNextBestAction: matchande rad markeras "Rekommenderas". */
  recommendedSlug?: string | null
}

interface SnabbAtgard {
  slug: string
  Icon: ComponentType<IkonProps>
  title: string
  body: string
  href: string
  requiresCV: boolean
  isNew?: boolean
}

const ACTIONS: SnabbAtgard[] = [
  {
    slug: 'skapa-brev',
    Icon: IkonBrev,
    title: 'Skapa nytt brev',
    body: 'Personligt brev anpassat efter rollen.',
    href: '/dashboard/skapa-brev',
    requiresCV: true,
  },
  {
    slug: 'sokta-tjanster',
    Icon: IkonAnsokningar,
    title: 'Logga sökta tjänster',
    body: 'Följ dina ansökningar och se din statistik.',
    href: '/dashboard/sokta-tjanster',
    requiresCV: false,
    isNew: true,
  },
  {
    slug: 'jobbmatchning',
    Icon: IkonMatchning,
    title: 'Hitta matchande jobb',
    body: 'Tusentals lediga tjänster i Sverige.',
    href: '/dashboard/jobbmatchning',
    requiresCV: true,
  },
  {
    slug: 'cv-analys',
    Icon: IkonAnalys,
    title: 'Analysera ditt CV',
    body: 'Poäng och förbättringar direkt.',
    href: '/dashboard/cv-analys',
    requiresCV: true,
  },
  {
    slug: 'tester',
    Icon: IkonMallar,
    title: 'Träna på tester',
    body: 'Matrislogik, verbalt och numeriskt.',
    href: '/dashboard/tester',
    requiresCV: false,
  },
  {
    slug: 'bli-upptackt',
    Icon: IkonSynlig,
    title: 'Bli upptäckt',
    body: 'Låt rekryterare hitta din profil.',
    href: '/dashboard/bli-upptackt',
    requiresCV: false,
  },
]

export default function SnabbAtgarder({ cvCount, recommendedSlug }: SnabbAtgarderProps) {
  const hasNoCV = cvCount === 0

  return (
    <section aria-label="Vad vill du göra härnäst">
      <h2 className="mb-2 text-sm font-medium text-ink-3">Vad vill du göra härnäst</h2>

      <ul className="rounded-xl border border-kant bg-panel">
        {ACTIONS.map((action) => {
          const { slug, Icon, title, body, href, requiresCV, isNew } = action
          const locked = requiresCV && hasNoCV
          const targetHref = locked ? '/dashboard/profil/cv' : href
          const recommended = !locked && recommendedSlug === slug

          const tag = locked ? (
            <span className="shrink-0 text-meta text-ink-3">Kräver CV</span>
          ) : recommended ? (
            <span className="shrink-0 text-meta font-medium text-accent-ink">Rekommenderas</span>
          ) : isNew ? (
            <span className="shrink-0 text-meta text-ink-3">Nyhet</span>
          ) : null

          return (
            <li key={slug} className="border-b border-kant last:border-b-0">
              <Link
                href={targetHref}
                aria-label={locked ? `${title} (kräver CV)` : title}
                className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-insunken/60"
              >
                <Icon size={24} className="shrink-0 text-ink-2" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-1">{title}</span>
                  <span className="block truncate text-meta text-ink-3">{body}</span>
                </span>
                {tag}
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  className="shrink-0 text-ink-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
