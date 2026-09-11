'use client'

/**
 * Riktig ingång till provet (docs/plan-konvertering.md, C9).
 *
 * Ersätter den scriptade RekryteringstesterLiveDemo: i stället för att titta
 * på en animering som låtsas vara ett test får besökaren göra ett på riktigt.
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { capture } from '@/lib/analytics/events'
import { IlluKlusterTest } from '@/components/illustrations/ClusterIcons'

const PUNKTER = [
  'Fem matrislogikfrågor',
  'Samma frågebank som i det skarpa testet',
  'Resultat direkt, ingen tidtagning',
]

export default function RekryteringstesterProvaKort() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <IlluKlusterTest size={24} className="mt-1 flex-shrink-0 text-neutral-700" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-neutral-900">
            Gör ett prov direkt, utan konto
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Du behöver inte registrera dig för att se var du står. Fem frågor tar ett par
            minuter.
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {PUNKTER.map((punkt) => (
          <li key={punkt} className="flex items-center gap-3">
            <span
              className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-600"
              aria-hidden="true"
            />
            <span className="text-sm text-neutral-600">{punkt}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/verktyg/rekryteringstester/prova"
        data-cta="rekryteringstester-prova"
        onClick={() =>
          capture('article_cta_clicked', {
            cluster: 'test',
            position: 'hero',
            target: '/verktyg/rekryteringstester/prova',
          })
        }
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 sm:w-auto"
      >
        Prova fem frågor
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
