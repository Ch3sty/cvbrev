'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { CVDraft } from '../CVCreatorWizard'
import SkapaCvStepHeader from '../SkapaCvStepHeader'
import SkapaCvTextarea from '../inputs/SkapaCvTextarea'

interface Props {
  cvData: CVDraft
  updateCVData: (updates: Partial<CVDraft>) => void
}

const TIPS = [
  'Vem du är professionellt (din roll, område)',
  'Vad du är bra på (3-5 styrkor)',
  'Vad du brinner för',
  'Vart du vill — vad du söker härnäst',
]

export default function Step2OmDig({ cvData, updateCVData }: Props) {
  const value = cvData.summary ?? ''
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-5"
    >
      <SkapaCvStepHeader
        stepNumber={2}
        title="Berätta kort om dig själv"
        description="3-5 meningar som introducerar dig — det här är ofta det första rekryteraren läser."
        isOptional
      />

      <div
        className="rounded-3xl bg-white border border-orange-100 p-5 sm:p-7 space-y-4"
        style={{
          boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)',
        }}
      >
        <SkapaCvTextarea
          id="summary"
          label="Om dig"
          placeholder="t.ex. Senior projektledare med 8 års erfarenhet av att leda agila team inom IT. Specialiserad på digital transformation och CI/CD. Söker nu en utmaning där jag kan bygga..."
          value={value}
          onChange={(e) => updateCVData({ summary: e.target.value })}
          rows={7}
          showCount
          maxCount={500}
          optional
        />

        <div className="text-[11px] text-slate-500">
          Cirka {wordCount} ord. Optimal längd: 60-120 ord.
        </div>

        {/* Tips-kort */}
        <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles
              className="w-4 h-4 text-orange-700"
              strokeWidth={2.4}
            />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
              Tips: Inkludera
            </span>
          </div>
          <ul className="space-y-1">
            {TIPS.map((tip) => (
              <li
                key={tip}
                className="text-xs text-slate-700 flex items-start gap-2"
              >
                <span
                  className="mt-1.5 w-1 h-1 rounded-full bg-orange-500 flex-shrink-0"
                  aria-hidden="true"
                />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  )
}
