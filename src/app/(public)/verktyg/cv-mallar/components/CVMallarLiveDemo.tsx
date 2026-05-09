'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'

/**
 * Live-demo som visar /dashboard/cv-mallar-flodet:
 * - "Valj mall"-rad med 4 mall-namn som chips (aktiv chip har orange/rod-gradient)
 * - Stor mall-thumbnail i mitten som byts via AnimatePresence var 4 sek
 * - Roterar genom 4 representativa mallar (en fran varje stil + en premium)
 * - Progress-prick under thumbnail visar aktuell mall
 *
 * Drives av SIMPLE_TEMPLATES sa nya mallar pa langre sikt kan rotera in
 * automatiskt om man uppdaterar DEMO_TEMPLATE_IDS.
 */

// Plocka 4 representativa mallar att rotera genom (1 modern free, 1 modern premium, 1 traditional premium, 1 creative premium)
const DEMO_TEMPLATE_IDS = [
  'norrsken',
  'aurora',
  'atlas',
  'galleri',
]

const DEMO_TEMPLATES = DEMO_TEMPLATE_IDS.map((id) =>
  SIMPLE_TEMPLATES.find((t) => t.id === id)
).filter((t): t is NonNullable<typeof t> => t !== undefined)

const ROTATION_MS = 4000
// Hur lange auto-rotationen ska vila efter att anvandaren klickat
const PAUSE_AFTER_CLICK_MS = 10000

export default function CVMallarLiveDemo() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  // Auto-rotation som pausar nar paused = true
  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % DEMO_TEMPLATES.length)
    }, ROTATION_MS)
    return () => clearInterval(interval)
  }, [paused])

  // Resume auto-rotation efter PAUSE_AFTER_CLICK_MS av inaktivitet
  useEffect(() => {
    if (!paused) return
    const timer = setTimeout(() => {
      setPaused(false)
    }, PAUSE_AFTER_CLICK_MS)
    return () => clearTimeout(timer)
  }, [paused, activeIdx])

  const handleSelect = (idx: number) => {
    setActiveIdx(idx)
    setPaused(true)
  }

  const active = DEMO_TEMPLATES[activeIdx]

  return (
    <div
      className="rounded-3xl bg-white border border-orange-100 p-5 sm:p-6 lg:sticky lg:top-6 w-full"
      style={{
        boxShadow: '0 16px 48px -20px rgba(249, 115, 22, 0.28)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
        />
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
          Välj din mall
        </span>
      </div>

      {/* Mall-chips */}
      <div className="grid grid-cols-2 gap-1.5 mb-5">
        {DEMO_TEMPLATES.map((tpl, idx) => {
          const aktiv = idx === activeIdx
          return (
            <button
              key={tpl.id}
              onClick={() => handleSelect(idx)}
              className={`px-2.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-left truncate ${
                aktiv
                  ? 'text-white shadow-sm'
                  : 'bg-orange-50/60 text-slate-700 hover:bg-orange-100/60'
              }`}
              style={
                aktiv
                  ? {
                      background:
                        'linear-gradient(135deg, #F97316, #DC2626)',
                    }
                  : undefined
              }
            >
              {tpl.name}
            </button>
          )
        })}
      </div>

      {/* Stor mall-thumbnail med animerat byte */}
      <div className="relative aspect-[5/7] bg-orange-50/40 rounded-2xl border border-orange-100 overflow-hidden mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            <Image
              src={active.imagePath}
              alt={active.name}
              width={300}
              height={420}
              className="w-full h-full object-contain drop-shadow-md"
              priority={activeIdx === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Premium-badge */}
        {active.tier === 'premium' && (
          <div
            className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-md"
            style={{
              background: 'linear-gradient(135deg, #DC2626, #BE185D)',
            }}
          >
            Premium
          </div>
        )}
      </div>

      {/* Progress-prickar */}
      <div className="flex items-center justify-center gap-1.5 mb-3">
        {DEMO_TEMPLATES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            aria-label={`Visa mall ${idx + 1}`}
            className="touch-manipulation p-1"
          >
            <div
              className={`h-1.5 rounded-full transition-all ${
                idx === activeIdx ? 'w-8' : 'w-1.5 bg-orange-200'
              }`}
              style={
                idx === activeIdx
                  ? {
                      background:
                        'linear-gradient(90deg, #F97316, #DC2626)',
                    }
                  : undefined
              }
            />
          </button>
        ))}
      </div>

      {/* Mall-info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`info-${active.id}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-sm font-black text-slate-900 mb-0.5">
            {active.name}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {active.description}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
