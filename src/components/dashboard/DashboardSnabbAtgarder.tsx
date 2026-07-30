'use client'

// Snabbåtgärder: sidans mest handlingsbara sektion.
// Sex kort i ett jämnt 3-kolumnsgrid (2 kolumner på tablet), med ett
// valfritt "Rekommenderas nu"-kort som får extra visuell vikt utifrån
// vad användaren ännu inte provat. Gemensamt hover-kontrakt på hela kortet.

import Link from 'next/link'
import type { ComponentType } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'
import {
  IconSnabbBrev,
  IconSnabbMatch,
  IconSnabbAnalys,
  IconSnabbTester,
  IconSnabbSokta,
  IconSnabbUpptackt,
} from './illustrations/DashboardIcons'

interface DashboardSnabbAtgarderProps {
  cvCount: number
  /** Slug från useNextBestAction: matchande kort markeras "Rekommenderas nu". */
  recommendedSlug?: string | null
}

interface SnabbAtgard {
  slug: string
  Icon: ComponentType<{ className?: string }>
  title: string
  body: string
  href: string
  requiresCV: boolean
  isNew?: boolean
}

const ACTIONS: SnabbAtgard[] = [
  {
    slug: 'skapa-brev',
    Icon: IconSnabbBrev,
    title: 'Skapa nytt brev',
    body: 'Personligt brev anpassat efter rollen',
    href: '/dashboard/skapa-brev',
    requiresCV: true,
  },
  {
    slug: 'sokta-tjanster',
    Icon: IconSnabbSokta,
    title: 'Logga sökta tjänster',
    body: 'Följ dina ansökningar och se din statistik',
    href: '/dashboard/sokta-tjanster',
    requiresCV: false,
    isNew: true,
  },
  {
    slug: 'jobbmatchning',
    Icon: IconSnabbMatch,
    title: 'Hitta matchande jobb',
    body: 'Tusentals lediga tjänster i Sverige',
    href: '/dashboard/jobbmatchning',
    requiresCV: true,
  },
  {
    slug: 'cv-analys',
    Icon: IconSnabbAnalys,
    title: 'Analysera ditt CV',
    body: 'Score och förbättringar direkt',
    href: '/dashboard/cv-analys',
    requiresCV: true,
  },
  {
    slug: 'tester',
    Icon: IconSnabbTester,
    title: 'Träna på tester',
    body: 'Matrislogik, verbalt och numeriskt',
    href: '/dashboard/tester',
    requiresCV: false,
  },
  {
    slug: 'bli-upptackt',
    Icon: IconSnabbUpptackt,
    title: 'Bli upptäckt',
    body: 'Låt rekryterare hitta din profil',
    href: '/dashboard/bli-upptackt',
    requiresCV: false,
  },
]

export default function DashboardSnabbAtgarder({
  cvCount,
  recommendedSlug,
}: DashboardSnabbAtgarderProps) {
  const hasNoCV = cvCount === 0

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
          Snabbåtgärder
        </h2>
        <p className="text-sm text-slate-500">Vad vill du göra härnäst?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {ACTIONS.map(({ slug, Icon, title, body, href, requiresCV, isNew }, idx) => {
          const locked = requiresCV && hasNoCV
          const targetHref = locked ? '/dashboard/profil/cv' : href
          const recommended = !locked && recommendedSlug === slug

          return (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Link
                href={targetHref}
                className={`group block rounded-3xl p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${
                  recommended
                    ? 'bg-orange-50/60 border-2 border-orange-300 hover:border-orange-400'
                    : 'bg-white border border-orange-100 hover:border-orange-200'
                }`}
                style={{
                  boxShadow: recommended
                    ? '0 8px 24px -8px rgba(249, 115, 22, 0.25)'
                    : '0 4px 16px -8px rgba(249, 115, 22, 0.12)',
                }}
              >
                {locked && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[9px] font-black uppercase tracking-[0.12em] text-orange-700">
                    <Lock className="w-2.5 h-2.5" strokeWidth={3} />
                    CV krävs
                  </div>
                )}
                {recommended && (
                  <div
                    className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] text-white"
                    style={{ background: 'var(--jc-gradient-warm)' }}
                  >
                    Rekommenderas nu
                  </div>
                )}
                {!locked && !recommended && isNew && (
                  <div
                    className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] text-white"
                    style={{ background: 'var(--jc-gradient-warm)' }}
                  >
                    Nyhet
                  </div>
                )}

                <Icon className="w-12 h-12 mb-4" />

                <h3 className="text-base font-black text-slate-900 mb-1 leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  {body}
                </p>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 group-hover:text-orange-800">
                  {locked ? 'Ladda upp CV' : 'Öppna'}
                  <ArrowRight
                    className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2.5}
                  />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
