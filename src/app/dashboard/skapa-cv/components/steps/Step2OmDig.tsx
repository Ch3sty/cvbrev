'use client'

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
  'Vart du vill, vad du söker härnäst',
]

export default function Step2OmDig({ cvData, updateCVData }: Props) {
  const value = cvData.summary ?? ''
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <section className="space-y-4">
      <SkapaCvStepHeader
        stepNumber={2}
        title="Berätta kort om dig själv"
        description="3-5 meningar som introducerar dig, det här är ofta det första rekryteraren läser."
        isOptional
      />

      <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5 space-y-4">
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

        <div className="text-meta text-ink-3">
          Cirka {wordCount} ord. Optimal längd: 60-120 ord.
        </div>

        {/* Tips: insunket i papperet, ingen platta, ingen ikon. */}
        <div className="rounded-lg bg-insunken p-4 shadow-insunken">
          <p className="text-sm font-medium text-ink-3">Ta med</p>
          <ul className="mt-1.5 space-y-1">
            {TIPS.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 text-sm leading-[22px] text-ink-2"
              >
                <span
                  className="mt-2.5 h-1 w-1 flex-shrink-0 rounded-full bg-ink-3"
                  aria-hidden="true"
                />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
