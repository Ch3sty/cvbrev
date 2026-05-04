'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { CVDraft } from '../CVCreatorWizard'
import type { CVExperience } from '@/lib/cv/cv-metadata'
import SkapaCvStepHeader from '../SkapaCvStepHeader'
import SkapaCvInput from '../inputs/SkapaCvInput'
import SkapaCvCardList from '../inputs/SkapaCvCardList'

interface Props {
  cvData: CVDraft
  updateCVData: (updates: Partial<CVDraft>) => void
}

function makeId() {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function Step3Erfarenhet({ cvData, updateCVData }: Props) {
  // Vi använder index som id internt eftersom CVExperience inte har id-fält
  const experiences = cvData.experience as Array<Partial<CVExperience> & { _id?: string }>

  // Expanderat kort: id eller null. Default: senaste tillagda är expanderat
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    if (experiences.length > 0) {
      const last = experiences[experiences.length - 1]
      return last?._id ?? `idx-${experiences.length - 1}`
    }
    return null
  })

  const updateExperience = (
    id: string,
    field: keyof CVExperience,
    value: any
  ) => {
    const next = experiences.map((exp) => {
      const expId = exp._id ?? `idx-${experiences.indexOf(exp)}`
      if (expId !== id) return exp
      return { ...exp, [field]: value }
    })
    updateCVData({ experience: next })
  }

  const addExperience = () => {
    const newId = makeId()
    const newExp: Partial<CVExperience> & { _id: string } = {
      _id: newId,
      position: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: [],
    }
    updateCVData({ experience: [...experiences, newExp] })
    setExpandedId(newId)
  }

  const removeExperience = (id: string) => {
    const next = experiences.filter((exp) => {
      const expId = exp._id ?? `idx-${experiences.indexOf(exp)}`
      return expId !== id
    })
    updateCVData({ experience: next })
    if (expandedId === id) setExpandedId(null)
  }

  const items = experiences.map((exp, i) => {
    const id = exp._id ?? `idx-${i}`
    const period = [exp.startDate, exp.endDate || 'Nu']
      .filter(Boolean)
      .join(' – ')
    return {
      id,
      title: exp.position?.trim() || 'Ny roll',
      subtitle: [exp.company, period].filter(Boolean).join(' · ') || undefined,
      content: (
        <div className="space-y-3 mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SkapaCvInput
              id={`${id}-position`}
              label="Roll/titel"
              placeholder="t.ex. Senior Projektledare"
              value={exp.position ?? ''}
              onChange={(e) => updateExperience(id, 'position', e.target.value)}
            />
            <SkapaCvInput
              id={`${id}-company`}
              label="Företag"
              placeholder="t.ex. TechCorp AB"
              value={exp.company ?? ''}
              onChange={(e) => updateExperience(id, 'company', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SkapaCvInput
              id={`${id}-startDate`}
              label="Från"
              placeholder="Jan 2021"
              value={exp.startDate ?? ''}
              onChange={(e) => updateExperience(id, 'startDate', e.target.value)}
            />
            <SkapaCvInput
              id={`${id}-endDate`}
              label="Till"
              placeholder="Nuvarande"
              value={exp.endDate ?? ''}
              onChange={(e) => updateExperience(id, 'endDate', e.target.value)}
              optional
              hint="Lämna tomt om pågående"
            />
            <SkapaCvInput
              id={`${id}-location`}
              label="Plats"
              placeholder="Stockholm"
              value={exp.location ?? ''}
              onChange={(e) => updateExperience(id, 'location', e.target.value)}
              optional
            />
          </div>

          {/* Beskrivning som bullet-points */}
          <div>
            <label
              className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-1.5"
            >
              Beskriv vad du gjorde (en punkt per rad)
            </label>
            <textarea
              value={(exp.description ?? []).join('\n')}
              onChange={(e) =>
                updateExperience(
                  id,
                  'description',
                  e.target.value.split('\n').filter(Boolean)
                )
              }
              rows={5}
              placeholder={`Ledde ett team på 12 personer i utvecklingen av ny e-handelsplattform\nÖkade leveranshastigheten med 40% genom Scrum-implementering\nAnsvarade för budget på 15 MSEK`}
              className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 leading-relaxed transition-all hover:border-orange-200 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 resize-y"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              En punkt per rad. Börja gärna med ett aktivt verb och inkludera
              siffror där det går.
            </p>
          </div>
        </div>
      ),
    }
  })

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-5"
    >
      <SkapaCvStepHeader
        stepNumber={3}
        title="Vilken erfarenhet har du?"
        description="Lägg till de roller som är mest relevanta för det du söker. Kvalitet före kvantitet."
        isOptional
      />

      <div
        className="rounded-3xl bg-white border border-orange-100 p-5 sm:p-7"
        style={{
          boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)',
        }}
      >
        <SkapaCvCardList
          items={items}
          emptyTitle="Ingen erfarenhet tillagd"
          emptyDescription="Klicka nedan för att lägga till din första roll."
          addLabel="Lägg till roll"
          onAdd={addExperience}
          onRemove={removeExperience}
          expandedId={expandedId}
          onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
        />
      </div>
    </motion.section>
  )
}
