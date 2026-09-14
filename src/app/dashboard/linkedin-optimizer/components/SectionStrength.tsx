'use client'

import { useMemo } from 'react'

interface Props {
  text: string
  /** Optimal längd (ungefärlig) per sektion */
  optimalMin?: number
  optimalMax?: number
  /** Visa endast en kompakt indikator (utan text) */
  compact?: boolean
}

const BUZZWORDS = [
  'driven',
  'passionate',
  'results-oriented',
  'team player',
  'go-getter',
  'self-starter',
  'synergy',
  'rockstar',
  'ninja',
  'guru',
  'thought leader',
  'engagerad',
  'driven professionell',
  'resultatorienterad',
]

function calculateStrength(
  text: string,
  optimalMin = 80,
  optimalMax = 600
): { score: number; reason: string; color: 'red' | 'orange' | 'yellow' | 'green' } {
  const trimmed = text.trim()
  if (!trimmed) {
    return { score: 0, reason: 'Tom', color: 'red' }
  }

  const len = trimmed.length

  // Bas-score baserat på längd
  let lengthScore: number
  if (len < optimalMin) {
    lengthScore = (len / optimalMin) * 60
  } else if (len <= optimalMax) {
    lengthScore = 60 + ((len - optimalMin) / (optimalMax - optimalMin)) * 30
  } else {
    // För lång, sänker
    const overflow = (len - optimalMax) / optimalMax
    lengthScore = Math.max(70, 90 - overflow * 30)
  }

  // Bonus för siffror (kvantifiering)
  const hasNumbers = /\d/.test(trimmed)
  const numberBonus = hasNumbers ? 8 : 0

  // Bonus för radbrytningar (struktur)
  const lineBreaks = (trimmed.match(/\n/g) || []).length
  const structureBonus = Math.min(lineBreaks * 1.5, 5)

  // Penalty för buzzwords
  const lowerText = trimmed.toLowerCase()
  const buzzwordCount = BUZZWORDS.filter((bw) => lowerText.includes(bw)).length
  const buzzwordPenalty = buzzwordCount * 6

  const finalScore = Math.max(
    0,
    Math.min(100, Math.round(lengthScore + numberBonus + structureBonus - buzzwordPenalty))
  )

  let reason: string
  let color: 'red' | 'orange' | 'yellow' | 'green'

  if (finalScore < 30) {
    reason = len < optimalMin ? 'För kort, fyll på mer' : 'Behöver mer substans'
    color = 'red'
  } else if (finalScore < 55) {
    reason = buzzwordCount > 0 ? 'Vi hittade floskler' : 'På väg, fortsätt'
    color = 'orange'
  } else if (finalScore < 80) {
    reason = hasNumbers ? 'Bra struktur' : 'Lägg gärna till siffror'
    color = 'yellow'
  } else {
    reason = 'Stark sektion'
    color = 'green'
  }

  return { score: finalScore, reason, color }
}

/**
 * Styrkan är en 2 px linje i ink-1 och en rad text. Tonen sitter i texten,
 * aldrig i linjen: fel under 30, varning under 55, ink däröver, positiv när
 * sektionen är stark.
 */
const COLOR_TEXT = {
  red: 'text-fel',
  orange: 'text-varning',
  yellow: 'text-ink-2',
  green: 'text-positiv',
}

export default function SectionStrength({
  text,
  optimalMin,
  optimalMax,
  compact = false,
}: Props) {
  const { score, reason, color } = useMemo(
    () => calculateStrength(text, optimalMin, optimalMax),
    [text, optimalMin, optimalMax]
  )

  return (
    <div className="space-y-2">
      <div
        className="h-0.5 w-full bg-kant"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label="Sektionens styrka"
      >
        <div
          className="h-full bg-ink-1 transition-[width] duration-[240ms] ease-out motion-reduce:transition-none"
          style={{ width: `${score}%` }}
        />
      </div>
      {!compact && (
        <div className="flex items-center justify-between">
          <span className={`text-meta font-medium ${COLOR_TEXT[color]}`}>{reason}</span>
          <span className="text-meta tabular-nums text-ink-3">{score}%</span>
        </div>
      )}
    </div>
  )
}
