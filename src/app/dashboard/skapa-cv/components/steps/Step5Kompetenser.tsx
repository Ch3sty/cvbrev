'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { CVDraft } from '../CVCreatorWizard'
import type { CVSkill } from '@/lib/cv/cv-metadata'
import SkapaCvStepHeader from '../SkapaCvStepHeader'
import SkapaCvInput, { LABEL } from "../inputs/SkapaCvInput"
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
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-kant bg-insunken px-3 py-1.5 shadow-insunken transition-colors focus-within:border-kant-stark focus-within:bg-panel focus-within:ring-2 focus-within:ring-accent">
        {values.map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className="inline-flex items-center gap-1 rounded-lg border border-kant bg-panel py-1 pl-2.5 pr-1.5 text-meta font-medium text-ink-1"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="inline-flex h-5 w-5 items-center justify-center rounded text-ink-3 transition-colors hover:text-ink-1"
              aria-label={`Ta bort ${skill}`}
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
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
          enterKeyHint="done"
          inputMode="text"
          autoComplete="off"
          placeholder={values.length === 0 ? 'Skriv en kompetens och tryck Enter' : 'Lägg till...'}
          className="min-w-[120px] flex-1 bg-transparent py-1 text-base text-ink-1 placeholder:text-ink-3 focus:outline-none"
        />
      </div>
      <p className="mt-1.5 text-meta text-ink-3">
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
            <p className={LABEL}>
              Kompetenser
            </p>
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
    <section className="space-y-4">
      <SkapaCvStepHeader
        stepNumber={5}
        title="Vilka är dina kompetenser?"
        description="Gruppera dem gärna i kategorier (t.ex. Tekniska kompetenser, Verktyg, Mjuka kompetenser)."
        isOptional
      />

      <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
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
    </section>
  )
}
