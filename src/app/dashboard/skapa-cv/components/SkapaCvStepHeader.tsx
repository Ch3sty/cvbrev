'use client'

import { motion } from 'framer-motion'

interface Props {
  stepNumber: number
  title: string
  description?: string
  isOptional?: boolean
}

/**
 * Header för varje steg i skapa-cv-flödet. Konsekvent struktur:
 * Eyebrow med "Steg X av 7", titel, valfri beskrivning, valfri "Valfritt"-pill.
 */
export default function SkapaCvStepHeader({
  stepNumber,
  title,
  description,
  isOptional = false,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mb-1"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
          Steg {stepNumber} av 7
        </div>
        {isOptional && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
            Valfritt
          </span>
        )}
      </div>
      <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 leading-tight tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-neutral-600 mt-1.5 leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  )
}
