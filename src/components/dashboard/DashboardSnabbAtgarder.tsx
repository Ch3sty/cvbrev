'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'
import {
  IconSnabbBrev,
  IconSnabbMatch,
  IconSnabbAnalys,
  IconSnabbTester,
} from './illustrations/DashboardIcons'

interface DashboardSnabbAtgarderProps {
  cvCount: number
}

const ACTIONS = [
  {
    Icon: IconSnabbBrev,
    title: 'Skapa nytt brev',
    body: 'Personligt brev anpassat efter rollen',
    href: '/dashboard/skapa-brev',
    requiresCV: true,
  },
  {
    Icon: IconSnabbMatch,
    title: 'Hitta matchande jobb',
    body: 'Tusentals lediga tjänster i Sverige',
    href: '/dashboard/jobbmatchning',
    requiresCV: true,
  },
  {
    Icon: IconSnabbAnalys,
    title: 'Analysera ditt CV',
    body: 'Score och förbättringar direkt',
    href: '/dashboard/cv-analys',
    requiresCV: true,
  },
  {
    Icon: IconSnabbTester,
    title: 'Träna på tester',
    body: 'Matrislogik, verbalt och numeriskt',
    href: '/dashboard/tester',
    requiresCV: false,
  },
]

export default function DashboardSnabbAtgarder({
  cvCount,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {ACTIONS.map(({ Icon, title, body, href, requiresCV }, idx) => {
          const locked = requiresCV && hasNoCV
          const targetHref = locked ? '/dashboard/profil/cv' : href

          return (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Link
                href={targetHref}
                className="group block bg-white rounded-3xl border border-orange-100 p-5 hover:border-orange-200 hover:shadow-lg transition-all relative overflow-hidden"
                style={{
                  boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)',
                }}
              >
                {locked && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[9px] font-black uppercase tracking-[0.12em] text-orange-700">
                    <Lock className="w-2.5 h-2.5" strokeWidth={3} />
                    CV krävs
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
