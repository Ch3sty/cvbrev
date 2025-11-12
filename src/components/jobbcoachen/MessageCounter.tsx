'use client'

import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

interface MessageCounterProps {
  messagesRemaining: number
  totalMessages?: number
}

export default function MessageCounter({
  messagesRemaining,
  totalMessages = 5
}: MessageCounterProps) {
  // Determine state based on remaining messages
  const getState = () => {
    if (messagesRemaining >= 3) return 'safe'
    if (messagesRemaining >= 2) return 'warning'
    return 'critical'
  }

  const state = getState()

  const stateConfig = {
    safe: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      emoji: '🟢'
    },
    warning: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-300',
      emoji: '🟡'
    },
    critical: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      emoji: '🔴'
    }
  }

  const config = stateConfig[state]

  return (
    <motion.div
      key={messagesRemaining}
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.text} text-sm font-semibold shadow-sm`}
    >
      <span className="text-base">{config.emoji}</span>
      <span>
        {messagesRemaining > 0
          ? `${messagesRemaining} meddelande${messagesRemaining !== 1 ? 'n' : ''} kvar`
          : 'Inga meddelanden kvar'}
      </span>
      {messagesRemaining > 0 && messagesRemaining <= 2 && (
        <AlertCircle className="w-5 h-5" />
      )}
    </motion.div>
  )
}
