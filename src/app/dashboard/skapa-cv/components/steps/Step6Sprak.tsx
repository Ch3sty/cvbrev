'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { CVDraft } from '../CVCreatorWizard'
import type { CVLanguage } from '@/lib/cv/cv-metadata'
import SkapaCvStepHeader from '../SkapaCvStepHeader'
import SkapaCvInput from '../inputs/SkapaCvInput'
import SkapaCvSelect from '../inputs/SkapaCvSelect'
import SkapaCvCardList from '../inputs/SkapaCvCardList'

interface Props {
  cvData: CVDraft
  updateCVData: (updates: Partial<CVDraft>) => void
}

const PROFICIENCY_OPTIONS = [
  { value: 'Modersmål', label: 'Modersmål' },
  { value: 'Tvåspråkig', label: 'Tvåspråkig' },
  { value: 'Flytande', label: 'Flytande' },
  { value: 'Konversation', label: 'Konversation' },
  { value: 'Nybörjare', label: 'Nybörjare' },
]

function makeId() {
  return `lang-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function Step6Sprak({ cvData, updateCVData }: Props) {
  const languages = cvData.languages as Array<
    CVLanguage & { _id?: string }
  >

  const [expandedId, setExpandedId] = useState<string | null>(() => {
    if (languages.length > 0) {
      const last = languages[languages.length - 1]
      return last?._id ?? `idx-${languages.length - 1}`
    }
    return null
  })

  const updateLanguage = (
    id: string,
    field: keyof CVLanguage,
    value: any
  ) => {
    const next = languages.map((lang) => {
      const langId = lang._id ?? `idx-${languages.indexOf(lang)}`
      if (langId !== id) return lang
      return { ...lang, [field]: value }
    })
    updateCVData({ languages: next })
  }

  const addLanguage = () => {
    const newId = makeId()
    const newLang: CVLanguage & { _id: string } = {
      _id: newId,
      language: '',
      proficiency: 'Flytande',
    }
    updateCVData({ languages: [...languages, newLang] })
    setExpandedId(newId)
  }

  const removeLanguage = (id: string) => {
    const next = languages.filter((lang) => {
      const langId = lang._id ?? `idx-${languages.indexOf(lang)}`
      return langId !== id
    })
    updateCVData({ languages: next })
    if (expandedId === id) setExpandedId(null)
  }

  const items = languages.map((lang, i) => {
    const id = lang._id ?? `idx-${i}`
    return {
      id,
      title: lang.language?.trim() || 'Nytt språk',
      subtitle: lang.proficiency,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <SkapaCvInput
            id={`${id}-language`}
            label="Språk"
            placeholder="t.ex. Svenska, Engelska"
            value={lang.language ?? ''}
            onChange={(e) => updateLanguage(id, 'language', e.target.value)}
          />
          <SkapaCvSelect
            id={`${id}-proficiency`}
            label="Nivå"
            options={PROFICIENCY_OPTIONS}
            value={lang.proficiency}
            onChange={(e) =>
              updateLanguage(id, 'proficiency', e.target.value as any)
            }
          />
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
        stepNumber={6}
        title="Vilka språk talar du?"
        description="Lägg till alla språk du behärskar med din nivå. Modersmål först."
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
          emptyTitle="Inga språk tillagda"
          emptyDescription="Klicka nedan för att lägga till ett språk."
          addLabel="Lägg till språk"
          onAdd={addLanguage}
          onRemove={removeLanguage}
          expandedId={expandedId}
          onToggleExpand={(id) =>
            setExpandedId(expandedId === id ? null : id)
          }
        />
      </div>
    </motion.section>
  )
}
