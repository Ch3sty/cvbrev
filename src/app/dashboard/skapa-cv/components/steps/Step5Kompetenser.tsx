'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { CVDraft } from '../CVCreatorWizard'
import type { CVSkill } from '@/lib/cv/cv-metadata'
import SkapaCvStepHeader from '../SkapaCvStepHeader'
import SkapaCvInput from '../inputs/SkapaCvInput'
import SkapaCvCardList from '../inputs/SkapaCvCardList'

interface Props {
  cvData: CVDraft
  updateCVData: (updates: Partial<CVDraft>) => void
}

function makeId() {
  return `skill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface ChipsInputProps {
  values: string[]
  onChange: (next: string[]) => void
}

function ChipsInput({ values, onChange }: ChipsInputProps) {
  const [draft, setDraft] = useState('')

  const addFromDraft = () => {
    const trimmed = draft.trim().replace(/,$/, '').trim()
    if (!trimmed) return
    if (values.includes(trimmed)) {
      setDraft('')
      return
    }
    onChange([...values, trimmed])
    setDraft('')
  }

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl min-h-[44px] focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
        {values.map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 border border-orange-200 text-orange-800"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="text-orange-600 hover:text-orange-800 transition-colors"
              aria-label={`Ta bort ${skill}`}
            >
              <X className="w-3 h-3" strokeWidth={2.6} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              addFromDraft()
            } else if (
              e.key === 'Backspace' &&
              draft === '' &&
              values.length > 0
            ) {
              removeAt(values.length - 1)
            }
          }}
          onBlur={addFromDraft}
          placeholder={values.length === 0 ? 'Skriv en kompetens och tryck Enter' : 'Lägg till...'}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        Tryck Enter eller komma för att lägga till. Backspace för att ta bort sista.
      </p>
    </div>
  )
}

export default function Step5Kompetenser({ cvData, updateCVData }: Props) {
  const skills = cvData.skills as Array<CVSkill & { _id?: string }>

  const [expandedId, setExpandedId] = useState<string | null>(() => {
    if (skills.length > 0) {
      const last = skills[skills.length - 1]
      return last?._id ?? `idx-${skills.length - 1}`
    }
    return null
  })

  const updateSkillGroup = (
    id: string,
    field: keyof CVSkill,
    value: any
  ) => {
    const next = skills.map((skill) => {
      const skillId = skill._id ?? `idx-${skills.indexOf(skill)}`
      if (skillId !== id) return skill
      return { ...skill, [field]: value }
    })
    updateCVData({ skills: next })
  }

  const addSkillGroup = () => {
    const newId = makeId()
    const newSkill: CVSkill & { _id: string } = {
      _id: newId,
      category: '',
      skills: [],
    }
    updateCVData({ skills: [...skills, newSkill] })
    setExpandedId(newId)
  }

  const removeSkillGroup = (id: string) => {
    const next = skills.filter((skill) => {
      const skillId = skill._id ?? `idx-${skills.indexOf(skill)}`
      return skillId !== id
    })
    updateCVData({ skills: next })
    if (expandedId === id) setExpandedId(null)
  }

  const items = skills.map((skill, i) => {
    const id = skill._id ?? `idx-${i}`
    const skillCount = skill.skills?.length ?? 0
    return {
      id,
      title: skill.category?.trim() || 'Ny kompetens-grupp',
      subtitle:
        skillCount > 0
          ? `${skillCount} ${skillCount === 1 ? 'kompetens' : 'kompetenser'}`
          : undefined,
      content: (
        <div className="space-y-3 mt-3">
          <SkapaCvInput
            id={`${id}-category`}
            label="Kategori"
            placeholder="t.ex. Tekniska kompetenser, Språk, Verktyg"
            value={skill.category ?? ''}
            onChange={(e) => updateSkillGroup(id, 'category', e.target.value)}
            hint="Hjälper rekryteraren snabbt skanna dina styrkor."
          />
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-1.5">
              Kompetenser
            </label>
            <ChipsInput
              values={skill.skills ?? []}
              onChange={(next) => updateSkillGroup(id, 'skills', next)}
            />
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
        stepNumber={5}
        title="Vilka är dina kompetenser?"
        description="Gruppera dem gärna i kategorier (t.ex. Tekniska kompetenser, Verktyg, Mjuka kompetenser)."
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
          emptyTitle="Inga kompetenser tillagda"
          emptyDescription="Klicka nedan för att skapa en kategori."
          addLabel="Lägg till kategori"
          onAdd={addSkillGroup}
          onRemove={removeSkillGroup}
          expandedId={expandedId}
          onToggleExpand={(id) =>
            setExpandedId(expandedId === id ? null : id)
          }
        />
      </div>
    </motion.section>
  )
}
