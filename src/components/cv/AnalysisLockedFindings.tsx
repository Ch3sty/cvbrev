'use client'

/**
 * De låsta fynden i CV-analysen
 * (docs/plan-paket-och-onboarding.md, ägarens beslut 2, 2026-09-22).
 *
 * Gratisnivån ser läsbarhetspoängen, antalet fynd och det tyngsta fyndet i
 * klartext med åtgärd. Övriga fynd står här, som rubriker utan åtgärdstext.
 *
 * Servern skickar aldrig åtgärden till de här raderna. Suddningen är alltså
 * ärlig: det finns ingenting bakom den, och ingen CSS att stänga av. Den
 * skillnaden är hela skälet till att filtreringen ligger i
 * gateAnalysisResult och inte i den här komponenten.
 */

import PaywallCard from '@/components/paywall/PaywallCard'
import { GRATISRADER } from '@/components/paywall/paywall-copy'
import type { Scope } from '@/lib/access/features'
import type { LockedFinding } from '@/lib/cv/gateAnalysisResult'

interface AnalysisLockedFindingsProps {
  findings: LockedFinding[]
  /** Antal fynd totalt, inklusive det som visas i klartext. */
  findingsTotal: number
  /** Sant när kontot ser hela analysen. Då ritas ingenting. */
  hasFullAnalysis?: boolean
  /** Paketet kontot har, för att skilja fel spår från gratisnivån. */
  scope?: Scope | null
  /** Spåret som valts i onboardingen. Styr vilket paket som föreslås. */
  track?: Scope | null
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

export default function AnalysisLockedFindings({
  findings,
  findingsTotal,
  hasFullAnalysis,
  scope = null,
  track = null,
  className,
}: AnalysisLockedFindingsProps) {
  if (hasFullAnalysis) return null
  if (!findings || findings.length === 0) return null

  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      {/* GR3. Raden säger vad som ingår, utan att be om något. */}
      <p className="text-meta text-ink-3">{GRATISRADER.analys}</p>

      <ul
        className="space-y-2"
        aria-label={`${findings.length} fynd med åtgärd bakom betalvägg`}
      >
        {findings.map((finding) => (
          <li
            key={finding.id}
            className="rounded-xl border border-kant bg-panel px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[finding.severity]}`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-1">
                {finding.title || finding.category}
              </span>
              <span className="shrink-0 text-meta text-ink-3">
                {SEVERITY_LABEL[finding.severity]}
              </span>
              <svg
                viewBox="0 0 16 16"
                width="13"
                height="13"
                className="shrink-0 text-ink-3"
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
            {/* Ingen åtgärdsrad här. Servern skickar aldrig texten, så det
                finns ingenting att dölja och ingenting att sudda. */}
            <p className="mt-1 text-meta text-ink-3">{finding.category}</p>
          </li>
        ))}
      </ul>

      {/* PW3, den omskrivna. Den kvitterar vad hon redan fått innan den
          säger vad som kostar. */}
      <PaywallCard
        variant="analys"
        feature="cv_analysis_full"
        scope={scope}
        track={track}
        findingsTotal={findingsTotal}
      />
    </div>
  )
}
