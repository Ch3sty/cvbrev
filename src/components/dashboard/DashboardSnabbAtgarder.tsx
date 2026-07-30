'use client'

// Snabbåtgärder: sidans mest handlingsbara sektion.
// Sex kort i ett jämnt 3-kolumnsgrid (2 kolumner på tablet), med ett
// valfritt "Rekommenderas nu"-kort som får extra visuell vikt utifrån
// vad användaren ännu inte provat. Gemensamt hover-kontrakt på hela kortet.
//
// Struktur: kortet är en div med ett absolut länköverdrag (z-10) för
// navigationen, så info-popoverns knapp (z-20) kan ligga ovanpå utan
// ogiltig knapp-i-länk-HTML. Samma mönster som LetterCard.

import Link from 'next/link'
import type { ComponentType, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'
import InfoPopover from '@/components/ui/InfoPopover'
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
  /** Fördjupad förklaring i info-popovern. */
  info: ReactNode
  infoAccent?: 'warm' | 'indigo'
}

const ACTIONS: SnabbAtgard[] = [
  {
    slug: 'skapa-brev',
    Icon: IconSnabbBrev,
    title: 'Skapa nytt brev',
    body: 'Personligt brev anpassat efter rollen',
    href: '/dashboard/skapa-brev',
    requiresCV: true,
    info: (
      <p>
        Klistra in en jobbannons så skriver vi ett personligt brev utifrån ditt
        CV. Du granskar, redigerar och laddar ner som PDF eller Word.
      </p>
    ),
  },
  {
    slug: 'sokta-tjanster',
    Icon: IconSnabbSokta,
    title: 'Logga sökta tjänster',
    body: 'Följ dina ansökningar och se din statistik',
    href: '/dashboard/sokta-tjanster',
    requiresCV: false,
    isNew: true,
    info: (
      <p>
        Logga jobben du söker och följ varje steg, från ansökan till intervju.
        Du får statistik över din sökning och en färdig månadsöversikt att visa
        för Arbetsförmedlingen.
      </p>
    ),
  },
  {
    slug: 'jobbmatchning',
    Icon: IconSnabbMatch,
    title: 'Hitta matchande jobb',
    body: 'Tusentals lediga tjänster i Sverige',
    href: '/dashboard/jobbmatchning',
    requiresCV: true,
    info: (
      <p>
        Vi matchar ditt CV mot tusentals aktuella annonser och visar i procent
        hur väl varje jobb passar dig, så du ser direkt var du har bäst chans.
      </p>
    ),
  },
  {
    slug: 'cv-analys',
    Icon: IconSnabbAnalys,
    title: 'Analysera ditt CV',
    body: 'Score och förbättringar direkt',
    href: '/dashboard/cv-analys',
    requiresCV: true,
    info: (
      <p>
        Vi går igenom ditt CV som en rekryterare gör: du får en poäng och
        konkreta förbättringsförslag på några sekunder.
      </p>
    ),
  },
  {
    slug: 'tester',
    Icon: IconSnabbTester,
    title: 'Träna på tester',
    body: 'Matrislogik, verbalt och numeriskt',
    href: '/dashboard/tester',
    requiresCV: false,
    info: (
      <p>
        Öva på samma slags logik-, ord- och sifferuppgifter som arbetsgivare
        använder i sina urvalstest. Träningen gör formatet bekant innan det
        gäller på riktigt.
      </p>
    ),
  },
  {
    slug: 'bli-upptackt',
    Icon: IconSnabbUpptackt,
    title: 'Bli upptäckt',
    body: 'Låt rekryterare hitta din profil',
    href: '/dashboard/bli-upptackt',
    requiresCV: false,
    infoAccent: 'indigo',
    info: (
      <p>
        Lägg din profil i kandidatpoolen så kan rekryterare hitta dig. Du är
        anonym tills du själv godkänner en kontakt, och du stänger av
        synligheten när du vill.
      </p>
    ),
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
        {ACTIONS.map((action, idx) => {
          const { slug, Icon, title, body, href, requiresCV, isNew, info, infoAccent } = action
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
              <div
                className={`group relative rounded-3xl p-5 transition-all duration-200 hover:-translate-y-0.5 ${
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
                {/* Länköverdraget bär hela kortets klick; z-10 under popovern */}
                <Link
                  href={targetHref}
                  aria-label={locked ? `${title} (kräver CV)` : title}
                  className="absolute inset-0 z-10 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                />

                {locked && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[9px] font-black uppercase tracking-[0.12em] text-orange-700 pointer-events-none">
                    <Lock className="w-2.5 h-2.5" strokeWidth={3} />
                    CV krävs
                  </div>
                )}
                {recommended && (
                  <div
                    className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] text-white pointer-events-none"
                    style={{ background: 'var(--jc-gradient-warm)' }}
                  >
                    Rekommenderas nu
                  </div>
                )}
                {!locked && !recommended && isNew && (
                  <div
                    className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] text-white pointer-events-none"
                    style={{ background: 'var(--jc-gradient-warm)' }}
                  >
                    Nyhet
                  </div>
                )}

                <Icon className="w-12 h-12 mb-4" />

                <div className="flex items-center mb-1">
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {title}
                  </h3>
                  <span className="relative z-20 inline-flex">
                    <InfoPopover title={title} accent={infoAccent ?? 'warm'}>
                      {info}
                    </InfoPopover>
                  </span>
                </div>
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
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
