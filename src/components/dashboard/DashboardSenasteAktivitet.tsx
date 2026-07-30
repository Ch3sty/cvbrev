'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight } from 'lucide-react'
import {
  IconAktBrev,
  IconAktAnalys,
  IconAktCV,
  IconAktLinkedin,
  IconAktNedladdning,
  IconAktTest,
  IconAktAnsokan,
  EmptyActivityIllustration,
} from './illustrations/DashboardIcons'

type ActivityType =
  | 'brev'
  | 'analys'
  | 'cv'
  | 'linkedin'
  | 'nedladdning'
  | 'test'
  | 'ansokan'

interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  subtitle?: string
  href?: string
  createdAt: string
  count?: number
  templateId?: string
}

const ICONS: Record<ActivityType, (props: { className?: string }) => React.JSX.Element> = {
  brev: IconAktBrev,
  analys: IconAktAnalys,
  cv: IconAktCV,
  linkedin: IconAktLinkedin,
  nedladdning: IconAktNedladdning,
  test: IconAktTest,
  ansokan: IconAktAnsokan,
}

// Mall-swatch: en stabil husfärg per CV-mall, så en lista med flera
// nedladdningar går att skanna utan att läsa varje titel.
const SWATCH_COLORS = ['#F97316', '#DC2626', '#BE185D', '#FB923C', '#F59E0B', '#E11D48']
function templateSwatchColor(templateId: string): string {
  let hash = 0
  for (let i = 0; i < templateId.length; i++) {
    hash = (hash * 31 + templateId.charCodeAt(i)) >>> 0
  }
  return SWATCH_COLORS[hash % SWATCH_COLORS.length]
}

export default function DashboardSenasteAktivitet() {
  const [items, setItems] = useState<ActivityItem[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('/api/dashboard/recent-activity')
      .then((r) => r.json())
      .then((data) => {
        if (mounted) {
          setItems(data.items || [])
          setLoading(false)
        }
      })
      .catch(() => {
        if (mounted) {
          setItems([])
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="bg-white rounded-3xl border border-orange-100 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-black text-slate-900">
          Senaste aktivitet
        </h2>
      </div>

      {loading && <SkeletonList />}

      {!loading && items && items.length === 0 && (
        <EmptyState />
      )}

      {!loading && items && items.length > 0 && (
        <ul className="space-y-2.5">
          {items.map((item, idx) => {
            const Icon = ICONS[item.type] ?? IconAktBrev
            const content = (
              <div
                className={`flex items-center gap-3 p-3 rounded-2xl border border-orange-100 transition-all duration-200 ${
                  item.href
                    ? 'hover:border-orange-200 hover:bg-orange-50/40 hover:-translate-y-0.5'
                    : ''
                }`}
              >
                <Icon className="w-9 h-9 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.templateId && (
                      <span
                        className="w-2.5 h-2.5 rounded-[4px] flex-shrink-0"
                        style={{ backgroundColor: templateSwatchColor(item.templateId) }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {item.title}
                    </span>
                    {item.count && item.count > 1 && (
                      <span className="flex-shrink-0 text-[10.5px] font-black text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-1.5 py-px tabular-nums">
                        × {item.count}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    {item.subtitle && (
                      <>
                        <span className="truncate">{item.subtitle}</span>
                        <span>·</span>
                      </>
                    )}
                    <span>{relativeTime(item.createdAt)}</span>
                  </div>
                </div>
                {item.href && (
                  <ChevronRight
                    className="w-4 h-4 text-orange-400 flex-shrink-0"
                    strokeWidth={2.5}
                  />
                )}
              </div>
            )

            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
              >
                {item.href ? <Link href={item.href}>{content}</Link> : content}
              </motion.li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function SkeletonList() {
  return (
    <ul className="space-y-2.5">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex items-center gap-3 p-3 rounded-2xl border border-orange-100"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-50 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-orange-50 animate-pulse" />
            <div className="h-2.5 w-1/3 rounded bg-orange-50 animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-8 px-4">
      <div className="flex justify-center mb-4">
        <EmptyActivityIllustration className="w-32 h-32" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 mb-1.5">
        Här dyker dina genomförda aktiviteter upp
      </h3>
      <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto leading-relaxed">
        När du skapar ett brev, loggar en ansökan eller kör en CV-analys
        ser du det här.
      </p>
      <Link
        href="/dashboard/skapa-brev"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
        style={{ background: 'var(--jc-gradient-warm)' }}
      >
        Skapa ditt första brev
        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
      </Link>
    </div>
  )
}

function relativeTime(isoDate: string): string {
  const now = new Date()
  const date = new Date(isoDate)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / (1000 * 60))
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMin < 1) return 'just nu'
  if (diffMin < 60) return `${diffMin} min sedan`
  if (diffHrs < 24) return `${diffHrs} ${diffHrs === 1 ? 'timme' : 'timmar'} sedan`
  if (diffDays === 1) return 'igår'
  if (diffDays < 7) return `${diffDays} dagar sedan`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? 'vecka' : 'veckor'} sedan`
  }
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}
