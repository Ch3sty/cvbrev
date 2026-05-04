'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { CVDraft } from '../CVCreatorWizard'
import type { CVEducation } from '@/lib/cv/cv-metadata'
import SkapaCvStepHeader from '../SkapaCvStepHeader'
import SkapaCvInput from '../inputs/SkapaCvInput'
import SkapaCvTextarea from '../inputs/SkapaCvTextarea'
import SkapaCvCardList from '../inputs/SkapaCvCardList'

interface Props {
  cvData: CVDraft
  updateCVData: (updates: Partial<CVDraft>) => void
}

function makeId() {
  return `edu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function Step4Utbildning({ cvData, updateCVData }: Props) {
  const educations = cvData.education as Array<
    Partial<CVEducation> & { _id?: string }
  >

  const [expandedId, setExpandedId] = useState<string | null>(() => {
    if (educations.length > 0) {
      const last = educations[educations.length - 1]
      return last?._id ?? `idx-${educations.length - 1}`
    }
    return null
  })

  const updateEducation = (
    id: string,
    field: keyof CVEducation,
    value: any
  ) => {
    const next = educations.map((edu) => {
      const eduId = edu._id ?? `idx-${educations.indexOf(edu)}`
      if (eduId !== id) return edu
      return { ...edu, [field]: value }
    })
    updateCVData({ education: next })
  }

  const addEducation = () => {
    const newId = makeId()
    const newEdu: Partial<CVEducation> & { _id: string } = {
      _id: newId,
      degree: '',
      institution: '',
      location: '',
      graduationYear: '',
      description: '',
    }
    updateCVData({ education: [...educations, newEdu] })
    setExpandedId(newId)
  }

  const removeEducation = (id: string) => {
    const next = educations.filter((edu) => {
      const eduId = edu._id ?? `idx-${educations.indexOf(edu)}`
      return eduId !== id
    })
    updateCVData({ education: next })
    if (expandedId === id) setExpandedId(null)
  }

  const items = educations.map((edu, i) => {
    const id = edu._id ?? `idx-${i}`
    return {
      id,
      title: edu.degree?.trim() || 'Ny utbildning',
      subtitle:
        [edu.institution, edu.graduationYear ?? edu.endDate]
          .filter(Boolean)
          .join(' · ') || undefined,
      content: (
        <div className="space-y-3 mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SkapaCvInput
              id={`${id}-degree`}
              label="Examen / utbildning"
              placeholder="t.ex. Civilingenjör i Datateknik"
              value={edu.degree ?? ''}
              onChange={(e) => updateEducation(id, 'degree', e.target.value)}
            />
            <SkapaCvInput
              id={`${id}-institution`}
              label="Skola / lärosäte"
              placeholder="t.ex. KTH"
              value={edu.institution ?? ''}
              onChange={(e) =>
                updateEducation(id, 'institution', e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SkapaCvInput
              id={`${id}-graduationYear`}
              label="Examensår"
              placeholder="2019"
              value={edu.graduationYear ?? ''}
              onChange={(e) =>
                updateEducation(id, 'graduationYear', e.target.value)
              }
              optional
            />
            <SkapaCvInput
              id={`${id}-location`}
              label="Plats"
              placeholder="Stockholm"
              value={edu.location ?? ''}
              onChange={(e) => updateEducation(id, 'location', e.target.value)}
              optional
            />
          </div>

          <SkapaCvTextarea
            id={`${id}-description`}
            label="Beskrivning"
            placeholder="t.ex. Inriktning på maskininlärning. Examensarbete inom NLP-modeller."
            value={edu.description ?? ''}
            onChange={(e) =>
              updateEducation(id, 'description', e.target.value)
            }
            rows={3}
            optional
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
        stepNumber={4}
        title="Vilken utbildning har du?"
        description="Lägg till relevant utbildning. Du kan lägga till flera om du vill."
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
          emptyTitle="Ingen utbildning tillagd"
          emptyDescription="Klicka nedan för att lägga till din utbildning."
          addLabel="Lägg till utbildning"
          onAdd={addEducation}
          onRemove={removeEducation}
          expandedId={expandedId}
          onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
        />
      </div>
    </motion.section>
  )
}
