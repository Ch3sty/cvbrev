'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, TrendingUp, type LucideIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SkillsMakeover from './SkillsMakeover'

interface Props {
  sectionKey: string
  title: string
  icon: LucideIcon
  optimizedText: string
  scoreBefore: number
  scoreAfter: number
  improvements: string[]
}

export default function SectionDetail({
  sectionKey,
  title,
  icon: Icon,
  optimizedText,
  scoreBefore,
  scoreAfter,
  improvements,
}: Props) {
  const [copied, setCopied] = useState(false)
  const delta = scoreAfter - scoreBefore

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(optimizedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const isSkills = sectionKey === 'skills'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
      style={{ boxShadow: '0 8px 20px -10px rgba(249, 115, 22, 0.18)' }}
    >
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-orange-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
            }}
          >
            <Icon className="w-4 h-4 text-white" strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 leading-tight">
              {title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-400 font-bold tabular-nums">
                {scoreBefore}
              </span>
              <TrendingUp
                className="w-2.5 h-2.5 text-emerald-600"
                strokeWidth={3}
              />
              <span className="text-[10px] text-slate-900 font-black tabular-nums">
                {scoreAfter}
              </span>
              <span
                className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200"
              >
                +{delta}
              </span>
            </div>
          </div>
        </div>

        {!isSkills && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-orange-700 hover:bg-orange-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" strokeWidth={2.6} />
                Kopierat
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" strokeWidth={2.4} />
                Kopiera
              </>
            )}
          </button>
        )}
      </div>

      {/* Score-bar */}
      <div className="px-5 sm:px-6 pt-4">
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            initial={{ width: `${scoreBefore}%` }}
            animate={{ width: `${scoreAfter}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background:
                'linear-gradient(90deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
            }}
          />
        </div>
      </div>

      {/* Innehåll */}
      <div className="px-5 sm:px-6 py-4">
        {isSkills ? (
          <SkillsMakeover rawJson={optimizedText} />
        ) : (
          <div className="prose prose-sm max-w-none prose-slate">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="text-sm text-slate-700 leading-relaxed mb-3 last:mb-0">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-slate-900">
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1.5 my-3">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span
                      className="mt-1.5 w-1 h-1 rounded-full bg-orange-500 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">
                      {children}
                    </span>
                  </li>
                ),
              }}
            >
              {optimizedText}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Improvements */}
      {improvements && improvements.length > 0 && (
        <div className="px-5 sm:px-6 pb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <span
              className="w-1 h-3 rounded-sm"
              style={{
                background:
                  'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
              }}
              aria-hidden="true"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
              Vad vi ändrade
            </span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {improvements.map((improvement, i) => (
              <li
                key={i}
                className="flex items-start gap-2 px-3 py-2 rounded-lg bg-orange-50/40 border border-orange-100"
              >
                <Check
                  className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5"
                  strokeWidth={2.6}
                />
                <span className="text-xs text-slate-700 leading-snug">
                  {improvement}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}
