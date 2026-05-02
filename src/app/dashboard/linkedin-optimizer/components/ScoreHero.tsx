'use client'

import { useEffect } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  animate as motionAnimate,
} from 'framer-motion'
import { TrendingUp } from 'lucide-react'

interface Props {
  scoreBefore: number
  scoreAfter: number
}

const SIZE = 144
const STROKE = 12
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function ScoreHero({ scoreBefore, scoreAfter }: Props) {
  const animated = useMotionValue(scoreBefore)
  const display = useTransform(animated, (v) => Math.round(v))
  const offset = useTransform(animated, (v) =>
    CIRCUMFERENCE - (CIRCUMFERENCE * Math.max(0, Math.min(100, v))) / 100
  )

  useEffect(() => {
    const controls = motionAnimate(animated, scoreAfter, {
      duration: 1.6,
      ease: 'easeOut',
    })
    return controls.stop
  }, [scoreAfter, animated])

  const delta = scoreAfter - scoreBefore

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
      {/* Före (statisk) */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg
            width={96}
            height={96}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="block"
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#F1F5F9"
              strokeWidth={STROKE}
              fill="none"
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#94A3B8"
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={
                CIRCUMFERENCE -
                (CIRCUMFERENCE * Math.max(0, Math.min(100, scoreBefore))) / 100
              }
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-500 tabular-nums">
              {scoreBefore}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Före
            </span>
          </div>
        </div>
      </div>

      {/* Pil */}
      <div className="flex flex-row sm:flex-col items-center gap-1">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 380 }}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-white font-black text-base"
          style={{
            background:
              'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 8px 18px -6px rgba(16, 185, 129, 0.5)',
          }}
        >
          <TrendingUp className="w-4 h-4" strokeWidth={3} />
          <span>+{delta}</span>
        </motion.div>
      </div>

      {/* Efter (animerad) */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg
            width={144}
            height={144}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="block"
          >
            <defs>
              <linearGradient
                id="score-after-gradient"
                x1="0"
                y1="0"
                x2={SIZE}
                y2={SIZE}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#F97316" />
                <stop offset="0.6" stopColor="#DC2626" />
                <stop offset="1" stopColor="#BE185D" />
              </linearGradient>
            </defs>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#FED7AA"
              strokeWidth={STROKE}
              fill="none"
              opacity={0.5}
            />
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="url(#score-after-gradient)"
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: offset }}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className="text-4xl font-black text-slate-900 tabular-nums">
              {display}
            </motion.span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
              Efter
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
