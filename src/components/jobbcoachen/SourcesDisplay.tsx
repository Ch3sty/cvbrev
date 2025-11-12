'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface Source {
  title: string
  url: string
  domain: string
}

interface SourcesDisplayProps {
  sources: Source[]
}

export default function SourcesDisplay({ sources }: SourcesDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!sources || sources.length === 0) return null

  // Show only first 3 sources initially
  const displaySources = isExpanded ? sources : sources.slice(0, 3)
  const hasMore = sources.length > 3

  return (
    <div className="mt-4 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
          Källor ({sources.length})
        </h4>
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors px-3 py-2 -mr-3 -mt-1 min-h-[44px]"
            aria-label={isExpanded ? 'Visa färre källor' : 'Visa alla källor'}
          >
            {isExpanded ? (
              <>
                Visa färre
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Visa alla
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="sync">
          {displaySources.map((source, idx) => (
            <motion.a
              key={`${source.url}-${idx}`}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-300 transition-all group text-left min-h-[48px]"
            >
              <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {source.title}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {source.domain}
                </p>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
