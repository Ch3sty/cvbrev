'use client'

import type { CVDraft } from '../CVCreatorWizard'
import SkapaCvStepHeader from '../SkapaCvStepHeader'
import SkapaCvInput from '../inputs/SkapaCvInput'

interface Props {
  cvData: CVDraft
  updateCVData: (updates: Partial<CVDraft>) => void
}

export default function Step1Kontakt({ cvData, updateCVData }: Props) {
  const updatePersonalInfo = (
    field: keyof CVDraft['personalInfo'],
    value: string
  ) => {
    updateCVData({
      personalInfo: { ...cvData.personalInfo, [field]: value },
    })
  }

  return (
    <section className="space-y-4">
      <SkapaCvStepHeader
        stepNumber={1}
        title="Vilka är dina kontaktuppgifter?"
        description="Det här syns högst upp på ditt CV. Ge rekryteraren ett enkelt sätt att höra av sig."
      />

      <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5 space-y-4">
        <SkapaCvInput
          id="fullName"
          label="Fullständigt namn"
          placeholder="t.ex. Anna Svensson"
          value={cvData.personalInfo.fullName ?? ''}
          onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
          autoComplete="name"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkapaCvInput
            id="email"
            type="email"
            label="E-postadress"
            placeholder="din.email@example.com"
            value={cvData.personalInfo.email ?? ''}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            autoComplete="email"

            inputMode="email"
            required
          />
          <SkapaCvInput
            id="phone"
            type="tel"
            label="Telefonnummer"
            placeholder="+46 70 123 45 67"
            value={cvData.personalInfo.phone ?? ''}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            autoComplete="tel"

            inputMode="tel"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkapaCvInput
            id="address"
            label="Ort"
            placeholder="Stockholm"
            value={cvData.personalInfo.address ?? ''}
            onChange={(e) => updatePersonalInfo('address', e.target.value)}
            autoComplete="address-level2"
            optional
            hint="Rekryterare gillar att se var du är baserad."
          />
          <SkapaCvInput
            id="linkedIn"
            label="LinkedIn"
            placeholder="linkedin.com/in/dittnamn"

            inputMode="url"

            autoComplete="url"
            value={cvData.personalInfo.linkedIn ?? ''}
            onChange={(e) => updatePersonalInfo('linkedIn', e.target.value)}
            optional
          />
        </div>

        <SkapaCvInput
          id="title"
          label="Titel / yrkesroll"
          placeholder="t.ex. Senior Projektledare"
          value={cvData.personalInfo.title ?? ''}
          onChange={(e) => updatePersonalInfo('title', e.target.value)}

          enterKeyHint="done"

          autoComplete="organization-title"
          optional
          hint="Visas direkt under ditt namn på CV:t."
        />
      </div>
    </section>
  )
}
