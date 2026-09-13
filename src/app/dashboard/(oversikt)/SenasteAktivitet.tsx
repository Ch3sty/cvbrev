'use client'

/**
 * Senaste aktivitet i Tråden: sektionsetikett och rader i en panel. Nakna
 * ikoner i 24 ur Ikoner.tsx, aldrig färgade plattor. Laddar med tråden,
 * döljer sig själv vid noll rader.
 *
 * Datan hämtas som förut från /api/dashboard/recent-activity efter mount.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingSkeleton from '@/components/shell/LoadingSkeleton'
import {
  IkonBrev,
  IkonAnalys,
  IkonCv,
  IkonLank,
  IkonLaddaNer,
  IkonMallar,
  IkonAnsokningar,
  type IkonProps,
} from '@/components/illustrations/Ikoner'

type ActivityType = 'brev' | 'analys' | 'cv' | 'linkedin' | 'nedladdning' | 'test' | 'ansokan'

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

const ICONS: Record<ActivityType, (props: IkonProps) => React.JSX.Element> = {
  brev: IkonBrev,
  analys: IkonAnalys,
  cv: IkonCv,
  linkedin: IkonLank,
  nedladdning: IkonLaddaNer,
  test: IkonMallar,
  ansokan: IkonAnsokningar,
}

export default function SenasteAktivitet() {
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

  // Tom aktivitetslista säger ingenting. Den döljs helt i stället för att
  // lägga en tom yta mellan användaren och nästa handling.
  if (!loading && items && items.length === 0) return null

  return (
    <section aria-label="Senaste aktivitet">
      <h2 className="mb-2 text-sm font-medium text-ink-3">Senaste aktivitet</h2>

      {loading ? (
        <LoadingSkeleton variant="list" count={2} label="Läser in senaste aktivitet" />
      ) : (
        <ul className="rounded-xl border border-kant bg-panel">
          {(items ?? []).map((item) => {
            const Icon = ICONS[item.type] ?? IkonBrev
            const content = (
              <>
                <Icon size={24} className="shrink-0 text-ink-2" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-ink-1">{item.title}</span>
                    {item.count && item.count > 1 ? (
                      <span className="shrink-0 text-meta tabular-nums text-ink-3">× {item.count}</span>
                    ) : null}
                  </span>
                  {item.subtitle ? (
                    <span className="block truncate text-meta text-ink-3">{item.subtitle}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-meta text-ink-3">{relativeTime(item.createdAt)}</span>
              </>
            )

            const rowClass = 'flex min-h-11 items-center gap-3 px-4 py-3'

            return (
              <li key={item.id} className="border-b border-kant last:border-b-0">
                {item.href ? (
                  <Link href={item.href} className={`${rowClass} transition-colors hover:bg-insunken/60`}>
                    {content}
                  </Link>
                ) : (
                  <div className={rowClass}>{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
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
