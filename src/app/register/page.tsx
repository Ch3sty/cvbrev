// src/app/register/page.tsx
'use client'

import { Suspense, useCallback, useState } from 'react'
import RegisterForm from '@/components/auth/register-form'
import AuthShell from '@/components/auth/AuthShell'
import RegisterCvPreview from '@/components/auth/RegisterCvPreview'
import { ToolSkapaCvIllustration } from '@/components/funktioner/illustrations/ToolIllustrations'

const REGISTER_QUOTES = [
  'Bygg ett CV som öppnar dörrar.',
  'Personliga brev som faktiskt läses.',
  'Din nästa jobbansökan börjar här.',
]

const REGISTER_STATS = [
  { value: '12 487', label: 'CV:n skapade' },
  { value: '94%', label: 'når intervju' },
  { value: '8', label: 'AI-verktyg' },
  { value: '2 min', label: 'till färdigt CV' },
]

interface FormState {
  fullName: string
  email: string
  phone: string
  location: string
  score: number
}

export default function RegisterPage() {
  const [formState, setFormState] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    score: 0,
  })

  const handleStateChange = useCallback((state: FormState) => {
    setFormState(state)
  }, [])

  const hasContent =
    formState.fullName.trim().length > 0 ||
    formState.email.trim().length > 0 ||
    formState.phone.trim().length > 0 ||
    formState.location.trim().length > 0

  return (
    <AuthShell
      illustration={
        // På desktop: göm illustrationen när användaren börjat skriva (preview tar över)
        hasContent ? null : <ToolSkapaCvIllustration className="w-full h-full" />
      }
      quotes={REGISTER_QUOTES}
      stats={REGISTER_STATS}
      desktopSideSlot={
        hasContent ? (
          <RegisterCvPreview
            fullName={formState.fullName}
            email={formState.email}
            phone={formState.phone}
            location={formState.location}
            variant="desktop"
          />
        ) : null
      }
    >
      <Suspense
        fallback={
          <div className="text-center text-slate-500 py-12">Laddar...</div>
        }
      >
        <RegisterForm onStateChange={handleStateChange} />
      </Suspense>
    </AuthShell>
  )
}
