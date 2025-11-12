'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface DemoQuestionCardProps {
  icon: ReactNode
  question: string
  category: string
  onClick: () => void
  delay?: number
}

export default function DemoQuestionCard({
  icon,
  question,
  category,
  onClick,
  delay = 0
}: DemoQuestionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-500 hover:shadow-lg transition-all duration-300 w-full min-h-[96px] relative overflow-hidden"
      aria-label={`Fråga: ${question}`}
    >
      {/* Subtle gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      />

      {/* Content */}
      <div className="relative flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-600 mb-1">
            {category}
          </p>
          <p className="text-sm font-medium text-slate-800 line-clamp-2">
            {question}
          </p>
        </div>
      </div>
    </motion.button>
  )
}
