/**
 * Poängringen (spec-rummen 4.4, konceptets C1): CV-rummets instrument på
 * väggen. 112 px, 0 till 100, kopparbåge på väggens kant, talet 30/800 i
 * mitten och "av 100" under. Bredvid står vad som drar ner, i två rader.
 *
 * Poängen är analysens läsbarhetspoäng (atsFriendliness.score), aldrig en
 * uppskattning. Träningen använder aldrig poängspråk; ringen finns bara i
 * CV-rummet.
 *
 * Server component.
 */

import type { ReactNode } from 'react'
import { CV_RUM } from '@/lib/rum/copy'

export interface PoangringProps {
  poang: number
  /** Den feta raden bredvid ringen ("Tre saker drar ner."). */
  rubrik?: ReactNode
  /** Raden under, i vagg-mjuk. */
  rad?: ReactNode
  className?: string
}

const R = 48
const OMKRETS = 2 * Math.PI * R

export default function Poangring({ poang, rubrik, rad, className }: PoangringProps) {
  const p = Math.max(0, Math.min(100, Math.round(poang)))
  return (
    <div className={`flex items-center gap-[18px] ${className ?? ''}`}>
      <svg viewBox="0 0 112 112" role="img" aria-label={CV_RUM.ringAria(p)} className="h-28 w-28 shrink-0">
        <circle cx="56" cy="56" r={R} fill="none" stroke="var(--vagg-kant)" strokeWidth="7" />
        <circle
          cx="56"
          cy="56"
          r={R}
          fill="none"
          stroke="var(--koppar)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={OMKRETS.toFixed(1)}
          strokeDashoffset={(OMKRETS * (1 - p / 100)).toFixed(1)}
          transform="rotate(-90 56 56)"
        />
        <text
          x="56"
          y="62"
          textAnchor="middle"
          className="font-display"
          fontWeight={800}
          fontSize="30"
          letterSpacing="-1"
          fill="var(--vagg-ink)"
        >
          {p}
        </text>
        <text x="56" y="78" textAnchor="middle" fontWeight={500} fontSize="11" fill="var(--vagg-mjuk)">
          {CV_RUM.avHundra}
        </text>
      </svg>
      {rubrik || rad ? (
        <div className="min-w-0">
          {rubrik ? (
            <p className="font-display text-xl font-bold leading-[25px] tracking-[-.01em] text-vagg-ink">{rubrik}</p>
          ) : null}
          {rad ? <p className="mt-1 text-[13px] leading-[19px] text-vagg-mjuk">{rad}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
