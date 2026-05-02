'use client'

import { motion } from 'framer-motion'

interface SuccessStampProps {
  text: string
  /** Rotation i grader, t.ex. -8 för lutning åt vänster */
  rotation?: number
  className?: string
}

export default function SuccessStamp({
  text,
  rotation = -8,
  className = '',
}: SuccessStampProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.6, rotate: rotation - 6 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      transition={{
        duration: 0.45,
        ease: [0.34, 1.56, 0.64, 1],
        delay: 0.15,
      }}
      className={`inline-flex items-center justify-center pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <span
        className="px-4 py-1.5 rounded border-[3px] font-black tracking-[0.18em] uppercase text-base sm:text-lg"
        style={{
          color: '#DC2626',
          borderColor: '#DC2626',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.18em',
          textShadow: '0 0 0.5px rgba(220, 38, 38, 0.6)',
          opacity: 0.92,
        }}
      >
        {text}
      </span>
    </motion.div>
  )
}
