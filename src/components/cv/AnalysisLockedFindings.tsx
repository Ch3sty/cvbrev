'use client'

/**
 * De låsta fynden i CV-analysen (A9 i docs/plan-konvertering.md).
 *
 * Servern skickar aldrig texten till de här raderna, bara kategori och
 * severity. Suddningen är alltså ärlig: det finns ingenting bakom den.
 * Vi ritar platshållarstreck i varierande bredd, inte blurrad riktig text.
 */

import PaywallCard from '@/components/paywall/PaywallCard'
import type { LockedFinding } from '@/lib/cv/gateAnalysisResult'

interface AnalysisLockedFindingsProps {
  findings: LockedFinding[]
  /** Antal fynd totalt, inklusive de tre synliga. */
  findingsTotal: number
  isPremium?: boolean
  className?: string
}

const SEVERITY_LABEL: Record<LockedFinding['severity'], string> = {
  high: 'Hög påverkan',
  medium: 'Medel',
  low: 'Låg',
}

const SEVERITY_DOT: Record<LockedFinding['severity'], string> = {
  high: 'bg-orange-500',
  medium: 'bg-amber-400',
  low: 'bg-neutral-300',
}

/** Breddmönster så raderna inte ser ut som en tabell. */
const WIDTHS = ['82%', '64%', '74%', '58%', '70%']

export default function AnalysisLockedFindings({
  findings,
  findingsTotal,
  isPremium,
  className,
}: AnalysisLockedFindingsProps) {
  if (isPremium) return null
  if (!findings || findings.length === 0) return null

  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      <ul className="space-y-2" aria-label={`${findings.length} låsta förbättringsförslag`}>
        {findings.map((finding, i) => (
          <li
            key={finding.id}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 select-none"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${SEVERITY_DOT[finding.severity]}`}
                aria-hidden="true"
              />
              <span className="text-xs font-medium text-neutral-700">{finding.category}</span>
              <span className="text-xs text-neutral-400">{SEVERITY_LABEL[finding.severity]}</span>
              <svg
                viewBox="0 0 16 16"
                width="13"
                height="13"
                className="ml-auto text-neutral-400 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="7" width="10" height="7" rx="1.5" />
                <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
              </svg>
            </div>
            <div className="space-y-1.5" aria-hidden="true">
              <span
                className="block h-2.5 rounded bg-neutral-200"
                style={{ width: WIDTHS[i % WIDTHS.length] }}
              />
              <span
                className="block h-2.5 rounded bg-neutral-100"
                style={{ width: WIDTHS[(i + 2) % WIDTHS.length] }}
              />
            </div>
          </li>
        ))}
      </ul>

      <PaywallCard variant="analys" findingsTotal={findingsTotal} />
    </div>
  )
}
