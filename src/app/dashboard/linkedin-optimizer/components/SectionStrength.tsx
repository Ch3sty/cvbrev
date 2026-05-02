'use client'

import { motion } from 'framer-motion'
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
    // För lång → sänker
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
    reason = len < optimalMin ? 'För kort — fyll på mer' : 'Behöver mer substans'
    color = 'red'
  } else if (finalScore < 55) {
    reason = buzzwordCount > 0 ? 'Vi hittade buzzwords' : 'På väg — fortsätt'
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

const COLOR_GRADIENTS = {
  red: 'linear-gradient(90deg, #DC2626 0%, #F97316 100%)',
  orange: 'linear-gradient(90deg, #F97316 0%, #FB923C 100%)',
  yellow: 'linear-gradient(90deg, #F97316 0%, #DC2626 100%)',
  green: 'linear-gradient(90deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
}

const COLOR_TEXT = {
  red: 'text-red-700',
  orange: 'text-orange-700',
  yellow: 'text-amber-700',
  green: 'text-emerald-700',
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
    <div className="space-y-1.5">
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: COLOR_GRADIENTS[color],
          }}
        />
      </div>
      {!compact && (
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-bold ${COLOR_TEXT[color]} leading-none`}
          >
            {reason}
          </span>
          <span className="text-[11px] font-bold text-slate-400 tabular-nums leading-none">
            {score}%
          </span>
        </div>
      )}
    </div>
  )
}
