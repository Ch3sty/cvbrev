'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface TypewriterQuoteProps {
  quotes: string[]
  charDelayMs?: number
  pauseMs?: number
  className?: string
}

export default function TypewriterQuote({
  quotes,
  charDelayMs = 45,
  pauseMs = 3500,
  className = '',
}: TypewriterQuoteProps) {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const current = quotes[index] ?? ''

  useEffect(() => {
    setTyped('')
    if (!current) return

    let i = 0
    const typeInterval = setInterval(() => {
      i += 1
      setTyped(current.slice(0, i))
      if (i >= current.length) {
        clearInterval(typeInterval)
      }
    }, charDelayMs)

    return () => clearInterval(typeInterval)
  }, [current, charDelayMs])

  useEffect(() => {
    if (quotes.length <= 1) return
    const totalDuration = current.length * charDelayMs + pauseMs
    const rotateTimer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % quotes.length)
    }, totalDuration)
    return () => clearTimeout(rotateTimer)
  }, [index, current, quotes.length, charDelayMs, pauseMs])

  const isTyping = typed.length < current.length

  return (
    <div className={`relative ${className}`} aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-white/95 font-black leading-tight"
        >
          {typed}
          {isTyping && (
            <span
              className="inline-block w-[3px] h-[1em] ml-1 bg-orange-300 align-middle animate-pulse"
              aria-hidden="true"
            />
          )}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
